-- ============================================================
-- 0. Commons
-- ============================================================

-- Function to handle updated_at timestamps
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ============================================================
-- 1. Profiles table (synced with auth.users)
-- ============================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  creem_customer_id text unique,
  total_spent_cents bigint default 0,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-create profile on user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();

-- ============================================================
-- 2. Subscriptions table: synced via Creem webhooks
-- ============================================================
create table if not exists public.subscriptions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade unique not null,
  creem_customer_id text,
  creem_subscription_id text,
  creem_product_id text,
  product_name text,
  status text default 'inactive' constraint subscriptions_status_check
    check (status in ('active', 'trialing', 'past_due', 'scheduled_cancel', 'cancelled', 'paused', 'expired', 'inactive')),
  current_period_end timestamptz,
  cancel_at timestamptz,
  previous_product_id text,
  seats integer default 1,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Indexes
create index if not exists idx_subscriptions_user_id on public.subscriptions(user_id);
create index if not exists idx_subscriptions_creem_subscription_id on public.subscriptions(creem_subscription_id);
create index if not exists idx_subscriptions_creem_customer_id on public.subscriptions(creem_customer_id);

-- RLS
alter table public.subscriptions enable row level security;

create policy "Users can view own subscription"
  on public.subscriptions for select
  using (auth.uid() = user_id);

create trigger subscriptions_updated_at
  before update on public.subscriptions
  for each row execute function public.handle_updated_at();

-- ============================================================
-- 3. Credits wallet
-- ============================================================
create table if not exists public.credits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  balance integer not null default 0 check (balance >= 0),
  updated_at timestamptz default now()
);

create index if not exists idx_credits_user_id on public.credits(user_id);

alter table public.credits enable row level security;

create policy "Users can view own credits"
  on public.credits for select
  using (auth.uid() = user_id);

create trigger credits_updated_at
  before update on public.credits
  for each row execute function public.handle_updated_at();

-- Credit transaction audit log
create table if not exists public.credit_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  amount integer not null,
  type text not null check (type in ('subscription_topup', 'purchase', 'spend', 'refund')),
  description text,
  created_at timestamptz default now()
);

create index if not exists idx_credit_transactions_user_id on public.credit_transactions(user_id);

alter table public.credit_transactions enable row level security;

create policy "Users can view own credit transactions"
  on public.credit_transactions for select
  using (auth.uid() = user_id);

-- Atomic spend function (prevents race conditions)
create or replace function public.spend_credits(
  p_user_id uuid,
  p_amount integer,
  p_reason text
) returns integer as $$
declare
  v_balance integer;
begin
  -- Lock row and get current balance
  select balance into v_balance
  from public.credits
  where user_id = p_user_id
  for update;

  if v_balance is null then
    raise exception 'No credits record for user';
  end if;

  if v_balance < p_amount then
    raise exception 'Insufficient credits: have %, need %', v_balance, p_amount;
  end if;

  -- Deduct
  update public.credits
  set balance = balance - p_amount, updated_at = now()
  where user_id = p_user_id;

  -- Log transaction
  insert into public.credit_transactions (user_id, amount, type, description)
  values (p_user_id, -p_amount, 'spend', p_reason);

  return v_balance - p_amount;
end;
$$ language plpgsql security definer;

-- Function to increment total spent on profile
create or replace function public.increment_total_spent(
  p_user_id uuid,
  p_amount bigint
) returns void as $$
begin
  update public.profiles
  set total_spent_cents = total_spent_cents + p_amount, updated_at = now()
  where id = p_user_id;
end;
$$ language plpgsql security definer;

-- ============================================================
-- 4. Licenses
-- ============================================================
create table if not exists public.licenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  creem_license_key text not null,
  creem_product_id text not null,
  product_name text,
  status text not null default 'inactive' check (status in ('active', 'inactive', 'expired')),
  instance_name text,
  instance_id text,
  activated_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz default now()
);

create index if not exists idx_licenses_user_id on public.licenses(user_id);
create index if not exists idx_licenses_key on public.licenses(creem_license_key);

