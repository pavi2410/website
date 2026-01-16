import { useState, useEffect } from 'react'
import { useStore } from '@nanostores/react'
import { $originalMeta, $transforms, $isCropping, $cropSelection, actions } from '@/stores/image-editor'

const ASPECT_PRESETS = [
  { label: 'Free', ratio: null },
  { label: '1:1', ratio: 1 },
  { label: '16:9', ratio: 16 / 9 },
  { label: '4:3', ratio: 4 / 3 },
  { label: '3:2', ratio: 3 / 2 },
  { label: '9:16', ratio: 9 / 16 },
  { label: '3:4', ratio: 3 / 4 },
  { label: '2:3', ratio: 2 / 3 },
]

export default function CropPanel() {
  const meta = useStore($originalMeta)
  const transforms = useStore($transforms)
  const isCropping = useStore($isCropping)
  const cropSelection = useStore($cropSelection)

  const [selectedRatio, setSelectedRatio] = useState<number | null>(null)

  if (!meta) return null

  // Sync input values with shared crop selection
  const cropX = (cropSelection.x * 100).toFixed(1)
  const cropY = (cropSelection.y * 100).toFixed(1)
  const cropW = (cropSelection.width * 100).toFixed(1)
  const cropH = (cropSelection.height * 100).toFixed(1)

  const updateCropSelection = (field: 'x' | 'y' | 'width' | 'height', value: string) => {
    const numValue = parseFloat(value) / 100
    if (isNaN(numValue)) return
    $cropSelection.set({ ...cropSelection, [field]: Math.max(0, Math.min(1, numValue)) })
  }

  const handlePresetClick = (ratio: number | null) => {
    setSelectedRatio(ratio)

    if (ratio === null) {
      $cropSelection.set({ x: 0, y: 0, width: 1, height: 1 })
      return
    }

    const imageRatio = meta.width / meta.height

    let cropWidth: number
    let cropHeight: number

    if (ratio > imageRatio) {
      cropWidth = 1
      cropHeight = imageRatio / ratio
    } else {
      cropHeight = 1
      cropWidth = ratio / imageRatio
    }

    const x = (1 - cropWidth) / 2
    const y = (1 - cropHeight) / 2

    $cropSelection.set({ x, y, width: cropWidth, height: cropHeight })
  }

  const applyCrop = () => {
    const { x, y, width, height } = cropSelection

    if (x < 0 || y < 0 || width <= 0 || height <= 0 || x + width > 1.001 || y + height > 1.001) {
      return
    }

    actions.setCrop({ x, y, width, height })
    actions.setIsCropping(false)
  }

  const startCropping = () => {
    actions.setIsCropping(true)
    if (transforms.crop) {
      $cropSelection.set(transforms.crop)
    } else {
      $cropSelection.set({ x: 0, y: 0, width: 1, height: 1 })
    }
  }

  const cancelCrop = () => {
    actions.setIsCropping(false)
    $cropSelection.set({ x: 0, y: 0, width: 1, height: 1 })
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
          Aspect Ratio
        </label>
        <div className="grid grid-cols-4 gap-1">
          {ASPECT_PRESETS.map(preset => (
            <button
              key={preset.label}
              onClick={() => handlePresetClick(preset.ratio)}
              className={`px-2 py-1.5 text-xs font-medium rounded transition-colors ${
                selectedRatio === preset.ratio
                  ? 'bg-blue-600 dark:bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
          Crop Region (%)
        </label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[10px] text-gray-500 dark:text-gray-400 mb-1">X</label>
            <input
              type="number"
              value={cropX}
              onChange={e => updateCropSelection('x', e.target.value)}
              className="w-full px-2 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-gray-100"
              min={0}
              max={100}
              step={0.1}
            />
          </div>
          <div>
            <label className="block text-[10px] text-gray-500 dark:text-gray-400 mb-1">Y</label>
            <input
              type="number"
              value={cropY}
              onChange={e => updateCropSelection('y', e.target.value)}
              className="w-full px-2 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-gray-100"
              min={0}
              max={100}
              step={0.1}
            />
          </div>
          <div>
            <label className="block text-[10px] text-gray-500 dark:text-gray-400 mb-1">Width</label>
            <input
              type="number"
              value={cropW}
              onChange={e => updateCropSelection('width', e.target.value)}
              className="w-full px-2 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-gray-100"
              min={1}
              max={100}
              step={0.1}
            />
          </div>
          <div>
            <label className="block text-[10px] text-gray-500 dark:text-gray-400 mb-1">Height</label>
            <input
              type="number"
              value={cropH}
              onChange={e => updateCropSelection('height', e.target.value)}
              className="w-full px-2 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-gray-100"
              min={1}
              max={100}
              step={0.1}
            />
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        {!isCropping ? (
          <button
            onClick={startCropping}
            className="flex-1 px-3 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
          >
            {transforms.crop ? 'Edit Crop' : 'Start Crop'}
          </button>
        ) : (
          <>
            <button
              onClick={applyCrop}
              className="flex-1 px-3 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
            >
              Apply
            </button>
            <button
              onClick={cancelCrop}
              className="flex-1 px-3 py-2 text-sm font-medium bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md transition-colors"
            >
              Cancel
            </button>
          </>
        )}
      </div>

      {transforms.crop && !isCropping && (
        <button
          onClick={actions.clearCrop}
          className="w-full px-3 py-2 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
        >
          Remove crop
        </button>
      )}
    </div>
  )
}
