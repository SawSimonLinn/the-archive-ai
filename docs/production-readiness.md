# Production Readiness

Run this checklist before launch.

## Database and Storage

- Apply all migrations in `docs/`, including `migration_security_hardening.sql`.
- Confirm the Supabase `documents` storage bucket is private.
- Confirm Row Level Security is enabled for `documents`, `chat_messages`, `document_chunks`, `chat_sessions`, and `user_subscriptions`.
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

## Verification

- Run `npm audit --omit=dev`.
- Run `npm run typecheck`.
- Run `npm run build`.
- Smoke-test sign-in, upload, document preview, chat, checkout, portal, and webhook subscription updates in production.
