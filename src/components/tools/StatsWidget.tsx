interface StatsWidgetProps {
  text: string
  label?: string
}

function calculateStats(text: string) {
  const chars = text.length
  const words = text.trim() ? text.trim().split(/\s+/).length : 0
  const lines = text ? text.split('\n').length : 0
  const bytes = new Blob([text]).size

  const formatBytes = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return {
    chars,
    words,
    lines,
    size: formatBytes(bytes)
  }
}

export default function StatsWidget({ text, label }: StatsWidgetProps) {
  const stats = calculateStats(text)

  return (
    <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
      {label && (
        <>
          <span className="font-medium">{label}</span>
          <div className="h-3 w-px bg-gray-300 dark:bg-gray-600" />
        </>
      )}
      <span title="Lines">{stats.lines} lines</span>
      <span title="Words">{stats.words} words</span>
      <span title="Characters">{stats.chars} chars</span>
      <span title="Size">{stats.size}</span>
    </div>
  )
}
