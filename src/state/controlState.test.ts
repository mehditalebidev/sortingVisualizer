import { describe, expect, it } from 'vitest'

import type { PlaybackStatus } from '@/state'
import {
  getAllowedPlaybackActions,
  getControlAvailability,
  isPlaybackActionAllowed,
  transitionPlaybackStatus,
  type PlaybackAction,
} from '@/state'

const allStatuses: PlaybackStatus[] = ['idle', 'running', 'paused', 'finished']
const allActions: PlaybackAction[] = ['start', 'pause', 'resume', 'reset', 'finish']

describe('control state machine', () => {
  it('defines deterministic playback actions for each status', () => {
    expect(getAllowedPlaybackActions('idle')).toEqual(['start', 'reset'])
    expect(getAllowedPlaybackActions('running')).toEqual(['pause', 'reset', 'finish'])
    expect(getAllowedPlaybackActions('paused')).toEqual(['resume', 'reset', 'finish'])
    expect(getAllowedPlaybackActions('finished')).toEqual(['start', 'reset'])
  })

  it('guards invalid transitions and keeps current status', () => {
    expect(transitionPlaybackStatus('idle', 'pause')).toBe('idle')
    expect(transitionPlaybackStatus('idle', 'resume')).toBe('idle')
    expect(transitionPlaybackStatus('running', 'start')).toBe('running')
    expect(transitionPlaybackStatus('paused', 'pause')).toBe('paused')
    expect(transitionPlaybackStatus('finished', 'resume')).toBe('finished')
    expect(transitionPlaybackStatus('finished', 'finish')).toBe('finished')
  })

  it('applies allowed transitions predictably', () => {
    expect(transitionPlaybackStatus('idle', 'start')).toBe('running')
    expect(transitionPlaybackStatus('running', 'pause')).toBe('paused')
    expect(transitionPlaybackStatus('paused', 'resume')).toBe('running')
    expect(transitionPlaybackStatus('running', 'finish')).toBe('finished')
    expect(transitionPlaybackStatus('paused', 'finish')).toBe('finished')
    expect(transitionPlaybackStatus('finished', 'reset')).toBe('idle')
  })

  it('keeps action checks aligned with transition behavior', () => {
    for (const status of allStatuses) {
      const allowedActions = getAllowedPlaybackActions(status)

      for (const action of allActions) {
        const allowed = isPlaybackActionAllowed(status, action)
        const nextStatus = transitionPlaybackStatus(status, action)

        expect(allowedActions.includes(action)).toBe(allowed)

        if (!allowed) {
          expect(nextStatus).toBe(status)
        }
      }
    }
  })

  it('returns stable control availability by playback status', () => {
    expect(getControlAvailability('idle')).toEqual({
      algorithmSelect: true,
      arraySize: true,
      speed: true,
      randomize: true,
      start: true,
      pause: false,
      resume: false,
      reset: false,
    })

    expect(getControlAvailability('running')).toEqual({
      algorithmSelect: false,
      arraySize: false,
      speed: true,
      randomize: false,
      start: false,
      pause: true,
      resume: false,
      reset: true,
    })

    expect(getControlAvailability('paused')).toEqual({
      algorithmSelect: false,
      arraySize: false,
      speed: true,
      randomize: false,
      start: false,
      pause: false,
      resume: true,
      reset: true,
    })

    expect(getControlAvailability('finished')).toEqual({
      algorithmSelect: true,
      arraySize: true,
      speed: true,
      randomize: true,
      start: true,
      pause: false,
      resume: false,
      reset: true,
    })
  })
})
