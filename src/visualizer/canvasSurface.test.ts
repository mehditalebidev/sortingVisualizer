import { describe, expect, it, vi } from 'vitest'

import {
  configureCanvasSurface,
  getPixelRatio,
  getResponsiveDimensions,
} from '@/visualizer/canvasSurface'

describe('canvas surface', () => {
  it('normalizes pixel ratio to a safe value', () => {
    expect(getPixelRatio(2)).toBe(2)
    expect(getPixelRatio(0)).toBe(1)
    expect(getPixelRatio(-1)).toBe(1)
  })

  it('configures canvas size and transform with pixel ratio', () => {
    const canvas = document.createElement('canvas')
    const setTransform = vi.fn()

    vi.spyOn(canvas, 'getContext').mockImplementation(() => {
      return {
        setTransform,
      } as unknown as CanvasRenderingContext2D
    })

    const surface = configureCanvasSurface(canvas, { width: 200, height: 100 }, 2)

    expect(surface.cssWidth).toBe(200)
    expect(surface.cssHeight).toBe(100)
    expect(canvas.width).toBe(400)
    expect(canvas.height).toBe(200)
    expect(setTransform).toHaveBeenCalledWith(2, 0, 0, 2, 0, 0)
  })

  it('throws when canvas context cannot be initialized', () => {
    const canvas = document.createElement('canvas')
    vi.spyOn(canvas, 'getContext').mockReturnValue(null)

    expect(() => configureCanvasSurface(canvas, { width: 10, height: 10 }, 1)).toThrowError(
      'Unable to initialize 2D canvas context',
    )
  })

  it('measures responsive dimensions using fallback ratio', () => {
    const canvas = document.createElement('canvas')

    vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({
      width: 600,
      height: 0,
      x: 0,
      y: 0,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      toJSON: () => ({}),
    })

    expect(getResponsiveDimensions(canvas, { width: 900, height: 450 })).toEqual({
      width: 600,
      height: 300,
    })
  })
})
