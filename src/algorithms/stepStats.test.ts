import { describe, expect, it } from 'vitest'

import type { SortStep, SortStepOperation } from '@/algorithms/contracts'
import { bubbleSortSteps } from '@/algorithms/bubbleSort'
import { buildCumulativeStepStats, isComparisonStep, isMoveStep } from '@/algorithms/stepStats'

const step = (operation?: SortStepOperation): SortStep => ({
  snapshot: [1, 2],
  comparedIndices: [],
  modifiedIndices: [],
  metadata: operation ? { operation } : undefined,
})

describe('step stats', () => {
  it('classifies comparison and move operations', () => {
    expect(isComparisonStep(step('compare'))).toBe(true)
    expect(isComparisonStep(step('swap'))).toBe(false)
    expect(isMoveStep(step('swap'))).toBe(true)
    expect(isMoveStep(step('shift'))).toBe(true)
    expect(isMoveStep(step('write'))).toBe(true)
    expect(isMoveStep(step('insert'))).toBe(false)
    expect(isMoveStep(step())).toBe(false)
  })

  it('accumulates running totals per step', () => {
    const stats = buildCumulativeStepStats([
      step('start'),
      step('compare'),
      step('swap'),
      step('compare'),
      step('write'),
      step('sorted'),
    ])

    expect(stats.length).toBe(6)
    expect(stats.at(0)).toEqual({ comparisons: 0, moves: 0 })
    expect(stats.at(2)).toEqual({ comparisons: 1, moves: 1 })
    expect(stats.at(5)).toEqual({ comparisons: 2, moves: 2 })
  })

  it('clamps out-of-range indices and handles empty step lists', () => {
    const stats = buildCumulativeStepStats([step('compare'), step('swap')])

    expect(stats.at(-4)).toEqual({ comparisons: 1, moves: 0 })
    expect(stats.at(99)).toEqual({ comparisons: 1, moves: 1 })
    expect(buildCumulativeStepStats([]).at(3)).toEqual({ comparisons: 0, moves: 0 })
  })

  it('matches bubble sort totals for a reversed input', () => {
    const steps = bubbleSortSteps([3, 2, 1])
    const totals = buildCumulativeStepStats(steps).at(steps.length - 1)

    expect(totals).toEqual({ comparisons: 3, moves: 3 })
  })
})
