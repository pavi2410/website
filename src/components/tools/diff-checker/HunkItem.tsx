import { computeInlineDiff, type DiffHunk, type DiffChange } from '@/utils/diff'

interface HunkItemProps {
  hunk: DiffHunk
  index: number
  isExpanded: boolean
  onToggle: (index: number) => void
  formatText: (text: string) => string
  strategy: 'line' | 'word' | 'char'
}

interface LineRenderInfo {
  change: DiffChange
  inlineDiff?: {
    segments: Array<{ text: string; changed: boolean }>
  }
}

function prepareLineData(changes: DiffChange[], strategy: string): LineRenderInfo[] {
  const result: LineRenderInfo[] = []

  if (strategy === 'line') {
    for (let i = 0; i < changes.length; i++) {
      const current = changes[i]
      const next = changes[i + 1]

      if (
        current.type === 'remove' &&
        next &&
        next.type === 'add'
      ) {
        const { oldSegments, newSegments } = computeInlineDiff(current.value, next.value)

        result.push({
          change: current,
          inlineDiff: { segments: oldSegments }
        })
        result.push({
          change: next,
          inlineDiff: { segments: newSegments }
        })
        i++
      } else {
        result.push({ change: current })
      }
    }
  } else {
    result.push(...changes.map(change => ({ change })))
  }

  return result
}

export default function HunkItem({
  hunk,
  index,
  isExpanded,
  onToggle,
  formatText,
  strategy
}: HunkItemProps) {
  const lineData = prepareLineData(hunk.changes, strategy)

  return (
    <div className="border-b border-gray-200 dark:border-gray-800 last:border-b-0">
      {/* Hunk Header - GitHub style */}
      <button
        onClick={() => onToggle(index)}
        className="group w-full text-left bg-blue-50/80 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors flex items-center"
      >
        <div className="flex items-center gap-1 px-2 py-1.5 min-w-28 bg-blue-100/50 dark:bg-blue-900/30 border-r border-blue-200 dark:border-blue-800">
          <span className="text-blue-600 dark:text-blue-400 text-xs transition-transform group-hover:scale-110">
            {isExpanded ? '▾' : '▸'}
          </span>
        </div>
        <div className="flex-1 px-3 py-1.5 flex items-center gap-2">
          <span className="text-blue-700 dark:text-blue-300 font-mono text-xs">
            {hunk.header}
          </span>
          <span className="text-xs text-blue-500/70 dark:text-blue-400/50">
            {hunk.changes.filter(c => c.type !== 'unchanged').length} changes
          </span>
        </div>
      </button>

      {/* Hunk Content - GitHub style unified diff */}
      {isExpanded && (
        <div className="font-mono text-xs">
          {lineData.map((item, changeIndex) => {
            const { change, inlineDiff } = item
            const isAdd = change.type === 'add'
            const isRemove = change.type === 'remove'
            const isUnchanged = change.type === 'unchanged'

            // GitHub-style colors
            const rowBg = isAdd
              ? 'bg-green-100/60 dark:bg-green-500/10 hover:bg-green-100 dark:hover:bg-green-500/20'
              : isRemove
              ? 'bg-red-100/60 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20'
              : 'bg-white dark:bg-gray-950 hover:bg-gray-50 dark:hover:bg-gray-900'

            const gutterBg = isAdd
              ? 'bg-green-200/50 dark:bg-green-500/15'
              : isRemove
              ? 'bg-red-200/50 dark:bg-red-500/15'
              : 'bg-gray-50 dark:bg-gray-900'

            const prefixColor = isAdd
              ? 'text-green-700 dark:text-green-400'
              : isRemove
              ? 'text-red-700 dark:text-red-400'
              : 'text-gray-400 dark:text-gray-600'

            const prefix = isAdd ? '+' : isRemove ? '-' : ' '

            // Word-level highlight colors (more saturated for changed segments)
            const wordHighlight = isAdd
              ? 'bg-green-300/70 dark:bg-green-400/30 rounded-sm px-0.5 -mx-0.5'
              : 'bg-red-300/70 dark:bg-red-400/30 rounded-sm px-0.5 -mx-0.5'

            return (
              <div
                key={changeIndex}
                className={`flex items-stretch ${rowBg} transition-colors border-b border-gray-100 dark:border-gray-800/50 last:border-b-0`}
              >
                {/* Dual gutter - Old line number */}
                <div
                  className={`w-12 px-2 py-0.5 text-right select-none border-r border-gray-200 dark:border-gray-800 ${gutterBg}`}
                >
                  <span className="text-gray-400 dark:text-gray-600">
                    {isAdd ? '' : change.lineNumber?.old}
                  </span>
                </div>

                {/* Dual gutter - New line number */}
                <div
                  className={`w-12 px-2 py-0.5 text-right select-none border-r border-gray-200 dark:border-gray-800 ${gutterBg}`}
                >
                  <span className="text-gray-400 dark:text-gray-600">
                    {isRemove ? '' : change.lineNumber?.new}
                  </span>
                </div>

                {/* Prefix indicator */}
                <div
                  className={`w-6 py-0.5 flex items-center justify-center select-none ${prefixColor} ${gutterBg} border-r border-gray-200 dark:border-gray-800`}
                >
                  {prefix}
                </div>

                {/* Content */}
                <div className="flex-1 py-0.5 px-3 whitespace-pre-wrap break-all text-gray-900 dark:text-gray-100 leading-5">
                  {inlineDiff ? (
                    <>
                      {inlineDiff.segments.map((segment, segIndex) => (
                        <span
                          key={segIndex}
                          className={segment.changed ? wordHighlight : ''}
                        >
                          {formatText(segment.text)}
                        </span>
                      ))}
                    </>
                  ) : (
                    formatText(change.value)
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
