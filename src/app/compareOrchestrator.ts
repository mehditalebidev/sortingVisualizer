import type { SortStep, SortingAlgorithmId } from '@/algorithms'
import {
  createCompareRunSession,
  type CompareRunSession,
  type CompareRunStatus,
  type CreateCompareRunSessionOptions,
} from '@/app/compareSession'
import { createPlaybackController, type PlaybackController } from '@/visualizer'
import { resolvePlaybackCadence } from '@/state'

export type ComparePanelRuntime = {
  algorithmId: SortingAlgorithmId
  input: number[]
  steps: SortStep[]
  stepIndex: number
  step: SortStep
  status: CompareRunStatus
}

export type CompareOrchestratorState = {
  session: CompareRunSession
  speed: number
  arraySize: number
  panelStates: Record<SortingAlgorithmId, ComparePanelRuntime>
}

export type CompareOrchestrator = {
  getState: () => CompareOrchestratorState
  start: () => CompareOrchestratorState
  tick: () => CompareOrchestratorState
  pause: () => CompareOrchestratorState
  resume: () => CompareOrchestratorState
  reset: (nextSharedInput?: readonly number[]) => CompareOrchestratorState
  updateSpeed: (speed: number) => CompareOrchestratorState
}

export type CreateCompareOrchestratorOptions = {
  selectedAlgorithms: readonly SortingAlgorithmId[]
  sharedInput: readonly number[]
  speed: number
  arraySize: number
  sessionOptions?: CreateCompareRunSessionOptions
}

type PanelRuntimeInternal = {
  algorithmId: SortingAlgorithmId
  input: number[]
  steps: SortStep[]
  playback: PlaybackController
}

const fallbackStep: SortStep = {
  snapshot: [],
  comparedIndices: [],
  modifiedIndices: [],
  metadata: {
    operation: 'start',
  },
}

const resolveSessionStatus = (panels: Record<SortingAlgorithmId, ComparePanelRuntime>): CompareRunStatus => {
  const panelStates = Object.values(panels)

  if (panelStates.length > 0 && panelStates.every((panel) => panel.status === 'finished')) {
    return 'finished'
  }

  if (panelStates.some((panel) => panel.status === 'running')) {
    return 'running'
  }

  if (panelStates.some((panel) => panel.status === 'paused')) {
    return 'paused'
  }

  return 'idle'
}

const buildPanelRuntimeState = (
  panelRuntimes: Record<SortingAlgorithmId, PanelRuntimeInternal>,
): Record<SortingAlgorithmId, ComparePanelRuntime> => {
  const panelStates = {} as Record<SortingAlgorithmId, ComparePanelRuntime>

  Object.entries(panelRuntimes).forEach(([algorithmId, panelRuntime]) => {
    const playbackState = panelRuntime.playback.getState()

    panelStates[algorithmId as SortingAlgorithmId] = {
      algorithmId: panelRuntime.algorithmId,
      input: [...panelRuntime.input],
      steps: panelRuntime.steps,
      stepIndex: playbackState.stepIndex,
      step: playbackState.step ?? fallbackStep,
      status: playbackState.status,
    }
  })

  return panelStates
}

const createPanelRuntimes = (
  session: CompareRunSession,
): Record<SortingAlgorithmId, PanelRuntimeInternal> => {
  const panelRuntimes = {} as Record<SortingAlgorithmId, PanelRuntimeInternal>

  session.selectedAlgorithms.forEach((algorithmId) => {
    const panel = session.panels[algorithmId] as {
      input: number[]
      steps: SortStep[]
    }

    panelRuntimes[algorithmId] = {
      algorithmId,
      input: [...panel.input],
      steps: panel.steps,
      playback: createPlaybackController(panel.steps),
    }
  })

  return panelRuntimes
}

const cloneSessionWithStatus = (session: CompareRunSession, status: CompareRunStatus): CompareRunSession => {
  return {
    ...session,
    status,
  }
}

export const createCompareOrchestrator = (
  options: CreateCompareOrchestratorOptions,
): CompareOrchestrator => {
  let session = createCompareRunSession(
    options.selectedAlgorithms,
    options.sharedInput,
    options.sessionOptions,
  )
  let speed = options.speed
  const arraySize = options.arraySize
  let panelRuntimes = createPanelRuntimes(session)

  const getState = (): CompareOrchestratorState => {
    const panelStates = buildPanelRuntimeState(panelRuntimes)
    const sessionStatus = resolveSessionStatus(panelStates)

    session = cloneSessionWithStatus(session, sessionStatus)

    return {
      session,
      speed,
      arraySize,
      panelStates,
    }
  }

  const start = (): CompareOrchestratorState => {
    Object.values(panelRuntimes).forEach((panelRuntime) => {
      panelRuntime.playback.start()
    })

    return getState()
  }

  const tick = (): CompareOrchestratorState => {
    const currentState = getState()

    if (currentState.session.status !== 'running') {
      return currentState
    }

    const cadence = resolvePlaybackCadence(speed, arraySize)

    Object.values(panelRuntimes).forEach((panelRuntime) => {
      for (let iteration = 0; iteration < cadence.stepsPerTick; iteration += 1) {
        const state = panelRuntime.playback.getState()

        if (state.status !== 'running') {
          break
        }

        panelRuntime.playback.tick()
      }
    })

    return getState()
  }

  const pause = (): CompareOrchestratorState => {
    Object.values(panelRuntimes).forEach((panelRuntime) => {
      panelRuntime.playback.pause()
    })

    return getState()
  }

  const resume = (): CompareOrchestratorState => {
    Object.values(panelRuntimes).forEach((panelRuntime) => {
      panelRuntime.playback.resume()
    })

    return getState()
  }

  const reset = (nextSharedInput?: readonly number[]): CompareOrchestratorState => {
    const sharedInput = nextSharedInput ? [...nextSharedInput] : session.sharedInput

    session = createCompareRunSession(session.selectedAlgorithms, sharedInput, options.sessionOptions)
    panelRuntimes = createPanelRuntimes(session)

    return getState()
  }

  const updateSpeed = (nextSpeed: number): CompareOrchestratorState => {
    speed = nextSpeed
    return getState()
  }

  return {
    getState,
    start,
    tick,
    pause,
    resume,
    reset,
    updateSpeed,
  }
}
