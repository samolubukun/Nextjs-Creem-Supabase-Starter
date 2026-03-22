# SAASXCREEM

Production-focused SaaS boilerplate built with Next.js 16, Supabase, and Creem.

It ships with authentication, subscriptions, credits, licensing, admin tooling, email workflows, and an AI chat surface so you can start from a real billing-ready foundation instead of a landing-page template.

Creem products, pricing, and billing behavior depend on your own Creem account configuration. This repository provides a production-ready integration pattern and example setup for this boilerplate.

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

- Authentication: email/password + Google OAuth, callback exchange, protected dashboard routes
- Payments: Creem hosted checkout, optional discount codes, billing portal redirects
- Subscriptions: upgrade/downgrade updates, scheduled or immediate cancellation, seat updates
- Webhooks: idempotent Creem event handling for subscription lifecycle, refunds/disputes, and access hooks
- Credits wallet: atomic spend via Postgres RPC, renewal grants, unlimited-credit sentinel support
- Licenses: validate/activate/deactivate APIs plus dashboard license visibility
- Admin CRM: user/revenue/license/chat metrics, billing event notifications, user deletion action
- AI assistant: persisted chat sessions/messages with per-response credit deduction
- Email workflows: welcome email and payment confirmation email
- Blog support: MDX-compatible content pipeline and dynamic slug pages

## Setup Guide

### 1) Install and run locally

```bash
git clone https://github.com/samuel-olubukun/Nextjs-Creem-Starter saasxcreem
cd saasxcreem
npm install
cp .env.example .env.local
npm run dev
```

App runs at `http://localhost:3000`.

### 2) Configure Supabase

- Create a Supabase project.
- Set these env values in `.env.local`:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
- Initialize database:
  - Option A (recommended for quick setup): apply `supabase/db_schema.sql`
  - Option B: use Drizzle migration flow (`npx drizzle-kit generate` then `npx drizzle-kit migrate`)
- In Supabase Auth, enable Google provider and add callback URL:
  - `http://localhost:3000/callback`

### 3) Configure Creem

- Create products and copy their IDs into:
  - `NEXT_PUBLIC_CREEM_STARTER_PRODUCT_ID`
  - `NEXT_PUBLIC_CREEM_PRO_PRODUCT_ID`
  - `NEXT_PUBLIC_CREEM_ENTERPRISE_PRODUCT_ID`
  - `NEXT_PUBLIC_CREEM_PRO_MAX_PRODUCT_ID` (optional one-time unlimited tier)
- Set:
  - `CREEM_API_KEY`
  - `CREEM_WEBHOOK_SECRET`
- Configure webhook endpoint:
  - Local testing: use tunnel URL + `/webhooks/creem`
  - Production: `https://your-domain.com/webhooks/creem`

### 4) Configure optional integrations

- `RESEND_API_KEY` for welcome/payment emails
- `LLM_PROVIDER`, `LLM_API_KEY`, `LLM_MODEL` for AI assistant
- `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST` for analytics
- `ADMIN_EMAILS` (or `ADMIN_EMAIL`) for admin dashboard access

### 5) Verify everything before deploy

```bash
npm run check
npm run test:coverage
npm run build
```

If all pass, you are ready to deploy.


## Screenshots

<table>
  <tr>
    <td><img width="500" alt="screencapture-saasxcreem-vercel-app-2026-03-21-18_06_38" src="https://github.com/user-attachments/assets/6bbb76a8-ad90-44a0-8068-75e4e253c85e" /></td>
    <td><img width="500" alt="screencapture-saasxcreem-vercel-app-2026-03-21-18_06_59" src="https://github.com/user-attachments/assets/ca51d423-0e2c-4e9f-9691-b399a87d950d" /></td>
  </tr>
</table>

<img width="2560" height="1164" alt="Screenshot (656)" src="https://github.com/user-attachments/assets/cef95f10-6a2b-4f94-8a0b-7f8c23732568" />
<table>
  <tr>
    <td><img width="500" alt="Screenshot (656)" src="https://github.com/user-attachments/assets/cef95f10-6a2b-4f94-8a0b-7f8c23732568" /></td>
    <td><img width="500" alt="screencapture-saasxcreem-vercel-app-pricing-2026-03-21-22_03_50" src="https://github.com/user-attachments/assets/113ec50b-5912-4e7c-a506-832fb0d55bd5" /></td>
  </tr>
</table>


<table>
  <tr>
    <td><img width="500" alt="screencapture-saasxcreem-vercel-app-dashboard-2026-03-21-19_44_25" src="https://github.com/user-attachments/assets/a3c387fe-d9af-44cc-ba94-25624790e33d" /></td>
    <td><img width="500" alt="screencapture-saasxcreem-vercel-app-dashboard-2026-03-21-19_46_01" src="https://github.com/user-attachments/assets/3bc1080b-6f06-4582-a95c-c8e8015b487a" /></td>
  </tr>
</table>


