import { expect } from 'vitest'

import type { SortStep } from '@/algorithms'

export const expectSnapshotLengths = (steps: readonly SortStep[], expectedLength: number): void => {
  for (const step of steps) {
    expect(step.snapshot).toHaveLength(expectedLength)
  }
}

export const expectIndicesInRange = (steps: readonly SortStep[], expectedLength: number): void => {
  for (const step of steps) {
    const allIndices = [...step.comparedIndices, ...step.modifiedIndices]

    for (const index of allIndices) {
      expect(Number.isInteger(index)).toBe(true)
      expect(index).toBeGreaterThanOrEqual(0)
      expect(index).toBeLessThan(expectedLength)
    }
  }
}

const inversionCount = (values: readonly number[]): number => {
  let inversions = 0

  for (let leftIndex = 0; leftIndex < values.length; leftIndex += 1) {
    const leftValue = values[leftIndex]

    if (leftValue === undefined) {
      continue
    }

    for (let rightIndex = leftIndex + 1; rightIndex < values.length; rightIndex += 1) {
      const rightValue = values[rightIndex]

      if (rightValue === undefined) {
        continue
      }

      if (leftValue > rightValue) {
        inversions += 1
      }
    }
  }

  return inversions
}

export const expectSwapInversionsToDecrease = (steps: readonly SortStep[]): void => {
  let previousSwapInversions: number | null = null

  for (const step of steps) {
    if (step.metadata?.operation !== 'swap') {
      continue
    }

    const currentInversions = inversionCount(step.snapshot)

    if (previousSwapInversions !== null) {
      expect(currentInversions).toBeLessThan(previousSwapInversions)
    }

    previousSwapInversions = currentInversions
  }
}

export const expectRangeMetadataInBounds = (steps: readonly SortStep[], expectedLength: number): void => {
  for (const step of steps) {
    const range = step.metadata?.range

    if (!range) {
      continue
    }

    expect(Number.isInteger(range.start)).toBe(true)
    expect(Number.isInteger(range.end)).toBe(true)
    expect(range.start).toBeGreaterThanOrEqual(0)
    expect(range.end).toBeGreaterThanOrEqual(range.start)
    expect(range.end).toBeLessThan(expectedLength)
  }
}

export const expectPartitionMetadataInBounds = (steps: readonly SortStep[], expectedLength: number): void => {
  for (const step of steps) {
    const pivotIndex = step.metadata?.pivotIndex

    if (pivotIndex !== undefined) {
      expect(Number.isInteger(pivotIndex)).toBe(true)
      expect(pivotIndex).toBeGreaterThanOrEqual(0)
      expect(pivotIndex).toBeLessThan(expectedLength)
    }

    const partitionIndex = step.metadata?.partitionIndex

    if (partitionIndex !== undefined) {
      expect(Number.isInteger(partitionIndex)).toBe(true)
      expect(partitionIndex).toBeGreaterThanOrEqual(0)
      expect(partitionIndex).toBeLessThan(expectedLength)
    }

    const range = step.metadata?.range

    if (range && partitionIndex !== undefined) {
      expect(partitionIndex).toBeGreaterThanOrEqual(range.start)
      expect(partitionIndex).toBeLessThanOrEqual(range.end)
    }
  }
}
