import type { SortStep } from '@/algorithms'

type AudioContextLike = Pick<AudioContext, 'createOscillator' | 'createGain' | 'currentTime' | 'destination' | 'state' | 'resume'>

export type SoundEngine = {
  isEnabled: () => boolean
  setEnabled: (enabled: boolean) => void
  playStep: (step: SortStep, minValue: number, maxValue: number) => void
  playFinish: () => void
}

export type SoundEngineOptions = {
  createAudioContext?: () => AudioContextLike | undefined
  now?: () => number
  minIntervalMs?: number
}

const MIN_FREQUENCY_HZ = 180
const MAX_FREQUENCY_HZ = 1100
const BLIP_GAIN = 0.035
const FINISH_NOTES_HZ = [523.25, 659.25, 783.99, 1046.5]

const defaultAudioContextFactory = (): AudioContextLike | undefined => {
  const AudioContextCtor =
    window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext

  return AudioContextCtor ? new AudioContextCtor() : undefined
}

export const mapValueToFrequency = (value: number, minValue: number, maxValue: number): number => {
  const span = maxValue - minValue
  const ratio = span > 0 ? Math.max(0, Math.min(1, (value - minValue) / span)) : 0.5

  return MIN_FREQUENCY_HZ + (MAX_FREQUENCY_HZ - MIN_FREQUENCY_HZ) * ratio
}

export const pickSoundingIndex = (step: SortStep): number | undefined => {
  return step.modifiedIndices[0] ?? step.comparedIndices[step.comparedIndices.length - 1]
}

export const createSoundEngine = (options: SoundEngineOptions = {}): SoundEngine => {
  const createAudioContext = options.createAudioContext ?? defaultAudioContextFactory
  const now = options.now ?? (() => window.performance.now())
  const minIntervalMs = options.minIntervalMs ?? 18

  let enabled = false
  let audioContext: AudioContextLike | undefined
  let lastBlipAtMs = Number.NEGATIVE_INFINITY

  const ensureContext = (): AudioContextLike | undefined => {
    if (!audioContext) {
      try {
        audioContext = createAudioContext()
      } catch {
        audioContext = undefined
      }
    }

    if (audioContext?.state === 'suspended') {
      void audioContext.resume().catch(() => undefined)
    }

    return audioContext
  }

  const tone = (frequency: number, startOffsetS: number, durationS: number, gainLevel: number): void => {
    const context = ensureContext()

    if (!context) {
      return
    }

    const startAt = context.currentTime + startOffsetS
    const oscillator = context.createOscillator()
    const gain = context.createGain()

    oscillator.type = 'triangle'
    oscillator.frequency.setValueAtTime(frequency, startAt)
    gain.gain.setValueAtTime(gainLevel, startAt)
    gain.gain.exponentialRampToValueAtTime(0.0001, startAt + durationS)
    oscillator.connect(gain)
    gain.connect(context.destination)
    oscillator.start(startAt)
    oscillator.stop(startAt + durationS)
  }

  const setEnabled = (nextEnabled: boolean): void => {
    enabled = nextEnabled

    if (enabled) {
      // Must be created from a user gesture for browsers' autoplay policies.
      ensureContext()
    }
  }

  const playStep = (step: SortStep, minValue: number, maxValue: number): void => {
    if (!enabled) {
      return
    }

    const index = pickSoundingIndex(step)
    const value = index === undefined ? undefined : step.snapshot[index]

    if (value === undefined) {
      return
    }

    const timestamp = now()

    if (timestamp - lastBlipAtMs < minIntervalMs) {
      return
    }

    lastBlipAtMs = timestamp
    tone(mapValueToFrequency(value, minValue, maxValue), 0, 0.07, BLIP_GAIN)
  }

  const playFinish = (): void => {
    if (!enabled) {
      return
    }

    FINISH_NOTES_HZ.forEach((frequency, index) => {
      tone(frequency, index * 0.09, 0.22, BLIP_GAIN * 1.6)
    })
  }

  return {
    isEnabled: () => enabled,
    setEnabled,
    playStep,
    playFinish,
  }
}
