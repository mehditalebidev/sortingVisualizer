import { describe, expect, it } from 'vitest'

import { bubbleSortSteps } from '@/algorithms'
import { algorithmFixtures, sortAscending } from '@/algorithms/__tests__/fixtures'
import {
  expectIndicesInRange,
  expectSnapshotLengths,
  expectSwapInversionsToDecrease,
} from '@/algorithms/__tests__/stepAssertions'

describe('bubbleSortSteps', () => {
  it.each(algorithmFixtures)('sorts %s and does not mutate input', ({ input }) => {
    const originalInput = [...input]
    const steps = bubbleSortSteps(input)
    const finalSnapshot = steps.at(-1)?.snapshot

    expect(finalSnapshot).toEqual(sortAscending(input))
    expect(input).toEqual(originalInput)
    expect(steps.length).toBeGreaterThan(0)
  })

  it('is deterministic for identical input', () => {
    const input = [7, 2, 6, 3, 2]

    expect(bubbleSortSteps(input)).toEqual(bubbleSortSteps(input))
  })

  it.each(algorithmFixtures)('emits structurally valid steps for %s', ({ input }) => {
    const steps = bubbleSortSteps(input)

    expect(steps[0]?.snapshot).toEqual(input)
    expect(steps[0]?.metadata?.operation).toBe('start')
    expect(steps.at(-1)?.metadata?.operation).toBe('sorted')

    expectSnapshotLengths(steps, input.length)

    if (input.length > 0) {
      expectIndicesInRange(steps, input.length)
    }

    expectSwapInversionsToDecrease(steps)

    if (input.length > 1) {
      expect(steps.some((step) => step.metadata?.operation === 'compare')).toBe(true)
    }
  })
})
