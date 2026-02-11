export type PlaybackStatus = 'idle' | 'running' | 'paused' | 'finished'

export type AppState = {
  status: PlaybackStatus
}

export const initialState: AppState = {
  status: 'idle',
}

export type { PlaybackAction, ControlAvailability, ControlId } from '@/state/controlState'
export {
  getAllowedPlaybackActions,
  getControlAvailability,
  isPlaybackActionAllowed,
  transitionPlaybackStatus,
} from '@/state/controlState'
export {
  defaultPlaybackIntervalRange,
  defaultSpeedRange,
  mapSpeedToPlaybackIntervalMs,
  resolvePlaybackCadence,
} from '@/state/speed'
export type { PlaybackCadence, PlaybackIntervalRange, SpeedRange } from '@/state/speed'
