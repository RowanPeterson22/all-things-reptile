-- Applied to the atr project (ledcvbyiqkygcdleucqo) on 8 Nov 2026 via the Supabase MCP.
-- Consistent photo sizes, a private master copy, a minimum size for public use
-- and a focus point for the species-page 4:3 frame.
--   reference copy  storage_path   500 px long edge (as the iNaturalist import)
--   master copy     master_path    up to 1,600 px, private, the source for public use
--   public copy     public_path    up to 1,280 px, public species-photos bucket
-- Public use needs a source of at least 800 px on the long edge; the public
-- copy's size is recorded and checked here too.

alter table public.reference_photos
  add column master_path   text unique check (char_length(master_path) <= 300),
  add column master_width  int check (master_width > 0),
  add column master_height int check (master_height > 0),
  add column public_width  int check (public_width > 0),
  add column public_height int check (public_height > 0),
  add column focal_x real not null default 0.5 check (focal_x between 0 and 1),
  add column focal_y real not null default 0.5 check (focal_y between 0 and 1);

alter table public.reference_photos add constraint reference_photos_public_min_size
  check (not public_use or greatest(public_width, public_height) >= 800);

comment on column public.reference_photos.master_path   is 'Private larger copy (up to 1,600 px) in reference-photos, kept for manual uploads and tester photos so they can be published later.';
comment on column public.reference_photos.master_width  is 'Master copy width in px (or, for iNaturalist, the large size found when last published).';
comment on column public.reference_photos.master_height is 'Master copy height in px.';
comment on column public.reference_photos.public_width  is 'Public copy width in px (up to 1,280 on the long edge).';
comment on column public.reference_photos.public_height is 'Public copy height in px.';
comment on column public.reference_photos.focal_x       is 'Focus point, 0 (left) to 1 (right): the object-position in the 4:3 species-page frame.';
comment on column public.reference_photos.focal_y       is 'Focus point, 0 (top) to 1 (bottom).';

-- Grants unchanged: service_role only.
revoke all on table public.reference_photos from anon, authenticated, public;
grant select, insert, update, delete on table public.reference_photos to service_role;
