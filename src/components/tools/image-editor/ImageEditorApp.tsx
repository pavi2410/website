import { useEffect, useState } from 'react'
import { useStore } from '@nanostores/react'
import { $originalImage, actions } from '@/stores/image-editor'
import DropZone from './DropZone'
import Toolbar from './Toolbar'
import Sidebar from './Sidebar'
import ImageCanvas from './ImageCanvas'
import ImageInfo from './ImageInfo'

export default function ImageEditorApp() {
  const originalImage = useStore($originalImage)
  const [isRestoring, setIsRestoring] = useState(true)

  // Restore from sessionStorage on mount
  useEffect(() => {
    actions.restoreFromStorage().finally(() => setIsRestoring(false))
  }, [])

  if (isRestoring) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-gray-500 dark:text-gray-400">Loading...</div>
      </div>
    )
  }

  if (!originalImage) {
    return <DropZone />
  }

  return (
    <div className="flex flex-col h-full">
      <Toolbar />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <ImageCanvas />
          <ImageInfo />
        </div>
      </div>
    </div>
  )
}
