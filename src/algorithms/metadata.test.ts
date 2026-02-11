import { describe, expect, it } from 'vitest'

import { getAlgorithmMetadata, listAlgorithmMetadata } from '@/algorithms'

describe('algorithm metadata registry', () => {
  it('returns complete metadata for every supported algorithm id', () => {
    const registry = listAlgorithmMetadata()

    expect(registry.map((entry) => entry.id)).toEqual([
      'bubble-sort',
      'insertion-sort',
      'selection-sort',
      'merge-sort',
      'quick-sort',
    ])

    registry.forEach((entry) => {
      expect(entry.displayName.length).toBeGreaterThan(0)
      expect(entry.description.length).toBeGreaterThan(0)
      expect(entry.complexity.best.length).toBeGreaterThan(0)
      expect(entry.complexity.average.length).toBeGreaterThan(0)
      expect(entry.complexity.worst.length).toBeGreaterThan(0)
    })
  })

  it('resolves metadata by algorithm id', () => {
    expect(getAlgorithmMetadata('quick-sort')).toEqual({
      id: 'quick-sort',
      displayName: 'Quick Sort',
      complexity: {
        best: 'O(n log n)',
        average: 'O(n log n)',
        worst: 'O(n^2)',
      },
      description:
        'Partitions each range around a deterministic pivot so lower values move left and higher values move right.',
    })
  })
})
