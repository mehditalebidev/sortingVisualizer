import type { SortStep, SortingAlgorithmId } from '@/algorithms'
import { executeAlgorithmWithInput, type AlgorithmExecution } from '@/app/algorithmPipeline'

export type CompareRunStatus = 'idle' | 'running' | 'paused' | 'finished'

export type CompareSessionSyncGuarantees = {
  sharedInputMode: 'single-source-cloned-per-panel'
  synchronizedStartMode: 'single-start-action-for-all-selected-panels'
  completionMode: 'session-finished-when-all-panels-finished'
  singleRunCompatibility: 'panel-can-be-converted-to-algorithm-execution'
}

export const compareSessionSyncGuarantees: CompareSessionSyncGuarantees = {
  sharedInputMode: 'single-source-cloned-per-panel',
  synchronizedStartMode: 'single-start-action-for-all-selected-panels',
  completionMode: 'session-finished-when-all-panels-finished',
  singleRunCompatibility: 'panel-can-be-converted-to-algorithm-execution',
}

export type ComparePanelRun = {
  algorithmId: SortingAlgorithmId
  input: number[]
  steps: SortStep[]
  stepIndex: number
  status: CompareRunStatus
}

export type CompareRunSession = {
  sessionId: string
  sharedInput: number[]
  selectedAlgorithms: SortingAlgorithmId[]
  panels: Record<SortingAlgorithmId, ComparePanelRun>
  status: CompareRunStatus
  syncGuarantees: CompareSessionSyncGuarantees
}

type CompareSessionExecutor = (
  algorithmId: SortingAlgorithmId,
  input: readonly number[],
) => {
  algorithmId: SortingAlgorithmId
  input: number[]
  steps: SortStep[]
}

export type CreateCompareRunSessionOptions = {
  sessionId?: string
  executor?: CompareSessionExecutor
}

let compareSessionCounter = 0

const nextCompareSessionId = (): string => {
  compareSessionCounter += 1
  return `compare-run-${compareSessionCounter}`
}

const toPanelRun = (
  execution: ReturnType<CompareSessionExecutor>,
  initialStatus: CompareRunStatus,
): ComparePanelRun => {
  return {
    algorithmId: execution.algorithmId,
    input: [...execution.input],
    steps: execution.steps,
    stepIndex: 0,
    status: initialStatus,
  }
}

export const createCompareRunSession = (
  selectedAlgorithms: readonly SortingAlgorithmId[],
  sharedInput: readonly number[],
  options: CreateCompareRunSessionOptions = {},
): CompareRunSession => {
  const executor = options.executor ?? executeAlgorithmWithInput
  const uniqueAlgorithms = Array.from(new Set(selectedAlgorithms))

  if (uniqueAlgorithms.length === 0) {
    throw new Error('Compare run requires at least one selected algorithm')
  }

  const panels = {} as Record<SortingAlgorithmId, ComparePanelRun>

  uniqueAlgorithms.forEach((algorithmId) => {
    const execution = executor(algorithmId, [...sharedInput])
    panels[algorithmId] = toPanelRun(execution, 'idle')
  })

  return {
    sessionId: options.sessionId ?? nextCompareSessionId(),
    sharedInput: [...sharedInput],
    selectedAlgorithms: uniqueAlgorithms,
    panels,
    status: 'idle',
    syncGuarantees: compareSessionSyncGuarantees,
  }
}

export const createSingleAlgorithmSession = (
  algorithmId: SortingAlgorithmId,
  input: readonly number[],
  options: Omit<CreateCompareRunSessionOptions, 'sessionId'> = {},
): CompareRunSession => {
  return createCompareRunSession([algorithmId], input, options)
}

export const toSingleRunExecution = (panel: ComparePanelRun): AlgorithmExecution => {
  return {
    algorithmId: panel.algorithmId,
    input: [...panel.input],
    steps: panel.steps,
  }
}
