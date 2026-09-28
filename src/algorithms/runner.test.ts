import { describe, expect, it } from 'vitest'

import {
  bubbleSortSteps,
  emitBubbleSort,
  emitInsertionSort,
  emitMergeSort,
  emitQuickSort,
  emitSelectionSort,
  materializeSteps,
  recordAlgorithm,
  getAlgorithmById,
  insertionSortSteps,
  listAlgorithms,
  mergeSortSteps,
  quickSortSteps,
  runAlgorithm,
  selectionSortSteps,
} from '@/algorithms'
import { sortAscending } from '@/algorithms/__tests__/fixtures'

describe('algorithm runner', () => {
  it('lists all available algorithms in the catalog', () => {
    expect(listAlgorithms()).toEqual([
      {
        id: 'bubble-sort',
        name: 'Bubble Sort',
        run: bubbleSortSteps,
        emit: emitBubbleSort,
      },
      {
        id: 'insertion-sort',
        name: 'Insertion Sort',
        run: insertionSortSteps,
        emit: emitInsertionSort,
      },
      {
        id: 'selection-sort',
        name: 'Selection Sort',
        run: selectionSortSteps,
        emit: emitSelectionSort,
      },
      {
        id: 'merge-sort',
        name: 'Merge Sort',
        run: mergeSortSteps,
        emit: emitMergeSort,
      },
      {
        id: 'quick-sort',
        name: 'Quick Sort',
        run: quickSortSteps,
        emit: emitQuickSort,
      },
    ])
  })

  it('returns an algorithm by id', () => {
    const algorithm = getAlgorithmById('bubble-sort')

    expect(algorithm.id).toBe('bubble-sort')
    expect(algorithm.name).toBe('Bubble Sort')
  })

  it.each([
    { id: 'bubble-sort' as const, emitter: bubbleSortSteps },
    { id: 'insertion-sort' as const, emitter: insertionSortSteps },
    { id: 'selection-sort' as const, emitter: selectionSortSteps },
    { id: 'merge-sort' as const, emitter: mergeSortSteps },
    { id: 'quick-sort' as const, emitter: quickSortSteps },
  ])('runs $id through the shared interface', ({ id, emitter }) => {
    const input = [5, 3, 1, 2]

    expect(runAlgorithm(id, input)).toEqual(emitter(input))
    expect(runAlgorithm(id, input).at(-1)?.snapshot).toEqual(sortAscending(input))
    expect(materializeSteps(recordAlgorithm(id, input))).toEqual(emitter(input))
  })
})
