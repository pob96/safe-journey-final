-- SafeJourney core database schema
-- Migration: create_safejourney_schema

create extension if not exists pgcrypto;

-- ============================================================
-- PROFILES
-- ============================================================

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- TRUSTED CONTACTS
-- ============================================================

create table public.trusted_contacts (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  linked_user_id uuid references auth.users(id) on delete set null,
  name text not null,
  phone text,
  relationship text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index trusted_contacts_owner_id_idx
  on public.trusted_contacts(owner_id);

create index trusted_contacts_linked_user_id_idx
  on public.trusted_contacts(linked_user_id);

-- ============================================================
-- JOURNEYS
-- ============================================================

create table public.journeys (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  activity_type text not null default 'run'
    check (activity_type in ('run', 'walk', 'hike', 'cycle', 'other')),
  status text not null default 'planned'
    check (status in ('planned', 'active', 'completed', 'cancelled')),
  planned_distance_km numeric(8,2),
  estimated_duration_min integer,
  started_at timestamptz,
  expected_arrival_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index journeys_owner_id_idx
  on public.journeys(owner_id);

create index journeys_status_idx
  on public.journeys(status);

-- ============================================================
-- JOURNEY MEMBERS
-- ============================================================

create table public.journey_members (
  id uuid primary key default gen_random_uuid(),
  journey_id uuid not null references public.journeys(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null
    check (role in ('owner', 'buddy')),
  trusted_contact_id uuid references public.trusted_contacts(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (journey_id, user_id)
);

create index journey_members_journey_id_idx
  on public.journey_members(journey_id);

create index journey_members_user_id_idx
  on public.journey_members(user_id);

-- ============================================================
-- JOURNEY LOCATIONS
-- ============================================================

create table public.journey_locations (
  id bigint generated always as identity primary key,
  journey_id uuid not null references public.journeys(id) on delete cascade,
  latitude double precision not null,
  longitude double precision not null,
  accuracy_m double precision,
  recorded_at timestamptz not null default now()
);

create index journey_locations_journey_time_idx
  on public.journey_locations(journey_id, recorded_at desc);

-- ============================================================
-- JOURNEY EVENTS
-- ============================================================

create table public.journey_events (
  id uuid primary key default gen_random_uuid(),
  journey_id uuid not null references public.journeys(id) on delete cascade,
  event_type text not null
    check (
      event_type in (
        'journey_started',
        'check_in',
        'stationary',
        'off_route',
        'fall',
        'arrival',
        'journey_cancelled'
      )
    ),
  severity text not null default 'info'
    check (severity in ('info', 'warning', 'critical')),
  metadata jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now()
);

create index journey_events_journey_time_idx
  on public.journey_events(journey_id, occurred_at desc);

-- ============================================================
-- ALERTS
-- ============================================================

create table public.alerts (
  id uuid primary key default gen_random_uuid(),
  journey_id uuid not null references public.journeys(id) on delete cascade,
  event_id uuid references public.journey_events(id) on delete set null,
  recipient_user_id uuid not null references auth.users(id) on delete cascade,
  alert_type text not null
    check (alert_type in ('stationary', 'off_route', 'fall', 'overdue')),
  status text not null default 'pending'
    check (status in ('pending', 'sent', 'acknowledged', 'resolved')),
  created_at timestamptz not null default now(),
  acknowledged_at timestamptz,
  resolved_at timestamptz
);

create index alerts_recipient_idx
  on public.alerts(recipient_user_id);

create index alerts_journey_idx
  on public.alerts(journey_id);

-- ============================================================
-- SUBSCRIPTIONS
-- ============================================================

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  provider text
    check (provider in ('stripe')),
  provider_customer_id text,
  provider_subscription_id text,
  status text not null default 'inactive'
    check (status in ('inactive', 'trialing', 'active', 'past_due', 'cancelled')),
  current_period_start timestamptz,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- RLS
-- ============================================================

alter table public.profiles enable row level security;
alter table public.trusted_contacts enable row level security;
alter table public.journeys enable row level security;
alter table public.journey_members enable row level security;
alter table public.journey_locations enable row level security;
alter table public.journey_events enable row level security;
alter table public.alerts enable row level security;
alter table public.subscriptions enable row level security;

-- ============================================================
-- PROFILE POLICIES
-- ============================================================

create policy "Users can view own profile"
on public.profiles
for select
to authenticated
using (id = auth.uid());

create policy "Users can create own profile"
on public.profiles
for insert
to authenticated
with check (id = auth.uid());

create policy "Users can update own profile"
on public.profiles
for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

-- ============================================================
-- TRUSTED CONTACT POLICIES
-- ============================================================

create policy "Users can view own trusted contacts"
on public.trusted_contacts
for select
to authenticated
using (owner_id = auth.uid());

create policy "Users can create own trusted contacts"
on public.trusted_contacts
for insert
to authenticated
with check (owner_id = auth.uid());

create policy "Users can update own trusted contacts"
on public.trusted_contacts
for update
to authenticated
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

create policy "Users can delete own trusted contacts"
on public.trusted_contacts
for delete
to authenticated
using (owner_id = auth.uid());

-- ============================================================
-- JOURNEY POLICIES
-- ============================================================

create policy "Owners can view own journeys"
on public.journeys
for select
to authenticated
using (owner_id = auth.uid());

create policy "Users can create own journeys"
on public.journeys
for insert
to authenticated
with check (owner_id = auth.uid());

create policy "Owners can update own journeys"
on public.journeys
for update
to authenticated
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

create policy "Owners can delete own journeys"
on public.journeys
for delete
to authenticated
using (owner_id = auth.uid());

-- ============================================================
-- JOURNEY MEMBER POLICIES
-- ============================================================

create policy "Users can view memberships they belong to"
on public.journey_members
for select
to authenticated
using (user_id = auth.uid());

create policy "Journey owners can view all journey members"
on public.journey_members
for select
to authenticated
using (
  exists (
    select 1
    from public.journeys j
    where j.id = journey_members.journey_id
      and j.owner_id = auth.uid()
  )
);

create policy "Journey owners can add members"
on public.journey_members
for insert
to authenticated
with check (
  exists (
    select 1
    from public.journeys j
    where j.id = journey_members.journey_id
      and j.owner_id = auth.uid()
  )
);

create policy "Journey owners can update members"
on public.journey_members
for update
to authenticated
using (
  exists (
    select 1
    from public.journeys j
    where j.id = journey_members.journey_id
      and j.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.journeys j
    where j.id = journey_members.journey_id
      and j.owner_id = auth.uid()
  )
);

create policy "Journey owners can remove members"
on public.journey_members
for delete
to authenticated
using (
  exists (
    select 1
    from public.journeys j
    where j.id = journey_members.journey_id
      and j.owner_id = auth.uid()
  )
);

-- ============================================================
-- JOURNEY LOCATION POLICIES
-- ============================================================

create policy "Journey owners can view locations"
on public.journey_locations
for select
to authenticated
using (
  exists (
    select 1
    from public.journeys j
    where j.id = journey_locations.journey_id
      and j.owner_id = auth.uid()
  )
);

create policy "Journey owners can insert locations"
on public.journey_locations
for insert
to authenticated
with check (
  exists (
    select 1
    from public.journeys j
    where j.id = journey_locations.journey_id
      and j.owner_id = auth.uid()
      and j.status = 'active'
  )
);

create policy "Journey owners can delete locations"
on public.journey_locations
for delete
to authenticated
using (
  exists (
    select 1
    from public.journeys j
    where j.id = journey_locations.journey_id
      and j.owner_id = auth.uid()
  )
);

-- ============================================================
-- JOURNEY EVENT POLICIES
-- ============================================================

create policy "Journey owners can view events"
on public.journey_events
for select
to authenticated
using (
  exists (
    select 1
    from public.journeys j
    where j.id = journey_events.journey_id
      and j.owner_id = auth.uid()
  )
);

create policy "Journey owners can create events"
on public.journey_events
for insert
to authenticated
with check (
  exists (
    select 1
    from public.journeys j
    where j.id = journey_events.journey_id
      and j.owner_id = auth.uid()
  )
);

-- ============================================================
-- ALERT POLICIES
-- ============================================================

create policy "Recipients can view their alerts"
on public.alerts
for select
to authenticated
using (recipient_user_id = auth.uid());

create policy "Journey owners can create alerts"
on public.alerts
for insert
to authenticated
with check (
  exists (
    select 1
    from public.journeys j
    where j.id = alerts.journey_id
      and j.owner_id = auth.uid()
  )
);

create policy "Recipients can acknowledge alerts"
on public.alerts
for update
to authenticated
using (recipient_user_id = auth.uid())
with check (recipient_user_id = auth.uid());

-- ============================================================
-- SUBSCRIPTION POLICIES
-- ============================================================

create policy "Users can view own subscription"
on public.subscriptions
for select
to authenticated
using (user_id = auth.uid());

create policy "Users can create own subscription"
on public.subscriptions
for insert
to authenticated
with check (user_id = auth.uid());

create policy "Users can update own subscription"
on public.subscriptions
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

-- ============================================================
-- UPDATED_AT
-- ============================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

create trigger trusted_contacts_set_updated_at
before update on public.trusted_contacts
for each row
execute function public.set_updated_at();

create trigger journeys_set_updated_at
before update on public.journeys
for each row
execute function public.set_updated_at();

create trigger subscriptions_set_updated_at
before update on public.subscriptions
for each row
execute function public.set_updated_at();