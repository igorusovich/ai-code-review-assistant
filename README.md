# AI Code Review Assistant

A production-ready, dark-themed web app for reviewing code with OpenAI's `gpt-4o-mini`. Paste your code, add optional context, provide your OpenAI API key, and receive a streamed, structured review.

## Features

- **Two-column layout** — Code input on the left, review output on the right.
- **Syntax highlighting** — Powered by `prism-react-renderer`.
- **Streaming responses** — Watch the review appear in real-time via the OpenAI API.
- **Structured output** — Bug Risk, Summary, Style Issues, Performance, Security, and Suggested Fix.
- **Shareable links** — Code, language, and context are encoded in the URL hash.
- **API key persistence** — Stored locally in `localStorage`, never sent anywhere except OpenAI.
- **Fully typed TypeScript** — No `any`.
- **Zero backend** — Calls OpenAI directly from the browser.

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
4. Enter your OpenAI API key.
5. Click **Review**.
6. Click **Share** to copy a link that includes your code, language, and context.

## OpenAI API Key

Your API key is stored in the browser's `localStorage` under the key `openai_api_key`. It is sent only to OpenAI's API endpoints and never to any other server.

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
