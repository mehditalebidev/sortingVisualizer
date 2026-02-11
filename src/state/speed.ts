export type SpeedRange = {
  min: number
  max: number
}

export type PlaybackIntervalRange = {
  fastMs: number
  slowMs: number
}

export type PlaybackCadence = {
  intervalMs: number
  stepsPerTick: number
}

export const defaultSpeedRange: SpeedRange = {
  min: 0,
  max: 100,
}

export const defaultPlaybackIntervalRange: PlaybackIntervalRange = {
  fastMs: 1,
  slowMs: 700,
}

const clamp = (value: number, min: number, max: number): number => {
  return Math.max(min, Math.min(max, value))
}

export const mapSpeedToPlaybackIntervalMs = (
  speed: number,
  speedRange: SpeedRange = defaultSpeedRange,
  intervalRange: PlaybackIntervalRange = defaultPlaybackIntervalRange,
): number => {
  const normalizedSpeed = clamp(speed, speedRange.min, speedRange.max)
  const speedSpan = speedRange.max - speedRange.min

  if (speedSpan === 0) {
    return intervalRange.fastMs
  }

  const progress = (normalizedSpeed - speedRange.min) / speedSpan
  const safeSlow = Math.max(intervalRange.slowMs, 1)
  const safeFast = Math.max(Math.min(intervalRange.fastMs, safeSlow), 1)
  const intervalRatio = safeFast / safeSlow
  const interval = safeSlow * Math.pow(intervalRatio, progress)

  return Math.round(interval)
}

export const resolvePlaybackCadence = (
  speed: number,
  arraySize: number,
  speedRange: SpeedRange = defaultSpeedRange,
): PlaybackCadence => {
  const intervalMs = mapSpeedToPlaybackIntervalMs(speed, speedRange)
  const normalizedSpeed = clamp(speed, speedRange.min, speedRange.max)
  const size = Math.max(1, Math.round(arraySize))

  let stepsPerTick = 1

  if (normalizedSpeed >= 75) {
    stepsPerTick += 1
  }

  if (normalizedSpeed >= 90) {
    stepsPerTick += 2
  }

  if (normalizedSpeed >= 97) {
    stepsPerTick += 2
  }

  if (size >= 120 && normalizedSpeed >= 70) {
    stepsPerTick += 1
  }

  if (size >= 170 && normalizedSpeed >= 85) {
    stepsPerTick += 1
  }

  if (size >= 300 && normalizedSpeed >= 85) {
    stepsPerTick += 2
  }

  if (size >= 600 && normalizedSpeed >= 90) {
    stepsPerTick += 3
  }

  if (size >= 900 && normalizedSpeed >= 95) {
    stepsPerTick += 4
  }

  return {
    intervalMs,
    stepsPerTick,
  }
}
