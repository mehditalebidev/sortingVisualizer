import { describe, expect, it } from 'vitest'

import type { SortStep } from '@/algorithms'
import { defaultVisualSemantics, mapStepToBarStates, resolveVisualState } from '@/visualizer/renderModel'

const baseStep: SortStep = {
  snapshot: [5, 2, 7, 1],
  comparedIndices: [],
  modifiedIndices: [],
  metadata: {
    operation: 'start',
  },
}

describe('render model', () => {
  it('maps neutral states when no indices are highlighted', () => {
    expect(mapStepToBarStates(baseStep, 'idle')).toEqual(['neutral', 'neutral', 'neutral', 'neutral'])
  })

  it('maps compared and modified states with deterministic precedence', () => {
    const step: SortStep = {
      ...baseStep,
      comparedIndices: [1, 2],
      modifiedIndices: [2],
      metadata: {
        operation: 'swap',
      },
    }

    expect(mapStepToBarStates(step, 'running')).toEqual(['neutral', 'compared', 'modified', 'neutral'])
  })

  it('maps completion state when playback is finished', () => {
    const step: SortStep = {
      ...baseStep,
      comparedIndices: [0, 1],
      modifiedIndices: [1],
    }

    expect(mapStepToBarStates(step, 'finished')).toEqual(['completed', 'completed', 'completed', 'completed'])
  })

  it('maps completion state for sorted operation regardless of playback status', () => {
    const step: SortStep = {
      ...baseStep,
      metadata: {
        operation: 'sorted',
      },
    }

    expect(mapStepToBarStates(step, 'running')).toEqual([
      'completed',
      'completed',
      'completed',
      'completed',
    ])
  })

  it('ignores invalid indices while applying states', () => {
    const step: SortStep = {
      ...baseStep,
      comparedIndices: [0, -1, 99],
      modifiedIndices: [2.5],
    }

    expect(mapStepToBarStates(step, 'running')).toEqual(['compared', 'neutral', 'neutral', 'neutral'])
  })

  it('prefers higher-priority incoming state', () => {
    expect(resolveVisualState('compared', 'modified')).toBe('modified')
    expect(resolveVisualState('modified', 'compared')).toBe('modified')
  })

  it('keeps visual state colors distinct for legend and canvas mapping', () => {
    const colors = defaultVisualSemantics.barColors
    expect(colors.neutral).not.toBe(colors.compared)
    expect(colors.compared).not.toBe(colors.modified)
    expect(colors.modified).not.toBe(colors.completed)
  })
})
