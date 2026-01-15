import type { DiffStrategy } from '@/utils/diff'

interface ToolbarProps {
  strategy: DiffStrategy
  onStrategyChange: (strategy: DiffStrategy) => void
  ignoreCase: boolean
  onIgnoreCaseChange: (value: boolean) => void
  ignoreWhitespace: boolean
  onIgnoreWhitespaceChange: (value: boolean) => void
  showWhitespace: boolean
  onShowWhitespaceChange: (value: boolean) => void
  onSwap: () => void
  onCopyDiff: () => void
  copySuccess: boolean
  canCopy: boolean
}

export default function Toolbar({
  strategy,
  onStrategyChange,
  ignoreCase,
  onIgnoreCaseChange,
  ignoreWhitespace,
  onIgnoreWhitespaceChange,
  showWhitespace,
  onShowWhitespaceChange,
  onSwap,
  onCopyDiff,
  copySuccess,
  canCopy
}: ToolbarProps) {
  return (
    <div className="flex-shrink-0 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-4 py-2.5">
      <div className="flex flex-wrap gap-x-6 gap-y-2 items-center text-sm">
        {/* Strategy Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
            Diff Mode:
          </span>
          <div className="flex gap-0.5 border border-gray-300 dark:border-gray-600 rounded-md overflow-hidden">
            {(['line', 'word', 'char'] as const).map(s => (
              <button
                key={s}
                onClick={() => onStrategyChange(s)}
                className={`px-3 py-1 text-xs font-medium transition-colors ${
                  strategy === s
                    ? 'bg-blue-600 dark:bg-blue-500 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="h-5 w-px bg-gray-300 dark:bg-gray-600" />

        {/* Options */}
        <div className="flex gap-4">
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={ignoreCase}
              onChange={e => onIgnoreCaseChange(e.target.checked)}
              className="w-3.5 h-3.5 rounded border-gray-300 dark:border-gray-600"
            />
            <span className="text-xs text-gray-700 dark:text-gray-300">
              Ignore Case
            </span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={ignoreWhitespace}
              onChange={e => onIgnoreWhitespaceChange(e.target.checked)}
              className="w-3.5 h-3.5 rounded border-gray-300 dark:border-gray-600"
            />
            <span className="text-xs text-gray-700 dark:text-gray-300">
              Ignore Whitespace
            </span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={showWhitespace}
              onChange={e => onShowWhitespaceChange(e.target.checked)}
              className="w-3.5 h-3.5 rounded border-gray-300 dark:border-gray-600"
            />
            <span className="text-xs text-gray-700 dark:text-gray-300">
              Show Whitespace
            </span>
          </label>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={onSwap}
            className="px-3 py-1 text-xs font-medium border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="Swap text A and B"
          >
            ⇄ Swap
          </button>

          <button
            onClick={onCopyDiff}
            disabled={!canCopy}
            className="px-3 py-1 text-xs font-medium border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            title="Copy unified diff format"
          >
            {copySuccess ? '✓ Copied' : 'Copy Diff'}
          </button>
        </div>
      </div>
    </div>
  )
}
