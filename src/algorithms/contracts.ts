export type SortStepOperation =
  | 'start'
  | 'compare'
  | 'swap'
  | 'shift'
  | 'write'
  | 'insert'
  | 'partition'
  | 'partition-complete'
  | 'merge-range'
  | 'range-sorted'
  | 'pass-complete'
  | 'sorted'

export type SortRange = {
  start: number
  end: number
}

export type SortStepMetadata = {
  operation: SortStepOperation
  pass?: number
  range?: SortRange
  pivotIndex?: number
  partitionIndex?: number
}

export type SortStep = {
  snapshot: number[]
  comparedIndices: number[]
  modifiedIndices: number[]
  metadata?: SortStepMetadata
}

export type SortingAlgorithmId =
  | 'bubble-sort'
  | 'insertion-sort'
  | 'selection-sort'
  | 'merge-sort'
  | 'quick-sort'

export type SortAlgorithmRunner = (input: readonly number[]) => SortStep[]

export type SortStepSink = {
  push: (
    values: readonly number[],
    comparedIndices: readonly number[],
    modifiedIndices: readonly number[],
    metadata?: SortStepMetadata,
  ) => void
}

export type SortStepEmitter = (input: readonly number[], sink: SortStepSink) => void

export type SortingAlgorithmDefinition = {
  id: SortingAlgorithmId
  name: string
  /** Materializes every step with a full snapshot. Prefer `emit` + a step track for large inputs. */
  run: SortAlgorithmRunner
  emit: SortStepEmitter
}
