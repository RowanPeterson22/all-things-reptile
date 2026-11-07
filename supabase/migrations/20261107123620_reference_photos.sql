-- Applied to the atr project (ledcvbyiqkygcdleucqo) on 7 Nov 2026 via the Supabase MCP.
-- Private reference photo library for the AI species ID: confirmed photos per
-- species that lib/identify.js will later compare new photos against.
-- Never published. Only the server (secret key -> service_role) touches these.
-- Imported by scripts/import-photos.mjs (CC0 / CC-BY / CC-BY-SA only).

create table public.reference_photos (
  id           uuid primary key default gen_random_uuid(),
  species_slug text not null check (char_length(species_slug) between 1 and 100 and species_slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  source       text not null check (source in ('inaturalist', 'ala', 'wikimedia', 'tester', 'admin_upload')),
  source_id    text check (char_length(source_id) <= 200),
  source_url   text not null check (char_length(source_url) <= 1000),
  photographer text not null check (char_length(photographer) between 1 and 300),
  licence      text not null check (licence in ('cc0', 'cc-by', 'cc-by-sa', 'permission', 'tester_consent')),
  licence_url  text check (char_length(licence_url) <= 500),
  storage_path text not null unique check (char_length(storage_path) <= 300),
  width        int check (width > 0),
  height       int check (height > 0),
  observed_on  date,
  state        text check (char_length(state) <= 10),
  quality      text check (char_length(quality) <= 50),
  traits       text[] not null default '{}' check (cardinality(traits) <= 30),
  is_best      boolean not null default false,
  status       text not null default 'active' check (status in ('active', 'hidden', 'rejected')),
  notes        text check (char_length(notes) <= 2000),
  added_by     text check (char_length(added_by) <= 200),
  created_at   timestamptz not null default now(),
  constraint reference_photos_source_unique unique (source, source_id)
);
comment on table public.reference_photos is 'Private AI ID reference photos. storage_path is relative to the private reference-photos bucket. created_at is the date imported. Never publish.';
comment on column public.reference_photos.source_id is 'Photo ID at the source (iNaturalist photo id, not observation id).';
comment on column public.reference_photos.source_url is 'Link to the original page (e.g. https://www.inaturalist.org/observations/<id>).';

create index reference_photos_species_slug_idx on public.reference_photos (species_slug);
create index reference_photos_status_idx       on public.reference_photos (status);

-- RLS on. Explicit restrictive deny for client roles; service_role bypasses RLS.
alter table public.reference_photos enable row level security;
create policy "no client access" on public.reference_photos as restrictive for all to anon, authenticated using (false) with check (false);

-- Least privilege: no client grants at all; service_role gets DML only.
revoke all on table public.reference_photos from anon, authenticated, public;
revoke all on table public.reference_photos from service_role;
grant select, insert, update, delete on table public.reference_photos to service_role;

-- Private bucket. No storage.objects policies are created, so only service_role
-- can read or write it. JPEG only, 2 MB cap.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('reference-photos', 'reference-photos', false, 2097152, array['image/jpeg'])
on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;
