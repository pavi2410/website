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
    <div className="w-full max-w-7xl mx-auto">
      {/* Controls Panel */}
      <div className="mb-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900">
        <div className="flex flex-wrap gap-4 items-center">
          {/* Strategy Selector */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              Strategy:
            </label>
            <div className="flex gap-1 border border-gray-300 dark:border-gray-600 rounded-md p-0.5">
              {(['line', 'word', 'char'] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setStrategy(s)}
                  className={`px-3 py-1 text-sm rounded transition-colors ${
                    strategy === s
                      ? 'bg-blue-500 text-white'
                      : 'bg-transparent text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Options */}
          <div className="flex flex-wrap gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={ignoreCase}
                onChange={e => setIgnoreCase(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 dark:border-gray-600"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Ignore Case
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={ignoreWhitespace}
                onChange={e => setIgnoreWhitespace(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 dark:border-gray-600"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Ignore Whitespace
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showWhitespace}
                onChange={e => setShowWhitespace(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 dark:border-gray-600"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Show Whitespace
              </span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-2 ml-auto">
            <button
              onClick={handleSwap}
              className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              title="Swap text A and B"
            >
              ⇄ Swap
            </button>

            <button
              onClick={handleCopyDiff}
              disabled={hunks.length === 0}
              className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Copy unified diff format"
            >
              {copySuccess ? '✓ Copied!' : '📋 Copy Diff'}
            </button>
          </div>
        </div>
      </div>

      {/* Text Input Areas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="flex flex-col">
          <label className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Text A
          </label>
          <textarea
            value={formatText(textA)}
            onChange={e => setTextA(e.target.value)}
            className="w-full h-64 p-3 font-mono text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter first text..."
            spellCheck={false}
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Text B
          </label>
          <textarea
            value={formatText(textB)}
            onChange={e => setTextB(e.target.value)}
            className="w-full h-64 p-3 font-mono text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter second text..."
            spellCheck={false}
          />
        </div>
      </div>

      {/* Diff Viewer */}
      {hunks.length > 0 && (
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900">
          {/* Diff Header */}
          <div className="p-3 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              Diff Output ({hunks.length} {hunks.length === 1 ? 'hunk' : 'hunks'})
            </h3>
            <div className="flex gap-2">
              <button
                onClick={expandAll}
                className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Expand All
              </button>
              <button
                onClick={collapseAll}
                className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Collapse All
              </button>
            </div>
          </div>

          {/* Hunks */}
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {hunks.map((hunk, index) => (
              <div key={index} className="font-mono text-xs">
                {/* Hunk Header */}
                <button
                  onClick={() => toggleHunk(index)}
                  className="w-full px-4 py-2 text-left bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
                >
                  <span className="text-gray-500 dark:text-gray-400">
                    {expandedHunks.has(index) ? '▼' : '▶'}
                  </span>
                  <span className="text-blue-600 dark:text-blue-400 font-semibold">
                    {hunk.header}
                  </span>
                </button>

                {/* Hunk Content */}
                {expandedHunks.has(index) && (
                  <div className="bg-white dark:bg-gray-900">
                    {hunk.changes.map((change, changeIndex) => {
                      let bgColor = ''
                      let textColor = 'text-gray-900 dark:text-gray-100'
                      let prefix = ' '

                      if (change.type === 'add') {
                        bgColor = 'bg-green-50 dark:bg-green-900/20'
                        textColor = 'text-green-900 dark:text-green-100'
                        prefix = '+'
                      } else if (change.type === 'remove') {
                        bgColor = 'bg-red-50 dark:bg-red-900/20'
                        textColor = 'text-red-900 dark:text-red-100'
                        prefix = '-'
                      } else {
                        bgColor = 'bg-white dark:bg-gray-900'
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
                          className={`flex ${bgColor} ${textColor}`}
                        >
                          <span className="px-3 py-0.5 text-gray-400 dark:text-gray-600 select-none min-w-[3rem] text-right">
                            {lineNum}
                          </span>
                          <span className="px-1 select-none">{prefix}</span>
                          <span className="px-2 py-0.5 flex-1 whitespace-pre-wrap break-all">
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
        <div className="p-8 text-center border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800">
          <p className="text-gray-500 dark:text-gray-400">
            No differences found
          </p>
        </div>
      )}

      {!textA && !textB && (
        <div className="p-8 text-center border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800">
          <p className="text-gray-500 dark:text-gray-400">
            Enter text in both fields to see the diff
          </p>
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
