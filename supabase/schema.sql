create extension if not exists pgcrypto;

create table if not exists public.translations (
  id uuid primary key default gen_random_uuid(),
  source_text text not null,
  translated_text text not null,
  source_lang text not null,
  target_lang text not null,
  model text not null default 'gpt-4o-mini',
  created_at timestamptz not null default now()
);

alter table public.translations enable row level security;

create policy "allow_anon_insert_translations"
on public.translations
for insert
to anon
with check (true);

create policy "allow_anon_select_translations"
on public.translations
for select
to anon
using (true);
