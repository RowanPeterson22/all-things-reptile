// ─── In-memory Supabase double for the photo library (tests only) ──
// PostgREST and Storage over fetch, just enough for lib/adminPhotos.js and
// lib/speciesPhotos.js: beta_testers admin lookups; reference_photos GET
// (eq / is / in filters, order with nullslast, offset, limit, select),
// POST and PATCH (Prefer: return=representation) with the one-hero trigger
// from the migration; category_images (always none); and the private and
// public buckets (sign, get, put, move, delete). Never talks to the real
// database or buckets. CommonJS so node tests and scripts can share it.

const clone = (v) => JSON.parse(JSON.stringify(v));

const createFakePhotoDb = ({ url, photos = [], testers = [], objects = {} } = {}) => {
  const db = { photos: clone(photos), testers, objects: { "reference-photos": {}, "species-photos": {}, ...objects }, calls: [], nextId: 1 };

  const res = (status, body) => ({
    ok: status >= 200 && status < 300, status,
    json: async () => clone(body),
    text: async () => (body === null || body === undefined ? "" : Buffer.isBuffer(body) ? body.toString("latin1") : JSON.stringify(body)),
    arrayBuffer: async () => { const b = Buffer.isBuffer(body) ? body : Buffer.from(JSON.stringify(body)); return b.buffer.slice(b.byteOffset, b.byteOffset + b.length); },
  });
  const val = (v) => (v === "true" ? true : v === "false" ? false : v === "null" ? null : decodeURIComponent(v));

  // One PostgREST filter "op.value" on column k.
  const test = (row, k, f) => {
    const dot = f.indexOf(".");
    const op = f.slice(0, dot);
    const v = f.slice(dot + 1);
    if (op === "eq") return String(row[k]) === val(v);
    if (op === "is") return v === "true" ? row[k] === true : v === "false" ? row[k] === false : row[k] === null || row[k] === undefined;
    if (op === "in") return v.replace(/^\(|\)$/g, "").split(",").map(val).includes(row[k]);
    throw new Error(`fakePhotoDb: unsupported filter ${k}=${f}`);
  };
  const RESERVED = new Set(["select", "order", "limit", "offset"]);
  const filterRows = (rows, q) => {
    let out = rows;
    for (const [k, f] of q.entries()) if (!RESERVED.has(k)) out = out.filter(r => test(r, k, f));
    return out;
  };
  const sortRows = (rows, order) => {
    if (!order) return rows;
    const keys = order.split(",").map(s => { const [col, dir = "asc", nulls] = s.split("."); return { col, desc: dir === "desc", nullsLast: nulls ? nulls === "nullslast" : dir !== "desc" }; });
    return [...rows].sort((a, b) => {
      for (const { col, desc, nullsLast } of keys) {
        const x = a[col]; const y = b[col];
        const xn = x === null || x === undefined; const yn = y === null || y === undefined;
        if (xn || yn) { if (xn && yn) continue; return (xn ? 1 : -1) * (nullsLast ? 1 : -1); }
        if (x === y) continue;
        const c = x < y ? -1 : 1;
        return desc ? -c : c;
      }
      return 0;
    });
  };
  const pick = (rows, select) => (select && select !== "*" ? rows.map(r => Object.fromEntries(select.split(",").map(c => [c, r[c] === undefined ? null : r[c]]))) : rows);

  // reference_photos_hero_guard and the one-hero unique index.
  const heroGuard = (old, r) => {
    if (r.is_hero && !(r.public_use && r.status === "active")) r.is_hero = false;
    if (r.species_slug !== old.species_slug) r.is_hero = false;
    if (r.is_hero && !old.is_hero) db.photos.forEach(p => { if (p !== r && p.species_slug === r.species_slug && p.is_hero) p.is_hero = false; });
    if (db.photos.filter(p => p.is_hero && p.species_slug === r.species_slug).length > 1) throw new Error("unique index violated");
  };

  db.fetch = async (input, init = {}) => {
    const u = new URL(String(input));
    if (url && u.origin !== new URL(url).origin) throw new Error(`fakePhotoDb: unexpected host ${u.host}`);
    const method = init.method || "GET";
    const path = u.pathname;
    const q = u.searchParams;
    const body = typeof init.body === "string" && init.body ? JSON.parse(init.body) : init.body;
    const table = path.startsWith("/rest/v1/") ? path.slice(9) : null;
    db.calls.push({ method, path, query: u.search, table });

    if (table === "beta_testers") {
      const code = (q.get("invite_code") || "").replace(/^eq\./, "");
      return res(200, db.testers.filter(t => t.invite_code === decodeURIComponent(code) && t.active && t.is_admin).map(t => ({ id: t.id, name: t.name })));
    }
    if (table === "category_images") return res(200, []);
    if (table === "reference_photos") {
      if (method === "GET") {
        let rows = sortRows(filterRows(db.photos, q), q.get("order"));
        const offset = Number(q.get("offset") || 0);
        const limit = q.get("limit") ? Number(q.get("limit")) : rows.length;
        rows = rows.slice(offset, offset + limit);
        return res(200, pick(rows, q.get("select")));
      }
      if (method === "POST") {
        const r = { id: `eeeeeeee-0000-4000-8000-${String(db.nextId++).padStart(12, "0")}`, status: "active", is_best: false, public_use: false, public_order: null, is_hero: false, hero_crop: null, focal_x: null, focal_y: null, traits: [], created_at: new Date(Date.parse("2026-11-11T10:00:00Z") + db.nextId * 1000).toISOString(), ...body };
        db.photos.push(r);
        return res(201, pick([r], q.get("select")));
      }
      if (method === "PATCH") {
        const rows = filterRows(db.photos, q);
        rows.forEach(r => { const old = { ...r }; Object.assign(r, body); heroGuard(old, r); });
        return res(200, (init.headers && init.headers.Prefer === "return=minimal") ? null : pick(rows, q.get("select")));
      }
    }
    if (path === "/storage/v1/object/move" && method === "POST") {
      const bucket = db.objects[body.bucketId];
      if (!bucket[body.sourceKey]) return res(404, {});
      bucket[body.destinationKey] = bucket[body.sourceKey]; delete bucket[body.sourceKey];
      return res(200, { message: "Successfully moved" });
    }
    const sign = /^\/storage\/v1\/object\/sign\/([^/]+)$/.exec(path);
    if (sign) return res(200, body.paths.map(p => ({ path: p, signedURL: `/object/sign/${sign[1]}/${p}?token=t` })));
    const obj = /^\/storage\/v1\/object\/([^/]+)(?:\/(.+))?$/.exec(path);
    if (obj && db.objects[obj[1]]) {
      const bucket = db.objects[obj[1]];
      const key = obj[2] && decodeURIComponent(obj[2]);
      if (method === "GET") return bucket[key] ? res(200, bucket[key]) : res(404, {});
      if (method === "POST") {
        if (bucket[key] && init.headers["x-upsert"] !== "true") return res(409, {});
        bucket[key] = init.body; return res(200, { Key: key });
      }
      if (method === "DELETE") { for (const p of body.prefixes) delete bucket[p]; return res(200, []); }
    }
    throw new Error(`fakePhotoDb: unhandled ${method} ${path}`);
  };
  db.photo = (id) => db.photos.find(p => p.id === id);
  return db;
};

module.exports = { createFakePhotoDb };
