// ─── Slim species index for the feedback picker ──────────────────
// Derives src/data/speciesPicker.json from src/data/australianSpecies.json:
// only the fields the type-ahead needs, with short keys, so the lazily-loaded
// chunk stays small on a phone. Regenerate with
//   node scripts/build-species-picker.mjs
// src/__tests__/speciesPicker.test.js fails if the two drift.
//
//   s  index slug          c  common name       n  scientific name
//   a  other names (otherCommon + synonyms; omitted when empty)
//   p  app slug (omitted unless it's one of the 46 app species)
//   v  1 if dangerously venomous (omitted otherwise)

const derivePickerIndex = (records) => records.map(r => {
  const alt = [...(r.otherCommon || []), ...(r.synonyms || [])].filter(Boolean);
  const out = { s: r.slug, c: r.common, n: r.scientific };
  if (alt.length) out.a = alt;
  if (r.appSlug) out.p = r.appSlug;
  if (r.dangerouslyVenomous) out.v = 1;
  return out;
});

module.exports = { derivePickerIndex };
