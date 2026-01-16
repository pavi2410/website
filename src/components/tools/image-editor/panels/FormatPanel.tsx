import { useState, useCallback } from 'react'
import { useStore } from '@nanostores/react'
import {
  $originalImage,
  $originalMeta,
  $transforms,
  $format,
  $quality,
  $targetFileSize,
  $outputDimensions,
  actions,
  type ImageFormat,
} from '@/stores/image-editor'
import IconDownload from '~icons/tabler/download'
import IconClipboard from '~icons/tabler/clipboard'

const FORMATS: { id: ImageFormat; label: string; lossy: boolean }[] = [
  { id: 'png', label: 'PNG', lossy: false },
  { id: 'jpeg', label: 'JPEG', lossy: true },
  { id: 'webp', label: 'WebP', lossy: true },
]

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

export default function FormatPanel() {
  const originalImage = useStore($originalImage)
  const meta = useStore($originalMeta)
  const transforms = useStore($transforms)
  const format = useStore($format)
  const quality = useStore($quality)
  const targetFileSize = useStore($targetFileSize)
  const outputDims = useStore($outputDimensions)

  const [isExporting, setIsExporting] = useState(false)
  const [isCopying, setIsCopying] = useState(false)
  const [copySuccess, setCopySuccess] = useState(false)
  const [estimatedSize, setEstimatedSize] = useState<number | null>(null)

  const selectedFormat = FORMATS.find(f => f.id === format)!

  const renderToBlob = useCallback(async (q: number = quality): Promise<Blob | null> => {
    if (!originalImage || !outputDims) return null

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return null

    let { width, height } = outputDims
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

    const sourceX = transforms.crop ? transforms.crop.x * originalImage.width : 0
    const sourceY = transforms.crop ? transforms.crop.y * originalImage.height : 0
    const sourceW = transforms.crop ? transforms.crop.width * originalImage.width : originalImage.width
    const sourceH = transforms.crop ? transforms.crop.height * originalImage.height : originalImage.height

    ctx.drawImage(
      originalImage,
      sourceX, sourceY, sourceW, sourceH,
      -width / 2, -height / 2, width, height
    )

    ctx.restore()

    return new Promise(resolve => {
      canvas.toBlob(
        blob => resolve(blob),
        `image/${format}`,
        selectedFormat.lossy ? q : undefined
      )
    })
  }, [originalImage, outputDims, transforms, format, quality, selectedFormat.lossy])

  const updateEstimatedSize = useCallback(async () => {
    const blob = await renderToBlob()
    if (blob) setEstimatedSize(blob.size)
  }, [renderToBlob])

  const handleQualityChange = (q: number) => {
    actions.setQuality(q)
    updateEstimatedSize()
  }

  const handleExport = async () => {
    setIsExporting(true)
    try {
      let blob: Blob | null = null

      if (targetFileSize) {
        let low = 0.1
        let high = 1.0
        let bestBlob: Blob | null = null

        for (let i = 0; i < 8; i++) {
          const mid = (low + high) / 2
          blob = await renderToBlob(mid)
          if (!blob) break

          if (blob.size <= targetFileSize) {
            bestBlob = blob
            low = mid
          } else {
            high = mid
          }
        }
        blob = bestBlob
      } else {
        blob = await renderToBlob()
      }

      if (!blob) {
        alert('Failed to export image')
        return
      }

      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      const baseName = meta?.name.replace(/\.[^.]+$/, '') ?? 'image'
      a.href = url
      a.download = `${baseName}-edited.${format === 'jpeg' ? 'jpg' : format}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
          Format
        </label>
        <div className="flex gap-1">
          {FORMATS.map(f => (
            <button
              key={f.id}
              onClick={() => {
                actions.setFormat(f.id)
                updateEstimatedSize()
              }}
              className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                format === f.id
                  ? 'bg-blue-600 dark:bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {selectedFormat.lossy && (
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
              Quality
            </label>
            <span className="text-xs text-gray-500 dark:text-gray-400 tabular-nums">
              {Math.round(quality * 100)}%
            </span>
          </div>
          <input
            type="range"
            min={10}
            max={100}
            value={Math.round(quality * 100)}
            onChange={e => handleQualityChange(parseInt(e.target.value, 10) / 100)}
            className="w-full"
          />
        </div>
      )}

      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
          Target File Size (optional)
        </label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={targetFileSize ? Math.round(targetFileSize / 1024) : ''}
            onChange={e => {
              const kb = parseInt(e.target.value, 10)
              actions.setTargetSize(isNaN(kb) || kb <= 0 ? null : kb * 1024)
            }}
            placeholder="e.g. 500"
            className="flex-1 px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-gray-100"
          />
          <span className="text-sm text-gray-500 dark:text-gray-400">KB</span>
        </div>
        {targetFileSize && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Quality will be auto-adjusted to meet target
          </p>
        )}
      </div>

      {estimatedSize && (
        <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-md">
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Estimated size: <span className="font-medium text-gray-900 dark:text-gray-100">{formatFileSize(estimatedSize)}</span>
          </p>
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={handleExport}
          disabled={isExporting}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
        >
          <IconDownload className="w-5 h-5" />
          {isExporting ? 'Saving...' : 'Download'}
        </button>
        <button
          onClick={async () => {
            setIsCopying(true)
            setCopySuccess(false)
            try {
              const blob = await renderToBlob()
              if (blob) {
                await navigator.clipboard.write([
                  new ClipboardItem({ [blob.type]: blob })
                ])
                setCopySuccess(true)
                setTimeout(() => setCopySuccess(false), 2000)
              }
            } catch (e) {
              console.error('Failed to copy:', e)
            } finally {
              setIsCopying(false)
            }
          }}
          disabled={isCopying}
          className={`px-4 py-3 rounded-lg font-medium transition-colors ${
            copySuccess
              ? 'bg-green-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'
          }`}
          title="Copy to clipboard"
        >
          <IconClipboard className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}
