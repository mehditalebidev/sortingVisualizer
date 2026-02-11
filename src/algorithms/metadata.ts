import type { SortingAlgorithmId } from '@/algorithms/contracts'

export type AlgorithmComplexity = {
  best: string
  average: string
  worst: string
}

export type AlgorithmMetadata = {
  id: SortingAlgorithmId
  displayName: string
  complexity: AlgorithmComplexity
  description: string
}

const algorithmMetadataRegistry: Record<SortingAlgorithmId, AlgorithmMetadata> = {
  'bubble-sort': {
    id: 'bubble-sort',
    displayName: 'Bubble Sort',
    complexity: {
      best: 'O(n)',
      average: 'O(n^2)',
      worst: 'O(n^2)',
    },
    description:
      'Repeatedly compares neighboring values and swaps out-of-order pairs so larger values bubble toward the end each pass.',
  },
  'insertion-sort': {
    id: 'insertion-sort',
    displayName: 'Insertion Sort',
    complexity: {
      best: 'O(n)',
      average: 'O(n^2)',
      worst: 'O(n^2)',
    },
    description:
      'Builds a sorted left side incrementally by shifting larger values right, then inserting the current value in place.',
  },
  'selection-sort': {
    id: 'selection-sort',
    displayName: 'Selection Sort',
    complexity: {
      best: 'O(n^2)',
      average: 'O(n^2)',
      worst: 'O(n^2)',
    },
    description:
      'Scans the unsorted range to find the minimum value, then swaps it into the next sorted position.',
  },
  'merge-sort': {
    id: 'merge-sort',
    displayName: 'Merge Sort',
    complexity: {
      best: 'O(n log n)',
      average: 'O(n log n)',
      worst: 'O(n log n)',
    },
    description:
      'Recursively splits the array and merges sorted ranges by writing the next smallest value into position.',
  },
  'quick-sort': {
    id: 'quick-sort',
    displayName: 'Quick Sort',
    complexity: {
      best: 'O(n log n)',
      average: 'O(n log n)',
      worst: 'O(n^2)',
    },
    description:
      'Partitions each range around a deterministic pivot so lower values move left and higher values move right.',
  },
}

export const getAlgorithmMetadata = (algorithmId: SortingAlgorithmId): AlgorithmMetadata => {
  return algorithmMetadataRegistry[algorithmId]
}

export const listAlgorithmMetadata = (): AlgorithmMetadata[] => {
  return Object.values(algorithmMetadataRegistry)
}
