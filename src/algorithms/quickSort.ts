import type { SortRange, SortStep, SortStepMetadata } from '@/algorithms/contracts'

const createStep = (
  values: readonly number[],
  comparedIndices: readonly number[],
  modifiedIndices: readonly number[],
  metadata?: SortStepMetadata,
): SortStep => {
  return {
    snapshot: [...values],
    comparedIndices: [...comparedIndices],
    modifiedIndices: [...modifiedIndices],
    metadata,
  }
}

const createRange = (start: number, end: number): SortRange => {
  return { start, end }
}

export const quickSortSteps = (input: readonly number[]): SortStep[] => {
  const values = [...input]
  const steps: SortStep[] = [createStep(values, [], [], { operation: 'start' })]

  if (values.length < 2) {
    steps.push(createStep(values, [], [], { operation: 'sorted' }))
    return steps
  }

  const partition = (start: number, end: number): number => {
    const range = createRange(start, end)
    const pivotValue = values[end]

    if (pivotValue === undefined) {
      return start
    }

    steps.push(
      createStep(values, [], [], {
        operation: 'partition',
        range,
        pivotIndex: end,
      }),
    )

    let smallerIndex = start

    for (let scanIndex = start; scanIndex < end; scanIndex += 1) {
      const scanValue = values[scanIndex]

      if (scanValue === undefined) {
        continue
      }

      steps.push(
        createStep(values, [scanIndex, end], [], {
          operation: 'compare',
          range,
          pivotIndex: end,
        }),
      )

      if (scanValue <= pivotValue) {
        if (smallerIndex !== scanIndex) {
          const leftValue = values[smallerIndex]

          if (leftValue !== undefined) {
            values[smallerIndex] = scanValue
            values[scanIndex] = leftValue
            steps.push(
              createStep(values, [smallerIndex, scanIndex], [smallerIndex, scanIndex], {
                operation: 'swap',
                range,
                pivotIndex: end,
              }),
            )
          }
        }

        smallerIndex += 1
      }
    }

    const valueAtSmallerIndex = values[smallerIndex]

    if (valueAtSmallerIndex !== undefined && smallerIndex !== end) {
      values[smallerIndex] = pivotValue
      values[end] = valueAtSmallerIndex
      steps.push(
        createStep(values, [smallerIndex, end], [smallerIndex, end], {
          operation: 'swap',
          range,
          pivotIndex: smallerIndex,
          partitionIndex: smallerIndex,
        }),
      )
    }

    steps.push(
      createStep(values, [], [smallerIndex], {
        operation: 'partition-complete',
        range,
        pivotIndex: smallerIndex,
        partitionIndex: smallerIndex,
      }),
    )

    return smallerIndex
  }

  const sortRange = (start: number, end: number): void => {
    if (start > end) {
      return
    }

    if (start === end) {
      steps.push(
        createStep(values, [], [start], {
          operation: 'range-sorted',
          range: createRange(start, end),
        }),
      )
      return
    }

    const partitionIndex = partition(start, end)
    sortRange(start, partitionIndex - 1)
    sortRange(partitionIndex + 1, end)
    steps.push(
      createStep(values, [], [partitionIndex], {
        operation: 'range-sorted',
        range: createRange(start, end),
        partitionIndex,
      }),
    )
  }

  sortRange(0, values.length - 1)
  steps.push(createStep(values, [], [], { operation: 'sorted' }))
  return steps
}
