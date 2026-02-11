import type { SortStep, SortStepMetadata } from '@/algorithms/contracts'

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

export const selectionSortSteps = (input: readonly number[]): SortStep[] => {
  const values = [...input]
  const steps: SortStep[] = [createStep(values, [], [], { operation: 'start' })]

  if (values.length < 2) {
    steps.push(createStep(values, [], [], { operation: 'sorted' }))
    return steps
  }

  for (let pass = 0; pass < values.length - 1; pass += 1) {
    let minIndex = pass

    for (let index = pass + 1; index < values.length; index += 1) {
      const currentMin = values[minIndex]
      const currentValue = values[index]

      if (currentMin === undefined || currentValue === undefined) {
        continue
      }

      steps.push(createStep(values, [minIndex, index], [], { operation: 'compare', pass: pass + 1 }))

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
        steps.push(
          createStep(values, [pass, minIndex], [pass, minIndex], {
            operation: 'swap',
            pass: pass + 1,
          }),
        )
      }
    }

    steps.push(
      createStep(values, [], [pass], {
        operation: 'pass-complete',
        pass: pass + 1,
      }),
    )
  }

  steps.push(createStep(values, [], [values.length - 1], { operation: 'pass-complete', pass: values.length }))
  steps.push(createStep(values, [], [], { operation: 'sorted' }))
  return steps
}
