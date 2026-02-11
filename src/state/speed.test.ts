import { describe, expect, it } from 'vitest'

import { mapSpeedToPlaybackIntervalMs, resolvePlaybackCadence } from '@/state'

describe('mapSpeedToPlaybackIntervalMs', () => {
  it('maps low speed to slow cadence and high speed to fast cadence', () => {
    expect(mapSpeedToPlaybackIntervalMs(0)).toBe(700)
    expect(mapSpeedToPlaybackIntervalMs(100)).toBe(1)
  })

  it('clamps out-of-range values deterministically', () => {
    expect(mapSpeedToPlaybackIntervalMs(-20)).toBe(700)
    expect(mapSpeedToPlaybackIntervalMs(140)).toBe(1)
  })

  it('supports custom ranges with exponential scaling', () => {
    expect(mapSpeedToPlaybackIntervalMs(50, { min: 0, max: 100 }, { fastMs: 10, slowMs: 810 })).toBe(90)
  })

  it('changes much faster near the high-speed end', () => {
    const lowBandDelta = mapSpeedToPlaybackIntervalMs(0) - mapSpeedToPlaybackIntervalMs(20)
    const highBandDelta = mapSpeedToPlaybackIntervalMs(80) - mapSpeedToPlaybackIntervalMs(100)

    expect(highBandDelta).toBeLessThan(lowBandDelta)
    expect(mapSpeedToPlaybackIntervalMs(80)).toBeLessThan(40)
  })
})

describe('resolvePlaybackCadence', () => {
  it('returns single-step cadence at low and medium speeds', () => {
    expect(resolvePlaybackCadence(20, 80)).toEqual({
      intervalMs: mapSpeedToPlaybackIntervalMs(20),
      stepsPerTick: 1,
    })

    expect(resolvePlaybackCadence(74, 100).stepsPerTick).toBe(1)
  })

  it('increases steps per tick at high speeds and larger arrays', () => {
    expect(resolvePlaybackCadence(80, 80).stepsPerTick).toBe(2)
    expect(resolvePlaybackCadence(95, 130).stepsPerTick).toBe(5)
    expect(resolvePlaybackCadence(95, 175).stepsPerTick).toBe(6)
    expect(resolvePlaybackCadence(100, 1000)).toEqual({
      intervalMs: 1,
      stepsPerTick: 17,
    })
  })
})
