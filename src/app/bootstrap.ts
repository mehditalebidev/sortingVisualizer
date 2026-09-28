import { appName } from '@/app'
import {
  executeAlgorithmWithInput,
  generateRandomArray,
  type RandomArrayOptions,
} from '@/app/algorithmPipeline'
import {
  buildCumulativeStepStats,
  getAlgorithmMetadata,
  listAlgorithms,
  type SortingAlgorithmId,
} from '@/algorithms'
import type { SortStep } from '@/algorithms'
import {
  defaultSpeedRange,
  getControlAvailability,
  initialState,
  isPlaybackActionAllowed,
  resolvePlaybackCadence,
  transitionPlaybackStatus,
  type PlaybackStatus,
} from '@/state'
import { createSoundEngine, type SoundEngine } from '@/app/sound'
import {
  type Celebration,
  configureCanvasSurface,
  createCelebration,
  createPlaybackController,
  defaultDimensions,
  defaultVisualSemantics,
  getResponsiveDimensions,
  mapStepToBarStates,
  type RenderTransition,
  renderBarsFrame,
} from '@/visualizer'

export type BootstrapOptions = {
  autoplay?: boolean
  defaultAlgorithmId?: SortingAlgorithmId
  defaultArraySize?: number
  defaultSpeed?: number
  previewOptions?: RandomArrayOptions
  celebrate?: boolean
  soundEngine?: SoundEngine
}

const MIN_ARRAY_SIZE = 5
const MAX_ARRAY_SIZE = 1000
const DEFAULT_ARRAY_SIZE = 100
const DEFAULT_SPEED = 55

const DEFAULT_BOOTSTRAP_OPTIONS = {
  autoplay: false,
  defaultAlgorithmId: 'bubble-sort' as SortingAlgorithmId,
  defaultArraySize: DEFAULT_ARRAY_SIZE,
  defaultSpeed: DEFAULT_SPEED,
}

type ActiveTransition = {
  transition: RenderTransition
  startedAtMs: number
  durationMs: number
}

const toValueToken = (value: number, occurrence: number): string => {
  return `${value}:${occurrence}`
}

export const buildInitialIndexLookup = (snapshot: readonly number[]): Map<string, number> => {
  const counts = new Map<number, number>()
  const lookup = new Map<string, number>()

  for (let index = 0; index < snapshot.length; index += 1) {
    const value = snapshot[index]

    if (value === undefined) {
      continue
    }

    const occurrence = counts.get(value) ?? 0
    counts.set(value, occurrence + 1)
    lookup.set(toValueToken(value, occurrence), index)
  }

  return lookup
}

export const mapSnapshotToInitialIndices = (
  snapshot: readonly number[],
  initialIndexLookup: ReadonlyMap<string, number>,
): number[] => {
  const counts = new Map<number, number>()

  return snapshot.map((value, currentIndex) => {
    const occurrence = counts.get(value) ?? 0
    counts.set(value, occurrence + 1)

    return initialIndexLookup.get(toValueToken(value, occurrence)) ?? currentIndex
  })
}

export type KeyboardAction = 'start' | 'pause' | 'resume' | 'reset' | 'randomize'

export const resolveKeyboardAction = (key: string, status: PlaybackStatus): KeyboardAction | undefined => {
  if (key === ' ' || key === 'Spacebar') {
    if (status === 'running') {
      return 'pause'
    }

    return status === 'paused' ? 'resume' : 'start'
  }

  if (key === 'r' || key === 'R') {
    return 'randomize'
  }

  if (key === 'Escape') {
    return 'reset'
  }

  return undefined
}

export const bootstrapApp = (root: HTMLDivElement, options: BootstrapOptions = {}): void => {
  const resolvedOptions = {
    ...DEFAULT_BOOTSTRAP_OPTIONS,
    ...options,
  }
  const algorithms = listAlgorithms()
  const algorithmMap = new Map(algorithms.map((algorithm) => [algorithm.id, algorithm]))

  const minValue = resolvedOptions.previewOptions?.minValue
  const maxValue = resolvedOptions.previewOptions?.maxValue
  const random = resolvedOptions.previewOptions?.random

  const getRandomArrayOptions = (size: number): RandomArrayOptions => {
    return {
      size,
      ...(minValue !== undefined ? { minValue } : {}),
      ...(maxValue !== undefined ? { maxValue } : {}),
      ...(random !== undefined ? { random } : {}),
    }
  }

  const toValidArraySize = (size: number): number => {
    return Math.max(MIN_ARRAY_SIZE, Math.min(MAX_ARRAY_SIZE, Math.round(size)))
  }

  const toValidSpeed = (speed: number): number => {
    return Math.max(defaultSpeedRange.min, Math.min(defaultSpeedRange.max, Math.round(speed)))
  }

  let selectedAlgorithmId = resolvedOptions.defaultAlgorithmId
  let arraySize = toValidArraySize(resolvedOptions.defaultArraySize)
  let speed = toValidSpeed(resolvedOptions.defaultSpeed)
  let appStatus: PlaybackStatus = initialState.status

  let currentInput = generateRandomArray(getRandomArrayOptions(arraySize))
  let execution = executeAlgorithmWithInput(selectedAlgorithmId, currentInput)
  let playback = createPlaybackController(execution.steps)
  let stepStats = buildCumulativeStepStats(execution.steps)
  let initialIndexLookup = buildInitialIndexLookup(execution.steps[0]?.snapshot ?? currentInput)
  let tickIntervalId: number | undefined
  let animationFrameId: number | undefined
  let activeTransition: ActiveTransition | undefined
  let celebration: Celebration | undefined
  const soundEngine = resolvedOptions.soundEngine ?? createSoundEngine()
  const prefersReducedMotion = (): boolean => {
    return typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }
  const shouldCelebrate = resolvedOptions.celebrate ?? !prefersReducedMotion()
  let valueRange = { min: Math.min(...currentInput), max: Math.max(...currentInput) }

  root.innerHTML = `
    <main class="shell" data-status="${initialState.status}">
      <header class="shell-header">
        <nav class="page-nav" aria-label="Primary navigation">
          <a href="/" aria-current="page">Single View</a>
          <a href="/compare">Compare</a>
        </nav>
        <h1>${appName}</h1>
        <p>Explore sorting behavior with interactive controls and canvas playback.</p>
      </header>
      <section class="controls-panel" aria-label="Sorting controls">
        <div class="controls-grid">
          <label class="control-field" for="algorithm-select">
            <span>Algorithm</span>
            <select id="algorithm-select">
              ${algorithms
                .map((algorithm) => {
                  const selected = algorithm.id === selectedAlgorithmId ? ' selected' : ''
                  return `<option value="${algorithm.id}"${selected}>${algorithm.name}</option>`
                })
                .join('')}
            </select>
          </label>
          <label class="control-field" for="array-size-slider">
            <span>Array size <output id="array-size-value">${arraySize}</output></span>
            <input id="array-size-slider" type="range" min="${MIN_ARRAY_SIZE}" max="${MAX_ARRAY_SIZE}" value="${arraySize}" step="1" />
          </label>
          <label class="control-field" for="speed-slider">
            <span>Speed <output id="speed-value">${speed}</output></span>
            <input id="speed-slider" type="range" min="${defaultSpeedRange.min}" max="${defaultSpeedRange.max}" value="${speed}" step="1" />
          </label>
        </div>
        <div class="button-row">
          <button id="randomize-button" type="button"><span class="btn-icon" aria-hidden="true">🎲</span>Shuffle</button>
          <button id="start-button" type="button"><span class="btn-icon" aria-hidden="true">▶</span>Start</button>
          <button id="pause-button" type="button"><span class="btn-icon" aria-hidden="true">⏸</span>Pause</button>
          <button id="resume-button" type="button"><span class="btn-icon" aria-hidden="true">⏵</span>Resume</button>
          <button id="reset-button" type="button"><span class="btn-icon" aria-hidden="true">↺</span>Reset</button>
          <button id="sound-toggle" class="icon-toggle" type="button" aria-pressed="false"><span class="btn-icon" aria-hidden="true">🔇</span><span class="sound-label">Sound off</span></button>
        </div>
      </section>
      <div class="workspace-grid">
        <section class="canvas-panel" aria-label="Sorting visualization area">
          <div class="stats-hud" aria-label="Live sorting stats">
            <div class="stat-chip"><span>Comparisons</span><output id="stat-comparisons">0</output></div>
            <div class="stat-chip"><span>Moves</span><output id="stat-moves">0</output></div>
            <div class="stat-chip"><span>Progress</span><output id="stat-progress">0%</output></div>
          </div>
          <div class="canvas-shell">
            <canvas id="sorting-canvas" width="${defaultDimensions.width}" height="${defaultDimensions.height}"></canvas>
          </div>
          <div class="progress-track" role="progressbar" aria-label="Sorting progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">
            <div class="progress-fill" id="progress-fill"></div>
          </div>
          <p class="canvas-hint">Shortcuts: <kbd>Space</kbd> play / pause · <kbd>R</kbd> shuffle · <kbd>Esc</kbd> reset. Bar color follows value, so watch the rainbow settle into order.</p>
          <ul class="visual-legend" aria-label="Bar state legend">
            <li><span class="legend-swatch legend-neutral" aria-hidden="true"></span>Neutral</li>
            <li><span class="legend-swatch legend-compared" aria-hidden="true"></span>Compared</li>
            <li><span class="legend-swatch legend-modified" aria-hidden="true"></span>Modified</li>
            <li><span class="legend-swatch legend-completed" aria-hidden="true"></span>Completed</li>
          </ul>
        </section>
        <section class="algorithm-info" aria-label="Algorithm information">
          <p id="algorithm-debug-summary"></p>
          <p id="algorithm-debug-meta"></p>
          <p id="selected-algorithm-description"></p>
          <div class="algorithm-descriptions" aria-label="Algorithm descriptions">
            ${algorithms
              .map((algorithm) => {
                return `
                  <article class="algorithm-description" data-algorithm-id="${algorithm.id}">
                    <h2>${algorithm.name}</h2>
                    <p>${getAlgorithmMetadata(algorithm.id).description}</p>
                  </article>
                `
              })
              .join('')}
          </div>
        </section>
      </div>
    </main>
  `

  const canvas = root.querySelector<HTMLCanvasElement>('#sorting-canvas')
  const summary = root.querySelector<HTMLParagraphElement>('#algorithm-debug-summary')
  const meta = root.querySelector<HTMLParagraphElement>('#algorithm-debug-meta')
  const selectedAlgorithmDescription = root.querySelector<HTMLParagraphElement>('#selected-algorithm-description')
  const descriptionCards = root.querySelectorAll<HTMLElement>('.algorithm-description[data-algorithm-id]')
  const algorithmSelect = root.querySelector<HTMLSelectElement>('#algorithm-select')
  const arraySizeSlider = root.querySelector<HTMLInputElement>('#array-size-slider')
  const arraySizeValue = root.querySelector<HTMLOutputElement>('#array-size-value')
  const speedSlider = root.querySelector<HTMLInputElement>('#speed-slider')
  const speedValue = root.querySelector<HTMLOutputElement>('#speed-value')
  const randomizeButton = root.querySelector<HTMLButtonElement>('#randomize-button')
  const startButton = root.querySelector<HTMLButtonElement>('#start-button')
  const pauseButton = root.querySelector<HTMLButtonElement>('#pause-button')
  const resumeButton = root.querySelector<HTMLButtonElement>('#resume-button')
  const resetButton = root.querySelector<HTMLButtonElement>('#reset-button')
  const statComparisons = root.querySelector<HTMLOutputElement>('#stat-comparisons')
  const statMoves = root.querySelector<HTMLOutputElement>('#stat-moves')
  const statProgress = root.querySelector<HTMLOutputElement>('#stat-progress')
  const progressTrack = root.querySelector<HTMLDivElement>('.progress-track')
  const progressFill = root.querySelector<HTMLDivElement>('#progress-fill')
  const soundToggle = root.querySelector<HTMLButtonElement>('#sound-toggle')

  if (
    !canvas ||
    !summary ||
    !meta ||
    !selectedAlgorithmDescription ||
    !algorithmSelect ||
    !arraySizeSlider ||
    !arraySizeValue ||
    !speedSlider ||
    !speedValue ||
    !randomizeButton ||
    !startButton ||
    !pauseButton ||
    !resumeButton ||
    !resetButton ||
    !statComparisons ||
    !statMoves ||
    !statProgress ||
    !progressTrack ||
    !progressFill ||
    !soundToggle
  ) {
    return
  }

  let surface = configureCanvasSurface(canvas, defaultDimensions)

  const updateAlgorithmDescription = (): void => {
    const metadata = getAlgorithmMetadata(selectedAlgorithmId)
    selectedAlgorithmDescription.textContent = `${metadata.displayName}: ${metadata.description}`

    descriptionCards.forEach((card) => {
      const isActive = card.dataset.algorithmId === selectedAlgorithmId
      card.dataset.active = isActive ? 'true' : 'false'
    })
  }

  const updateControlState = (): void => {
    const availability = getControlAvailability(appStatus)

    algorithmSelect.disabled = !availability.algorithmSelect
    arraySizeSlider.disabled = !availability.arraySize
    speedSlider.disabled = !availability.speed
    randomizeButton.disabled = !availability.randomize
    startButton.disabled = !availability.start
    pauseButton.disabled = !availability.pause
    resumeButton.disabled = !availability.resume
    resetButton.disabled = !availability.reset
    root.dataset.status = appStatus
  }

  const stopTimer = (): void => {
    if (tickIntervalId === undefined) {
      return
    }

    window.clearInterval(tickIntervalId)
    tickIntervalId = undefined
  }

  const stopAnimationFrame = (): void => {
    if (animationFrameId === undefined) {
      return
    }

    window.cancelAnimationFrame(animationFrameId)
    animationFrameId = undefined
  }

  const getTransitionDurationMs = (playbackIntervalMs: number): number => {
    const scaledDuration = Math.round(playbackIntervalMs * 0.85)
    return Math.max(12, Math.min(260, scaledDuration))
  }

  const createStepTransition = (
    fromStep: SortStep,
    toStep: SortStep,
    fromLabels: number[],
  ): RenderTransition => {
    return {
      fromSnapshot: [...fromStep.snapshot],
      fromLabels,
      progress: 0,
      operation: toStep.metadata?.operation,
      comparedIndices: [...toStep.comparedIndices],
      modifiedIndices: [...toStep.modifiedIndices],
    }
  }

  const ensureTransitionAnimationLoop = (): void => {
    if (animationFrameId !== undefined) {
      return
    }

    const renderTransitionFrame = (timestamp: number): void => {
      animationFrameId = undefined
      renderCurrentFrame(timestamp)

      if (activeTransition || celebration?.isActive(timestamp)) {
        animationFrameId = window.requestAnimationFrame(renderTransitionFrame)
      }
    }

    animationFrameId = window.requestAnimationFrame(renderTransitionFrame)
  }

  const startTimer = (): void => {
    stopTimer()

    const cadence = resolvePlaybackCadence(speed, arraySize)
    const playbackIntervalMs = cadence.intervalMs
    tickIntervalId = window.setInterval(() => {
      let previousPlaybackState = playback.getState()
      let nextPlaybackState = previousPlaybackState

      for (let iteration = 0; iteration < cadence.stepsPerTick; iteration += 1) {
        if (nextPlaybackState.status !== 'running') {
          break
        }

        previousPlaybackState = nextPlaybackState
        nextPlaybackState = playback.tick()
      }

      if (nextPlaybackState.stepIndex !== previousPlaybackState.stepIndex) {
        if (cadence.stepsPerTick === 1) {
          const fromLabels = mapSnapshotToInitialIndices(previousPlaybackState.step.snapshot, initialIndexLookup)
          activeTransition = {
            transition: createStepTransition(previousPlaybackState.step, nextPlaybackState.step, fromLabels),
            startedAtMs: window.performance.now(),
            durationMs: getTransitionDurationMs(playbackIntervalMs),
          }
        } else {
          activeTransition = undefined
        }
      }

      if (nextPlaybackState.status === 'finished' && appStatus !== 'finished') {
        appStatus = transitionPlaybackStatus(appStatus, 'finish')
        stopTimer()
        beginCelebration()
      } else if (nextPlaybackState.stepIndex !== previousPlaybackState.stepIndex) {
        soundEngine.playStep(nextPlaybackState.step, valueRange.min, valueRange.max)
      }

      if (activeTransition) {
        ensureTransitionAnimationLoop()
      } else {
        renderCurrentFrame(window.performance.now())

        if (celebration) {
          ensureTransitionAnimationLoop()
        }
      }
    }, playbackIntervalMs)
  }

  const beginCelebration = (): void => {
    soundEngine.playFinish()

    if (!shouldCelebrate) {
      return
    }

    celebration = createCelebration({
      startedAtMs: window.performance.now(),
      dimensions: { width: surface.cssWidth, height: surface.cssHeight },
    })
  }

  const resetExecution = (input: readonly number[]): void => {
    stopTimer()
    stopAnimationFrame()
    activeTransition = undefined
    celebration = undefined
    currentInput = [...input]
    valueRange = { min: Math.min(...currentInput), max: Math.max(...currentInput) }
    execution = executeAlgorithmWithInput(selectedAlgorithmId, currentInput)
    playback = createPlaybackController(execution.steps)
    stepStats = buildCumulativeStepStats(execution.steps)
    initialIndexLookup = buildInitialIndexLookup(execution.steps[0]?.snapshot ?? currentInput)
    appStatus = playback.reset().status
    renderCurrentFrame()
  }

  const updateStatsHud = (stepIndex: number): void => {
    const stats = stepStats.at(stepIndex)
    const lastStepIndex = Math.max(1, execution.steps.length - 1)
    const progressPercent = appStatus === 'finished' ? 100 : Math.round((stepIndex / lastStepIndex) * 100)

    statComparisons.textContent = stats.comparisons.toLocaleString()
    statMoves.textContent = stats.moves.toLocaleString()
    statProgress.textContent = `${progressPercent}%`
    progressFill.style.width = `${progressPercent}%`
    progressTrack.setAttribute('aria-valuenow', String(progressPercent))
  }

  const renderCurrentFrame = (timestampMs = window.performance.now()): void => {
    const playbackState = playback.getState()
    let states = mapStepToBarStates(playbackState.step, playbackState.status)
    let transition: RenderTransition | undefined

    if (activeTransition) {
      const elapsedMs = timestampMs - activeTransition.startedAtMs
      const progress = elapsedMs / activeTransition.durationMs

      if (progress >= 1) {
        activeTransition = undefined
      } else {
        transition = {
          ...activeTransition.transition,
          progress,
        }
      }
    }

    if (celebration && !celebration.isActive(timestampMs)) {
      celebration = undefined
    }

    if (celebration) {
      states = celebration.applySweep(states, timestampMs)
    }

    renderBarsFrame(
      surface.context,
      {
        snapshot: playbackState.step.snapshot,
        states,
        labels: mapSnapshotToInitialIndices(playbackState.step.snapshot, initialIndexLookup),
      },
      {
        width: surface.cssWidth,
        height: surface.cssHeight,
      },
      defaultVisualSemantics,
      transition,
    )
    celebration?.draw(surface.context, timestampMs)

    const algorithmName = algorithmMap.get(selectedAlgorithmId)?.name ?? selectedAlgorithmId
    summary.textContent = `${algorithmName} ${appStatus} at step ${playbackState.stepIndex + 1}/${execution.steps.length}.`
    meta.textContent = `Size: ${arraySize} | Speed: ${speed} | Steps: ${execution.steps.length}`
    updateStatsHud(playbackState.stepIndex)
    updateAlgorithmDescription()
    updateControlState()
  }

  const resizeAndRender = (): void => {
    const dimensions = getResponsiveDimensions(canvas, defaultDimensions)
    surface = configureCanvasSurface(canvas, dimensions)
    renderCurrentFrame()
  }

  resizeAndRender()

  const onStart = (): void => {
    if (!isPlaybackActionAllowed(appStatus, 'start')) {
      return
    }

    const nextPlaybackState = playback.start()
    celebration = undefined
    appStatus = transitionPlaybackStatus(appStatus, 'start')
    appStatus = nextPlaybackState.status

    if (nextPlaybackState.status === 'running') {
      startTimer()
    } else {
      stopTimer()
      stopAnimationFrame()
    }

    renderCurrentFrame()
  }

  const onPause = (): void => {
    if (!isPlaybackActionAllowed(appStatus, 'pause')) {
      return
    }

    const nextPlaybackState = playback.pause()
    appStatus = transitionPlaybackStatus(appStatus, 'pause')
    appStatus = nextPlaybackState.status
    stopTimer()
    stopAnimationFrame()
    renderCurrentFrame()
  }

  const onResume = (): void => {
    if (!isPlaybackActionAllowed(appStatus, 'resume')) {
      return
    }

    const nextPlaybackState = playback.resume()
    appStatus = transitionPlaybackStatus(appStatus, 'resume')
    appStatus = nextPlaybackState.status

    if (nextPlaybackState.status === 'running') {
      startTimer()
    }

    renderCurrentFrame()
  }

  const onReset = (): void => {
    if (!isPlaybackActionAllowed(appStatus, 'reset')) {
      return
    }

    const nextPlaybackState = playback.reset()
    appStatus = transitionPlaybackStatus(appStatus, 'reset')
    appStatus = nextPlaybackState.status
    stopTimer()
    stopAnimationFrame()
    activeTransition = undefined
    celebration = undefined
    renderCurrentFrame()
  }

  const updateSoundToggle = (): void => {
    const enabled = soundEngine.isEnabled()
    const icon = soundToggle.querySelector('.btn-icon')
    const label = soundToggle.querySelector('.sound-label')

    soundToggle.setAttribute('aria-pressed', String(enabled))

    if (icon) {
      icon.textContent = enabled ? '🔊' : '🔇'
    }

    if (label) {
      label.textContent = enabled ? 'Sound on' : 'Sound off'
    }
  }

  soundToggle.addEventListener('click', () => {
    soundEngine.setEnabled(!soundEngine.isEnabled())
    updateSoundToggle()
  })
  updateSoundToggle()

  algorithmSelect.addEventListener('change', () => {
    selectedAlgorithmId = algorithmSelect.value as SortingAlgorithmId
    resetExecution(currentInput)
  })

  arraySizeSlider.addEventListener('input', () => {
    arraySize = toValidArraySize(Number(arraySizeSlider.value))
    arraySizeValue.textContent = String(arraySize)

    const newInput = generateRandomArray({
      ...getRandomArrayOptions(arraySize),
    })
    resetExecution(newInput)
  })

  speedSlider.addEventListener('input', () => {
    speed = toValidSpeed(Number(speedSlider.value))
    speedValue.textContent = String(speed)

    if (appStatus === 'running') {
      startTimer()
    }

    renderCurrentFrame()
  })

  randomizeButton.addEventListener('click', () => {
    const newInput = generateRandomArray({
      ...getRandomArrayOptions(arraySize),
    })
    resetExecution(newInput)
  })

  startButton.addEventListener('click', onStart)
  pauseButton.addEventListener('click', onPause)
  resumeButton.addEventListener('click', onResume)
  resetButton.addEventListener('click', onReset)

  let resizeFrameId: number | undefined

  const onWindowResize = (): void => {
    if (!canvas.isConnected) {
      window.removeEventListener('resize', onWindowResize)
      return
    }

    if (resizeFrameId !== undefined) {
      return
    }

    resizeFrameId = window.requestAnimationFrame(() => {
      resizeFrameId = undefined
      resizeAndRender()
    })
  }

  const onKeyDown = (event: KeyboardEvent): void => {
    if (!canvas.isConnected) {
      document.removeEventListener('keydown', onKeyDown)
      return
    }

    if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) {
      return
    }

    const target = event.target

    if (
      target instanceof HTMLButtonElement ||
      target instanceof HTMLSelectElement ||
      target instanceof HTMLTextAreaElement ||
      (target instanceof HTMLInputElement && target.type !== 'range')
    ) {
      return
    }

    const action = resolveKeyboardAction(event.key, appStatus)

    if (!action) {
      return
    }

    event.preventDefault()
    keyboardActionHandlers[action]()
  }

  const keyboardActionHandlers: Record<KeyboardAction, () => void> = {
    start: onStart,
    pause: onPause,
    resume: onResume,
    reset: onReset,
    randomize: () => {
      if (!randomizeButton.disabled) {
        randomizeButton.click()
      }
    },
  }

  window.addEventListener('resize', onWindowResize)
  document.addEventListener('keydown', onKeyDown)

  if (!resolvedOptions.autoplay) {
    return
  }

  onStart()
}
