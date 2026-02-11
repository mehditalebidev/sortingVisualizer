import { describe, expect, it } from 'vitest'

import {
  getLayoutMode,
  responsiveBreakpoints,
  visualClarityChecklist,
} from '@/app/responsiveChecklist'

describe('responsive checklist', () => {
  it('maps viewport widths to deterministic layout modes', () => {
    expect(getLayoutMode(375)).toBe('mobile')
    expect(getLayoutMode(responsiveBreakpoints.mobileMaxWidth)).toBe('mobile')
    expect(getLayoutMode(768)).toBe('tablet')
    expect(getLayoutMode(responsiveBreakpoints.tabletMaxWidth)).toBe('tablet')
    expect(getLayoutMode(1280)).toBe('desktop')
  })

  it('documents a clarity checklist aligned with UI sanity expectations', () => {
    expect(visualClarityChecklist.length).toBeGreaterThanOrEqual(5)
    expect(visualClarityChecklist.map((item) => item.id)).toEqual([
      'controls-state',
      'spacing',
      'contrast',
      'highlight-semantics',
      'flicker-free',
    ])
  })

  it('uses explicit breakpoint boundaries for mobile and desktop expectations', () => {
    expect(responsiveBreakpoints.mobileMaxWidth).toBeLessThan(responsiveBreakpoints.tabletMaxWidth)
    expect(getLayoutMode(responsiveBreakpoints.mobileMaxWidth + 1)).toBe('tablet')
    expect(getLayoutMode(responsiveBreakpoints.tabletMaxWidth + 1)).toBe('desktop')
  })
})
