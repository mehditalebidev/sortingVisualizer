import { bubbleSortSteps } from '@/algorithms/bubbleSort'
import { insertionSortSteps } from '@/algorithms/insertionSort'
import { mergeSortSteps } from '@/algorithms/mergeSort'
import { quickSortSteps } from '@/algorithms/quickSort'
import { selectionSortSteps } from '@/algorithms/selectionSort'
import type { SortStep, SortingAlgorithmDefinition, SortingAlgorithmId } from '@/algorithms/contracts'

const algorithmRegistry: Record<SortingAlgorithmId, SortingAlgorithmDefinition> = {
  'bubble-sort': {
    id: 'bubble-sort',
    name: 'Bubble Sort',
    run: bubbleSortSteps,
  },
  'insertion-sort': {
    id: 'insertion-sort',
    name: 'Insertion Sort',
    run: insertionSortSteps,
  },
  'selection-sort': {
    id: 'selection-sort',
    name: 'Selection Sort',
    run: selectionSortSteps,
  },
  'merge-sort': {
    id: 'merge-sort',
    name: 'Merge Sort',
    run: mergeSortSteps,
  },
  'quick-sort': {
    id: 'quick-sort',
    name: 'Quick Sort',
    run: quickSortSteps,
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
