import type { PageInfo } from './types'
import IconFile from '~icons/tabler/file-type-pdf'
import IconTrash from '~icons/tabler/trash'
import IconRotateClockwise from '~icons/tabler/rotate-clockwise'
import IconRotate2 from '~icons/tabler/rotate-2'
import IconGripVertical from '~icons/tabler/grip-vertical'

interface PageGridProps {
  pages: PageInfo[]
  selectedPages: Set<string>
  draggedPage: string | null
  filesCount: number
  getFileName: (fileId: string) => string
  onToggleSelection: (pageId: string) => void
  onRotate: (pageId: string, degrees: number) => void
  onDelete: (pageId: string) => void
  onDragStart: (e: React.DragEvent, pageId: string) => void
  onDragOver: (e: React.DragEvent, pageId: string) => void
  onDragEnd: () => void
}

export function PageGrid({
  pages,
  selectedPages,
  draggedPage,
  filesCount,
  getFileName,
  onToggleSelection,
  onRotate,
  onDelete,
  onDragStart,
  onDragOver,
  onDragEnd,
}: PageGridProps) {
  return (
    <div>
      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Pages ({pages.length}) — Drag to reorder
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
        {pages.map((page, index) => (
          <div
            key={page.id}
            draggable
            onDragStart={(e) => onDragStart(e, page.id)}
            onDragOver={(e) => onDragOver(e, page.id)}
            onDragEnd={onDragEnd}
            onClick={() => onToggleSelection(page.id)}
            className={`
              group relative bg-white dark:bg-gray-800 border-2 rounded-lg overflow-hidden cursor-pointer transition-all
              ${selectedPages.has(page.id)
                ? 'border-blue-500 ring-2 ring-blue-500/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }
              ${draggedPage === page.id ? 'opacity-50' : ''}
            `}
          >
            {/* Drag handle */}
            <div className="absolute top-1 left-1 p-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing">
              <IconGripVertical className="w-4 h-4 text-gray-400" />
            </div>

            {/* Badges container - top right */}
            <div className="absolute top-1 right-1 z-10 flex flex-col items-end gap-0.5">
              {/* Current position badge */}
              <div className="px-1.5 py-0.5 bg-black/70 text-white text-xs font-medium rounded">
                {index + 1}
              </div>
              {/* Original page badge */}
              <div className="px-1.5 py-0.5 bg-blue-600/90 text-white text-[10px] font-medium rounded" title={`Original: ${getFileName(page.fileId)} - Page ${page.pageIndex + 1}`}>
                {filesCount > 1 ? `${getFileName(page.fileId).slice(0, 6)}:${page.pageIndex + 1}` : `orig: ${page.pageIndex + 1}`}
              </div>
            </div>

            {/* Page preview */}
            <div className="aspect-[8.5/11] bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
              {page.thumbnailUrl ? (
                <img 
                  src={page.thumbnailUrl} 
                  alt={`Page ${page.pageIndex + 1}`}
                  className="w-full h-full object-contain"
                  style={{ transform: `rotate(${page.rotation}deg)` }}
                />
              ) : (
                <div className="text-center p-2" style={{ transform: `rotate(${page.rotation}deg)` }}>
                  <IconFile className="w-8 h-8 text-gray-300 dark:text-gray-500 mx-auto mb-1" />
                  <p className="text-xs text-gray-400 dark:text-gray-500 truncate max-w-full px-1">
                    {getFileName(page.fileId)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Page {page.pageIndex + 1}
                  </p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="absolute bottom-0 left-0 right-0 p-1 bg-linear-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="flex items-center justify-center gap-1">
                <button
                  onClick={(e) => { e.stopPropagation(); onRotate(page.id, -90) }}
                  className="p-1 bg-white/90 dark:bg-gray-800/90 rounded hover:bg-white dark:hover:bg-gray-700"
                  title="Rotate left"
                >
                  <IconRotate2 className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onRotate(page.id, 90) }}
                  className="p-1 bg-white/90 dark:bg-gray-800/90 rounded hover:bg-white dark:hover:bg-gray-700"
                  title="Rotate right"
                >
                  <IconRotateClockwise className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(page.id) }}
                  className="p-1 bg-white/90 dark:bg-gray-800/90 rounded hover:bg-red-100 dark:hover:bg-red-900/30"
                  title="Delete page"
                >
                  <IconTrash className="w-4 h-4 text-red-500" />
                </button>
              </div>
            </div>

            {/* Selection checkbox */}
            <div className={`
              absolute top-1 left-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-all
              ${selectedPages.has(page.id)
                ? 'bg-blue-500 border-blue-500'
                : 'bg-white/80 dark:bg-gray-800/80 border-gray-300 dark:border-gray-600 opacity-0 group-hover:opacity-100'
              }
            `}>
              {selectedPages.has(page.id) && (
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
