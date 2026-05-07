# Production Readiness

Run this checklist before launch.

## Automated Gate

CI runs the same gate on pushes and pull requests:

```bash
npm ci
npm audit --omit=dev
npm run readiness:static
npm run typecheck
npm run build
npm run test:smoke
```

`npm run readiness:static` verifies the repo contains the fresh Supabase
bootstrap migration, `match_document_chunks` RPC, RLS policies, private storage
bucket setup, App Hosting secret wiring, and launch documentation references.

`npm run test:smoke` starts the built app locally unless `SMOKE_BASE_URL` is
set. To smoke-test production route boundaries after deploy:

```bash
SMOKE_BASE_URL=https://thearchiveai.xyz npm run test:smoke
```

## Database and Storage

- Fresh Supabase projects: run `docs/migration_000_initial_schema.sql` in the Supabase SQL Editor.
- Existing deployments: apply any missing later `docs/migration_*.sql` files after checking which migrations are already present in that database.
- Confirm the `match_document_chunks` RPC exists and returns rows with at least `content` for documents that have embeddings.
- Confirm the Supabase `documents` storage bucket is private.
- Confirm storage policies do not allow public access or direct client writes; any client read policy must be scoped to objects whose first path segment matches `auth.uid()`.
- Confirm Row Level Security is enabled for `documents`, `chat_messages`, `document_chunks`, `chat_sessions`, and `user_subscriptions`.

## External Provider Checks

- Supabase Auth Site URL is `https://thearchiveai.xyz`.
- Confirm Supabase Auth redirect URLs include:
  - `https://thearchiveai.xyz/auth/callback`
  - `http://localhost:9002/auth/callback` for local development

## Secrets

- Store all production values as hosting secrets, not checked-in env files.
- Use live Stripe keys and the live Stripe webhook signing secret.
- Keep `SUPABASE_SERVICE_ROLE_KEY`, `OPENAI_API_KEY`, `STRIPE_SECRET_KEY`, and `STRIPE_WEBHOOK_SECRET` server-only.

## Stripe

- Configure the webhook endpoint for `/api/stripe/webhook`.
- Subscribe to `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, and `customer.subscription.deleted`.
- Confirm price IDs in env belong to the same Stripe account as `STRIPE_SECRET_KEY`.
- Run a live-mode checkout and cancellation smoke test before public launch.

## Verification

- Run `npm audit --omit=dev`.
- Run `npm run readiness:static`.
- Run `npm run typecheck`.
- Run `npm run build`.
- Run `npm run test:smoke`.
- Run `SMOKE_BASE_URL=https://thearchiveai.xyz npm run test:smoke` after deploy.
- Manually smoke-test sign-in, upload, document preview, authenticated chat, checkout, portal, and webhook subscription updates in production.
