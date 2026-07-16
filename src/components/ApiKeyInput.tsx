import { useState } from 'react'
import { Eye, EyeOff, ShieldAlert } from 'lucide-react'

interface ApiKeyInputProps {
  value: string
  onChange: (value: string) => void
}

export function ApiKeyInput({ value, onChange }: ApiKeyInputProps) {
  const [show, setShow] = useState(false)

  return (
    <div className="space-y-2">
      <label htmlFor="api-key" className="block text-sm font-medium text-slate-200">
        OpenAI API Key
      </label>
      <div className="relative">
        <input
          id="api-key"
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="sk-..."
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
      <div className="flex items-start gap-2 text-xs text-slate-400">
        <ShieldAlert size={14} className="mt-0.5 shrink-0 text-amber-400" />
        <p>
          Your key is stored locally in your browser via localStorage and is only sent directly to OpenAI's API.
        </p>
      </div>
    </div>
  )
}
