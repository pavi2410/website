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

  // For line strategy, detect adjacent remove/add pairs for inline highlighting
  if (strategy === 'line') {
    for (let i = 0; i < changes.length; i++) {
      const current = changes[i]
      const next = changes[i + 1]

      if (
        current.type === 'remove' &&
        next &&
        next.type === 'add'
      ) {
        // Compute inline diff for the pair
        const { oldSegments, newSegments } = computeInlineDiff(current.value, next.value)

        result.push({
          change: current,
          inlineDiff: { segments: oldSegments }
        })
        result.push({
          change: next,
          inlineDiff: { segments: newSegments }
        })
        i++ // Skip next since we've handled it
      } else {
        result.push({ change: current })
      }
    }
  } else {
    // For word/char strategies, no inline highlighting needed
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
    <div className="border-b border-gray-200 dark:border-gray-700 last:border-b-0">
      {/* Hunk Header */}
      <button
        onClick={() => onToggle(index)}
        className="w-full px-4 py-2 text-left bg-blue-50 dark:bg-blue-950/30 hover:bg-blue-100 dark:hover:bg-blue-950/50 transition-colors flex items-center gap-2 border-b border-blue-200 dark:border-blue-900"
      >
        <span className="text-gray-600 dark:text-gray-400 text-xs">
          {isExpanded ? '▼' : '▶'}
        </span>
        <span className="text-blue-700 dark:text-blue-300 font-mono text-xs font-semibold">
          {hunk.header}
        </span>
      </button>

      {/* Hunk Content */}
      {isExpanded && (
        <div className="bg-white dark:bg-gray-950">
          {lineData.map((item, changeIndex) => {
            const { change, inlineDiff } = item
            let bgColor = ''
            let borderColor = ''
            let prefix = ' '
            let prefixBg = ''

            if (change.type === 'add') {
              bgColor = 'bg-green-50 dark:bg-green-950/20'
              borderColor = 'border-l-2 border-green-500 dark:border-green-600'
              prefix = '+'
              prefixBg = 'bg-green-100 dark:bg-green-900/30'
            } else if (change.type === 'remove') {
              bgColor = 'bg-red-50 dark:bg-red-950/20'
              borderColor = 'border-l-2 border-red-500 dark:border-red-600'
              prefix = '-'
              prefixBg = 'bg-red-100 dark:bg-red-900/30'
            } else {
              bgColor = 'bg-white dark:bg-gray-950'
              borderColor = 'border-l-2 border-transparent'
            }

            const lineNum =
              change.type === 'add'
                ? change.lineNumber?.new
                : change.type === 'remove'
                ? change.lineNumber?.old
                : change.lineNumber?.old

            return (
              <div
                key={changeIndex}
                className={`flex items-start font-mono text-xs ${bgColor} ${borderColor} hover:bg-opacity-80 transition-colors`}
              >
                <span className="px-3 py-1 text-gray-400 dark:text-gray-600 select-none min-w-[3.5rem] text-right bg-gray-50 dark:bg-gray-900">
                  {lineNum}
                </span>
                <span
                  className={`w-6 py-1 flex items-start justify-center select-none font-bold ${
                    prefix === '+'
                      ? 'text-green-700 dark:text-green-400'
                      : prefix === '-'
                      ? 'text-red-700 dark:text-red-400'
                      : 'text-gray-400'
                  } ${prefixBg}`}
                >
                  {prefix}
                </span>
                <span className="px-3 py-1 flex-1 whitespace-pre-wrap break-all text-gray-900 dark:text-gray-100">
                  {inlineDiff ? (
                    // Render with inline highlighting
                    <>
                      {inlineDiff.segments.map((segment, segIndex) => (
                        <span
                          key={segIndex}
                          className={
                            segment.changed
                              ? change.type === 'add'
                                ? 'bg-green-200 dark:bg-green-800/50 font-semibold'
                                : 'bg-red-200 dark:bg-red-800/50 font-semibold'
                              : ''
                          }
                        >
                          {formatText(segment.text)}
                        </span>
                      ))}
                    </>
                  ) : (
                    // Render normally
                    formatText(change.value)
                  )}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
