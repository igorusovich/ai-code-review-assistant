import { useCallback, useRef, useState } from 'react'
import { PROVIDERS } from '../types/review.ts'
import type { Language, ReviewError, UseOpenAIOptions, UseOpenAIReturn } from '../types/review.ts'

function buildSystemPrompt(code: string, language: Language, context: string): string {
  return `You are an expert code reviewer. Review the provided code for bugs, style issues, performance problems, and security vulnerabilities.

Context: ${context || 'None provided.'}
Language: ${language}
Code:
\`\`\`${language.toLowerCase()}
${code}
\`\`\`

Respond in this exact format:

## Bug Risk: [High/Medium/Low]
Brief explanation of the overall bug risk and most important issues.

## Summary
A concise paragraph summarizing the review.

## Style Issues
- Issue one
- Issue two

## Performance
- Issue one
- Issue two

## Security
- Issue one
- Issue two

## Suggested Fix
Provide corrected or improved code in a single code block. If no fix is needed, write "No changes required."`
}

interface OpenAIErrorResponse {
  error?: {
    message: string
    type?: string
    code?: string
  }
}

async function readErrorBody(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as OpenAIErrorResponse
    return data.error?.message ?? `Request failed with status ${response.status}`
  } catch {
    return `Request failed with status ${response.status}`
  }
}

export function useOpenAI({ provider, apiKey, model, code, language, context, onChunk }: UseOpenAIOptions): UseOpenAIReturn {
  const [review, setReview] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<ReviewError | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const abort = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
  }, [])

  const submit = useCallback(async () => {
    const config = PROVIDERS[provider]
    if (!apiKey.trim()) {
      setError({ type: 'api', message: `Please enter your ${config.name} API key.` })
      return
    }
    if (!code.trim()) {
      setError({ type: 'api', message: 'Please enter some code to review.' })
      return
    }

    setReview('')
    setError(null)
    setLoading(true)

    const controller = new AbortController()
    abortControllerRef.current = controller

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      }
      if (provider === 'openrouter') {
        // Optional identification headers recommended by OpenRouter.
        headers['HTTP-Referer'] = window.location.origin
        headers['X-Title'] = 'AI Code Review Assistant'
      }

      const response = await fetch(config.url, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model: model.trim() || config.defaultModel,
          messages: [
            { role: 'system', content: buildSystemPrompt(code, language, context) },
          ],
          stream: true,
          temperature: 0.2,
        }),
        signal: controller.signal,
      })

      if (!response.ok) {
        const message = await readErrorBody(response)
        setError({ type: 'api', message, status: response.status })
        setLoading(false)
        return
      }

      const reader = response.body?.getReader()
      if (!reader) {
        setError({ type: 'network', message: 'Response body is not readable.' })
        setLoading(false)
        return
      }

      const decoder = new TextDecoder('utf-8')
      let buffer = ''
      let fullReview = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''

        for (const line of lines) {
          const trimmed = line.trim()
          if (!trimmed.startsWith('data: ')) continue
          const data = trimmed.slice(6)
          if (data === '[DONE]') continue

          try {
            const parsed = JSON.parse(data) as unknown
            const content = extractContent(parsed)
            if (content) {
              fullReview += content
              setReview(fullReview)
              onChunk?.(content)
            }
          } catch {
            // Ignore malformed SSE chunks
          }
        }
      }
    } catch (err) {
      if (err instanceof Error) {
        if (err.name === 'AbortError') {
          setError({ type: 'abort', message: 'Review was cancelled.' })
        } else {
          setError({ type: 'network', message: err.message })
        }
      } else {
        setError({ type: 'network', message: 'An unexpected error occurred.' })
      }
    } finally {
      setLoading(false)
      abortControllerRef.current = null
    }
  }, [provider, apiKey, model, code, language, context, onChunk])

  return { review, setReview, loading, error, submit, abort }
}

function extractContent(parsed: unknown): string | null {
  if (typeof parsed !== 'object' || parsed === null) return null

  const choices = (parsed as Record<string, unknown>).choices
  if (!Array.isArray(choices) || choices.length === 0) return null

  const first = choices[0] as Record<string, unknown>
  const delta = first.delta
  if (typeof delta !== 'object' || delta === null) return null

  const content = (delta as Record<string, unknown>).content
  return typeof content === 'string' ? content : null
}
