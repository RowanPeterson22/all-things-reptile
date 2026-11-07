-- Applied to the atr project (ledcvbyiqkygcdleucqo) on 8 Nov 2026 via the Supabase MCP.
-- Morphs and traits for the AI ID, the feedback form and photo trait tags,
-- edited by Rowan in /admin → Morphs. Replaces the draft list in lib/morphs.js,
-- which stays only as the fallback seed when Supabase can't be reached.
--
-- morphs.id is the trait id stored in id_feedback.correct_traits,
-- id_feedback.ai_traits and reference_photos.traits, so it never changes once
-- created and a morph is soft-deleted (deleted_at) rather than removed: old
-- feedback and photo tags still resolve to a name.

create table public.morphs (
  id         text primary key check (char_length(id) between 1 and 60 and id ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name       text not null check (char_length(btrim(name)) between 1 and 80),
  cue        text not null check (char_length(btrim(cue)) between 1 and 500),
  au_status  text not null default 'check' check (au_status in ('established', 'check')),
  notes      text check (char_length(notes) <= 2000),
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
comment on table public.morphs is 'Hobby morphs, colour lines and visible traits. id is the trait id used in feedback and photo tags; soft delete only (deleted_at). Server only.';
comment on column public.morphs.cue is 'Visual description the AI ID uses to spot the trait.';
comment on column public.morphs.au_status is 'established = widely kept in the Australian hobby; check = Rowan to confirm it is in Australian collections.';

-- species_slug is any slug in src/data/australianSpecies.json (the index isn't
-- in the database, so the server validates it).
create table public.species_morphs (
  species_slug text not null check (char_length(species_slug) between 1 and 100 and species_slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  morph_id     text not null references public.morphs (id) on update restrict on delete cascade,
  cue_override text check (cue_override is null or char_length(btrim(cue_override)) between 1 and 500),
  sort         int not null default 100,
  created_at   timestamptz not null default now(),
  primary key (species_slug, morph_id)
);
comment on table public.species_morphs is 'Which morphs apply to which species (index slugs), with an optional per-species visual cue. Server only.';
create index species_morphs_morph_id_idx on public.species_morphs (morph_id);

-- updated_at on every edit.
create or replace function public.morphs_touch_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  return new;
end;
$$;
create trigger morphs_touch_updated_at before update on public.morphs
  for each row execute function public.morphs_touch_updated_at();
revoke all on function public.morphs_touch_updated_at() from public, anon, authenticated;

-- Same pattern as the other atr tables: RLS on, explicit deny for client
-- roles, no client grants, service_role DML only.
alter table public.morphs enable row level security;
alter table public.species_morphs enable row level security;
create policy "no client access" on public.morphs as restrictive for all to anon, authenticated using (false) with check (false);
create policy "no client access" on public.species_morphs as restrictive for all to anon, authenticated using (false) with check (false);
revoke all on table public.morphs, public.species_morphs from anon, authenticated, public;
revoke all on table public.morphs, public.species_morphs from service_role;
grant select, insert, update, delete on table public.morphs, public.species_morphs to service_role;

-- Seed: lib/morphs.js as of 8 Nov 2026 (23 morphs, 40 species links).
-- App slugs and index slugs are identical for the 46 app species.
insert into public.morphs (id, name, cue, au_status, notes) values
  ('hypomelanistic', 'Hypomelanistic', 'Clear or pale nails (not dark) and washed-out dark pigment; overall lighter, brighter colour.', 'established', 'Draft list marked AU status "check" for: pygmy-bearded-dragon, carpet-python, bredli-python.'),
  ('translucent', 'Translucent', 'Semi-see-through spines and scales; solid dark eyes; bluish belly in juveniles.', 'established', 'Draft list marked AU status "check" for: pygmy-bearded-dragon.'),
  ('leatherback', 'Leatherback', 'Much smaller, flatter back scales giving a smooth look; side spines kept but reduced.', 'established', 'Established: Rowan''s own dragon is a translucent leatherback (8 Nov 2026).'),
  ('silkback', 'Silkback', 'Almost no scales or spines; soft, smooth, often shiny skin (double-gene leatherback).', 'check', null),
  ('zero', 'Zero', 'No pattern at all; silver, grey or white body from hatching.', 'check', null),
  ('witblits', 'Witblits', 'Patternless from hatching; pale tan to off-white without the silver tone of a zero.', 'check', null),
  ('dunner', 'Dunner', 'Scales point in irregular directions; spikes splay out; pattern breaks into spots rather than lines.', 'check', null),
  ('paradox', 'Paradox', 'Random, sharply-edged patches of a different colour that don''t follow the normal pattern.', 'established', null),
  ('red', 'Red line', 'Deep red to red-orange colour through head, beard and body.', 'established', null),
  ('citrus', 'Citrus line', 'Bright lemon to lime-yellow colour, often strongest on the head and sides.', 'established', null),
  ('yellow', 'Yellow line', 'Strong golden-yellow colour without the greenish citrus tone or red.', 'established', null),
  ('albino', 'Albino', 'No black pigment: white to cream with yellow pattern and pink or red eyes (the Darwin carpet line).', 'established', 'Draft list marked AU status "check" for: jungle-carpet-python, bredli-python, water-python, eastern-blue-tongue-skink, northern-blue-tongue-skink.'),
  ('jaguar', 'Jaguar', 'High-contrast, broken or reduced pattern, often bright yellow on grey; developed from coastal carpets.', 'established', 'Draft list marked AU status "check" for: jungle-carpet-python.'),
  ('zebra', 'Zebra / banded', 'Pattern runs as distinct crossbands rather than blotches.', 'established', null),
  ('striped', 'Striped', 'Pattern forms long lines down the back rather than blotches or bands.', 'established', null),
  ('high-yellow', 'High yellow', 'Strong, bright yellow ground colour with crisp black (black-and-gold look).', 'established', 'Draft list marked AU status "check" for: diamond-python.'),
  ('intergrade', 'Diamond-coastal cross', 'Diamond-like rosettes mixed with coastal carpet blotching; browner than a pure diamond.', 'check', null),
  ('high-red', 'High red', 'Deep red to rust ground colour with bold cream pattern.', 'established', null),
  ('juvenile-yellow', 'Juvenile yellow phase', 'Bright yellow juvenile colouring before the change to green (normal for Australian animals).', 'established', null),
  ('blue-phase', 'Blue phase', 'Green with strong blue tones along the back or sides.', 'check', null),
  ('high-white', 'High white', 'Many more white scales than usual along the dorsal line.', 'check', null),
  ('pink-blotched', 'Pink / highland blotched', 'Pink to salmon blotches on dark brown (highland and Tasmanian forms).', 'established', null),
  ('high-colour', 'High colour', 'Bold yellow, orange or cream spotting on the dark body (locality colour, not a gene).', 'established', null)
on conflict (id) do nothing;

insert into public.species_morphs (species_slug, morph_id, cue_override, sort) values
  ('central-bearded-dragon', 'hypomelanistic', null, 10),
  ('central-bearded-dragon', 'translucent', null, 20),
  ('central-bearded-dragon', 'leatherback', null, 30),
  ('central-bearded-dragon', 'silkback', null, 40),
  ('central-bearded-dragon', 'zero', null, 50),
  ('central-bearded-dragon', 'witblits', null, 60),
  ('central-bearded-dragon', 'dunner', null, 70),
  ('central-bearded-dragon', 'paradox', null, 80),
  ('central-bearded-dragon', 'red', null, 90),
  ('central-bearded-dragon', 'citrus', null, 100),
  ('central-bearded-dragon', 'yellow', null, 110),
  ('pygmy-bearded-dragon', 'hypomelanistic', 'Clear or pale nails and reduced dark pigment; paler, cleaner body pattern.', 10),
  ('pygmy-bearded-dragon', 'translucent', 'Semi-see-through scales and solid dark eyes.', 20),
  ('carpet-python', 'albino', null, 10),
  ('carpet-python', 'jaguar', null, 20),
  ('carpet-python', 'zebra', null, 30),
  ('carpet-python', 'striped', null, 40),
  ('carpet-python', 'hypomelanistic', 'Reduced black pigment; browns and blacks look washed-out, pattern still visible.', 50),
  ('jungle-carpet-python', 'zebra', 'Clean black crossbands on yellow instead of the normal blotched pattern.', 10),
  ('jungle-carpet-python', 'striped', 'Long dorsal stripes rather than blotches or bands.', 20),
  ('jungle-carpet-python', 'high-yellow', null, 30),
  ('jungle-carpet-python', 'albino', 'No black pigment: white to cream with yellow pattern and pink or red eyes.', 40),
  ('jungle-carpet-python', 'jaguar', 'High-contrast, broken or reduced pattern (jungle-jaguar crosses).', 50),
  ('diamond-python', 'high-yellow', 'Unusually heavy yellow spotting and rosettes over the black.', 10),
  ('diamond-python', 'intergrade', null, 20),
  ('bredli-python', 'high-red', null, 10),
  ('bredli-python', 'albino', 'No black pigment: pale with cream pattern and pink or red eyes.', 20),
  ('bredli-python', 'hypomelanistic', 'Reduced dark pigment; softer, lighter reds and tans.', 30),
  ('water-python', 'albino', 'White to pale yellow body and pink or red eyes instead of the normal iridescent olive-black.', 10),
  ('green-tree-python', 'juvenile-yellow', null, 10),
  ('green-tree-python', 'blue-phase', null, 20),
  ('green-tree-python', 'high-white', null, 30),
  ('eastern-blue-tongue-skink', 'hypomelanistic', 'Pale, washed-out bands; little dark pigment around eyes and on the body.', 10),
  ('eastern-blue-tongue-skink', 'albino', 'No dark pigment at all: cream and pale orange with pink-red eyes.', 20),
  ('northern-blue-tongue-skink', 'hypomelanistic', 'Pale bands and little dark pigment; often bright orange-tan overall.', 10),
  ('northern-blue-tongue-skink', 'high-red', 'Strong orange to red ground colour between the bands.', 20),
  ('northern-blue-tongue-skink', 'albino', 'No dark pigment at all: cream and pale orange with pink-red eyes.', 30),
  ('blotched-blue-tongue-skink', 'pink-blotched', null, 10),
  ('shingleback-lizard', 'high-colour', null, 10),
  ('green-tree-frog', 'blue-phase', 'Sky-blue instead of green (lacks yellow pigment).', 10)
on conflict (species_slug, morph_id) do nothing;
