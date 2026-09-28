import type { SortStep } from '@/algorithms/contracts'
import { collectSteps, type StepSink } from '@/algorithms/stepTrack'

export const emitInsertionSort = (input: readonly number[], sink: StepSink): void => {
  const values = [...input]
  sink.push(values, [], [], { operation: 'start' })

  if (values.length < 2) {
    sink.push(values, [], [], { operation: 'sorted' })
    return
  }

  for (let pass = 1; pass < values.length; pass += 1) {
    const key = values[pass]

    if (key === undefined) {
      continue
    }

    let insertionIndex = pass

    while (insertionIndex > 0) {
      const leftIndex = insertionIndex - 1
      const leftValue = values[leftIndex]

      if (leftValue === undefined) {
        break
      }

      sink.push(values, [leftIndex, pass], [], { operation: 'compare', pass })

      if (leftValue <= key) {
        break
      }

      insertionIndex -= 1
    }

    for (let index = pass; index > insertionIndex; index -= 1) {
      const leftIndex = index - 1
      const leftValue = values[leftIndex]
      const rightValue = values[index]

      if (leftValue === undefined || rightValue === undefined) {
        continue
      }

      values[leftIndex] = rightValue
      values[index] = leftValue
      sink.push(values, [leftIndex, index], [leftIndex, index], {
        operation: 'shift',
        pass,
      })
    }

    sink.push(values, [], [insertionIndex], { operation: 'insert', pass })
    sink.push(values, [], [insertionIndex], { operation: 'pass-complete', pass })
  }

  sink.push(values, [], [], { operation: 'sorted' })
  return
}

export const insertionSortSteps = (input: readonly number[]): SortStep[] => collectSteps(input, emitInsertionSort)
