import type {
  SortStep,
  SortStepEmitter,
  SortStepMetadata,
  SortStepOperation,
  SortStepSink,
} from '@/algorithms/contracts'

/**
 * Read-only, array-like view over sort steps. Plain `SortStep[]` arrays satisfy it,
 * as does the compact `StepTrack` used at runtime.
 */
export type StepSequence = {
  readonly length: number
  at: (index: number) => SortStep | undefined
  operationAt?: (index: number) => SortStepOperation | undefined
}

/** Receives steps as an algorithm runs. `values` is the live working array. */
export type StepSink = SortStepSink

export type StepTrack = StepSequence & {
  operationAt: (index: number) => SortStepOperation | undefined
}

export type StepTrackRecorder = StepSink & {
  finish: () => StepTrack
}

export type StepTrackOptions = {
  checkpointInterval?: number
}

const operationCodes: readonly SortStepOperation[] = [
  'start',
  'compare',
  'swap',
  'shift',
  'write',
  'insert',
  'partition',
  'partition-complete',
  'merge-range',
  'range-sorted',
  'pass-complete',
  'sorted',
]

const operationCodeByName = new Map(operationCodes.map((operation, index) => [operation, index + 1]))

const NO_METADATA = 0
const ABSENT = -2147483648
const MIN_CHECKPOINT_INTERVAL = 64

type NumericArray = {
  length: number
  [index: number]: number
  set: (array: ArrayLike<number>, offset?: number) => void
  slice: (start?: number, end?: number) => NumericArray
}

type GrowableBuffer<T extends NumericArray> = {
  push: (value: number) => void
  size: () => number
  data: () => T
  /** Drops unused capacity once recording is complete. */
  trim: () => void
}

const createGrowableBuffer = <T extends NumericArray>(create: (length: number) => T): GrowableBuffer<T> => {
  let data = create(64)
  let size = 0

  return {
    push: (value) => {
      if (size === data.length) {
        const next = create(Math.max(64, data.length * 2))
        next.set(data)
        data = next
      }

      data[size] = value
      size += 1
    },
    size: () => size,
    data: () => data,
    trim: () => {
      if (size < data.length) {
        const next = create(size)
        next.set(data.slice(0, size))
        data = next
      }
    },
  }
}

const int32 = (length: number) => new Int32Array(length)
const uint32 = (length: number) => new Uint32Array(length)
const float64 = (length: number) => new Float64Array(length)

const optional = (value: number | undefined): number => {
  return value === undefined || !Number.isInteger(value) ? ABSENT : value
}

/**
 * Records steps compactly: per step only operation metadata, indices, and the values
 * written since the previous step are stored, plus periodic full checkpoints. Full
 * snapshots are rebuilt on demand, so memory grows with the number of steps rather
 * than steps x array length.
 *
 * Writes are detected on the step's compared and modified indices, which every
 * algorithm lists for any position it changes.
 */
