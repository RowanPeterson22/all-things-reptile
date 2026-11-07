-- Applied to the atr project (ledcvbyiqkygcdleucqo) on 8 Nov 2026 via the Supabase MCP.
-- "Replace image" and "Rotate 90°" in /admin: a new file for the same photo
-- record (same credit, licence and source). CC BY needs changes indicated, so
-- a replaced CC BY photo is marked edited and its credit says so.

alter table public.reference_photos
  add column edited      boolean not null default false,
  add column replaced_at timestamptz,
  add column replaced_by text check (char_length(replaced_by) <= 200);

comment on column public.reference_photos.edited      is 'The image was changed from the original (replaced/rotated). Shown in the credit for CC BY ("modified from original").';
comment on column public.reference_photos.replaced_at is 'When the image was last replaced in /admin. Once set, the original (e.g. iNaturalist large size) is never re-fetched.';
comment on column public.reference_photos.replaced_by is 'The admin who last replaced the image.';

revoke all on table public.reference_photos from anon, authenticated, public;
grant select, insert, update, delete on table public.reference_photos to service_role;
