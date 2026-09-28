import type { SortStep } from '@/algorithms/contracts'
import { collectSteps, type StepSink } from '@/algorithms/stepTrack'

export const emitSelectionSort = (input: readonly number[], sink: StepSink): void => {
  const values = [...input]
  sink.push(values, [], [], { operation: 'start' })

  if (values.length < 2) {
    sink.push(values, [], [], { operation: 'sorted' })
    return
  }

  for (let pass = 0; pass < values.length - 1; pass += 1) {
    let minIndex = pass

    for (let index = pass + 1; index < values.length; index += 1) {
      const currentMin = values[minIndex]
      const currentValue = values[index]

      if (currentMin === undefined || currentValue === undefined) {
        continue
      }

      sink.push(values, [minIndex, index], [], { operation: 'compare', pass: pass + 1 })

      if (currentValue < currentMin) {
        minIndex = index
      }
    }

    if (minIndex !== pass) {
      const leftValue = values[pass]
      const minValue = values[minIndex]

      if (leftValue !== undefined && minValue !== undefined) {
        values[pass] = minValue
        values[minIndex] = leftValue
        sink.push(values, [pass, minIndex], [pass, minIndex], {
          operation: 'swap',
          pass: pass + 1,
        })
      }
    }

    sink.push(values, [], [pass], {
      operation: 'pass-complete',
      pass: pass + 1,
    })
  }

  sink.push(values, [], [values.length - 1], { operation: 'pass-complete', pass: values.length })
  sink.push(values, [], [], { operation: 'sorted' })
  return
}

export const selectionSortSteps = (input: readonly number[]): SortStep[] => collectSteps(input, emitSelectionSort)
