function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

export function renderMarkdown(markdown: string): string {
  const normalized = markdown.trim().replace(/\r\n/g, '\n')
  if (!normalized) return ''

  const lines = normalized.split('\n')
  const html: string[] = []
  let inList = false
  let listType: 'ul' | 'ol' | null = null
  let inCodeBlock = false
  let codeLanguage = ''
  let codeContent: string[] = []

  const closeList = () => {
    if (inList && listType) {
      html.push(`</${listType}>`)
      inList = false
      listType = null
    }
  }

  const flushCodeBlock = () => {
    if (inCodeBlock) {
      const code = escapeHtml(codeContent.join('\n').trimEnd())
      html.push(`<pre><code${codeLanguage ? ` class="language-${escapeHtml(codeLanguage)}"` : ''}>${code}</code></pre>`)
      inCodeBlock = false
      codeLanguage = ''
      codeContent = []
    }
  }

  for (const line of lines) {
    if (line.startsWith('```')) {
      if (inCodeBlock) {
        flushCodeBlock()
      } else {
        closeList()
        codeLanguage = line.slice(3).trim()
        inCodeBlock = true
      }
      continue
    }

    if (inCodeBlock) {
      codeContent.push(line)
      continue
    }

    const trimmed = line.trim()

    if (trimmed === '') {
      closeList()
      html.push('')
      continue
    }

    // Headings
    if (/^#{1,6}\s+/.test(trimmed)) {
      closeList()
      const levelMatch = /^#+/.exec(trimmed)
      const level = levelMatch?.[0]?.length ?? 1
      const content = escapeHtml(trimmed.replace(/^#{1,6}\s+/, ''))
      html.push(`<h${level}>${content}</h${level}>`)
      continue
    }

    // Lists
    const bulletMatch = /^[-*]\s+(.*)$/.exec(trimmed)
    if (bulletMatch) {
      if (!inList || listType !== 'ul') {
        closeList()
        html.push('<ul>')
        inList = true
        listType = 'ul'
      }
      const item = bulletMatch[1] ?? ''
      html.push(`<li>${formatInline(item)}</li>`)
      continue
    }

    const numberMatch = /^\d+\.\s+(.*)$/.exec(trimmed)
    if (numberMatch) {
      if (!inList || listType !== 'ol') {
        closeList()
        html.push('<ol>')
        inList = true
        listType = 'ol'
      }
      const item = numberMatch[1] ?? ''
      html.push(`<li>${formatInline(item)}</li>`)
      continue
    }

    closeList()
    html.push(`<p>${formatInline(trimmed)}</p>`)
  }

  flushCodeBlock()
  closeList()

  return html.join('\n')
}

function formatInline(text: string): string {
  let html = escapeHtml(text)
  // Bold **text** or __text__
  html = html.replace(/(\*\*|__)(.*?)\1/g, '<strong>$2</strong>')
  // Italic *text* or _text_
  html = html.replace(/(\*|_)(.*?)\1/g, '<em>$2</em>')
  // Inline code `text`
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>')
  // Links [text](url)
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
  return html
}
