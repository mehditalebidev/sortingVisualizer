import { afterEach, describe, expect, it, vi } from 'vitest'

import { bootstrapComparePage } from '@/app/compareBootstrap'

describe('bootstrapComparePage', () => {
  const mockCanvas = (): void => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(() => {
      return {
        clearRect: vi.fn(),
        fillRect: vi.fn(),
        fillText: vi.fn(),
        setTransform: vi.fn(),
      } as unknown as CanvasRenderingContext2D
    })
  }

  it('renders metadata headers and canvases for default selected algorithms', () => {
    mockCanvas()
    document.body.innerHTML = '<div id="app"></div>'

    const root = document.querySelector<HTMLDivElement>('#app')

    if (!root) {
      throw new Error('Test root not found')
    }

    bootstrapComparePage(root)

    expect(root.querySelectorAll('.compare-panel')).toHaveLength(2)
    expect(root.querySelector('.compare-panel[data-algorithm-id="bubble-sort"]')?.textContent).toContain(
      'Best O(n)',
    )
    expect(
      root.querySelector('.compare-panel[data-algorithm-id="insertion-sort"]')?.textContent,
    ).toContain('Average O(n^2)')
    expect(root.querySelectorAll('.compare-canvas')).toHaveLength(2)
  })

  it('updates panel count and metadata when checkbox selection changes', () => {
    mockCanvas()
    document.body.innerHTML = '<div id="app"></div>'

    const root = document.querySelector<HTMLDivElement>('#app')

    if (!root) {
      throw new Error('Test root not found')
    }

    bootstrapComparePage(root)

    const quickSortCheckbox = root.querySelector<HTMLInputElement>('#compare-algorithm-quick-sort')

    if (!quickSortCheckbox) {
      throw new Error('Quick Sort checkbox not found')
    }

    quickSortCheckbox.click()
    expect(root.querySelectorAll('.compare-panel')).toHaveLength(3)
    expect(root.querySelector('.compare-panel[data-algorithm-id="quick-sort"]')?.textContent).toContain(
      'Worst O(n^2)',
    )
  })

  it('prevents empty algorithm selection by re-checking the final unchecked item', () => {
    mockCanvas()
    document.body.innerHTML = '<div id="app"></div>'

    const root = document.querySelector<HTMLDivElement>('#app')

    if (!root) {
      throw new Error('Test root not found')
    }

    bootstrapComparePage(root)

    const bubble = root.querySelector<HTMLInputElement>('#compare-algorithm-bubble-sort')
    const insertion = root.querySelector<HTMLInputElement>('#compare-algorithm-insertion-sort')

    if (!bubble || !insertion) {
      throw new Error('Default checkboxes not found')
    }

    bubble.click()
    insertion.click()

    const checked = root.querySelectorAll<HTMLInputElement>(
      '#compare-algorithm-selector input[type="checkbox"]:checked',
    )
    expect(checked.length).toBe(1)
    expect(root.querySelectorAll('.compare-panel')).toHaveLength(1)
  })

  it('fans out start pause resume and reset controls across compare session', () => {
    mockCanvas()
    vi.useFakeTimers()
    document.body.innerHTML = '<div id="app"></div>'

    const root = document.querySelector<HTMLDivElement>('#app')

    if (!root) {
      throw new Error('Test root not found')
    }

    bootstrapComparePage(root)

    const startButton = root.querySelector<HTMLButtonElement>('#compare-start-button')
    const pauseButton = root.querySelector<HTMLButtonElement>('#compare-pause-button')
    const resumeButton = root.querySelector<HTMLButtonElement>('#compare-resume-button')
    const resetButton = root.querySelector<HTMLButtonElement>('#compare-reset-button')

    startButton?.click()
    expect(root.dataset.status).toBe('running')

    pauseButton?.click()
    expect(root.dataset.status).toBe('paused')

    resumeButton?.click()
    expect(root.dataset.status).toBe('running')

    resetButton?.click()
    expect(root.dataset.status).toBe('idle')

    vi.useRealTimers()
  })

  it('keeps idle state when pause or resume are triggered before start', () => {
    mockCanvas()
    document.body.innerHTML = '<div id="app"></div>'

    const root = document.querySelector<HTMLDivElement>('#app')

    if (!root) {
      throw new Error('Test root not found')
    }

    bootstrapComparePage(root)

    root.querySelector<HTMLButtonElement>('#compare-pause-button')?.click()
    expect(root.dataset.status).toBe('idle')

    root.querySelector<HTMLButtonElement>('#compare-resume-button')?.click()
    expect(root.dataset.status).toBe('idle')
  })

  it('restarts timer cadence when speed changes during running session', () => {
    mockCanvas()
    vi.useFakeTimers()
    const setIntervalSpy = vi.spyOn(window, 'setInterval')

    document.body.innerHTML = '<div id="app"></div>'

    const root = document.querySelector<HTMLDivElement>('#app')

    if (!root) {
      throw new Error('Test root not found')
    }

    bootstrapComparePage(root)

    root.querySelector<HTMLButtonElement>('#compare-start-button')?.click()

    const speedSlider = root.querySelector<HTMLInputElement>('#compare-speed-slider')

    if (!speedSlider) {
      throw new Error('Speed slider not found')
    }

    speedSlider.value = '92'
    speedSlider.dispatchEvent(new Event('input'))

    expect(setIntervalSpy).toHaveBeenCalledTimes(2)
  })

  it('supports randomize and speed changes while preserving synchronized panel wiring', () => {
    mockCanvas()
    vi.useFakeTimers()
    document.body.innerHTML = '<div id="app"></div>'

    const root = document.querySelector<HTMLDivElement>('#app')

    if (!root) {
      throw new Error('Test root not found')
    }

    bootstrapComparePage(root)

    const speedSlider = root.querySelector<HTMLInputElement>('#compare-speed-slider')
    const randomizeButton = root.querySelector<HTMLButtonElement>('#compare-randomize-button')
    const runStatusBefore = root.querySelector('#compare-input-status')?.textContent

    if (!speedSlider || !randomizeButton) {
      throw new Error('Expected controls not found')
    }

    speedSlider.value = '95'
    speedSlider.dispatchEvent(new Event('input'))
    expect(root.querySelector('#compare-speed-value')?.textContent).toBe('95')

    randomizeButton.click()
    expect(root.querySelector('#compare-input-status')?.textContent).not.toBe(runStatusBefore)
    expect(root.querySelectorAll('.compare-panel').length).toBeGreaterThanOrEqual(1)

    vi.useRealTimers()
  })
})
  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })
