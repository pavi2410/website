import IconUpload from '~icons/tabler/upload'
import IconFile from '~icons/tabler/file-type-pdf'

interface DropZoneProps {
  isDragging: boolean
  error: string | null
  inputRef: React.RefObject<HTMLInputElement | null>
  onDrop: (e: React.DragEvent) => void
  onDragOver: (e: React.DragEvent) => void
  onDragLeave: (e: React.DragEvent) => void
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export function DropZone({
  isDragging,
  error,
  inputRef,
  onDrop,
  onDragOver,
  onDragLeave,
  onInputChange,
}: DropZoneProps) {
  return (
    <div
      className="flex-1 flex items-center justify-center p-8 bg-gray-50 dark:bg-gray-900 h-full"
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
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
          accept="application/pdf"
          multiple
          onChange={onInputChange}
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
              <IconFile className="w-10 h-10 text-gray-400 dark:text-gray-500" />
            )}
          </div>

          <div>
            <p className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">
              {isDragging ? 'Drop PDFs here' : 'Drop PDFs or click to upload'}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Select multiple files to merge • Reorder pages by dragging
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
