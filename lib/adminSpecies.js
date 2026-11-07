// ─── Admin: species index, photo counts, morph list ──────────────
// The master index (src/data/australianSpecies.json, 1,363 natives) is read
// here, server-side, so it never goes into the public app bundle. The admin
// screens fetch it from /api/admin-species.
//
// Two slug spaces meet here:
//   index slug  reference_photos.species_slug (every native species)
//   app slug    the app's 46 (D4), used by lib/morphs.js and older id_feedback rows;
//               each maps to the index record whose appSlug matches.

const INDEX = require("../src/data/australianSpecies.json");
const { MORPHS } = require("./morphs");
const { rest } = require("./admin");

const BY_SLUG = Object.fromEntries(INDEX.map(r => [r.slug, r]));
const SLUGS = new Set(INDEX.map(r => r.slug));

// app slug → index slug. Prefer the record whose slug is the app slug itself.
const APP_TO_INDEX = {};
for (const r of INDEX) {
  if (!r.appSlug) continue;
  if (!APP_TO_INDEX[r.appSlug] || r.slug === r.appSlug) APP_TO_INDEX[r.appSlug] = r.slug;
}

const indexSlugForApp = (appSlug) => (typeof appSlug === "string" && APP_TO_INDEX[appSlug]) || null;

// Any feedback slug → index slug. From Nov 2026 id_feedback stores index
// slugs (e.g. jacky-dragon); older rows hold one of the 46 app slugs or the
// legacy "not-one-of-our-species" sentinel (→ null, the "Other" text applies).
const indexSlugFor = (slug) => {
  if (typeof slug !== "string" || !slug) return null;
  if (SLUGS.has(slug)) return slug;
  return indexSlugForApp(slug);
};

// → { [index slug]: { active, hidden, rejected, best } }
const photoCounts = async (cfg) => {
  const rows = await rest(cfg, "rpc/admin_photo_counts", { method: "POST", body: "{}" }, "photo counts");
  const out = {};
  for (const r of rows || []) {
    out[r.species_slug] = { active: Number(r.active) || 0, hidden: Number(r.hidden) || 0, rejected: Number(r.rejected) || 0, best: Number(r.best) || 0 };
  }
  return out;
};

// GET → everything; GET ?only=counts → just the counts (cheap refresh after edits).
const getSpecies = async ({ cfg, query = {} }) => {
  const counts = await photoCounts(cfg);
  if (query.only === "counts") return { status: 200, body: { counts } };
  return { status: 200, body: { species: INDEX, counts, morphs: MORPHS } };
};

module.exports = { INDEX, BY_SLUG, SLUGS, APP_TO_INDEX, indexSlugForApp, indexSlugFor, photoCounts, getSpecies };
