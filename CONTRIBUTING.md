# Contributing

Thanks for helping improve The Archive.ai. This project is a Next.js app for private, source-cited document chat with OpenAI, Supabase, and Stripe.

## Development Setup

1. Install Node.js 22.
2. Install dependencies:

```bash
npm install
```

3. Copy the environment template and fill in local credentials:

```bash
cp .env.example .env
```

4. Start the development server:

```bash
npm run dev
```

The app runs on `http://localhost:9002`.

## Before Opening a Pull Request

- Keep changes focused on one behavior or documentation improvement.
- Do not commit `.env`, API keys, service role keys, webhook secrets, database credentials, or production configuration values.
- Run the relevant checks:

```bash
npm run typecheck
npm run build
```

- Include screenshots or short recordings for visible UI changes.
- Include migration notes when changing Supabase schema files in `docs/`.

## Project Conventions

- Follow the existing Next.js App Router structure under `src/app`.
- Keep server-only credentials in server routes or server utilities.
- Prefer existing UI primitives from `src/components/ui`.
- Keep RAG and document-processing changes close to the existing flows in `src/ai/flows`.

## Reporting Issues

For bugs, include the route or workflow affected, expected behavior, actual behavior, and reproduction steps. For security issues, do not open a public issue; follow `SECURITY.md`.
