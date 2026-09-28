import { describe, expect, it } from 'vitest'

import { recordAlgorithm, runAlgorithm, type SortStep } from '@/algorithms'
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

  it('jumps to the final step on complete and falls back safely for empty sequences', () => {
    const playback = createPlaybackController(steps)

    expect(playback.complete()).toMatchObject({ status: 'finished', stepIndex: 2 })
    expect(playback.getState().step.snapshot).toEqual([1, 2, 3])

    const empty = createPlaybackController([])
    expect(empty.start().status).toBe('finished')
    expect(empty.getState().step.metadata?.operation).toBe('start')
  })

  it('plays a compact step track without copying it into an array', () => {
    const input = [5, 1, 4, 2, 3]
    const reference = runAlgorithm('bubble-sort', input)
    const playback = createPlaybackController(recordAlgorithm('bubble-sort', input))

    playback.start()
    const visited: SortStep[] = [playback.getState().step]

    while (playback.getState().status === 'running') {
      visited.push(playback.tick().step)
    }

    expect(visited).toEqual(reference)
    expect(playback.reset().step).toEqual(reference[0])
  })

  it('ignores tick, pause, and resume when they do not apply to the current status', () => {
    const playback = createPlaybackController(steps)

    expect(playback.tick()).toMatchObject({ status: 'idle', stepIndex: 0 })
    expect(playback.pause().status).toBe('idle')
    expect(playback.resume().status).toBe('idle')

    playback.start()
    expect(playback.resume().status).toBe('running')
  })

  it('falls back to a placeholder step when a sequence has no step at the index', () => {
    const holey = { length: 2, at: () => undefined }
    const playback = createPlaybackController(holey)

    expect(playback.getState().step.snapshot).toEqual([])
  })
})

