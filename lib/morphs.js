// ═══════════════════════════════════════════════════════════════════
//  DRAFT FOR ROWAN'S REVIEW — not signed off. Do not treat as fact.
// ═══════════════════════════════════════════════════════════════════
// Common Australian-hobby morphs, colour lines and visible traits, by species,
// with a one-line visual cue each. Fed to the AI ID prompt (lib/identify.js)
// and sent to beta testers' feedback form by /api/beta-check. Server-only: it
// is never bundled into the public app.
//
// `au` marks how sure the draft is that the line is genuinely kept in Australia:
//   "established" — widely kept and sold in the Australian hobby
//   "check"       — Rowan to confirm it exists in Australian collections
//                   (some of these are overseas lines that may not be here)
// Remove anything that isn't really in Australian collections; Australia has
// no live reptile imports, so overseas-only lines must not be suggested.
//
// Rules: ids are lower-case and hyphenated; the same id means the same trait
// in every species (and must carry the same name). Traits can combine, e.g.
// hypomelanistic + translucent ("hypo trans"), so the AI may return several.
// Species keys are the app slugs (D4) from lib/identifySpecies.js.

const MORPHS = {
  "central-bearded-dragon": [
    { id: "hypomelanistic", name: "Hypomelanistic", au: "established", cue: "Clear or pale nails (not dark) and washed-out dark pigment; overall lighter, brighter colour." },
    { id: "translucent",    name: "Translucent",    au: "established", cue: "Semi-see-through spines and scales; solid dark eyes; bluish belly in juveniles." },
    { id: "leatherback",    name: "Leatherback",    au: "check",       cue: "Much smaller, flatter back scales giving a smooth look; side spines kept but reduced." },
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

// Every trait id once, with its name (used for the output schema enum).
const TRAITS = {};
for (const list of Object.values(MORPHS)) {
  for (const t of list) if (!TRAITS[t.id]) TRAITS[t.id] = { id: t.id, name: t.name };
}
const TRAIT_IDS = Object.keys(TRAITS);

// One prompt line per trait, grouped by species.
const promptLines = () => Object.entries(MORPHS)
  .map(([slug, list]) => `${slug}:\n${list.map(t => `  - ${t.id} (${t.name}): ${t.cue}`).join("\n")}`)
  .join("\n");

module.exports = { MORPHS, TRAITS, TRAIT_IDS, promptLines };
