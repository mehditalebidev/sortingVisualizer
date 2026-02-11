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

export const mergeSortSteps = (input: readonly number[]): SortStep[] => {
  const values = [...input]
  const aux = [...input]
  const steps: SortStep[] = [createStep(values, [], [], { operation: 'start' })]

  if (values.length < 2) {
    steps.push(createStep(values, [], [], { operation: 'sorted' }))
    return steps
  }

  const mergeRange = (start: number, middle: number, end: number): void => {
    const range = createRange(start, end)

    for (let index = start; index <= end; index += 1) {
      const value = values[index]

      if (value === undefined) {
        continue
      }

      aux[index] = value
    }

    steps.push(createStep(values, [], [], { operation: 'merge-range', range }))

    let leftIndex = start
    let rightIndex = middle + 1

    for (let targetIndex = start; targetIndex <= end; targetIndex += 1) {
      const leftValue = aux[leftIndex]
      const rightValue = aux[rightIndex]

      if (leftIndex <= middle && rightIndex <= end && leftValue !== undefined && rightValue !== undefined) {
        steps.push(createStep(values, [leftIndex, rightIndex], [], { operation: 'compare', range }))
      }

      if (leftIndex > middle) {
        if (rightValue === undefined) {
          continue
        }

        values[targetIndex] = rightValue
        steps.push(
          createStep(values, [rightIndex, targetIndex], [targetIndex], {
            operation: 'write',
            range,
          }),
        )
        rightIndex += 1
        continue
      }

      if (rightIndex > end) {
        if (leftValue === undefined) {
          continue
        }

        values[targetIndex] = leftValue
        steps.push(
          createStep(values, [leftIndex, targetIndex], [targetIndex], {
            operation: 'write',
            range,
          }),
        )
        leftIndex += 1
        continue
      }

      if (leftValue === undefined || rightValue === undefined) {
        continue
      }

      if (leftValue <= rightValue) {
        values[targetIndex] = leftValue
        steps.push(
          createStep(values, [leftIndex, targetIndex], [targetIndex], {
            operation: 'write',
            range,
          }),
        )
        leftIndex += 1
      } else {
        values[targetIndex] = rightValue
        steps.push(
          createStep(values, [rightIndex, targetIndex], [targetIndex], {
            operation: 'write',
            range,
          }),
        )
        rightIndex += 1
      }
    }

    steps.push(createStep(values, [], [], { operation: 'range-sorted', range }))
  }

  const sortRange = (start: number, end: number): void => {
    if (start >= end) {
      return
    }

    const middle = Math.floor((start + end) / 2)
    sortRange(start, middle)
    sortRange(middle + 1, end)
    mergeRange(start, middle, end)
  }

  sortRange(0, values.length - 1)
  steps.push(createStep(values, [], [], { operation: 'sorted' }))
  return steps
}
