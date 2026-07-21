import type { Language } from '../types/review.ts'

export const PRISM_LANGUAGE_MAP: Record<Language, string> = {
  TypeScript: 'typescript',
  JavaScript: 'javascript',
  Python: 'python',
  Go: 'go',
  Rust: 'rust',
  Java: 'java',
  'C++': 'cpp',
  CSS: 'css',
  HTML: 'html',
  Other: 'text',
}
