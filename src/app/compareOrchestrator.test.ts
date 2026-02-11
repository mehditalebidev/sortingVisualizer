import { describe, expect, it } from 'vitest'

import { createCompareOrchestrator } from '@/app/compareOrchestrator'
import type { SortStep, SortingAlgorithmId } from '@/algorithms'

const buildSteps = (snapshots: number[][]): SortStep[] => {
  return snapshots.map((snapshot, index) => ({
    snapshot,
    comparedIndices: [],
    modifiedIndices: [],
    metadata: {
      operation: index === snapshots.length - 1 ? 'sorted' : 'compare',
    },
  }))
}

describe('compare orchestrator', () => {
  it('starts all selected algorithms in one synchronized run session', () => {
    const orchestrator = createCompareOrchestrator({
      selectedAlgorithms: ['bubble-sort', 'quick-sort'],
      sharedInput: [4, 2, 3, 1],
      speed: 60,
      arraySize: 4,
    })

    const started = orchestrator.start()

    expect(started.session.status).toBe('running')
    expect(started.panelStates['bubble-sort']?.status).toBe('running')
    expect(started.panelStates['quick-sort']?.status).toBe('running')
  })

  it('keeps shared input fair while cloning per algorithm execution', () => {
    const sourceInput = [9, 7, 5, 3]

    const orchestrator = createCompareOrchestrator({
      selectedAlgorithms: ['bubble-sort', 'selection-sort'],
      sharedInput: sourceInput,
      speed: 50,
      arraySize: sourceInput.length,
    })

    const initial = orchestrator.getState()
    const bubbleInput = initial.panelStates['bubble-sort']?.input
    const selectionInput = initial.panelStates['selection-sort']?.input

    expect(initial.session.sharedInput).toEqual(sourceInput)
    expect(bubbleInput).toEqual(sourceInput)
    expect(selectionInput).toEqual(sourceInput)

    if (!bubbleInput || !selectionInput) {
      throw new Error('Expected panel inputs to exist')
    }

    bubbleInput[0] = 99

    expect(initial.session.sharedInput[0]).toBe(9)
    expect(selectionInput[0]).toBe(9)
  })

  it('supports divergent completion where faster panels finish while others continue', () => {
    const customSteps: Record<SortingAlgorithmId, SortStep[]> = {
      'bubble-sort': buildSteps([
        [5, 3, 2],
        [3, 5, 2],
        [2, 3, 5],
      ]),
      'insertion-sort': buildSteps([
        [5, 3, 2],
        [3, 5, 2],
        [3, 2, 5],
        [2, 3, 5],
        [2, 3, 5],
      ]),
      'selection-sort': buildSteps([[5, 3, 2], [2, 3, 5]]),
      'merge-sort': buildSteps([[5, 3, 2], [2, 3, 5]]),
      'quick-sort': buildSteps([[5, 3, 2], [2, 3, 5]]),
    }

    const orchestrator = createCompareOrchestrator({
      selectedAlgorithms: ['bubble-sort', 'insertion-sort'],
      sharedInput: [5, 3, 2],
      speed: 0,
      arraySize: 3,
      sessionOptions: {
        executor: (algorithmId, input) => {
          return {
            algorithmId,
            input: [...input],
            steps: customSteps[algorithmId],
          }
        },
      },
    })

    orchestrator.start()
    orchestrator.tick()
    orchestrator.tick()

    const midState = orchestrator.getState()
    expect(midState.panelStates['bubble-sort']?.status).toBe('finished')
    expect(midState.panelStates['insertion-sort']?.status).toBe('running')
    expect(midState.session.status).toBe('running')

    orchestrator.tick()
    orchestrator.tick()

    const completed = orchestrator.getState()
    expect(completed.panelStates['bubble-sort']?.status).toBe('finished')
    expect(completed.panelStates['insertion-sort']?.status).toBe('finished')
    expect(completed.session.status).toBe('finished')
  })

  it('fans out pause and resume across all non-complete panels', () => {
    const orchestrator = createCompareOrchestrator({
      selectedAlgorithms: ['bubble-sort', 'quick-sort'],
      sharedInput: [3, 1, 2],
      speed: 40,
      arraySize: 3,
    })

    orchestrator.start()
    const paused = orchestrator.pause()

    expect(paused.session.status).toBe('paused')
    expect(paused.panelStates['bubble-sort']?.status).toBe('paused')
    expect(paused.panelStates['quick-sort']?.status).toBe('paused')

    const resumed = orchestrator.resume()
    expect(resumed.session.status).toBe('running')
    expect(resumed.panelStates['bubble-sort']?.status).toBe('running')
    expect(resumed.panelStates['quick-sort']?.status).toBe('running')
  })

  it('resets to clean idle session and accepts regenerated shared input', () => {
    const orchestrator = createCompareOrchestrator({
      selectedAlgorithms: ['selection-sort', 'merge-sort'],
      sharedInput: [8, 4, 6],
      speed: 70,
      arraySize: 3,
    })

    orchestrator.start()
    const reset = orchestrator.reset([1, 9, 5])

    expect(reset.session.status).toBe('idle')
    expect(reset.session.sharedInput).toEqual([1, 9, 5])
    expect(reset.panelStates['selection-sort']?.stepIndex).toBe(0)
    expect(reset.panelStates['merge-sort']?.stepIndex).toBe(0)
  })

  it('applies speed changes to cadence progression deterministically', () => {
    const snapshots = Array.from({ length: 30 }, (_, index) => [30 - index, index])
    const longSteps = buildSteps(snapshots)

    const orchestrator = createCompareOrchestrator({
      selectedAlgorithms: ['bubble-sort'],
      sharedInput: [30, 0],
      speed: 0,
      arraySize: 1000,
      sessionOptions: {
        executor: (algorithmId, input) => {
          return {
            algorithmId,
            input: [...input],
            steps: longSteps,
          }
        },
      },
    })

    orchestrator.start()
    const slowTick = orchestrator.tick()
    const slowIndex = slowTick.panelStates['bubble-sort']?.stepIndex ?? 0

    orchestrator.updateSpeed(100)
    const fastTick = orchestrator.tick()
    const fastIndex = fastTick.panelStates['bubble-sort']?.stepIndex ?? 0

    expect(fastIndex - slowIndex).toBeGreaterThan(1)
  })
})
