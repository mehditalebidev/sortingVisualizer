import type { SortStep } from '@/algorithms'
import type { PlaybackStatus } from '@/state'

export type BarVisualState = 'neutral' | 'compared' | 'modified' | 'completed'

export type ValueHueRange = {
  from: number
  to: number
  saturation: number
  lightness: number
}

export type VisualSemantics = {
  backgroundColor: string
  backgroundAccentColor?: string
  gridColor?: string
  barColors: Record<BarVisualState, string>
  glowColors?: Partial<Record<BarVisualState, string>>
  valueHue?: ValueHueRange
}

export const defaultVisualSemantics: VisualSemantics = {
  backgroundColor: '#0d1233',
  backgroundAccentColor: '#1d1150',
  gridColor: 'rgba(148, 163, 255, 0.09)',
  barColors: {
    neutral: '#8b93d9',
    compared: '#fde047',
    modified: '#ff4d8d',
    completed: '#34d399',
  },
  glowColors: {
    compared: 'rgba(253, 224, 71, 0.85)',
    modified: 'rgba(255, 77, 141, 0.9)',
  },
  valueHue: {
    from: 285,
    to: 195,
    saturation: 88,
    lightness: 64,
  },
}

export const resolveBarColor = (
  semantics: VisualSemantics,
  state: BarVisualState,
  normalizedValue: number,
): string => {
  if (state !== 'neutral' || !semantics.valueHue) {
    return semantics.barColors[state]
  }

  const { from, to, saturation, lightness } = semantics.valueHue
  const ratio = Number.isFinite(normalizedValue) ? Math.max(0, Math.min(1, normalizedValue)) : 0
  const hue = Math.round(from + (to - from) * ratio)

  return `hsl(${hue}, ${saturation}%, ${lightness}%)`
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
