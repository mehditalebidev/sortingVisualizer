import type { SortStep } from '@/algorithms'
import type { PlaybackStatus } from '@/state'

export type BarVisualState = 'neutral' | 'compared' | 'modified' | 'completed'

export type VisualSemantics = {
  backgroundColor: string
  barColors: Record<BarVisualState, string>
}

export const defaultVisualSemantics: VisualSemantics = {
  backgroundColor: '#f1f5f9',
  barColors: {
    neutral: '#64748b',
    compared: '#0ea5e9',
    modified: '#f97316',
    completed: '#16a34a',
  },
}

const visualStatePriority: Record<BarVisualState, number> = {
  neutral: 0,
  compared: 1,
  modified: 2,
  completed: 3,
}

const isIndexInRange = (index: number, length: number): boolean => {
  return Number.isInteger(index) && index >= 0 && index < length
}

export const resolveVisualState = (
  current: BarVisualState,
  incoming: BarVisualState,
): BarVisualState => {
  return visualStatePriority[incoming] > visualStatePriority[current] ? incoming : current
}

export const mapStepToBarStates = (
  step: SortStep,
  playbackStatus: PlaybackStatus,
): BarVisualState[] => {
  const states: BarVisualState[] = Array.from({ length: step.snapshot.length }, () => 'neutral')

  if (playbackStatus === 'finished' || step.metadata?.operation === 'sorted') {
    return Array.from({ length: step.snapshot.length }, () => 'completed')
  }

  for (const index of step.comparedIndices) {
    if (!isIndexInRange(index, states.length)) {
      continue
    }

    states[index] = resolveVisualState(states[index] ?? 'neutral', 'compared')
  }

  for (const index of step.modifiedIndices) {
    if (!isIndexInRange(index, states.length)) {
      continue
    }

    states[index] = resolveVisualState(states[index] ?? 'neutral', 'modified')
  }

  return states
}
