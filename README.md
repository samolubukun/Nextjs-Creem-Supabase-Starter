# SAASXCREEM

Production-focused SaaS boilerplate built with Next.js 16, Supabase, and Creem.

It ships with authentication, subscriptions, credits, licensing, admin tooling, email workflows, and an AI chat surface so you can start from a real billing-ready foundation instead of a landing-page template.

## Quick Start

```bash
git clone https://github.com/samuel-olubukun/Nextjs-Creem-Starter saasxcreem
cd saasxcreem
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`.

## Stack

- Next.js 16 (App Router), React 19, TypeScript
- Supabase (Auth, Postgres, RLS, Admin APIs)
- Creem (`creem` + `@creem_io/nextjs`) for checkout/subscriptions/webhooks/licenses
- Tailwind CSS 4 + Radix primitives + custom UI system
- Vitest + Testing Library for unit and component tests
- Drizzle ORM + drizzle-kit migration support (optional alongside Supabase SQL)
- Resend + React Email templates for transactional emails
- PostHog client integration (optional)

## What You Get

- Auth flows: email/password + Google OAuth, callback exchange, protected dashboard
- Pricing + checkout: product-based checkout with discount code support
- Subscription lifecycle APIs: upgrade, cancel (scheduled or immediate), seat updates
- Billing portal redirect endpoint
- Creem webhook endpoint with idempotency storage and multi-event handling
- Credit economy: wallet table, top-ups, spend endpoint, unlimited-credit sentinel
- License endpoints: validate, activate, deactivate
- Dashboard: plan status, credits, licenses, billing events, transaction history
- Admin CRM: platform metrics, user list, delete user action (admin-gated)
- AI assistant page with persisted chat sessions/messages and per-response credit deduction
- Email workflows: welcome + payment confirmation
- Blog scaffolding with MDX-compatible content pipeline

## Architecture Overview

```text
src/
  app/
    (auth)/                 login/signup/callback routes
    api/                    server routes (billing, credits, licenses, chat, etc.)
    webhooks/creem/         Creem webhook route + event handlers
    dashboard/              user dashboard surfaces + admin page
    blog/                   blog list + slug pages
  components/               feature and UI components
  lib/                      service clients and business helpers
  db/                       drizzle schema + DB client
  emails/                   transactional email templates/components
  proxy.ts                  route protection and auth redirection

supabase/
  db_schema.sql             canonical SQL bootstrap schema
  migrations/               drizzle-generated SQL migrations

tests/                      Vitest coverage for validators/routes/helpers/components
```

## Core Implementation Flows

### 1) Authentication and Route Protection

- Browser/server Supabase clients are split by runtime (`client.ts`, `server.ts`, `admin.ts`)
- `src/proxy.ts` applies auth-aware redirects:
  - unauthenticated users hitting `/dashboard/*` -> `/login`
  - authenticated users hitting `/login` or `/signup` -> `/dashboard`
- OAuth and password flows both converge through `/(auth)/callback`

### 2) Checkout and Subscription Sync

- Client starts checkout via `POST /api/checkout`
- Route calls `creem.checkouts.create` and attaches `metadata.user_id`
- Optional fallback sync route: `POST /api/checkout/success`
- Main source of truth remains webhook ingestion (`/webhooks/creem`)

### 3) Webhooks, Idempotency, and Credits

- Webhook endpoint is wrapped by `Webhook({...})` from `@creem_io/nextjs`
- `webhook_events` table tracks processed webhook IDs for idempotency
- Event handlers update subscriptions, issue billing events, write licenses, and grant credits
- Credit grants are recorded in `credit_transactions` and wallet balance is upserted in `credits`
- Profile LTV (`total_spent_cents`) is incremented through `increment_total_spent` RPC

### 4) Credits Spending

- `POST /api/credits/spend` validates request body then calls DB function `spend_credits`
- Function performs row lock + balance validation + atomic update + transaction log insert
- Unlimited balances are detected by helper logic and bypass deduction

### 5) Admin and Observability Surfaces

- Admin access is controlled by `ADMIN_EMAILS` (or fallback `ADMIN_EMAIL`)
- Admin page aggregates users, subscriptions, revenue, seats, license/purchase/chat counts
- Notification dropdown reads and updates `billing_events` records

### 6) AI Assistant

- `POST /api/chat` checks auth and wallet before model invocation
- Supports `openai`, `gemini`, or `anthropic` provider modes via env vars
- Chat sessions/messages persist in `chats` and `chat_messages`
- 1 credit deducted per response for non-unlimited users

