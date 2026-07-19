import { useState } from 'react'
import { Eye, EyeOff, ShieldAlert } from 'lucide-react'
import { PROVIDERS } from '../types/review.ts'
import type { Provider } from '../types/review.ts'

interface ApiKeyInputProps {
  provider: Provider
  onProviderChange: (provider: Provider) => void
  value: string
  onChange: (value: string) => void
  model: string
  onModelChange: (model: string) => void
}

export function ApiKeyInput({ provider, onProviderChange, value, onChange, model, onModelChange }: ApiKeyInputProps) {
  const [show, setShow] = useState(false)
  const config = PROVIDERS[provider]

  return (
    <div className="space-y-2">
      <span className="block text-sm font-medium text-slate-200">Provider</span>
      <div className="grid grid-cols-2 gap-1 rounded-lg border border-surface-500 bg-surface-800 p-1" role="radiogroup" aria-label="Provider">
        {(Object.keys(PROVIDERS) as Provider[]).map((p) => (
          <button
            key={p}
            type="button"
            role="radio"
            aria-checked={provider === p}
            onClick={() => onProviderChange(p)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
              provider === p
                ? 'bg-accent text-white'
                : 'text-slate-400 hover:bg-surface-700 hover:text-slate-200'
            }`}
          >
            {PROVIDERS[p].name}
          </button>
        ))}
      </div>

      <label htmlFor="api-key" className="block pt-2 text-sm font-medium text-slate-200">
        {config.name} API Key
      </label>
      <div className="relative">
        <input
          id="api-key"
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={config.keyPlaceholder}
          className="w-full rounded-lg border border-surface-500 bg-surface-800 py-2.5 pl-3 pr-10 text-sm text-slate-100 placeholder-slate-500 outline-none ring-accent focus:border-accent focus:ring-1"
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 hover:bg-surface-700 hover:text-slate-200"
          aria-label={show ? 'Hide API key' : 'Show API key'}
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>

      <label htmlFor="model" className="block pt-2 text-sm font-medium text-slate-200">
        Model
      </label>
      <input
        id="model"
        type="text"
        value={model}
        onChange={(e) => onModelChange(e.target.value)}
        placeholder={config.defaultModel}
        spellCheck={false}
        autoCapitalize="off"
        autoComplete="off"
        className="w-full rounded-lg border border-surface-500 bg-surface-800 py-2.5 pl-3 pr-3 text-sm text-slate-100 placeholder-slate-500 outline-none ring-accent focus:border-accent focus:ring-1"
      />
      <p className="text-xs text-slate-500">
        Defaults to {config.defaultModel} when empty. Browse models at{' '}
        <a
          href={config.modelsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="underline-offset-2 transition hover:text-accent hover:underline"
        >
          {config.modelsUrl.replace('https://', '')}
        </a>
      </p>

      <div className="flex items-start gap-2 pt-1 text-xs text-slate-400">
        <ShieldAlert size={14} className="mt-0.5 shrink-0 text-amber-400" />
        <p>
          Your key is stored locally in your browser via localStorage and is only sent directly to {config.name}'s API.
        </p>
      </div>
    </div>
  )
}
