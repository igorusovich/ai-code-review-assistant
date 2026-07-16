import { useState } from 'react'
import { ChevronDown, ChevronUp, Copy, Check } from 'lucide-react'
import { renderMarkdown } from '../utils/renderMarkdown.ts'

interface ReviewSectionProps {
  title: string
  children: string
  defaultOpen?: boolean
  badge?: React.ReactNode
  codeBlock?: boolean
}

export function ReviewSection({ title, children, defaultOpen = true, badge, codeBlock = false }: ReviewSectionProps) {
  const [open, setOpen] = useState(defaultOpen)
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(children)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Ignore copy failures
    }
  }

  if (!children.trim()) return null

  return (
    <div className="overflow-hidden rounded-lg border border-surface-500 bg-surface-700/50">
      <div className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-surface-700">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex flex-1 items-center gap-3 text-left"
        >
          <span className="font-semibold text-slate-100">{title}</span>
          {badge}
        </button>

        <div className="flex items-center gap-2">
          {codeBlock && (
            <button
              type="button"
              onClick={() => void handleCopy()}
              className="rounded p-1 text-slate-400 hover:bg-surface-600 hover:text-slate-200"
              aria-label="Copy to clipboard"
            >
              {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
            </button>
          )}
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="rounded p-1 text-slate-400 hover:bg-surface-600 hover:text-slate-200"
            aria-label={open ? 'Collapse section' : 'Expand section'}
          >
            {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-surface-500 px-4 py-4">
          {codeBlock ? (
            <div className="relative">
              <pre className="overflow-x-auto rounded-lg border border-surface-500 bg-surface-900 p-4 font-mono text-sm leading-6 text-slate-200">
                <code>{children}</code>
              </pre>
            </div>
          ) : (
            <div
              className="review-markdown text-sm"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(children) }}
            />
          )}
        </div>
      )}
    </div>
  )
}
