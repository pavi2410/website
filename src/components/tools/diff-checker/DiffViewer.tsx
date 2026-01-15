import HunkItem from './HunkItem'
import type { DiffHunk } from '@/utils/diff'

interface DiffViewerProps {
  hunks: DiffHunk[]
  expandedHunks: Set<number>
  onToggleHunk: (index: number) => void
  onExpandAll: () => void
  onCollapseAll: () => void
  formatText: (text: string) => string
  strategy: 'line' | 'word' | 'char'
}

function calculateDiffStats(hunks: DiffHunk[]) {
  let additions = 0
  let deletions = 0
  let unchanged = 0

  for (const hunk of hunks) {
    for (const change of hunk.changes) {
      if (change.type === 'add') additions++
      else if (change.type === 'remove') deletions++
      else unchanged++
    }
  }

  return { additions, deletions, unchanged, total: additions + deletions + unchanged }
}

export default function DiffViewer({
  hunks,
  expandedHunks,
  onToggleHunk,
  onExpandAll,
  onCollapseAll,
  formatText,
  strategy
}: DiffViewerProps) {
  const stats = calculateDiffStats(hunks)

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Diff Header */}
      <div className="flex-shrink-0 px-4 py-2 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <span className="text-xs font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wide">
            Diff
          </span>
          <div className="flex items-center gap-3 text-xs">
            <span className="text-gray-500 dark:text-gray-400">
              {hunks.length} {hunks.length === 1 ? 'change' : 'changes'}
            </span>
            <div className="h-3 w-px bg-gray-300 dark:bg-gray-600" />
            <span className="text-green-600 dark:text-green-400" title="Additions">
              +{stats.additions}
            </span>
            <span className="text-red-600 dark:text-red-400" title="Deletions">
              -{stats.deletions}
            </span>
            {stats.unchanged > 0 && (
              <span className="text-gray-500 dark:text-gray-400" title="Unchanged lines">
                {stats.unchanged} unchanged
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onExpandAll}
            className="px-2 py-1 text-xs font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
          >
            Expand All
          </button>
          <button
            onClick={onCollapseAll}
            className="px-2 py-1 text-xs font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
          >
            Collapse All
          </button>
        </div>
      </div>

      {/* Hunks */}
      <div className="flex-1 overflow-y-auto">
        {hunks.map((hunk, index) => (
          <HunkItem
            key={index}
            hunk={hunk}
            index={index}
            isExpanded={expandedHunks.has(index)}
            onToggle={onToggleHunk}
            formatText={formatText}
            strategy={strategy}
          />
        ))}
      </div>
    </div>
  )
}
