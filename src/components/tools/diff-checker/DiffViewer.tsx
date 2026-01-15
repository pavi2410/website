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
  const totalChanges = stats.additions + stats.deletions

  // GitHub-style discrete blocks (5 blocks total)
  const BLOCK_COUNT = 5
  const greenBlocks = totalChanges > 0 
    ? Math.round((stats.additions / totalChanges) * BLOCK_COUNT) 
    : 0
  const redBlocks = BLOCK_COUNT - greenBlocks

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Diff Header - GitHub style */}
      <div className="shrink-0 px-4 py-2.5 bg-gray-50 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <span className="text-xs font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wide">
            Diff
          </span>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              {hunks.length} {hunks.length === 1 ? 'hunk' : 'hunks'}
            </span>
          </div>

          {/* GitHub-style change indicators with discrete blocks */}
          {totalChanges > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-green-600 dark:text-green-400">
                +{stats.additions}
              </span>
              <span className="text-xs text-red-600 dark:text-red-400">
                -{stats.deletions}
              </span>

              {/* Discrete block visualization */}
              <div className="flex gap-0.5">
                {Array.from({ length: BLOCK_COUNT }).map((_, i) => (
                  <span
                    key={i}
                    className={`w-2 h-2 rounded-xs ${
                      i < greenBlocks
                        ? 'bg-green-500'
                        : 'bg-red-500'
                    }`}
                    style={i >= greenBlocks ? {
                      background: `repeating-linear-gradient(
                        -45deg,
                        rgb(239 68 68),
                        rgb(239 68 68) 1px,
                        rgb(185 28 28) 1px,
                        rgb(185 28 28) 2px
                      )`
                    } : undefined}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-1">
          <button
            onClick={onExpandAll}
            className="px-2.5 py-1 text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-800 rounded transition-colors"
          >
            Expand all
          </button>
          <button
            onClick={onCollapseAll}
            className="px-2.5 py-1 text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-800 rounded transition-colors"
          >
            Collapse all
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
