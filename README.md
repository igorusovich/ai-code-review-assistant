# AI Code Review Assistant

A production-ready, dark-themed web app for reviewing code with AI. Paste your code, add optional context, provide your API key, and receive a streamed, structured review. Supports **OpenAI** and **OpenRouter** (access to Claude, Llama, and many other models through one key).

## Features

- **Two-column layout** — Code input on the left, review output on the right.
- **Syntax highlighting** — Powered by `prism-react-renderer`.
- **Streaming responses** — Watch the review appear in real-time.
- **Multiple providers** — Use OpenAI directly, or OpenRouter for access to many models.
- **Configurable model** — Defaults to `gpt-4o-mini` (OpenAI) or `openai/gpt-4o-mini` (OpenRouter); enter any model id your provider supports.
- **Structured output** — Bug Risk, Summary, Style Issues, Performance, Security, and Suggested Fix.
- **Shareable links** — Code, language, and context are encoded in the URL hash.
- **API key persistence** — Stored locally in `localStorage`, never sent anywhere except the selected provider.
- **Fully typed TypeScript** — No `any`.
- **Zero backend** — Calls the provider API directly from the browser.

## Tech Stack

- React 18 + TypeScript
- Vite
- Tailwind CSS (dark mode)
- `prism-react-renderer`
- `lucide-react`

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Deployment

### Vercel

1. Push the project to a Git repository.
2. Import the repository into Vercel.
3. Use the default settings (framework preset: Vite).
4. Deploy.

No environment variables are required — the app runs entirely in the browser.

## Usage

1. Paste code into the **Code** editor.
2. Select the language from the dropdown.
3. (Optional) Add context to guide the reviewer.
4. Pick a **Provider** (OpenAI or OpenRouter) and enter your API key.
5. (Optional) Override the **Model** — see [OpenRouter models](https://openrouter.ai/models) for available ids.
6. Click **Review**.
7. Click **Share** to copy a link that includes your code, language, and context.

## API Keys

Each provider has its own key slot in the browser's `localStorage` (`openai_api_key` / `openrouter_api_key`), so switching providers recalls the right key. Keys are sent only to the selected provider's API endpoints and never to any other server.

- OpenAI key: <https://platform.openai.com/api-keys>
- OpenRouter key: <https://openrouter.ai/keys>

## Project Structure

```
src/
├── components/
│   ├── ApiKeyInput.tsx
│   ├── CodeInput.tsx
│   ├── ReviewOutput.tsx
│   └── ReviewSection.tsx
├── hooks/
│   ├── useLocalStorage.ts
│   └── useOpenAI.ts
├── types/
│   └── review.ts
├── utils/
│   ├── encodeShare.ts
│   ├── parseReview.ts
│   └── renderMarkdown.ts
├── App.tsx
├── main.tsx
└── index.css
```

## License

MIT
