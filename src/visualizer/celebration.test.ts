import { describe, expect, it, vi } from 'vitest'

import { confettiColors, createCelebration } from '@/visualizer/celebration'

const createContext = () => ({
  fillRect: vi.fn(),
  fillStyle: '#000000' as string,
  globalAlpha: 1,
})

describe('celebration', () => {
  const dimensions = { width: 400, height: 200 }

  it('stays active for its duration and reports sweep progress', () => {
    const celebration = createCelebration({ startedAtMs: 1000, dimensions, sweepMs: 500, durationMs: 2000 })

    expect(celebration.isActive(1000)).toBe(true)
    expect(celebration.getSweepProgress(900)).toBe(0)
    expect(celebration.getSweepProgress(1250)).toBeCloseTo(0.5)
    expect(celebration.getSweepProgress(5000)).toBe(1)
    expect(celebration.isActive(2999)).toBe(true)
    expect(celebration.isActive(3000)).toBe(false)
  })

  it('sweeps completed state across bars with a highlighted frontier', () => {
    const celebration = createCelebration({ startedAtMs: 0, dimensions, sweepMs: 100 })
    const completed = Array.from({ length: 4 }, () => 'completed' as const)

    expect(celebration.applySweep(completed, 0)).toEqual(['compared', 'neutral', 'neutral', 'neutral'])
    expect(celebration.applySweep(completed, 50)).toEqual(['completed', 'completed', 'compared', 'neutral'])
    expect(celebration.applySweep(completed, 100)).toEqual(completed)
  })

  it('draws colorful confetti that fades and restores alpha', () => {
    const context = createContext()
    const celebration = createCelebration({
      startedAtMs: 0,
      dimensions,
      particleCount: 6,
      random: () => 0.5,
      durationMs: 1000,
    })

    celebration.draw(context as unknown as CanvasRenderingContext2D, 100)

    expect(context.fillRect).toHaveBeenCalledTimes(6)
    expect(confettiColors).toContain(context.fillStyle)
    expect(context.globalAlpha).toBe(1)

    context.fillRect.mockClear()
    celebration.draw(context as unknown as CanvasRenderingContext2D, 1000)
    expect(context.fillRect).not.toHaveBeenCalled()
  })

  it('skips particles that already fell below the canvas', () => {
    const context = createContext()
    const celebration = createCelebration({
      startedAtMs: 0,
      dimensions,
      particleCount: 4,
      random: () => 0,
      durationMs: 60_000,
    })

    celebration.draw(context as unknown as CanvasRenderingContext2D, 20_000)

    expect(context.fillRect).not.toHaveBeenCalled()
  })

  it('uses default timings and random source when omitted', () => {
    const celebration = createCelebration({ startedAtMs: 0, dimensions })

    expect(celebration.isActive(2000)).toBe(true)
    expect(celebration.getSweepProgress(650)).toBe(1)
  })
})
