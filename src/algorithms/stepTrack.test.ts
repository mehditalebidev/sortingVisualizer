import { describe, expect, it } from 'vitest'

import { listAlgorithms, recordAlgorithm, runAlgorithm } from '@/algorithms'
import { algorithmFixtures } from '@/algorithms/__tests__/fixtures'
import {
  collectSteps,
  createStepTrackRecorder,
  materializeSteps,
  recordSteps,
  type StepEmitter,
} from '@/algorithms/stepTrack'

const createSeededRandom = (seed: number): (() => number) => {
  let state = seed

  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296
    return state / 4294967296
  }
}

const randomInputs = (() => {
  const random = createSeededRandom(42)
  return Array.from({ length: 12 }, (_, index) => {
    const size = 2 + Math.floor(random() * 40)
    const spread = index % 3 === 0 ? 4 : 100
    return Array.from({ length: size }, () => Math.floor(random() * spread) - 10)
  })
})()

const allInputs = [...algorithmFixtures.map((fixture) => [...fixture.input]), ...randomInputs, [1.5, -0.25, 1.5, 3]]

describe('step track', () => {
  it.each(listAlgorithms().map((algorithm) => algorithm.id))(
    'reconstructs exactly the reference steps for %s across checkpoint intervals and access orders',
    (algorithmId) => {
      for (const input of allInputs) {
        const reference = runAlgorithm(algorithmId, input)

        for (const checkpointInterval of [1, 3, 17, undefined]) {
          const forward = recordAlgorithm(algorithmId, input, { checkpointInterval })
          expect(forward.length).toBe(reference.length)
          expect(materializeSteps(forward)).toEqual(reference)

          const backward = recordAlgorithm(algorithmId, input, { checkpointInterval })
          for (let index = reference.length - 1; index >= 0; index -= 1) {
            expect(backward.at(index)).toEqual(reference[index])
          }

          const jumping = recordAlgorithm(algorithmId, input, { checkpointInterval })
          const random = createSeededRandom(input.length + (checkpointInterval ?? 0))
          for (let probe = 0; probe < 25; probe += 1) {
            const index = Math.floor(random() * reference.length)
            expect(jumping.at(index)).toEqual(reference[index])
            expect(jumping.operationAt(index)).toBe(reference[index]?.metadata?.operation)
          }
        }
      }
    },
  )

  it('supports negative, out-of-range, and non-finite indices like Array.at', () => {
    const track = recordAlgorithm('bubble-sort', [3, 1, 2])
    const reference = runAlgorithm('bubble-sort', [3, 1, 2])

    expect(track.at(-1)).toEqual(reference.at(-1))
    expect(track.at(-reference.length)).toEqual(reference[0])
    expect(track.at(-reference.length - 1)).toBeUndefined()
    expect(track.at(reference.length)).toBeUndefined()
    expect(track.at(Number.NaN)).toBeUndefined()
    expect(track.at(1.7)).toEqual(reference[1])
    expect(track.operationAt(99)).toBeUndefined()
  })

  it('returns the same materialized object for repeated reads of one index', () => {
    const track = recordAlgorithm('insertion-sort', [4, 2, 9, 1])

    expect(track.at(2)).toBe(track.at(2))
    expect(track.at(3)).not.toBe(track.at(2))
  })

  it('keeps steps without metadata or with unknown operations metadata-free', () => {
    const emitter: StepEmitter = (input, sink) => {
      const values = [...input]
      sink.push(values, [], [])
      values[0] = 9
      sink.push(values, [0], [0], { operation: 'write', range: { start: 0, end: 0 }, partitionIndex: 0 })
      sink.push(values, [5, -1], [], { operation: 'bogus' as never, pass: 1.5 })
    }
    const track = recordSteps([1, 2], emitter)

    expect(materializeSteps(track)).toEqual(collectSteps([1, 2], emitter).map((step, index) => {
      return index === 2 ? { ...step, metadata: undefined } : step
    }))
    expect(track.at(0)?.metadata).toBeUndefined()
    expect(track.at(1)?.metadata).toEqual({ operation: 'write', range: { start: 0, end: 0 }, partitionIndex: 0 })
    expect(track.operationAt(0)).toBeUndefined()
  })

  it('handles empty input and grows its buffers past the initial capacity', () => {
    const empty = recordAlgorithm('quick-sort', [])
    expect(materializeSteps(empty)).toEqual(runAlgorithm('quick-sort', []))

    const recorder = createStepTrackRecorder([0])
    for (let index = 0; index < 500; index += 1) {
      recorder.push([index], [0], [0], { operation: 'write', pass: index })
    }
    const track = recorder.finish()

    expect(track.length).toBe(500)
    expect(track.at(499)).toEqual({ snapshot: [499], comparedIndices: [0], modifiedIndices: [0], metadata: { operation: 'write', pass: 499 } })
    expect(track.at(250)?.snapshot).toEqual([250])
    expect(() => recorder.push([1], [0], [0])).toThrow('after the track is finished')
  })

  it('stays compact for large quadratic runs', () => {
    const random = createSeededRandom(7)
    const input = Array.from({ length: 400 }, () => Math.floor(random() * 1000))
    const track = recordAlgorithm('bubble-sort', input)

    // A full-snapshot representation would hold length x 400 numbers (~100M here).
    expect(track.length).toBeGreaterThan(100_000)
    expect(track.at(-1)?.snapshot).toEqual([...input].sort((left, right) => left - right))
    expect(track.at(0)?.snapshot).toEqual(input)
  })
})
