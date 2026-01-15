import { useRef, useEffect } from 'react'
import StatsWidget from './StatsWidget'

interface TextInputPanelProps {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder: string
  lineWrap: boolean
}

export default function TextInputPanel({
  label,
  value,
  onChange,
  placeholder,
  lineWrap
}: TextInputPanelProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const lineNumbersRef = useRef<HTMLDivElement>(null)

  // Sync scroll between line numbers and textarea
  const handleScroll = () => {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop
    }
  }

  // Determine white-space and overflow styles based on lineWrap
  const textareaClasses = lineWrap
    ? 'relative z-0 h-full w-full pl-15 pr-3 py-3 font-mono text-sm leading-5 border-none bg-transparent text-gray-900 dark:text-gray-100 resize-none focus:outline-none focus:ring-0 whitespace-pre-wrap wrap-break-word overflow-auto'
    : 'relative z-0 h-full w-full pl-15 pr-3 py-3 font-mono text-sm leading-5 border-none bg-transparent text-gray-900 dark:text-gray-100 resize-none focus:outline-none focus:ring-0 whitespace-pre overflow-auto'

  // Split text into actual lines for proper line number positioning
  const lines = value ? value.split('\n') : ['']

  return (
    <div className="flex flex-col border-r border-gray-200 dark:border-gray-700 last:border-r-0">
      {/* Header */}
      <div className="px-3 py-2 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wide">
          {label}
        </span>
        <StatsWidget text={value} />
      </div>

      {/* Editor with line numbers */}
      <div className="relative h-80 bg-white dark:bg-gray-950">
        <div className="absolute inset-y-0 left-0 w-12 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 pointer-events-none" />
        <div
          ref={lineNumbersRef}
          className="absolute inset-0 overflow-hidden select-none pointer-events-none z-10"
          style={{ overflowY: 'hidden' }}
        >
          <div className="py-3">
            {lines.map((line, index) => (
              <div key={index} className="relative">
                {/* Invisible text that wraps the same way as textarea */}
                <div
                  className={`pl-15 pr-3 font-mono text-sm leading-5 opacity-0 ${
                    lineWrap ? 'whitespace-pre-wrap wrap-break-word' : 'whitespace-pre'
                  }`}
                >
                  {line || '\n'}
                </div>
                {/* Line number overlay */}
                <div className="absolute top-0 left-0 w-12 pr-2 text-right font-mono text-xs leading-5 text-gray-400 dark:text-gray-600">
                  {index + 1}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={e => onChange(e.target.value)}
          onScroll={handleScroll}
          className={textareaClasses}
          placeholder={placeholder}
          spellCheck={false}
        />
      </div>
    </div>
  )
}
