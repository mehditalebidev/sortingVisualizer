import { describe, expect, it, vi } from 'vitest'

import type { SortStep } from '@/algorithms'
import { createSoundEngine, mapValueToFrequency, pickSoundingIndex } from '@/app/sound'

const createFakeAudioContext = (state: AudioContextState = 'running') => {
  const oscillators: { frequency: { setValueAtTime: ReturnType<typeof vi.fn> }; start: ReturnType<typeof vi.fn> }[] = []
  const context = {
    currentTime: 0,
    destination: {},
    state,
    resume: vi.fn(() => Promise.resolve()),
    createOscillator: vi.fn(() => {
      const oscillator = {
        type: 'sine',
        frequency: { setValueAtTime: vi.fn() },
        connect: vi.fn(),
        start: vi.fn(),
        stop: vi.fn(),
      }
      oscillators.push(oscillator)
      return oscillator
    }),
    createGain: vi.fn(() => ({
      gain: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
      connect: vi.fn(),
    })),
  }

  return { context: context as unknown as AudioContext, oscillators, raw: context }
}

const step = (snapshot: number[], compared: number[], modified: number[]): SortStep => ({
  snapshot,
  comparedIndices: compared,
  modifiedIndices: modified,
})

describe('sound engine', () => {
  it('maps values to an audible frequency range', () => {
    expect(mapValueToFrequency(0, 0, 10)).toBe(180)
    expect(mapValueToFrequency(10, 0, 10)).toBe(1100)
    expect(mapValueToFrequency(50, 0, 10)).toBe(1100)
    expect(mapValueToFrequency(4, 4, 4)).toBe(640)
  })

  it('prefers modified indices, then the last compared index', () => {
    expect(pickSoundingIndex(step([1, 2, 3], [0, 1], [2]))).toBe(2)
    expect(pickSoundingIndex(step([1, 2, 3], [0, 1], []))).toBe(1)
    expect(pickSoundingIndex(step([1, 2, 3], [], []))).toBeUndefined()
  })

  it('stays silent until enabled and never creates audio context early', () => {
    const factory = vi.fn(() => createFakeAudioContext().context)
    const engine = createSoundEngine({ createAudioContext: factory })

    engine.playStep(step([1, 5], [0, 1], []), 1, 5)
    engine.playFinish()

    expect(engine.isEnabled()).toBe(false)
    expect(factory).not.toHaveBeenCalled()
  })

  it('plays throttled blips and a finish arpeggio once enabled', () => {
    const fake = createFakeAudioContext('suspended')
    let nowMs = 0
    const engine = createSoundEngine({ createAudioContext: () => fake.context, now: () => nowMs, minIntervalMs: 20 })

    engine.setEnabled(true)
    expect(fake.raw.resume).toHaveBeenCalled()

    engine.playStep(step([1, 5], [0, 1], []), 1, 5)
    engine.playStep(step([1, 5], [0, 1], []), 1, 5)
    expect(fake.oscillators).toHaveLength(1)
    expect(fake.oscillators[0]?.frequency.setValueAtTime).toHaveBeenCalledWith(1100, 0)

    nowMs = 50
    engine.playStep(step([1, 5], [], []), 1, 5)
    expect(fake.oscillators).toHaveLength(1)

    engine.playStep(step([1, 5], [], [0]), 1, 5)
    expect(fake.oscillators).toHaveLength(2)

    engine.playFinish()
    expect(fake.oscillators).toHaveLength(6)

    engine.setEnabled(false)
    engine.playFinish()
    expect(fake.oscillators).toHaveLength(6)
  })

  it('degrades gracefully when audio is unavailable or throws', () => {
    const unavailable = createSoundEngine({ createAudioContext: () => undefined })
    unavailable.setEnabled(true)
    expect(() => unavailable.playFinish()).not.toThrow()

    const throwing = createSoundEngine({
      createAudioContext: () => {
        throw new Error('blocked')
      },
    })
    throwing.setEnabled(true)
    expect(() => throwing.playStep(step([1, 2], [0, 1], []), 1, 2)).not.toThrow()
  })

  it('falls back to the browser audio context constructor', () => {
    const fake = createFakeAudioContext()
    const ctor = vi.fn(function FakeAudioContext() {
      return fake.raw
    })
    vi.stubGlobal('AudioContext', ctor)

    const engine = createSoundEngine()
    engine.setEnabled(true)
    engine.playFinish()

    expect(ctor).toHaveBeenCalledOnce()
    expect(fake.oscillators).toHaveLength(4)
    vi.unstubAllGlobals()

    vi.stubGlobal('AudioContext', undefined)
    const silent = createSoundEngine()
    expect(() => silent.setEnabled(true)).not.toThrow()
    vi.unstubAllGlobals()
  })
})
