import type { Dispatch, SetStateAction } from 'react'

export type BugRisk = 'High' | 'Medium' | 'Low' | 'Pending'

export interface ReviewResult {
  bugRisk: BugRisk
  summary: string
  bugRiskExplanation: string
  styleIssues: string[]
  performance: string[]
  security: string[]
  suggestedFix: string
  raw: string
}

export type Language =
  | 'TypeScript'
  | 'JavaScript'
  | 'Python'
  | 'Go'
  | 'Rust'
  | 'Java'
  | 'C++'
  | 'CSS'
  | 'HTML'
  | 'Other'

export interface ReviewInputs {
  code: string
  language: Language
  context: string
}

export type Provider = 'openai' | 'openrouter'

export interface ProviderConfig {
  name: string
  url: string
  defaultModel: string
  keyPlaceholder: string
  modelsUrl: string
}

export const PROVIDERS: Record<Provider, ProviderConfig> = {
  openai: {
    name: 'OpenAI',
    url: 'https://api.openai.com/v1/chat/completions',
    defaultModel: 'gpt-4o-mini',
    keyPlaceholder: 'sk-...',
    modelsUrl: 'https://platform.openai.com/docs/models',
  },
  openrouter: {
    name: 'OpenRouter',
    url: 'https://openrouter.ai/api/v1/chat/completions',
    defaultModel: 'openai/gpt-4o-mini',
    keyPlaceholder: 'sk-or-...',
    modelsUrl: 'https://openrouter.ai/models',
  },
}

export type ReviewError =
  | { type: 'network'; message: string }
  | { type: 'api'; message: string; status?: number }
  | { type: 'parse'; message: string }
  | { type: 'abort'; message: string }

export interface UseOpenAIOptions {
  provider: Provider
  apiKey: string
  model: string
  code: string
  language: Language
  context: string
  onChunk?: (chunk: string) => void
}

export interface UseOpenAIReturn {
  review: string
  setReview: Dispatch<SetStateAction<string>>
  loading: boolean
  error: ReviewError | null
  submit: () => Promise<void>
  abort: () => void
}
