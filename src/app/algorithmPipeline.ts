import { runAlgorithm, type SortStep, type SortingAlgorithmId } from '@/algorithms'

export type RandomArrayOptions = {
  size?: number
  minValue?: number
  maxValue?: number
  random?: () => number
}

export type AlgorithmPreview = {
  algorithmId: SortingAlgorithmId
  input: number[]
  steps: SortStep[]
}

export type AlgorithmExecution = {
  algorithmId: SortingAlgorithmId
  input: number[]
  steps: SortStep[]
}

const DEFAULT_RANDOM_OPTIONS: Required<RandomArrayOptions> = {
  size: 100,
  minValue: 8,
  maxValue: 160,
  random: Math.random,
}

export const generateRandomArray = (options: RandomArrayOptions = {}): number[] => {
  const resolved = {
    ...DEFAULT_RANDOM_OPTIONS,
    ...options,
  }

  if (resolved.size < 0) {
    throw new Error('Array size must be greater than or equal to 0')
  }

  if (resolved.maxValue < resolved.minValue) {
    throw new Error('maxValue must be greater than or equal to minValue')
  }

  const span = resolved.maxValue - resolved.minValue + 1
  const values: number[] = []

  for (let index = 0; index < resolved.size; index += 1) {
    values.push(Math.floor(resolved.random() * span) + resolved.minValue)
  }

  return values
}

export const createAlgorithmPreview = (
  algorithmId: SortingAlgorithmId = 'bubble-sort',
  options: RandomArrayOptions = {},
): AlgorithmPreview => {
  const input = generateRandomArray(options)
  const steps = runAlgorithm(algorithmId, input)

  return {
    algorithmId,
    input,
    steps,
  }
}

export const executeAlgorithmWithInput = (
  algorithmId: SortingAlgorithmId,
  input: readonly number[],
): AlgorithmExecution => {
  const steps = runAlgorithm(algorithmId, input)

  return {
    algorithmId,
    input: [...input],
    steps,
  }
}
