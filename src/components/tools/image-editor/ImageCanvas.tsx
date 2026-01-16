import { useRef, useEffect, useCallback, useState } from 'react'
import { useStore } from '@nanostores/react'
import {
  $originalImage,
  $transforms,
  $zoom,
  $isComparing,
  $isCropping,
  $cropSelection,
  $format,
  $quality,
  $estimatedFileSize,
} from '@/stores/image-editor'

export default function ImageCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const cropOverlayRef = useRef<HTMLDivElement>(null)
  const originalImage = useStore($originalImage)
  const transforms = useStore($transforms)
  const zoom = useStore($zoom)
  const isComparing = useStore($isComparing)
  const isCropping = useStore($isCropping)
  const cropSelection = useStore($cropSelection)
  const format = useStore($format)
  const quality = useStore($quality)

  // Local drag state
  const [isDragging, setIsDragging] = useState(false)
  const [dragMode, setDragMode] = useState<'move' | 'resize' | null>(null)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  // Initialize crop selection when entering crop mode
  useEffect(() => {
    if (isCropping && originalImage) {
      if (transforms.crop) {
        $cropSelection.set(transforms.crop)
      } else {
        $cropSelection.set({ x: 0, y: 0, width: 1, height: 1 })
      }
    }
  }, [isCropping, originalImage, transforms.crop])

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

    // Estimate file size
    const mimeType = format === 'jpeg' ? 'image/jpeg' : format === 'webp' ? 'image/webp' : 'image/png'
    const q = format === 'png' ? undefined : quality
    canvas.toBlob(
      (blob) => {
        if (blob) {
          $estimatedFileSize.set(blob.size)
        }
      },
      mimeType,
      q
    )
  }, [originalImage, transforms, isCropping, format, quality])

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

  // Crop overlay mouse handlers
  const handleCropMouseDown = (e: React.MouseEvent, mode: 'move' | 'resize') => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
    setDragMode(mode)
    setDragStart({ x: e.clientX, y: e.clientY })
  }

  const handleCropMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !dragMode || !cropOverlayRef.current) return

    const overlay = cropOverlayRef.current
    const rect = overlay.getBoundingClientRect()
    const deltaX = (e.clientX - dragStart.x) / rect.width
    const deltaY = (e.clientY - dragStart.y) / rect.height

    const prev = $cropSelection.get()
    if (dragMode === 'move') {
      const newX = Math.max(0, Math.min(1 - prev.width, prev.x + deltaX))
      const newY = Math.max(0, Math.min(1 - prev.height, prev.y + deltaY))
      $cropSelection.set({ ...prev, x: newX, y: newY })
    } else {
      const newW = Math.max(0.1, Math.min(1 - prev.x, prev.width + deltaX))
      const newH = Math.max(0.1, Math.min(1 - prev.y, prev.height + deltaY))
      $cropSelection.set({ ...prev, width: newW, height: newH })
    }

    setDragStart({ x: e.clientX, y: e.clientY })
  }, [isDragging, dragMode, dragStart])

  const handleCropMouseUp = useCallback(() => {
    setIsDragging(false)
    setDragMode(null)
  }, [])

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleCropMouseMove)
      window.addEventListener('mouseup', handleCropMouseUp)
      return () => {
        window.removeEventListener('mousemove', handleCropMouseMove)
        window.removeEventListener('mouseup', handleCropMouseUp)
      }
    }
  }, [isDragging, handleCropMouseMove, handleCropMouseUp])

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
      <div className="relative" style={{ transform: `scale(${zoom})`, transformOrigin: 'center' }}>
        <canvas
          ref={canvasRef}
          className="shadow-lg"
          style={{
            imageRendering: zoom > 1 ? 'pixelated' : 'auto',
          }}
        />
        
        {/* Crop overlay */}
        {isCropping && (
          <div
            ref={cropOverlayRef}
            className="absolute inset-0 pointer-events-none"
          >
            {/* Darkened areas outside crop */}
            <div className="absolute inset-0 bg-black/50" />
            
            {/* Crop selection area */}
            <div
              className="absolute bg-transparent border-2 border-white border-dashed pointer-events-auto cursor-move"
              style={{
                left: `${cropSelection.x * 100}%`,
                top: `${cropSelection.y * 100}%`,
                width: `${cropSelection.width * 100}%`,
                height: `${cropSelection.height * 100}%`,
                boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)',
              }}
              onMouseDown={(e) => handleCropMouseDown(e, 'move')}
            >
              {/* Resize handle */}
              <div
                className="absolute bottom-0 right-0 w-4 h-4 bg-white border border-gray-400 cursor-se-resize"
                style={{ transform: 'translate(50%, 50%)' }}
                onMouseDown={(e) => handleCropMouseDown(e, 'resize')}
              />
              
              {/* Corner handles for visual feedback */}
              <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-white" />
              <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-white" />
              <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-white" />
              <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-white" />
              
              {/* Center crosshair */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="w-4 h-0.5 bg-white/70" />
                <div className="w-0.5 h-4 bg-white/70 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
              
              {/* Dimensions label */}
              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-white bg-black/70 px-2 py-0.5 rounded whitespace-nowrap">
                {Math.round(originalImage.width * cropSelection.width)} × {Math.round(originalImage.height * cropSelection.height)}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
