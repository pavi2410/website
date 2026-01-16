import { useRef, useEffect, useCallback } from 'react'
import { useStore } from '@nanostores/react'
import {
  $originalImage,
  $transforms,
  $zoom,
  $isComparing,
  $isCropping,
} from '@/stores/image-editor'

export default function ImageCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const originalImage = useStore($originalImage)
  const transforms = useStore($transforms)
  const zoom = useStore($zoom)
  const isComparing = useStore($isComparing)
  const isCropping = useStore($isCropping)

  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx || !originalImage) return

    let { width, height } = originalImage

    if (transforms.crop && !isCropping) {
      width = Math.round(width * transforms.crop.width)
      height = Math.round(height * transforms.crop.height)
    }

    if (transforms.resize) {
      width = transforms.resize.width
      height = transforms.resize.height
    }

    const isRotated = transforms.rotation === 90 || transforms.rotation === 270
    canvas.width = isRotated ? height : width
    canvas.height = isRotated ? width : height

    ctx.save()
    ctx.translate(canvas.width / 2, canvas.height / 2)
    ctx.rotate((transforms.rotation * Math.PI) / 180)
    ctx.scale(transforms.flipH ? -1 : 1, transforms.flipV ? -1 : 1)

    const filterParts: string[] = []
    if (transforms.brightness !== 0) {
      filterParts.push(`brightness(${1 + transforms.brightness / 100})`)
    }
    if (transforms.contrast !== 0) {
      filterParts.push(`contrast(${1 + transforms.contrast / 100})`)
    }
    if (transforms.saturation !== 0) {
      filterParts.push(`saturate(${1 + transforms.saturation / 100})`)
    }
    if (filterParts.length > 0) {
      ctx.filter = filterParts.join(' ')
    }

    const sourceX = transforms.crop && !isCropping ? transforms.crop.x * originalImage.width : 0
    const sourceY = transforms.crop && !isCropping ? transforms.crop.y * originalImage.height : 0
    const sourceW = transforms.crop && !isCropping ? transforms.crop.width * originalImage.width : originalImage.width
    const sourceH = transforms.crop && !isCropping ? transforms.crop.height * originalImage.height : originalImage.height

    const destW = transforms.resize?.width ?? (transforms.crop && !isCropping ? Math.round(originalImage.width * transforms.crop.width) : originalImage.width)
    const destH = transforms.resize?.height ?? (transforms.crop && !isCropping ? Math.round(originalImage.height * transforms.crop.height) : originalImage.height)

    ctx.drawImage(
      originalImage,
      sourceX, sourceY, sourceW, sourceH,
      -destW / 2, -destH / 2, destW, destH
    )

    ctx.restore()
  }, [originalImage, transforms, isCropping])

  useEffect(() => {
    if (isComparing) return
    renderCanvas()
  }, [renderCanvas, isComparing])

  useEffect(() => {
    if (!isComparing) return
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx || !originalImage) return

    canvas.width = originalImage.width
    canvas.height = originalImage.height
    ctx.drawImage(originalImage, 0, 0)
  }, [isComparing, originalImage])

  if (!originalImage) return null

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-auto bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-4"
      style={{
        backgroundImage: `
          linear-gradient(45deg, #e5e7eb 25%, transparent 25%),
          linear-gradient(-45deg, #e5e7eb 25%, transparent 25%),
          linear-gradient(45deg, transparent 75%, #e5e7eb 75%),
          linear-gradient(-45deg, transparent 75%, #e5e7eb 75%)
        `,
        backgroundSize: '20px 20px',
        backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
      }}
    >
      <canvas
        ref={canvasRef}
        className="shadow-lg"
        style={{
          transform: `scale(${zoom})`,
          transformOrigin: 'center',
          imageRendering: zoom > 1 ? 'pixelated' : 'auto',
        }}
      />
    </div>
  )
}
