import { useStore } from '@nanostores/react'
import {
  $canUndo,
  $canRedo,
  $hasChanges,
  $zoom,
  $isComparing,
  $originalImage,
  $originalMeta,
  actions,
} from '@/stores/image-editor'
import IconArrowBackUp from '~icons/tabler/arrow-back-up'
import IconArrowForwardUp from '~icons/tabler/arrow-forward-up'
import IconRefresh from '~icons/tabler/refresh'
import IconZoomIn from '~icons/tabler/zoom-in'
import IconZoomOut from '~icons/tabler/zoom-out'
import IconEye from '~icons/tabler/eye'
import IconX from '~icons/tabler/x'

export default function Toolbar() {
  const canUndo = useStore($canUndo)
  const canRedo = useStore($canRedo)
  const hasChanges = useStore($hasChanges)
  const zoom = useStore($zoom)
  const isComparing = useStore($isComparing)
  const meta = useStore($originalMeta)

  const zoomOptions = [0.25, 0.5, 0.75, 1, 1.5, 2, 3]

  // Truncate filename if too long
  const displayName = meta?.name
    ? meta.name.length > 24
      ? meta.name.slice(0, 21) + '...'
      : meta.name
    : 'Image'

  return (
    <div className="shrink-0 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-4 py-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Filename */}
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 max-w-[150px] truncate" title={meta?.name}>
            {displayName}
          </span>
          <div className="w-px h-5 bg-gray-300 dark:bg-gray-600" />
          <div className="flex items-center gap-1">
          <button
            onClick={actions.undo}
            disabled={!canUndo}
            className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            title="Undo (Ctrl+Z)"
          >
            <IconArrowBackUp className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </button>
          <button
            onClick={actions.redo}
            disabled={!canRedo}
            className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            title="Redo (Ctrl+Shift+Z)"
          >
            <IconArrowForwardUp className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </button>

          <div className="w-px h-5 bg-gray-300 dark:bg-gray-600 mx-2" />

          <button
            onClick={actions.reset}
            disabled={!hasChanges}
            className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            title="Reset all changes"
          >
            <IconRefresh className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <button
              onClick={() => actions.setZoom(Math.max(0.1, zoom - 0.25))}
              className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              title="Zoom out"
            >
              <IconZoomOut className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </button>
            <select
              value={zoom}
              onChange={e => {
                const val = e.target.value
                if (val === 'fit') {
                  // Fit will be handled by setting zoom to a special value
                  // For now, reset to 1 (100%) as a sensible default
                  actions.setZoom(1)
                } else {
                  actions.setZoom(parseFloat(val))
                }
              }}
              className="px-2 py-1 text-xs font-medium bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-gray-700 dark:text-gray-300"
            >
              <option value={1}>Fit</option>
              {zoomOptions.map(z => (
                <option key={z} value={z}>{Math.round(z * 100)}%</option>
              ))}
            </select>
            <button
              onClick={() => actions.setZoom(Math.min(3, zoom + 0.25))}
              className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              title="Zoom in"
            >
              <IconZoomIn className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </button>
          </div>

          <div className="w-px h-5 bg-gray-300 dark:bg-gray-600 mx-1" />

          <button
            onClick={actions.toggleCompare}
            className={`p-1.5 rounded transition-colors ${
              isComparing
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                : 'hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
            title="Compare with original"
          >
            <IconEye className="w-5 h-5" />
          </button>

          <div className="w-px h-5 bg-gray-300 dark:bg-gray-600 mx-1" />

          <button
            onClick={actions.clearImage}
            className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            title="Close image"
          >
            <IconX className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </button>
        </div>
      </div>
    </div>
  )
}
