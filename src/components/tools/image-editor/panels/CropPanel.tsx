import { useState } from 'react'
import { useStore } from '@nanostores/react'
import { $originalMeta, $transforms, $isCropping, actions } from '@/stores/image-editor'

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

  const [selectedRatio, setSelectedRatio] = useState<number | null>(null)
  const [cropX, setCropX] = useState('0')
  const [cropY, setCropY] = useState('0')
  const [cropW, setCropW] = useState('100')
  const [cropH, setCropH] = useState('100')

  if (!meta) return null

  const handlePresetClick = (ratio: number | null) => {
    setSelectedRatio(ratio)

    if (ratio === null) {
      setCropX('0')
      setCropY('0')
      setCropW('100')
      setCropH('100')
      return
    }

    const imageRatio = meta.width / meta.height

    let cropWidth: number
    let cropHeight: number

    if (ratio > imageRatio) {
      cropWidth = 100
      cropHeight = (imageRatio / ratio) * 100
    } else {
      cropHeight = 100
      cropWidth = (ratio / imageRatio) * 100
    }

    const x = (100 - cropWidth) / 2
    const y = (100 - cropHeight) / 2

    setCropX(x.toFixed(1))
    setCropY(y.toFixed(1))
    setCropW(cropWidth.toFixed(1))
    setCropH(cropHeight.toFixed(1))
  }

  const applyCrop = () => {
    const x = parseFloat(cropX) / 100
    const y = parseFloat(cropY) / 100
    const width = parseFloat(cropW) / 100
    const height = parseFloat(cropH) / 100

    if (x < 0 || y < 0 || width <= 0 || height <= 0 || x + width > 1 || y + height > 1) {
      return
    }

    actions.setCrop({ x, y, width, height })
    actions.setIsCropping(false)
  }

  const startCropping = () => {
    actions.setIsCropping(true)
    if (transforms.crop) {
      setCropX((transforms.crop.x * 100).toFixed(1))
      setCropY((transforms.crop.y * 100).toFixed(1))
      setCropW((transforms.crop.width * 100).toFixed(1))
      setCropH((transforms.crop.height * 100).toFixed(1))
    }
  }

  const cancelCrop = () => {
    actions.setIsCropping(false)
    setCropX('0')
    setCropY('0')
    setCropW('100')
    setCropH('100')
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
              onChange={e => setCropX(e.target.value)}
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
              onChange={e => setCropY(e.target.value)}
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
              onChange={e => setCropW(e.target.value)}
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
              onChange={e => setCropH(e.target.value)}
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
