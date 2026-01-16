import { useStore } from '@nanostores/react'
import { $activePanel, actions } from '@/stores/image-editor'
import IconResize from '~icons/tabler/resize'
import IconCrop from '~icons/tabler/crop'
import IconAdjustments from '~icons/tabler/adjustments'
import IconFileExport from '~icons/tabler/file-export'
import ResizePanel from './panels/ResizePanel'
import CropPanel from './panels/CropPanel'
import AdjustPanel from './panels/AdjustPanel'
import FormatPanel from './panels/FormatPanel'

const PANELS = [
  { id: 'resize' as const, label: 'Resize', icon: IconResize },
  { id: 'crop' as const, label: 'Crop', icon: IconCrop },
  { id: 'adjust' as const, label: 'Adjust', icon: IconAdjustments },
  { id: 'format' as const, label: 'Export', icon: IconFileExport },
]

export default function Sidebar() {
  const activePanel = useStore($activePanel)

  return (
    <div className="w-72 shrink-0 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 flex flex-col">
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        {PANELS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => actions.setPanel(id)}
            className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors ${
              activePanel === id
                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
          >
            <Icon className="w-5 h-5" />
            <span>{label}</span>
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {activePanel === 'resize' && <ResizePanel />}
        {activePanel === 'crop' && <CropPanel />}
        {activePanel === 'adjust' && <AdjustPanel />}
        {activePanel === 'format' && <FormatPanel />}
      </div>
    </div>
  )
}
