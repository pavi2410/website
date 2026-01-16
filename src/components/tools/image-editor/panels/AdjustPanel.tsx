import { useStore } from '@nanostores/react'
import { $transforms, actions } from '@/stores/image-editor'
import IconRotateClockwise from '~icons/tabler/rotate-clockwise'
import IconRotate from '~icons/tabler/rotate'
import IconFlipHorizontal from '~icons/tabler/flip-horizontal'
import IconFlipVertical from '~icons/tabler/flip-vertical'

interface SliderProps {
  label: string
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
}

function Slider({ label, value, onChange, min = -100, max = 100 }: SliderProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
        <span 
          className="text-xs text-gray-500 dark:text-gray-400 tabular-nums cursor-pointer hover:text-gray-700 dark:hover:text-gray-200"
          onClick={() => onChange(0)}
          title="Click to reset"
        >
          {value > 0 ? '+' : ''}{value}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={e => onChange(parseInt(e.target.value, 10))}
        onDoubleClick={() => onChange(0)}
        className="w-full"
        title="Double-click to reset"
      />
    </div>
  )
}

export default function AdjustPanel() {
  const transforms = useStore($transforms)

  const handleAdjustmentChange = (key: 'brightness' | 'contrast' | 'saturation', value: number) => {
    actions.setAdjustment(key, value)
  }

  return (
    <div className="space-y-5">
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
          Rotation
        </label>
        <div className="flex gap-2">
          <button
            onClick={() => actions.rotate('ccw')}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-colors"
            title="Rotate counter-clockwise"
          >
            <IconRotate className="w-4 h-4 text-gray-700 dark:text-gray-300" />
            <span className="text-xs text-gray-700 dark:text-gray-300">-90°</span>
          </button>
          <button
            onClick={() => actions.rotate('cw')}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-colors"
            title="Rotate clockwise"
          >
            <IconRotateClockwise className="w-4 h-4 text-gray-700 dark:text-gray-300" />
            <span className="text-xs text-gray-700 dark:text-gray-300">+90°</span>
          </button>
        </div>
        {transforms.rotation !== 0 && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center">
            Current: {transforms.rotation}°
          </p>
        )}
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
          Flip
        </label>
        <div className="flex gap-2">
          <button
            onClick={() => actions.flip('h')}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md transition-colors ${
              transforms.flipH
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
            title="Flip horizontal"
          >
            <IconFlipHorizontal className="w-4 h-4" />
            <span className="text-xs">Horizontal</span>
          </button>
          <button
            onClick={() => actions.flip('v')}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md transition-colors ${
              transforms.flipV
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
            title="Flip vertical"
          >
            <IconFlipVertical className="w-4 h-4" />
            <span className="text-xs">Vertical</span>
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <Slider
          label="Brightness"
          value={transforms.brightness}
          onChange={v => handleAdjustmentChange('brightness', v)}
        />
        <Slider
          label="Contrast"
          value={transforms.contrast}
          onChange={v => handleAdjustmentChange('contrast', v)}
        />
        <Slider
          label="Saturation"
          value={transforms.saturation}
          onChange={v => handleAdjustmentChange('saturation', v)}
        />
      </div>

      {(transforms.brightness !== 0 || transforms.contrast !== 0 || transforms.saturation !== 0) && (
        <button
          onClick={actions.resetAdjustments}
          className="w-full px-3 py-2 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
        >
          Reset adjustments
        </button>
      )}
    </div>
  )
}
