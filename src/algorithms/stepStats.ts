import type { SortStep, SortStepOperation } from '@/algorithms/contracts'

export type StepStats = {
  comparisons: number
  moves: number
}

export type CumulativeStepStats = {
  length: number
  at: (stepIndex: number) => StepStats
}

const moveOperations: ReadonlySet<SortStepOperation> = new Set(['swap', 'shift', 'write'])

export const isComparisonStep = (step: SortStep): boolean => {
  return step.metadata?.operation === 'compare'
}

export const isMoveStep = (step: SortStep): boolean => {
  const operation = step.metadata?.operation
  return operation !== undefined && moveOperations.has(operation)
}

/**
 * Precomputes running comparison/move totals so the UI can read the counters
 * for any step in O(1) while playback advances or jumps.
 */
export const buildCumulativeStepStats = (steps: readonly SortStep[]): CumulativeStepStats => {
  const comparisons = new Uint32Array(steps.length)
  const moves = new Uint32Array(steps.length)
  let comparisonTotal = 0
  let moveTotal = 0

  steps.forEach((step, index) => {
    if (isComparisonStep(step)) {
      comparisonTotal += 1
    } else if (isMoveStep(step)) {
      moveTotal += 1
    }

    comparisons[index] = comparisonTotal
    moves[index] = moveTotal
  })

  const at = (stepIndex: number): StepStats => {
    if (steps.length === 0) {
      return { comparisons: 0, moves: 0 }
    }

    const index = Math.max(0, Math.min(steps.length - 1, Math.floor(stepIndex)))

    return {
      comparisons: comparisons[index] ?? 0,
      moves: moves[index] ?? 0,
    }
  }

  return {
    length: steps.length,
    at,
  }
}
