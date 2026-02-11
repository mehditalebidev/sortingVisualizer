import { describe, expect, it } from 'vitest'

import {
  divideAndConquerFixtures,
  sortAscending,
} from '@/algorithms/__tests__/fixtures'
import {
  expectIndicesInRange,
  expectRangeMetadataInBounds,
  expectSnapshotLengths,
} from '@/algorithms/__tests__/stepAssertions'
import { mergeSortSteps } from '@/algorithms/mergeSort'

describe('mergeSortSteps', () => {
  it.each(divideAndConquerFixtures)('sorts %s, is deterministic, and preserves input immutability', ({ input }) => {
    const originalInput = [...input]
    const firstRun = mergeSortSteps(input)
    const secondRun = mergeSortSteps(input)

    expect(firstRun).toEqual(secondRun)
    expect(input).toEqual(originalInput)
    expect(firstRun.at(-1)?.snapshot).toEqual(sortAscending(input))
    expect(firstRun.length).toBeGreaterThan(0)
  })

  it.each(divideAndConquerFixtures)('emits contract-valid merge steps for %s', ({ input }) => {
    const steps = mergeSortSteps(input)

    expect(steps[0]?.metadata?.operation).toBe('start')
    expect(steps[0]?.snapshot).toEqual(input)
    expect(steps.at(-1)?.metadata?.operation).toBe('sorted')

    expectSnapshotLengths(steps, input.length)

    if (input.length > 0) {
      expectIndicesInRange(steps, input.length)
    }

    if (input.length > 1) {
      expectRangeMetadataInBounds(steps, input.length)
      expect(steps.some((step) => step.metadata?.operation === 'merge-range')).toBe(true)
      expect(steps.some((step) => step.metadata?.operation === 'write')).toBe(true)
      expect(steps.some((step) => step.metadata?.operation === 'range-sorted')).toBe(true)
    }
  })

  it('emits compare and write progression through merge ranges', () => {
    const steps = mergeSortSteps([5, 2, 4, 1])
    const mergeStartIndex = steps.findIndex((step) => step.metadata?.operation === 'merge-range')
    const firstCompareAfterMerge = steps.findIndex(
      (step, index) => index > mergeStartIndex && step.metadata?.operation === 'compare',
    )
    const firstWriteAfterMerge = steps.findIndex(
      (step, index) => index > mergeStartIndex && step.metadata?.operation === 'write',
    )
    const firstRangeSortedAfterMerge = steps.findIndex(
      (step, index) => index > mergeStartIndex && step.metadata?.operation === 'range-sorted',
    )

    expect(mergeStartIndex).toBeGreaterThan(-1)
    expect(firstCompareAfterMerge).toBeGreaterThan(mergeStartIndex)
    expect(firstWriteAfterMerge).toBeGreaterThan(mergeStartIndex)
    expect(firstRangeSortedAfterMerge).toBeGreaterThan(firstWriteAfterMerge)
    expect(steps.at(-1)?.snapshot).toEqual([1, 2, 4, 5])
  })
})
