/**
 * @jest-environment node
 */
// Category images, server side: choosing a photo for a Browse category (the
// category, licence and size rules), its own public copy, the card and banner
// crops at their aspects, removing it, the public list, and the cascades from
// photo changes (hide, reject, move, replace, delete).
// Supabase and iNaturalist are in-memory fakes behind global.fetch.

jest.setTimeout(30000);

const publicHandler = require("../../api/species-photos");
const photosHandler = require("../../api/admin-photos");
const cats = require("../../lib/categoryImages");
const { validateCrop } = require("../../lib/heroCrop");
const { publicBlockReason, shortBlockReason } = require("../../lib/photoRules");
const { decode } = require("../../lib/imageResize");
const { clearForPhoto } = require("../../lib/categoryImages");
const jpegJs = require("jpeg-js");

// These tests cover the public (post-launch) behaviour of /api/species-photos;
// the pre-launch gate on it is tested in speciesContentApi.test.js.
beforeAll(() => { process.env.ATR_PUBLIC = "true"; });
afterAll(() => { delete process.env.ATR_PUBLIC; });

const URL_ = "https://ledcvbyiqkygcdleucqo.supabase.co";
const KEY = "sb_secret_test";
const ADMIN_CODE = "A".repeat(43);
const TESTER_CODE = "T".repeat(43);
const id = (n) => `eeeeeeee-0000-4000-8000-${String(n).padStart(12, "0")}`;
const DRAGON = id(1), PYTHON = id(2), SA = id(3), SMALL = id(4), HIDDEN = id(5), STOCK_NO_PROOF = id(6), INAT = id(7), SKINK_NO_PAGE = id(8), DRAGON2 = id(9);

const jpeg = (w, h, tint = 0) => {
  const data = Buffer.alloc(w * h * 4);
  for (let i = 0; i < data.length; i += 4) { data[i] = tint; data[i + 1] = 90; data[i + 2] = 40; data[i + 3] = 255; }
  return Buffer.from(jpegJs.encode({ data, width: w, height: h }, 80).data);
};
const MEDIUM = jpeg(500, 375);
const MASTER = jpeg(1600, 1200, 20);
const LARGE = jpeg(1024, 768, 10);
const dataUrl = (buf) => `data:image/jpeg;base64,${buf.toString("base64")}`;

const res = (status, body) => ({
  ok: status >= 200 && status < 300, status,
  json: async () => body,
  text: async () => (body === undefined || body === null ? "" : JSON.stringify(body)),
  arrayBuffer: async () => (Buffer.isBuffer(body) ? body.buffer.slice(body.byteOffset, body.byteOffset + body.length) : new ArrayBuffer(0)),
});
const eq = (q, k) => { const v = q.get(k); return v && v.startsWith("eq.") ? decodeURIComponent(v.slice(3)) : null; };

const base = { source: "admin_upload", photographer: "A. Person", licence: "permission", licence_url: null, traits: [], is_best: false, status: "active", notes: null, created_at: "2026-11-07T00:00:00Z", stock_library: null, stock_asset_id: null, credit_required: false, show_credit: true, display_credit: null, credit_by_name: false, public_use: false, public_order: null, public_path: null, is_hero: false, hero_crop: null, width: 500, height: 375, focal_x: 0.4, focal_y: 0.6 };
const row = (o) => {
  const slug = o.species_slug || "central-bearded-dragon";
  const master = o.master === false ? {} : { master_path: `${slug}/admin_upload-${o.id}.master.jpg`, master_width: 1600, master_height: 1200 };
  delete o.master;
  return { ...base, species_slug: slug, source_id: o.id, source_url: "https://example.org/p", storage_path: `${slug}/admin_upload-${o.id}.jpg`, ...master, ...o };
};

let db;
const fresh = () => ({
  testers: [
    { id: "admin-1", name: "Rowan Peterson", active: true, is_admin: true, invite_code: ADMIN_CODE },
    { id: "tester-1", name: "Jane", active: true, is_admin: false, invite_code: TESTER_CODE },
  ],
  photos: [
    row({ id: DRAGON }),
    row({ id: DRAGON2, photographer: "C. Second" }),
    row({ id: PYTHON, species_slug: "carpet-python" }),
    row({ id: SA, licence: "cc-by-sa", licence_url: "https://creativecommons.org/licenses/by-sa/4.0/", master: false }),
    row({ id: SMALL, master: false }),
    row({ id: HIDDEN, status: "hidden" }),
    row({ id: STOCK_NO_PROOF, licence: "royalty_free" }),
    row({ id: INAT, source: "inaturalist", source_id: "777", licence: "cc-by", licence_url: "https://creativecommons.org/licenses/by/4.0/", master: false, storage_path: "central-bearded-dragon/inaturalist-777.jpg" }),
    row({ id: SKINK_NO_PAGE, species_slug: "garden-skink" }),
  ],
  categories: [],
  objects: { "reference-photos": {}, "species-photos": {} },
});

