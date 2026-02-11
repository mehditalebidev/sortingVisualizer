import { describe, expect, it } from 'vitest'

import type { SortStep } from '@/algorithms'
import { algorithmFixtures, sortAscending } from '@/algorithms/__tests__/fixtures'
import { expectIndicesInRange, expectSnapshotLengths } from '@/algorithms/__tests__/stepAssertions'

type StepEmitter = (input: readonly number[]) => SortStep[]

export const describeAlgorithmCompliance = (name: string, emitter: StepEmitter): void => {
  describe(`${name} compliance matrix`, () => {
    it.each(algorithmFixtures)('sorts %s, is deterministic, and preserves input immutability', ({ input }) => {
      const originalInput = [...input]
      const firstRun = emitter(input)
      const secondRun = emitter(input)

      expect(firstRun).toEqual(secondRun)
      expect(input).toEqual(originalInput)
      expect(firstRun.at(-1)?.snapshot).toEqual(sortAscending(input))
      expect(firstRun.length).toBeGreaterThan(0)
    })

    it.each(algorithmFixtures)('emits contract-valid step structure for %s', ({ input }) => {
      const steps = emitter(input)

      expect(steps[0]?.metadata?.operation).toBe('start')
      expect(steps[0]?.snapshot).toEqual(input)
      expect(steps.at(-1)?.metadata?.operation).toBe('sorted')

      expectSnapshotLengths(steps, input.length)

      if (input.length > 0) {
        expectIndicesInRange(steps, input.length)
      }

      if (input.length > 1) {
        expect(steps.some((step) => step.metadata?.operation === 'compare')).toBe(true)
      }
    })
  })
}
