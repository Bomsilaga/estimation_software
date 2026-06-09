-- ============================================================
-- Aussie Estimator — Initial Schema
-- Run this in Supabase SQL Editor (or via supabase db push)
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ── Access Requests ─────────────────────────────────────────
create table if not exists public.access_requests (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  email       text not null,
  company     text not null,
  role        text not null,
  state       text not null,
  phone       text,
  message     text,
  status      text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at  timestamptz not null default now()
);

-- RLS: only service role can read/write access_requests (admin API uses service role)
alter table public.access_requests enable row level security;

-- ── Estimates ────────────────────────────────────────────────
create table if not exists public.estimates (
  id               uuid primary key default uuid_generate_v4(),
  user_id          uuid not null references auth.users(id) on delete cascade,
  name             text not null,
  status           text not null default 'draft' check (status in ('draft', 'finalized', 'archived')),
  total_cost       numeric(14,2) not null default 0,
  gfa              numeric(8,2) not null default 0,
  ncc_class        text not null default '1a',
  plan_image_url   text,
  extraction_data  jsonb,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

alter table public.estimates enable row level security;

create policy "Users manage own estimates"
  on public.estimates
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ── Estimate Items ────────────────────────────────────────────
create table if not exists public.estimate_items (
  id          uuid primary key default uuid_generate_v4(),
  estimate_id uuid not null references public.estimates(id) on delete cascade,
  section     text not null check (section in ('trade_works', 'pc_items', 'provisional_sums', 'compliance')),
  trade       text not null,
  description text not null,
  unit        text not null,
  quantity    numeric(12,3) not null default 0,
  rate        numeric(12,2) not null default 0,
  amount      numeric(14,2) not null default 0,
  notes       text not null default '',
  sort_order  integer not null default 0,
  as_standard text default ''
);

alter table public.estimate_items enable row level security;

create policy "Users manage own estimate items"
  on public.estimate_items
  for all
  using (
    exists (
      select 1 from public.estimates e
      where e.id = estimate_id and e.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.estimates e
      where e.id = estimate_id and e.user_id = auth.uid()
    )
  );

-- ── Storage bucket for plan images ───────────────────────────
-- Run in Supabase dashboard: Storage > New bucket > "plan-images" > Public: true
-- Or via SQL:
insert into storage.buckets (id, name, public)
values ('plan-images', 'plan-images', true)
on conflict (id) do nothing;

create policy "Authenticated users can upload plans"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'plan-images' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Public read plan images"
  on storage.objects for select
  to public
  using (bucket_id = 'plan-images');

-- ── Updated_at trigger ───────────────────────────────────────
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger estimates_updated_at
  before update on public.estimates
  for each row execute function public.handle_updated_at();

-- ── Indexes ──────────────────────────────────────────────────
create index if not exists estimates_user_id_idx on public.estimates(user_id);
create index if not exists estimates_created_at_idx on public.estimates(created_at desc);
create index if not exists estimate_items_estimate_id_idx on public.estimate_items(estimate_id);
create index if not exists estimate_items_sort_order_idx on public.estimate_items(estimate_id, sort_order);
