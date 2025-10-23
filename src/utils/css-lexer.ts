// Simple CSS lexer for demonstration purposes
export interface Token {
  type: string
  start: number
  end: number
  value: string
}

export function lexCSS(code: string): Token[] {
  const tokens: Token[] = []
  let i = 0

  const punctuation = new Set(['{', '}', '(', ')', ';', ':', ','])

  while (i < code.length) {
    const char = code[i]

    if (/\s/.test(char)) {
      i++
      continue
    }

    // Line comment
    if (char === '/' && code[i + 1] === '/') {
      const start = i
      i += 2
      while (i < code.length && code[i] !== '\n') i++
      tokens.push({ type: 'comment', start, end: i, value: code.slice(start, i) })
      continue
    }

    // Block comment
    if (char === '/' && code[i + 1] === '*') {
      const start = i
      i += 2
      while (i < code.length - 1 && !(code[i] === '*' && code[i + 1] === '/')) i++
      i += 2
      tokens.push({ type: 'comment', start, end: i, value: code.slice(start, i) })
      continue
    }

    // String literals
    if (char === '"' || char === "'") {
      const start = i
      const quote = char
      i++
      while (i < code.length && code[i] !== quote) {
        if (code[i] === '\\') i++
        i++
      }
      i++
      tokens.push({ type: 'string', start, end: i, value: code.slice(start, i) })
      continue
    }

    // Hex colors
    if (char === '#') {
      const start = i
      i++
      while (i < code.length && /[0-9a-fA-F]/.test(code[i])) i++
      tokens.push({ type: 'string', start, end: i, value: code.slice(start, i) })
      continue
    }

    // Numbers
    if (/\d/.test(char)) {
      const start = i
      while (i < code.length && /[\d.]/.test(code[i])) i++
      tokens.push({ type: 'number', start, end: i, value: code.slice(start, i) })
      continue
    }

    // CSS selectors (::highlight, etc)
    if (char === ':' && code[i + 1] === ':') {
      const start = i
      i += 2
      while (i < code.length && /[a-zA-Z-]/.test(code[i])) i++
      tokens.push({ type: 'keyword', start, end: i, value: code.slice(start, i) })
      continue
    }

    // Properties and identifiers
    if (/[a-zA-Z-]/.test(char)) {
      const start = i
      while (i < code.length && /[a-zA-Z0-9-]/.test(code[i])) i++
      tokens.push({ type: 'identifier', start, end: i, value: code.slice(start, i) })
      continue
    }

    // Punctuation
    if (punctuation.has(char)) {
      tokens.push({ type: 'punctuation', start: i, end: i + 1, value: char })
      i++
      continue
    }
    
    i++
  }

  return tokens
}