export const createStepTrackRecorder = (
  initialValues: readonly number[],
  options: StepTrackOptions = {},
): StepTrackRecorder => {
  const size = initialValues.length
  const checkpointInterval = Math.max(
    1,
    Math.floor(options.checkpointInterval ?? Math.max(MIN_CHECKPOINT_INTERVAL, size * 4)),
  )
  const shadow = Float64Array.from(initialValues)
  const checkpoints: Float64Array[] = []

  const operations = createGrowableBuffer(int32)
  const pass = createGrowableBuffer(int32)
  const rangeStart = createGrowableBuffer(int32)
  const rangeEnd = createGrowableBuffer(int32)
  const pivotIndex = createGrowableBuffer(int32)
  const partitionIndex = createGrowableBuffer(int32)
  const comparedOffsets = createGrowableBuffer(uint32)
  const comparedData = createGrowableBuffer(int32)
  const modifiedOffsets = createGrowableBuffer(uint32)
  const modifiedData = createGrowableBuffer(int32)
  const writeOffsets = createGrowableBuffer(uint32)
  const writeIndices = createGrowableBuffer(int32)
  const writeValues = createGrowableBuffer(float64)

  comparedOffsets.push(0)
  modifiedOffsets.push(0)
  writeOffsets.push(0)

  let stepCount = 0
  let finished = false

  const recordWrite = (values: readonly number[], index: number): void => {
    const value = values[index]

    if (value === undefined || index < 0 || index >= size || Object.is(shadow[index], value)) {
      return
    }

    shadow[index] = value
    writeIndices.push(index)
    writeValues.push(value)
  }

  const push: StepSink['push'] = (values, comparedIndices, modifiedIndices, metadata) => {
    if (finished) {
      throw new Error('Cannot record steps after the track is finished')
    }

    for (const index of comparedIndices) {
      comparedData.push(index)
      recordWrite(values, index)
    }

    for (const index of modifiedIndices) {
      modifiedData.push(index)
      recordWrite(values, index)
    }

    comparedOffsets.push(comparedData.size())
    modifiedOffsets.push(modifiedData.size())
    writeOffsets.push(writeIndices.size())

    operations.push(metadata ? (operationCodeByName.get(metadata.operation) ?? NO_METADATA) : NO_METADATA)
    pass.push(optional(metadata?.pass))
    rangeStart.push(optional(metadata?.range?.start))
    rangeEnd.push(optional(metadata?.range?.end))
    pivotIndex.push(optional(metadata?.pivotIndex))
    partitionIndex.push(optional(metadata?.partitionIndex))

    if (stepCount % checkpointInterval === 0) {
      checkpoints.push(Float64Array.from(shadow))
    }

    stepCount += 1
  }

  const finish = (): StepTrack => {
    finished = true
    const length = stepCount

    for (const buffer of [
      operations,
      pass,
      rangeStart,
      rangeEnd,
      pivotIndex,
      partitionIndex,
      comparedOffsets,
      comparedData,
      modifiedOffsets,
      modifiedData,
      writeOffsets,
      writeIndices,
      writeValues,
    ]) {
      buffer.trim()
    }

    const cursor = new Float64Array(size)
    let cursorIndex = -1
    let cached: { index: number; step: SortStep } | undefined

    const resolveIndex = (index: number): number | undefined => {
      const integerIndex = Math.trunc(index)
      const resolved = integerIndex < 0 ? length + integerIndex : integerIndex
      return Number.isNaN(resolved) || resolved < 0 || resolved >= length ? undefined : resolved
    }

    const moveCursorTo = (target: number): void => {
      if (cursorIndex > target || cursorIndex < 0 || target - cursorIndex > checkpointInterval) {
        const checkpointIndex = Math.floor(target / checkpointInterval)
        const checkpoint = checkpoints[checkpointIndex]

        if (checkpoint) {
          cursor.set(checkpoint)
          cursorIndex = checkpointIndex * checkpointInterval
        }
      }

      const offsets = writeOffsets.data()
      const indices = writeIndices.data()
      const values = writeValues.data()

      for (let step = cursorIndex + 1; step <= target; step += 1) {
        for (let write = offsets[step] ?? 0; write < (offsets[step + 1] ?? 0); write += 1) {
          cursor[indices[write] ?? 0] = values[write] ?? 0
        }
      }

      cursorIndex = target
    }

    const readIndices = (offsets: Uint32Array, data: Int32Array, step: number): number[] => {
      return Array.from(data.subarray(offsets[step] ?? 0, offsets[step + 1] ?? 0))
    }

    const readMetadata = (step: number): SortStepMetadata | undefined => {
      const operation = operationCodes[(operations.data()[step] ?? NO_METADATA) - 1]

      if (!operation) {
        return undefined
      }

      const metadata: SortStepMetadata = { operation }
      const stepPass = pass.data()[step] ?? ABSENT
      const start = rangeStart.data()[step] ?? ABSENT
      const end = rangeEnd.data()[step] ?? ABSENT
      const pivot = pivotIndex.data()[step] ?? ABSENT
      const partition = partitionIndex.data()[step] ?? ABSENT

      if (stepPass !== ABSENT) {
        metadata.pass = stepPass
      }

      if (start !== ABSENT && end !== ABSENT) {
        metadata.range = { start, end }
      }

      if (pivot !== ABSENT) {
        metadata.pivotIndex = pivot
      }

      if (partition !== ABSENT) {
        metadata.partitionIndex = partition
      }

      return metadata
    }

    const at = (index: number): SortStep | undefined => {
      const step = resolveIndex(index)

      if (step === undefined) {
        return undefined
      }

      if (cached?.index === step) {
        return cached.step
      }

      moveCursorTo(step)

      const materialized: SortStep = {
        snapshot: Array.from(cursor),
        comparedIndices: readIndices(comparedOffsets.data(), comparedData.data(), step),
        modifiedIndices: readIndices(modifiedOffsets.data(), modifiedData.data(), step),
        metadata: readMetadata(step),
      }

      cached = { index: step, step: materialized }
      return materialized
    }

    const operationAt = (index: number): SortStepOperation | undefined => {
      const step = resolveIndex(index)
      return step === undefined ? undefined : operationCodes[(operations.data()[step] ?? NO_METADATA) - 1]
    }

    return {
      length,
      at,
      operationAt,
    }
  }

  return {
    push,
    finish,
  }
}

/** Sink that keeps a full snapshot per step (reference behaviour, used by tests and small runs). */
export const createArrayStepSink = (): StepSink & { steps: SortStep[] } => {
  const steps: SortStep[] = []

  return {
    steps,
    push: (values, comparedIndices, modifiedIndices, metadata) => {
      steps.push({
        snapshot: [...values],
        comparedIndices: [...comparedIndices],
        modifiedIndices: [...modifiedIndices],
        metadata,
      })
    },
  }
}

export const materializeSteps = (sequence: StepSequence): SortStep[] => {
  return Array.from({ length: sequence.length }, (_, index) => sequence.at(index)).filter(
    (step): step is SortStep => step !== undefined,
  )
}

export type StepEmitter = SortStepEmitter

export const collectSteps = (input: readonly number[], emit: StepEmitter): SortStep[] => {
  const sink = createArrayStepSink()
  emit(input, sink)
  return sink.steps
}

export const recordSteps = (
  input: readonly number[],
  emit: StepEmitter,
  options?: StepTrackOptions,
): StepTrack => {
  const recorder = createStepTrackRecorder(input, options)
  emit(input, recorder)
  return recorder.finish()
}
