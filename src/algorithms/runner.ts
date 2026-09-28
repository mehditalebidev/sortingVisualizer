import { bubbleSortSteps, emitBubbleSort } from '@/algorithms/bubbleSort'
import { emitInsertionSort, insertionSortSteps } from '@/algorithms/insertionSort'
import { emitMergeSort, mergeSortSteps } from '@/algorithms/mergeSort'
import { emitQuickSort, quickSortSteps } from '@/algorithms/quickSort'
import { emitSelectionSort, selectionSortSteps } from '@/algorithms/selectionSort'
import { recordSteps, type StepTrack, type StepTrackOptions } from '@/algorithms/stepTrack'
import type { SortStep, SortingAlgorithmDefinition, SortingAlgorithmId } from '@/algorithms/contracts'

const algorithmRegistry: Record<SortingAlgorithmId, SortingAlgorithmDefinition> = {
  'bubble-sort': {
    id: 'bubble-sort',
    name: 'Bubble Sort',
    run: bubbleSortSteps,
    emit: emitBubbleSort,
  },
  'insertion-sort': {
    id: 'insertion-sort',
    name: 'Insertion Sort',
    run: insertionSortSteps,
    emit: emitInsertionSort,
  },
  'selection-sort': {
    id: 'selection-sort',
    name: 'Selection Sort',
    run: selectionSortSteps,
    emit: emitSelectionSort,
  },
  'merge-sort': {
    id: 'merge-sort',
    name: 'Merge Sort',
    run: mergeSortSteps,
    emit: emitMergeSort,
  },
  'quick-sort': {
    id: 'quick-sort',
    name: 'Quick Sort',
    run: quickSortSteps,
    emit: emitQuickSort,
  },
}

export const getAlgorithmById = (algorithmId: SortingAlgorithmId): SortingAlgorithmDefinition => {
  return algorithmRegistry[algorithmId]
}

export const listAlgorithms = (): SortingAlgorithmDefinition[] => {
  return Object.values(algorithmRegistry)
}

export const runAlgorithm = (algorithmId: SortingAlgorithmId, input: readonly number[]): SortStep[] => {
  const algorithm = getAlgorithmById(algorithmId)
  return algorithm.run(input)
}

/**
 * Runs an algorithm into a compact step track (O(steps) memory instead of
 * O(steps x size)). Use this for anything driven by user-sized input.
 */
export const recordAlgorithm = (
  algorithmId: SortingAlgorithmId,
  input: readonly number[],
  options?: StepTrackOptions,
): StepTrack => {
  return recordSteps(input, getAlgorithmById(algorithmId).emit, options)
}
