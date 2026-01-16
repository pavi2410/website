import { useStore } from '@nanostores/react'
import { $originalImage } from '@/stores/image-editor'
import DropZone from './DropZone'
import Toolbar from './Toolbar'
import Sidebar from './Sidebar'
import ImageCanvas from './ImageCanvas'
import ImageInfo from './ImageInfo'

export default function ImageEditorApp() {
  const originalImage = useStore($originalImage)

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
