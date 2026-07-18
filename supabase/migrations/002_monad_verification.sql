-- Access4All — Monad verification columns + verified_records ledger

alter table public.properties
  add column if not exists verified_on_chain boolean not null default false,
  add column if not exists monad_record_id text,
  add column if not exists monad_tx_hash text,
  add column if not exists monad_verified_at timestamptz;

create table if not exists public.verified_records (
  id uuid primary key default gen_random_uuid(),
  property_id text not null,
  property_name text not null,
  location text not null,
  property_hash text not null,
  monad_record_id text,
  monad_tx_hash text not null,
  action text not null default 'verify'
    check (action in ('submit', 'verify')),
  verified_by text,
  verified_at timestamptz not null default now(),
  on_chain boolean not null default false,
  report_id uuid references public.reports (id) on delete set null,
  note text
);

create index if not exists verified_records_property_id_idx on public.verified_records (property_id);
create index if not exists verified_records_verified_at_idx on public.verified_records (verified_at desc);

alter table public.verified_records enable row level security;

drop policy if exists "verified_records_select_anon" on public.verified_records;
create policy "verified_records_select_anon"
  on public.verified_records for select
  to anon, authenticated
  using (true);

drop policy if exists "verified_records_insert_service" on public.verified_records;
create policy "verified_records_insert_service"
  on public.verified_records for insert
  to authenticated
  with check (true);
