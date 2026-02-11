import { describe, expect, it } from 'vitest'

import {
  createAlgorithmPreview,
  executeAlgorithmWithInput,
  generateRandomArray,
} from '@/app/algorithmPipeline'
import { sortAscending } from '@/algorithms/__tests__/fixtures'

const algorithmIds = ['bubble-sort', 'insertion-sort', 'selection-sort', 'merge-sort', 'quick-sort'] as const

const sequenceRandom = (values: number[]): (() => number) => {
  let index = 0

  return () => {
    const value = values[index % values.length]
    index += 1
    return value ?? 0
  }
}

describe('algorithm pipeline preview', () => {
  it('generates deterministic arrays with injected random source', () => {
    const random = sequenceRandom([0.1, 0.4, 0.9])

    expect(generateRandomArray({ size: 5, minValue: 10, maxValue: 19, random })).toEqual([
      11, 14, 19, 11, 14,
    ])
  })

  it('throws on invalid random-array bounds', () => {
    expect(() => generateRandomArray({ size: -1 })).toThrowError(
      'Array size must be greater than or equal to 0',
    )
    expect(() => generateRandomArray({ minValue: 8, maxValue: 7 })).toThrowError(
      'maxValue must be greater than or equal to minValue',
    )
  })

  it.each(algorithmIds)('creates non-empty step output for non-trivial input with %s', (algorithmId) => {
    const preview = createAlgorithmPreview(algorithmId, {
      size: 6,
      minValue: 1,
      maxValue: 9,
      random: sequenceRandom([0.7, 0.2, 0.6, 0.1]),
    })

    expect(preview.algorithmId).toBe(algorithmId)
    expect(preview.steps.length).toBeGreaterThan(2)
    expect(preview.steps.at(-1)?.snapshot).toEqual(sortAscending(preview.input))
  })

  it.each(algorithmIds)('handles edge-case empty input generation with %s', (algorithmId) => {
    const preview = createAlgorithmPreview(algorithmId, {
      size: 0,
      random: sequenceRandom([0.2]),
    })

    expect(preview.input).toEqual([])
    expect(preview.steps).toHaveLength(2)
    expect(preview.steps.at(-1)?.snapshot).toEqual([])
  })

  it.each(algorithmIds)('executes selected algorithm against provided input with %s', (algorithmId) => {
    const input = [7, 3, 5, 1]
    const execution = executeAlgorithmWithInput(algorithmId, input)

    expect(execution.algorithmId).toBe(algorithmId)
    expect(execution.input).toEqual(input)
    expect(execution.input).not.toBe(input)
    expect(execution.steps.at(-1)?.snapshot).toEqual(sortAscending(input))
  })

  it('preserves insertion compare phase, then reports shift and insert operations', () => {
    const execution = executeAlgorithmWithInput('insertion-sort', [5, 3, 4, 1])
    const passSteps = execution.steps.filter((step) => step.metadata?.pass === 3)
    const compareSteps = passSteps.filter((step) => step.metadata?.operation === 'compare')
    const shiftSteps = passSteps.filter((step) => step.metadata?.operation === 'shift')

    expect(compareSteps).toHaveLength(3)
    expect(shiftSteps).toHaveLength(3)
    expect(passSteps.some((step) => step.metadata?.operation === 'insert')).toBe(true)
    expect(compareSteps.every((step) => step.snapshot[0] === 3 && step.snapshot[1] === 4)).toBe(true)
  })
})
