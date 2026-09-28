import { screen } from '@testing-library/dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  bootstrapApp,
  buildInitialIndexLookup,
  mapSnapshotToInitialIndices,
  resolveKeyboardAction,
} from '@/app/bootstrap'

const sequenceRandom = (values: number[]): (() => number) => {
  let index = 0

  return () => {
    const value = values[index % values.length]
    index += 1
    return value ?? 0
  }
}

describe('bootstrapApp', () => {
  beforeEach(() => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(() => {
      return {
        clearRect: vi.fn(),
        fillRect: vi.fn(),
        fillText: vi.fn(),
        setTransform: vi.fn(),
        font: '9px sans-serif',
        textAlign: 'center',
        textBaseline: 'alphabetic',
      } as unknown as CanvasRenderingContext2D
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders heading and canvas shell', () => {
    document.body.innerHTML = '<div id="app"></div>'

    const root = document.querySelector<HTMLDivElement>('#app')

    if (!root) {
      throw new Error('Test root not found')
    }

    bootstrapApp(root, { autoplay: false })

    expect(screen.getByRole('heading', { name: /sorting visualizer/i })).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Compare' }).getAttribute('href')).toBe('/compare')

    const canvas = root.querySelector<HTMLCanvasElement>('#sorting-canvas')
    expect(canvas).toBeTruthy()
    expect(canvas?.getAttribute('width')).toBe('900')
    expect(canvas?.getAttribute('height')).toBe('420')
    expect(root.querySelector('.workspace-grid')).toBeTruthy()
    expect(root.querySelector('.canvas-shell')).toBeTruthy()
    expect(root.querySelector('.canvas-hint')?.textContent).toContain('Space')
    expect(root.querySelector('#stat-comparisons')?.textContent).toBe('0')
    expect(root.querySelector('#stat-progress')?.textContent).toBe('0%')
    const legendItems = root.querySelectorAll('.visual-legend li')
    expect(legendItems).toHaveLength(4)
    expect(root.querySelector('.visual-legend')?.textContent).toContain('Compared')
    expect(root.querySelector('.visual-legend')?.textContent).toContain('Modified')
    expect(root.querySelector('.visual-legend')?.textContent).toContain('Completed')

    expect(root.querySelector('#selected-algorithm-description')?.textContent).toContain('Bubble Sort')
    expect(root.querySelector('#algorithm-debug-summary')?.textContent).toContain('idle')
    expect(root.querySelector('#algorithm-debug-meta')?.textContent).toContain('Size: 100')
    expect(root.querySelector('#algorithm-debug-meta')?.textContent).toContain('Speed: 55')

    const descriptions = root.querySelectorAll('.algorithm-description')
    expect(descriptions).toHaveLength(5)
    expect(root.textContent).toContain('Repeatedly compares neighboring values and swaps out-of-order pairs')
    expect(root.textContent).toContain('Builds a sorted left side incrementally by shifting larger values right')
    expect(root.textContent).toContain('Scans the unsorted range to find the minimum value')
    expect(root.textContent).toContain('Recursively splits the array and merges sorted ranges')
    expect(root.textContent).toContain('Partitions each range around a deterministic pivot')

    const algorithmSelect = root.querySelector<HTMLSelectElement>('#algorithm-select')
    const arraySizeSlider = root.querySelector<HTMLInputElement>('#array-size-slider')
    const speedSlider = root.querySelector<HTMLInputElement>('#speed-slider')
    const randomizeButton = root.querySelector<HTMLButtonElement>('#randomize-button')
    const startButton = root.querySelector<HTMLButtonElement>('#start-button')
    const pauseButton = root.querySelector<HTMLButtonElement>('#pause-button')
    const resumeButton = root.querySelector<HTMLButtonElement>('#resume-button')
    const resetButton = root.querySelector<HTMLButtonElement>('#reset-button')

    expect(algorithmSelect?.disabled).toBe(false)
    expect(arraySizeSlider?.disabled).toBe(false)
    expect(arraySizeSlider?.max).toBe('1000')
    expect(speedSlider?.disabled).toBe(false)
    expect(randomizeButton?.disabled).toBe(false)
    expect(startButton?.disabled).toBe(false)
    expect(pauseButton?.disabled).toBe(true)
    expect(resumeButton?.disabled).toBe(true)
    expect(resetButton?.disabled).toBe(true)
  })

  it('supports start, pause, resume, and reset flow', () => {
    vi.useFakeTimers()
    document.body.innerHTML = '<div id="app"></div>'

    const root = document.querySelector<HTMLDivElement>('#app')

    if (!root) {
      throw new Error('Test root not found')
    }

    bootstrapApp(root, {
      autoplay: false,
      defaultArraySize: 12,
      previewOptions: {
        minValue: 1,
        maxValue: 9,
        random: sequenceRandom([0.8, 0.2, 0.5, 0.1]),
      },
    })

    const startButton = root.querySelector<HTMLButtonElement>('#start-button')
    const pauseButton = root.querySelector<HTMLButtonElement>('#pause-button')
    const resumeButton = root.querySelector<HTMLButtonElement>('#resume-button')
    const resetButton = root.querySelector<HTMLButtonElement>('#reset-button')

    startButton?.click()
    expect(root.querySelector('#algorithm-debug-summary')?.textContent).toContain('running')
    expect(pauseButton?.disabled).toBe(false)
    expect(startButton?.disabled).toBe(true)

    pauseButton?.click()
    expect(root.querySelector('#algorithm-debug-summary')?.textContent).toContain('paused')
    expect(resumeButton?.disabled).toBe(false)

    resumeButton?.click()
    expect(root.querySelector('#algorithm-debug-summary')?.textContent).toContain('running')

    resetButton?.click()
    expect(root.querySelector('#algorithm-debug-summary')?.textContent).toContain('idle')
    expect(startButton?.disabled).toBe(false)

    vi.runAllTimers()
    vi.useRealTimers()
  })

  it('wires algorithm, size, speed, and randomize controls with state gating', () => {
    vi.useFakeTimers()
    document.body.innerHTML = '<div id="app"></div>'

    const root = document.querySelector<HTMLDivElement>('#app')

    if (!root) {
      throw new Error('Test root not found')
    }

    bootstrapApp(root, {
      autoplay: false,
      defaultArraySize: 10,
      previewOptions: {
        minValue: 1,
        maxValue: 9,
        random: sequenceRandom([0.1, 0.7, 0.4, 0.9, 0.3]),
      },
    })

    const algorithmSelect = root.querySelector<HTMLSelectElement>('#algorithm-select')
    const arraySizeSlider = root.querySelector<HTMLInputElement>('#array-size-slider')
    const speedSlider = root.querySelector<HTMLInputElement>('#speed-slider')
    const randomizeButton = root.querySelector<HTMLButtonElement>('#randomize-button')
    const startButton = root.querySelector<HTMLButtonElement>('#start-button')

    if (!algorithmSelect || !arraySizeSlider || !speedSlider || !randomizeButton || !startButton) {
      throw new Error('Expected control elements to be present')
    }

    algorithmSelect.value = 'selection-sort'
    algorithmSelect.dispatchEvent(new Event('change'))
    expect(root.querySelector('#selected-algorithm-description')?.textContent).toContain('Selection Sort')

    arraySizeSlider.value = '16'
    arraySizeSlider.dispatchEvent(new Event('input'))
    expect(root.querySelector('#array-size-value')?.textContent).toBe('16')
    expect(root.querySelector('#algorithm-debug-meta')?.textContent).toContain('Size: 16')

    speedSlider.value = '95'
    speedSlider.dispatchEvent(new Event('input'))
    expect(root.querySelector('#speed-value')?.textContent).toBe('95')
    expect(root.querySelector('#algorithm-debug-meta')?.textContent).toContain('Speed: 95')

    const summaryBeforeRandomize = root.querySelector('#algorithm-debug-summary')?.textContent
    randomizeButton.click()
    const summaryAfterRandomize = root.querySelector('#algorithm-debug-summary')?.textContent
    expect(summaryAfterRandomize).toContain('idle')
    expect(summaryAfterRandomize).toContain('step 1/')
    expect(summaryAfterRandomize).not.toBe(summaryBeforeRandomize)

    startButton.click()
    expect(algorithmSelect.disabled).toBe(true)
    expect(arraySizeSlider.disabled).toBe(true)
    expect(randomizeButton.disabled).toBe(true)

    vi.runOnlyPendingTimers()
    vi.useRealTimers()
  })

  it('autoplays through steps and reaches finished state', () => {
    vi.useFakeTimers()
    document.body.innerHTML = '<div id="app"></div>'

    const root = document.querySelector<HTMLDivElement>('#app')

    if (!root) {
      throw new Error('Test root not found')
    }

    bootstrapApp(root, {
      autoplay: true,
      defaultArraySize: 8,
      defaultSpeed: 100,
      previewOptions: {
        minValue: 1,
        maxValue: 9,
        random: sequenceRandom([0.5]),
      },
    })

    vi.runAllTimers()

    expect(root.querySelector('#algorithm-debug-summary')?.textContent).toContain('finished')
    vi.useRealTimers()
  })

  it('uses requestAnimationFrame to drive transition renders while running', () => {
    vi.useFakeTimers()
    const requestAnimationFrameSpy = vi
      .spyOn(window, 'requestAnimationFrame')
      .mockImplementation(() => 1)

    document.body.innerHTML = '<div id="app"></div>'

    const root = document.querySelector<HTMLDivElement>('#app')

    if (!root) {
      throw new Error('Test root not found')
    }

    bootstrapApp(root, {
      autoplay: false,
      defaultArraySize: 10,
      defaultSpeed: 70,
      previewOptions: {
        minValue: 1,
        maxValue: 9,
        random: sequenceRandom([0.6, 0.1, 0.8, 0.2, 0.4]),
      },
    })

    root.querySelector<HTMLButtonElement>('#start-button')?.click()
    vi.runOnlyPendingTimers()

    expect(requestAnimationFrameSpy).toHaveBeenCalled()
    vi.useRealTimers()
  })

  it('skips transition animation frames for very high-speed large-array cadence', () => {
    vi.useFakeTimers()
    const requestAnimationFrameSpy = vi
      .spyOn(window, 'requestAnimationFrame')
      .mockImplementation(() => 1)

    document.body.innerHTML = '<div id="app"></div>'

    const root = document.querySelector<HTMLDivElement>('#app')

    if (!root) {
      throw new Error('Test root not found')
    }

    bootstrapApp(root, {
      autoplay: false,
      defaultArraySize: 180,
      defaultSpeed: 100,
      previewOptions: {
        minValue: 1,
        maxValue: 999,
        random: sequenceRandom([0.9, 0.4, 0.2, 0.7, 0.1]),
      },
    })

    root.querySelector<HTMLButtonElement>('#start-button')?.click()
    vi.runOnlyPendingTimers()

    expect(requestAnimationFrameSpy).not.toHaveBeenCalled()
    vi.useRealTimers()
  })

  it('keeps root status and control gating consistent across run pause and reset', () => {
    vi.useFakeTimers()
    document.body.innerHTML = '<div id="app"></div>'

    const root = document.querySelector<HTMLDivElement>('#app')

    if (!root) {
      throw new Error('Test root not found')
    }

    bootstrapApp(root, {
      autoplay: false,
      defaultArraySize: 20,
      defaultSpeed: 60,
      previewOptions: {
        minValue: 1,
        maxValue: 50,
        random: sequenceRandom([0.4, 0.9, 0.2, 0.8, 0.1]),
      },
    })

    const startButton = root.querySelector<HTMLButtonElement>('#start-button')
    const pauseButton = root.querySelector<HTMLButtonElement>('#pause-button')
    const resetButton = root.querySelector<HTMLButtonElement>('#reset-button')
    const randomizeButton = root.querySelector<HTMLButtonElement>('#randomize-button')

    startButton?.click()
    expect(root.dataset.status).toBe('running')
    expect(randomizeButton?.disabled).toBe(true)

    pauseButton?.click()
    expect(root.dataset.status).toBe('paused')
    expect(resetButton?.disabled).toBe(false)

    resetButton?.click()
    expect(root.dataset.status).toBe('idle')
    expect(randomizeButton?.disabled).toBe(false)

    vi.runOnlyPendingTimers()
    vi.useRealTimers()
  })

  it('maps current snapshots to stable initial indices for duplicate-safe tracking labels', () => {
    const initialSnapshot = [9, 1, 8, 1, 7]
    const lookup = buildInitialIndexLookup(initialSnapshot)
    const mapped = mapSnapshotToInitialIndices([1, 1, 7, 8, 9], lookup)

    expect(mapped).toEqual([1, 3, 4, 2, 0])
  })

  it('updates live stats and progress as playback advances to completion', () => {
    vi.useFakeTimers()
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation(() => 1)
    document.body.innerHTML = '<div id="app"></div>'

    const root = document.querySelector<HTMLDivElement>('#app')

    if (!root) {
      throw new Error('Test root not found')
    }

    bootstrapApp(root, {
      autoplay: false,
      defaultArraySize: 6,
      defaultSpeed: 100,
      previewOptions: {
        minValue: 1,
        maxValue: 9,
        random: sequenceRandom([0.9, 0.7, 0.5, 0.3, 0.1, 0.0]),
      },
    })

    root.querySelector<HTMLButtonElement>('#start-button')?.click()
    vi.advanceTimersByTime(2000)

    expect(root.dataset.status).toBe('finished')
    expect(Number(root.querySelector('#stat-comparisons')?.textContent)).toBeGreaterThan(0)
    expect(Number(root.querySelector('#stat-moves')?.textContent)).toBeGreaterThan(0)
    expect(root.querySelector('#stat-progress')?.textContent).toBe('100%')
    expect(root.querySelector('.progress-track')?.getAttribute('aria-valuenow')).toBe('100')
    expect(root.querySelector<HTMLDivElement>('#progress-fill')?.style.width).toBe('100%')
    vi.useRealTimers()
  })

  it('maps keyboard keys to playback actions based on status', () => {
    expect(resolveKeyboardAction(' ', 'idle')).toBe('start')
    expect(resolveKeyboardAction(' ', 'finished')).toBe('start')
    expect(resolveKeyboardAction(' ', 'running')).toBe('pause')
    expect(resolveKeyboardAction('Spacebar', 'paused')).toBe('resume')
    expect(resolveKeyboardAction('r', 'idle')).toBe('randomize')
    expect(resolveKeyboardAction('R', 'idle')).toBe('randomize')
    expect(resolveKeyboardAction('Escape', 'running')).toBe('reset')
    expect(resolveKeyboardAction('x', 'idle')).toBeUndefined()
  })

  it('drives playback with keyboard shortcuts and ignores keys aimed at form controls', () => {
    vi.useFakeTimers()
    document.body.innerHTML = '<div id="app"></div>'

    const root = document.querySelector<HTMLDivElement>('#app')

    if (!root) {
      throw new Error('Test root not found')
    }

    bootstrapApp(root, {
      autoplay: false,
      defaultArraySize: 20,
      defaultSpeed: 10,
      previewOptions: {
        minValue: 1,
        maxValue: 50,
        random: sequenceRandom([0.4, 0.9, 0.2, 0.8, 0.1]),
      },
    })

    const press = (key: string, target: EventTarget = document.body, init: KeyboardEventInit = {}): void => {
      target.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...init }))
    }

    press(' ')
    expect(root.dataset.status).toBe('running')
    press(' ')
    expect(root.dataset.status).toBe('paused')
    press(' ')
    expect(root.dataset.status).toBe('running')
    press('r')
    expect(root.dataset.status).toBe('running')
    press(' ', document.body, { ctrlKey: true })
    expect(root.dataset.status).toBe('running')

    const select = root.querySelector<HTMLSelectElement>('#algorithm-select')
    press(' ', select ?? document.body)
    expect(root.dataset.status).toBe('running')

    press('Escape')
    expect(root.dataset.status).toBe('idle')

    const summaryBefore = root.querySelector('#stat-comparisons')?.textContent
    press('R')
    expect(root.dataset.status).toBe('idle')
    expect(root.querySelector('#stat-comparisons')?.textContent).toBe(summaryBefore)

    press('q')
    expect(root.dataset.status).toBe('idle')
    vi.runOnlyPendingTimers()
    vi.useRealTimers()
  })

  it('re-renders on window resize even without autoplay and detaches stale listeners', () => {
    const requestAnimationFrameSpy = vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
      callback(0)
      return 1
    })
    const removeListenerSpy = vi.spyOn(window, 'removeEventListener')
    document.body.innerHTML = '<div id="app"></div>'

    const root = document.querySelector<HTMLDivElement>('#app')

    if (!root) {
      throw new Error('Test root not found')
    }

    bootstrapApp(root, { autoplay: false })
    const canvas = root.querySelector<HTMLCanvasElement>('#sorting-canvas')
    vi.spyOn(canvas as HTMLCanvasElement, 'getBoundingClientRect').mockReturnValue({ width: 450 } as DOMRect)

    window.dispatchEvent(new Event('resize'))

    expect(requestAnimationFrameSpy).toHaveBeenCalled()
    expect(canvas?.style.width).toBe('450px')

    document.body.innerHTML = '<div id="app"></div>'
    window.dispatchEvent(new Event('resize'))
    expect(removeListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function))

    document.dispatchEvent(new KeyboardEvent('keydown', { key: ' ' }))
  })

  it('toggles sound, plays step blips while running, and a finish jingle with celebration frames', () => {
    vi.useFakeTimers()
    const frameCallbacks: FrameRequestCallback[] = []
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
      frameCallbacks.push(callback)
      return frameCallbacks.length
    })
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => undefined)
    let enabled = false
    const soundEngine = {
      isEnabled: () => enabled,
      setEnabled: vi.fn((next: boolean) => {
        enabled = next
      }),
      playStep: vi.fn(),
      playFinish: vi.fn(),
    }
    document.body.innerHTML = '<div id="app"></div>'

    const root = document.querySelector<HTMLDivElement>('#app')

    if (!root) {
      throw new Error('Test root not found')
    }

    bootstrapApp(root, {
      autoplay: false,
      celebrate: true,
      soundEngine,
      defaultArraySize: 6,
      defaultSpeed: 100,
      previewOptions: {
        minValue: 1,
        maxValue: 9,
        random: sequenceRandom([0.9, 0.7, 0.5, 0.3, 0.1, 0.0]),
      },
    })

    const soundToggle = root.querySelector<HTMLButtonElement>('#sound-toggle')
    expect(soundToggle?.getAttribute('aria-pressed')).toBe('false')
    soundToggle?.click()
    expect(soundEngine.setEnabled).toHaveBeenCalledWith(true)
    expect(soundToggle?.getAttribute('aria-pressed')).toBe('true')
    expect(soundToggle?.textContent).toContain('Sound on')

    root.querySelector<HTMLButtonElement>('#start-button')?.click()
    vi.advanceTimersByTime(2000)

    expect(root.dataset.status).toBe('finished')
    expect(soundEngine.playStep).toHaveBeenCalled()
    expect(soundEngine.playFinish).toHaveBeenCalledOnce()

    // Drain a couple of animation frames: celebration keeps requesting frames while active.
    const pendingBefore = frameCallbacks.length
    frameCallbacks.at(-1)?.(window.performance.now())
    expect(frameCallbacks.length).toBeGreaterThan(pendingBefore)
    frameCallbacks.at(-1)?.(window.performance.now() + 60_000)

    root.querySelector<HTMLButtonElement>('#reset-button')?.click()
    expect(root.dataset.status).toBe('idle')

    soundToggle?.click()
    expect(soundToggle?.getAttribute('aria-pressed')).toBe('false')
    vi.useRealTimers()
  })

  it('skips the celebration when reduced motion is preferred', () => {
    vi.useFakeTimers()
    const requestAnimationFrameSpy = vi.spyOn(window, 'requestAnimationFrame').mockImplementation(() => 1)
    vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: true })))
    document.body.innerHTML = '<div id="app"></div>'

    const root = document.querySelector<HTMLDivElement>('#app')

    if (!root) {
      throw new Error('Test root not found')
    }

    bootstrapApp(root, {
      autoplay: false,
      defaultArraySize: 5,
      defaultSpeed: 100,
      previewOptions: {
        minValue: 1,
        maxValue: 9,
        random: sequenceRandom([0.1, 0.3, 0.5, 0.7, 0.9]),
      },
    })

    root.querySelector<HTMLButtonElement>('#start-button')?.click()
    vi.advanceTimersByTime(2000)

    expect(root.dataset.status).toBe('finished')
    expect(requestAnimationFrameSpy).not.toHaveBeenCalled()
    vi.unstubAllGlobals()
    vi.useRealTimers()
  })
})

