import { describe, expect, it } from 'vitest'

import {
  divideAndConquerFixtures,
  sortAscending,
} from '@/algorithms/__tests__/fixtures'
import {
  expectIndicesInRange,
  expectPartitionMetadataInBounds,
  expectRangeMetadataInBounds,
  expectSnapshotLengths,
} from '@/algorithms/__tests__/stepAssertions'
import { quickSortSteps } from '@/algorithms/quickSort'

describe('quickSortSteps', () => {
  it.each(divideAndConquerFixtures)('sorts %s, is deterministic, and preserves input immutability', ({ input }) => {
    const originalInput = [...input]
    const firstRun = quickSortSteps(input)
    const secondRun = quickSortSteps(input)

    expect(firstRun).toEqual(secondRun)
    expect(input).toEqual(originalInput)
    expect(firstRun.at(-1)?.snapshot).toEqual(sortAscending(input))
    expect(firstRun.length).toBeGreaterThan(0)
  })

  it.each(divideAndConquerFixtures)('emits partition-aware contract-valid steps for %s', ({ input }) => {
    const steps = quickSortSteps(input)

    expect(steps[0]?.metadata?.operation).toBe('start')
    expect(steps[0]?.snapshot).toEqual(input)
    expect(steps.at(-1)?.metadata?.operation).toBe('sorted')

    expectSnapshotLengths(steps, input.length)

    if (input.length > 0) {
      expectIndicesInRange(steps, input.length)
    }

    if (input.length > 1) {
      expectRangeMetadataInBounds(steps, input.length)
      expectPartitionMetadataInBounds(steps, input.length)
      expect(steps.some((step) => step.metadata?.operation === 'partition')).toBe(true)
      expect(steps.some((step) => step.metadata?.operation === 'partition-complete')).toBe(true)
      expect(steps.some((step) => step.metadata?.operation === 'compare')).toBe(true)
      expect(steps.some((step) => step.metadata?.operation === 'swap')).toBe(true)
    }
  })

  it('emits deterministic partition progression with pivot metadata', () => {
    const steps = quickSortSteps([4, 1, 3, 2])
    const firstPartitionIndex = steps.findIndex((step) => step.metadata?.operation === 'partition')
    const firstPartitionCompleteIndex = steps.findIndex(
      (step) => step.metadata?.operation === 'partition-complete',
    )
    const firstPartition = steps[firstPartitionIndex]
    const firstPartitionComplete = steps[firstPartitionCompleteIndex]

    expect(firstPartitionIndex).toBeGreaterThan(-1)
    expect(firstPartitionCompleteIndex).toBeGreaterThan(firstPartitionIndex)
    expect(firstPartition?.metadata?.pivotIndex).toBe(3)
    expect(firstPartitionComplete?.metadata?.partitionIndex).toBeDefined()
    expect(firstPartitionComplete?.modifiedIndices).toHaveLength(1)
    expect(steps.at(-1)?.snapshot).toEqual([1, 2, 3, 4])
  })
})
