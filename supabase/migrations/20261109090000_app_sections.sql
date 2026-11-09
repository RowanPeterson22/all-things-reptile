-- Applied to the atr project (ledcvbyiqkygcdleucqo) on 9 Nov 2026 via the Supabase MCP.
-- App layout, edited in /admin → Sections: the five bottom tabs (Home, Learn,
-- ID, Community, My Profile) are fixed in code; the sections inside them, their
-- titles/blurbs, status, audience, order and the featured card are set here.
--
-- app_sections: one row per section key in src/constants/sections.json.
--   key is free text (checked for shape only), not a fixed list: the server
--   ignores rows for keys the code doesn't know and only ever writes known
--   keys, so adding a placeholder section is a code-only change, and a section
--   with no row simply takes its defaults from sections.json.
--   status    live | soon (Coming soon tile and page) | hidden (admins only).
--             "live" for a placeholder (not built) section is refused by the
--             server (lib/appSections.js), which knows what is built.
--   audience  everyone | testers (all active testers) | admin. Built sections
--             also keep the per-tester grant (beta_testers.sections) before launch.
--   featured  at most one row (partial unique index); set with
--             app_sections_set_featured() so the swap is one transaction.
--   title / blurb  overrides; null = the default from sections.json.
-- app_layout: single row: tab label overrides and the Home block order.

create table public.app_sections (
  key         text primary key check (key ~ '^[a-z][a-z0-9-]{1,39}$'),
  status      text not null default 'soon' check (status in ('live', 'soon', 'hidden')),
  audience    text not null default 'testers' check (audience in ('everyone', 'testers', 'admin')),
  sort_order  integer not null default 0,
  featured    boolean not null default false,
  title       text check (title is null or char_length(btrim(title)) between 1 and 40),
  blurb       text check (blurb is null or char_length(btrim(blurb)) between 1 and 90),
  updated_at  timestamptz not null default now(),
  updated_by  text
);

create unique index app_sections_one_featured on public.app_sections ((true)) where featured;

comment on table public.app_sections is 'Per-section layout settings for the app (/admin → Sections). Defaults live in src/constants/sections.json. Server only (api/beta-check reads, api/admin-testers?scope=sections writes).';
comment on column public.app_sections.key is 'Section key from src/constants/sections.json. Rows for unknown keys are ignored.';
comment on column public.app_sections.status is 'live | soon | hidden. Placeholder (unbuilt) sections can''t be live; the server refuses it.';
comment on column public.app_sections.audience is 'everyone | testers | admin. AI ID (id) can''t be everyone (D9); the server refuses it.';

create table public.app_layout (
  id          boolean primary key default true check (id),
  tab_labels  jsonb not null default '{}'::jsonb check (jsonb_typeof(tab_labels) = 'object'),
  home_blocks text[] not null default '{search,personal,featured,explore}'
              check (cardinality(home_blocks) between 1 and 10),
  updated_at  timestamptz not null default now(),
  updated_by  text
);
comment on table public.app_layout is 'Single row: tab label overrides ({home, learn, id, community, profile} → label) and the Home block order. Server only.';

-- Seed: today's sections as they are; Community and My Profile placeholders
-- Coming soon for testers; nothing featured.
insert into public.app_sections (key, status, audience, sort_order) values
  ('id', 'live', 'testers', 0),
  ('species', 'live', 'everyone', 10),
  ('care', 'live', 'everyone', 20),
  ('licensing', 'live', 'everyone', 30),
  ('glossary', 'live', 'everyone', 40),
  ('search', 'live', 'everyone', 50),
  ('credits', 'live', 'everyone', 60),
  ('sightings', 'soon', 'testers', 70),
  ('ladders', 'soon', 'testers', 80),
  ('competitions', 'soon', 'testers', 90),
  ('venues', 'soon', 'testers', 100),
  ('shortlist', 'soon', 'testers', 110),
  ('can-i-keep', 'soon', 'testers', 120),
  ('shopping-lists', 'soon', 'testers', 130),
  ('suits-me', 'soon', 'testers', 140),
  ('collection', 'soon', 'testers', 150),
  ('reminders', 'soon', 'testers', 160),
  ('account', 'soon', 'testers', 170)
on conflict (key) do nothing;
insert into public.app_layout (id) values (true) on conflict (id) do nothing;

-- Move the featured flag in one statement pair (null = feature nothing).
create or replace function public.app_sections_set_featured(p_key text, p_by text default null)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
begin
  update public.app_sections set featured = false, updated_at = now(), updated_by = p_by
    where featured and (p_key is null or key <> p_key);
  if p_key is not null then
    update public.app_sections set featured = true, updated_at = now(), updated_by = p_by where key = p_key;
    if not found then
      raise exception 'unknown section %', p_key using errcode = 'P0002';
    end if;
  end if;
end;
$$;
revoke all on function public.app_sections_set_featured(text, text) from public, anon, authenticated;
grant execute on function public.app_sections_set_featured(text, text) to service_role;

-- Same pattern as the other ATR tables: RLS on, no client access,
-- service_role DML only.
alter table public.app_sections enable row level security;
alter table public.app_layout enable row level security;
create policy "no client access" on public.app_sections as restrictive for all to anon, authenticated using (false) with check (false);
create policy "no client access" on public.app_layout as restrictive for all to anon, authenticated using (false) with check (false);
revoke all on table public.app_sections from anon, authenticated, public;
revoke all on table public.app_layout from anon, authenticated, public;
revoke all on table public.app_sections from service_role;
revoke all on table public.app_layout from service_role;
grant select, insert, update, delete on table public.app_sections to service_role;
grant select, insert, update, delete on table public.app_layout to service_role;
