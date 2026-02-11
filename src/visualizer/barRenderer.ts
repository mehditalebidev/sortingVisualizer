import type { BarVisualState, VisualSemantics } from '@/visualizer/renderModel'
import type { SortStepOperation } from '@/algorithms'

export type RenderDimensions = {
  width: number
  height: number
}

export type BarDescriptor = {
  index: number
  value: number
  x: number
  y: number
  width: number
  height: number
  state: BarVisualState
}

export type RenderFrame = {
  snapshot: number[]
  states: BarVisualState[]
  labels?: number[]
}

export type RenderTransition = {
  fromSnapshot: number[]
  fromLabels?: number[]
  progress: number
  operation?: SortStepOperation
  comparedIndices: number[]
  modifiedIndices: number[]
}

export type BarDescriptorOptions = {
  xOffsets?: Record<number, number>
}

const HORIZONTAL_PADDING = 12
const VERTICAL_PADDING = 12
const BAR_GAP = 2
const MIN_BAR_HEIGHT = 1

const clampProgress = (value: number): number => {
  if (!Number.isFinite(value)) {
    return 0
  }

  return Math.max(0, Math.min(1, value))
}

const easeInOutCubic = (progress: number): number => {
  return progress < 0.5 ? 4 * progress * progress * progress : 1 - Math.pow(-2 * progress + 2, 3) / 2
}

const createStableValueTokens = (snapshot: readonly number[]): string[] => {
  const counts = new Map<number, number>()

  return snapshot.map((value) => {
    const count = counts.get(value) ?? 0
    counts.set(value, count + 1)
    return `${value}:${count}`
  })
}

const getMovementOffsets = (
  fromSnapshot: readonly number[],
  toSnapshot: readonly number[],
  slotWidth: number,
  easedProgress: number,
): Record<number, number> | undefined => {
  if (fromSnapshot.length !== toSnapshot.length) {
    return undefined
  }

  const fromTokens = createStableValueTokens(fromSnapshot)
  const toTokens = createStableValueTokens(toSnapshot)
  const toIndexByToken = new Map<string, number>()

  for (let index = 0; index < toTokens.length; index += 1) {
    const token = toTokens[index]

    if (token === undefined) {
      continue
    }

    toIndexByToken.set(token, index)
  }

  const offsets: Record<number, number> = {}

  for (let index = 0; index < fromTokens.length; index += 1) {
    const token = fromTokens[index]

    if (token === undefined) {
      continue
    }

    const targetIndex = toIndexByToken.get(token)

    if (targetIndex === undefined) {
      return undefined
    }

    offsets[index] = (targetIndex - index) * slotWidth * easedProgress
  }

  return offsets
}

const getPairOffsets = (
  firstIndex: number,
  secondIndex: number,
  slotWidth: number,
  easedProgress: number,
): Record<number, number> => {
  if (!Number.isInteger(firstIndex) || !Number.isInteger(secondIndex)) {
    return {}
  }

  const distance = secondIndex - firstIndex

  return {
    [firstIndex]: distance * slotWidth * easedProgress,
    [secondIndex]: -distance * slotWidth * easedProgress,
  }
}

const getOperationOffsets = (
  transition: RenderTransition,
  slotWidth: number,
  easedProgress: number,
): Record<number, number> | undefined => {
  if (transition.operation === 'swap' && transition.modifiedIndices.length === 2) {
    const [firstIndex, secondIndex] = transition.modifiedIndices

    if (firstIndex !== undefined && secondIndex !== undefined) {
      return getPairOffsets(firstIndex, secondIndex, slotWidth, easedProgress)
    }
  }

  if (transition.operation === 'write' && transition.comparedIndices.length === 2) {
    const [fromIndex, toIndex] = transition.comparedIndices

    if (fromIndex !== undefined && toIndex !== undefined) {
      return {
        [fromIndex]: (toIndex - fromIndex) * slotWidth * easedProgress,
      }
    }
  }

  return undefined
}

