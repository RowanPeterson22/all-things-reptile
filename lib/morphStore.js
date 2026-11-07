// ─── Morph store (server only) ────────────────────────────────────
// Morphs and their species links live in the atr Supabase project (tables
// morphs and species_morphs) and are edited in /admin → Morphs. This loads
// them for the AI ID prompt and schema (lib/identify.js), the feedback form
// (/api/beta-check) and feedback validation (lib/feedback.js).
//
// Cached in memory for CACHE_MS per function instance, so an edit reaches the
// next ID within about a minute. If Supabase can't be reached, the last good
// copy is kept; with none, lib/morphs.js (the original seed) stands in. A
// failed load is retried after RETRY_MS rather than on every request.
//
// A snapshot:
//   source      "db" | "fallback"
//   all         { [id]: { id, name, cue, au, notes, deletedAt } }  every morph,
//               deleted ones too, so old feedback and photo tags keep a name
//   activeIds   Set of morph ids that aren't deleted
//   bySpecies   { [index slug]: [{ id, name, cue, au }] }  active morphs only,
//               with the per-species cue where one is set, in sort order
//   traitIds    sorted ids of every active morph assigned to a species (the
//               output schema enum)
//
// Lives outside api/ so Vercel doesn't deploy it as a function.

const { seedRows } = require("./morphs");
const { SLUGS } = require("./speciesIndex");
const { supabaseConfig } = require("./supabase");

const CACHE_MS = 60 * 1000;
const RETRY_MS = 15 * 1000;

const MORPH_COLUMNS = "id,name,cue,au_status,notes,deleted_at,created_at,updated_at";
const LINK_COLUMNS = "species_slug,morph_id,cue_override,sort";

// Single-line text for the prompt: collapse any whitespace run to one space.
const oneLine = (v) => (typeof v === "string" ? v.replace(/\s+/g, " ").trim() : "");

const isRow = (r) => r && typeof r === "object" && typeof r.id === "string" && r.id && typeof r.name === "string" && typeof r.cue === "string";
const isLink = (l) => l && typeof l === "object" && typeof l.species_slug === "string" && typeof l.morph_id === "string";

// { morphs: rows, links: rows } → snapshot. Unknown species slugs and links
// to unknown or deleted morphs are skipped.
const buildSnapshot = ({ morphs = [], links = [] } = {}, source = "db") => {
  const all = {};
  const activeIds = new Set();
  for (const r of morphs) {
    if (!isRow(r)) continue;
    all[r.id] = {
      id: r.id, name: oneLine(r.name), cue: oneLine(r.cue),
      au: r.au_status === "established" ? "established" : "check",
      notes: r.notes || null, deletedAt: r.deleted_at || null,
    };
    if (!r.deleted_at) activeIds.add(r.id);
  }
  const grouped = {};
  for (const l of links) {
    if (!isLink(l) || !SLUGS.has(l.species_slug) || !activeIds.has(l.morph_id)) continue;
    (grouped[l.species_slug] = grouped[l.species_slug] || []).push(l);
  }
  const bySpecies = {};
  const assigned = new Set();
  for (const slug of Object.keys(grouped).sort()) {
    const list = grouped[slug].sort((a, b) => (Number(a.sort) || 0) - (Number(b.sort) || 0) || a.morph_id.localeCompare(b.morph_id));
    bySpecies[slug] = list.map(l => {
      const m = all[l.morph_id];
      assigned.add(m.id);
      return { id: m.id, name: m.name, cue: oneLine(l.cue_override) || m.cue, au: m.au };
    });
  }
  return { source, all, activeIds, bySpecies, traitIds: [...assigned].sort() };
};

let fallbackCache = null;
const fallbackSnapshot = () => {
  if (!fallbackCache) fallbackCache = buildSnapshot(seedRows(), "fallback");
  return fallbackCache;
};

// Both tables straight from PostgREST. Throws on any failure.
const fetchRows = async (cfg, fetchImpl) => {
  const doFetch = fetchImpl || globalThis.fetch;
  const get = async (path) => {
    const res = await doFetch(`${cfg.url}/rest/v1/${path}`, {
      method: "GET",
      headers: { apikey: cfg.key, Authorization: `Bearer ${cfg.key}`, Accept: "application/json" },
    });
    if (!res || !res.ok) throw new Error(`morphs: ${res ? res.status : "no"} response`);
    const rows = await res.json();
    if (!Array.isArray(rows)) throw new Error("morphs: unexpected reply");
    return rows;
  };
  const [morphs, links] = await Promise.all([
    get(`morphs?select=${MORPH_COLUMNS}&order=id`),
    get(`species_morphs?select=${LINK_COLUMNS}&order=species_slug,sort,morph_id`),
  ]);
  return { morphs, links };
};

// ─── The cache ────────────────────────────────────────────────────
const createMorphStore = ({ cacheMs = CACHE_MS, retryMs = RETRY_MS, now = () => Date.now() } = {}) => {
  let snap = null;        // last snapshot served
  let lastGood = null;    // last snapshot that came from the database
  let expires = 0;
  let inflight = null;

  // opts: { cfg, env, fetchImpl }. Never throws.
  const get = async ({ cfg, env, fetchImpl } = {}) => {
    if (snap && now() < expires) return snap;
    if (inflight) return inflight;
    const conf = cfg || supabaseConfig(env);
    if (!conf) {
      snap = fallbackSnapshot();
      expires = now() + cacheMs;
      return snap;
    }
    inflight = (async () => {
      try {
        lastGood = buildSnapshot(await fetchRows(conf, fetchImpl), "db");
        snap = lastGood;
        expires = now() + cacheMs;
      } catch (e) {
        console.error("morphStore: couldn't load morphs, using the last good copy or the seed");
        snap = lastGood || fallbackSnapshot();
        expires = now() + retryMs;
      } finally {
        inflight = null;
      }
      return snap;
    })();
    return inflight;
  };

  // After an admin edit: the next get() on this instance reloads.
  const invalidate = () => { expires = 0; };
  const clear = () => { snap = null; lastGood = null; expires = 0; inflight = null; };
  return { get, invalidate, clear };
};

const defaultStore = createMorphStore();

module.exports = {
  createMorphStore, buildSnapshot, fallbackSnapshot, fetchRows,
  getMorphs: defaultStore.get, invalidateMorphs: defaultStore.invalidate, clearMorphCache: defaultStore.clear,
  CACHE_MS, RETRY_MS, MORPH_COLUMNS, LINK_COLUMNS,
};
