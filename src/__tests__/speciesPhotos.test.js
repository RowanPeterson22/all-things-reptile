/**
 * @jest-environment node
 */
// Customer-facing species photos, server side: the public read-only endpoint,
// making photos public (and the licence and size rules that block it), credit
// hiding, royalty-free stock uploads, the iNaturalist large-size copy, the
// shared resize maths, download links and Replace image.
// Supabase and iNaturalist are in-memory fakes behind global.fetch (this
// sandbox can't reach iNaturalist; on Vercel the real fetch runs).

// Pure-JS JPEG work is several times slower inside Jest's sandbox than in
// plain Node (~0.5 s per 1,600 px photo there), so allow for it.
jest.setTimeout(20000);

const publicHandler = require("../../api/species-photos");
const photosHandler = require("../../api/admin-photos");
const { validateUpload } = require("../../lib/adminPhotos");
const { inatLargeUrls, PUBLIC_BUCKET } = require("../../lib/speciesPhotos");
const { CC_BY_SA_REASON, publicBlockReason, MIN_PUBLIC_EDGE } = require("../../lib/photoRules");
const { fitLongEdge, decode, SPEC } = require("../../lib/imageResize");
const jpegJs = require("jpeg-js");

const URL_ = "https://ledcvbyiqkygcdleucqo.supabase.co";
const KEY = "sb_secret_test";
const ADMIN_CODE = "A".repeat(43);
const ADMIN_ID = "aaaaaaaa-0000-4000-8000-000000000001";
const id = (n) => `dddddddd-0000-4000-8000-${String(n).padStart(12, "0")}`;
const CC_BY = id(1), CC_BY_SA = id(2), CC0 = id(3), HIDDEN = id(4), PUBLIC_BY = id(5), STOCK = id(6), TESTER = id(7), NO_PAGE = id(8), BAD_SA = id(9), SMALL_PUBLIC = id(10), MASTERED = id(11);

// Real JPEGs (publishing re-encodes with jpeg-js, so they must decode).
const jpeg = (w, h, tint = 0) => {
  const data = Buffer.alloc(w * h * 4);
  for (let i = 0; i < data.length; i += 4) { const x = (i / 4) % w; data[i] = (x + tint) & 255; data[i + 1] = 90 + tint; data[i + 2] = 40; data[i + 3] = 255; }
  return Buffer.from(jpegJs.encode({ data, width: w, height: h }, 80).data);
};
const size = (buf) => { const d = decode(buf); return [d.width, d.height]; };
const dataUrl = (buf) => `data:image/jpeg;base64,${buf.toString("base64")}`;
const LARGE = jpeg(1024, 768, 10);
const MEDIUM = jpeg(500, 375);
const MASTER = jpeg(1600, 1200, 20);

const res = (status, body) => ({
  ok: status >= 200 && status < 300, status,
  json: async () => body,
  text: async () => (body === undefined || body === null ? "" : JSON.stringify(body)),
  arrayBuffer: async () => (Buffer.isBuffer(body) ? body.buffer.slice(body.byteOffset, body.byteOffset + body.length) : new ArrayBuffer(0)),
});
const eq = (q, k) => { const v = q.get(k); return v && v.startsWith("eq.") ? decodeURIComponent(v.slice(3)) : null; };

const base = { source: "inaturalist", photographer: "A. Person", licence_url: "https://creativecommons.org/licenses/by/4.0/", traits: [], is_best: false, status: "active", notes: "internal note", created_at: "2026-11-07T00:00:00Z", stock_library: null, stock_asset_id: null, credit_required: false, show_credit: true, display_credit: null, credit_by_name: false, public_use: false, public_order: null, public_path: null, is_hero: false, hero_crop: null };
const row = (o) => ({ ...base, species_slug: "central-bearded-dragon", source_url: `https://www.inaturalist.org/observations/${o.source_id}`, storage_path: `${o.species_slug || "central-bearded-dragon"}/inaturalist-${o.source_id}.jpg`, ...o });

let db;
let inatUp;
const fresh = () => ({
  testers: [{ id: ADMIN_ID, name: "Rowan Peterson", active: true, is_admin: true, invite_code: ADMIN_CODE }],
  photos: [
    row({ id: CC_BY, source_id: "101", licence: "cc-by" }),
    row({ id: CC_BY_SA, source_id: "102", licence: "cc-by-sa", licence_url: "https://creativecommons.org/licenses/by-sa/4.0/" }),
    row({ id: CC0, source_id: "103", licence: "cc0", licence_url: "https://creativecommons.org/publicdomain/zero/1.0/" }),
    row({ id: HIDDEN, source_id: "104", licence: "cc-by", status: "hidden" }),
    row({ id: PUBLIC_BY, source_id: "105", licence: "cc-by", public_use: true, public_order: 1, public_path: `central-bearded-dragon/${PUBLIC_BY}.jpg`, public_width: 1024, public_height: 768, master_width: 1024, master_height: 768, focal_x: 0.25, focal_y: 0.8 }),
    row({ id: STOCK, source: "admin_upload", source_id: STOCK, source_url: `atr:stock/${STOCK}`, storage_path: `central-bearded-dragon/admin_upload-${STOCK}.jpg`, master_path: `central-bearded-dragon/admin_upload-${STOCK}.master.jpg`, master_width: 1600, master_height: 1200, licence: "royalty_free", licence_url: null, photographer: null, stock_library: "Adobe Stock", stock_asset_id: "AS-123", public_use: true, public_order: 2, show_credit: false, public_path: `central-bearded-dragon/${STOCK}.jpg`, public_width: 1280, public_height: 960 }),
    row({ id: TESTER, source: "tester", source_id: TESTER, source_url: `atr:id_feedback/${TESTER}`, licence: "tester_consent", licence_url: null, photographer: "Jane Citizen", species_slug: "carpet-python" }),
    row({ id: NO_PAGE, source_id: "108", licence: "cc-by", species_slug: "NO_PAGE" }),
    // Bad data that should never be possible (the DB forbids it): must still not leak.
    row({ id: BAD_SA, source_id: "109", licence: "cc-by-sa", public_use: true, public_path: `central-bearded-dragon/${BAD_SA}.jpg`, public_width: 1024, public_height: 768 }),
    row({ id: SMALL_PUBLIC, source_id: "110", licence: "cc0", public_use: true, public_path: `central-bearded-dragon/${SMALL_PUBLIC}.jpg`, public_width: 500, public_height: 375 }),
    // A manual upload with a private 1,600 px master.
    row({ id: MASTERED, source: "admin_upload", source_id: MASTERED, source_url: "https://example.org/p/1", storage_path: `central-bearded-dragon/admin_upload-${MASTERED}.jpg`, master_path: `central-bearded-dragon/admin_upload-${MASTERED}.master.jpg`, master_width: 1600, master_height: 1200, width: 500, height: 375, licence: "permission", licence_url: null, photographer: "B. Keeper", display_credit: "B. Keeper (VHS)" }),
  ],
  objects: { "reference-photos": {}, "species-photos": {} },
  failNext: null,
});

