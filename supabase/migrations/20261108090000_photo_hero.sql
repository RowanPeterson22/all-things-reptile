-- Applied to the atr project (ledcvbyiqkygcdleucqo) on 8 Nov 2026 via the Supabase MCP.
-- One hero (main image) per species, and Rowan's own crop for the 2.4 : 1
-- species-page banner.
--   is_hero    the species' main image: the species-page header and the Browse
--              card. At most one per species (partial unique index). Only a
--              public, active photo can be hero.
--   hero_crop  {x, y, w, h}, fractions 0-1 of the image, chosen in /admin.
--              The server (lib/heroCrop.js) enforces the 2.4 : 1 aspect and a
--              minimum width of 30 %; null means a centred crop on the focus point.
-- Existing rows: is_hero false, hero_crop null, so every species keeps today's
-- fallback (the first public photo by public_order).

alter table public.reference_photos
  add column is_hero   boolean not null default false,
  add column hero_crop jsonb;

alter table public.reference_photos add constraint reference_photos_hero_public
  check (not is_hero or (public_use and status = 'active'));

-- Shape only (the aspect depends on the image, so the server checks that).
alter table public.reference_photos add constraint reference_photos_hero_crop_shape
  check (hero_crop is null or (
    jsonb_typeof(hero_crop) = 'object'
    and jsonb_typeof(hero_crop -> 'x') = 'number' and jsonb_typeof(hero_crop -> 'y') = 'number'
    and jsonb_typeof(hero_crop -> 'w') = 'number' and jsonb_typeof(hero_crop -> 'h') = 'number'
    and case when jsonb_typeof(hero_crop -> 'x') = 'number' and jsonb_typeof(hero_crop -> 'y') = 'number'
              and jsonb_typeof(hero_crop -> 'w') = 'number' and jsonb_typeof(hero_crop -> 'h') = 'number'
      then (hero_crop ->> 'x')::numeric >= 0 and (hero_crop ->> 'y')::numeric >= 0
       and (hero_crop ->> 'w')::numeric > 0 and (hero_crop ->> 'h')::numeric > 0
       and (hero_crop ->> 'x')::numeric + (hero_crop ->> 'w')::numeric <= 1.001
       and (hero_crop ->> 'y')::numeric + (hero_crop ->> 'h')::numeric <= 1.001
      else false end
  ));

create unique index reference_photos_one_hero_idx on public.reference_photos (species_slug) where is_hero;

-- Keeps the hero rules in one statement, so a swap is atomic:
--  * a photo that isn't public and active (hidden, rejected, taken off the
--    page) or that moves to another species loses its hero flag;
--  * ticking a new hero unticks the species' previous one in the same UPDATE.
create or replace function public.reference_photos_hero_guard()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if new.is_hero and not (new.public_use and new.status = 'active') then
    new.is_hero := false;
  end if;
  if tg_op = 'UPDATE' and new.species_slug is distinct from old.species_slug then
    new.is_hero := false;
  end if;
  if new.is_hero and (tg_op = 'INSERT' or not old.is_hero) then
    update public.reference_photos
       set is_hero = false
     where species_slug = new.species_slug and is_hero and id <> new.id;
  end if;
  return new;
end;
$$;

revoke all on function public.reference_photos_hero_guard() from public, anon, authenticated;

create trigger reference_photos_hero_guard
  before insert or update of is_hero, public_use, status, species_slug on public.reference_photos
  for each row execute function public.reference_photos_hero_guard();

comment on column public.reference_photos.is_hero   is 'The species'' main image (species-page header and Browse card). One per species; public, active photos only. Set by api/admin-photos.';
comment on column public.reference_photos.hero_crop is 'Hero banner crop {x, y, w, h}, fractions 0-1 of the image, 2.4 : 1, checked by lib/heroCrop.js. Null: centred on the focus point.';

-- Grants unchanged: service_role only (DML), nothing for anon/authenticated.
revoke all on table public.reference_photos from anon, authenticated, public;
grant select, insert, update, delete on table public.reference_photos to service_role;
