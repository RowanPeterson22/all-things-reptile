-- Applied to the atr project (ledcvbyiqkygcdleucqo) on 8 Nov 2026 via the Supabase MCP.
-- The Browse home's six category cards and each category page's header can
-- show a photo Rowan chooses in /admin → Categories, instead of the emoji.
--   category_id    one of the six ids in src/data/categories.js
--   photo_id       the library photo (reference_photos). It must be of an app
--                  species in that category and eligible for public use; the
--                  server (lib/categoryImages.js) checks both. Deleting the
--                  photo deletes the category image.
--   crop           {x, y, w, h}, fractions 0-1, for the Browse card's aspect
--   banner_crop    {x, y, w, h}, 2.4 : 1, for the category page header
--                  (aspects and minimum width are checked by lib/heroCrop.js;
--                  null means centred on the photo's focus point)
--   public_path    the category's own copy in the public species-photos bucket
--                  (categories/<id>-<version>.jpg, 1,280 px). Not the species
--                  page copy: choosing a category image never puts the photo
--                  in that species' gallery or slideshow.
--   public_width / public_height  that copy's size (for the crops and the page)

create or replace function public.is_crop_shape(c jsonb)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select c is null or (
    jsonb_typeof(c) = 'object'
    and jsonb_typeof(c -> 'x') = 'number' and jsonb_typeof(c -> 'y') = 'number'
    and jsonb_typeof(c -> 'w') = 'number' and jsonb_typeof(c -> 'h') = 'number'
    and case when jsonb_typeof(c -> 'x') = 'number' and jsonb_typeof(c -> 'y') = 'number'
              and jsonb_typeof(c -> 'w') = 'number' and jsonb_typeof(c -> 'h') = 'number'
      then (c ->> 'x')::numeric >= 0 and (c ->> 'y')::numeric >= 0
       and (c ->> 'w')::numeric > 0 and (c ->> 'h')::numeric > 0
       and (c ->> 'x')::numeric + (c ->> 'w')::numeric <= 1.001
       and (c ->> 'y')::numeric + (c ->> 'h')::numeric <= 1.001
      else false end
  );
$$;

revoke all on function public.is_crop_shape(jsonb) from public, anon, authenticated;
grant execute on function public.is_crop_shape(jsonb) to service_role;

create table public.category_images (
  category_id   text primary key
                check (category_id in ('snake', 'lizard', 'gecko', 'monitor', 'turtle', 'frog')),
  photo_id      uuid not null references public.reference_photos (id) on delete cascade,
  crop          jsonb check (public.is_crop_shape(crop)),
  banner_crop   jsonb check (public.is_crop_shape(banner_crop)),
  public_path   text not null check (public_path ~ '^categories/[a-z]+-[a-z0-9]+\.jpg$'),
  public_width  integer not null check (public_width > 0),
  public_height integer not null check (public_height > 0),
  updated_at    timestamptz not null default now(),
  updated_by    text
);

create index category_images_photo_id_idx on public.category_images (photo_id);

comment on table public.category_images is 'Admin-chosen photo for each Browse category card and category page header. Server only (api/admin-photos writes, api/species-photos?categories=1 reads).';
comment on column public.category_images.crop is 'Browse card crop {x, y, w, h}, fractions 0-1 of the image, at the card aspect (lib/categoryImages.js). Null: centred on the focus point.';
comment on column public.category_images.banner_crop is 'Category page header crop {x, y, w, h}, 2.4 : 1. Null: centred on the focus point.';
comment on column public.category_images.public_path is 'The category''s own public copy in species-photos, versioned per choice/replace so caches never serve a stale image.';

-- Same pattern as the other ATR tables: RLS on, no client access,
-- service_role DML only.
alter table public.category_images enable row level security;
create policy "no client access" on public.category_images as restrictive for all to anon, authenticated using (false) with check (false);
revoke all on table public.category_images from anon, authenticated, public;
revoke all on table public.category_images from service_role;
grant select, insert, update, delete on table public.category_images to service_role;
