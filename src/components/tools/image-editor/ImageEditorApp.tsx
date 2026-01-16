import { useEffect, useState, useCallback } from 'react'
import { useStore } from '@nanostores/react'
import { $originalImage, $activePanel, $zoom, actions } from '@/stores/image-editor'
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

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return

      const isMod = e.metaKey || e.ctrlKey

      if (isMod && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        actions.undo()
      } else if (isMod && e.key === 'z' && e.shiftKey) {
        e.preventDefault()
        actions.redo()
      } else if (isMod && e.key === 'y') {
        e.preventDefault()
        actions.redo()
      } else if (isMod && e.key === 's') {
        e.preventDefault()
        actions.setPanel('format')
      } else if (e.key === '0' && isMod) {
        e.preventDefault()
        actions.setZoom(1)
      } else if (e.key === '=' && isMod) {
        e.preventDefault()
        actions.setZoom(Math.min(3, ($zoom.get() || 1) + 0.25))
      } else if (e.key === '-' && isMod) {
        e.preventDefault()
        actions.setZoom(Math.max(0.1, ($zoom.get() || 1) - 0.25))
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
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
