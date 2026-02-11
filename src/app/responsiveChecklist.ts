export const responsiveBreakpoints = {
  mobileMaxWidth: 639,
  tabletMaxWidth: 1023,
} as const

export type LayoutMode = 'mobile' | 'tablet' | 'desktop'

export type ClarityChecklistItem = {
  id: string
  label: string
}

export const visualClarityChecklist: ClarityChecklistItem[] = [
  {
    id: 'controls-state',
    label: 'Controls remain readable and usable in idle, running, paused, and finished states.',
  },
  {
    id: 'spacing',
    label: 'Control spacing and typography stay legible at mobile and desktop widths.',
  },
  {
    id: 'contrast',
    label: 'Canvas and UI text maintain clear color contrast against panel backgrounds.',
  },
  {
    id: 'highlight-semantics',
    label: 'Compared, modified, and completed bars are visually distinct and consistent with legend text.',
  },
  {
    id: 'flicker-free',
    label: 'Playback avoids obvious flicker or jank during normal speed ranges.',
  },
] as const

export const getLayoutMode = (viewportWidth: number): LayoutMode => {
  if (viewportWidth <= responsiveBreakpoints.mobileMaxWidth) {
    return 'mobile'
  }

  if (viewportWidth <= responsiveBreakpoints.tabletMaxWidth) {
    return 'tablet'
  }

  return 'desktop'
}