const shouldPreserveSourceSnapshot = (operation?: SortStepOperation): boolean => {
  return operation === 'swap' || operation === 'write'
}

const interpolateSnapshot = (
  fromSnapshot: readonly number[],
  toSnapshot: readonly number[],
  progress: number,
): number[] => {
  const size = Math.max(fromSnapshot.length, toSnapshot.length)

  return Array.from({ length: size }, (_, index) => {
    const fromValue = fromSnapshot[index] ?? toSnapshot[index] ?? 0
    const toValue = toSnapshot[index] ?? fromValue
    return fromValue + (toValue - fromValue) * progress
  })
}

const normalizeValue = (value: number, minValue: number, maxValue: number): number => {
  if (maxValue === minValue) {
    return 1
  }

  return (value - minValue) / (maxValue - minValue)
}

export const createBarDescriptors = (
  snapshot: readonly number[],
  states: readonly BarVisualState[],
  dimensions: RenderDimensions,
  options: BarDescriptorOptions = {},
): BarDescriptor[] => {
  if (snapshot.length === 0) {
    return []
  }

  const minValue = Math.min(...snapshot)
  const maxValue = Math.max(...snapshot)
  const drawableWidth = Math.max(0, dimensions.width - HORIZONTAL_PADDING * 2)
  const drawableHeight = Math.max(0, dimensions.height - VERTICAL_PADDING * 2)
  const slotWidth = drawableWidth / snapshot.length

  return snapshot.map((value, index) => {
    const normalizedValue = normalizeValue(value, minValue, maxValue)
    const barHeight = Math.max(MIN_BAR_HEIGHT, normalizedValue * drawableHeight)
    const barWidth = Math.max(1, slotWidth - BAR_GAP)
    const offsetX = options.xOffsets?.[index] ?? 0
    const x = HORIZONTAL_PADDING + index * slotWidth + BAR_GAP / 2 + offsetX
    const y = dimensions.height - VERTICAL_PADDING - barHeight

    return {
      index,
      value,
      x,
      y,
      width: barWidth,
      height: barHeight,
      state: states[index] ?? 'neutral',
    }
  })
}

export const renderBarsFrame = (
  context: CanvasRenderingContext2D,
  frame: RenderFrame,
  dimensions: RenderDimensions,
  semantics: VisualSemantics,
  transition?: RenderTransition,
): void => {
  context.clearRect(0, 0, dimensions.width, dimensions.height)
  context.fillStyle = semantics.backgroundColor
  context.fillRect(0, 0, dimensions.width, dimensions.height)

  const progress = clampProgress(transition?.progress ?? 1)
  const easedProgress = easeInOutCubic(progress)
  const transitionSnapshot = transition?.fromSnapshot
  const slotWidth = transitionSnapshot
    ? transitionSnapshot.length > 0
      ? Math.max(0, dimensions.width - HORIZONTAL_PADDING * 2) / transitionSnapshot.length
      : 0
    : frame.snapshot.length > 0
      ? Math.max(0, dimensions.width - HORIZONTAL_PADDING * 2) / frame.snapshot.length
      : 0
  const movementOffsets = transitionSnapshot
    ? getMovementOffsets(transitionSnapshot, frame.snapshot, slotWidth, easedProgress)
    : undefined
  const operationOffsets = transition ? getOperationOffsets(transition, slotWidth, easedProgress) : undefined
  const resolvedOffsets = operationOffsets ?? movementOffsets
  const snapshot = transitionSnapshot && (resolvedOffsets || shouldPreserveSourceSnapshot(transition?.operation))
    ? transitionSnapshot
    : transition
      ? interpolateSnapshot(transition.fromSnapshot, frame.snapshot, easedProgress)
      : frame.snapshot
  const xOffsets = transitionSnapshot && resolvedOffsets ? resolvedOffsets : {}

  const bars = createBarDescriptors(snapshot, frame.states, dimensions, { xOffsets })

  for (const bar of bars) {
    context.fillStyle = semantics.barColors[bar.state]
    context.fillRect(bar.x, bar.y, bar.width, bar.height)
  }
}
