// ─── Fallback morph seed ──────────────────────────────────────────
// The database is now the source of truth: morphs live in the atr Supabase
// project (tables morphs and species_morphs) and Rowan edits them in
// /admin → Morphs. lib/morphStore.js loads them for the AI ID prompt, the
// feedback form and photo trait tags, and only falls back to this file when
// Supabase can't be reached. This is also the list the tables were seeded
// from (supabase/migrations/20261107233642_morphs.sql); it is not kept in
// sync with later edits, so don't edit it to change what the app shows.
//
// Server-only: never bundled into the public app.
//
// `au`: "established" (widely kept in the Australian hobby) or "check"
// (to confirm it is in Australian collections). Ids are lower-case and
// hyphenated, and the same id means the same trait in every species. Traits
// combine, e.g. hypomelanistic + translucent ("hypo trans"). Leatherback is
// established: Rowan's own dragon is a translucent leatherback. Species keys are
// app slugs (D4), identical to the index slugs for the 46 app species.

const MORPHS = {
  "central-bearded-dragon": [
    { id: "hypomelanistic", name: "Hypomelanistic", au: "established", cue: "Clear or pale nails (not dark) and washed-out dark pigment; overall lighter, brighter colour." },
    { id: "translucent",    name: "Translucent",    au: "established", cue: "Semi-see-through spines and scales; solid dark eyes; bluish belly in juveniles." },
    { id: "leatherback",    name: "Leatherback",    au: "established", cue: "Much smaller, flatter back scales giving a smooth look; side spines kept but reduced." },
    { id: "silkback",       name: "Silkback",       au: "check",       cue: "Almost no scales or spines; soft, smooth, often shiny skin (double-gene leatherback)." },
    { id: "zero",           name: "Zero",           au: "check",       cue: "No pattern at all; silver, grey or white body from hatching." },
    { id: "witblits",       name: "Witblits",       au: "check",       cue: "Patternless from hatching; pale tan to off-white without the silver tone of a zero." },
    { id: "dunner",         name: "Dunner",         au: "check",       cue: "Scales point in irregular directions; spikes splay out; pattern breaks into spots rather than lines." },
    { id: "paradox",        name: "Paradox",        au: "established", cue: "Random, sharply-edged patches of a different colour that don't follow the normal pattern." },
    { id: "red",            name: "Red line",       au: "established", cue: "Deep red to red-orange colour through head, beard and body." },
    { id: "citrus",         name: "Citrus line",    au: "established", cue: "Bright lemon to lime-yellow colour, often strongest on the head and sides." },
    { id: "yellow",         name: "Yellow line",    au: "established", cue: "Strong golden-yellow colour without the greenish citrus tone or red." },
  ],
  "pygmy-bearded-dragon": [
    { id: "hypomelanistic", name: "Hypomelanistic", au: "check", cue: "Clear or pale nails and reduced dark pigment; paler, cleaner body pattern." },
    { id: "translucent",    name: "Translucent",    au: "check", cue: "Semi-see-through scales and solid dark eyes." },
  ],
  "carpet-python": [
    { id: "albino",   name: "Albino",                au: "established", cue: "No black pigment: white to cream with yellow pattern and pink or red eyes (the Darwin carpet line)." },
    { id: "jaguar",   name: "Jaguar",                au: "established", cue: "High-contrast, broken or reduced pattern, often bright yellow on grey; developed from coastal carpets." },
    { id: "zebra",    name: "Zebra / banded",        au: "established", cue: "Pattern runs as distinct crossbands rather than blotches." },
    { id: "striped",  name: "Striped",               au: "established", cue: "Pattern forms long lines down the back rather than blotches or bands." },
    { id: "hypomelanistic", name: "Hypomelanistic",  au: "check",       cue: "Reduced black pigment; browns and blacks look washed-out, pattern still visible." },
  ],
  "jungle-carpet-python": [
    { id: "zebra",       name: "Zebra / banded",   au: "established", cue: "Clean black crossbands on yellow instead of the normal blotched pattern." },
    { id: "striped",     name: "Striped",          au: "established", cue: "Long dorsal stripes rather than blotches or bands." },
    { id: "high-yellow", name: "High yellow",      au: "established", cue: "Strong, bright yellow ground colour with crisp black (black-and-gold look)." },
    { id: "albino",      name: "Albino",           au: "check",       cue: "No black pigment: white to cream with yellow pattern and pink or red eyes." },
    { id: "jaguar",      name: "Jaguar",           au: "check",       cue: "High-contrast, broken or reduced pattern (jungle-jaguar crosses)." },
  ],
  "diamond-python": [
    { id: "high-yellow", name: "High yellow",          au: "check", cue: "Unusually heavy yellow spotting and rosettes over the black." },
    { id: "intergrade",  name: "Diamond-coastal cross", au: "check", cue: "Diamond-like rosettes mixed with coastal carpet blotching; browner than a pure diamond." },
  ],
  "bredli-python": [
    { id: "high-red",       name: "High red",       au: "established", cue: "Deep red to rust ground colour with bold cream pattern." },
    { id: "albino",         name: "Albino",         au: "check",       cue: "No black pigment: pale with cream pattern and pink or red eyes." },
    { id: "hypomelanistic", name: "Hypomelanistic", au: "check",       cue: "Reduced dark pigment; softer, lighter reds and tans." },
  ],
  "water-python": [
    { id: "albino", name: "Albino", au: "check", cue: "White to pale yellow body and pink or red eyes instead of the normal iridescent olive-black." },
  ],
  "green-tree-python": [
    { id: "juvenile-yellow", name: "Juvenile yellow phase", au: "established", cue: "Bright yellow juvenile colouring before the change to green (normal for Australian animals)." },
    { id: "blue-phase",      name: "Blue phase",           au: "check",       cue: "Green with strong blue tones along the back or sides." },
    { id: "high-white",      name: "High white",           au: "check",       cue: "Many more white scales than usual along the dorsal line." },
  ],
  "eastern-blue-tongue-skink": [
    { id: "hypomelanistic", name: "Hypomelanistic", au: "established", cue: "Pale, washed-out bands; little dark pigment around eyes and on the body." },
    { id: "albino",         name: "Albino",         au: "check",       cue: "No dark pigment at all: cream and pale orange with pink-red eyes." },
  ],
  "northern-blue-tongue-skink": [
    { id: "hypomelanistic", name: "Hypomelanistic", au: "established", cue: "Pale bands and little dark pigment; often bright orange-tan overall." },
    { id: "high-red",       name: "High red",       au: "established", cue: "Strong orange to red ground colour between the bands." },
    { id: "albino",         name: "Albino",         au: "check",       cue: "No dark pigment at all: cream and pale orange with pink-red eyes." },
  ],
  "blotched-blue-tongue-skink": [
    { id: "pink-blotched", name: "Pink / highland blotched", au: "established", cue: "Pink to salmon blotches on dark brown (highland and Tasmanian forms)." },
  ],
  "shingleback-lizard": [
    { id: "high-colour", name: "High colour", au: "established", cue: "Bold yellow, orange or cream spotting on the dark body (locality colour, not a gene)." },
  ],
  "green-tree-frog": [
    { id: "blue-phase", name: "Blue phase", au: "check", cue: "Sky-blue instead of green (lacks yellow pigment)." },
  ],
};

// Every trait id once, with its name.
const TRAITS = {};
for (const list of Object.values(MORPHS)) {
  for (const t of list) if (!TRAITS[t.id]) TRAITS[t.id] = { id: t.id, name: t.name };
}
const TRAIT_IDS = Object.keys(TRAITS);

// The seed as database rows, the same shape lib/morphStore.js reads from
// Supabase: one morph row per id (its first cue; "established" if any species
// had it so) and one link per species, with a cue_override where that
// species' cue differs.
const seedRows = () => {
  const morphs = new Map();
  const links = [];
  for (const [slug, list] of Object.entries(MORPHS)) {
    list.forEach((t, i) => {
      if (!morphs.has(t.id)) morphs.set(t.id, { id: t.id, name: t.name, cue: t.cue, au_status: "check", notes: null, deleted_at: null });
      const m = morphs.get(t.id);
      if (t.au === "established") m.au_status = "established";
      links.push({ species_slug: slug, morph_id: t.id, cue_override: t.cue === m.cue ? null : t.cue, sort: (i + 1) * 10 });
    });
  }
  return { morphs: [...morphs.values()], links };
};

module.exports = { MORPHS, TRAITS, TRAIT_IDS, seedRows };
