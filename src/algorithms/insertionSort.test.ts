import { describe, expect, it } from 'vitest'

import { describeAlgorithmCompliance } from '@/algorithms/__tests__/algorithmCompliance'
import { insertionSortSteps } from '@/algorithms/insertionSort'

describeAlgorithmCompliance('insertionSortSteps', insertionSortSteps)

describe('insertionSortSteps', () => {
  it('emits shift and insert operations for non-trivial input', () => {
    const steps = insertionSortSteps([4, 3, 2, 1])

    expect(steps.some((step) => step.metadata?.operation === 'shift')).toBe(true)
    expect(steps.some((step) => step.metadata?.operation === 'insert')).toBe(true)
    expect(steps.some((step) => step.metadata?.operation === 'write')).toBe(false)
  })

  it('keeps compare phase stable, then emits shift-then-insert progression', () => {
    const steps = insertionSortSteps([5, 3, 4, 1])
    const passSteps = steps.filter((step) => step.metadata?.pass === 3)
    const compareSteps = passSteps.filter((step) => step.metadata?.operation === 'compare')
    const shiftSteps = passSteps.filter((step) => step.metadata?.operation === 'shift')
    const insertStep = passSteps.find((step) => step.metadata?.operation === 'insert')

    expect(compareSteps).toHaveLength(3)
    expect(shiftSteps).toHaveLength(3)
    expect(insertStep?.snapshot).toEqual([1, 3, 4, 5])

    for (const compareStep of compareSteps) {
      expect(compareStep.snapshot).toEqual([3, 4, 5, 1])
      expect(compareStep.modifiedIndices).toEqual([])
    }

    expect(shiftSteps[0]?.snapshot).toEqual([3, 4, 1, 5])
    expect(shiftSteps[1]?.snapshot).toEqual([3, 1, 4, 5])
    expect(shiftSteps[2]?.snapshot).toEqual([1, 3, 4, 5])

    const passOperations = passSteps.map((step) => step.metadata?.operation)
    expect(passOperations).toEqual([
      'compare',
      'compare',
      'compare',
      'shift',
      'shift',
      'shift',
      'insert',
      'pass-complete',
    ])
  })
})
