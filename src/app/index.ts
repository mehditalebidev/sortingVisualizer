export const appName = 'Sorting Visualizer'

export { getLayoutMode, responsiveBreakpoints, visualClarityChecklist } from '@/app/responsiveChecklist'
export type { ClarityChecklistItem, LayoutMode } from '@/app/responsiveChecklist'
export {
  compareSessionSyncGuarantees,
  createCompareRunSession,
  createSingleAlgorithmSession,
  toSingleRunExecution,
} from '@/app/compareSession'
export type {
  ComparePanelRun,
  CompareRunSession,
  CompareRunStatus,
  CompareSessionSyncGuarantees,
  CreateCompareRunSessionOptions,
} from '@/app/compareSession'
