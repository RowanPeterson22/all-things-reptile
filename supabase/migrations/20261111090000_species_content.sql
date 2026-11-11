-- Applied to the atr project (ledcvbyiqkygcdleucqo) on 11 Nov 2026 via the Supabase MCP.
-- Species content (D5, revised 11 Nov 2026): the species pages' content,
-- mastered here and edited in /admin → Species (step 2). One JSON document per
-- species; the shape is src/data/speciesContentShape.js (blocks per tab), and
-- the server never serves a document that fails it.
--
-- species_content: one row per species, keyed by the D4 slug.
--   draft      what /admin edits and previews.
--   published  what the app shows (GET /api/species-photos?content=<slug>);
--              null = never published, the app keeps its bundled snapshot.
--   Publishing copies draft → published and records who and when; each
--   published version is kept in species_content_revisions (trigger), so a
--   publish can be rolled back.
--   updated_at / updated_by: the last draft edit (tester name or id from
--   /admin, or 'migration:extract-species-content').
-- species_content_revisions: append-only history of published documents.

create table public.species_content (
  slug          text primary key check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) <= 100),
  sort_order    integer not null default 0,
  draft         jsonb not null check (jsonb_typeof(draft) = 'object' and draft->>'slug' = slug and jsonb_typeof(draft->'tabs') = 'array'),
  published     jsonb check (published is null or (jsonb_typeof(published) = 'object' and published->>'slug' = slug and jsonb_typeof(published->'tabs') = 'array')),
  published_at  timestamptz,
  published_by  text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  updated_by    text not null check (char_length(btrim(updated_by)) between 1 and 120),
  check ((published is null) = (published_at is null))
);
comment on table public.species_content is 'Species page content (D5): draft (edited in /admin) and published (served to the app) JSON documents, shape in src/data/speciesContentShape.js. Server only.';
comment on column public.species_content.published is 'What the app shows. null = never published (the app keeps its bundled snapshot).';

create table public.species_content_revisions (
  id            bigint generated always as identity primary key,
  slug          text not null references public.species_content (slug) on delete cascade,
  doc           jsonb not null,
  published_at  timestamptz not null,
  published_by  text
);
create index species_content_revisions_slug on public.species_content_revisions (slug, published_at desc);
comment on table public.species_content_revisions is 'Every published species document, newest last (trigger on species_content). Server only.';

-- Keep updated_at honest, and record each newly published document.
create or replace function public.species_content_touch()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if tg_op = 'UPDATE' and new.draft is distinct from old.draft then
    new.updated_at := now();
  end if;
  return new;
end;
$$;

create or replace function public.species_content_log_publish()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if new.published is not null and (tg_op = 'INSERT' or new.published is distinct from old.published) then
    insert into public.species_content_revisions (slug, doc, published_at, published_by)
      values (new.slug, new.published, coalesce(new.published_at, now()), new.published_by);
  end if;
  return null;
end;
$$;
revoke all on function public.species_content_touch() from public, anon, authenticated;
revoke all on function public.species_content_log_publish() from public, anon, authenticated;

create trigger species_content_touch before update on public.species_content
  for each row execute function public.species_content_touch();
create trigger species_content_log_publish after insert or update on public.species_content
  for each row execute function public.species_content_log_publish();

-- Same pattern as the other ATR tables: RLS on, no client access,
-- service_role DML only (revisions: no UPDATE, it's a log).
alter table public.species_content enable row level security;
alter table public.species_content_revisions enable row level security;
create policy "no client access" on public.species_content as restrictive for all to anon, authenticated using (false) with check (false);
create policy "no client access" on public.species_content_revisions as restrictive for all to anon, authenticated using (false) with check (false);
revoke all on table public.species_content from anon, authenticated, public;
revoke all on table public.species_content_revisions from anon, authenticated, public;
revoke all on table public.species_content from service_role;
revoke all on table public.species_content_revisions from service_role;
grant select, insert, update, delete on table public.species_content to service_role;
grant select, insert, delete on table public.species_content_revisions to service_role;
