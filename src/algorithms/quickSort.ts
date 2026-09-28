import type { SortRange, SortStep } from '@/algorithms/contracts'
import { collectSteps, type StepSink } from '@/algorithms/stepTrack'

const createRange = (start: number, end: number): SortRange => {
  return { start, end }
}

export const emitQuickSort = (input: readonly number[], sink: StepSink): void => {
  const values = [...input]
  sink.push(values, [], [], { operation: 'start' })

  if (values.length < 2) {
    sink.push(values, [], [], { operation: 'sorted' })
    return
  }

  const partition = (start: number, end: number): number => {
    const range = createRange(start, end)
    const pivotValue = values[end]

    if (pivotValue === undefined) {
      return start
    }

    sink.push(values, [], [], {
      operation: 'partition',
      range,
      pivotIndex: end,
    })

    let smallerIndex = start

    for (let scanIndex = start; scanIndex < end; scanIndex += 1) {
      const scanValue = values[scanIndex]

      if (scanValue === undefined) {
        continue
      }

      sink.push(values, [scanIndex, end], [], {
        operation: 'compare',
        range,
        pivotIndex: end,
      })

      if (scanValue <= pivotValue) {
        if (smallerIndex !== scanIndex) {
          const leftValue = values[smallerIndex]

          if (leftValue !== undefined) {
            values[smallerIndex] = scanValue
            values[scanIndex] = leftValue
            sink.push(values, [smallerIndex, scanIndex], [smallerIndex, scanIndex], {
              operation: 'swap',
              range,
              pivotIndex: end,
            })
          }
        }

        smallerIndex += 1
      }
    }

    const valueAtSmallerIndex = values[smallerIndex]

    if (valueAtSmallerIndex !== undefined && smallerIndex !== end) {
      values[smallerIndex] = pivotValue
      values[end] = valueAtSmallerIndex
      sink.push(values, [smallerIndex, end], [smallerIndex, end], {
        operation: 'swap',
        range,
        pivotIndex: smallerIndex,
        partitionIndex: smallerIndex,
      })
    }

    sink.push(values, [], [smallerIndex], {
      operation: 'partition-complete',
      range,
      pivotIndex: smallerIndex,
      partitionIndex: smallerIndex,
    })

    return smallerIndex
  }

  const sortRange = (start: number, end: number): void => {
    if (start > end) {
      return
    }

    if (start === end) {
      sink.push(values, [], [start], {
        operation: 'range-sorted',
        range: createRange(start, end),
      })
      return
    }

    const partitionIndex = partition(start, end)
    sortRange(start, partitionIndex - 1)
    sortRange(partitionIndex + 1, end)
    sink.push(values, [], [partitionIndex], {
      operation: 'range-sorted',
      range: createRange(start, end),
      partitionIndex,
    })
  }

  sortRange(0, values.length - 1)
  sink.push(values, [], [], { operation: 'sorted' })
  return
}

export const quickSortSteps = (input: readonly number[]): SortStep[] => collectSteps(input, emitQuickSort)
