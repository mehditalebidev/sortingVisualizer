import { describe, expect, it } from 'vitest'

import {
  compareSessionSyncGuarantees,
  createCompareRunSession,
  createSingleAlgorithmSession,
  toSingleRunExecution,
} from '@/app/compareSession'
import type { SortingAlgorithmId } from '@/algorithms'

describe('compare run session contract', () => {
  it('creates a typed multi-run session with explicit synchronization guarantees', () => {
    const sharedInput = [9, 2, 5, 1]

    const session = createCompareRunSession(['bubble-sort', 'selection-sort'], sharedInput, {
      sessionId: 'f10-contract',
    })

    expect(session.sessionId).toBe('f10-contract')
    expect(session.status).toBe('idle')
    expect(session.syncGuarantees).toEqual(compareSessionSyncGuarantees)
    expect(session.selectedAlgorithms).toEqual(['bubble-sort', 'selection-sort'])
    expect(session.sharedInput).toEqual(sharedInput)
  })

  it('clones shared input per panel to guarantee fair, mutation-safe starts', () => {
    const sharedInput = [6, 1, 4, 2]
    const session = createCompareRunSession(['bubble-sort', 'insertion-sort'], sharedInput)
    const bubblePanel = session.panels['bubble-sort']
    const insertionPanel = session.panels['insertion-sort']

    expect(bubblePanel.input).toEqual(sharedInput)
    expect(insertionPanel.input).toEqual(sharedInput)
    expect(bubblePanel.input).not.toBe(insertionPanel.input)
    expect(bubblePanel.input).not.toBe(session.sharedInput)
    expect(insertionPanel.input).not.toBe(session.sharedInput)

    bubblePanel.input[0] = 99

    expect(session.sharedInput[0]).toBe(6)
    expect(insertionPanel.input[0]).toBe(6)
  })

  it('supports conversion to single-run execution contract for backward compatibility', () => {
    const session = createSingleAlgorithmSession('merge-sort', [3, 7, 1, 8], {
      executor: (algorithmId, input) => {
        return {
          algorithmId,
          input: [...input],
          steps: [
            {
              snapshot: [...input].sort((left, right) => left - right),
              comparedIndices: [],
              modifiedIndices: [],
              metadata: { operation: 'sorted' },
            },
          ],
        }
      },
    })

    const selectedId = session.selectedAlgorithms[0] as SortingAlgorithmId
    const execution = toSingleRunExecution(session.panels[selectedId])

    expect(execution.algorithmId).toBe('merge-sort')
    expect(execution.input).toEqual([3, 7, 1, 8])
    expect(execution.steps).toHaveLength(1)
    expect(execution.steps[0]?.snapshot).toEqual([1, 3, 7, 8])
  })

  it('throws when no algorithms are selected', () => {
    expect(() => createCompareRunSession([], [2, 1, 3])).toThrowError(
      'Compare run requires at least one selected algorithm',
    )
  })
})
