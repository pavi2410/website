import * as Diff from 'diff'

export type DiffStrategy = 'line' | 'word' | 'char'

export interface DiffOptions {
  strategy: DiffStrategy
  ignoreCase: boolean
  ignoreWhitespace: boolean
}

export interface DiffChange {
  type: 'add' | 'remove' | 'unchanged'
  value: string
  lineNumber?: {
    old?: number
    new?: number
  }
}

export interface DiffHunk {
  header: string
  changes: DiffChange[]
  oldStart: number
  oldLines: number
  newStart: number
  newLines: number
}

/**
 * Compute diff between two texts
 */
export function computeDiff(
  textA: string,
  textB: string,
  options: DiffOptions
): Diff.Change[] {
  let changes: Diff.Change[]

  const diffOptions = {
    ignoreCase: options.ignoreCase,
    ignoreWhitespace: options.ignoreWhitespace
  }

  switch (options.strategy) {
    case 'line':
      changes = Diff.diffLines(textA, textB, diffOptions)
      break
    case 'word':
      changes = Diff.diffWords(textA, textB, diffOptions)
      break
    case 'char':
      changes = Diff.diffChars(textA, textB, diffOptions)
      break
    default:
      changes = Diff.diffLines(textA, textB, diffOptions)
  }

  return changes
}

/**
 * Convert diff changes to our DiffChange format with line numbers
 */
function convertToChanges(changes: Diff.Change[], strategy: DiffStrategy): DiffChange[] {
  const result: DiffChange[] = []
  let oldLine = 1
  let newLine = 1

  for (const change of changes) {
    const lines = strategy === 'line' ? change.value.split('\n').filter((_, i, arr) => i < arr.length - 1 || change.value.endsWith('\n')) : [change.value]

    for (const line of lines) {
      if (change.added) {
        result.push({
          type: 'add',
          value: line,
          lineNumber: { new: newLine }
        })
        newLine++
      } else if (change.removed) {
        result.push({
          type: 'remove',
          value: line,
          lineNumber: { old: oldLine }
        })
        oldLine++
      } else {
        result.push({
          type: 'unchanged',
          value: line,
          lineNumber: { old: oldLine, new: newLine }
        })
        oldLine++
        newLine++
      }
    }
  }

  return result
}

/**
 * Group changes into hunks with context lines
 */
export function groupIntoHunks(
  changes: Diff.Change[],
  strategy: DiffStrategy,
  contextLines: number = 3
): DiffHunk[] {
  if (strategy !== 'line') {
    // For word and char diffs, return a single hunk
    const allChanges = convertToChanges(changes, strategy)
    return [{
      header: '@@ -1 +1 @@',
      changes: allChanges,
      oldStart: 1,
      oldLines: allChanges.filter(c => c.type !== 'add').length,
      newStart: 1,
      newLines: allChanges.filter(c => c.type !== 'remove').length
    }]
  }

  const allChanges = convertToChanges(changes, strategy)
  const hunks: DiffHunk[] = []
  let currentHunk: DiffChange[] | null = null
  let hunkOldStart = 0
  let hunkNewStart = 0
  let lastChangeIndex = -1

  for (let i = 0; i < allChanges.length; i++) {
    const change = allChanges[i]
    const isChanged = change.type !== 'unchanged'

    if (isChanged) {
      // Found a change
      if (currentHunk === null) {
        // Start new hunk
        currentHunk = []
        const startIndex = Math.max(0, i - contextLines)
        hunkOldStart = allChanges[startIndex].lineNumber?.old || 1
        hunkNewStart = allChanges[startIndex].lineNumber?.new || 1

        // Add context lines before
        for (let j = startIndex; j < i; j++) {
          currentHunk.push(allChanges[j])
        }
      }

      currentHunk.push(change)
      lastChangeIndex = i
    } else if (currentHunk !== null) {
      // In a hunk, check if we should continue or close it
      const distanceFromLastChange = i - lastChangeIndex

      if (distanceFromLastChange <= contextLines * 2) {
        // Continue hunk
        currentHunk.push(change)
      } else {
        // Close hunk with context
        for (let j = lastChangeIndex + 1; j < lastChangeIndex + 1 + contextLines; j++) {
          if (j < allChanges.length) {
            currentHunk.push(allChanges[j])
          }
        }

        // Save hunk
        const oldLines = currentHunk.filter(c => c.type !== 'add').length
        const newLines = currentHunk.filter(c => c.type !== 'remove').length
        hunks.push({
          header: `@@ -${hunkOldStart},${oldLines} +${hunkNewStart},${newLines} @@`,
          changes: currentHunk,
          oldStart: hunkOldStart,
          oldLines,
          newStart: hunkNewStart,
          newLines
        })

        currentHunk = null
      }
    }
  }

  // Close last hunk if exists
  if (currentHunk !== null) {
    const endIndex = Math.min(allChanges.length, lastChangeIndex + 1 + contextLines)
    for (let j = lastChangeIndex + 1; j < endIndex; j++) {
      currentHunk.push(allChanges[j])
    }

    const oldLines = currentHunk.filter(c => c.type !== 'add').length
    const newLines = currentHunk.filter(c => c.type !== 'remove').length
    hunks.push({
      header: `@@ -${hunkOldStart},${oldLines} +${hunkNewStart},${newLines} @@`,
      changes: currentHunk,
      oldStart: hunkOldStart,
      oldLines,
      newStart: hunkNewStart,
      newLines
    })
  }

  return hunks
}

/**
 * Format hunks as unified diff
 */
export function formatAsUnifiedDiff(hunks: DiffHunk[]): string {
  let output = ''

  for (const hunk of hunks) {
    output += hunk.header + '\n'

    for (const change of hunk.changes) {
      let prefix = ' '
      if (change.type === 'add') {
        prefix = '+'
      } else if (change.type === 'remove') {
        prefix = '-'
      }

      output += prefix + change.value + '\n'
    }
  }

  return output
}

/**
 * Replace whitespace characters with visible symbols
 */
export function visualizeWhitespace(text: string): string {
  return text
    .replace(/ /g, '·')
    .replace(/\t/g, '→')
    .replace(/\n/g, '↵\n')
}

/**
 * Compute inline word-level diff for highlighting within lines
 */
export function computeInlineDiff(oldText: string, newText: string): {
  oldSegments: Array<{ text: string; changed: boolean }>
  newSegments: Array<{ text: string; changed: boolean }>
} {
  const changes = Diff.diffWordsWithSpace(oldText, newText)

  const oldSegments: Array<{ text: string; changed: boolean }> = []
  const newSegments: Array<{ text: string; changed: boolean }> = []

  for (const change of changes) {
    if (change.removed) {
      oldSegments.push({ text: change.value, changed: true })
    } else if (change.added) {
      newSegments.push({ text: change.value, changed: true })
    } else {
      oldSegments.push({ text: change.value, changed: false })
      newSegments.push({ text: change.value, changed: false })
    }
  }

  return { oldSegments, newSegments }
}
