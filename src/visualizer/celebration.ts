import type { BarVisualState } from '@/visualizer/renderModel'
import type { RenderDimensions } from '@/visualizer/barRenderer'

export type ConfettiParticle = {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  color: string
  spin: number
}

export type CelebrationOptions = {
  startedAtMs: number
  dimensions: RenderDimensions
  random?: () => number
  particleCount?: number
  sweepMs?: number
  durationMs?: number
}

export type Celebration = {
  isActive: (nowMs: number) => boolean
  getSweepProgress: (nowMs: number) => number
  applySweep: (states: readonly BarVisualState[], nowMs: number) => BarVisualState[]
  draw: (context: CanvasRenderingContext2D, nowMs: number) => void
}

export const confettiColors = ['#ff4d8d', '#fde047', '#38e1ff', '#a78bfa', '#34d399', '#fb923c'] as const

// Gravity scales with canvas height so confetti arcs look the same on any size.
const GRAVITY_HEIGHTS_PER_S2 = 2.4
const DEFAULT_PARTICLE_COUNT = 90
const DEFAULT_SWEEP_MS = 650
const DEFAULT_DURATION_MS = 2600

const createParticles = (
  count: number,
  dimensions: RenderDimensions,
  random: () => number,
): ConfettiParticle[] => {
  return Array.from({ length: count }, (_, index) => {
    // Launch from two cannons at the bottom corners toward the middle.
    const fromLeft = index % 2 === 0
    const angle = (fromLeft ? -1 : 1) * (0.18 + random() * 0.5)
    const speed = dimensions.height * (1.3 + random() * 0.9)

    return {
      x: fromLeft ? dimensions.width * 0.04 : dimensions.width * 0.96,
      y: dimensions.height,
      vx: Math.sin(angle) * speed * -1,
      vy: -Math.cos(angle) * speed,
      size: 4 + random() * 5,
      color: confettiColors[index % confettiColors.length] ?? '#ffffff',
      spin: 4 + random() * 10,
    }
  })
}

export const createCelebration = (options: CelebrationOptions): Celebration => {
  const random = options.random ?? Math.random
  const sweepMs = Math.max(1, options.sweepMs ?? DEFAULT_SWEEP_MS)
  const durationMs = Math.max(sweepMs, options.durationMs ?? DEFAULT_DURATION_MS)
  const particles = createParticles(options.particleCount ?? DEFAULT_PARTICLE_COUNT, options.dimensions, random)

  const gravity = options.dimensions.height * GRAVITY_HEIGHTS_PER_S2

  const elapsed = (nowMs: number): number => Math.max(0, nowMs - options.startedAtMs)

  const isActive = (nowMs: number): boolean => elapsed(nowMs) < durationMs

  const getSweepProgress = (nowMs: number): number => Math.min(1, elapsed(nowMs) / sweepMs)

  const applySweep = (states: readonly BarVisualState[], nowMs: number): BarVisualState[] => {
    const progress = getSweepProgress(nowMs)

    if (progress >= 1) {
      return [...states]
    }

    const frontier = Math.floor(progress * states.length)

    return states.map((state, index) => {
      if (index < frontier) {
        return state
      }

      return index === frontier ? 'compared' : 'neutral'
    })
  }

  const draw = (context: CanvasRenderingContext2D, nowMs: number): void => {
    const elapsedMs = elapsed(nowMs)

    if (elapsedMs >= durationMs) {
      return
    }

    const seconds = elapsedMs / 1000
    const fade = 1 - elapsedMs / durationMs
    const previousAlpha = context.globalAlpha

    context.globalAlpha = Math.max(0, Math.min(1, fade * 1.4))

    for (const particle of particles) {
      const x = particle.x + particle.vx * seconds
      const y = particle.y + particle.vy * seconds + 0.5 * gravity * seconds * seconds

      if (y > options.dimensions.height + particle.size) {
        continue
      }

      // Fake a tumbling ribbon by squashing the height over time.
      const tumble = Math.abs(Math.cos(seconds * particle.spin))
      context.fillStyle = particle.color
      context.fillRect(x, y, particle.size, Math.max(1, particle.size * tumble))
    }

    context.globalAlpha = previousAlpha
  }

  return {
    isActive,
    getSweepProgress,
    applySweep,
    draw,
  }
}
