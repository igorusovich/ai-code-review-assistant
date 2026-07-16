import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { CodeInput } from './components/CodeInput.tsx'
import { ReviewOutput } from './components/ReviewOutput.tsx'
import { useLocalStorage } from './hooks/useLocalStorage.ts'
import { useOpenAI } from './hooks/useOpenAI.ts'
import { parseReview } from './utils/parseReview.ts'
import { copyShareUrl, readUrlHash, updateUrlHash } from './utils/encodeShare.ts'
import type { Language } from './types/review.ts'

const DEFAULT_LANGUAGE: Language = 'TypeScript'

function App() {
  const [code, setCode] = useState<string>('')
  const [language, setLanguage] = useState<Language>(DEFAULT_LANGUAGE)
  const [context, setContext] = useState<string>('')
  const [apiKey, setApiKey] = useLocalStorage<string>('openai_api_key', '')
  const [shareCopied, setShareCopied] = useState(false)

  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Load initial values from URL hash once on mount.
  useEffect(() => {
    const shared = readUrlHash()
    if (shared) {
      setCode(shared.code)
      setLanguage(shared.language as Language)
      setContext(shared.context)
    }
  }, [])

  // Debounced URL hash update when inputs change.
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }
    debounceTimerRef.current = setTimeout(() => {
      updateUrlHash({ code, language, context })
    }, 500)

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [code, language, context])

  const { review, loading, error, submit, abort } = useOpenAI({
    apiKey,
    code,
    language,
    context,
  })

  const parsed = useMemo(() => parseReview(review), [review])

  const handleReview = useCallback(() => {
    if (loading) {
      abort()
    } else {
      void submit()
    }
  }, [loading, abort, submit])

  const handleShare = useCallback(async () => {
    const ok = await copyShareUrl({ code, language, context })
    if (ok) {
      setShareCopied(true)
      setTimeout(() => setShareCopied(false), 2000)
    } else {
      alert('Could not copy share link.')
    }
  }, [code, language, context])

  return (
    <div className="flex h-full min-h-screen flex-col">
      {shareCopied && (
        <div className="fixed left-1/2 top-4 z-50 -translate-x-1/2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-300 shadow-lg">
          Share link copied to clipboard!
        </div>
      )}

      <main className="grid flex-1 grid-cols-1 divide-y divide-surface-500 lg:grid-cols-2 lg:divide-x lg:divide-y-0">
        <section className="h-[60vh] lg:h-auto">
          <CodeInput
            code={code}
            setCode={setCode}
            language={language}
            setLanguage={setLanguage}
            context={context}
            setContext={setContext}
            apiKey={apiKey}
            setApiKey={setApiKey}
            onReview={handleReview}
            onShare={handleShare}
            loading={loading}
          />
        </section>

        <section className="h-[40vh] lg:h-auto">
          <ReviewOutput review={review} parsed={parsed} loading={loading} error={error} />
        </section>
      </main>
    </div>
  )
}

export default App