<table>
  <tr>
    <td><img width="500" alt="screencapture-saasxcreem-vercel-app-dashboard-2026-03-21-22_52_43" src="https://github.com/user-attachments/assets/13a3bbec-3c08-495b-a0a1-b5246f18ee93" /></td>
    <td><img width="500" alt="screencapture-saasxcreem-vercel-app-dashboard-transactions-2026-03-21-22_51_04" src="https://github.com/user-attachments/assets/bfc0e32b-39d4-4cfa-a06a-3c3c567d9d1a" /></td>
  </tr>
</table>


<table>
  <tr>
    <td><img width="320" alt="screencapture-saasxcreem-vercel-app-dashboard-chat-2026-03-21-22_10_15" src="https://github.com/user-attachments/assets/6a517512-5dda-46dd-b02c-b136a6b45e4a" /></td>
    <td><img width="320" alt="screencapture-saasxcreem-vercel-app-dashboard-licenses-2026-03-21-22_35_39" src="https://github.com/user-attachments/assets/3d576123-cf42-4ff0-80b4-c77a484d4466" /></td>
    <td><img width="320" alt="screencapture-saasxcreem-vercel-app-dashboard-admin-2026-03-21-22_35_24" src="https://github.com/user-attachments/assets/b985dac2-76f8-4a92-a1c3-7333c96918a5" /></td>
  </tr>
</table>


## Feature Breakdown

### Authentication

- Email/password signup and login
- Google OAuth login/signup (`/callback` redirect flow)
- Session-aware route protection via `src/proxy.ts` + Supabase SSR helpers

### Payments and Subscriptions

- Creem checkout session creation (`POST /api/checkout`)
- Discount code support at checkout
- Plan upgrades/downgrades (`POST /api/subscriptions/upgrade`)
- Scheduled or immediate cancellation (`POST /api/subscriptions/cancel`)
- Seat updates (`POST /api/subscriptions/update-seats`)
- Billing portal access (`POST /api/billing-portal`)

### Webhook Events (Implemented)

Handled in `src/app/webhooks/creem/route.ts` via `@creem_io/nextjs`:

- `checkout.completed`
- `subscription.paid`
- `subscription.canceled`
- `subscription.expired`
- `subscription.paused`
- `subscription.trialing`
- `subscription.past_due`
- `subscription.update`
- `refund.created`
- `dispute.created`
- `onGrantAccess` (access hook)
- `onRevokeAccess` (access hook)

Webhook processing includes HMAC verification through the SDK wrapper and idempotency tracking in `webhook_events`.

### Credits Wallet

- Balance tracked per user in `credits`
- Immutable audit entries in `credit_transactions`
- Atomic credit spending through `spend_credits` DB function (`POST /api/credits/spend`)
- Unlimited credits sentinel for top-tier one-time plan

### Licenses

- `POST /api/licenses/validate`
- `POST /api/licenses/activate`
- `POST /api/licenses/deactivate`
- License records stored in `licenses` and shown in dashboard licenses page

### Discounts

- Create and fetch discounts through `GET|POST /api/discounts`
- Supports percentage or fixed discounts, duration modes, and product-scoped applies-to lists

### Admin and Monitoring

- Admin access via `ADMIN_EMAILS` / `ADMIN_EMAIL`
- Dashboard admin page includes user, subscription, revenue, license, and activity stats
- Billing event notifications for checkout, renewal, upgrade/downgrade, refunds, and disputes

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

Expanded route map:

```text
src/app/
  (auth)/
    login/page.tsx
    signup/page.tsx
    callback/route.ts
  api/
    checkout/route.ts
    checkout/success/route.ts
    billing-portal/route.ts
    chat/route.ts
    credits/route.ts
    credits/spend/route.ts
    discounts/route.ts
    licenses/{activate,validate,deactivate}/route.ts
    subscriptions/{upgrade,cancel,update-seats}/route.ts
    transactions/route.ts
    auth/welcome/route.ts
  webhooks/creem/
    route.ts
    handlers.ts
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

## Connecting Real Services

1. Copy env template and set values:

```bash
cp .env.example .env.local
```

2. Supabase:
   - Create project and apply `supabase/db_schema.sql` (or use Drizzle migrations)
   - Configure Google provider and callback URL (`http://localhost:3000/callback` for local)
   - Set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY`

3. Creem:
   - Create API key and webhook secret
   - Configure products and map IDs into `NEXT_PUBLIC_CREEM_*_PRODUCT_ID`
   - Point webhook to `https://your-domain.com/webhooks/creem`

4. Optional providers:
   - Resend (`RESEND_API_KEY`) for transactional email delivery
   - PostHog keys for analytics
   - LLM provider keys for AI assistant (`LLM_PROVIDER`, `LLM_API_KEY`, `LLM_MODEL`)

## Drizzle Workflow

This boilerplate supports schema-first Drizzle migrations from `src/db/schema.ts`.

### Generate and apply migrations

Use this flow whenever schema changes are made in `src/db/schema.ts`:

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

## License

MIT
