-- Applied to the atr project (ledcvbyiqkygcdleucqo) on 7 Nov 2026 via the Supabase MCP.
-- AI species ID closed beta: testers, feedback, private photo bucket.
-- Only the server (secret key -> service_role) touches these. No anon/authenticated access.

create table public.beta_testers (
  id          uuid primary key default gen_random_uuid(),
  invite_code text not null unique
              default (replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', ''))
              check (char_length(invite_code) between 32 and 128 and invite_code ~ '^[A-Za-z0-9_-]+$'),
  name        text not null check (char_length(name) between 1 and 200),
  "group"     text not null default 'other' check ("group" in ('VHS', 'breeder', 'other')),
  active      boolean not null default true,
  created_at  timestamptz not null default now()
);
comment on table public.beta_testers is 'AI ID closed-beta testers. invite_code is a bearer secret; deactivate (active=false) rather than delete once a tester has feedback.';

create table public.id_feedback (
  id                   uuid primary key default gen_random_uuid(),
  tester_id            uuid not null references public.beta_testers(id) on delete restrict,
  created_at           timestamptz not null default now(),
  model                text check (char_length(model) <= 100),
  ai_top_species_slug  text check (char_length(ai_top_species_slug) <= 100),
  ai_traits            jsonb,
  ai_raw               jsonb,
  verdict              text not null check (verdict in ('correct', 'partly', 'wrong')),
  correct_species_slug text check (char_length(correct_species_slug) <= 100),
  correct_traits       text[] not null default '{}' check (cardinality(correct_traits) <= 30),
  notes                text check (char_length(notes) <= 2000),
  photo_path           text check (char_length(photo_path) <= 300),
  photo_consent        boolean not null default false,
  constraint photo_needs_consent check (photo_path is null or photo_consent)
);
comment on table public.id_feedback is 'Tester verdicts on AI ID results. photo_path (in bucket id-photos) only set when the tester opted in for that photo.';

create index id_feedback_tester_id_idx on public.id_feedback (tester_id);
create index id_feedback_created_at_idx on public.id_feedback (created_at desc);

-- RLS on, no permissive policies: anon/authenticated get nothing; service_role bypasses RLS.
alter table public.beta_testers enable row level security;
alter table public.id_feedback  enable row level security;

-- This project still had the legacy default privileges, so strip them explicitly.
revoke all on table public.beta_testers from anon, authenticated, public;
revoke all on table public.id_feedback  from anon, authenticated, public;
grant select, insert, update, delete on table public.beta_testers to service_role;
grant select, insert, update, delete on table public.id_feedback  to service_role;

-- Private bucket for opted-in reference photos. No storage.objects policies are
-- created, so only service_role can read or write it. JPEG only, 4 MB cap.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('id-photos', 'id-photos', false, 4194304, array['image/jpeg'])
on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;
