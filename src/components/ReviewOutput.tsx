import { AlertTriangle, CheckCircle, Clock, XCircle } from 'lucide-react'
import { ReviewSection } from './ReviewSection.tsx'
import { PRISM_LANGUAGE_MAP } from '../utils/prismLanguage.ts'
import type { BugRisk, Language, ReviewError } from '../types/review.ts'

interface ReviewOutputProps {
  review: string
  language: Language
  parsed: {
    bugRisk: BugRisk
    summary: string
    bugRiskExplanation: string
    styleIssues: string[]
    performance: string[]
    security: string[]
    suggestedFix: string
  }
  loading: boolean
  error: ReviewError | null
  isDemo?: boolean
}

export function ReviewOutput({ review, language, parsed, loading, error, isDemo = false }: ReviewOutputProps) {
  const hasContent = review.trim().length > 0
  const prismLanguage = PRISM_LANGUAGE_MAP[language] ?? 'text'

  return (
    <div className="flex h-full flex-col overflow-hidden bg-surface-800/50">
      <div className="border-b border-surface-500 px-5 py-4">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-slate-100">Review Output</h2>
          {isDemo && (
            <span className="rounded-full border border-accent/30 bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent">
              Demo review
            </span>
          )}
        </div>
        <p className="text-sm text-slate-400">{loading ? 'Streaming review from GPT-4o-mini...' : 'Structured feedback and suggestions.'}</p>
      </div>

      <div className="flex-1 overflow-y-auto p-5 scrollbar-thin">
        {error && (
          <div className="mb-5 flex items-start gap-3 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
            <XCircle size={18} className="mt-0.5 shrink-0 text-red-400" />
            <div>
              <p className="font-semibold">
                {error.type === 'network' && 'Network error'}
                {error.type === 'api' && 'OpenAI API error'}
                {error.type === 'parse' && 'Parse error'}
                {error.type === 'abort' && 'Cancelled'}
              </p>
              <p className="mt-1 text-red-200/80">{error.message}</p>
            </div>
          </div>
        )}

        {loading && !hasContent && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 rounded-lg border border-surface-500 bg-surface-700/50 p-4">
              <Clock size={20} className="animate-pulse text-accent" />
              <span className="text-sm text-slate-300">Waiting for review...</span>
            </div>
            <Skeleton />
            <Skeleton />
            <Skeleton />
          </div>
        )}

        {!loading && !error && !hasContent && (
          <div className="flex h-full min-h-[200px] flex-col items-center justify-center text-center">
            <CheckCircle size={40} className="mb-3 text-slate-600" />
            <p className="text-sm font-medium text-slate-300">No review yet</p>
            <p className="text-xs text-slate-500">Enter your code and click Review to get started.</p>
          </div>
        )}

        {(hasContent || loading) && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 rounded-lg border border-surface-500 bg-surface-700/50 p-4">
              {parsed.bugRisk === 'High' && <AlertTriangle size={20} className="text-red-400" />}
              {parsed.bugRisk === 'Medium' && <AlertTriangle size={20} className="text-amber-400" />}
              {parsed.bugRisk === 'Low' && <CheckCircle size={20} className="text-emerald-400" />}
              {parsed.bugRisk === 'Pending' && <Clock size={20} className="animate-pulse text-slate-400" />}
              <div className="flex flex-1 items-center justify-between">
                <span className="text-sm font-medium text-slate-200">Bug Risk</span>
                <BugRiskBadge risk={parsed.bugRisk} />
              </div>
            </div>

            <ReviewSection title="Summary" defaultOpen>
              {parsed.summary || 'No summary available.'}
            </ReviewSection>

            <ReviewSection title="Bug Risk Explanation" defaultOpen>
              {parsed.bugRiskExplanation}
            </ReviewSection>

            <ReviewSection title="Style Issues" defaultOpen={parsed.styleIssues.length > 0}>
              {parsed.styleIssues.length > 0 ? parsed.styleIssues.map((item) => `- ${item}`).join('\n') : 'No style issues detected.'}
            </ReviewSection>

            <ReviewSection title="Performance" defaultOpen={parsed.performance.length > 0}>
              {parsed.performance.length > 0 ? parsed.performance.map((item) => `- ${item}`).join('\n') : 'No performance issues detected.'}
            </ReviewSection>

            <ReviewSection title="Security" defaultOpen={parsed.security.length > 0}>
              {parsed.security.length > 0 ? parsed.security.map((item) => `- ${item}`).join('\n') : 'No security issues detected.'}
            </ReviewSection>

            <ReviewSection title="Suggested Fix" codeBlock language={prismLanguage} defaultOpen={parsed.suggestedFix.length > 0}>
              {parsed.suggestedFix || 'No suggested fix provided.'}
            </ReviewSection>
          </div>
        )}
      </div>
    </div>
  )
}

function BugRiskBadge({ risk }: { risk: BugRisk }) {
  if (risk === 'Pending') {
    return (
      <span className="animate-pulse rounded-full border border-slate-500/30 bg-slate-500/10 px-2.5 py-0.5 text-xs font-semibold text-slate-400">
        Analyzing...
      </span>
    )
  }

  const classes =
    risk === 'High'
      ? 'bg-red-500/10 text-red-400 border-red-500/30'
      : risk === 'Medium'
        ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
        : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'

  return (
    <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${classes}`}>
      {risk}
    </span>
  )
}

function Skeleton() {
  return (
    <div className="space-y-2 rounded-lg border border-surface-500 bg-surface-700/30 p-4">
      <div className="h-4 w-1/3 animate-shimmer rounded" />
      <div className="h-3 w-full animate-shimmer rounded" />
      <div className="h-3 w-5/6 animate-shimmer rounded" />
      <div className="h-3 w-4/6 animate-shimmer rounded" />
    </div>
  )
}
