import { useEffect, useRef, useState } from 'react'
import { lexCSS } from '@/utils/css-lexer'

// Theme definitions
const themes: Record<string, string> = {
  'github-light': `::highlight(keyword) {
  color: #0550ae;
  font-weight: 600;
}
::highlight(string) {
  color: #0a3069;
}
::highlight(comment) {
  color: #6e7781;
  font-style: italic;
}
::highlight(number) {
  color: #0550ae;
}
::highlight(identifier) {
  color: #953800;
}
::highlight(punctuation) {
  color: #24292f;
}`,
  'github-dark': `::highlight(keyword) {
  color: #79c0ff;
  font-weight: 600;
}
::highlight(string) {
  color: #a5d6ff;
}
::highlight(comment) {
  color: #8b949e;
  font-style: italic;
}
::highlight(number) {
  color: #79c0ff;
}
::highlight(identifier) {
  color: #ffa657;
}
::highlight(punctuation) {
  color: #c9d1d9;
}`,
  'monokai': `::highlight(keyword) {
  color: #f92672;
  font-weight: 600;
}
::highlight(string) {
  color: #e6db74;
}
::highlight(comment) {
  color: #75715e;
  font-style: italic;
}
::highlight(number) {
  color: #ae81ff;
}
::highlight(identifier) {
  color: #a6e22e;
}
::highlight(punctuation) {
  color: #f8f8f2;
}`,
  'dracula': `::highlight(keyword) {
  color: #ff79c6;
  font-weight: 600;
}
::highlight(string) {
  color: #f1fa8c;
}
::highlight(comment) {
  color: #6272a4;
  font-style: italic;
}
::highlight(number) {
  color: #bd93f9;
}
::highlight(identifier) {
  color: #50fa7b;
}
::highlight(punctuation) {
  color: #f8f8f2;
}`,
  'nord': `::highlight(keyword) {
  color: #81a1c1;
  font-weight: 600;
}
::highlight(string) {
  color: #a3be8c;
}
::highlight(comment) {
  color: #616e88;
  font-style: italic;
}
::highlight(number) {
  color: #b48ead;
}
::highlight(identifier) {
  color: #88c0d0;
}
::highlight(punctuation) {
  color: #d8dee9;
}`,
  'solarized-light': `::highlight(keyword) {
  color: #859900;
  font-weight: 600;
}
::highlight(string) {
  color: #2aa198;
}
::highlight(comment) {
  color: #93a1a1;
  font-style: italic;
}
::highlight(number) {
  color: #d33682;
}
::highlight(identifier) {
  color: #b58900;
}
::highlight(punctuation) {
  color: #657b83;
}`,
  'solarized-dark': `::highlight(keyword) {
  color: #859900;
  font-weight: 600;
}
::highlight(string) {
  color: #2aa198;
}
::highlight(comment) {
  color: #586e75;
  font-style: italic;
}
::highlight(number) {
  color: #d33682;
}
::highlight(identifier) {
  color: #b58900;
}
::highlight(punctuation) {
  color: #839496;
}`,
  'one-dark': `::highlight(keyword) {
  color: #c678dd;
  font-weight: 600;
}
::highlight(string) {
  color: #98c379;
}
::highlight(comment) {
  color: #5c6370;
  font-style: italic;
}
::highlight(number) {
  color: #d19a66;
}
::highlight(identifier) {
  color: #61afef;
}
::highlight(punctuation) {
  color: #abb2bf;
}`,
  'night-owl': `::highlight(keyword) {
  color: #c792ea;
  font-weight: 600;
}
::highlight(string) {
  color: #ecc48d;
}
::highlight(comment) {
  color: #637777;
  font-style: italic;
}
::highlight(number) {
  color: #f78c6c;
}
::highlight(identifier) {
  color: #82aaff;
}
::highlight(punctuation) {
  color: #d6deeb;
}`
}

