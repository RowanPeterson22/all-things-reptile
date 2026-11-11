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

const CACHE_MS = 30 * 1000;
const cache = new Map(); // slug → { at, doc }

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

const clearContentCache = () => cache.clear();

module.exports = { contentAccess, getPublished, clearContentCache, ContentError, CACHE_MS };