alter table public.licenses enable row level security;

create policy "Users can view own licenses"
  on public.licenses for select
  using (auth.uid() = user_id);

-- ============================================================
-- 5. Webhook events (idempotency tracking)
-- ============================================================
create table if not exists public.webhook_events (
  id text primary key,
  event_type text not null,
  processed_at timestamptz default now()
);

create index if not exists idx_webhook_events_processed_at on public.webhook_events(processed_at);

alter table public.webhook_events enable row level security;

-- ============================================================
-- 6. Billing events (refunds, disputes)
-- ============================================================
create table if not exists public.billing_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  event_type text not null check (
    event_type in (
      'checkout.completed',
      'subscription_topup',
      'purchase',
      'subscription.canceled',
      'subscription.past_due',
      'subscription.upgraded',
      'subscription.downgraded',
      'refund',
      'dispute'
    )
  ),
  creem_transaction_id text,
  creem_subscription_id text,
  amount integer,
  currency text,
  reason text,
  status text default 'open',
  created_at timestamptz default now()
);

create index if not exists idx_billing_events_user_id on public.billing_events(user_id);

alter table public.billing_events enable row level security;

create policy "Users can view own billing events"
  on public.billing_events for select
  using (auth.uid() = user_id);

-- ============================================================
-- 7. Purchases table: one-time purchases synced via Creem webhooks
-- ============================================================
create table if not exists public.purchases (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  creem_customer_id text,
  creem_product_id text not null,
  product_name text,
  purchased_at timestamptz default now()
);

create index if not exists idx_purchases_user_id on public.purchases(user_id);

alter table public.purchases enable row level security;

create policy "Users can view own purchases"
  on public.purchases for select
  using (auth.uid() = user_id);

-- ============================================================
-- 8. AI Chat Persistence
-- ============================================================
create table if not exists public.chats (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text default 'New Conversation',
  metadata text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_chats_user_id on public.chats(user_id);

alter table public.chats enable row level security;

create policy "Users can view own chats"
  on public.chats for select
  using (auth.uid() = user_id);

create policy "Users can create own chats"
  on public.chats for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own chats"
  on public.chats for delete
  using (auth.uid() = user_id);

create trigger chats_updated_at
  before update on public.chats
  for each row execute function public.handle_updated_at();

-- Chat messages
create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  chat_id uuid references public.chats(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  created_at timestamptz default now()
);

create index if not exists idx_chat_messages_chat_id on public.chat_messages(chat_id);

alter table public.chat_messages enable row level security;

create policy "Users can view own chat messages"
  on public.chat_messages for select
  using (auth.uid() = user_id);

create policy "Users can create own chat messages"
  on public.chat_messages for insert
  with check (auth.uid() = user_id);

-- ============================================================
-- 9. File Metadata
-- ============================================================
create table if not exists public.files (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  storage_provider text not null,
  bucket text not null,
  object_key text not null unique,
  original_filename text not null,
  content_type text not null,
  size_bytes bigint not null check (size_bytes > 0),
  status text not null default 'uploaded' check (status in ('pending', 'uploaded', 'failed', 'deleted')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_files_user_id on public.files(user_id);
create index if not exists idx_files_object_key on public.files(object_key);

alter table public.files enable row level security;

create policy "Users can view own files"
  on public.files for select
  using (auth.uid() = user_id);

create policy "Users can create own files"
  on public.files for insert
  with check (auth.uid() = user_id);

create policy "Users can update own files"
  on public.files for update
  using (auth.uid() = user_id);

create trigger files_updated_at
  before update on public.files
  for each row execute function public.handle_updated_at();

-- ============================================================
-- 10. Audit Logs
-- ============================================================
create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  action text not null,
  metadata text,
  created_at timestamptz default now()
);

create index if not exists idx_audit_logs_user_id on public.audit_logs(user_id);

alter table public.audit_logs enable row level security;

create policy "Admins can view all audit logs"
  on public.audit_logs for select
  to public
  using (true);