export default function SyntaxHighlightDemo() {
  const [code, setCode] = useState(themes['github-light'])
  const [selectedTheme, setSelectedTheme] = useState('github-light')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const previewRef = useRef<HTMLDivElement>(null)
  const cleanupRef = useRef<(() => void) | null>(null)

  // Apply CSS Custom Highlight API
  const applyHighlighting = (element: HTMLElement, cssCode: string): (() => void) => {
    if (!('highlights' in CSS)) {
      console.warn('CSS Custom Highlight API not supported')
      return () => {}
    }

    const textNode = element.firstChild
    if (!textNode || textNode.nodeType !== Node.TEXT_NODE) {
      return () => {}
    }

    const textLength = textNode.textContent?.length || 0
    const tokens = lexCSS(cssCode)
    
    // Filter out tokens that exceed the text node length and create ranges
    const tokenRanges = tokens
      .filter(token => token.start < textLength && token.end <= textLength)
      .map(token => {
        const range = new Range()
        try {
          range.setStart(textNode, token.start)
          range.setEnd(textNode, Math.min(token.end, textLength))
          return { type: token.type, range }
        } catch (e) {
          console.warn('Failed to create range for token:', token, e)
          return null
        }
      })
      .filter((item): item is { type: string; range: Range } => item !== null)
    
    const highlightsByType = new Map<string, { type: string; range: Range }[]>()
    for (const item of tokenRanges) {
      if (!highlightsByType.has(item.type)) {
        highlightsByType.set(item.type, [])
      }
      highlightsByType.get(item.type)!.push(item)
    }

    const createdHighlights = new Map<string, Highlight>()
    
    for (const [type, items] of highlightsByType) {
      const ranges = items.map(item => item.range)
      const highlight = new Highlight(...ranges)
      createdHighlights.set(type, highlight)
      
      const existing = CSS.highlights.get(type)
      if (existing) {
        ranges.forEach(range => existing.add(range))
      } else {
        CSS.highlights.set(type, highlight)
      }
    }

    return () => {
      for (const [type, highlight] of createdHighlights) {
        const globalHighlight = CSS.highlights.get(type)
        if (globalHighlight) {
          for (const range of highlight) {
            globalHighlight.delete(range)
          }
          if (globalHighlight.size === 0) {
            CSS.highlights.delete(type)
          }
        }
      }
    }
  }

  // Update CSS styles
  const updateStyles = (css: string) => {
    let styleEl = document.getElementById('highlight-styles') as HTMLStyleElement
    if (!styleEl) {
      styleEl = document.createElement('style')
      styleEl.id = 'highlight-styles'
      document.head.appendChild(styleEl)
    }
    styleEl.textContent = css
  }

  // Update preview
  const updatePreview = (cssCode: string) => {
    if (!previewRef.current) return

    // Clean up previous highlighting
    if (cleanupRef.current) {
      cleanupRef.current()
    }

    // Clear and set new content
    previewRef.current.textContent = cssCode

    // Apply new highlighting using the actual text content from the DOM
    const actualText = previewRef.current.textContent || ''
    cleanupRef.current = applyHighlighting(previewRef.current, actualText)
  }

  // Handle theme change
  const handleThemeChange = (theme: string) => {
    setSelectedTheme(theme)
    const themeCode = themes[theme]
    if (themeCode) {
      setCode(themeCode)
    }
  }

  // Handle code input
  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newCode = e.target.value
    setCode(newCode)
  }

  // Handle scroll sync
  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (previewRef.current && textareaRef.current) {
      previewRef.current.scrollTop = textareaRef.current.scrollTop
      previewRef.current.scrollLeft = textareaRef.current.scrollLeft
    }
  }

  // Initialize and update
  useEffect(() => {
    updateStyles(code)
    updatePreview(code)

    return () => {
      if (cleanupRef.current) {
        cleanupRef.current()
      }
    }
  }, [code])

  return (
    <div className="not-prose my-8">
      <div className="syntax-highlight-demo border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-900">
        <div className="demo-container-single flex flex-col">
          <div className="pane-full flex flex-col w-full">
            <div className="pane-header p-3 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <div className="header-content flex justify-between items-center gap-4 max-sm:flex-col max-sm:items-start">
                <div>
                  <h3 className="m-0 text-sm font-semibold text-gray-900 dark:text-gray-100">
                    🎨 Meta CSS Editor
                  </h3>
                  <p className="text-sm opacity-70 mt-1 mb-0">
                    Edit CSS highlight styles - this editor styles itself in real-time!
                  </p>
                </div>
                <div className="theme-selector flex items-center gap-2 whitespace-nowrap">
                  <label htmlFor="theme-select" className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    Theme:
                  </label>
                  <select
                    id="theme-select"
                    value={selectedTheme}
                    onChange={(e) => handleThemeChange(e.target.value)}
                    className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm cursor-pointer outline-none hover:border-gray-400 dark:hover:border-gray-500 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900"
                  >
                    <option value="github-light">GitHub Light</option>
                    <option value="github-dark">GitHub Dark</option>
                    <option value="monokai">Monokai</option>
                    <option value="dracula">Dracula</option>
                    <option value="nord">Nord</option>
                    <option value="solarized-light">Solarized Light</option>
                    <option value="solarized-dark">Solarized Dark</option>
                    <option value="one-dark">One Dark</option>
                    <option value="night-owl">Night Owl</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="editor-wrapper relative flex-1 min-h-[400px]">
              <textarea
                ref={textareaRef}
                value={code}
                onChange={handleCodeChange}
                onScroll={handleScroll}
                spellCheck={false}
                className="absolute top-0 left-0 w-full h-full p-5 font-mono text-sm leading-relaxed border-none outline-none resize-none bg-transparent text-transparent caret-gray-900 dark:caret-gray-100 overflow-auto whitespace-pre z-10"
                style={{ tabSize: 2 }}
              />
              <div
                ref={previewRef}
                className="absolute top-0 left-0 w-full h-full p-5 font-mono text-sm leading-relaxed whitespace-pre overflow-hidden bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 pointer-events-none z-0"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
