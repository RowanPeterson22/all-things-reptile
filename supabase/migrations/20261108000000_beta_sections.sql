-- Applied to the atr project (ledcvbyiqkygcdleucqo) on 8 Nov 2026 via the Supabase MCP.
-- Pre-launch gate: per-tester section access. The keys are defined once in
-- src/constants/sections.json (id, species, care, licensing, glossary, search,
-- credits). Admins (is_admin) implicitly get every section; the column is
-- ignored for them. New invites take beta_settings.default_sections.

alter table public.beta_testers
  add column sections text[] not null default '{id}'
  constraint beta_testers_sections_known
    check (sections <@ array['id', 'species', 'care', 'licensing', 'glossary', 'search', 'credits']::text[]);
comment on column public.beta_testers.sections is 'App sections this tester can open before launch (src/constants/sections.json). Admins see everything regardless.';

-- One-row settings table for the beta (the admin Testers screen edits it).
create table public.beta_settings (
  id               boolean primary key default true check (id),
  default_sections text[] not null default '{id}'
                   constraint beta_settings_sections_known
                   check (default_sections <@ array['id', 'species', 'care', 'licensing', 'glossary', 'search', 'credits']::text[]),
  updated_at       timestamptz not null default now()
);
comment on table public.beta_settings is 'Single row: beta defaults, e.g. the sections new invites get. Server only.';
insert into public.beta_settings (id) values (true) on conflict (id) do nothing;

-- Same pattern as beta_testers: RLS on, explicit deny for client roles,
-- service_role DML only.
alter table public.beta_settings enable row level security;
revoke all on table public.beta_settings from anon, authenticated, public;
grant select, insert, update, delete on table public.beta_settings to service_role;
create policy "no client access" on public.beta_settings as restrictive for all to anon, authenticated using (false) with check (false);
