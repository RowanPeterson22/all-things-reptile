-- Applied to the atr project (ledcvbyiqkygcdleucqo) on 8 Nov 2026 via the Supabase MCP.
-- Customer-facing species photos. Rowan picks photos from the private reference
-- library in /admin ("Use on species page"); the server copies each one into the
-- public species-photos bucket and the app shows it with a credit icon.
--
-- The table stays closed: no client grants, RLS restrictive deny. The public
-- endpoint (api/species-photos) reads it with the secret key and returns only
-- public rows and their credit fields. Only the bucket is public, and only for
-- reading a known object URL (no storage.objects policies, so no listing).

-- ─── Royalty-free stock ───────────────────────────────────────────
alter table public.reference_photos drop constraint reference_photos_licence_check;
alter table public.reference_photos add constraint reference_photos_licence_check
  check (licence in ('cc0', 'cc-by', 'cc-by-sa', 'permission', 'tester_consent', 'royalty_free'));

alter table public.reference_photos
  add column stock_library   text check (char_length(stock_library) between 1 and 100),
  add column stock_asset_id  text check (char_length(stock_asset_id) between 1 and 200),
  add column credit_required boolean not null default false,
  add column show_credit     boolean not null default true,
  add column display_credit  text check (char_length(display_credit) between 1 and 300),
  add column credit_by_name  boolean not null default false,
  add column public_use      boolean not null default false,
  add column public_order    int check (public_order between 0 and 9999),
  add column public_path     text unique check (char_length(public_path) <= 300);

-- Photographer becomes optional, but only for stock that doesn't need credit.
alter table public.reference_photos alter column photographer drop not null;
alter table public.reference_photos add constraint reference_photos_photographer_needed
  check (photographer is not null or (licence = 'royalty_free' and not credit_required));

-- Stock needs its proof of licence.
alter table public.reference_photos add constraint reference_photos_stock_proof
  check (licence <> 'royalty_free' or (stock_library is not null and stock_asset_id is not null));

-- The credit can only be hidden when the licence doesn't require attribution.
alter table public.reference_photos add constraint reference_photos_credit_shown_when_required
  check (show_credit or (licence not in ('cc-by', 'cc-by-sa') and not credit_required));

-- Public use: never CC BY-SA (share-alike obligations; AI reference only), and
-- only active photos. A public row always has its public copy's path.
alter table public.reference_photos add constraint reference_photos_public_licence
  check (not public_use or licence <> 'cc-by-sa');
alter table public.reference_photos add constraint reference_photos_public_active
  check (not public_use or status = 'active');
alter table public.reference_photos add constraint reference_photos_public_path_set
  check (not public_use or public_path is not null);

comment on column public.reference_photos.stock_library   is 'Royalty-free stock: the library (e.g. Adobe Stock). Required with licence royalty_free.';
comment on column public.reference_photos.stock_asset_id  is 'Royalty-free stock: the asset/licence ID, the proof of licence. Required with licence royalty_free.';
comment on column public.reference_photos.credit_required is 'The licence terms require a credit (stock). CC BY and CC BY-SA always do, whatever this says.';
comment on column public.reference_photos.show_credit     is 'Show the credit icon on customer-facing images. Can only be false when no attribution is required.';
comment on column public.reference_photos.display_credit  is 'Overrides the credit name shown to customers (e.g. "Adobe Stock / J. Smith").';
comment on column public.reference_photos.credit_by_name  is 'tester_consent: the tester opted in to being credited by name. Otherwise the credit reads "ATR community".';
comment on column public.reference_photos.public_use      is 'Shown on the app species page. Set only by api/admin-photos, which copies the file into species-photos.';
comment on column public.reference_photos.public_order    is 'Order on the species page (lower first).';
comment on column public.reference_photos.public_path     is 'Path of the public copy in the species-photos bucket.';

create index reference_photos_public_idx on public.reference_photos (species_slug, public_order) where public_use;

-- Grants unchanged: service_role only (DML), nothing for anon/authenticated.
-- Re-stated so this migration is safe to read on its own.
revoke all on table public.reference_photos from anon, authenticated, public;
grant select, insert, update, delete on table public.reference_photos to service_role;

-- ─── Public bucket ────────────────────────────────────────────────
-- Public read by object URL; JPEG only, 3 MB cap (large ≈ 1,024 px). No
-- storage.objects policies: only service_role writes, nobody can list.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('species-photos', 'species-photos', true, 3145728, array['image/jpeg'])
on conflict (id) do update set public = true, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;
