import { describe, expect, it, vi } from 'vitest'

import { createBarDescriptors, renderBarsFrame } from '@/visualizer/barRenderer'
import { defaultVisualSemantics } from '@/visualizer/renderModel'

describe('bar renderer', () => {
  it('returns empty descriptor list for empty snapshots', () => {
    expect(createBarDescriptors([], [], { width: 400, height: 200 })).toEqual([])
  })

  it('computes deterministic descriptors for snapshot values', () => {
    const bars = createBarDescriptors([2, 4, 6], ['neutral', 'compared', 'modified'], {
      width: 300,
      height: 180,
    })

    expect(bars).toHaveLength(3)
    expect(bars[0]?.x).toBeLessThan(bars[1]?.x ?? 0)
    expect(bars[1]?.x).toBeLessThan(bars[2]?.x ?? 0)
    expect(bars[2]?.height).toBeGreaterThan(bars[0]?.height ?? 0)
    expect(bars[1]?.state).toBe('compared')
  })

  it('applies x-offsets for transition rendering', () => {
    const baseBars = createBarDescriptors([2, 4], ['modified', 'modified'], {
      width: 200,
      height: 100,
    })
    const offsetBars = createBarDescriptors(
      [2, 4],
      ['modified', 'modified'],
      {
        width: 200,
        height: 100,
      },
      {
        xOffsets: {
          0: 10,
          1: -10,
        },
      },
    )

    expect(offsetBars[0]?.x).toBe((baseBars[0]?.x ?? 0) + 10)
    expect(offsetBars[1]?.x).toBe((baseBars[1]?.x ?? 0) - 10)
  })

  it('renders frame background and bars', () => {
    const clearRect = vi.fn()
    const fillRect = vi.fn()
    const fillText = vi.fn()
    const context = {
      clearRect,
      fillRect,
      fillText,
      fillStyle: '#000000',
      font: '9px sans-serif',
      textAlign: 'center',
      textBaseline: 'alphabetic',
    } as unknown as CanvasRenderingContext2D

    renderBarsFrame(
      context,
      {
        snapshot: [1, 3],
        states: ['modified', 'completed'],
        labels: [7, 2],
      },
      {
        width: 200,
        height: 100,
      },
      defaultVisualSemantics,
    )

    expect(clearRect).toHaveBeenCalledOnce()
    expect(fillRect).toHaveBeenCalledTimes(3)
    expect(fillText).not.toHaveBeenCalled()
  })

  it('renders interpolated swap transitions', () => {
    const fillRect = vi.fn()
    const fillText = vi.fn()
    const context = {
      clearRect: vi.fn(),
      fillRect,
      fillText,
      fillStyle: '#000000',
      font: '9px sans-serif',
      textAlign: 'center',
      textBaseline: 'alphabetic',
    } as unknown as CanvasRenderingContext2D

    renderBarsFrame(
      context,
      {
        snapshot: [5, 1],
        states: ['modified', 'modified'],
      },
      {
        width: 200,
        height: 120,
      },
      defaultVisualSemantics,
      {
        fromSnapshot: [1, 5],
        progress: 0.5,
        operation: 'swap',
        comparedIndices: [0, 1],
        modifiedIndices: [0, 1],
      },
    )

    const firstBarX = fillRect.mock.calls[1]?.[0] as number
    const secondBarX = fillRect.mock.calls[2]?.[0] as number
    const firstBarHeight = fillRect.mock.calls[1]?.[3] as number
    const secondBarHeight = fillRect.mock.calls[2]?.[3] as number

    expect(firstBarX).toBeGreaterThan(12)
    expect(secondBarX).toBeLessThan(101)
    expect(firstBarHeight).toBeLessThan(secondBarHeight)
  })

  it('renders insertion shift transitions as positional movement', () => {
    const fillRect = vi.fn()
    const fillText = vi.fn()
    const context = {
      clearRect: vi.fn(),
      fillRect,
      fillText,
      fillStyle: '#000000',
      font: '9px sans-serif',
      textAlign: 'center',
      textBaseline: 'alphabetic',
    } as unknown as CanvasRenderingContext2D

    renderBarsFrame(
      context,
      {
        snapshot: [3, 1, 4, 5],
        states: ['neutral', 'modified', 'modified', 'neutral'],
      },
      {
        width: 320,
        height: 120,
      },
      defaultVisualSemantics,
      {
        fromSnapshot: [3, 4, 1, 5],
        progress: 0.5,
        operation: 'shift',
        comparedIndices: [1, 2],
        modifiedIndices: [1, 2],
      },
    )

    const secondBarX = fillRect.mock.calls[2]?.[0] as number
    const thirdBarX = fillRect.mock.calls[3]?.[0] as number
    const secondBarHeight = fillRect.mock.calls[2]?.[3] as number
    const thirdBarHeight = fillRect.mock.calls[3]?.[3] as number

    expect(secondBarX).toBeGreaterThan(89)
    expect(thirdBarX).toBeLessThan(165)
    expect(secondBarHeight).toBeGreaterThan(thirdBarHeight)
  })

  it('uses positional motion for insertion-style writes', () => {
    const fillRect = vi.fn()
    const fillText = vi.fn()
    const context = {
      clearRect: vi.fn(),
      fillRect,
      fillText,
      fillStyle: '#000000',
      font: '9px sans-serif',
      textAlign: 'center',
      textBaseline: 'alphabetic',
    } as unknown as CanvasRenderingContext2D

    renderBarsFrame(
      context,
      {
        snapshot: [1, 3, 5],
        states: ['neutral', 'modified', 'neutral'],
      },
      {
        width: 300,
        height: 120,
      },
      defaultVisualSemantics,
      {
        fromSnapshot: [3, 1, 5],
        progress: 0.5,
        operation: 'write',
        comparedIndices: [0, 1],
        modifiedIndices: [1],
      },
    )

    const firstBarHeight = fillRect.mock.calls[1]?.[3] as number
    const secondBarHeight = fillRect.mock.calls[2]?.[3] as number
    const firstBarX = fillRect.mock.calls[1]?.[0] as number
    const secondBarX = fillRect.mock.calls[2]?.[0] as number

    expect(firstBarHeight).toBeGreaterThan(secondBarHeight)
    expect(firstBarX).toBeGreaterThan(12)
    expect(secondBarX).toBeCloseTo(105, 0)
  })
})
