import { appName } from '@/app'
import {
  executeAlgorithmWithInput,
  generateRandomArray,
  type RandomArrayOptions,
} from '@/app/algorithmPipeline'
import { getAlgorithmMetadata, listAlgorithms, type SortingAlgorithmId } from '@/algorithms'
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
import {
  configureCanvasSurface,
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
  let initialIndexLookup = buildInitialIndexLookup(execution.steps[0]?.snapshot ?? currentInput)
  let tickIntervalId: number | undefined
  let animationFrameId: number | undefined
  let activeTransition: ActiveTransition | undefined

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
          <button id="randomize-button" type="button">Randomize</button>
          <button id="start-button" type="button">Start</button>
          <button id="pause-button" type="button">Pause</button>
          <button id="resume-button" type="button">Resume</button>
          <button id="reset-button" type="button">Reset</button>
        </div>
      </section>
      <div class="workspace-grid">
        <section class="canvas-panel" aria-label="Sorting visualization area">
          <div class="canvas-shell">
            <canvas id="sorting-canvas" width="${defaultDimensions.width}" height="${defaultDimensions.height}"></canvas>
          </div>
          <p class="canvas-hint">Bars scale to your viewport and stay fully visible across desktop and mobile sizes.</p>
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
    !resetButton
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

      if (activeTransition) {
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
      }

      if (activeTransition) {
        ensureTransitionAnimationLoop()
      } else {
        renderCurrentFrame(window.performance.now())
      }
    }, playbackIntervalMs)
  }

  const resetExecution = (input: readonly number[]): void => {
    stopTimer()
    stopAnimationFrame()
    activeTransition = undefined
    currentInput = [...input]
    execution = executeAlgorithmWithInput(selectedAlgorithmId, currentInput)
    playback = createPlaybackController(execution.steps)
    initialIndexLookup = buildInitialIndexLookup(execution.steps[0]?.snapshot ?? currentInput)
    appStatus = playback.reset().status
    renderCurrentFrame()
  }

  const renderCurrentFrame = (timestampMs = window.performance.now()): void => {
    const playbackState = playback.getState()
    const states = mapStepToBarStates(playbackState.step, playbackState.status)
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

    const algorithmName = algorithmMap.get(selectedAlgorithmId)?.name ?? selectedAlgorithmId
    summary.textContent = `${algorithmName} ${appStatus} at step ${playbackState.stepIndex + 1}/${execution.steps.length}.`
    meta.textContent = `Size: ${arraySize} | Speed: ${speed} | Steps: ${execution.steps.length}`
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
    renderCurrentFrame()
  }

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

  if (!resolvedOptions.autoplay) {
    return
  }

  onStart()

  window.addEventListener('resize', resizeAndRender)
}
