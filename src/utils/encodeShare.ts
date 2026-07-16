import type { Language, ReviewInputs } from '../types/review.ts'

export interface ShareData extends ReviewInputs {}

export function encodeShare(data: ShareData): string {
  try {
    const json = JSON.stringify({
      code: data.code,
      language: data.language,
      context: data.context,
    })
    return btoa(encodeURIComponent(json))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '')
  } catch {
    return ''
  }
}

export function decodeShare(hash: string): ShareData | null {
  try {
    const cleaned = hash.replace(/^#/, '')
    if (!cleaned) return null

    const base64 = cleaned.replace(/-/g, '+').replace(/_/g, '/')
    const padding = base64.length % 4
    const padded = padding ? base64 + '='.repeat(4 - padding) : base64

    const json = decodeURIComponent(atob(padded))
    const parsed = JSON.parse(json) as Record<string, unknown>

    if (typeof parsed.code !== 'string') return null
    if (typeof parsed.context !== 'string') return null
    if (typeof parsed.language !== 'string') return null

    const validLanguages: string[] = [
      'TypeScript',
      'JavaScript',
      'Python',
      'Go',
      'Rust',
      'Java',
      'C++',
      'CSS',
      'HTML',
      'Other',
    ]

    if (!validLanguages.includes(parsed.language)) {
      return null
    }

    return {
      code: parsed.code,
      language: parsed.language as Language,
      context: parsed.context,
    }
  } catch {
    return null
  }
}

export function updateUrlHash(data: ShareData): void {
  if (typeof window === 'undefined') return
  const encoded = encodeShare(data)
  const newHash = encoded ? `#${encoded}` : ''
  window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}${newHash}`)
}

export function readUrlHash(): ShareData | null {
  if (typeof window === 'undefined') return null
  return decodeShare(window.location.hash)
}

export async function copyShareUrl(data: ShareData): Promise<boolean> {
  const encoded = encodeShare(data)
  if (!encoded) return false

  const url = `${window.location.origin}${window.location.pathname}#${encoded}`

  try {
    await navigator.clipboard.writeText(url)
    return true
  } catch {
    try {
      const textarea = document.createElement('textarea')
      textarea.value = url
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      const success = document.execCommand('copy')
      document.body.removeChild(textarea)
      return success
    } catch {
      return false
    }
  }
}
