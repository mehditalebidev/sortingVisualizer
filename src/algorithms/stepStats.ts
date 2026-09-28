import type { SortStep, SortStepOperation } from '@/algorithms/contracts'
import type { StepSequence } from '@/algorithms/stepTrack'

export type StepStats = {
  comparisons: number
  moves: number
}

export type CumulativeStepStats = {
  length: number
  at: (stepIndex: number) => StepStats
}

const moveOperations: ReadonlySet<SortStepOperation> = new Set(['swap', 'shift', 'write'])

const isComparisonOperation = (operation: SortStepOperation | undefined): boolean => operation === 'compare'

const isMoveOperation = (operation: SortStepOperation | undefined): boolean => {
  return operation !== undefined && moveOperations.has(operation)
}

export const isComparisonStep = (step: SortStep): boolean => isComparisonOperation(step.metadata?.operation)

export const isMoveStep = (step: SortStep): boolean => isMoveOperation(step.metadata?.operation)

/**
 * Precomputes running comparison/move totals so the UI can read the counters
 * for any step in O(1) while playback advances or jumps.
 */
export const buildCumulativeStepStats = (steps: StepSequence): CumulativeStepStats => {
  const comparisons = new Uint32Array(steps.length)
  const moves = new Uint32Array(steps.length)
  let comparisonTotal = 0
  let moveTotal = 0

  // Compact tracks expose operations directly so stats never materialize snapshots.
  const operationAt = steps.operationAt ?? ((index: number) => steps.at(index)?.metadata?.operation)

  for (let index = 0; index < steps.length; index += 1) {
    const operation = operationAt(index)

    if (isComparisonOperation(operation)) {
      comparisonTotal += 1
    } else if (isMoveOperation(operation)) {
      moveTotal += 1
    }

    comparisons[index] = comparisonTotal
    moves[index] = moveTotal
  }

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
