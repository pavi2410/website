import { useState, useCallback, useRef } from 'react'
import { actions } from '@/stores/image-editor'
import IconUpload from '~icons/tabler/upload'
import IconPhoto from '~icons/tabler/photo'

const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/bmp']

export default function DropZone() {
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback(async (file: File) => {
    setError(null)

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError('Unsupported file type. Please use PNG, JPG, WEBP, GIF, or BMP.')
      return
    }

    try {
      await actions.loadImage(file)
    } catch (e) {
      setError('Failed to load image. The file may be corrupted.')
      console.error(e)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [handleFile])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    const items = e.clipboardData.items
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile()
        if (file) handleFile(file)
        return
      }
    }
  }, [handleFile])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }, [handleFile])

  return (
    <div
      className="flex-1 flex items-center justify-center p-8 bg-gray-50 dark:bg-gray-900"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onPaste={handlePaste}
      tabIndex={0}
    >
      <div
        className={`
          w-full max-w-xl p-12 border-2 border-dashed rounded-xl text-center transition-all cursor-pointer
          ${isDragging
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
          }
        `}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_TYPES.join(',')}
          onChange={handleInputChange}
          className="hidden"
        />

        <div className="flex flex-col items-center gap-4">
          <div className={`
            p-4 rounded-full transition-colors
            ${isDragging
              ? 'bg-blue-100 dark:bg-blue-800/30'
              : 'bg-gray-100 dark:bg-gray-800'
            }
          `}>
            {isDragging ? (
              <IconUpload className="w-10 h-10 text-blue-500" />
            ) : (
              <IconPhoto className="w-10 h-10 text-gray-400 dark:text-gray-500" />
            )}
          </div>

          <div>
            <p className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">
              {isDragging ? 'Drop image here' : 'Drop an image or click to upload'}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              PNG, JPG, WEBP, GIF, BMP • Paste from clipboard supported
            </p>
          </div>

          {error && (
            <p className="text-sm text-red-600 dark:text-red-400 mt-2">
              {error}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
