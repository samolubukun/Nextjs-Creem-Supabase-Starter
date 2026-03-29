<div align="center">

# SAASXCREEM

**Next.js, Creem & Supabase SaaS Boilerplate**

![Next.js](https://img.shields.io/badge/Next.js-000?style=for-the-badge&logo=next.js&logoColor=white)
![Creem](https://img.shields.io/badge/Creem-FFBE98?style=for-the-badge&logoColor=black)
![Supabase](https://img.shields.io/badge/Supabase-3FCF8E?style=for-the-badge&logo=supabase&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Upstash](https://img.shields.io/badge/Upstash-00C9B7?style=for-the-badge&logo=data:image/svg+xml;base64,PCFET0NUWVBFIHN2Zz48c3ZnIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiB2aWV3Qm94PSIwIDAgMjQgMjQiPjxjaXJjbGUgY3g9IjEyIiBjeT0iMTIiIHI9IjEwIiBmaWxsPSIjMDBDQUI3Ii8+PHRleHQgeD0iMTIiIHk9IjE2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSI5IiBmb250LXdlaWdodD0iYm9sZCIgZmlsbD0id2hpdGUiPlU8L3RleHQ+PC9zdmc+&logoColor=white)
![BullMQ](https://img.shields.io/badge/BullMQ-000?style=for-the-badge&logoColor=white)

![S3](https://img.shields.io/badge/S3-FF9900?style=for-the-badge&logo=amazons3&logoColor=white)
![Radix](https://img.shields.io/badge/Radix%20UI-262633?style=for-the-badge&logoColor=white)
![Resend](https://img.shields.io/badge/Resend-6B7280?style=for-the-badge&logoColor=white)
![PostHog](https://img.shields.io/badge/PostHog-F54E00?style=for-the-badge&logoColor=white)
![BetterStack](https://img.shields.io/badge/Better%20Stack-000?style=for-the-badge&logoColor=white)
![Drizzle](https://img.shields.io/badge/Drizzle-C5F74F?style=for-the-badge&logo=drizzle&logoColor=black)
![Vercel](https://img.shields.io/badge/Vercel-000?style=for-the-badge&logo=vercel&logoColor=white)

</div>

Production-focused SaaS boilerplate built with Next.js 16, Supabase, and Creem.

It ships with authentication, subscriptions, credits, licensing, admin tooling, email workflows, and an AI chat surface so you can start from a real billing-ready foundation instead of a landing-page template.

Creem products, pricing, and billing behavior depend on your own Creem account configuration. This repository provides a production-ready integration pattern and example setup for this boilerplate.

## Quick Start

```bash
git clone https://github.com/samolubukun/Nextjs-Creem-Supabase-Starter saasxcreem
cd saasxcreem
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`.

## Live Offer

- Live app: [https://saasxcreem.vercel.app](https://saasxcreem.vercel.app)
- Discount code: `CREEMSAAS2026`
- Offer: 30% off (one-time redemption)

## Stack

- [Next.js](https://nextjs.org) 16 (App Router), React 19, TypeScript
- [Supabase](https://supabase.com) (Auth, Postgres, RLS, Admin APIs)
- [Creem](https://creem.io) (`creem` + `@creem_io/nextjs`) for checkout/subscriptions/webhooks/licenses
- Tailwind CSS 4 + Radix primitives + custom UI system
- Upstash Redis for rate limiting and cache-aside patterns
- BullMQ + ioredis for async job queues (email, webhook processing, audit logs)
- S3-compatible storage (AWS S3, Cloudflare R2, MinIO) with presigned uploads
- Vitest + Testing Library for unit and component tests
- Cypress for end-to-end testing
- Storybook for component documentation and visual testing
- Drizzle ORM + drizzle-kit migration support (optional alongside Supabase SQL)
- Resend + React Email templates for transactional emails
- PostHog client integration (optional)
- Biome for linting and formatting
- Better Stack for structured log ingestion (`@logtail/node`)
- GitHub Actions for CI and Vercel for preview deploys

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
- Storage: S3-compatible presigned uploads/downloads with file metadata (AWS S3, Cloudflare R2, MinIO)
- Rate limiting: Upstash-powered request throttling on sensitive APIs (`/api/chat`, `/api/checkout`, `/api/subscriptions/*`, `/api/auth/welcome`)
- Job queues: BullMQ-backed async processing for emails, webhook tasks, and audit logs with retries and exponential backoff
- Structured logging: Better Stack-ready JSON logs for API and webhook flows with contextual event metadata
- Redis caching: cache-aside optimization for expensive blog reads and admin dashboard aggregate queries
- SEO + social: enhanced metadata, canonical tags, `sitemap.xml`, `robots.txt`, and generated Open Graph image endpoint

## Setup Guide

### 1) Install and run locally

```bash
git clone https://github.com/samolubukun/Nextjs-Creem-Supabase-Starter saasxcreem
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
- Security hardening (required): run `supabase/rls_hardening.sql` in Supabase SQL Editor after either setup path so RLS is guaranteed enabled on public tables and policies are enforced.
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
- S3-compatible storage vars for uploads (`S3_BUCKET`, `S3_REGION`, credentials, endpoint options)
- Upstash Redis: `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` (rate limiting + caching)
- BullMQ Redis: `REDIS_URL` (async job queues — see below)
- Better Stack logging: `BETTERSTACK_SOURCE_TOKEN`, `BETTERSTACK_INGESTING_HOST`

### 4b) Configure BullMQ job queues (optional)

BullMQ requires a **standard Redis TCP connection** (`redis://` or `rediss://`), separate from the Upstash HTTP Redis used for rate limiting.

- **Upstash users**: your Redis database provides both a REST URL and a `rediss://` TCP URL — copy the TCP one from the Upstash console.
- **Local dev**: install Redis and use `REDIS_URL=redis://localhost:6379`.
- **Other hosts**: Railway, Render, Fly.io, Aiven, etc. all provide standard Redis URLs.

Set in `.env.local`:

```
REDIS_URL=rediss://default:password@xxx.upstash.io:6379
```

When `REDIS_URL` is set, emails and webhook post-processing are automatically queued through BullMQ. When unset, the app falls back to direct synchronous processing — so BullMQ is optional but recommended for production.

Start the worker process alongside Next.js:

```bash
npm run workers   # in a separate terminal
```

### 5) Production hardening in this boilerplate

- **Rate limiting** on sensitive API routes (`/api/chat`, `/api/checkout`, `/api/subscriptions/*`, `/api/auth/welcome`) with user-first identity and IP fallback
- **SEO** with `metadata`, `sitemap.xml`, `robots.txt`, Open Graph, and Twitter card support
- **Structured logging** via `src/lib/logger.ts` with Better Stack ingestion support
- **Redis caching** for expensive read paths (blog fetches + admin dashboard aggregate reads)

### 6) Verify everything before deploy

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
    <td><img width="500" alt="screencapture-saasxcreem-vercel-app-pricing-2026-03-21-22_03_27" src="https://github.com/user-attachments/assets/41678062-6299-4b82-9c45-a00f3ff16993" /></td>
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

### Job Queues (BullMQ)

- Three queues: `email`, `webhook-processing`, `audit`
- Welcome emails and payment confirmation emails are queued asynchronously
- Webhook post-processing (license upserts, cache invalidation) runs off the request path
- Automatic retries (3 attempts, exponential backoff)
- Falls back to synchronous processing when `REDIS_URL` is not set
- Worker process managed via `npm run workers`

### Admin and Monitoring

- Admin access via `ADMIN_EMAILS` / `ADMIN_EMAIL`
- Dashboard admin page includes user, subscription, revenue, license, and activity stats
- Billing event notifications for checkout, renewal, upgrade/downgrade, refunds, and disputes

## Architecture Overview

```text
src/
  app/
    (auth)/login, signup, callback          auth pages + OAuth exchange
    api/
      checkout/route.ts                     start Creem checkout
      checkout/success/route.ts             post-payment sync fallback
      billing-portal/route.ts               customer portal redirect
      chat/route.ts                         AI assistant (openai/gemini/anthropic)
      credits/route.ts                      wallet balance
      credits/spend/route.ts                atomic credit spend
      discounts/route.ts                    discount validation
      licenses/activate, validate, deactivate
      subscriptions/upgrade, cancel, update-seats
      transactions/route.ts                 payment history
      auth/welcome/route.ts                 onboarding email
      storage/presign, complete, files, download  S3 presigned flow
    webhooks/creem/
      route.ts + handlers.ts                idempotent Creem event ingestion
    dashboard/                              user surfaces + admin page
    blog/                                   MDX blog pages
  components/                               feature + UI components
  lib/
    bullmq/                                 queue connection, types, producer, processors, workers
    supabase/                               browser, server, admin clients + proxy
    storage/                                S3 presigned URL helpers
    email-service.ts, posthog.ts, redis.ts, rate-limit.ts, cache.ts, logger.ts
  db/                                       drizzle schema + DB client
  emails/                                   React Email templates
  proxy.ts                                  route protection + auth redirection

scripts/start-workers.ts                    BullMQ worker process entry point
supabase/db_schema.sql                      canonical SQL bootstrap
tests/                                      Vitest coverage
```
### System Architecture Diagram
<img width="1783" height="1757" alt="saasxcreem system architecture" src="https://github.com/user-attachments/assets/c8b52df0-7c1a-4412-a8ec-bda8094634b0" />

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

### 7) Transactional Emails

- New user onboarding can trigger `POST /api/auth/welcome` to send the welcome template
- Payment confirmation is sent from webhook processing on successful checkout completion
- Email transport is powered by Resend when `RESEND_API_KEY` is configured
- When BullMQ is active (`REDIS_URL` set), emails are enqueued and processed by the worker

### 8) Job Queues (BullMQ)

- Connection uses ioredis with a standard Redis TCP URL, separate from Upstash HTTP Redis
- `src/lib/bullmq/producer.ts` exposes `enqueueEmail()`, `enqueueWebhookProcessing()`, `enqueueAuditLog()`
- Workers in `src/lib/bullmq/workers.ts` run as a standalone process (`npm run workers`)
- Each queue has configurable concurrency: email (5), webhook (3), audit (10)
- Graceful shutdown on SIGINT/SIGTERM drains in-flight jobs before exiting
- When `REDIS_URL` is not set, producers return `false` and callers fall back to direct execution — zero breaking changes

### 9) File Storage Upload and Access

- Client requests upload metadata/presigned URL from `GET|POST /api/storage/presign`
- Browser uploads directly to S3-compatible storage with the returned signed `PUT` URL
- App finalizes metadata in `files` via `POST /api/storage/complete`
- File listing and secure downloads are served by `GET /api/storage/files` and `GET /api/storage/download`

### 10) Rate Limiting and API Guardrails

- Sensitive routes are guarded with Upstash-backed limits in `src/lib/rate-limit.ts`
- Limit keys prefer authenticated user identity and fall back to client IP
- Current protected routes include chat, checkout, subscriptions, and welcome email endpoints

### 11) Cache and Admin Invalidation

- Expensive admin aggregates and blog reads use cache-aside helpers in `src/lib/cache.ts`
- Webhook mutations clear targeted admin cache keys after billing/subscription state changes
- Cached keys are namespaced to keep invalidation predictable across surfaces

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
- `files`: uploaded object metadata and ownership records
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
- `GET|POST /api/storage/presign`
- `POST /api/storage/complete`
- `GET /api/storage/download?fileId=...`
- `GET /api/storage/files`
- `POST /webhooks/creem`

## S3-Compatible File Storage

This project includes a presigned upload endpoint that works with AWS S3, Cloudflare R2, and MinIO.

### Environment variables

Set these in `.env.local`:

- `S3_PROVIDER`: optional label (`s3`, `r2`, `minio`)
- `S3_BUCKET`: target bucket name
- `S3_REGION`: region (use `auto` for Cloudflare R2)
- `S3_ENDPOINT`: required for R2/MinIO (leave empty for AWS S3)
- `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`: credentials
- `S3_FORCE_PATH_STYLE`: `true` for most MinIO setups
- `S3_KEY_PREFIX`: object key prefix (default: `uploads`)
- `S3_PUBLIC_BASE_URL`: optional public base URL for file links
- `S3_SIGNED_URL_TTL_SECONDS`: signed URL lifetime (default: `900`)
- `S3_DOWNLOAD_URL_TTL_SECONDS`: download URL lifetime (default: `300`)
- `S3_MAX_UPLOAD_BYTES`: max file size in bytes
- `S3_ALLOWED_MIME_TYPES`: comma-separated allowlist

### API usage

1. `GET /api/storage/presign` to read upload limits.
2. `POST /api/storage/presign` with:

```json
{
  "filename": "invoice.pdf",
  "contentType": "application/pdf",
  "size": 125631,
  "folder": "documents"
}
```

3. Use `uploadUrl` from the response to upload directly from the browser:

```ts
await fetch(uploadUrl, {
  method: "PUT",
  headers: { "Content-Type": file.type },
  body: file,
});
```

The object key is automatically namespaced per user and includes a UUID to avoid collisions.

### Upload completion and downloads

- `POST /api/storage/complete`: persist upload metadata in `files` table after upload succeeds.
- `GET /api/storage/files`: list recent files for the authenticated user.
- `GET /api/storage/download?fileId=...`: create a short-lived signed download URL after ownership check.

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
npm run e2e            # Cypress interactive runner
npm run e2e:run        # Cypress headless run (requires app running)
npm run test:e2e       # Start app and run Cypress headless
npm run test:e2e:ci    # Start production server and run Cypress headless
npm run storybook      # Storybook component explorer
npm run build-storybook # Storybook static build
npm run check          # Biome + tsc + vitest
npm run workers        # Start BullMQ worker process (requires REDIS_URL)
```

## CI and Preview Deploys

- GitHub Actions runs CI on pull requests and pushes to `main` via `.github/workflows/ci.yml`
- CI pipeline runs linting, test coverage, production build, Cypress E2E tests, and uploads artifacts
- Vercel preview deploys are handled by Vercel Git integration (recommended for this boilerplate)
- To enable previews, connect the repo in Vercel and import your environment variables

### E2E Coverage (Cypress)

- Specs live in `tests/e2e/` and currently cover auth pages, checkout unauthorized response behavior, and dashboard access guard
- Cypress config is in `cypress.config.js` and uses `http://127.0.0.1:3000` as base URL
- CI executes E2E tests through `npm run test:e2e:ci` after build
- CI injects safe placeholder env vars for Supabase/Creem so route guards and auth pages can boot in test mode

### Storybook

- Storybook is configured for this Next.js app with Tailwind global styles via `.storybook/preview.ts`
- Stories live alongside components (e.g. `src/components/ui/button.stories.tsx`)
- Stories cover UI primitives, billing flows, auth forms, chat interface, alert banners, and dashboard stat cards
- Run `npm run storybook` to explore, `npm run build-storybook` for static output
- CI builds Storybook to catch config breakage early

## Deployment Checklist

1. Create Supabase project and apply `supabase/db_schema.sql`.
2. Configure Supabase auth providers and callback URLs.
3. Configure Creem products and webhook endpoint (`/api/webhooks/creem`).
4. Set all production env vars in your host (Vercel or similar).
5. Set `REDIS_URL` to your Redis TCP endpoint and run `npm run workers` as a background/worker process in production.
6. Verify webhook signatures and event delivery in Creem dashboard.
7. Run `npm run build` and `npm test` before shipping.
8. Add at least one admin email in `ADMIN_EMAILS`.

## License

MIT
