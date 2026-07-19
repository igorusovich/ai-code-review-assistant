import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { CodeInput } from './components/CodeInput.tsx'
import { ReviewOutput } from './components/ReviewOutput.tsx'
import { useLocalStorage } from './hooks/useLocalStorage.ts'
import { useOpenAI } from './hooks/useOpenAI.ts'
import { parseReview } from './utils/parseReview.ts'
import { copyShareUrl, readUrlHash, updateUrlHash } from './utils/encodeShare.ts'
import { DEMO_CODE, DEMO_CONTEXT, DEMO_LANGUAGE, DEMO_REVIEW } from './demo/demoReview.ts'
import type { Language, Provider } from './types/review.ts'

const DEFAULT_LANGUAGE: Language = 'TypeScript'
const DEMO_CHUNK_SIZE = 24
const DEMO_TICK_MS = 15

function App() {
  const [code, setCode] = useState<string>('')
  const [language, setLanguage] = useState<Language>(DEFAULT_LANGUAGE)
  const [context, setContext] = useState<string>('')
  const [provider, setProvider] = useLocalStorage<Provider>('provider', 'openai')
  const [openaiApiKey, setOpenaiApiKey] = useLocalStorage<string>('openai_api_key', '')
  const [openrouterApiKey, setOpenrouterApiKey] = useLocalStorage<string>('openrouter_api_key', '')
  const [model, setModel] = useLocalStorage<string>('model', '')
  const [shareCopied, setShareCopied] = useState(false)
  const [isDemo, setIsDemo] = useState(false)

  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const demoTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

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

  const apiKey = provider === 'openai' ? openaiApiKey : openrouterApiKey
  const setApiKey = provider === 'openai' ? setOpenaiApiKey : setOpenrouterApiKey

  const { review, setReview, loading, error, submit, abort } = useOpenAI({
    provider,
    apiKey,
    model,
    code,
    language,
    context,
  })

  const stopDemo = useCallback(() => {
    if (demoTimerRef.current) {
      clearInterval(demoTimerRef.current)
      demoTimerRef.current = null
    }
  }, [])

  // Clean up the demo typewriter on unmount.
  useEffect(() => stopDemo, [stopDemo])

  const parsed = useMemo(() => parseReview(review), [review])

  const handleReview = useCallback(() => {
    if (loading) {
      abort()
    } else {
      stopDemo()
      setIsDemo(false)
      void submit()
    }
  }, [loading, abort, submit, stopDemo])

  const handleDemo = useCallback(() => {
    // Cancel any real request or running demo first.
    abort()
    stopDemo()

    setCode(DEMO_CODE)
    setLanguage(DEMO_LANGUAGE)
    setContext(DEMO_CONTEXT)
    setIsDemo(true)
    setReview('')

    // Typewriter effect so the demo still feels like a live stream.
    let cursor = 0
    demoTimerRef.current = setInterval(() => {
      cursor += DEMO_CHUNK_SIZE
      setReview(DEMO_REVIEW.slice(0, cursor))
      if (cursor >= DEMO_REVIEW.length) {
        stopDemo()
      }
    }, DEMO_TICK_MS)
  }, [abort, setReview, stopDemo])

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
            provider={provider}
            setProvider={setProvider}
            apiKey={apiKey}
            setApiKey={setApiKey}
            model={model}
            setModel={setModel}
            onReview={handleReview}
            onShare={handleShare}
            onDemo={handleDemo}
            loading={loading}
          />
        </section>

        <section className="h-[40vh] lg:h-auto">
          <ReviewOutput review={review} parsed={parsed} loading={loading} error={error} isDemo={isDemo} />
        </section>
      </main>

      <footer className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 border-t border-surface-500 px-5 py-3 text-xs text-slate-500">
        <span>
          Built by <span className="text-slate-300">Igor Usovich</span>
        </span>
        <a
          href="https://github.com/igorusovich/ai-code-review-assistant"
          target="_blank"
          rel="noopener noreferrer"
          className="underline-offset-2 transition hover:text-accent hover:underline"
        >
          GitHub
        </a>
        <a
          href="https://x.com/igorusovich"
          target="_blank"
          rel="noopener noreferrer"
          className="underline-offset-2 transition hover:text-accent hover:underline"
        >
          @igorusovich on X
        </a>
        <a
          href="https://x.com/igorusovich"
          target="_blank"
          rel="noopener noreferrer"
          className="underline-offset-2 transition hover:text-accent hover:underline"
        >
          Need a human code review? →
        </a>
      </footer>
    </div>
  )
}

export default App
