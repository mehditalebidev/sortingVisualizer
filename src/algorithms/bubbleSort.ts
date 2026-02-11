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

export const bubbleSortSteps = (input: readonly number[]): SortStep[] => {
  const values = [...input]
  const steps: SortStep[] = [createStep(values, [], [], { operation: 'start' })]

  if (values.length < 2) {
    steps.push(createStep(values, [], [], { operation: 'sorted' }))
    return steps
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

      steps.push(createStep(values, comparedIndices, [], { operation: 'compare', pass: pass + 1 }))

      if (leftValue > rightValue) {
        values[index] = rightValue
        values[index + 1] = leftValue
        swapped = true
        steps.push(
          createStep(values, comparedIndices, comparedIndices, {
            operation: 'swap',
            pass: pass + 1,
          }),
        )
      }
    }

    steps.push(
      createStep(values, [], [values.length - pass - 1], {
        operation: 'pass-complete',
        pass: pass + 1,
      }),
    )

    if (!swapped) {
      break
    }
  }

  steps.push(createStep(values, [], [], { operation: 'sorted' }))
  return steps
}
