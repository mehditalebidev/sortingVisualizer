import type { SortStep } from '@/algorithms'
import type { PlaybackStatus } from '@/state'

export type PlaybackState = {
  status: PlaybackStatus
  stepIndex: number
  step: SortStep
}

export type PlaybackController = {
  start: () => PlaybackState
  tick: () => PlaybackState
  pause: () => PlaybackState
  resume: () => PlaybackState
  complete: () => PlaybackState
  reset: () => PlaybackState
  getState: () => PlaybackState
}

const fallbackStep: SortStep = {
  snapshot: [],
  comparedIndices: [],
  modifiedIndices: [],
  metadata: {
    operation: 'start',
  },
}

const toPlaybackState = (
  steps: readonly SortStep[],
  stepIndex: number,
  status: PlaybackStatus,
): PlaybackState => {
  return {
    status,
    stepIndex,
    step: steps[stepIndex] ?? fallbackStep,
  }
}

export const createPlaybackController = (inputSteps: readonly SortStep[]): PlaybackController => {
  const steps = inputSteps.length > 0 ? [...inputSteps] : [fallbackStep]
  const lastStepIndex = steps.length - 1

  let stepIndex = 0
  let status: PlaybackStatus = 'idle'

  const getState = (): PlaybackState => {
    return toPlaybackState(steps, stepIndex, status)
  }

  const start = (): PlaybackState => {
    stepIndex = 0
    status = steps.length > 1 ? 'running' : 'finished'
    return getState()
  }

  const tick = (): PlaybackState => {
    if (status !== 'running') {
      return getState()
    }

    if (stepIndex < lastStepIndex) {
      stepIndex += 1
    }

    if (stepIndex >= lastStepIndex) {
      status = 'finished'
    }

    return getState()
  }

  const pause = (): PlaybackState => {
    if (status === 'running') {
      status = 'paused'
    }

    return getState()
  }

  const resume = (): PlaybackState => {
    if (status === 'paused') {
      status = 'running'
    }

    return getState()
  }

  const complete = (): PlaybackState => {
    stepIndex = lastStepIndex
    status = 'finished'
    return getState()
  }

  const reset = (): PlaybackState => {
    stepIndex = 0
    status = 'idle'
    return getState()
  }

  return {
    start,
    tick,
    pause,
    resume,
    complete,
    reset,
    getState,
  }
}
