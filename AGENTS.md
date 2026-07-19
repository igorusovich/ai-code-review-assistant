# AGENTS.md

Guidance for AI coding agents working in this repository.

## Project Overview

**AI Code Review Assistant** (`code-review-dev`) — a client-only, dark-themed single-page web app that reviews pasted code using an OpenAI-compatible chat completions API with streaming responses. There is **no backend**: the browser calls the selected provider's endpoint directly using an API key the user supplies. Two providers are supported — **OpenAI** (`https://api.openai.com/v1/chat/completions`) and **OpenRouter** (`https://openrouter.ai/api/v1/chat/completions`) — configured in the `PROVIDERS` map in `src/types/review.ts`; the user picks the model (default `gpt-4o-mini` / `openai/gpt-4o-mini`).

Key behaviors:

- Two-column layout: code input (left) and structured review output (right).
- The model is prompted (in `src/hooks/useOpenAI.ts`) to respond in a fixed markdown format with `##` sections: `Bug Risk`, `Summary`, `Style Issues`, `Performance`, `Security`, `Suggested Fix`. `src/utils/parseReview.ts` parses that format into a typed `ReviewResult`.
- Review text streams in via SSE (`data: ` lines) and is re-parsed on every chunk. OpenRouter streams the same format as OpenAI; for OpenRouter the request additionally sends the optional `HTTP-Referer` / `X-Title` headers.
- Code, language, and context are encoded (JSON → URI-encode → URL-safe base64) into the URL hash for shareable links, debounced at 500 ms (`src/utils/encodeShare.ts`).
- Provider choice, model, and one API key per provider are persisted in `localStorage` under `provider`, `model`, `openai_api_key`, and `openrouter_api_key` (`src/hooks/useLocalStorage.ts`).

## Tech Stack

- React 18 + TypeScript 5.6 (strict mode, `jsx: react-jsx`)
- Vite 5 with `@vitejs/plugin-react` (default config, no customization)
- Tailwind CSS 3.4 + PostCSS + Autoprefixer (dark theme; custom `surface-*` and `accent` color palette in `tailwind.config.js`)
- `prism-react-renderer` for syntax highlighting, `lucide-react` for icons
- Linting: `oxlint` (config in `.oxlintrc.json`, plugins: react, typescript, oxc)

## Build and Development Commands

```bash
npm install        # install dependencies
npm run dev        # start Vite dev server
npm run build      # type-check (tsc -b) then production build into dist/
npm run lint       # oxlint src
npm run preview    # serve the production build locally
```

`npm run build` runs `tsc -b && vite build`; type errors fail the build. Both `npm run lint` and `npm run build` currently pass with zero errors/warnings.

## Project Structure

```
src/
├── App.tsx                  # Root component: state, URL-hash sync, layout wiring
├── main.tsx                 # React entry (StrictMode), mounts App
├── index.css                # Tailwind directives + custom utilities (.code-editor overlay, .review-markdown, .animate-shimmer, .scrollbar-thin)
├── components/
│   ├── ApiKeyInput.tsx      # Provider selector, password-style API key input with show/hide toggle, model input
│   ├── CodeInput.tsx        # Left panel: language select, code editor, context, share/review buttons
│   ├── ReviewOutput.tsx     # Right panel: bug-risk badge, sections, loading skeletons, error display
│   └── ReviewSection.tsx    # Collapsible section; renders markdown or a code block
├── hooks/
│   ├── useLocalStorage.ts   # Generic localStorage-backed state hook
│   └── useOpenAI.ts         # Streaming fetch to the selected provider, SSE parsing, abort support
├── types/
│   └── review.ts            # Shared types: ReviewResult, Language, Provider, PROVIDERS map, ReviewError, hook interfaces
└── utils/
    ├── encodeShare.ts       # URL-hash encode/decode for shareable links
    ├── parseReview.ts       # Parses the model's markdown sections into ReviewResult
    └── renderMarkdown.ts    # Minimal markdown→HTML renderer (escapes HTML first)
```

The code editor in `CodeInput.tsx` is an overlay pattern: a transparent `<textarea>` stacked on top of a Prism-highlighted `<pre>` (styles in `index.css` under `.code-editor`).

## Code Style Guidelines

- TypeScript strict everywhere: `noImplicitAny`, `strictNullChecks`, `noUncheckedIndexedAccess`, `noUnusedLocals/Parameters`. **No `any`** — this is an explicit project goal (see README).
- Imports include the `.ts` / `.tsx` extension (e.g. `import { parseReview } from './utils/parseReview.ts'`); `allowImportingTsExtensions` is enabled. Follow this convention in new files.
- ESM only (`"type": "module"`); bundler module resolution.
- Components are named function exports (no default exports except `App`).
- Styling is Tailwind utility classes only, using the custom palette (`surface-*`, `accent`, `accent-hover`) and utilities from `index.css`. Do not introduce new CSS files for component styling.
- Handle optional array indexing carefully — with `noUncheckedIndexedAccess`, `arr[i]` yields `T | undefined`.

## Testing

There is **no test framework or test suite** in this project (no Vitest/Jest config, no test files, no CI). Verification is done via:

1. `npm run lint` — must report 0 errors and 0 warnings.
2. `npm run build` — `tsc -b` enforces full type-checking.
3. Manual smoke test with `npm run dev` (a real OpenAI or OpenRouter API key is needed to exercise the review flow).

If you add tests, introduce the framework explicitly rather than assuming one exists.

## Security Considerations

- API keys live only in the user's browser: `localStorage` (`openai_api_key` / `openrouter_api_key`) and the `Authorization: Bearer` header sent directly to the selected provider's endpoint (`api.openai.com` or `openrouter.ai`). They are never sent anywhere else and are **not** included in share links (only code, language, and context are). Keep it that way.
- Review markdown is rendered with `dangerouslySetInnerHTML` in `ReviewSection.tsx`, but `renderMarkdown.ts` HTML-escapes all input before applying its own formatting. If you extend the markdown renderer, preserve escaping-before-formatting to avoid XSS.
- Share links embed user code in the URL hash — fine for a client-only app, but never add the API key to the hash.
- No secrets or environment variables are required for build or deploy.

## Deployment

Static hosting of the `dist/` output. The README documents Vercel with default settings (framework preset: Vite, no environment variables). `dist/` is committed in this repo but is a build artifact — regenerate with `npm run build` rather than editing it by hand.
