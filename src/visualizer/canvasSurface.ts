import { defaultDimensions } from '@/visualizer/dimensions'

export type CanvasSurface = {
  canvas: HTMLCanvasElement
  context: CanvasRenderingContext2D
  cssWidth: number
  cssHeight: number
  pixelRatio: number
}

export type SurfaceDimensions = {
  width: number
  height: number
}

const MIN_SIZE = 1

const clampSize = (value: number): number => {
  if (!Number.isFinite(value)) {
    return MIN_SIZE
  }

  return Math.max(MIN_SIZE, Math.floor(value))
}

export const getPixelRatio = (devicePixelRatio?: number): number => {
  const ratio = devicePixelRatio ?? window.devicePixelRatio ?? 1
  return ratio > 0 ? ratio : 1
}

export const configureCanvasSurface = (
  canvas: HTMLCanvasElement,
  dimensions: SurfaceDimensions,
  devicePixelRatio?: number,
): CanvasSurface => {
  const context = canvas.getContext('2d')

  if (!context) {
    throw new Error('Unable to initialize 2D canvas context')
  }

  const pixelRatio = getPixelRatio(devicePixelRatio)
  const cssWidth = clampSize(dimensions.width)
  const cssHeight = clampSize(dimensions.height)
  const pixelWidth = clampSize(cssWidth * pixelRatio)
  const pixelHeight = clampSize(cssHeight * pixelRatio)

  canvas.style.width = `${cssWidth}px`
  canvas.style.height = `${cssHeight}px`
  canvas.width = pixelWidth
  canvas.height = pixelHeight

  context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)

  return {
    canvas,
    context,
    cssWidth,
    cssHeight,
    pixelRatio,
  }
}

export const getResponsiveDimensions = (
  canvas: HTMLCanvasElement,
  fallback: SurfaceDimensions = defaultDimensions,
): SurfaceDimensions => {
  const bounds = canvas.getBoundingClientRect()
  const width = clampSize(bounds.width || fallback.width)
  const aspectRatio = fallback.width / fallback.height
  const height = clampSize(width / aspectRatio)

  return {
    width,
    height,
  }
}
