// ─── Australian species index, server side ───────────────────────
// Loads src/data/australianSpecies.json (1,363 native reptiles and frogs, plus
// the four app taxa that aren't species) for the AI ID prompt, for mapping the
// model's answers back to records, and for validating feedback slugs.
// Lives outside api/ so Vercel doesn't deploy it as a function. The browser
// never loads this file: the feedback picker lazily imports the slim
// src/data/speciesPicker.json instead (scripts/build-species-picker.mjs).

const RECORDS = require("../src/data/australianSpecies.json");

// Lower-case, strip accents and punctuation, collapse spaces. "Nephrurus spp."
// and "Nephrurus sp" both become "nephrurus".
const norm = (v) => (typeof v === "string" ? v : "")
  .normalize("NFD").replace(/[̀-ͯ]/g, "")
  .toLowerCase()
  .replace(/[’']/g, "")
  .replace(/[^a-z0-9]+/g, " ")
  .replace(/\b(spp|sp|cf|aff)\b/g, " ")
  .replace(/\s+/g, " ")
  .trim();

const BY_SLUG = new Map();
const BY_SCIENTIFIC = new Map();   // current scientific name
const BY_SYNONYM = new Map();      // older scientific names
const BY_COMMON = new Map();       // common + otherCommon; only names that map to one record
const commonClash = new Set();

for (const r of RECORDS) {
  BY_SLUG.set(r.slug, r);
  BY_SCIENTIFIC.set(norm(r.scientific), r);
}
for (const r of RECORDS) {
  for (const syn of r.synonyms || []) {
    const k = norm(syn);
    if (k && !BY_SCIENTIFIC.has(k) && !BY_SYNONYM.has(k)) BY_SYNONYM.set(k, r);
  }
  for (const name of [r.common, ...(r.otherCommon || [])]) {
    const k = norm(name);
    if (!k) continue;
    if (BY_COMMON.has(k) && BY_COMMON.get(k) !== r) commonClash.add(k);
    else BY_COMMON.set(k, r);
  }
}
for (const k of commonClash) BY_COMMON.delete(k);

const slugish = (v) => norm(v).replace(/ /g, "-");

// Find the index record for a model answer. Tries, in order: slug, scientific
// name, synonym, the binomial of a trinomial the index doesn't list
// ("Tiliqua scincoides scincoides" → Tiliqua scincoides), then an unambiguous
// common name. Returns { record, via } or null.
const findRecord = ({ slug, scientific, common } = {}) => {
  const s = slugish(slug);
  if (s && BY_SLUG.has(s)) return { record: BY_SLUG.get(s), via: "slug" };
  const sci = norm(scientific);
  if (sci) {
    if (BY_SCIENTIFIC.has(sci)) return { record: BY_SCIENTIFIC.get(sci), via: "scientific" };
    if (BY_SYNONYM.has(sci)) return { record: BY_SYNONYM.get(sci), via: "synonym" };
    const parts = sci.split(" ");
    if (parts.length > 2) {
      const bi = parts.slice(0, 2).join(" ");
      if (BY_SCIENTIFIC.has(bi)) return { record: BY_SCIENTIFIC.get(bi), via: "scientific" };
      if (BY_SYNONYM.has(bi)) return { record: BY_SYNONYM.get(bi), via: "synonym" };
    }
  }
  const c = norm(common);
  if (c && BY_COMMON.has(c)) return { record: BY_COMMON.get(c), via: "common" };
  return null;
};

// ─── Prompt list ──────────────────────────────────────────────────
// One line per record, "Common name|Scientific name" (just the scientific name
// when there's no common name), under a header per group. No slugs, families,
// states or app flags: the model weighs every species the same, and the list
// stays around 16k tokens so it caches cheaply. Sorted, so the cached prefix
// is byte-identical on every request.
const GROUP_ORDER = [
  "elapid", "sea-snake", "python", "colubrid", "file-snake", "blind-snake",
  "dragon", "monitor", "skink", "gecko", "legless-lizard",
  "turtle", "sea-turtle", "crocodile", "frog",
];
const GROUP_LABEL = {
  elapid: "Elapid snakes (land)", "sea-snake": "Sea snakes", python: "Pythons", colubrid: "Colubrid and homalopsid snakes",
  "file-snake": "File snakes", "blind-snake": "Blind snakes", dragon: "Dragons", monitor: "Monitors", skink: "Skinks",
  gecko: "Geckos", "legless-lizard": "Legless lizards", turtle: "Freshwater turtles", "sea-turtle": "Sea turtles",
  crocodile: "Crocodiles", frog: "Frogs",
};

const promptLine = (r) => (norm(r.common) === norm(r.scientific) ? r.scientific : `${r.common}|${r.scientific}`);

const speciesPromptList = () => {
  const groups = [...new Set([...GROUP_ORDER, ...RECORDS.map(r => r.group)])];
  return groups
    .map(g => {
      const rs = RECORDS.filter(r => r.group === g).sort((a, b) => a.scientific.localeCompare(b.scientific, "en"));
      return rs.length ? `## ${GROUP_LABEL[g] || g}\n${rs.map(promptLine).join("\n")}` : null;
    })
    .filter(Boolean)
    .join("\n");
};

const SLUGS = new Set(BY_SLUG.keys());
const byAppSlug = (appSlug) => RECORDS.find(r => r.appSlug === appSlug) || null;

module.exports = { RECORDS, SLUGS, BY_SLUG, findRecord, speciesPromptList, byAppSlug, norm, GROUP_ORDER };
