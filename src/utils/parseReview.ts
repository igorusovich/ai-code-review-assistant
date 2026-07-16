import type { BugRisk, ReviewResult } from '../types/review.ts'

const SECTION_HEADERS = [
  'Bug Risk',
  'Summary',
  'Style Issues',
  'Performance',
  'Security',
  'Suggested Fix',
] as const

type SectionName = (typeof SECTION_HEADERS)[number]

export function parseReview(raw: string): ReviewResult {
  const sections = extractSections(raw)

  const bugRisk = parseBugRisk(sections['Bug Risk']?.content ?? '')
  const bugRiskExplanation = cleanSectionContent(sections['Bug Risk']?.content ?? '')
    .replace(/\[?(High|Medium|Low)\]?/i, '')
    .trim()

  const result: ReviewResult = {
    bugRisk,
    summary: cleanSectionContent(sections['Summary']?.content ?? ''),
    bugRiskExplanation: bugRiskExplanation || 'No bug risk explanation provided.',
    styleIssues: parseList(cleanSectionContent(sections['Style Issues']?.content ?? '')),
    performance: parseList(cleanSectionContent(sections['Performance']?.content ?? '')),
    security: parseList(cleanSectionContent(sections['Security']?.content ?? '')),
    suggestedFix: extractCodeBlock(sections['Suggested Fix']?.content ?? '') || cleanSectionContent(sections['Suggested Fix']?.content ?? ''),
    raw,
  }

  // If we couldn't parse any sections, treat the whole response as the summary.
  if (Object.keys(sections).length === 0) {
    result.summary = raw.trim()
  }

  return result
}

interface Section {
  name: SectionName
  content: string
}

function extractSections(raw: string): Record<string, Section> {
  const sections: Record<string, Section> = {}
  const headerRegex = /^##\s+(.+)$/m

  let remaining = raw
  let match = headerRegex.exec(remaining)

  while (match !== null) {
    const rawHeader = match[1]
    if (rawHeader === undefined) {
      remaining = remaining.slice(match.index + match[0].length)
      match = headerRegex.exec(remaining)
      continue
    }

    const headerName = rawHeader.trim()
    const headerIndex = SECTION_HEADERS.findIndex((h) => headerName.toLowerCase().startsWith(h.toLowerCase()))
    if (headerIndex === -1) {
      remaining = remaining.slice(match.index + match[0].length)
      match = headerRegex.exec(remaining)
      continue
    }

    const normalizedName = SECTION_HEADERS[headerIndex]
    if (normalizedName === undefined) {
      remaining = remaining.slice(match.index + match[0].length)
      match = headerRegex.exec(remaining)
      continue
    }

    const startContent = match.index + match[0].length
    remaining = remaining.slice(startContent)

    const nextMatch = headerRegex.exec(remaining)
    const content = nextMatch === null ? remaining : remaining.slice(0, nextMatch.index)

    sections[normalizedName] = { name: normalizedName, content: content.trim() }
    remaining = nextMatch === null ? '' : remaining.slice(nextMatch.index)
    match = headerRegex.exec(remaining)
  }

  return sections
}

function parseBugRisk(content: string): BugRisk {
  const match = /\b(High|Medium|Low)\b/i.exec(content)
  const value = match?.[1]?.toLowerCase()
  if (value === 'high') return 'High'
  if (value === 'medium') return 'Medium'
  if (value === 'low') return 'Low'
  return 'Low'
}

function parseList(content: string): string[] {
  if (!content) return []
  const items = content
    .split(/\n/)
    .map((line) => line.replace(/^[-*]\s+/, '').trim())
    .filter((line) => line.length > 0)
  return items
}

function extractCodeBlock(content: string): string | null {
  const match = /```(?:\w+)?\n?([\s\S]*?)```/.exec(content)
  return match?.[1]?.trim() ?? null
}

function cleanSectionContent(content: string): string {
  return content
    .replace(/^\s*[:：]\s*/, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}
