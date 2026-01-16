import { useState, useEffect } from 'react'
import { useStore } from '@nanostores/react'
import { $originalMeta, $transforms, actions } from '@/stores/image-editor'
import IconLink from '~icons/tabler/link'
import IconLinkOff from '~icons/tabler/link-off'

const PRESETS = [
  { label: '1080p', width: 1920, height: 1080 },
  { label: '720p', width: 1280, height: 720 },
  { label: '4K', width: 3840, height: 2160 },
  { label: 'Instagram', width: 1080, height: 1080 },
  { label: 'Twitter', width: 1200, height: 675 },
  { label: 'Facebook', width: 1200, height: 630 },
]

export default function ResizePanel() {
  const meta = useStore($originalMeta)
  const transforms = useStore($transforms)

  const currentWidth = transforms.resize?.width ?? meta?.width ?? 0
  const currentHeight = transforms.resize?.height ?? meta?.height ?? 0
  const aspectRatio = meta ? meta.width / meta.height : 1

  const [width, setWidth] = useState(currentWidth.toString())
  const [height, setHeight] = useState(currentHeight.toString())
  const [lockAspect, setLockAspect] = useState(true)
  const [percentage, setPercentage] = useState('100')

  useEffect(() => {
    setWidth(currentWidth.toString())
    setHeight(currentHeight.toString())
    if (meta) {
      const pct = Math.round((currentWidth / meta.width) * 100)
      setPercentage(pct.toString())
    }
  }, [currentWidth, currentHeight, meta])

  const handleWidthChange = (value: string) => {
    setWidth(value)
    const w = parseInt(value, 10)
    if (isNaN(w) || w <= 0) return

    if (lockAspect) {
      const h = Math.round(w / aspectRatio)
      setHeight(h.toString())
    }
  }

  const handleHeightChange = (value: string) => {
    setHeight(value)
    const h = parseInt(value, 10)
    if (isNaN(h) || h <= 0) return

    if (lockAspect) {
      const w = Math.round(h * aspectRatio)
      setWidth(w.toString())
    }
  }

  const handlePercentageChange = (value: string) => {
    setPercentage(value)
    const pct = parseInt(value, 10)
    if (isNaN(pct) || pct <= 0 || !meta) return

    const w = Math.round(meta.width * (pct / 100))
    const h = Math.round(meta.height * (pct / 100))
    setWidth(w.toString())
    setHeight(h.toString())
  }

  const applyResize = () => {
    const w = parseInt(width, 10)
    const h = parseInt(height, 10)
    if (isNaN(w) || isNaN(h) || w <= 0 || h <= 0) return
    actions.setResize(w, h)
  }

  const applyPreset = (preset: typeof PRESETS[0]) => {
    setWidth(preset.width.toString())
    setHeight(preset.height.toString())
    actions.setResize(preset.width, preset.height)
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
          Dimensions (px)
        </label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={width}
            onChange={e => handleWidthChange(e.target.value)}
            onBlur={applyResize}
            onKeyDown={e => e.key === 'Enter' && applyResize()}
            className="flex-1 px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-gray-100"
            placeholder="Width"
            min={1}
          />
          <button
            onClick={() => setLockAspect(!lockAspect)}
            className={`p-2 rounded transition-colors ${
              lockAspect
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
            }`}
            title={lockAspect ? 'Unlock aspect ratio' : 'Lock aspect ratio'}
          >
            {lockAspect ? <IconLink className="w-4 h-4" /> : <IconLinkOff className="w-4 h-4" />}
          </button>
          <input
            type="number"
            value={height}
            onChange={e => handleHeightChange(e.target.value)}
            onBlur={applyResize}
            onKeyDown={e => e.key === 'Enter' && applyResize()}
            className="flex-1 px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-gray-100"
            placeholder="Height"
            min={1}
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
          Scale (%)
        </label>
        <div className="flex items-center gap-2">
          <input
            type="range"
            min={10}
            max={200}
            value={percentage}
            onChange={e => handlePercentageChange(e.target.value)}
            onMouseUp={applyResize}
            onTouchEnd={applyResize}
            className="flex-1"
          />
          <input
            type="number"
            value={percentage}
            onChange={e => handlePercentageChange(e.target.value)}
            onBlur={applyResize}
            onKeyDown={e => e.key === 'Enter' && applyResize()}
            className="w-16 px-2 py-1.5 text-sm text-center bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-gray-100"
            min={1}
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
          Presets
        </label>
        <div className="grid grid-cols-2 gap-2">
          {PRESETS.map(preset => (
            <button
              key={preset.label}
              onClick={() => applyPreset(preset)}
              className="px-3 py-2 text-xs font-medium bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md text-gray-700 dark:text-gray-300 transition-colors"
            >
              {preset.label}
              <span className="block text-gray-500 dark:text-gray-400 text-[10px]">
                {preset.width}×{preset.height}
              </span>
            </button>
          ))}
        </div>
      </div>

      {transforms.resize && (
        <button
          onClick={actions.clearResize}
          className="w-full px-3 py-2 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
        >
          Reset to original size
        </button>
      )}
    </div>
  )
}
