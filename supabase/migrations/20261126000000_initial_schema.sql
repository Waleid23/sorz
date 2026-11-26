-- Sorz initial schema: tables from PLAN.md's data model, with Row Level Security
-- enabled on every table in the same migration, so no table ever exists without it.
--
-- Ownership model:
--   profiles.id, subscriptions.user_id and shared_plans.owner_id point at auth.users.
--   plan_members and reminders_sent have no user column; their policies check
--   ownership through the parent row.
-- The service-role key (used only by the server-side cron route) bypasses RLS.

-- ---------------------------------------------------------------------------
-- profiles: one row per auth user
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text check (char_length(display_name) <= 100),
  currency text not null default 'USD' check (currency ~ '^[A-Z]{3}$'),
  reminder_days_before smallint not null default 3
    check (reminder_days_before between 0 and 30),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- subscriptions
-- Names are NOT unique: several subs to the same service (e.g. Twitch) are told
-- apart by the optional label.
-- For seasonal plans, price is the total for the whole season; toMonthly /
-- toYearly spread it over the active months.
-- ---------------------------------------------------------------------------
create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 100),
  label text check (char_length(label) <= 100),
  category text not null default 'other' check (
    category in (
      'streaming', 'gaming', 'food_delivery', 'shopping',
      'cloud_storage', 'music', 'sports', 'other'
    )
  ),
  price numeric(10, 2) not null check (price >= 0),
  currency text not null default 'USD' check (currency ~ '^[A-Z]{3}$'),
  billing_cycle text not null check (billing_cycle in ('monthly', 'yearly', 'seasonal')),
  season_start_month smallint check (season_start_month between 1 and 12),
  season_end_month smallint check (season_end_month between 1 and 12),
  next_billing_date date not null,
  is_trial boolean not null default false,
  trial_end_date date,
  status text not null default 'active' check (status in ('active', 'paused', 'cancelled')),
  notes text check (char_length(notes) <= 1000),
  created_at timestamptz not null default now(),

  -- Season months are required for seasonal plans and forbidden otherwise.
  -- A season may wrap the year end (e.g. Oct-Jun: start 10, end 6).
  constraint subscriptions_season_months check (
    (billing_cycle = 'seasonal') = (season_start_month is not null and season_end_month is not null)
    and (season_start_month is null) = (season_end_month is null)
  ),
  -- A trial needs an end date.
  constraint subscriptions_trial_end check (not is_trial or trial_end_date is not null)
);

create index subscriptions_user_id_idx on public.subscriptions (user_id);
-- Daily reminder cron looks up upcoming renewals and trial ends by date.
create index subscriptions_next_billing_date_idx on public.subscriptions (next_billing_date)
  where status = 'active';
create index subscriptions_trial_end_date_idx on public.subscriptions (trial_end_date)
  where is_trial and status = 'active';

-- ---------------------------------------------------------------------------
-- shared_plans: at most one per subscription
-- ---------------------------------------------------------------------------
create table public.shared_plans (
  id uuid primary key default gen_random_uuid(),
  subscription_id uuid not null unique references public.subscriptions (id) on delete cascade,
  owner_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  split_type text not null default 'equal' check (split_type in ('equal', 'custom')),
  created_at timestamptz not null default now()
);

create index shared_plans_owner_id_idx on public.shared_plans (owner_id);

