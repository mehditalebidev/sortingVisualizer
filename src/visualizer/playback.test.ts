import { describe, expect, it } from 'vitest'

import type { SortStep } from '@/algorithms'
import { createPlaybackController } from '@/visualizer/playback'

const steps: SortStep[] = [
  {
    snapshot: [3, 1, 2],
    comparedIndices: [],
    modifiedIndices: [],
    metadata: { operation: 'start' },
  },
  {
    snapshot: [1, 3, 2],
    comparedIndices: [0, 1],
    modifiedIndices: [0, 1],
    metadata: { operation: 'swap', pass: 1 },
  },
  {
    snapshot: [1, 2, 3],
    comparedIndices: [],
    modifiedIndices: [],
    metadata: { operation: 'sorted' },
  },
]

describe('playback controller', () => {
  it('starts, advances, and completes deterministically', () => {
    const playback = createPlaybackController(steps)

    expect(playback.getState().status).toBe('idle')

    expect(playback.start()).toMatchObject({ status: 'running', stepIndex: 0 })
    expect(playback.tick()).toMatchObject({ status: 'running', stepIndex: 1 })
    expect(playback.tick()).toMatchObject({ status: 'finished', stepIndex: 2 })
    expect(playback.tick()).toMatchObject({ status: 'finished', stepIndex: 2 })
  })

  it('pauses and resumes without skipping frames', () => {
    const playback = createPlaybackController(steps)
    playback.start()

    expect(playback.pause()).toMatchObject({ status: 'paused', stepIndex: 0 })
    expect(playback.tick()).toMatchObject({ status: 'paused', stepIndex: 0 })
    expect(playback.resume()).toMatchObject({ status: 'running', stepIndex: 0 })
    expect(playback.tick()).toMatchObject({ status: 'running', stepIndex: 1 })
  })

  it('resets to idle start state', () => {
    const playback = createPlaybackController(steps)

    playback.start()
    playback.tick()
    expect(playback.reset()).toMatchObject({ status: 'idle', stepIndex: 0 })
  })

  it('handles empty input timeline safely', () => {
    const playback = createPlaybackController([])

    expect(playback.start()).toMatchObject({ status: 'finished', stepIndex: 0 })
    expect(playback.getState().step.snapshot).toEqual([])
  })
})
