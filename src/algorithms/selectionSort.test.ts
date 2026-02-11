import { describe, expect, it } from 'vitest'

import { describeAlgorithmCompliance } from '@/algorithms/__tests__/algorithmCompliance'
import { selectionSortSteps } from '@/algorithms/selectionSort'

describeAlgorithmCompliance('selectionSortSteps', selectionSortSteps)

describe('selectionSortSteps', () => {
  it('emits swap operations for unsorted input', () => {
    const steps = selectionSortSteps([5, 4, 3, 2, 1])

    expect(steps.some((step) => step.metadata?.operation === 'swap')).toBe(true)
  })
})
