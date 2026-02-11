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

export const insertionSortSteps = (input: readonly number[]): SortStep[] => {
  const values = [...input]
  const steps: SortStep[] = [createStep(values, [], [], { operation: 'start' })]

  if (values.length < 2) {
    steps.push(createStep(values, [], [], { operation: 'sorted' }))
    return steps
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

      steps.push(createStep(values, [leftIndex, pass], [], { operation: 'compare', pass }))

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
      steps.push(
        createStep(values, [leftIndex, index], [leftIndex, index], {
          operation: 'shift',
          pass,
        }),
      )
    }

    steps.push(createStep(values, [], [insertionIndex], { operation: 'insert', pass }))
    steps.push(createStep(values, [], [insertionIndex], { operation: 'pass-complete', pass }))
  }

  steps.push(createStep(values, [], [], { operation: 'sorted' }))
  return steps
}
