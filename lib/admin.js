// ─── Admin section: gate, Supabase helpers, route wrapper ────────
// Interim access until the ATR login (D7): an admin is an active beta tester
// with is_admin = true in the atr project. Every api/admin-* route goes through
// adminRoute(), which checks the x-atr-beta code against Supabase on every
// request (no cache, so removing the flag takes effect at once) or returns 403.
//
// Server only. Talks to PostgREST and Storage over plain fetch with the secret
// key, the same way lib/supabase.js does. Never log keys, invite codes or photos.
// Lives outside api/ so Vercel doesn't deploy it as a function.

const { supabaseConfig, SupabaseError } = require("./supabase");
const { HEADER, CODE_RE, NOT_SET_UP, FORBIDDEN } = require("./beta");

class AdminError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}
const fail = (status, message) => { throw new AdminError(status, message); };

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

// ─── Supabase over fetch ──────────────────────────────────────────
const authHeaders = (key) => ({ apikey: key, Authorization: `Bearer ${key}` });

// Returns the Response. Non-2xx → SupabaseError: 409 passes through (unique
// clashes mean "already there"), 404 too for storage reads; the rest are 502.
const request = async (cfg, path, init = {}, what = "request") => {
  const doFetch = globalThis.fetch;
  let res;
  try {
    res = await doFetch(`${cfg.url}${path}`, { ...init, headers: { ...authHeaders(cfg.key), ...(init.headers || {}) } });
  } catch (e) {
    console.error(`admin: ${what} network error`);
    throw new SupabaseError(502, "Couldn't reach the database. Try again.");
  }
  if (!res.ok) {
    console.error(`admin: ${what} returned ${res.status}`);
    if (res.status === 409) throw new SupabaseError(409, "That already exists.");
    if (res.status === 404) throw new SupabaseError(404, "Not found.");
    throw new SupabaseError(502, "The database had a problem. Try again.");
  }
  return res;
};

const readJson = async (res) => {
  if (res.status === 204) return null;
  const text = await res.text();
  return text ? JSON.parse(text) : null;
};

// PostgREST. path is after /rest/v1/, e.g. "beta_testers?select=id".
const rest = async (cfg, path, init = {}, what = "rest") => {
  const res = await request(cfg, `/rest/v1/${path}`, {
    ...init,
    headers: { Accept: "application/json", ...(init.body ? { "Content-Type": "application/json" } : {}), ...(init.headers || {}) },
  }, what);
  return readJson(res);
};

const encPath = (p) => String(p).split("/").map(encodeURIComponent).join("/");

const storage = {
  get: async (cfg, bucket, path) => {
    const res = await request(cfg, `/storage/v1/object/${bucket}/${encPath(path)}`, { method: "GET" }, "storage get");
    return Buffer.from(await res.arrayBuffer());
  },
  put: async (cfg, bucket, path, buf, { upsert = false } = {}) => {
    await request(cfg, `/storage/v1/object/${bucket}/${encPath(path)}`, {
      method: "POST",
      headers: { "Content-Type": "image/jpeg", "x-upsert": upsert ? "true" : "false", "Cache-Control": "no-store" },
      body: buf,
    }, "storage put");
  },
  move: async (cfg, bucket, from, to) => {
    await request(cfg, "/storage/v1/object/move", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bucketId: bucket, sourceKey: from, destinationKey: to }),
    }, "storage move");
  },
  remove: async (cfg, bucket, path) => {
    await request(cfg, `/storage/v1/object/${bucket}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prefixes: [path] }),
    }, "storage delete");
  },
  // Short-lived signed URLs (default 10 min). → { [path]: url }
  sign: async (cfg, bucket, paths, expiresIn = 600) => {
    const list = [...new Set(paths.filter(Boolean))];
    if (!list.length) return {};
    const res = await request(cfg, `/storage/v1/object/sign/${bucket}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ expiresIn, paths: list }),
    }, "storage sign");
    const rows = (await readJson(res)) || [];
    const out = {};
    for (const r of rows) {
      const signed = r && (r.signedURL || r.signedUrl);
      if (!r || !r.path || !signed) continue;
      out[r.path] = /^https?:/.test(signed) ? signed
        : `${cfg.url}${signed.startsWith("/storage/v1") ? "" : "/storage/v1"}${signed}`;
    }
    return out;
  },
};

