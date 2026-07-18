import { Highlight, themes } from 'prism-react-renderer'
import { Languages, MessageSquare, Share2, Sparkles, Square } from 'lucide-react'
import { ApiKeyInput } from './ApiKeyInput.tsx'
import type { Language } from '../types/review.ts'

const LANGUAGES: Language[] = [
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

const PRISM_LANGUAGE_MAP: Record<Language, string> = {
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

interface CodeInputProps {
  code: string
  setCode: (code: string) => void
  language: Language
  setLanguage: (language: Language) => void
  context: string
  setContext: (context: string) => void
  apiKey: string
  setApiKey: (key: string) => void
  onReview: () => void
  onShare: () => void
  onDemo: () => void
  loading: boolean
}

export function CodeInput({
  code,
  setCode,
  language,
  setLanguage,
  context,
  setContext,
  apiKey,
  setApiKey,
  onReview,
  onShare,
  onDemo,
  loading,
}: CodeInputProps) {
  const prismLanguage = PRISM_LANGUAGE_MAP[language] ?? 'text'

  return (
    <div className="flex h-full flex-col gap-5 overflow-y-auto p-5 scrollbar-thin">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent">
          <Sparkles size={20} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-100">AI Code Review</h1>
          <p className="text-sm text-slate-400">Paste code, add context, and review with GPT-4o-mini.</p>
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="language" className="block text-sm font-medium text-slate-200">
          Language
        </label>
        <div className="relative">
          <Languages size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <select
            id="language"
            value={language}
            onChange={(e) => setLanguage(e.target.value as Language)}
            className="w-full appearance-none rounded-lg border border-surface-500 bg-surface-800 py-2.5 pl-10 pr-10 text-sm text-slate-100 outline-none ring-accent focus:border-accent focus:ring-1"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>
          <ChevronIcon className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="code" className="block text-sm font-medium text-slate-200">
          Code
        </label>
        <div className="code-editor">
          <Highlight theme={themes.vsDark} code={code} language={prismLanguage}>
            {({ className, style, tokens, getLineProps, getTokenProps }) => (
              <pre className={className} style={{ ...style, margin: 0, background: 'transparent' }}>
                {tokens.map((line, i) => (
                  <div key={i} {...getLineProps({ line })}>
                    {line.map((token, key) => (
                      <span key={key} {...getTokenProps({ token })} />
                    ))}
                  </div>
                ))}
              </pre>
            )}
          </Highlight>
          <textarea
            id="code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Paste your code here..."
            spellCheck={false}
            autoCapitalize="off"
            autoComplete="off"
            autoCorrect="off"
            aria-label="Code input"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="context" className="block text-sm font-medium text-slate-200">
          Context <span className="text-slate-500">(optional)</span>
        </label>
        <div className="relative">
          <MessageSquare size={16} className="absolute left-3 top-3 text-slate-400" />
          <textarea
            id="context"
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder="What should the reviewer focus on? e.g., 'This is a hot path in production.'"
            rows={3}
            className="w-full resize-y rounded-lg border border-surface-500 bg-surface-800 py-2.5 pl-10 pr-3 text-sm text-slate-100 placeholder-slate-500 outline-none ring-accent focus:border-accent focus:ring-1"
          />
        </div>
      </div>

      <ApiKeyInput value={apiKey} onChange={setApiKey} />

      <div className="grid grid-cols-2 gap-3 pt-2">
        <button
          type="button"
          onClick={onShare}
          className="flex items-center justify-center gap-2 rounded-lg border border-surface-500 bg-surface-700 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:bg-surface-600"
        >
          <Share2 size={16} />
          Share
        </button>
        <button
          type="button"
          onClick={onReview}
          disabled={!loading && (!code.trim() || !apiKey.trim())}
          className={`flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-50 ${
            loading ? 'bg-red-500/80 hover:bg-red-500' : 'bg-accent hover:bg-accent-hover'
          }`}
        >
          {loading ? (
            <>
              <Square size={16} />
              Stop
            </>
          ) : (
            <>
              <Sparkles size={16} />
              Review
            </>
          )}
        </button>
      </div>

      <div className="text-center">
        <button
          type="button"
          onClick={onDemo}
          className="text-xs text-slate-400 underline-offset-2 transition hover:text-accent hover:underline"
        >
          No API key? Try a demo →
        </button>
      </div>
    </div>
  )
}

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}
