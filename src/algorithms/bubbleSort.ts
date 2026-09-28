import type { SortStep } from '@/algorithms/contracts'
import { collectSteps, type StepSink } from '@/algorithms/stepTrack'

export const emitBubbleSort = (input: readonly number[], sink: StepSink): void => {
  const values = [...input]
  sink.push(values, [], [], { operation: 'start' })

  if (values.length < 2) {
    sink.push(values, [], [], { operation: 'sorted' })
    return
  }

  for (let pass = 0; pass < values.length - 1; pass += 1) {
    let swapped = false

    for (let index = 0; index < values.length - pass - 1; index += 1) {
      const comparedIndices = [index, index + 1]
      const leftValue = values[index]
      const rightValue = values[index + 1]

      if (leftValue === undefined || rightValue === undefined) {
        continue
      }

      sink.push(values, comparedIndices, [], { operation: 'compare', pass: pass + 1 })

      if (leftValue > rightValue) {
        values[index] = rightValue
        values[index + 1] = leftValue
        swapped = true
        sink.push(values, comparedIndices, comparedIndices, {
          operation: 'swap',
          pass: pass + 1,
        })
      }
    }

    sink.push(values, [], [values.length - pass - 1], {
      operation: 'pass-complete',
      pass: pass + 1,
    })

    if (!swapped) {
      break
    }
  }

  sink.push(values, [], [], { operation: 'sorted' })
  return
}

export const bubbleSortSteps = (input: readonly number[]): SortStep[] => collectSteps(input, emitBubbleSort)
