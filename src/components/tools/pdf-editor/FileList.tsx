import type { PdfFile } from './types'
import IconFile from '~icons/tabler/file-type-pdf'
import IconLock from '~icons/tabler/lock'
import IconKey from '~icons/tabler/key'
import IconEye from '~icons/tabler/eye'

interface FileListProps {
  files: PdfFile[]
  onUnlock: (fileId: string) => void
  onBypass: (fileId: string) => void
  onPreview: (fileId: string) => void
}

export function FileList({ files, onUnlock, onBypass, onPreview }: FileListProps) {
  return (
    <div className="mb-6">
      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Loaded Files ({files.length})
      </h3>
      <div className="flex flex-wrap gap-2">
        {files.map(file => (
          <div
            key={file.id}
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
          >
            <IconFile className="w-4 h-4 text-red-500" />
            <span className="text-gray-700 dark:text-gray-300">{file.name}</span>
            <span className="text-gray-400 dark:text-gray-500">({file.pageCount} pages)</span>
            
            {file.isLocked && (
              <>
                <button
                  onClick={() => onUnlock(file.id)}
                  className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 rounded"
                  title="Enter password to unlock"
                >
                  <IconLock className="w-3 h-3" />
                  Unlock
                </button>
                <button
                  onClick={() => onBypass(file.id)}
                  className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 rounded"
                  title="Try to bypass restrictions (works for owner-password only)"
                >
                  <IconKey className="w-3 h-3" />
                  Bypass
                </button>
              </>
            )}
            
            <button
              onClick={() => onPreview(file.id)}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              title="Preview"
            >
              <IconEye className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
