// ─── Server-only Supabase access (AI ID closed beta) ─────────────
// Talks to the `atr` project (ref ledcvbyiqkygcdleucqo) over plain fetch to
// PostgREST and Storage. No @supabase/supabase-js: we make four kinds of call,
// all server-side, and plain fetch keeps the functions dependency-free and
// trivially mockable in tests.
//
// Needs SUPABASE_URL and SUPABASE_SECRET_KEY (an sb_secret_… key, or the legacy
// service_role key). Both are server env vars only: never expose them to the
// client bundle (no REACT_APP_ prefix). The secret key bypasses RLS, which is
// the point: the tables have RLS on with no client access at all.
//
// Logging: status codes only. Never log keys, invite codes or photo data.

const BUCKET = "id-photos";

class SupabaseError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

// Returns { url, key } or null when either env var is missing.
const supabaseConfig = (env = process.env) => {
  const url = (env.SUPABASE_URL || "").trim().replace(/\/+$/, "");
  const key = (env.SUPABASE_SECRET_KEY || "").trim();
  if (!url || !key) return null;
  return { url, key };
};

const authHeaders = (key) => ({ apikey: key, Authorization: `Bearer ${key}` });

const call = async (cfg, path, init, fetchImpl, what) => {
  const doFetch = fetchImpl || globalThis.fetch;
  let res;
  try {
    res = await doFetch(`${cfg.url}${path}`, { ...init, headers: { ...authHeaders(cfg.key), ...(init.headers || {}) } });
  } catch (e) {
    console.error(`supabase: ${what} network error`);
    throw new SupabaseError(502, "Couldn't reach the beta service. Try again.");
  }
  if (!res.ok) {
    console.error(`supabase: ${what} returned ${res.status}`);
    throw new SupabaseError(502, "The beta service had a problem. Try again.");
  }
  return res;
};

// Active tester for an invite code, or null. Caller validates the code's shape first.
const findActiveTester = async (cfg, code, fetchImpl) => {
  const q = `select=id,name,sections,is_admin&invite_code=eq.${encodeURIComponent(code)}&active=is.true&limit=1`;
  const res = await call(cfg, `/rest/v1/beta_testers?${q}`, { method: "GET", headers: { Accept: "application/json" } }, fetchImpl, "tester lookup");
  const rows = await res.json().catch(() => null);
  const r = Array.isArray(rows) && rows[0];
  if (!r || !r.id) return null;
  // sections: pre-launch gate (lib/sections.js); admins get every section.
  return { id: r.id, name: r.name, sections: Array.isArray(r.sections) ? r.sections : ["id"], isAdmin: r.is_admin === true };
};

const insertFeedback = async (cfg, row, fetchImpl) => {
  await call(cfg, "/rest/v1/id_feedback", {
    method: "POST",
    headers: { "Content-Type": "application/json", Prefer: "return=minimal" },
    body: JSON.stringify(row),
  }, fetchImpl, "feedback insert");
};

// path is relative to the bucket, e.g. "<tester_id>/<uuid>.jpg".
const uploadPhoto = async (cfg, path, buffer, fetchImpl) => {
  await call(cfg, `/storage/v1/object/${BUCKET}/${path}`, {
    method: "POST",
    headers: { "Content-Type": "image/jpeg", "x-upsert": "false", "Cache-Control": "no-store" },
    body: buffer,
  }, fetchImpl, "photo upload");
};

const deletePhoto = async (cfg, path, fetchImpl) => {
  await call(cfg, `/storage/v1/object/${BUCKET}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prefixes: [path] }),
  }, fetchImpl, "photo delete");
};

module.exports = { supabaseConfig, findActiveTester, insertFeedback, uploadPhoto, deletePhoto, SupabaseError, BUCKET };