// ─── The gate ─────────────────────────────────────────────────────
// → { admin: { id, name }, cfg } or { status, body }.
const requireAdmin = async (req, { env = process.env } = {}) => {
  const cfg = supabaseConfig(env);
  if (!cfg) return { status: 503, body: { error: NOT_SET_UP } };
  const v = req && req.headers ? req.headers[HEADER] : undefined;
  const code = typeof v === "string" ? v.trim() : "";
  if (!CODE_RE.test(code)) return { status: 403, body: { error: FORBIDDEN } };
  try {
    const rows = await rest(cfg, `beta_testers?select=id,name&invite_code=eq.${encodeURIComponent(code)}&active=is.true&is_admin=is.true&limit=1`, { method: "GET" }, "admin lookup");
    const row = Array.isArray(rows) && rows[0];
    if (!row || !row.id) return { status: 403, body: { error: FORBIDDEN } };
    return { admin: { id: row.id, name: row.name }, cfg };
  } catch (e) {
    if (e instanceof SupabaseError) return { status: 502, body: { error: "Couldn't check access. Try again." } };
    console.error("admin: unexpected gate error");
    return { status: 500, body: { error: "Something went wrong. Try again." } };
  }
};

// ─── Route wrapper ────────────────────────────────────────────────
// handlers: { GET: fn, POST: fn, PATCH: fn }, each ({ admin, cfg, body, query }) → { status?, body }.
const adminRoute = (handlers, { limiter } = {}) => async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  const handler = handlers[req.method];
  if (!handler) {
    res.setHeader("Allow", Object.keys(handlers).join(", "));
    return res.status(405).json({ error: "Method not allowed." });
  }
  if (limiter && limiter(req)) return res.status(429).json({ error: "Too many requests. Wait a minute." });

  const gate = await requireAdmin(req);
  if (!gate.admin) return res.status(gate.status).json(gate.body);

  if (req.method !== "GET" && !/^application\/json\b/i.test((req.headers && req.headers["content-type"]) || "")) {
    return res.status(415).json({ error: "Send JSON." });
  }
  let body;
  try { body = req.body; } catch (e) { return res.status(400).json({ error: "Send a JSON body." }); }
  if (req.method !== "GET" && (!body || typeof body !== "object" || Array.isArray(body))) {
    return res.status(400).json({ error: "Send a JSON body." });
  }
  try {
    const out = await handler({ admin: gate.admin, cfg: gate.cfg, body: body || {}, query: req.query || {} });
    return res.status(out.status || 200).json(out.body);
  } catch (e) {
    if (e instanceof AdminError || e instanceof SupabaseError) return res.status(e.status).json({ error: e.message });
    console.error("admin: unexpected error");
    return res.status(500).json({ error: "Something went wrong. Try again." });
  }
};

// ─── Small validators shared by the admin libs ────────────────────
const cleanText = (v, max, label, { required = false } = {}) => {
  if (v === undefined || v === null || v === "") {
    if (required) fail(400, `${label} is required.`);
    return null;
  }
  if (typeof v !== "string") fail(400, `${label} must be text.`);
  const t = v.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "").trim();
  if (!t && required) fail(400, `${label} is required.`);
  if (t.length > max) fail(400, `${label} is too long (max ${max} characters).`);
  return t || null;
};

const cleanUrl = (v, label) => {
  const t = cleanText(v, 1000, label);
  if (!t) return null;
  let u;
  try { u = new URL(t); } catch (e) { fail(400, `${label} must be a full web address (https://…).`); }
  if (u.protocol !== "https:" && u.protocol !== "http:") fail(400, `${label} must start with https://.`);
  return u.toString();
};

const cleanTraits = (v) => {
  if (v === undefined || v === null) return [];
  if (!Array.isArray(v)) fail(400, "Traits must be a list.");
  if (v.length > 30) fail(400, "Too many traits (max 30).");
  for (const t of v) if (typeof t !== "string" || t.length > 60 || !SLUG_RE.test(t)) fail(400, "Unknown trait.");
  return [...new Set(v)];
};

const requireUuid = (v, label = "id") => {
  if (typeof v !== "string" || !UUID_RE.test(v)) fail(400, `Send a valid ${label}.`);
  return v.toLowerCase();
};

// Width and height from a JPEG's SOF marker, or nulls if it can't be found.
const jpegSize = (buf) => {
  if (!buf || buf.length < 4 || buf[0] !== 0xff || buf[1] !== 0xd8) return { width: null, height: null };
  let i = 2;
  while (i + 9 < buf.length) {
    if (buf[i] !== 0xff) { i += 1; continue; }
    const marker = buf[i + 1];
    if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) { i += 2; continue; }
    const len = buf.readUInt16BE(i + 2);
    if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
      const height = buf.readUInt16BE(i + 5);
      const width = buf.readUInt16BE(i + 7);
      return { width: width || null, height: height || null };
    }
    i += 2 + len;
  }
  return { width: null, height: null };
};

const isJpeg = (buf) => Boolean(buf && buf.length > 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff);

module.exports = {
  AdminError, fail, requireAdmin, adminRoute, rest, storage, request,
  cleanText, cleanUrl, cleanTraits, requireUuid, jpegSize, isJpeg, UUID_RE, SLUG_RE,
};