const PHOTO_EMBED = /photo:reference_photos\(([^)]*)\)/;
const fakeImpl = async (url, init = {}) => {
  const u = new URL(url);
  const method = init.method || "GET";
  if (u.hostname === "inaturalist-open-data.s3.amazonaws.com" || u.hostname === "static.inaturalist.org") {
    return u.pathname.endsWith("/large.jpg") ? res(200, LARGE) : res(404, null);
  }
  if (u.origin !== URL_) throw new Error(`unexpected host ${u.host}`);
  const q = u.searchParams;
  const body = typeof init.body === "string" && init.body ? JSON.parse(init.body) : init.body;
  const path = u.pathname;
  const table = path.startsWith("/rest/v1/") ? path.slice(9) : null;

  if (table === "beta_testers") {
    const code = eq(q, "invite_code");
    return res(200, db.testers.filter(t => t.invite_code === code && t.active && t.is_admin).map(t => ({ id: t.id, name: t.name })));
  }
  if (table === "reference_photos") {
    if (method === "GET") {
      let rows = db.photos;
      for (const k of ["id", "species_slug", "status"]) if (eq(q, k) !== null) rows = rows.filter(r => r[k] === eq(q, k));
      const inSlugs = q.get("species_slug");
      if (inSlugs && inSlugs.startsWith("in.(")) { const s = inSlugs.slice(4, -1).split(","); rows = rows.filter(r => s.includes(r.species_slug)); }
      if (q.get("public_use") === "is.true") rows = rows.filter(r => r.public_use === true);
      return res(200, rows.map(r => ({ ...r })));
    }
    if (method === "PATCH") {
      const rows = db.photos.filter(p => p.id === eq(q, "id"));
      rows.forEach(r => Object.assign(r, body));
      return res(200, rows);
    }
    if (method === "DELETE") {
      // on delete cascade
      const gone = eq(q, "id");
      db.photos = db.photos.filter(p => p.id !== gone);
      db.categories = db.categories.filter(c => c.photo_id !== gone);
      return res(204, null);
    }
  }
  if (table === "category_images") {
    const match = (c) => (eq(q, "category_id") === null || c.category_id === eq(q, "category_id")) && (eq(q, "photo_id") === null || c.photo_id === eq(q, "photo_id"));
    if (method === "GET") {
      const embed = PHOTO_EMBED.test(q.get("select") || "");
      return res(200, db.categories.filter(match).sort((a, b) => a.category_id.localeCompare(b.category_id))
        .map(c => (embed ? { ...c, photo: db.photos.find(p => p.id === c.photo_id) || null } : { ...c })));
    }
    if (method === "POST") {
      expect(q.get("on_conflict")).toBe("category_id");
      if (!db.photos.some(p => p.id === body.photo_id)) return res(409, {});
      db.categories = db.categories.filter(c => c.category_id !== body.category_id);
      db.categories.push({ ...body });
      return res(201, [{ ...body }]);
    }
    if (method === "PATCH") {
      const rows = db.categories.filter(match);
      rows.forEach(r => Object.assign(r, body));
      return res(200, rows.map(r => ({ ...r })));
    }
    if (method === "DELETE") { db.categories = db.categories.filter(c => !match(c)); return res(204, null); }
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

const mockRes = () => {
  const r = { headers: {}, statusCode: 200, body: undefined };
  r.setHeader = (k, v) => { r.headers[k] = v; };
  r.status = (c) => { r.statusCode = c; return r; };
  r.json = (b) => { r.body = b; return r; };
  return r;
};
const call = async (handler, { method = "GET", code = ADMIN_CODE, body, query = {} } = {}) => {
  const r = mockRes();
  const headers = {};
  if (code !== null) headers["x-atr-beta"] = code;
  if (method !== "GET") headers["content-type"] = "application/json";
  await handler({ method, headers, body, query }, r);
  return r;
};
const choose = (category, photoId, code) => call(photosHandler, { method: "PATCH", code, body: { category, photoId } });
const crops = (category, c) => call(photosHandler, { method: "PATCH", body: { category, ...c } });
const remove = (category, code) => call(photosHandler, { method: "DELETE", code, body: { category } });
const patchPhoto = (photoId, changes) => call(photosHandler, { method: "PATCH", body: { id: photoId, changes } });
const cat = (c) => db.categories.find(x => x.category_id === c);
const pub = () => db.objects["species-photos"];

const saved = { url: process.env.SUPABASE_URL, key: process.env.SUPABASE_SECRET_KEY, fetch: global.fetch };
let errSpy;
beforeEach(() => {
  db = fresh();
  for (const p of db.photos) {
    db.objects["reference-photos"][p.storage_path] = MEDIUM;
    if (p.master_path) db.objects["reference-photos"][p.master_path] = MASTER;
  }
  process.env.SUPABASE_URL = URL_;
  process.env.SUPABASE_SECRET_KEY = KEY;
  global.fetch = jest.fn(fakeImpl);
  errSpy = jest.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => { errSpy.mockRestore(); });
afterAll(() => {
  process.env.SUPABASE_URL = saved.url;
  process.env.SUPABASE_SECRET_KEY = saved.key;
  global.fetch = saved.fetch;
});

describe("category mapping", () => {
  test("the six ids match src/data/categories.js and the 46 split 15/9/6/6/4/6", async () => {
    const { CATEGORIES } = await import("../data/categories");
    expect([...cats.CATEGORY_IDS].sort()).toEqual(CATEGORIES.map(c => c.id).sort());
    const n = Object.fromEntries(cats.CATEGORY_IDS.map(c => [c, cats.speciesInCategory(c).length]));
    expect(n).toEqual({ snake: 15, lizard: 9, gecko: 6, monitor: 6, turtle: 4, frog: 6 });
  });
  test("index records map through their app species' type; others have no category", () => {
    expect(cats.categoryOf("carpet-python")).toBe("snake");
    expect(cats.categoryOf("central-bearded-dragon")).toBe("lizard");
    expect(cats.categoryOf("garden-skink")).toBeNull();
    expect(cats.categoryOf("nope")).toBeNull();
  });
  test("short reasons agree with the full rule on every case", () => {
    for (const p of db.photos) expect(Boolean(shortBlockReason(p))).toBe(Boolean(publicBlockReason(p)));
  });
});

describe("choosing a category image", () => {
  test("makes its own 1,280 px public copy, not a species-page copy", async () => {
    const r = await choose("lizard", DRAGON);
    expect(r.statusCode).toBe(200);
    const c = cat("lizard");
    expect(c).toMatchObject({ photo_id: DRAGON, crop: null, banner_crop: null, public_width: 1280, public_height: 960, updated_by: "Rowan Peterson" });
    expect(c.public_path).toMatch(/^categories\/lizard-[a-z0-9]+\.jpg$/);
    const [w, h] = (() => { const d = decode(pub()[c.public_path]); return [d.width, d.height]; })();
    expect([w, h]).toEqual([1280, 960]);
    // Not in the species gallery: the photo itself is untouched.
    expect(db.photos.find(p => p.id === DRAGON)).toMatchObject({ public_use: false, public_path: null, is_hero: false });
    expect(Object.keys(pub())).toEqual([c.public_path]);
    expect(r.body.category).toMatchObject({ category: "lizard", photoId: DRAGON, live: true, credit: expect.objectContaining({ name: "A. Person" }) });
  });

  test("an iNaturalist photo is copied from its large size", async () => {
    const r = await choose("lizard", INAT);
    expect(r.statusCode).toBe(200);
    expect(cat("lizard")).toMatchObject({ public_width: 1024, public_height: 768 });
    expect(global.fetch.mock.calls.some(([u]) => String(u).includes("inaturalist-open-data"))).toBe(true);
  });

  test("a photo of a species in another category is rejected", async () => {
    const r = await choose("lizard", PYTHON);
    expect(r.statusCode).toBe(400);
    expect(r.body.error).toBe("Not one of the app's lizard species.");
    expect((await choose("lizard", SKINK_NO_PAGE)).statusCode).toBe(400); // no app page at all
    expect(db.categories).toEqual([]);
    expect(pub()).toEqual({});
  });

  test("ineligible licences are rejected: CC BY-SA, stock without proof, hidden", async () => {
    expect((await choose("lizard", SA)).body.error).toBe("CC BY-SA can't be used publicly.");
    expect((await choose("lizard", STOCK_NO_PROOF)).body.error).toBe("Add the stock library and asset ID first.");
    expect((await choose("lizard", HIDDEN)).body.error).toBe("Restore the photo first.");
    expect(db.categories).toEqual([]);
  });

  test("too small for public use is rejected", async () => {
    const r = await choose("lizard", SMALL);
    expect(r.statusCode).toBe(400);
    expect(r.body.error).toBe("Too small for public use (500 px; needs 800 px).");
    expect(pub()).toEqual({});
  });

  test("choosing again replaces the copy (new path) and resets the crops", async () => {
    await choose("lizard", DRAGON);
    await crops("lizard", { bannerCrop: { x: 0, y: 0, w: 1, h: 0.5556 } });
    const first = cat("lizard").public_path;
    const later = jest.spyOn(Date, "now").mockReturnValue(Date.UTC(2027, 0, 1));
    await choose("lizard", DRAGON2);
    later.mockRestore();
    expect(cat("lizard")).toMatchObject({ photo_id: DRAGON2, banner_crop: null });
    expect(cat("lizard").public_path).not.toBe(first);
    expect(Object.keys(pub())).toEqual([cat("lizard").public_path]);
  });

  test("unknown categories, bad ids and stray fields are refused", async () => {
    expect((await choose("crocodile", DRAGON)).statusCode).toBe(400);
    expect((await choose("lizard", "not-a-uuid")).statusCode).toBe(400);
    expect((await call(photosHandler, { method: "PATCH", body: { category: "lizard", photoId: DRAGON, public_path: "x" } })).statusCode).toBe(400);
  });

  test("admin only, checked on the server", async () => {
    expect((await choose("lizard", DRAGON, TESTER_CODE)).statusCode).toBe(403);
    expect((await choose("lizard", DRAGON, null)).statusCode).toBe(403);
    expect((await remove("lizard", TESTER_CODE)).statusCode).toBe(403);
    expect((await call(photosHandler, { code: TESTER_CODE, query: { category: "lizard" } })).statusCode).toBe(403);
    expect(db.categories).toEqual([]);
  });
});

describe("crops", () => {
  beforeEach(async () => { await choose("lizard", DRAGON); }); // 1280 × 960, aspect 4:3

  test("card crop at 1.85 : 1 and banner at 2.4 : 1 are saved, normalised", async () => {
    const r = await crops("lizard", { crop: { x: 0.1, y: 0.1, w: 0.6, h: 0.4324 }, bannerCrop: { x: 0, y: 0.2, w: 1, h: 0.5556 } });
    expect(r.statusCode).toBe(200);
    const c = cat("lizard");
    expect((c.crop.w * (4 / 3)) / c.crop.h).toBeCloseTo(1.85, 3);
    expect((c.banner_crop.w * (4 / 3)) / c.banner_crop.h).toBeCloseTo(2.4, 3);
    expect(r.body.category.crop).toEqual(c.crop);
  });

  test("the wrong aspect for each frame is refused", async () => {
    // A 2.4 : 1 rect as the card crop, and a 1.85 : 1 one as the banner.
    expect((await crops("lizard", { crop: { x: 0, y: 0, w: 1, h: 0.5556 } })).body.error).toBe("The card crop must be 1.85 : 1.");
    expect((await crops("lizard", { bannerCrop: { x: 0, y: 0, w: 0.6, h: 0.4324 } })).body.error).toBe("The banner crop must be 2.4 : 1.");
    expect(cat("lizard").crop).toBeNull();
  });

  test("null clears a crop; no image yet is a 404", async () => {
    await crops("lizard", { crop: { x: 0.1, y: 0.1, w: 0.6, h: 0.4324 } });
    await crops("lizard", { crop: null });
    expect(cat("lizard").crop).toBeNull();
    expect((await crops("snake", { crop: null })).statusCode).toBe(404);
  });

  test("validateCrop works for any aspect", () => {
    const size = { width: 1600, height: 900 }; // 16:9
    for (const aspect of [1, 1.85, 2.4, 3]) {
      const w = Math.min(1, aspect / (16 / 9));
      const ok = validateCrop({ x: 0, y: 0, w, h: (w * (16 / 9)) / aspect }, size, { aspect, label: "The crop" });
      expect((ok.w * (16 / 9)) / ok.h).toBeCloseTo(aspect, 3);
      expect(ok.x + ok.w).toBeLessThanOrEqual(1);
      expect(ok.y + ok.h).toBeLessThanOrEqual(1);
    }
    expect(() => validateCrop({ x: 0, y: 0, w: 0.2, h: 0.2 }, size, { aspect: 1.6, label: "The crop" })).toThrow("at least 30%");
    expect(() => validateCrop({ x: 0.8, y: 0, w: 0.5, h: 0.5 }, size, { aspect: 1.78, label: "The crop" })).toThrow("outside");
    expect(() => validateCrop({ x: 0, y: 0, w: 0.5 }, size, { aspect: 2, label: "The crop" })).toThrow("{ x, y, w, h }");
    expect(() => validateCrop({ x: 0, y: 0, w: 0.5, h: 0.5 }, null, { aspect: 2, label: "The crop" })).toThrow("size isn't known");
    expect(validateCrop(null, size, { aspect: 2 })).toBeNull();
  });
});

describe("removing", () => {
  test("deletes the row and its copy", async () => {
    await choose("snake", PYTHON);
    const path = cat("snake").public_path;
    const r = await remove("snake");
    expect(r.body).toEqual({ removed: true });
    expect(cat("snake")).toBeUndefined();
    expect(pub()[path]).toBeUndefined();
    expect((await remove("snake")).body).toEqual({ removed: false });
  });
});

describe("cascades from photo changes", () => {
  beforeEach(async () => { await choose("lizard", DRAGON); });
  const copy = () => cat("lizard") && cat("lizard").public_path;

  test.each(["hidden", "rejected"])("%s clears the category image and its copy", async (status) => {
    const path = copy();
    const r = await patchPhoto(DRAGON, { status });
    expect(r.statusCode).toBe(200);
    expect(r.body.categoriesCleared).toEqual(["lizard"]);
    expect(cat("lizard")).toBeUndefined();
    expect(pub()[path]).toBeUndefined();
  });

  test("moving to a species in another category clears it", async () => {
    const r = await patchPhoto(DRAGON, { species_slug: "carpet-python" });
    expect(r.statusCode).toBe(200);
    expect(r.body.categoriesCleared).toEqual(["lizard"]);
    expect(cat("lizard")).toBeUndefined();
  });

  test("moving within the category keeps it", async () => {
    const r = await patchPhoto(DRAGON, { species_slug: "eastern-bearded-dragon" });
    expect(r.statusCode).toBe(200);
    expect(r.body.categoriesCleared).toBeUndefined();
    expect(cat("lizard")).toMatchObject({ photo_id: DRAGON });
  });

  test("other edits (notes, credit) leave it, and the credit follows the photo", async () => {
    await patchPhoto(DRAGON, { display_credit: "A. Person (VHS)" });
    expect(cat("lizard")).toBeDefined();
    const r = await call(publicHandler, { code: null, query: { categories: "1" } });
    expect(r.body.categories[0].credit.name).toBe("A. Person (VHS)");
  });

  test("replace or rotate remakes the copy at a new path and clears the crops", async () => {
    await crops("lizard", { bannerCrop: { x: 0, y: 0, w: 1, h: 0.5556 } });
    const before = copy();
    const later = jest.spyOn(Date, "now").mockReturnValue(Date.UTC(2027, 0, 2));
    const r = await call(photosHandler, { method: "PUT", body: { id: DRAGON, photo: dataUrl(MEDIUM), master: dataUrl(jpeg(1200, 1600)) } });
    later.mockRestore();
    expect(r.statusCode).toBe(200);
    expect(r.body.categoriesRegenerated).toEqual(["lizard"]);
    const c = cat("lizard");
    expect(c.public_path).not.toBe(before);
    expect(pub()[before]).toBeUndefined();
    expect(c).toMatchObject({ crop: null, banner_crop: null, public_width: 960, public_height: 1280 });
  });

  test("a replacement too small for public use clears it", async () => {
    const before = copy();
    const r = await call(photosHandler, { method: "PUT", body: { id: DRAGON, photo: dataUrl(MEDIUM) } });
    expect(r.body.categoriesCleared).toEqual(["lizard"]);
    expect(cat("lizard")).toBeUndefined();
    expect(pub()[before]).toBeUndefined();
  });

  test("deleting the photo: the copy is removed first, the row cascades", async () => {
    const path = copy();
    await clearForPhoto({ url: URL_, key: KEY }, DRAGON);
    expect(pub()[path]).toBeUndefined();
    expect(cat("lizard")).toBeUndefined();
    // And the database cascade on its own (no copy step) drops the row.
    await choose("lizard", DRAGON2);
    await global.fetch(`${URL_}/rest/v1/reference_photos?id=eq.${DRAGON2}`, { method: "DELETE" });
    expect(cat("lizard")).toBeUndefined();
  });

  test("the library lists which categories use each photo", async () => {
    const r = await call(photosHandler, { query: { species: "central-bearded-dragon" } });
    expect(r.body.photos.find(p => p.id === DRAGON).categories).toEqual(["lizard"]);
    expect(r.body.photos.find(p => p.id === DRAGON2).categories).toEqual([]);
  });
});

describe("public API", () => {
  test("?categories=1 returns each category image with display fields only, edge-cached", async () => {
    await choose("lizard", DRAGON);
    await choose("snake", PYTHON);
    await crops("lizard", { crop: { x: 0.1, y: 0.1, w: 0.6, h: 0.4324 } });
    const gateCalls = () => global.fetch.mock.calls.filter(([u]) => String(u).includes("beta_testers")).length;
    const before = gateCalls();
    const r = await call(publicHandler, { code: null, query: { categories: "1" } });
    expect(gateCalls()).toBe(before); // never touches the admin gate
    expect(r.statusCode).toBe(200);
    expect(r.headers["Cache-Control"]).toMatch(/s-maxage=300/);
    expect(r.body.categories.map(c => c.category)).toEqual(["lizard", "snake"]);
    const [lizard] = r.body.categories;
    expect(Object.keys(lizard).sort()).toEqual(["alt", "bannerCrop", "category", "credit", "crop", "focal", "height", "speciesName", "url", "width"]);
    expect(lizard).toMatchObject({ width: 1280, height: 960, focal: { x: 0.4, y: 0.6 }, bannerCrop: null, speciesName: "Central Bearded Dragon" });
    expect(lizard.url).toBe(`${URL_}/storage/v1/object/public/species-photos/${cat("lizard").public_path}`);
    expect(JSON.stringify(r.body)).not.toMatch(/storage_path|admin_upload|sb_secret|photo_id/);
  });

  test("a row whose photo has gone bad never reaches the app", async () => {
    await choose("lizard", DRAGON);
    db.photos.find(p => p.id === DRAGON).status = "hidden"; // changed behind the server's back
    const r = await call(publicHandler, { code: null, query: { categories: "1" } });
    expect(r.body.categories).toEqual([]);
  });
});

describe("admin picker", () => {
  test("lists the category's species and photos, with reasons for the ones that can't be used", async () => {
    await choose("lizard", DRAGON);
    const r = await call(photosHandler, { query: { category: "lizard" } });
    expect(r.statusCode).toBe(200);
    expect(r.body.species).toHaveLength(9);
    expect(r.body.currentPhotoId).toBe(DRAGON);
    const by = Object.fromEntries(r.body.photos.map(p => [p.id, p]));
    expect(by[PYTHON]).toBeUndefined();     // another category
    expect(by[HIDDEN]).toBeUndefined();     // active photos only
    expect(by[SKINK_NO_PAGE]).toBeUndefined();
    expect(by[DRAGON].block).toBeNull();
    expect(by[SA].block).toBe("CC BY-SA can't be used publicly.");
    expect(by[SMALL].block).toBe("Too small for public use (500 px; needs 800 px).");
    expect(by[DRAGON].url).toContain("/object/sign/reference-photos/");
    expect((await call(photosHandler, { query: { category: "dragons" } })).statusCode).toBe(400);
  });
  test("?categories=1 for the admin screen", async () => {
    await choose("lizard", DRAGON);
    const r = await call(photosHandler, { query: { categories: "1" } });
    expect(r.body.cardAspect).toBe(1.85);
    expect(r.body.categories).toEqual([expect.objectContaining({ category: "lizard", photoId: DRAGON, live: true })]);
  });
});
