import IconPlus from '~icons/tabler/plus'
import IconTrash from '~icons/tabler/trash'
import IconDownload from '~icons/tabler/download'
import IconScissors from '~icons/tabler/scissors'

interface ToolbarProps {
  pagesCount: number
  selectedCount: number
  isProcessing: boolean
  inputRef: React.RefObject<HTMLInputElement | null>
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onSelectAll: () => void
  onDeleteSelected: () => void
  onExtractSelected: () => void
  onClearAll: () => void
  onExport: () => void
}

export function Toolbar({
  pagesCount,
  selectedCount,
  isProcessing,
  inputRef,
  onInputChange,
  onSelectAll,
  onDeleteSelected,
  onExtractSelected,
  onClearAll,
  onExport,
}: ToolbarProps) {
  return (
    <div className="shrink-0 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-700 px-4 py-2">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <button
            onClick={() => inputRef.current?.click()}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <IconPlus className="w-4 h-4" />
            Add PDFs
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf"
            multiple
            onChange={onInputChange}
            className="hidden"
          />

          <div className="w-px h-6 bg-gray-200 dark:bg-gray-700" />

          <button
            onClick={onSelectAll}
            className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            {selectedCount === pagesCount ? 'Deselect All' : 'Select All'}
          </button>

          {selectedCount > 0 && (
            <>
              <button
                onClick={onDeleteSelected}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              >
                <IconTrash className="w-4 h-4" />
                Delete ({selectedCount})
              </button>

              <button
                onClick={onExtractSelected}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
              >
                <IconScissors className="w-4 h-4" />
                Extract Selected
              </button>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onClearAll}
            className="px-3 py-1.5 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            Clear All
          </button>
          
          <button
            onClick={onExport}
            disabled={isProcessing || pagesCount === 0}
            className="inline-flex items-center gap-2 px-4 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 rounded-lg transition-colors"
          >
            <IconDownload className="w-4 h-4" />
            {isProcessing ? 'Processing...' : 'Download PDF'}
          </button>
        </div>
      </div>
    </div>
  )
}
