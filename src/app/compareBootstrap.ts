import { appName } from '@/app'
import { createCompareOrchestrator } from '@/app/compareOrchestrator'
import { generateRandomArray, type RandomArrayOptions } from '@/app/algorithmPipeline'
import { getAlgorithmMetadata, listAlgorithms, type SortingAlgorithmId } from '@/algorithms'
import { defaultSpeedRange, getControlAvailability, isPlaybackActionAllowed } from '@/state'
import {
  configureCanvasSurface,
  defaultDimensions,
  defaultVisualSemantics,
  mapStepToBarStates,
  renderBarsFrame,
} from '@/visualizer'

const MIN_ARRAY_SIZE = 5
const MAX_ARRAY_SIZE = 300
const DEFAULT_ARRAY_SIZE = 60
const DEFAULT_SPEED = 55
const defaultSelectedAlgorithms: SortingAlgorithmId[] = ['bubble-sort', 'insertion-sort']

const complexityLabel = (algorithmId: SortingAlgorithmId): string => {
  const complexity = getAlgorithmMetadata(algorithmId).complexity
  return `Best ${complexity.best} | Average ${complexity.average} | Worst ${complexity.worst}`
}

export const bootstrapComparePage = (root: HTMLDivElement): void => {
  const algorithms = listAlgorithms()
  const selected = new Set<SortingAlgorithmId>(defaultSelectedAlgorithms)

  let arraySize = DEFAULT_ARRAY_SIZE
  let speed = DEFAULT_SPEED
  let compareInput = generateRandomArray({ size: arraySize })
  let tickIntervalId: number | undefined

  const toRandomOptions = (): RandomArrayOptions => {
    return {
      size: arraySize,
      minValue: 8,
      maxValue: 160,
    }
  }

  let orchestrator = createCompareOrchestrator({
    selectedAlgorithms: Array.from(selected),
    sharedInput: compareInput,
    speed,
    arraySize,
  })

  root.innerHTML = `
    <main class="shell compare-shell" data-page="compare" data-status="idle">
      <header class="shell-header">
        <nav class="page-nav" aria-label="Primary navigation">
          <a href="/">Single View</a>
          <a href="/compare" aria-current="page">Compare</a>
        </nav>
        <h1>${appName}</h1>
        <p>Algorithm Comparison</p>
      </header>

      <section class="compare-intro" aria-label="Comparison page intro">
        <p>All selected algorithms run with the same input for fair, real-time side-by-side comparison.</p>
      </section>

      <section class="compare-controls" aria-label="Comparison controls">
        <fieldset class="compare-selector" id="compare-algorithm-selector">
          <legend>Algorithms</legend>
          <div class="compare-checkbox-grid">
            ${algorithms
              .map((algorithm) => {
                const checked = selected.has(algorithm.id) ? ' checked' : ''

                return `
                  <label class="compare-checkbox" for="compare-algorithm-${algorithm.id}">
                    <input id="compare-algorithm-${algorithm.id}" type="checkbox" value="${algorithm.id}"${checked} />
                    <span>${algorithm.name}</span>
                  </label>
                `
              })
              .join('')}
          </div>
        </fieldset>

        <div class="compare-control-sliders">
          <label class="control-field" for="compare-array-size-slider">
            <span>Array size <output id="compare-array-size-value">${arraySize}</output></span>
            <input id="compare-array-size-slider" type="range" min="${MIN_ARRAY_SIZE}" max="${MAX_ARRAY_SIZE}" value="${arraySize}" step="1" />
          </label>
          <label class="control-field" for="compare-speed-slider">
            <span>Speed <output id="compare-speed-value">${speed}</output></span>
            <input id="compare-speed-slider" type="range" min="${defaultSpeedRange.min}" max="${defaultSpeedRange.max}" value="${speed}" step="1" />
          </label>
        </div>

        <div class="compare-actions">
          <button id="compare-randomize-button" type="button">Randomize</button>
          <button id="compare-start-button" type="button">Start</button>
          <button id="compare-pause-button" type="button">Pause</button>
          <button id="compare-resume-button" type="button">Resume</button>
          <button id="compare-reset-button" type="button">Reset</button>
          <p id="compare-run-status">Ready to run.</p>
          <p id="compare-input-status"></p>
        </div>
      </section>

      <section class="compare-panels" aria-label="Comparison panels" id="compare-panels"></section>
    </main>
  `

  const selectorRoot = root.querySelector<HTMLFieldSetElement>('#compare-algorithm-selector')
  const checkboxes = root.querySelectorAll<HTMLInputElement>('#compare-algorithm-selector input[type="checkbox"]')
  const arraySizeSlider = root.querySelector<HTMLInputElement>('#compare-array-size-slider')
  const arraySizeValue = root.querySelector<HTMLOutputElement>('#compare-array-size-value')
  const speedSlider = root.querySelector<HTMLInputElement>('#compare-speed-slider')
  const speedValue = root.querySelector<HTMLOutputElement>('#compare-speed-value')
  const randomizeButton = root.querySelector<HTMLButtonElement>('#compare-randomize-button')
  const startButton = root.querySelector<HTMLButtonElement>('#compare-start-button')
  const pauseButton = root.querySelector<HTMLButtonElement>('#compare-pause-button')
  const resumeButton = root.querySelector<HTMLButtonElement>('#compare-resume-button')
  const resetButton = root.querySelector<HTMLButtonElement>('#compare-reset-button')
  const runStatus = root.querySelector<HTMLParagraphElement>('#compare-run-status')
  const inputStatus = root.querySelector<HTMLParagraphElement>('#compare-input-status')
  const panelsContainer = root.querySelector<HTMLDivElement>('#compare-panels')

  if (
    !selectorRoot ||
    checkboxes.length === 0 ||
    !arraySizeSlider ||
    !arraySizeValue ||
    !speedSlider ||
    !speedValue ||
    !randomizeButton ||
    !startButton ||
    !pauseButton ||
    !resumeButton ||
    !resetButton ||
    !runStatus ||
    !inputStatus ||
    !panelsContainer
  ) {
    return
  }

  const stopTimer = (): void => {
    if (tickIntervalId === undefined) {
      return
    }

    window.clearInterval(tickIntervalId)
    tickIntervalId = undefined
  }

  const renderPanels = (): void => {
    const state = orchestrator.getState()
    const selectedAlgorithms = state.session.selectedAlgorithms

    panelsContainer.dataset.panelCount = String(selectedAlgorithms.length)
    panelsContainer.innerHTML = selectedAlgorithms
      .map((algorithmId) => {
        const metadata = getAlgorithmMetadata(algorithmId)
        const panelState = state.panelStates[algorithmId]

        return `
          <article class="compare-panel" data-algorithm-id="${algorithmId}" data-status="${panelState.status}">
            <header class="compare-panel-header">
              <h2>${metadata.displayName}</h2>
              <p class="compare-complexity">${complexityLabel(algorithmId)}</p>
              <p class="compare-description">${metadata.description}</p>
            </header>
            <div class="compare-canvas-shell">
              <canvas class="compare-canvas" id="compare-canvas-${algorithmId}" width="${defaultDimensions.width}" height="${defaultDimensions.height}"></canvas>
            </div>
            <p class="compare-panel-run-status">${panelState.status} at step ${panelState.stepIndex + 1}/${panelState.steps.length}</p>
          </article>
        `
      })
      .join('')

    selectedAlgorithms.forEach((algorithmId) => {
      const panelState = state.panelStates[algorithmId]
      const canvas = panelsContainer.querySelector<HTMLCanvasElement>(`#compare-canvas-${algorithmId}`)

      if (!canvas || !panelState) {
        return
      }

      const surface = configureCanvasSurface(canvas, {
        width: Math.max(220, Math.min(380, canvas.clientWidth || 320)),
        height: 170,
      })
      const barStates = mapStepToBarStates(panelState.step, panelState.status)

      renderBarsFrame(
        surface.context,
        {
          snapshot: panelState.step.snapshot,
          states: barStates,
          labels: undefined,
        },
        {
          width: surface.cssWidth,
          height: surface.cssHeight,
        },
        defaultVisualSemantics,
      )
    })
  }

  const updateControlState = (): void => {
    const state = orchestrator.getState()
    const availability = getControlAvailability(state.session.status)

    root.dataset.status = state.session.status
    selectorRoot.disabled = !availability.algorithmSelect
    checkboxes.forEach((checkbox) => {
      checkbox.disabled = !availability.algorithmSelect
    })
    arraySizeSlider.disabled = !availability.arraySize
    speedSlider.disabled = !availability.speed
    randomizeButton.disabled = !availability.randomize
    startButton.disabled = !availability.start
    pauseButton.disabled = !availability.pause
    resumeButton.disabled = !availability.resume
    resetButton.disabled = !availability.reset

    runStatus.textContent = `Session ${state.session.status} | Shared input length: ${state.session.sharedInput.length} | Active panels: ${state.session.selectedAlgorithms.length}`
    inputStatus.textContent = `Input sample: [${state.session.sharedInput.slice(0, 6).join(', ')}${state.session.sharedInput.length > 6 ? ', ...' : ''}]`
  }

  const renderAll = (): void => {
    renderPanels()
    updateControlState()
  }

  const startTickLoop = (): void => {
    stopTimer()
    const intervalMs = Math.max(4, Math.round(700 - speed * 6.5))

    tickIntervalId = window.setInterval(() => {
      const state = orchestrator.tick()

      if (state.session.status !== 'running') {
        stopTimer()
      }

      renderAll()
    }, intervalMs)
  }

  checkboxes.forEach((checkbox) => {
    checkbox.addEventListener('change', () => {
      const algorithmId = checkbox.value as SortingAlgorithmId

      if (checkbox.checked) {
        selected.add(algorithmId)
      } else {
        selected.delete(algorithmId)
      }

      if (selected.size === 0) {
        checkbox.checked = true
        selected.add(algorithmId)
      }

      orchestrator = createCompareOrchestrator({
        selectedAlgorithms: Array.from(selected),
        sharedInput: compareInput,
        speed,
        arraySize,
      })
      renderAll()
    })
  })

  arraySizeSlider.addEventListener('input', () => {
    arraySize = Math.max(MIN_ARRAY_SIZE, Math.min(MAX_ARRAY_SIZE, Math.round(Number(arraySizeSlider.value))))
    arraySizeValue.textContent = String(arraySize)
    compareInput = generateRandomArray(toRandomOptions())
    orchestrator = createCompareOrchestrator({
      selectedAlgorithms: Array.from(selected),
      sharedInput: compareInput,
      speed,
      arraySize,
    })
    renderAll()
  })

  speedSlider.addEventListener('input', () => {
    speed = Math.max(defaultSpeedRange.min, Math.min(defaultSpeedRange.max, Math.round(Number(speedSlider.value))))
    speedValue.textContent = String(speed)
    orchestrator.updateSpeed(speed)
    renderAll()

    if (orchestrator.getState().session.status === 'running') {
      startTickLoop()
    }
  })

  randomizeButton.addEventListener('click', () => {
    compareInput = generateRandomArray(toRandomOptions())
    orchestrator = createCompareOrchestrator({
      selectedAlgorithms: Array.from(selected),
      sharedInput: compareInput,
      speed,
      arraySize,
    })
    renderAll()
  })

  startButton.addEventListener('click', () => {
    const state = orchestrator.getState()

    if (!isPlaybackActionAllowed(state.session.status, 'start')) {
      return
    }

    orchestrator.start()
    startTickLoop()
    renderAll()
  })

  pauseButton.addEventListener('click', () => {
    const state = orchestrator.getState()

    if (!isPlaybackActionAllowed(state.session.status, 'pause')) {
      return
    }

    stopTimer()
    orchestrator.pause()
    renderAll()
  })

  resumeButton.addEventListener('click', () => {
    const state = orchestrator.getState()

    if (!isPlaybackActionAllowed(state.session.status, 'resume')) {
      return
    }

    orchestrator.resume()
    startTickLoop()
    renderAll()
  })

  resetButton.addEventListener('click', () => {
    stopTimer()
    orchestrator.reset(compareInput)
    renderAll()
  })

  renderAll()
}
