# Production Readiness

Use this checklist before promoting a build to production.

## 1. Database migrations

Run all migrations in Supabase SQL Editor before deploying the code:

- `docs/migration_add_user_id.sql`
- `docs/migration_add_subscriptions.sql`
- `docs/migration_add_document_analysis.sql`

The current upload and analysis routes require the `documents.summary`,
`documents.suggested_questions`, and `documents.analysis_generated_at` columns.

## 2. Firebase App Hosting secrets

The production backend reads environment values from `apphosting.yaml`. Create
the matching App Hosting secrets before the rollout:

```bash
firebase apphosting:secrets:set NEXT_PUBLIC_SUPABASE_URL
firebase apphosting:secrets:set NEXT_PUBLIC_SUPABASE_ANON_KEY
firebase apphosting:secrets:set SUPABASE_SERVICE_ROLE_KEY
firebase apphosting:secrets:set OPENAI_API_KEY
firebase apphosting:secrets:set STRIPE_SECRET_KEY
firebase apphosting:secrets:set STRIPE_WEBHOOK_SECRET
firebase apphosting:secrets:set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
firebase apphosting:secrets:set STRIPE_PRO_PRICE_ID
firebase apphosting:secrets:set STRIPE_TEAM_PRICE_ID
firebase apphosting:secrets:set NEXT_PUBLIC_APP_URL
```

Set `NEXT_PUBLIC_APP_URL` to the production origin, for example:

```env
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

Use live Stripe keys and live Stripe price IDs for production. Do not reuse test
or sandbox keys for the production backend.

## 3. Supabase Auth redirects

In Supabase Dashboard > Authentication > URL Configuration:

- Set Site URL to the production origin, for example `https://your-domain.com`.
- Add the production callback URL: `https://your-domain.com/auth/callback`.
- Keep the local callback for development: `http://localhost:9002/auth/callback`.
- Add staging or preview callback URLs only for environments that should accept sign-ins.

For production, prefer exact callback URLs instead of broad wildcards.

## 4. Stripe webhook

In Stripe Dashboard > Developers > Webhooks, create a production endpoint:

```text
https://your-domain.com/api/stripe/webhook
```

Subscribe the endpoint to these events handled by the app:

- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`

Copy the endpoint signing secret into the `STRIPE_WEBHOOK_SECRET` App Hosting
secret. The app verifies the `stripe-signature` header before syncing billing
state.

## 5. Smoke test

Run this against the deployed production URL after secrets, redirects, Stripe,
and migrations are in place.

- Auth: create a new user, sign out, sign back in, and confirm redirect to `/dashboard`.
- Uploads: upload one PDF, one TXT, and one DOCX.
- Free plan limits: confirm a free user cannot exceed three documents or batch-upload multiple files.
- Paid plan uploads: complete checkout for Pro or Team, then confirm batch upload works.
- Chat: ask a question for each uploaded document and confirm answers cite document context.
- Preview: open document preview and original-file link.
- Document management: rename a document, delete it, and confirm it disappears from the sidebar/chat.
- Billing checkout: start checkout from `/plans` and from the upgrade modal.
- Customer portal: open billing management from settings and return to `/dashboard/settings`.
- Webhook sync: after checkout and cancellation/portal changes, confirm `user_subscriptions` reflects the latest Stripe status and plan.

## 6. Final local gates

Run before pushing:

```bash
npm run typecheck
npm run build
npm audit
git diff --check
```

`npm run lint` currently needs a replacement for the removed `next lint` command
before it can be used as a release gate.
