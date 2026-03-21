# SAASXCREEM — Premium Next.js SaaS Command Center

The ultimate SaaS boilerplate for power-users. Built with **Next.js 16**, **Supabase**, and **Creem**. Launch a high-end, production-ready SaaS with global payments, internal CRM, and a credit-based economy in hours.

**Auth + Database + Global Payments + Subscriptions + License Keys + Credits + Admin CRM** — everything you need to dominate.

## 🚀 Quick Start

1. **Clone & Install**:
   ```bash
   git clone https://github.com/samuel-olubukun/Nextjs-Creem-Starter saasxcreem
   cd saasxcreem
   npm install
   ```

2. **Configure Environment**:
   Copy `.env.example` to `.env.local` and fill in your Supabase and Creem credentials.

3. **Deploy & Run**:
   ```bash
   npm run dev
   ```
   Access the command center at [http://localhost:3000](http://localhost:3000).

---

## 🛠 The Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, React 19, Server Components)
- **Backend**: [Supabase](https://supabase.com/) (Auth, Postgres, Real-time RLS)
- **Payments**: [Creem](https://creem.io/) (Merchant of Record, Global Tax, Subscriptions)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/) (Vibrant Black/Peach/Fiery Design)
- **Validation**: [Zod](https://zod.dev/) + TypeScript Strict
- **ORM (Optional)**: [Drizzle ORM](https://orm.drizzle.team/) (Direct Postgres access for high performance)
- **Testing**: [Vitest](https://vitest.dev/) (Comprehensive unit & integration suite)

---

## 💎 Core Features

### 1. Unified Command Center (Dashboard)
A premium, high-contrast dashboard for managing everything.
- **Real-time Overview**: Revenue tracking, system uptime, and active user analytics.
- **Financial Ledger**: A mobile-responsive, detailed history of all acquisitions and subscriptions.
- **Subscription Management**: Full self-service for users to upgrade, downgrade, or cancel plans.

### 2. Global Payments & Credits
Integrated with Creem for seamless global commerce.
- **3-Tier Subscriptions**: Starter ($10), Creator ($29), and Professional ($79).
- **Pro Max Tier**: A premium $3,000.00 one-time acquisition for lifetime access.
- **Credit Wallet**: Automated credit grants on purchase/renewal with an "Unlimited" sentinel for enterprise users.
- **Currency Localization**: Centralized currency handling for global audiences.
- **Total Spent Tracking**: Automatic tracking of customer lifetime value (LTV).

### 3. Internal Admin CRM
A dedicated space for the platform owner to manage the fleet.
- **User Directory**: View all users, their LTV (Total Spent), and current subscription status.
- **System Metrics**: High-level health and revenue overview.

### 4. Software Licensing
Built-in license key management for desktop, CLI, or web apps.
- **License Dashboard**: Users can view and manage their keys.
- **Per-Device Activation**: Track and limit activations per license.

### 5. Automated Webhooks (13+ Events)
Robust, idempotent webhook handling via `@creem_io/nextjs`.
- Handles `checkout.completed`, `subscription.paid`, `refund.created`, `dispute.created`, and more.
- Automatic credit grants and data syncing with HMAC verification.

---

## 📂 Architecture

```bash
src/
├── app/
│   ├── api/             # 20+ specialized API and Webhook routes
│   ├── dashboard/       # Main Command Center & Financial Ledger
│   │   ├── admin/       # Internal Admin CRM
│   │   ├── transactions/# Mobile-responsive Ledger
│   │   └── licenses/    # License management UI
│   └── pricing/         # Premium pricing table with discount support
├── components/          # Radix UI + Custom "Fiery" components
├── lib/                 # Core logic: currency, credits, and supabase
└── proxy.ts             # Global route protection and session management
```

---

## ⚙️ Configuration

### 1. Supabase Setup
- Create a project at [supabase.com](https://supabase.com).
- Run the consolidated schema in `supabase/db_schema.sql` (or use Drizzle below).
- Enable Google/GitHub OAuth in the dashboard.
- Update `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

### 2. Creem Setup
- Create an account at [creem.io](https://creem.io).
- Create your products (Starter, Creator, Professional, Pro Max).
- Point webhooks to `https://your-domain.com/api/webhooks/creem`.
- Add `CREEM_API_KEY` and `CREEM_WEBHOOK_SECRET` to your environment.

### 3. Drizzle ORM (Optional)
- Add `DATABASE_URL` to your `.env.local` (Get this from **Supabase Dashboard > Settings > Database > URI**).
- Use **Option A (Push)** for local dev: `npx drizzle-kit push`
- Use **Option B (Migrations)** for production:
  1. `npx drizzle-kit generate --name your_migration_name`
  2. `npx drizzle-kit migrate`
- Visualize data: `npx drizzle-kit studio`

---

## 🔒 Security & RLS
- **Zero-Trust**: Every table is protected by Postgres Row Level Security (RLS).
- **Session Proxy**: Centralized proxy for secure session management and route protection.
- **Service Role**: Backend operations are strictly compartmentalized.

---

## 🧪 Testing
SAASXCREEM comes with a rigorous test suite to ensure stability.
```bash
npm test              # Run all units tests
npm run test:watch    # Continuous testing
npm run check         # Full lint + typecheck + test sweep
```

---

## 📄 License
MIT — Go build something great.

*Designed and developed by [Samuel Olubukun](https://samuelolubukun.netlify.app/)*
