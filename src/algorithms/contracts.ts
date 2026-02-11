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

export type SortingAlgorithmDefinition = {
  id: SortingAlgorithmId
  name: string
  run: SortAlgorithmRunner
}
