import { execSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import path from 'node:path'

const MIN_LINES_COVERAGE = 80
const MIN_BRANCHES_COVERAGE = 80
const COVERAGE_SUMMARY_PATH = path.resolve('coverage/coverage-summary.json')

const normalizePath = (filePath) => filePath.replaceAll('\\', '/')

const isTouchedImplementationFile = (filePath) => {
  const normalized = normalizePath(filePath)

  if (!normalized.startsWith('src/')) {
    return false
  }

  if (!normalized.endsWith('.ts')) {
    return false
  }

  if (
    normalized.endsWith('.test.ts') ||
    normalized.endsWith('.d.ts') ||
    normalized.endsWith('/index.ts')
  ) {
    return false
  }

  return true
}

const runGit = (command) => {
  return execSync(command, { encoding: 'utf8' })
}

const hasGitHeadCommit = () => {
  try {
    runGit('git rev-parse --verify HEAD')
    return true
  } catch {
    return false
  }
}

const getTouchedFilesFromEnv = () => {
  const configured = process.env.COVERAGE_TOUCHED_FILES

  if (!configured) {
    return []
  }

  return configured
    .split(',')
    .map((value) => value.trim())
    .filter((value) => value.length > 0)
}

const getTouchedFiles = () => {
  const envFiles = getTouchedFilesFromEnv()

  if (envFiles.length > 0) {
    return envFiles
  }

  if (!hasGitHeadCommit()) {
    return []
  }

  const trackedDiff = runGit('git diff --name-only --diff-filter=ACMR HEAD')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)

  const untracked = runGit('git ls-files --others --exclude-standard')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)

  return [...new Set([...trackedDiff, ...untracked])]
}

const getCoverageByPath = (summary) => {
  const coverageByPath = new Map()

  for (const [filePath, metrics] of Object.entries(summary)) {
    if (filePath === 'total') {
      continue
    }

    const normalizedPath = normalizePath(path.relative(process.cwd(), filePath))
    coverageByPath.set(normalizedPath, metrics)
  }

  return coverageByPath
}

const main = () => {
  let summary

  try {
    summary = JSON.parse(readFileSync(COVERAGE_SUMMARY_PATH, 'utf8'))
  } catch (error) {
    throw new Error(
      `Unable to read coverage summary at ${COVERAGE_SUMMARY_PATH}. Run \`npm run test:coverage\` first.`,
      { cause: error },
    )
  }

  const touchedFiles = getTouchedFiles().filter(isTouchedImplementationFile)

  if (touchedFiles.length === 0) {
    console.log(
      'Touched-code coverage check skipped: no touched implementation files under src/ (or no base commit found).',
    )
    console.log('Set COVERAGE_TOUCHED_FILES=src/path/to/file.ts to force explicit validation when needed.')
    return
  }

  const coverageByPath = getCoverageByPath(summary)
  const failures = []

  for (const touchedFile of touchedFiles) {
    const metrics = coverageByPath.get(normalizePath(touchedFile))

    if (!metrics) {
      failures.push(`${touchedFile} is missing from coverage summary output.`)
      continue
    }

    const linesPct = metrics.lines?.pct ?? 0
    const branchesPct = metrics.branches?.pct ?? 0

    if (linesPct < MIN_LINES_COVERAGE || branchesPct < MIN_BRANCHES_COVERAGE) {
      failures.push(
        `${touchedFile} below threshold (lines=${linesPct}%, branches=${branchesPct}%, required>=${MIN_LINES_COVERAGE}%).`,
      )
    }
  }

  if (failures.length > 0) {
    throw new Error(`Touched-code coverage check failed:\n- ${failures.join('\n- ')}`)
  }

  console.log('Touched-code coverage check passed for files:')
  touchedFiles.forEach((file) => {
    const metrics = coverageByPath.get(normalizePath(file))
    console.log(`- ${file}: lines=${metrics.lines.pct}%, branches=${metrics.branches.pct}%`)
  })
}

main()
