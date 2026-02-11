import type { PlaybackStatus } from '@/state'

export type PlaybackAction = 'start' | 'pause' | 'resume' | 'reset' | 'finish'

export type ControlId =
  | 'algorithmSelect'
  | 'arraySize'
  | 'speed'
  | 'randomize'
  | 'start'
  | 'pause'
  | 'resume'
  | 'reset'

export type ControlAvailability = Record<ControlId, boolean>

type TransitionMatrix = Record<PlaybackStatus, Partial<Record<PlaybackAction, PlaybackStatus>>>

const transitionMatrix: TransitionMatrix = {
  idle: {
    start: 'running',
    reset: 'idle',
  },
  running: {
    pause: 'paused',
    reset: 'idle',
    finish: 'finished',
  },
  paused: {
    resume: 'running',
    reset: 'idle',
    finish: 'finished',
  },
  finished: {
    start: 'running',
    reset: 'idle',
  },
}

const controlAvailabilityByStatus: Record<PlaybackStatus, ControlAvailability> = {
  idle: {
    algorithmSelect: true,
    arraySize: true,
    speed: true,
    randomize: true,
    start: true,
    pause: false,
    resume: false,
    reset: false,
  },
  running: {
    algorithmSelect: false,
    arraySize: false,
    speed: true,
    randomize: false,
    start: false,
    pause: true,
    resume: false,
    reset: true,
  },
  paused: {
    algorithmSelect: false,
    arraySize: false,
    speed: true,
    randomize: false,
    start: false,
    pause: false,
    resume: true,
    reset: true,
  },
  finished: {
    algorithmSelect: true,
    arraySize: true,
    speed: true,
    randomize: true,
    start: true,
    pause: false,
    resume: false,
    reset: true,
  },
}

export const getAllowedPlaybackActions = (status: PlaybackStatus): PlaybackAction[] => {
  return Object.keys(transitionMatrix[status]) as PlaybackAction[]
}

export const isPlaybackActionAllowed = (status: PlaybackStatus, action: PlaybackAction): boolean => {
  return transitionMatrix[status][action] !== undefined
}

export const transitionPlaybackStatus = (status: PlaybackStatus, action: PlaybackAction): PlaybackStatus => {
  return transitionMatrix[status][action] ?? status
}

export const getControlAvailability = (status: PlaybackStatus): ControlAvailability => {
  return {
    ...controlAvailabilityByStatus[status],
  }
}