const fakeImpl = async (url, init = {}) => {
  const u = new URL(url);
  const method = init.method || "GET";
  // iNaturalist media hosts
  if (u.hostname === "inaturalist-open-data.s3.amazonaws.com" || u.hostname === "static.inaturalist.org") {
    if (inatUp === "down") throw new TypeError("fetch failed");
    if (inatUp === "404") return res(404, null);
    return u.pathname.endsWith("/large.jpg") ? res(200, LARGE) : res(404, null);
  }
  if (u.origin !== URL_) throw new Error(`unexpected host ${u.host}`);
  const q = u.searchParams;
  const body = typeof init.body === "string" && init.body ? JSON.parse(init.body) : init.body;
  const path = u.pathname;
  const table = path.startsWith("/rest/v1/") ? path.slice(9) : null;
  if (db.failNext && db.failNext === `${method} ${table}`) { db.failNext = null; return res(500, { message: "boom" }); }

  if (table === "beta_testers") {
    const code = eq(q, "invite_code");
    return res(200, db.testers.filter(t => t.invite_code === code && t.active && t.is_admin).map(t => ({ id: t.id, name: t.name })));
  }
  if (table === "reference_photos") {
    if (method === "GET") {
      let rows = db.photos;
      for (const k of ["id", "species_slug", "status"]) if (eq(q, k) !== null) rows = rows.filter(r => r[k] === eq(q, k));
      if (q.get("public_use") === "is.true") rows = rows.filter(r => r.public_use === true);
      const cols = q.get("select");
      return res(200, rows.map(r => (cols ? Object.fromEntries(cols.split(",").map(c => [c, r[c]])) : r)));
    }
    if (method === "POST") {
      const r = { id: id(100 + db.photos.length), ...base, created_at: "2026-11-08T00:00:00Z", ...body };
      db.photos.push(r);
      return res(201, [r]);
    }
    if (method === "PATCH") {
      const rows = db.photos.filter(p => p.id === eq(q, "id"));
      rows.forEach(r => { const old = { ...r }; Object.assign(r, body); heroGuard(old, r); });
      return res(200, rows);
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
  if (obj) {
    const bucket = db.objects[obj[1]];
    const key = obj[2] && decodeURIComponent(obj[2]);
    if (method === "GET") return bucket[key] ? res(200, bucket[key]) : res(404, {});
    if (method === "POST") {
      if (bucket[key] && init.headers["x-upsert"] !== "true") return res(409, {});
      bucket[key] = init.body; return res(200, { Key: key });
    }
    if (method === "DELETE") { for (const p of body.prefixes) delete bucket[p]; return res(200, []); }
  }
  throw new Error(`fake: unhandled ${method} ${path}`);
};
let fakeFetch;

// The reference_photos_hero_guard trigger and one-hero index, as in the migration.
const heroGuard = (old, r) => {
  if (r.is_hero && !(r.public_use && r.status === "active")) r.is_hero = false;
  if (r.species_slug !== old.species_slug) r.is_hero = false;
  if (r.is_hero && !old.is_hero) db.photos.forEach(p => { if (p !== r && p.species_slug === r.species_slug && p.is_hero) p.is_hero = false; });
  if (db.photos.filter(p => p.is_hero && p.species_slug === r.species_slug).length > 1) throw new Error("unique index violated");
  if (r.is_hero && !(r.public_use && r.status === "active")) throw new Error("check violated");
};

const mockRes = () => {
  const r = { headers: {}, statusCode: 200, body: undefined };
  r.setHeader = (k, v) => { r.headers[k] = v; };
  r.status = (c) => { r.statusCode = c; return r; };
  r.json = (b) => { r.body = b; return r; };
  return r;
};
let ip = 0;
const call = async (handler, { method = "GET", code = ADMIN_CODE, body, query = {} } = {}) => {
  const r = mockRes();
  const headers = { "x-forwarded-for": `10.8.0.${ip++}` };
  if (code !== null) headers["x-atr-beta"] = code;
  if (method !== "GET") headers["content-type"] = "application/json";
  await handler({ method, headers, body, query }, r);
  return r;
};
const patch = (photoId, changes) => call(photosHandler, { method: "PATCH", body: { id: photoId, changes } });
const photo = (photoId) => db.photos.find(p => p.id === photoId);

const saved = { url: process.env.SUPABASE_URL, key: process.env.SUPABASE_SECRET_KEY, fetch: global.fetch };
let errSpy;
beforeEach(() => {
  db = fresh();
  inatUp = "up";
  // Library copies for every row (and masters where the row has one).
  for (const p of db.photos) {
    db.objects["reference-photos"][p.storage_path] = MEDIUM;
    if (p.master_path) db.objects["reference-photos"][p.master_path] = MASTER;
    if (p.public_path) db.objects["species-photos"][p.public_path] = LARGE;
  }
  fakeFetch = jest.fn(fakeImpl);
  process.env.SUPABASE_URL = URL_;
  process.env.SUPABASE_SECRET_KEY = KEY;
  global.fetch = fakeFetch;
  errSpy = jest.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => { errSpy.mockRestore(); });
afterAll(() => {
  process.env.SUPABASE_URL = saved.url;
  process.env.SUPABASE_SECRET_KEY = saved.key;
  global.fetch = saved.fetch;
});

// ─── GET /api/species-photos ──────────────────────────────────────
describe("public species photos endpoint", () => {
  test("returns only public, active, allowed photos for the species, in order", async () => {
    const r = await call(publicHandler, { code: null, query: { species: "central-bearded-dragon" } });
    expect(r.statusCode).toBe(200);
    // Not CC_BY/CC0 (not public), HIDDEN, BAD_SA (cc-by-sa) or SMALL_PUBLIC (under 800 px).
    expect(r.body.photos.map(p => p.id)).toEqual([PUBLIC_BY, STOCK]);
    expect(r.headers["Cache-Control"]).toMatch(/s-maxage=300/);
  });

  test("returns only display fields: no notes, storage paths, stock asset IDs or keys", async () => {
    const r = await call(publicHandler, { code: null, query: { species: "central-bearded-dragon" } });
    const [first, stock] = r.body.photos;
    expect(Object.keys(first).sort()).toEqual(["alt", "credit", "focal", "height", "hero", "heroCrop", "id", "scientific", "species", "speciesName", "url", "width"]);
    expect(first).toMatchObject({ width: 1024, height: 768, focal: { x: 0.25, y: 0.8 } });
    expect(first.url).toBe(`${URL_}/storage/v1/object/public/species-photos/central-bearded-dragon/${PUBLIC_BY}.jpg`);
    const text = JSON.stringify(r.body);
    expect(text).not.toMatch(/internal note|inaturalist-105|AS-123|storage_path|sb_secret/);
    expect(stock.credit).toEqual({ show: false, name: "Adobe Stock", licence: "Royalty-free licence", edited: false, licenceUrl: null, source: "Adobe Stock", sourceUrl: null });
    expect(stock.focal).toEqual({ x: 0.5, y: 0.5 }); // defaults to the centre
  });

  test("the whole list (for /credits) still holds nothing that isn't public", async () => {
    const r = await call(publicHandler, { code: null });
    expect(r.statusCode).toBe(200);
    expect(r.body.photos.map(p => p.id).sort()).toEqual([PUBLIC_BY, STOCK].sort());
    // It asked Supabase for public rows only.
    const asked = fakeFetch.mock.calls.map(([u]) => new URL(u)).find(u => u.pathname === "/rest/v1/reference_photos");
    expect(asked.searchParams.get("public_use")).toBe("is.true");
    expect(asked.searchParams.get("status")).toBe("eq.active");
  });

  test("a species with no public photos gets an empty list; unknown species 404; POST 405", async () => {
    expect((await call(publicHandler, { code: null, query: { species: "carpet-python" } })).body.photos).toEqual([]);
    const unknown = await call(publicHandler, { code: null, query: { species: "leopard-gecko" } });
    expect(unknown.statusCode).toBe(404);
    expect((await call(publicHandler, { code: null, query: { species: "../etc" } })).statusCode).toBe(404);
    expect((await call(publicHandler, { method: "POST", code: null, body: {} })).statusCode).toBe(405);
  });

  test("needs no invite code but never touches the admin gate", async () => {
    await call(publicHandler, { code: null, query: { species: "central-bearded-dragon" } });
    expect(fakeFetch.mock.calls.some(([u]) => u.includes("beta_testers"))).toBe(false);
  });
});

// ─── Use on species page ──────────────────────────────────────────
describe("making a photo public", () => {
  test("iNaturalist: publishes from the large size, re-encoded to the public spec", async () => {
    const r = await patch(CC_BY, { public_use: true });
    expect(r.statusCode).toBe(200);
    expect(r.body.publishedSize).toBe("large");
    const path = `central-bearded-dragon/${CC_BY}.jpg`;
    const out = db.objects[PUBLIC_BUCKET][path];
    expect(size(out)).toEqual([1024, 768]); // never upscaled past the source
    expect(out.equals(LARGE)).toBe(false);  // re-encoded (no EXIF survives)
    expect(photo(CC_BY)).toMatchObject({ public_use: true, public_path: path, public_width: 1024, public_height: 768, master_width: 1024, master_height: 768 });
    expect(fakeFetch.mock.calls.some(([u]) => u === inatLargeUrls("101")[0])).toBe(true);
    const put = fakeFetch.mock.calls.find(([u, i]) => u.includes(`/object/${PUBLIC_BUCKET}/`) && i.method === "POST");
    expect(put[1].headers["Cache-Control"]).toMatch(/^public/);
    expect(r.body.photo.publicUrl).toBe(`${URL_}/storage/v1/object/public/species-photos/${path}`);
  });

  test("manual uploads publish from the private master, cut to 1,280 px, without asking iNaturalist", async () => {
    const r = await patch(MASTERED, { public_use: true });
    expect(r.statusCode).toBe(200);
    expect(r.body.publishedSize).toBe("master");
    expect(size(db.objects[PUBLIC_BUCKET][`central-bearded-dragon/${MASTERED}.jpg`])).toEqual([1280, 960]);
    expect(photo(MASTERED)).toMatchObject({ public_width: 1280, public_height: 960 });
    expect(fakeFetch.mock.calls.some(([u]) => /inaturalist/.test(new URL(u).hostname))).toBe(false);
  });

  test("when iNaturalist can't be reached, the 500 px stored copy is too small, so it says to retry", async () => {
    inatUp = "down";
    const r = await patch(CC0, { public_use: true });
    expect(r.statusCode).toBe(502);
    expect(r.body.error).toMatch(/couldn't be fetched from iNaturalist.*below the 800 px minimum/);
    expect(db.objects[PUBLIC_BUCKET][`central-bearded-dragon/${CC0}.jpg`]).toBeUndefined();
    expect(photo(CC0).public_use).toBe(false);
  });

  test("tries every large-size URL before falling back to the stored copy", async () => {
    inatUp = "404";
    const r = await patch(CC_BY, { public_use: true });
    expect(r.statusCode).toBe(502);
    expect(fakeFetch.mock.calls.filter(([u]) => /inaturalist/.test(new URL(u).hostname))).toHaveLength(inatLargeUrls("101").length);
  });

  test("an iNaturalist photo whose large size is under 800 px stays AI reference only, and that's remembered", async () => {
    const small = jpeg(640, 480);
    fakeFetch.mockImplementation(async (url, init) => (new URL(url).hostname.includes("inaturalist") ? res(200, small) : fakeImpl(url, init)));
    const r = await patch(CC_BY, { public_use: true });
    expect(r.statusCode).toBe(400);
    expect(r.body.error).toMatch(/only 640 px.*at least 800 px.*AI reference photo only/);
    expect(photo(CC_BY)).toMatchObject({ public_use: false, master_width: 640, master_height: 480 });
    const list = await call(photosHandler, { query: { species: "central-bearded-dragon" } });
    expect(list.body.photos.find(p => p.id === CC_BY).publicBlock).toMatch(/only 640 px/);
  });

  test("turning it off removes the public copy", async () => {
    const path = `central-bearded-dragon/${PUBLIC_BY}.jpg`;
    const r = await patch(PUBLIC_BY, { public_use: false });
    expect(r.statusCode).toBe(200);
    expect(db.objects[PUBLIC_BUCKET][path]).toBeUndefined();
    expect(photo(PUBLIC_BY)).toMatchObject({ public_use: false, public_path: null });
  });

  test("hiding or rejecting a public photo takes it off the species page", async () => {
    const r = await patch(PUBLIC_BY, { status: "rejected" });
    expect(r.statusCode).toBe(200);
    expect(photo(PUBLIC_BY)).toMatchObject({ status: "rejected", public_use: false, public_path: null });
    expect(db.objects[PUBLIC_BUCKET][`central-bearded-dragon/${PUBLIC_BY}.jpg`]).toBeUndefined();
  });

  test("a public photo can't be moved to another species until it's taken off", async () => {
    const r = await patch(PUBLIC_BY, { species_slug: "carpet-python" });
    expect(r.statusCode).toBe(409);
    expect(photo(PUBLIC_BY).species_slug).toBe("central-bearded-dragon");
  });

  test("CC BY-SA is blocked from public use, with the share-alike reason", async () => {
    const r = await patch(CC_BY_SA, { public_use: true });
    expect(r.statusCode).toBe(400);
    expect(r.body.error).toBe(CC_BY_SA_REASON);
    expect(r.body.error).toMatch(/share-alike/i);
    expect(r.body.error).toMatch(/AI reference only/);
    expect(Object.keys(db.objects[PUBLIC_BUCKET])).not.toContain(`central-bearded-dragon/${CC_BY_SA}.jpg`);
    expect(photo(CC_BY_SA).public_use).toBe(false);
  });

  test("the admin list explains the block before anyone tries", async () => {
    const r = await call(photosHandler, { query: { species: "central-bearded-dragon" } });
    const sa = r.body.photos.find(p => p.id === CC_BY_SA);
    expect(sa.publicBlock).toBe(CC_BY_SA_REASON);
    expect(r.body.photos.find(p => p.id === CC_BY).publicBlock).toBeNull();
  });

  test("minimum size: anything under 800 px on its best source is blocked", () => {
    expect(MIN_PUBLIC_EDGE).toBe(800);
    const p = { licence: "cc0", status: "active", source: "admin_upload" };
    expect(publicBlockReason({ ...p, width: 799, height: 500 })).toMatch(/only 799 px/);
    expect(publicBlockReason({ ...p, width: 500, height: 800 })).toBeNull();         // portrait counts the long edge
    expect(publicBlockReason({ ...p, width: 500, height: 375, master_width: 1600, master_height: 1200 })).toBeNull(); // the master is the best source
    expect(publicBlockReason({ ...p, source: "inaturalist", width: 500, height: 375 })).toBeNull(); // large size unknown until tried
    expect(publicBlockReason({ ...p, source: "inaturalist", width: 500, height: 375, replaced_at: "2026-11-08T00:00:00Z" })).toMatch(/only 500 px/);
  });

  test("hidden photos and species without an app page can't go public", async () => {
    expect((await patch(HIDDEN, { public_use: true })).statusCode).toBe(400);
    db.photos.find(p => p.id === NO_PAGE).species_slug = "tympanocryptis-pinguicolla"; // in the index, not in the app
    const r = await patch(NO_PAGE, { public_use: true });
    expect(r.statusCode).toBe(400);
    expect(r.body.error).toMatch(/no page in the app/);
  });

  test("public_order must be a whole number from 0 to 9999", async () => {
    expect((await patch(PUBLIC_BY, { public_order: 3 })).statusCode).toBe(200);
    expect((await patch(PUBLIC_BY, { public_order: -1 })).statusCode).toBe(400);
    expect((await patch(PUBLIC_BY, { public_order: 1.5 })).statusCode).toBe(400);
    expect((await patch(PUBLIC_BY, { public_order: null })).statusCode).toBe(200);
  });

  test("non-admins can't make photos public", async () => {
    const r = await call(photosHandler, { method: "PATCH", code: "N".repeat(43), body: { id: CC_BY, changes: { public_use: true } } });
    expect(r.statusCode).toBe(403);
    expect(photo(CC_BY).public_use).toBe(false);
  });
});

// ─── Hiding credits ───────────────────────────────────────────────
describe("credit visibility", () => {
  test("a CC BY credit can't be hidden", async () => {
    const r = await patch(CC_BY, { show_credit: false });
    expect(r.statusCode).toBe(400);
    expect(r.body.error).toMatch(/CC BY requires attribution/);
    expect(photo(CC_BY).show_credit).toBe(true);
  });

  test("nor a CC BY-SA one, nor stock whose licence requires credit", async () => {
    expect((await patch(CC_BY_SA, { show_credit: false })).statusCode).toBe(400);
    photo(STOCK).credit_required = true; photo(STOCK).show_credit = true; photo(STOCK).photographer = "J. Smith";
    expect((await patch(STOCK, { show_credit: false })).statusCode).toBe(400);
  });

  test("even a stored show_credit=false on CC BY still shows the credit publicly", async () => {
    photo(PUBLIC_BY).show_credit = false; // can't happen (DB check), but the API mustn't trust it
    const r = await call(publicHandler, { code: null, query: { species: "central-bearded-dragon" } });
    expect(r.body.photos.find(p => p.id === PUBLIC_BY).credit.show).toBe(true);
  });

  test("CC0 and stock without required credit can hide the icon", async () => {
    const r = await patch(CC0, { show_credit: false });
    expect(r.statusCode).toBe(200);
    expect(r.body.photo.credit.show).toBe(false);
  });

  test("an upload can't switch off a required credit", () => {
    const body = { speciesSlug: "central-bearded-dragon", photo: dataUrl(MEDIUM), photographer: "A", licence: "cc-by", sourceUrl: "https://example.com/p", showCredit: false };
    expect(() => validateUpload(body)).toThrow(/requires a credit/);
  });

  test("tester photos credit 'ATR community' until the tester opts in by name", async () => {
    let r = await call(photosHandler, { query: { species: "carpet-python" } });
    expect(r.body.photos[0].credit.name).toBe("ATR community");
    r = await patch(TESTER, { credit_by_name: true });
    expect(r.body.photo.credit.name).toBe("Jane Citizen");
    expect((await patch(CC_BY, { credit_by_name: true })).statusCode).toBe(400);
  });
});

// ─── Royalty-free stock ───────────────────────────────────────────
describe("royalty-free stock uploads", () => {
  const stock = (extra = {}) => ({ speciesSlug: "central-bearded-dragon", photo: dataUrl(MEDIUM), licence: "royalty_free", stockLibrary: "Adobe Stock", stockAssetId: "123456789", ...extra });

  test("need the library and the asset ID as proof of licence", () => {
    expect(() => validateUpload(stock({ stockLibrary: "" }))).toThrow(/Stock library is required/);
    expect(() => validateUpload(stock({ stockAssetId: undefined }))).toThrow(/Stock asset ID is required/);
    expect(() => validateUpload(stock())).not.toThrow();
  });

  test("the photographer is optional unless the licence requires a credit", () => {
    expect(validateUpload(stock()).fields.photographer).toBeNull();
    expect(() => validateUpload(stock({ creditRequired: true }))).toThrow(/Photographer is required/);
    expect(validateUpload(stock({ creditRequired: true, photographer: "J. Smith" })).fields).toMatchObject({ credit_required: true, photographer: "J. Smith" });
  });

  test("no source URL or permission note needed; other licences still need one", () => {
    expect(validateUpload(stock()).fields.sourceUrl).toBeNull();
    expect(() => validateUpload({ ...stock(), licence: "cc0", photographer: "A" })).toThrow(/source URL/);
  });

  test("saves the stock fields and credits it as 'Library / Photographer'", async () => {
    const r = await call(photosHandler, { method: "POST", body: stock({ photographer: "J. Smith", creditRequired: true }) });
    expect(r.statusCode).toBe(201);
    expect(r.body.photo).toMatchObject({ licence: "royalty_free", stock_library: "Adobe Stock", stock_asset_id: "123456789", credit_required: true, show_credit: true });
    expect(r.body.photo.credit.name).toBe("Adobe Stock / J. Smith");
    expect(r.body.photo.source_url).toMatch(/^atr:stock\//);
  });
});

// ─── Resize maths (server; the browser copy is tested in photoCredit.test.js) ──
describe("resize maths", () => {
  test("landscape and portrait are cut to 500 px on the long edge", () => {
    expect(fitLongEdge(4000, 3000, SPEC.reference.edge)).toEqual({ width: 500, height: 375 });
    expect(fitLongEdge(3000, 4000, SPEC.reference.edge)).toEqual({ width: 375, height: 500 });
    expect(fitLongEdge(1568, 1176, 500)).toEqual({ width: 500, height: 375 });
  });
  test("never upscales", () => {
    expect(fitLongEdge(320, 240, 500)).toEqual({ width: 320, height: 240 });
    expect(fitLongEdge(500, 500, 500)).toEqual({ width: 500, height: 500 });
    expect(fitLongEdge(1024, 768, SPEC.public.edge)).toEqual({ width: 1024, height: 768 });
  });
  test("the shared spec", () => {
    expect(SPEC).toEqual({ reference: { edge: 500, quality: 0.8 }, master: { edge: 1600, quality: 0.85 }, public: { edge: 1280, quality: 0.82 } });
  });
});

// ─── Download ─────────────────────────────────────────────────────
describe("download", () => {
  test("is admin only, checked on the server", async () => {
    const r = await call(photosHandler, { code: "N".repeat(43), query: { download: MASTERED } });
    expect(r.statusCode).toBe(403);
    expect(fakeFetch.mock.calls.some(([u]) => u.includes("/object/sign/"))).toBe(false);
    expect((await call(photosHandler, { code: null, query: { download: MASTERED } })).statusCode).toBe(403);
  });

  test("signs the master when there is one, with download=<slug>-<id>.jpg", async () => {
    const r = await call(photosHandler, { query: { download: MASTERED } });
    expect(r.statusCode).toBe(200);
    expect(r.body).toMatchObject({ filename: `central-bearded-dragon-${MASTERED}.jpg`, copy: "master", width: 1600 });
    expect(r.body.url).toContain(`/reference-photos/central-bearded-dragon/admin_upload-${MASTERED}.master.jpg`);
    expect(new URL(r.body.url).searchParams.get("download")).toBe(`central-bearded-dragon-${MASTERED}.jpg`);
    const sign = fakeFetch.mock.calls.find(([u]) => u.includes("/object/sign/"));
    expect(JSON.parse(sign[1].body).expiresIn).toBeLessThanOrEqual(300);
  });

  test("otherwise the reference copy", async () => {
    const r = await call(photosHandler, { query: { download: CC_BY } });
    expect(r.body.copy).toBe("reference");
    expect(r.body.url).toContain("/reference-photos/central-bearded-dragon/inaturalist-101.jpg");
    expect(new URL(r.body.url).searchParams.get("download")).toBe(`central-bearded-dragon-${CC_BY}.jpg`);
    expect((await call(photosHandler, { query: { download: "nope" } })).statusCode).toBe(400);
  });
});

// ─── Replace image (and Rotate 90°, which saves through it) ───────
describe("replace image", () => {
  const replace = (photoId, buf, master) => call(photosHandler, { method: "PUT", body: { id: photoId, photo: dataUrl(buf), ...(master ? { master: dataUrl(master) } : {}) } });
  // Every file in both buckets is referenced by a row, and every row's files exist.
  const orphans = () => {
    const refs = new Set(db.photos.flatMap(p => [p.storage_path, p.master_path].filter(Boolean)));
    const pubs = new Set(db.photos.map(p => p.public_path).filter(Boolean));
    return [
      ...Object.keys(db.objects["reference-photos"]).filter(k => !refs.has(k)),
      ...Object.keys(db.objects["species-photos"]).filter(k => !pubs.has(k)),
    ];
  };

  test("keeps the credit, licence and source; records who and when", async () => {
    const before = { ...photo(MASTERED) };
    const r = await replace(MASTERED, jpeg(500, 375, 30), jpeg(1400, 1050, 30));
    expect(r.statusCode).toBe(200);
    const after = photo(MASTERED);
    for (const k of ["photographer", "licence", "licence_url", "source", "source_id", "source_url", "display_credit", "show_credit", "species_slug", "storage_path", "master_path"]) {
      expect(after[k]).toEqual(before[k]);
    }
    expect(after).toMatchObject({ width: 500, height: 375, master_width: 1400, master_height: 1050, replaced_by: "Rowan Peterson" });
    expect(after.replaced_at).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(r.body.photo.credit.name).toBe("B. Keeper (VHS)");
    expect(orphans()).toEqual([]);
  });

  test("goes through the same pipeline: an oversized file is cut to 500 px with a 1,600 px master", async () => {
    const r = await replace(CC0, jpeg(1800, 1350));
    expect(r.statusCode).toBe(200);
    const p = photo(CC0);
    expect(p).toMatchObject({ width: 500, height: 375, master_width: 1600, master_height: 1200, master_path: "central-bearded-dragon/inaturalist-103.master.jpg" });
    expect(size(db.objects["reference-photos"][p.storage_path])).toEqual([500, 375]);
    expect(size(db.objects["reference-photos"][p.master_path])).toEqual([1600, 1200]);
    expect(orphans()).toEqual([]);
  });

  test("CC BY is marked edited and the credit says so", async () => {
    const r = await replace(CC_BY, jpeg(500, 375, 40));
    expect(r.statusCode).toBe(200);
    expect(photo(CC_BY).edited).toBe(true);
    expect(r.body.photo.credit).toMatchObject({ edited: true, licence: "CC BY 4.0", name: "A. Person" });
  });

  test("CC BY-SA can be replaced for reference use but still can't go public", async () => {
    expect((await replace(CC_BY_SA, jpeg(500, 375), jpeg(1600, 1200))).statusCode).toBe(200);
    expect((await patch(CC_BY_SA, { public_use: true })).body.error).toBe(CC_BY_SA_REASON);
  });

  test("royalty-free stock is allowed, with a warning about the licence terms", async () => {
    const r = await replace(STOCK, jpeg(500, 375), jpeg(1600, 1200, 50));
    expect(r.statusCode).toBe(200);
    expect(r.body.warning).toMatch(/stock licence/);
  });

  test("a public photo gets its public copy regenerated from the new image", async () => {
    const path = `central-bearded-dragon/${PUBLIC_BY}.jpg`;
    const old = db.objects[PUBLIC_BUCKET][path];
    const r = await replace(PUBLIC_BY, jpeg(500, 375, 60), jpeg(1200, 900, 60));
    expect(r.statusCode).toBe(200);
    expect(r.body.republished).toBe(true);
    expect(db.objects[PUBLIC_BUCKET][path].equals(old)).toBe(false);
    expect(size(db.objects[PUBLIC_BUCKET][path])).toEqual([1200, 900]);
    expect(photo(PUBLIC_BY)).toMatchObject({ public_use: true, public_width: 1200, public_height: 900, edited: true });
    // The replaced image is never swapped back for the iNaturalist original.
    expect(fakeFetch.mock.calls.some(([u]) => /inaturalist/.test(new URL(u).hostname))).toBe(false);
    expect(orphans()).toEqual([]);
  });

  test("a public photo replaced with one under 800 px comes off the species page, its copy removed", async () => {
    const r = await replace(PUBLIC_BY, jpeg(600, 450));
    expect(r.statusCode).toBe(200);
    expect(r.body.unpublished).toMatch(/only 600 px/);
    expect(photo(PUBLIC_BY)).toMatchObject({ public_use: false, public_path: null });
    expect(orphans()).toEqual([]);
  });

  test("a smaller replacement drops the old master: no orphans", async () => {
    const oldMaster = photo(MASTERED).master_path;
    const r = await replace(MASTERED, jpeg(480, 360));
    expect(r.statusCode).toBe(200);
    expect(photo(MASTERED)).toMatchObject({ master_path: null, master_width: null, width: 480 });
    expect(db.objects["reference-photos"][oldMaster]).toBeUndefined();
    expect(orphans()).toEqual([]);
  });

  test("if the record can't be saved, a newly created master is removed: no orphans", async () => {
    db.failNext = "PATCH reference_photos";
    const r = await replace(CC0, jpeg(500, 375), jpeg(1600, 1200));
    expect(r.statusCode).toBe(502);
    expect(photo(CC0).master_path).toBeFalsy();
    expect(orphans()).toEqual([]);
  });

  test("is admin only", async () => {
    const r = await call(photosHandler, { method: "PUT", code: "N".repeat(43), body: { id: CC0, photo: dataUrl(MEDIUM) } });
    expect(r.statusCode).toBe(403);
    expect(photo(CC0).replaced_at).toBeUndefined();
  });
});

// ─── Focus point ──────────────────────────────────────────────────
describe("focus point", () => {
  test("saves focal_x/focal_y between 0 and 1", async () => {
    const r = await patch(CC_BY, { focal_x: 0.3, focal_y: 0.71 });
    expect(r.statusCode).toBe(200);
    expect(photo(CC_BY)).toMatchObject({ focal_x: 0.3, focal_y: 0.71 });
    expect((await patch(CC_BY, { focal_x: 1.2 })).statusCode).toBe(400);
    expect((await patch(CC_BY, { focal_y: "0.5" })).statusCode).toBe(400);
  });
});

// ─── Hero (main image) and hero crop ──────────────────────────────
const { validateHeroCrop, minCropWidth, maxCropWidth } = require("../../lib/heroCrop");
const patchBodies = () => fakeFetch.mock.calls.filter(([u, init]) => init && init.method === "PATCH" && new URL(u).pathname === "/rest/v1/reference_photos").map(([, init]) => JSON.parse(init.body));

describe("hero: one per species", () => {
  test("ticking a new hero clears the old one, in the same update", async () => {
    expect((await patch(PUBLIC_BY, { is_hero: true })).statusCode).toBe(200);
    expect(photo(PUBLIC_BY).is_hero).toBe(true);
    fakeFetch.mockClear();
    const r = await patch(STOCK, { is_hero: true });
    expect(r.statusCode).toBe(200);
    expect(r.body.photo.is_hero).toBe(true);
    expect(photo(STOCK).is_hero).toBe(true);
    expect(photo(PUBLIC_BY).is_hero).toBe(false);
    // One PATCH, on the new hero only: the trigger does the unticking atomically.
    expect(patchBodies()).toEqual([{ is_hero: true }]);
    expect(db.photos.filter(p => p.is_hero)).toHaveLength(1);
  });

  test("the public list flags the hero", async () => {
    await patch(STOCK, { is_hero: true });
    const r = await call(publicHandler, { code: null, query: { species: "central-bearded-dragon" } });
    expect(r.body.photos.map(p => [p.id, p.hero])).toEqual([[PUBLIC_BY, false], [STOCK, true]]);
  });

  test("only a public, active photo can be hero; ticking it with public_use publishes it", async () => {
    const r = await patch(CC_BY, { is_hero: true });
    expect(r.statusCode).toBe(400);
    expect(r.body.error).toMatch(/on the species page/);
    expect(photo(CC_BY).is_hero).toBe(false);
    expect((await patch(HIDDEN, { public_use: true, is_hero: true })).statusCode).toBe(400);
    const both = await patch(CC_BY, { public_use: true, is_hero: true });
    expect(both.statusCode).toBe(200);
    expect(photo(CC_BY)).toMatchObject({ public_use: true, is_hero: true });
    expect(db.objects[PUBLIC_BUCKET][`central-bearded-dragon/${CC_BY}.jpg`]).toBeDefined();
    expect((await patch(CC_BY, { is_hero: "yes" })).statusCode).toBe(400);
  });

  test("hiding or rejecting the hero clears it", async () => {
    await patch(PUBLIC_BY, { is_hero: true });
    expect((await patch(PUBLIC_BY, { status: "hidden" })).statusCode).toBe(200);
    expect(photo(PUBLIC_BY)).toMatchObject({ status: "hidden", public_use: false, is_hero: false });
    await patch(STOCK, { is_hero: true });
    await patch(STOCK, { status: "rejected" });
    expect(photo(STOCK).is_hero).toBe(false);
  });

  test("taking the hero off the species page clears it", async () => {
    await patch(PUBLIC_BY, { is_hero: true });
    fakeFetch.mockClear();
    await patch(PUBLIC_BY, { public_use: false });
    expect(photo(PUBLIC_BY)).toMatchObject({ public_use: false, is_hero: false });
    expect(patchBodies()[0]).toMatchObject({ public_use: false, is_hero: false }); // the server says so, not only the trigger
  });

  test("moving a photo to another species clears its hero flag", async () => {
    await patch(PUBLIC_BY, { is_hero: true });
    await patch(PUBLIC_BY, { public_use: false });
    fakeFetch.mockClear();
    expect((await patch(PUBLIC_BY, { species_slug: "carpet-python" })).statusCode).toBe(200);
    expect(patchBodies()[0]).toMatchObject({ species_slug: "carpet-python", is_hero: false });
    expect(photo(PUBLIC_BY).is_hero).toBe(false);
  });

  test("non-admins can't set the hero or the crop", async () => {
    const code = "N".repeat(43);
    const a = await call(photosHandler, { method: "PATCH", code, body: { id: PUBLIC_BY, changes: { is_hero: true } } });
    const b = await call(photosHandler, { method: "PATCH", code, body: { id: PUBLIC_BY, changes: { hero_crop: { x: 0.2, y: 0.3, w: 0.6, h: 1 / 3 } } } });
    const c = await call(photosHandler, { method: "PATCH", code: null, body: { id: PUBLIC_BY, changes: { is_hero: true } } });
    expect([a.statusCode, b.statusCode, c.statusCode]).toEqual([403, 403, 403]);
    expect(photo(PUBLIC_BY)).toMatchObject({ is_hero: false, hero_crop: null });
  });
});

describe("hero crop", () => {
  // PUBLIC_BY is 1024 × 768 (4:3): a 2.4 : 1 crop 0.6 wide is 0.6 × (4/3) / 2.4 = 1/3 tall.
  const good = { x: 0.2, y: 0.3, w: 0.6, h: 1 / 3 };

  test("saves a valid crop, normalised to the exact aspect", async () => {
    const r = await patch(PUBLIC_BY, { hero_crop: { ...good, h: 0.335 } }); // within rounding
    expect(r.statusCode).toBe(200);
    expect(photo(PUBLIC_BY).hero_crop).toEqual({ x: 0.2, y: 0.3, w: 0.6, h: 0.3333 });
    const pub = await call(publicHandler, { code: null, query: { species: "central-bearded-dragon" } });
    expect(pub.body.photos[0].heroCrop).toEqual({ x: 0.2, y: 0.3, w: 0.6, h: 0.3333 });
    expect(pub.body.photos[1].heroCrop).toBeNull();
  });

  test("null clears it", async () => {
    await patch(PUBLIC_BY, { hero_crop: good });
    expect((await patch(PUBLIC_BY, { hero_crop: null })).statusCode).toBe(200);
    expect(photo(PUBLIC_BY).hero_crop).toBeNull();
  });

  test.each([
    ["the wrong aspect", { x: 0, y: 0, w: 0.6, h: 0.6 }, /2\.4 : 1/],
    ["under 30% wide", { x: 0, y: 0, w: 0.2, h: 0.2 * (4 / 3) / 2.4 }, /30%/],
    ["outside the photo", { x: 0.6, y: 0, w: 0.6, h: 1 / 3 }, /outside/],
    ["below the photo", { x: 0, y: 0.8, w: 0.6, h: 1 / 3 }, /outside/],
    ["a negative value", { x: -0.1, y: 0, w: 0.6, h: 1 / 3 }, /between 0 and 1/],
    ["a string", { x: "0", y: 0, w: 0.6, h: 1 / 3 }, /between 0 and 1/],
    ["a missing key", { x: 0, y: 0, w: 0.6 }, /\{ x, y, w, h \}/],
    ["an extra key", { ...good, z: 1 }, /\{ x, y, w, h \}/],
    ["an array", [0, 0, 0.6, 0.3], /\{ x, y, w, h \}/],
    ["not an object", "0,0,1,1", /\{ x, y, w, h \}/],
  ])("rejects %s", async (_, crop, msg) => {
    const r = await patch(PUBLIC_BY, { hero_crop: crop });
    expect(r.statusCode).toBe(400);
    expect(r.body.error).toMatch(msg);
    expect(photo(PUBLIC_BY).hero_crop).toBeNull();
  });

  test("replacing the image clears the crop", async () => {
    Object.assign(photo(CC0), { width: 500, height: 375 });
    await patch(CC0, { hero_crop: { x: 0, y: 0, w: 1, h: (4 / 3) / 2.4 } });
    expect(photo(CC0).hero_crop).not.toBeNull();
    const r = await call(photosHandler, { method: "PUT", body: { id: CC0, photo: dataUrl(MEDIUM) } });
    expect(r.statusCode).toBe(200);
    expect(photo(CC0).hero_crop).toBeNull();
  });

  test("validateHeroCrop: limits and clamping", () => {
    expect(maxCropWidth(4 / 3)).toBe(1);
    expect(maxCropWidth(4)).toBeCloseTo(0.6);   // a panorama: full height is the limit
    expect(minCropWidth(4 / 3)).toBe(0.3);
    expect(minCropWidth(10)).toBeCloseTo(0.24); // never above the widest crop that fits
    // A portrait photo (3:4): full width is 1 × 0.75 / 2.4 = 0.3125 tall.
    expect(validateHeroCrop({ x: 0, y: 0.5, w: 1, h: 0.3125 }, { width: 750, height: 1000 })).toEqual({ x: 0, y: 0.5, w: 1, h: 0.3125 });
    // Edge rounding is pulled back inside.
    expect(validateHeroCrop({ x: 0.4005, y: 0, w: 0.6, h: 1 / 3 }, { width: 1024, height: 768 })).toEqual({ x: 0.4, y: 0, w: 0.6, h: 0.3333 });
    expect(() => validateHeroCrop(good, null)).toThrow(/size isn't known/);
    expect(validateHeroCrop(null, { width: 1, height: 1 })).toBeNull();
  });
});
