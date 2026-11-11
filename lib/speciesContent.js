// ─── Species content, server side (D5) ────────────────────────────
// The published species documents in species_content (atr project), read with
// the secret key (the table has no client access), checked against the shared
// shape (src/data/speciesContentShape.js) so a malformed document never
// reaches a page, and cached briefly per instance. Served by
// GET /api/species-photos?content=<slug>.
//
// Gate rule: before launch (ATR_PUBLIC isn't "true") /api/* bypasses the
// middleware, so this content would leak around the pre-launch gate. Only a
// valid atr_gate cookie (lib/gate.js) or a valid tester code (x-atr-beta,
// checked against beta_testers) may read it; anyone else gets 401. Under
// `vercel dev` with no ATR_GATE_SECRET the gate is open, as in middleware.js.

const gate = require("./gate");
const { requireTester, HEADER } = require("./beta");
const { validateDoc } = require("../src/data/speciesContentShape.js");

// How fresh the app is after Publish in /admin (D5 step 2: "within about a
// minute"). Each layer can hold the old copy for at most:
//   this instance cache        15 s
//   Vercel's edge (public)     15 s fresh + 15 s stale-while-revalidate
//   the browser (HTTP)         15 s
//   the app's in-tab cache     15 s (src/data/speciesContent.js, LIST_TTL_MS)
// Gated (today): ≤ 45 s worst case; public: ≤ 75 s; usually well under 30 s.
// A page already on screen updates the next time it's opened.
const CACHE_MS = 15 * 1000;
const CACHE_CONTROL = {
  gated: "private, max-age=15",
  public: "public, max-age=15, s-maxage=15, stale-while-revalidate=15",
};
const cache = new Map(); // slug → { at, doc }
let listCache = null;    // { at, list }

class ContentError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}

// → { ok: true, via: "public" | "dev" | "cookie" | "tester" } or { ok: false, status, error }
const contentAccess = async (req, { env = process.env, fetchImpl } = {}) => {
  const mode = gate.gateMode(env);
  if (mode.isPublic) return { ok: true, via: "public" };
  if (!mode.secretSet && mode.dev) return { ok: true, via: "dev" };
  if (mode.secretSet) {
    const cookies = gate.parseCookies(req.headers && req.headers.cookie);
    if (cookies[gate.COOKIE] && await gate.verifyToken(cookies[gate.COOKIE], mode.secret)) return { ok: true, via: "cookie" };
  }
  const code = req.headers && req.headers[HEADER];
  if (typeof code === "string" && code.trim()) {
    const result = await requireTester(req, { env, fetchImpl });
    if (result.tester) return { ok: true, via: "tester" };
    if (result.status >= 500) return { ok: false, status: result.status, error: result.body && result.body.error };
  }
  return { ok: false, status: 401, error: "Sign in with your invite link to see this." };
};

// The published document for a slug, or null if there's none (or it fails
// the shape). Throws ContentError(502) when Supabase can't be read.
const getPublished = async (cfg, slug, { fetchImpl, useCache = true } = {}) => {
  const hit = useCache && cache.get(slug);
  if (hit && Date.now() - hit.at < CACHE_MS) return hit.doc;
  const doFetch = fetchImpl || globalThis.fetch;
  let res;
  try {
    res = await doFetch(`${cfg.url}/rest/v1/species_content?select=published&slug=eq.${encodeURIComponent(slug)}&limit=1`, {
      method: "GET", headers: { apikey: cfg.key, Authorization: `Bearer ${cfg.key}`, Accept: "application/json" },
    });
  } catch (e) {
    console.error("species content: network error");
    throw new ContentError(502, "Species content is unavailable right now.");
  }
  if (!res.ok) {
    console.error(`species content: read returned ${res.status}`);
    throw new ContentError(502, "Species content is unavailable right now.");
  }
  const rows = await res.json().catch(() => null);
  const doc = Array.isArray(rows) && rows[0] ? rows[0].published : null;
  let good = null;
  if (doc && doc.slug === slug) {
    const errors = validateDoc(doc);
    if (errors.length) console.error(`species content: ${slug} failed the shape check (${errors.length} problems)`);
    else good = doc;
  }
  if (cache.size > 200) cache.clear();
  cache.set(slug, { at: Date.now(), doc: good });
  return good;
};

// Every published document that passes the shape → the identity fields the
// app's lists use (Browse, Search, page titles). Fills the per-slug cache too.
const LIST_FIELDS = ["slug", "id", "name", "latin", "aka", "type", "level", "emoji", "sortOrder"];
const getPublishedList = async (cfg, { fetchImpl, useCache = true } = {}) => {
  if (useCache && listCache && Date.now() - listCache.at < CACHE_MS) return listCache.list;
  const doFetch = fetchImpl || globalThis.fetch;
  let res;
  try {
    res = await doFetch(`${cfg.url}/rest/v1/species_content?select=slug,published&order=sort_order.asc,slug.asc`, {
      method: "GET", headers: { apikey: cfg.key, Authorization: `Bearer ${cfg.key}`, Accept: "application/json" },
    });
  } catch (e) {
    console.error("species list: network error");
    throw new ContentError(502, "Species content is unavailable right now.");
  }
  if (!res.ok) {
    console.error(`species list: read returned ${res.status}`);
    throw new ContentError(502, "Species content is unavailable right now.");
  }
  const rows = await res.json().catch(() => null);
  const list = [];
  const now = Date.now();
  for (const r of Array.isArray(rows) ? rows : []) {
    const doc = r && r.published;
    const good = doc && doc.slug === r.slug && validateDoc(doc).length === 0 ? doc : null;
    if (r && r.slug) cache.set(r.slug, { at: now, doc: good });
    if (good) list.push(Object.fromEntries(LIST_FIELDS.map(k => [k, good[k] === undefined ? null : good[k]])));
  }
  listCache = { at: now, list };
  return list;
};

const clearContentCache = () => { cache.clear(); listCache = null; };

module.exports = { contentAccess, getPublished, getPublishedList, clearContentCache, ContentError, CACHE_MS, CACHE_CONTROL, LIST_FIELDS };