-- ---------------------------------------------------------------------------
-- plan_members: people on a shared plan (by name; they don't need accounts)
-- share_amount is used for custom splits; equal splits are calculated in the app.
-- ---------------------------------------------------------------------------
create table public.plan_members (
  id uuid primary key default gen_random_uuid(),
  shared_plan_id uuid not null references public.shared_plans (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 100),
  contact text check (char_length(contact) <= 200),
  share_amount numeric(10, 2) check (share_amount >= 0),
  status text not null default 'owes' check (status in ('paid', 'owes')),
  paid_through_date date,
  created_at timestamptz not null default now()
);

create index plan_members_shared_plan_id_idx on public.plan_members (shared_plan_id);

-- ---------------------------------------------------------------------------
-- reminders_sent: written only by the cron route (service role) so the same
-- reminder is never emailed twice. Users can read their own rows.
-- ---------------------------------------------------------------------------
create table public.reminders_sent (
  id uuid primary key default gen_random_uuid(),
  subscription_id uuid not null references public.subscriptions (id) on delete cascade,
  kind text not null check (kind in ('renewal', 'trial_end')),
  for_date date not null,
  sent_at timestamptz not null default now(),
  unique (subscription_id, kind, for_date)
);

-- ===========================================================================
-- Row Level Security: owner-only access on every table.
-- (select auth.uid()) is wrapped so Postgres evaluates it once per query.
-- ===========================================================================
alter table public.profiles enable row level security;
alter table public.subscriptions enable row level security;
alter table public.shared_plans enable row level security;
alter table public.plan_members enable row level security;
alter table public.reminders_sent enable row level security;

-- profiles: read, create and update your own row. Deleted via auth.users cascade.
create policy "profiles: select own" on public.profiles
  for select to authenticated using (id = (select auth.uid()));
create policy "profiles: insert own" on public.profiles
  for insert to authenticated with check (id = (select auth.uid()));
create policy "profiles: update own" on public.profiles
  for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));

-- subscriptions: full CRUD on your own rows.
create policy "subscriptions: select own" on public.subscriptions
  for select to authenticated using (user_id = (select auth.uid()));
create policy "subscriptions: insert own" on public.subscriptions
  for insert to authenticated with check (user_id = (select auth.uid()));
create policy "subscriptions: update own" on public.subscriptions
  for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "subscriptions: delete own" on public.subscriptions
  for delete to authenticated using (user_id = (select auth.uid()));

-- shared_plans: you must own the plan AND the subscription it points at.
create policy "shared_plans: select own" on public.shared_plans
  for select to authenticated using (owner_id = (select auth.uid()));
create policy "shared_plans: insert own" on public.shared_plans
  for insert to authenticated with check (
    owner_id = (select auth.uid())
    and exists (
      select 1 from public.subscriptions s
      where s.id = subscription_id and s.user_id = (select auth.uid())
    )
  );
create policy "shared_plans: update own" on public.shared_plans
  for update to authenticated
  using (owner_id = (select auth.uid()))
  with check (
    owner_id = (select auth.uid())
    and exists (
      select 1 from public.subscriptions s
      where s.id = subscription_id and s.user_id = (select auth.uid())
    )
  );
create policy "shared_plans: delete own" on public.shared_plans
  for delete to authenticated using (owner_id = (select auth.uid()));

-- plan_members: allowed when you own the shared plan they belong to.
create policy "plan_members: select own" on public.plan_members
  for select to authenticated using (
    exists (
      select 1 from public.shared_plans p
      where p.id = shared_plan_id and p.owner_id = (select auth.uid())
    )
  );
create policy "plan_members: insert own" on public.plan_members
  for insert to authenticated with check (
    exists (
      select 1 from public.shared_plans p
      where p.id = shared_plan_id and p.owner_id = (select auth.uid())
    )
  );
create policy "plan_members: update own" on public.plan_members
  for update to authenticated
  using (
    exists (
      select 1 from public.shared_plans p
      where p.id = shared_plan_id and p.owner_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.shared_plans p
      where p.id = shared_plan_id and p.owner_id = (select auth.uid())
    )
  );
create policy "plan_members: delete own" on public.plan_members
  for delete to authenticated using (
    exists (
      select 1 from public.shared_plans p
      where p.id = shared_plan_id and p.owner_id = (select auth.uid())
    )
  );

-- reminders_sent: read-only for users; only the service role writes.
create policy "reminders_sent: select own" on public.reminders_sent
  for select to authenticated using (
    exists (
      select 1 from public.subscriptions s
      where s.id = subscription_id and s.user_id = (select auth.uid())
    )
  );
