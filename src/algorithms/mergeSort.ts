import type { SortRange, SortStep } from '@/algorithms/contracts'
import { collectSteps, type StepSink } from '@/algorithms/stepTrack'

const createRange = (start: number, end: number): SortRange => {
  return { start, end }
}

export const emitMergeSort = (input: readonly number[], sink: StepSink): void => {
  const values = [...input]
  const aux = [...input]
  sink.push(values, [], [], { operation: 'start' })

  if (values.length < 2) {
    sink.push(values, [], [], { operation: 'sorted' })
    return
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

    sink.push(values, [], [], { operation: 'merge-range', range })

    let leftIndex = start
    let rightIndex = middle + 1

    for (let targetIndex = start; targetIndex <= end; targetIndex += 1) {
      const leftValue = aux[leftIndex]
      const rightValue = aux[rightIndex]

      if (leftIndex <= middle && rightIndex <= end && leftValue !== undefined && rightValue !== undefined) {
        sink.push(values, [leftIndex, rightIndex], [], { operation: 'compare', range })
      }

      if (leftIndex > middle) {
        if (rightValue === undefined) {
          continue
        }

        values[targetIndex] = rightValue
        sink.push(values, [rightIndex, targetIndex], [targetIndex], {
          operation: 'write',
          range,
        })
        rightIndex += 1
        continue
      }

      if (rightIndex > end) {
        if (leftValue === undefined) {
          continue
        }

        values[targetIndex] = leftValue
        sink.push(values, [leftIndex, targetIndex], [targetIndex], {
          operation: 'write',
          range,
        })
        leftIndex += 1
        continue
      }

      if (leftValue === undefined || rightValue === undefined) {
        continue
      }

      if (leftValue <= rightValue) {
        values[targetIndex] = leftValue
        sink.push(values, [leftIndex, targetIndex], [targetIndex], {
          operation: 'write',
          range,
        })
        leftIndex += 1
      } else {
        values[targetIndex] = rightValue
        sink.push(values, [rightIndex, targetIndex], [targetIndex], {
          operation: 'write',
          range,
        })
        rightIndex += 1
      }
    }

    sink.push(values, [], [], { operation: 'range-sorted', range })
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
  sink.push(values, [], [], { operation: 'sorted' })
  return
}

export const mergeSortSteps = (input: readonly number[]): SortStep[] => collectSteps(input, emitMergeSort)
