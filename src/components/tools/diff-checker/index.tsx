import { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import { NuqsAdapter } from 'nuqs/adapters/react'
import { parseAsString, parseAsBoolean, useQueryState } from 'nuqs'
import {
  computeDiff,
  groupIntoHunks,
  formatAsUnifiedDiff,
  visualizeWhitespace,
  type DiffStrategy
} from '@/utils/diff'
import Toolbar from './Toolbar'
import TextInputPanel from './TextInputPanel'
import DiffViewer from './DiffViewer'
import EmptyState from './EmptyState'

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
  const [lineWrap, setLineWrap] = useQueryState(
    'wrap',
    parseAsBoolean.withDefault(true).withOptions({ shallow: false })
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
      <Toolbar
        strategy={strategy as DiffStrategy}
        onStrategyChange={setStrategy}
        ignoreCase={ignoreCase}
        onIgnoreCaseChange={setIgnoreCase}
        ignoreWhitespace={ignoreWhitespace}
        onIgnoreWhitespaceChange={setIgnoreWhitespace}
        showWhitespace={showWhitespace}
        onShowWhitespaceChange={setShowWhitespace}
        lineWrap={lineWrap}
        onLineWrapChange={setLineWrap}
        onSwap={handleSwap}
        onCopyDiff={handleCopyDiff}
        copySuccess={copySuccess}
        canCopy={hunks.length > 0}
      />

      {/* Text Input Areas */}
      <div className="flex-shrink-0 grid grid-cols-1 md:grid-cols-2 border-b border-gray-200 dark:border-gray-700">
        <TextInputPanel
          label="Text A (Original)"
          value={textA}
          onChange={setTextA}
          placeholder="Paste or type original text..."
          lineWrap={lineWrap}
        />
        <TextInputPanel
          label="Text B (Modified)"
          value={textB}
          onChange={setTextB}
          placeholder="Paste or type modified text..."
          lineWrap={lineWrap}
        />
      </div>

      {/* Diff Viewer */}
      {hunks.length > 0 && (
        <DiffViewer
          hunks={hunks}
          expandedHunks={expandedHunks}
          onToggleHunk={toggleHunk}
          onExpandAll={expandAll}
          onCollapseAll={collapseAll}
          formatText={formatText}
          strategy={strategy as DiffStrategy}
        />
      )}

      {/* Empty States */}
      {hunks.length === 0 && (textA || textB) && (
        <EmptyState
          icon="✓"
          title="No differences found"
          description="The texts are identical"
        />
      )}

      {!textA && !textB && (
        <EmptyState
          icon="📝"
          title="Ready to compare"
          description="Enter text in both fields above to see the differences"
        />
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
