# The Archive — AI Document Intelligence

**The Archive** is a RAG-powered (Retrieval-Augmented Generation) document analysis platform. Upload PDFs, DOCX, or TXT files and chat with them using AI. The system extracts and chunks your documents, generates embeddings, and answers questions by citing only what's in your files — no hallucination.

---

## What It Does

- Upload PDF, DOCX, and TXT files via drag-and-drop
- AI-powered Q&A chat grounded in your uploaded documents
- Auto-generates a TL;DR (executive summary) on upload
- Citation tracking — every AI answer references its source document
- Document library with search and filtering
- In-browser PDF preview modal
- Brutalist UI design with dark mode support

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) + React 19 + TypeScript |
| Styling | Tailwind CSS + Radix UI (headless) + shadcn/ui |
| AI Models | OpenAI `gpt-4o-mini` (chat) + `text-embedding-3-small` (embeddings) |
| AI SDK | Vercel AI SDK v6 (`generateText`, `embed`) |
| AI Flows | Google Genkit 1.16 |
| File Parsing | `pdf-parse` for PDF text extraction |
| Forms | React Hook Form + Zod |
| File Upload | React Dropzone |
| Deployment | Firebase App Hosting |

---

## Project Structure

```
the-archive-ai/
├── src/
│   ├── app/
│   │   ├── page.tsx                  # Landing page
│   │   ├── layout.tsx                # Root layout & metadata
│   │   ├── globals.css               # Global styles & CSS variables
│   │   ├── dashboard/
│   │   │   ├── layout.tsx            # Dashboard shell with sidebar
│   │   │   ├── page.tsx              # Overview / stats
│   │   │   ├── chat/page.tsx         # Chat interface
│   │   │   ├── documents/page.tsx    # Document library & upload
│   │   │   └── settings/page.tsx     # Settings
│   │   └── api/
│   │       └── extract-text/route.ts # PDF/text extraction API route
│   ├── ai/
│   │   ├── genkit.ts                 # OpenAI client config
│   │   ├── dev.ts                    # Genkit dev server entry
│   │   └── flows/
│   │       ├── rag-query-response-generation.ts    # RAG chat flow
│   │       └── document-embedding-processing.ts    # Chunking & embedding flow
│   ├── components/
│   │   ├── chat/chat-window.tsx      # Main chat UI
│   │   ├── documents/
│   │   │   ├── upload-zone.tsx       # Drag-and-drop uploader
│   │   │   └── document-list.tsx     # Document library list
│   │   ├── layout/                   # Header & footer
│   │   └── ui/                       # Radix-based UI primitives (37 components)
│   ├── hooks/                        # use-mobile, use-toast
│   └── lib/
│       ├── types.ts                  # Shared TypeScript interfaces
│       └── utils.ts                  # cn() and other helpers
├── .env                              # Environment variables (see below)
├── next.config.ts
├── tailwind.config.ts
├── apphosting.yaml                   # Firebase App Hosting config
└── package.json
```

---

## How It Works (RAG Pipeline)

1. **Upload** — file is sent to `/api/extract-text`, which uses `pdf-parse` to extract raw text
2. **Chunk** — `document-embedding-processing.ts` splits text into ~1000-char segments at paragraph/sentence boundaries
3. **Embed** — each chunk is embedded with `text-embedding-3-small`
4. **Query** — user message is embedded and matched against stored chunk embeddings (cosine similarity)
5. **Generate** — top matching chunks are passed as context to `gpt-4o-mini` via the RAG flow, which is instructed to answer only from the provided documents

---

## Setup

### Prerequisites

- Node.js 18+
- An [OpenAI API key](https://platform.openai.com/api-keys)

### 1. Clone & install

```bash
git clone <repo-url>
cd the-archive-ai
npm install
```

### 2. Configure environment variables

Create a `.env` file in the project root:

```env
OPENAI_API_KEY=your_openai_api_key_here
```

### 3. Run the development server

```bash
npm run dev
```

The app runs at [http://localhost:9002](http://localhost:9002)

### 4. (Optional) Start the Genkit AI dev server

```bash
npm run genkit:dev
```

This starts the Genkit developer UI for inspecting and testing AI flows locally.

---

## Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start Next.js dev server on port 9002 (Turbopack) |
| `npm run build` | Production build |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | TypeScript type check (no emit) |
| `npm run genkit:dev` | Start Genkit AI dev UI |
| `npm run genkit:watch` | Genkit dev UI in watch mode |

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `OPENAI_API_KEY` | Yes | OpenAI API key used for GPT-4o-mini and text embeddings |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase browser anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service role key for server-only admin operations |
| `NEXT_PUBLIC_APP_URL` | Recommended | Fallback app origin for callbacks and billing redirects when the current host cannot be inferred |

## Supabase Auth Redirects

The app sends Google OAuth users back to the same host they started from. To support both local development and production, configure Supabase Auth like this:

- Site URL: your production origin, for example `https://the-archive-ai-eosin.vercel.app`
- Redirect URLs: add every callback origin you use, including `http://localhost:9002/auth/callback`, `https://the-archive-ai-eosin.vercel.app/auth/callback`, and your future custom domain callback such as `https://your-domain.com/auth/callback`

For local development, keep using `http://localhost:9002/auth`. For Vercel or a custom domain, use that deployed `/auth` URL. The code derives the callback origin from the browser/request host, with `NEXT_PUBLIC_APP_URL` only as a fallback.

---

## Deployment

The project is configured for **Firebase App Hosting** via `apphosting.yaml`.

```bash
npm run build
# then deploy via Firebase CLI or push to connected repo
```

---

## License

MIT License

Copyright (c) 2026 Saw Simon Linn

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
