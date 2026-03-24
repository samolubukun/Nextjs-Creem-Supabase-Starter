-- RLS hardening pass
-- Run this once after setup, whether you used db_schema.sql or Drizzle migrations.
-- Safe to run multiple times.

alter table if exists public.profiles enable row level security;
alter table if exists public.subscriptions enable row level security;
alter table if exists public.credits enable row level security;
alter table if exists public.credit_transactions enable row level security;
alter table if exists public.licenses enable row level security;
alter table if exists public.billing_events enable row level security;
alter table if exists public.purchases enable row level security;
alter table if exists public.chats enable row level security;
alter table if exists public.chat_messages enable row level security;
alter table if exists public.webhook_events enable row level security;
alter table if exists public.files enable row level security;
