-- Access4All — Supabase schema (properties + community reports)
-- Run in Supabase SQL Editor or: supabase db push

-- ---------------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------------
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- properties — searchable listings with accessibility feature columns
-- ---------------------------------------------------------------------------
create table if not exists public.properties (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  location text not null,
  address text,
  city text,
  state text,
  category text not null default 'hotel'
    check (category in ('hotel', 'airbnb', 'airport')),
  summary text,
  description text,
  price numeric(10, 2) not null default 0,
  rating numeric(3, 2) not null default 0,
  review_count integer not null default 0,
  verified boolean not null default false,
  lat double precision,
  lng double precision,
  photos jsonb not null default '[]'::jsonb,
  wheelchair_ramp boolean not null default false,
  roll_in_shower boolean not null default false,
  elevator boolean not null default false,
  wide_doorways boolean not null default false,
  accessible_parking boolean not null default false,
  accessible_restroom boolean not null default false,
  accessible_entrance boolean not null default false,
  lowered_bathroom boolean not null default false,
  service_animals_allowed boolean not null default false,
  ceiling_hoist boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists properties_location_idx on public.properties using gin (to_tsvector('english', coalesce(location, '') || ' ' || coalesce(city, '') || ' ' || coalesce(state, '')));
create index if not exists properties_category_idx on public.properties (category);
create index if not exists properties_verified_idx on public.properties (verified);

-- ---------------------------------------------------------------------------
-- reports — community accessibility submissions / issue reports
-- ---------------------------------------------------------------------------
create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  property_id uuid references public.properties (id) on delete set null,
  issue_type text not null default 'other'
    check (issue_type in ('inaccurate_feature', 'missing_access', 'new_listing', 'other')),
  title text,
  location text,
  reporter_email text,
  notes text not null,
  wheelchair_ramp boolean,
  roll_in_shower boolean,
  elevator boolean,
  wide_doorways boolean,
  accessible_parking boolean,
  accessible_restroom boolean,
  accessible_entrance boolean,
  lowered_bathroom boolean,
  service_animals_allowed boolean,
  ceiling_hoist boolean,
  status text not null default 'pending'
    check (status in ('pending', 'reviewed', 'resolved', 'rejected')),
  created_at timestamptz not null default now()
);

create index if not exists reports_property_id_idx on public.reports (property_id);
create index if not exists reports_status_idx on public.reports (status);

-- ---------------------------------------------------------------------------
-- updated_at trigger
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists properties_set_updated_at on public.properties;
create trigger properties_set_updated_at
  before update on public.properties
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security (RLS) — enable in production; policies below are starters
-- ---------------------------------------------------------------------------
alter table public.properties enable row level security;
alter table public.reports enable row level security;

-- PROPERTIES: public read for published listings
-- Tighten for production: add `published = true` column and filter in policy
drop policy if exists "properties_select_anon" on public.properties;
create policy "properties_select_anon"
  on public.properties for select
  to anon, authenticated
  using (true);

-- PROPERTIES: only authenticated staff/service role may insert/update
-- For beta community listings, use reports table + admin review instead of open insert
drop policy if exists "properties_insert_service" on public.properties;
create policy "properties_insert_service"
  on public.properties for insert
  to authenticated
  with check (true);

drop policy if exists "properties_update_service" on public.properties;
create policy "properties_update_service"
  on public.properties for update
  to authenticated
  using (true);

-- REPORTS: anyone can submit (anon) — community accessibility reports
drop policy if exists "reports_insert_anon" on public.reports;
create policy "reports_insert_anon"
  on public.reports for insert
  to anon, authenticated
  with check (char_length(notes) >= 10);

-- REPORTS: read restricted to authenticated reviewers (adjust role in production)
drop policy if exists "reports_select_authenticated" on public.reports;
create policy "reports_select_authenticated"
  on public.reports for select
  to authenticated
  using (true);

-- ---------------------------------------------------------------------------
-- Optional seed (comment out if you load data separately)
-- ---------------------------------------------------------------------------
insert into public.properties (
  title, location, address, city, state, category, summary, description,
  price, rating, review_count, verified, lat, lng, photos,
  wheelchair_ramp, roll_in_shower, elevator, wide_doorways,
  accessible_parking, accessible_restroom, accessible_entrance,
  lowered_bathroom, service_animals_allowed, ceiling_hoist
) values
(
  'Harborview Accessible Hotel', 'New York, NY',
  '120 West 45th Street, New York, NY 10036', 'New York', 'NY', 'hotel',
  'Downtown hotel with verified roll-in shower rooms and wide doorways.',
  'Harborview offers dedicated accessible king rooms with roll-in showers and grab bars.',
  189, 4.8, 142, true, 40.7569, -73.9845,
  '[{"url":"https://images.pexels.com/photos/261102/pexels-photo-261102.jpeg","alt":"Hotel lobby"}]'::jsonb,
  true, true, true, true, true, true, true, true, true, false
),
(
  'Sunshine Family Suites Orlando', 'Orlando, FL',
  '8750 International Drive, Orlando, FL 32819', 'Orlando', 'FL', 'hotel',
  'Family suites with roll-in showers and pool ramp near theme parks.',
  'Family suites with connecting accessible rooms and ceiling-track hoists in premium suites.',
  165, 4.6, 98, true, 28.4432, -81.468,
  '[{"url":"https://images.pexels.com/photos/7698932/pexels-photo-7698932.jpeg","alt":"Family at accessible hotel"}]'::jsonb,
  true, true, true, true, true, true, true, true, true, true
)
on conflict do nothing;
