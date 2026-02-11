import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { bootstrapApp } from '@/app/bootstrap'

const algorithmIds = ['bubble-sort', 'insertion-sort', 'selection-sort', 'merge-sort', 'quick-sort'] as const

const sequenceRandom = (values: number[]): (() => number) => {
  let index = 0

  return () => {
    const value = values[index % values.length]
    index += 1
    return value ?? 0
  }
}

describe('cross-feature integration consistency', () => {
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

  it.each(algorithmIds)('keeps state transitions and control gating consistent for %s', (algorithmId) => {
    const root = document.querySelector<HTMLDivElement>('#app')

    if (!root) {
      throw new Error('Test root not found')
    }

    bootstrapApp(root, {
      autoplay: false,
      defaultArraySize: 16,
      defaultSpeed: 70,
      previewOptions: {
        minValue: 1,
        maxValue: 20,
        random: sequenceRandom([0.5, 0.2, 0.8, 0.1, 0.6]),
      },
    })

    const algorithmSelect = root.querySelector<HTMLSelectElement>('#algorithm-select')
    const startButton = root.querySelector<HTMLButtonElement>('#start-button')
    const pauseButton = root.querySelector<HTMLButtonElement>('#pause-button')
    const resumeButton = root.querySelector<HTMLButtonElement>('#resume-button')
    const resetButton = root.querySelector<HTMLButtonElement>('#reset-button')
    const randomizeButton = root.querySelector<HTMLButtonElement>('#randomize-button')
    const arraySizeSlider = root.querySelector<HTMLInputElement>('#array-size-slider')

    if (
      !algorithmSelect ||
      !startButton ||
      !pauseButton ||
      !resumeButton ||
      !resetButton ||
      !randomizeButton ||
      !arraySizeSlider
    ) {
      throw new Error('Expected controls to exist')
    }

    algorithmSelect.value = algorithmId
    algorithmSelect.dispatchEvent(new Event('change'))

    const activeCard = root.querySelector<HTMLElement>(`.algorithm-description[data-algorithm-id="${algorithmId}"]`)
    expect(activeCard?.dataset.active).toBe('true')

    startButton.click()
    expect(root.dataset.status).toBe('running')
    expect(algorithmSelect.disabled).toBe(true)
    expect(arraySizeSlider.disabled).toBe(true)
    expect(randomizeButton.disabled).toBe(true)

    pauseButton.click()
    expect(root.dataset.status).toBe('paused')
    expect(resumeButton.disabled).toBe(false)

    resumeButton.click()
    expect(root.dataset.status).toBe('running')

    resetButton.click()
    expect(root.dataset.status).toBe('idle')
    expect(algorithmSelect.disabled).toBe(false)
    expect(arraySizeSlider.disabled).toBe(false)
    expect(randomizeButton.disabled).toBe(false)
  })

  it.each(algorithmIds)('keeps algorithm labels and completion state consistent for %s', (algorithmId) => {
    const root = document.querySelector<HTMLDivElement>('#app')

    if (!root) {
      throw new Error('Test root not found')
    }

    bootstrapApp(root, {
      autoplay: false,
      defaultArraySize: 8,
      defaultSpeed: 100,
      previewOptions: {
        minValue: 1,
        maxValue: 9,
        random: sequenceRandom([0.9, 0.1, 0.6, 0.2]),
      },
    })

    const algorithmSelect = root.querySelector<HTMLSelectElement>('#algorithm-select')
    const startButton = root.querySelector<HTMLButtonElement>('#start-button')

    if (!algorithmSelect || !startButton) {
      throw new Error('Expected controls to exist')
    }

    algorithmSelect.value = algorithmId
    algorithmSelect.dispatchEvent(new Event('change'))
    startButton.click()
    vi.runAllTimers()

    expect(root.querySelector('#algorithm-debug-summary')?.textContent).toContain('finished')
    expect(root.querySelector('#algorithm-debug-summary')?.textContent?.toLowerCase()).toContain(
      algorithmId.replace('-', ' ').replace('-sort', ''),
    )
    expect(root.dataset.status).toBe('finished')
  })
})
