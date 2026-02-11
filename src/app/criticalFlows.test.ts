import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { bootstrapApp } from '@/app/bootstrap'

const sequenceRandom = (values: number[]): (() => number) => {
  let index = 0

  return () => {
    const value = values[index % values.length]
    index += 1
    return value ?? 0
  }
}

describe('critical user-flow regressions', () => {
  beforeEach(() => {
    vi.useFakeTimers()
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
    document.body.innerHTML = '<div id="app"></div>'
  })

  afterEach(() => {
    vi.runOnlyPendingTimers()
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('keeps algorithm selection and run behavior stable', () => {
    const root = document.querySelector<HTMLDivElement>('#app')

    if (!root) {
      throw new Error('Test root not found')
    }

    bootstrapApp(root, {
      autoplay: false,
      defaultArraySize: 14,
      defaultSpeed: 90,
      previewOptions: {
        minValue: 1,
        maxValue: 20,
        random: sequenceRandom([0.4, 0.9, 0.2, 0.7]),
      },
    })

    const algorithmSelect = root.querySelector<HTMLSelectElement>('#algorithm-select')
    const startButton = root.querySelector<HTMLButtonElement>('#start-button')

    if (!algorithmSelect || !startButton) {
      throw new Error('Expected algorithm controls to exist')
    }

    algorithmSelect.value = 'insertion-sort'
    algorithmSelect.dispatchEvent(new Event('change'))
    startButton.click()

    expect(root.querySelector('#algorithm-debug-summary')?.textContent).toContain('Insertion Sort running')

    vi.runAllTimers()

    expect(root.querySelector('#algorithm-debug-summary')?.textContent).toContain('finished')
    expect(root.querySelector('#selected-algorithm-description')?.textContent).toContain('Insertion Sort')
  })

  it('keeps playback controls stable through start, pause, resume, and reset', () => {
    const root = document.querySelector<HTMLDivElement>('#app')

    if (!root) {
      throw new Error('Test root not found')
    }

    bootstrapApp(root, {
      autoplay: false,
      defaultArraySize: 18,
      defaultSpeed: 65,
      previewOptions: {
        minValue: 1,
        maxValue: 50,
        random: sequenceRandom([0.8, 0.1, 0.5, 0.3, 0.6]),
      },
    })

    const startButton = root.querySelector<HTMLButtonElement>('#start-button')
    const pauseButton = root.querySelector<HTMLButtonElement>('#pause-button')
    const resumeButton = root.querySelector<HTMLButtonElement>('#resume-button')
    const resetButton = root.querySelector<HTMLButtonElement>('#reset-button')

    if (!startButton || !pauseButton || !resumeButton || !resetButton) {
      throw new Error('Expected playback controls to exist')
    }

    startButton.click()
    const runningSummary = root.querySelector('#algorithm-debug-summary')?.textContent
    expect(runningSummary).toContain('running')

    pauseButton.click()
    const pausedSummary = root.querySelector('#algorithm-debug-summary')?.textContent
    expect(pausedSummary).toContain('paused')

    vi.advanceTimersByTime(500)
    expect(root.querySelector('#algorithm-debug-summary')?.textContent).toBe(pausedSummary)

    resumeButton.click()
    expect(root.querySelector('#algorithm-debug-summary')?.textContent).toContain('running')

    resetButton.click()
    expect(root.querySelector('#algorithm-debug-summary')?.textContent).toContain('idle at step 1/')
    expect(root.dataset.status).toBe('idle')
  })

  it('keeps randomize and size/speed interactions consistent', () => {
    const root = document.querySelector<HTMLDivElement>('#app')

    if (!root) {
      throw new Error('Test root not found')
    }

    bootstrapApp(root, {
      autoplay: false,
      defaultArraySize: 10,
      defaultSpeed: 45,
      previewOptions: {
        minValue: 10,
        maxValue: 99,
        random: sequenceRandom([0.2, 0.6, 0.1, 0.8, 0.4, 0.9]),
      },
    })

    const arraySizeSlider = root.querySelector<HTMLInputElement>('#array-size-slider')
    const speedSlider = root.querySelector<HTMLInputElement>('#speed-slider')
    const randomizeButton = root.querySelector<HTMLButtonElement>('#randomize-button')
    const startButton = root.querySelector<HTMLButtonElement>('#start-button')

    if (!arraySizeSlider || !speedSlider || !randomizeButton || !startButton) {
      throw new Error('Expected array and speed controls to exist')
    }

    arraySizeSlider.value = '24'
    arraySizeSlider.dispatchEvent(new Event('input'))
    speedSlider.value = '88'
    speedSlider.dispatchEvent(new Event('input'))

    randomizeButton.click()
    const summaryAfterRandomize = root.querySelector('#algorithm-debug-summary')?.textContent

    expect(summaryAfterRandomize).toContain('idle at step 1/')
    expect(root.querySelector('#algorithm-debug-meta')?.textContent).toContain('Size: 24')
    expect(root.querySelector('#algorithm-debug-meta')?.textContent).toContain('Speed: 88')

    startButton.click()

    expect(arraySizeSlider.disabled).toBe(true)
    expect(speedSlider.disabled).toBe(false)
    expect(randomizeButton.disabled).toBe(true)
  })
})