## Environment Variables

Use `.env.example` as source of truth.

Required for production baseline:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `CREEM_API_KEY`
- `CREEM_WEBHOOK_SECRET`
- `NEXT_PUBLIC_APP_URL`

Common optional integrations:

- `DATABASE_URL` (drizzle/migrations)
- `RESEND_API_KEY` (transactional email delivery)
- `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST` (analytics)
- `LLM_PROVIDER`, `LLM_API_KEY`, `LLM_MODEL` (AI assistant)
- `ADMIN_EMAILS` (admin dashboard authorization)
- `NEXT_PUBLIC_CREEM_*_PRODUCT_ID` mappings (plan IDs)

## Drizzle Workflow

This boilerplate supports schema-first Drizzle migrations from `src/db/schema.ts`.

### Fresh migration baseline

If you intentionally removed old migration files and want a clean baseline:

```bash
# 1) Generate SQL migration files from schema
npx drizzle-kit generate

# 2) Apply migrations to DATABASE_URL target
npx drizzle-kit migrate
```

### Notes

- `drizzle.config.ts` is already configured with:
  - schema: `src/db/schema.ts`
  - output: `supabase/migrations`
- `billing_events.event_type` is modeled as a Drizzle enum in schema, so changes to allowed values should be done in `src/db/schema.ts` and then regenerated.
- Keep generated migration files committed so all environments stay in sync.

## Database Model Summary

Main entities in `supabase/db_schema.sql`:

- `profiles`: user profile + total spent tracking
- `subscriptions`: current user subscription state and seat count
- `credits`, `credit_transactions`: wallet + immutable ledger
- `licenses`: per-user license records
- `webhook_events`: idempotency keys for webhooks
- `billing_events`: notifications/refunds/disputes-style event log
- `purchases`: one-time purchases
- `chats`, `chat_messages`: AI chat persistence
- `audit_logs`: audit trail table

Also includes helper functions and triggers:

- `handle_updated_at` trigger function
- `handle_new_user` auth trigger -> auto-create profile
- `spend_credits` transactional deduction function
- `increment_total_spent` profile revenue accumulator

## API Surface

Main server routes:

- `POST /api/checkout`
- `POST /api/checkout/success`
- `POST /api/billing-portal`
- `GET /api/transactions`
- `GET /api/credits`
- `POST /api/credits/spend`
- `POST /api/subscriptions/upgrade`
- `POST /api/subscriptions/cancel`
- `POST /api/subscriptions/update-seats`
- `POST /api/licenses/validate`
- `POST /api/licenses/activate`
- `POST /api/licenses/deactivate`
- `GET|POST /api/discounts`
- `POST /api/chat`
- `POST /api/auth/welcome`
- `POST /webhooks/creem`

## Scripts

```bash
npm run dev            # Next dev server
npm run build          # Production build
npm run start          # Start built app
npm run lint           # Biome check
npm run lint:fix       # Biome check + write
npm run format         # Biome format + write
npm test               # Vitest run
npm run test:watch     # Vitest watch
npm run test:coverage  # Coverage report
npm run check          # Biome + tsc + vitest
```

## Deployment Checklist

1. Create Supabase project and apply `supabase/db_schema.sql`.
2. Configure Supabase auth providers and callback URLs.
3. Configure Creem products and webhook endpoint (`/api/webhooks/creem`).
4. Set all production env vars in your host (Vercel or similar).
5. Verify webhook signatures and event delivery in Creem dashboard.
6. Run `npm run build` and `npm test` before shipping.
7. Add at least one admin email in `ADMIN_EMAILS`.

## Audit Notes (Current Repo Snapshot)

Strengths:

- Clear separation of server/client/admin Supabase clients
- Webhook idempotency table and credit spend DB function are solid foundations
- Good functional coverage across billing, credits, subscriptions, licenses, and admin UI
- Route protection and auth redirects are already wired in `src/proxy.ts`

Implementation risks to review before production:

- `billing_events.event_type` SQL constraint currently allows only `refund` and `dispute`, while webhook code inserts more event types; align schema with runtime event set
- `POST /api/auth/welcome` can be called without auth/rate limiting; lock this down to avoid abuse
- `POST /api/chat` deducts credits with a direct update (non-atomic); race-safe RPC approach would be safer under concurrent requests
- Test suite is broad but many tests are validator/unit-oriented; add higher-fidelity integration tests for critical payment/chat flows
- Repository currently has many pre-existing Biome/style violations (`npm run check` fails); a formatting/lint baseline pass is recommended

## License

MIT
