import { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import { NuqsAdapter } from 'nuqs/adapters/react'
import { parseAsString, parseAsBoolean, useQueryState } from 'nuqs'
import {
  computeDiff,
  groupIntoHunks,
  formatAsUnifiedDiff,
  visualizeWhitespace,
  type DiffStrategy,
  type DiffHunk
} from '@/utils/diff'

interface DiffState {
  textA: string
  textB: string
}

function DiffCheckerContent() {
  // Generate unique tab ID
  const tabId = useRef(
    typeof window !== 'undefined'
      ? sessionStorage.getItem('diff-tab-id') ||
        `tab-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      : ''
  ).current

  // Store tab ID in sessionStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && tabId) {
      sessionStorage.setItem('diff-tab-id', tabId)
    }
  }, [tabId])

  const STORAGE_KEY = `diff-checker-${tabId}`

  // URL state with nuqs
  const [strategy, setStrategy] = useQueryState(
    'strategy',
    parseAsString.withDefault('line').withOptions({ shallow: false })
  )
  const [ignoreCase, setIgnoreCase] = useQueryState(
    'ignoreCase',
    parseAsBoolean.withDefault(false).withOptions({ shallow: false })
  )
  const [ignoreWhitespace, setIgnoreWhitespace] = useQueryState(
    'ignoreWS',
    parseAsBoolean.withDefault(false).withOptions({ shallow: false })
  )
  const [showWhitespace, setShowWhitespace] = useQueryState(
    'showWS',
    parseAsBoolean.withDefault(false).withOptions({ shallow: false })
  )

  // Local state
  const [textA, setTextA] = useState('')
  const [textB, setTextB] = useState('')
  const [expandedHunks, setExpandedHunks] = useState<Set<number>>(new Set())
  const [copySuccess, setCopySuccess] = useState(false)

  // Load from sessionStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return

    const saved = sessionStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const state: DiffState = JSON.parse(saved)
        setTextA(state.textA || '')
        setTextB(state.textB || '')
      } catch (e) {
        console.error('Failed to parse saved state:', e)
      }
    }
  }, [STORAGE_KEY])

  // Save to sessionStorage (debounced)
  useEffect(() => {
    if (typeof window === 'undefined') return

    const timer = setTimeout(() => {
      const state: DiffState = { textA, textB }
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    }, 500)

    return () => clearTimeout(timer)
  }, [textA, textB, STORAGE_KEY])

  // Compute diff
  const diffChanges = useMemo(() => {
    if (!textA && !textB) return []
    return computeDiff(textA, textB, {
      strategy: strategy as DiffStrategy,
      ignoreCase,
      ignoreWhitespace
    })
  }, [textA, textB, strategy, ignoreCase, ignoreWhitespace])

  // Group into hunks
  const hunks = useMemo(() => {
    return groupIntoHunks(diffChanges, strategy as DiffStrategy, 3)
  }, [diffChanges, strategy])

  // Handle swap
  const handleSwap = useCallback(() => {
    setTextA(textB)
    setTextB(textA)
  }, [textA, textB])

  // Handle expand/collapse hunk
  const toggleHunk = useCallback((index: number) => {
    setExpandedHunks(prev => {
      const next = new Set(prev)
      if (next.has(index)) {
        next.delete(index)
      } else {
        next.add(index)
      }
      return next
    })
  }, [])

  // Handle expand/collapse all
  const expandAll = useCallback(() => {
    setExpandedHunks(new Set(hunks.map((_, i) => i)))
  }, [hunks])

  const collapseAll = useCallback(() => {
    setExpandedHunks(new Set())
  }, [])

  // Handle copy diff
  const handleCopyDiff = useCallback(async () => {
    const unifiedDiff = formatAsUnifiedDiff(hunks)
    try {
      await navigator.clipboard.writeText(unifiedDiff)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }, [hunks])

  // Format text with whitespace visualization
  const formatText = useCallback(
    (text: string) => {
      return showWhitespace ? visualizeWhitespace(text) : text
    },
    [showWhitespace]
  )

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
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
                  onClick={() => setStrategy(s)}
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
                onChange={e => setIgnoreCase(e.target.checked)}
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
                onChange={e => setIgnoreWhitespace(e.target.checked)}
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
                onChange={e => setShowWhitespace(e.target.checked)}
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
              onClick={handleSwap}
              className="px-3 py-1 text-xs font-medium border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Swap text A and B"
            >
              ⇄ Swap
            </button>

            <button
              onClick={handleCopyDiff}
              disabled={hunks.length === 0}
              className="px-3 py-1 text-xs font-medium border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              title="Copy unified diff format"
            >
              {copySuccess ? '✓ Copied' : 'Copy Diff'}
            </button>
          </div>
        </div>
      </div>

      {/* Text Input Areas */}
      <div className="flex-shrink-0 grid grid-cols-1 md:grid-cols-2 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col border-r border-gray-200 dark:border-gray-700">
          <div className="px-3 py-2 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
            <span className="text-xs font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wide">
              Text A (Original)
            </span>
          </div>
          <textarea
            value={formatText(textA)}
            onChange={e => setTextA(e.target.value)}
            className="w-full h-80 p-3 font-mono text-sm border-none bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 resize-none focus:outline-none focus:ring-0"
            placeholder="Paste or type original text..."
            spellCheck={false}
          />
        </div>

        <div className="flex flex-col">
          <div className="px-3 py-2 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
            <span className="text-xs font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wide">
              Text B (Modified)
            </span>
          </div>
          <textarea
            value={formatText(textB)}
            onChange={e => setTextB(e.target.value)}
            className="w-full h-80 p-3 font-mono text-sm border-none bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 resize-none focus:outline-none focus:ring-0"
            placeholder="Paste or type modified text..."
            spellCheck={false}
          />
        </div>
      </div>

      {/* Diff Viewer */}
      {hunks.length > 0 && (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Diff Header */}
          <div className="flex-shrink-0 px-4 py-2 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wide">
                Diff
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {hunks.length} {hunks.length === 1 ? 'change' : 'changes'}
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={expandAll}
                className="px-2 py-1 text-xs font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
              >
                Expand All
              </button>
              <button
                onClick={collapseAll}
                className="px-2 py-1 text-xs font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
              >
                Collapse All
              </button>
            </div>
          </div>

          {/* Hunks */}
          <div className="flex-1 overflow-y-auto">
            {hunks.map((hunk, index) => (
              <div key={index} className="border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                {/* Hunk Header */}
                <button
                  onClick={() => toggleHunk(index)}
                  className="w-full px-4 py-2 text-left bg-blue-50 dark:bg-blue-950/30 hover:bg-blue-100 dark:hover:bg-blue-950/50 transition-colors flex items-center gap-2 border-b border-blue-200 dark:border-blue-900"
                >
                  <span className="text-gray-600 dark:text-gray-400 text-xs">
                    {expandedHunks.has(index) ? '▼' : '▶'}
                  </span>
                  <span className="text-blue-700 dark:text-blue-300 font-mono text-xs font-semibold">
                    {hunk.header}
                  </span>
                </button>

                {/* Hunk Content */}
                {expandedHunks.has(index) && (
                  <div className="bg-white dark:bg-gray-950">
                    {hunk.changes.map((change, changeIndex) => {
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
                          className={`flex font-mono text-xs ${bgColor} ${borderColor} hover:bg-opacity-80 transition-colors`}
                        >
                          <span className="px-3 py-1 text-gray-400 dark:text-gray-600 select-none min-w-[3.5rem] text-right bg-gray-50 dark:bg-gray-900">
                            {lineNum}
                          </span>
                          <span className={`w-6 flex items-center justify-center select-none font-bold ${prefix === '+' ? 'text-green-700 dark:text-green-400' : prefix === '-' ? 'text-red-700 dark:text-red-400' : 'text-gray-400'} ${prefixBg}`}>
                            {prefix}
                          </span>
                          <span className="px-3 py-1 flex-1 whitespace-pre-wrap break-all text-gray-900 dark:text-gray-100">
                            {formatText(change.value)}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {hunks.length === 0 && (textA || textB) && (
        <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="text-center">
            <div className="text-4xl mb-3">✓</div>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
              No differences found
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              The texts are identical
            </p>
          </div>
        </div>
      )}

      {!textA && !textB && (
        <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="text-center max-w-md">
            <div className="text-4xl mb-3">📝</div>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
              Ready to compare
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Enter text in both fields above to see the differences
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default function DiffChecker() {
  return (
    <NuqsAdapter>
      <DiffCheckerContent />
    </NuqsAdapter>
  )
}
