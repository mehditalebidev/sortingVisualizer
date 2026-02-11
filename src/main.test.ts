import { screen } from '@testing-library/dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

describe('app scaffold', () => {
  beforeEach(() => {
    vi.resetModules()
    window.history.replaceState({}, '', '/')
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(() => {
      return {
        clearRect: vi.fn(),
        fillRect: vi.fn(),
        fillText: vi.fn(),
        setTransform: vi.fn(),
        font: '9px sans-serif',
        textAlign: 'center',
        textBaseline: 'alphabetic',
      } as unknown as CanvasRenderingContext2D
    })
    document.body.innerHTML = '<div id="app"></div>'
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders the base heading', async () => {
    await import('./main')

    expect(screen.getByRole('heading', { name: /sorting visualizer/i })).toBeTruthy()
  })

  it('renders compare page on /compare route', async () => {
    window.history.replaceState({}, '', '/compare')

    await import('./main')

    expect(screen.getByText('Algorithm Comparison')).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Single View' }).getAttribute('href')).toBe('/')
  })

  it('throws when app root is missing', async () => {
    document.body.innerHTML = ''

    await expect(import('./main')).rejects.toThrowError('App root not found')
  })
})
