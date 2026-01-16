import { useStore } from '@nanostores/react'
import { $originalMeta, $outputDimensions, $format, $quality } from '@/stores/image-editor'

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

export default function ImageInfo() {
  const meta = useStore($originalMeta)
  const outputDims = useStore($outputDimensions)
  const format = useStore($format)
  const quality = useStore($quality)

  if (!meta) return null

  const hasChanges = outputDims && (
    outputDims.width !== meta.width ||
    outputDims.height !== meta.height ||
    format !== meta.type.split('/')[1]
  )

  return (
    <div className="shrink-0 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-4 py-2">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-4 text-gray-600 dark:text-gray-400">
          <span>
            <span className="font-medium text-gray-900 dark:text-gray-100">Original:</span>{' '}
            {meta.width} × {meta.height} {meta.type.split('/')[1].toUpperCase()} ({formatFileSize(meta.size)})
          </span>
        </div>

        {hasChanges && outputDims && (
          <div className="flex items-center gap-4 text-gray-600 dark:text-gray-400">
            <span>
              <span className="font-medium text-gray-900 dark:text-gray-100">Output:</span>{' '}
              {outputDims.width} × {outputDims.height} {format.toUpperCase()}
              {format !== 'png' && ` (${Math.round(quality * 100)}%)`}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
