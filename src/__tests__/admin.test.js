/**
 * @jest-environment node
 */
// Admin section API: the is_admin gate, licence-required uploads, filing
// feedback photos into the library, invite creation, and photo changes.
// Supabase (PostgREST + Storage) is an in-memory fake behind global.fetch.

const checkHandler = require("../../api/admin-check");
const speciesHandler = require("../../api/admin-species");
const photosHandler = require("../../api/admin-photos");
const feedbackHandler = require("../../api/admin-feedback");
const testersHandler = require("../../api/admin-testers");
const { validateUpload } = require("../../lib/adminPhotos");
const { FORBIDDEN } = require("../../lib/beta");

const URL_ = "https://ledcvbyiqkygcdleucqo.supabase.co";
const KEY = "sb_secret_test";
const ADMIN_CODE = "A".repeat(43);
const TESTER_CODE = "T".repeat(43);
const OLD_ADMIN_CODE = "O".repeat(43);
const ADMIN_ID = "aaaaaaaa-0000-4000-8000-000000000001";
const TESTER_ID = "bbbbbbbb-0000-4000-8000-000000000002";
const FB_CONSENT = "cccccccc-0000-4000-8000-000000000003";
const FB_NO_PHOTO = "cccccccc-0000-4000-8000-000000000004";
const FB_OTHER = "cccccccc-0000-4000-8000-000000000005";
const PHOTO_ID = "dddddddd-0000-4000-8000-000000000006";

// A tiny JPEG-shaped buffer: SOI, APP0, SOF0 (800 × 600), padding.
const jpeg = (w = 800, h = 600, pad = 300) => {
  const sof = Buffer.from([0xff, 0xc0, 0x00, 0x11, 0x08, h >> 8, h & 255, w >> 8, w & 255, 0x03]);
  const app0 = Buffer.from([0xff, 0xe0, 0x00, 0x10, ...Buffer.from("JFIF\0"), 1, 1, 0, 0, 1, 0, 1, 0, 0]);
  return Buffer.concat([Buffer.from([0xff, 0xd8]), app0, sof, Buffer.alloc(pad, 7)]);
};
const dataUrl = (buf) => `data:image/jpeg;base64,${buf.toString("base64")}`;

const res = (status, body) => ({
  ok: status >= 200 && status < 300, status,
  json: async () => body,
  text: async () => (body === undefined || body === null ? "" : JSON.stringify(body)),
  arrayBuffer: async () => (Buffer.isBuffer(body) ? body.buffer.slice(body.byteOffset, body.byteOffset + body.length) : new ArrayBuffer(0)),
});

const pick = (row, cols) => (cols ? Object.fromEntries(cols.split(",").map(c => [c, row[c]])) : row);
const eq = (q, k) => { const v = q.get(k); return v && v.startsWith("eq.") ? decodeURIComponent(v.slice(3)) : null; };

// ─── Fake Supabase ────────────────────────────────────────────────
let db;
const fresh = () => ({
  testers: [
    { id: ADMIN_ID, name: "Rowan Peterson", group: "other", active: true, is_admin: true, invite_code: ADMIN_CODE, created_at: "2026-11-07T00:00:00Z" },
    { id: TESTER_ID, name: "Jane Citizen", group: "VHS", active: true, is_admin: false, invite_code: TESTER_CODE, created_at: "2026-11-07T01:00:00Z" },
    { id: "eeeeeeee-0000-4000-8000-000000000007", name: "Former admin", group: "other", active: false, is_admin: true, invite_code: OLD_ADMIN_CODE, created_at: "2026-11-07T02:00:00Z" },
  ],
  feedback: [
    { id: FB_CONSENT, tester_id: TESTER_ID, created_at: "2026-11-07T05:00:00Z", verdict: "wrong", ai_top_species_slug: "eastern-bearded-dragon", ai_raw: { suggestions: [{ slug: "eastern-bearded-dragon", name: "Eastern Bearded Dragon", confidence: "likely" }] }, ai_traits: [], correct_species_slug: "central-bearded-dragon", correct_species_other: null, correct_traits: ["translucent"], notes: null, photo_path: `${TESTER_ID}/p1.jpg`, photo_consent: true },
    { id: FB_NO_PHOTO, tester_id: TESTER_ID, created_at: "2026-11-07T04:00:00Z", verdict: "correct", ai_top_species_slug: "carpet-python", ai_raw: {}, ai_traits: [], correct_species_slug: "carpet-python", correct_species_other: null, correct_traits: [], notes: null, photo_path: null, photo_consent: false },
    { id: FB_OTHER, tester_id: TESTER_ID, created_at: "2026-11-07T03:00:00Z", verdict: "wrong", ai_top_species_slug: "carpet-python", ai_raw: {}, ai_traits: [], correct_species_slug: "not-one-of-our-species", correct_species_other: "Garden Skink", correct_traits: [], notes: null, photo_path: `${TESTER_ID}/p2.jpg`, photo_consent: true },
  ],
  photos: [
    { id: PHOTO_ID, species_slug: "central-bearded-dragon", source: "inaturalist", source_id: "123", source_url: "https://www.inaturalist.org/observations/1", photographer: "A. Person", licence: "cc-by", licence_url: "https://creativecommons.org/licenses/by/4.0/", storage_path: "central-bearded-dragon/inaturalist-123.jpg", traits: [], is_best: true, status: "active", notes: null, created_at: "2026-11-07T00:00:00Z" },
  ],
  objects: { "id-photos": { [`${TESTER_ID}/p1.jpg`]: jpeg(1000, 750), [`${TESTER_ID}/p2.jpg`]: jpeg() }, "reference-photos": { "central-bearded-dragon/inaturalist-123.jpg": jpeg() } },
  failNext: null, // e.g. "PATCH reference_photos"
});

// CRA's Jest config resets mocks before each test, so the jest.fn is made in beforeEach.
const fakeImpl = async (url, init = {}) => {
  const u = new URL(url);
  const method = init.method || "GET";
  const q = u.searchParams;
  const body = typeof init.body === "string" && init.body ? JSON.parse(init.body) : init.body;
  const path = u.pathname;
  const table = path.startsWith("/rest/v1/") ? path.slice(9) : null;
  if (db.failNext && db.failNext === `${method} ${table}`) { db.failNext = null; return res(500, { message: "boom" }); }

  if (table === "beta_testers") {
    if (method === "GET") {
      let rows = db.testers;
      const code = eq(q, "invite_code");
      if (code !== null) rows = rows.filter(t => t.invite_code === code);
      if (q.get("active") === "is.true") rows = rows.filter(t => t.active);
      if (q.get("is_admin") === "is.true") rows = rows.filter(t => t.is_admin);
      return res(200, rows.map(r => pick(r, q.get("select"))));
    }
    if (method === "POST") {
      const row = { id: "ffffffff-0000-4000-8000-00000000000" + db.testers.length, created_at: "2026-11-07T09:00:00Z", ...body };
      db.testers.push(row);
      return res(201, [pick(row, q.get("select"))]);
    }
    if (method === "PATCH") {
      const rows = db.testers.filter(t => t.id === eq(q, "id"));
      rows.forEach(r => Object.assign(r, body));
      return res(200, rows.map(r => pick(r, q.get("select"))));
    }
  }
  if (table === "id_feedback" && method === "GET") {
    let rows = [...db.feedback].sort((a, b) => b.created_at.localeCompare(a.created_at));
    if (eq(q, "id")) rows = rows.filter(r => r.id === eq(q, "id"));
    return res(200, rows.map(r => {
      const t = db.testers.find(x => x.id === r.tester_id);
      return { ...r, tester: { id: t.id, name: t.name, group: t.group } };
    }));
  }
  if (table === "reference_photos") {
    if (method === "GET") {
      let rows = db.photos;
      for (const k of ["id", "species_slug", "source", "source_id", "status"]) if (eq(q, k) !== null) rows = rows.filter(r => r[k] === eq(q, k));
      const inIds = q.get("source_id");
      if (inIds && inIds.startsWith("in.(")) { const ids = inIds.slice(4, -1).split(","); rows = rows.filter(r => ids.includes(r.source_id)); }
      return res(200, rows);
    }
    if (method === "POST") {
      if (db.photos.some(p => p.storage_path === body.storage_path || (p.source === body.source && p.source_id === body.source_id))) return res(409, { code: "23505" });
      const row = { id: `00000000-0000-4000-8000-${String(db.photos.length).padStart(12, "0")}`, is_best: false, created_at: "2026-11-07T10:00:00Z", ...body };
      db.photos.push(row);
      return res(201, [row]);
    }
    if (method === "PATCH") {
      const rows = db.photos.filter(p => p.id === eq(q, "id"));
      rows.forEach(r => Object.assign(r, body));
      return res(200, rows);
    }
  }
  if (table === "rpc/admin_photo_counts") return res(200, [{ species_slug: "central-bearded-dragon", active: 1, hidden: 0, rejected: 0, best: 1 }]);

  // Storage
  const sign = /^\/storage\/v1\/object\/sign\/([^/]+)$/.exec(path);
  if (sign) return res(200, body.paths.map(p => ({ path: p, signedURL: `/object/sign/${sign[1]}/${p}?token=t` })));
  if (path === "/storage/v1/object/move") {
    const b = db.objects[body.bucketId];
    if (!b[body.sourceKey]) return res(404, {});
    b[body.destinationKey] = b[body.sourceKey]; delete b[body.sourceKey];
    return res(200, { message: "Successfully moved" });
  }
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
  throw new Error(`fake supabase: unhandled ${method} ${path}`);
};
let fakeFetch;

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
  const headers = { "x-forwarded-for": `10.9.0.${ip++}` };
  if (code !== null) headers["x-atr-beta"] = code;
  if (method !== "GET") headers["content-type"] = "application/json";
  await handler({ method, headers, body, query }, r);
  return r;
};
const calls = (pred) => fakeFetch.mock.calls.filter(([u, i = {}]) => pred(new URL(u), i.method || "GET", i));

const saved = { url: process.env.SUPABASE_URL, key: process.env.SUPABASE_SECRET_KEY, fetch: global.fetch };
beforeEach(() => {
  db = fresh();
  fakeFetch = jest.fn(fakeImpl);
  process.env.SUPABASE_URL = URL_;
  process.env.SUPABASE_SECRET_KEY = KEY;
  global.fetch = fakeFetch;
});
afterAll(() => {
  if (saved.url === undefined) delete process.env.SUPABASE_URL; else process.env.SUPABASE_URL = saved.url;
  if (saved.key === undefined) delete process.env.SUPABASE_SECRET_KEY; else process.env.SUPABASE_SECRET_KEY = saved.key;
  global.fetch = saved.fetch;
});

// ─── 1. The admin gate ────────────────────────────────────────────
describe("admin gate", () => {
  const routes = [
    ["admin-check", checkHandler, "POST", {}, {}],
    ["admin-species", speciesHandler, "GET", undefined, {}],
    ["admin-photos", photosHandler, "GET", undefined, { species: "central-bearded-dragon" }],
    ["admin-feedback", feedbackHandler, "GET", undefined, {}],
    ["admin-testers", testersHandler, "GET", undefined, {}],
  ];

  test.each(routes)("%s: non-admin tester gets 403 and no data", async (_, handler, method, body, query) => {
    const r = await call(handler, { method, body, query, code: TESTER_CODE });
    expect(r.statusCode).toBe(403);
    expect(r.body).toEqual({ error: FORBIDDEN });
    // Only the gate lookup ran, and it required is_admin.
    expect(fakeFetch).toHaveBeenCalledTimes(1);
    expect(fakeFetch.mock.calls[0][0]).toContain("is_admin=is.true");
    expect(fakeFetch.mock.calls[0][0]).toContain("active=is.true");
  });

  test.each(routes)("%s: no code or a malformed code gets 403 without a lookup", async (_, handler, method, body, query) => {
    for (const code of [null, "", "short", `${"a".repeat(40)}&is_admin=is.false`]) {
      const r = await call(handler, { method, body, query, code });
      expect(r.statusCode).toBe(403);
    }
    expect(fakeFetch).not.toHaveBeenCalled();
  });

  test("a deactivated admin gets 403", async () => {
    expect((await call(checkHandler, { method: "POST", body: {}, code: OLD_ADMIN_CODE })).statusCode).toBe(403);
  });

  test.each(routes)("%s: an admin gets through", async (_, handler, method, body, query) => {
    const r = await call(handler, { method, body, query });
    expect(r.statusCode).toBe(200);
    expect(r.headers["Cache-Control"]).toBe("no-store");
  });

  test("admin-check names the admin; 503 when Supabase isn't configured", async () => {
    expect((await call(checkHandler, { method: "POST", body: {} })).body).toEqual({ ok: true, name: "Rowan Peterson" });
    delete process.env.SUPABASE_SECRET_KEY;
    expect((await call(checkHandler, { method: "POST", body: {} })).statusCode).toBe(503);
  });

  test("wrong method is 405; writes need JSON", async () => {
    expect((await call(speciesHandler, { method: "DELETE" })).statusCode).toBe(405);
    const r = mockRes();
    await photosHandler({ method: "PATCH", headers: { "x-atr-beta": ADMIN_CODE, "content-type": "text/plain" }, body: "x" }, r);
    expect(r.statusCode).toBe(415);
  });

  test("species index carries every record, counts and morphs", async () => {
    const r = await call(speciesHandler);
    expect(r.body.species.length).toBeGreaterThan(1300);
    expect(r.body.counts["central-bearded-dragon"]).toEqual({ active: 1, hidden: 0, rejected: 0, best: 1 });
    expect(r.body.morphs["central-bearded-dragon"].length).toBeGreaterThan(0);
  });
});

// ─── 2. Licence-required uploads ──────────────────────────────────
describe("add photo: licence and attribution are required", () => {
  const good = () => ({
    speciesSlug: "central-bearded-dragon", photo: dataUrl(jpeg()), photographer: "Rowan Peterson",
    licence: "cc-by", sourceUrl: "https://example.org/photo/1",
  });

  test.each([
    ["no photographer", { photographer: "" }, /Photographer is required/],
    ["blank photographer", { photographer: "   " }, /Photographer is required/],
    ["no licence", { licence: undefined }, /Choose a licence/],
    ["a licence not on the list", { licence: "cc-by-nc" }, /Licence must be one of/],
    ["neither source URL nor permission note", { sourceUrl: "" }, /source URL or a note on the permission/],
    ["permission licence without a note", { licence: "permission" }, /who gave permission/],
    ["a source URL that isn't a web address", { sourceUrl: "javascript:alert(1)" }, /Source URL/],
    ["an unknown species", { speciesSlug: "leopard-gecko" }, /species from the index/],
  ])("rejects %s", (_, over, msg) => {
    expect(() => validateUpload({ ...good(), ...over })).toThrow(msg);
  });

  test("a permission note can stand in for the source URL", () => {
    const { fields } = validateUpload({ ...good(), sourceUrl: "", licence: "permission", permissionNote: "Emailed OK from J. Smith, 6 Nov 2026" });
    expect(fields.notes).toMatch(/^Permission: Emailed OK/);
    expect(fields.sourceUrl).toBeNull();
  });

  test("an invalid upload through the route is 400 and touches no storage", async () => {
    const r = await call(photosHandler, { method: "POST", body: { ...good(), licence: "" } });
    expect(r.statusCode).toBe(400);
    expect(calls((u) => u.pathname.startsWith("/storage/"))).toHaveLength(0);
    expect(calls((u, m) => m === "POST" && u.pathname === "/rest/v1/reference_photos")).toHaveLength(0);
  });

  test("over 2 MB or not a JPEG is refused", async () => {
    expect((await call(photosHandler, { method: "POST", body: { ...good(), photo: dataUrl(jpeg(800, 600, 2.1 * 1024 * 1024)) } })).statusCode).toBe(413);
    expect((await call(photosHandler, { method: "POST", body: { ...good(), photo: `data:image/png;base64,${Buffer.alloc(300, 1).toString("base64")}` } })).statusCode).toBe(415);
  });

  test("a valid upload is stored as admin_upload with its licence", async () => {
    const r = await call(photosHandler, { method: "POST", body: good() });
    expect(r.statusCode).toBe(201);
    const row = db.photos[db.photos.length - 1];
    expect(row).toMatchObject({
      species_slug: "central-bearded-dragon", source: "admin_upload", photographer: "Rowan Peterson",
      licence: "cc-by", licence_url: "https://creativecommons.org/licenses/by/4.0/", source_url: "https://example.org/photo/1",
      width: 800, height: 600, added_by: "Rowan Peterson", status: "active",
    });
    expect(row.storage_path).toBe(`central-bearded-dragon/admin_upload-${row.source_id}.jpg`);
    expect(db.objects["reference-photos"][row.storage_path]).toBeDefined();
    expect(r.body.photo.url).toContain("/storage/v1/object/sign/reference-photos/");
  });
});

// ─── 3. Feedback → library ────────────────────────────────────────
describe("feedback inbox: add to library", () => {
  test("lists newest first with signed URLs only for consented photos", async () => {
    const r = await call(feedbackHandler);
    expect(r.body.items.map(i => i.id)).toEqual([FB_CONSENT, FB_NO_PHOTO, FB_OTHER]);
    const [a, b] = r.body.items;
    expect(a).toMatchObject({ tester: { name: "Jane Citizen" }, verdict: "wrong", correctIndexSlug: "central-bearded-dragon", canAddToLibrary: true, inLibrary: null });
    expect(a.aiSuggestions[0].name).toBe("Eastern Bearded Dragon");
    expect(a.photoUrl).toContain("/object/sign/id-photos/");
    expect(b).toMatchObject({ canAddToLibrary: false, photoUrl: null });
  });

  test("files the photo under the corrected species with tester consent", async () => {
    const r = await call(feedbackHandler, { method: "POST", body: { feedbackId: FB_CONSENT } });
    expect(r.statusCode).toBe(201);
    const row = db.photos.find(p => p.source === "tester");
    expect(row).toMatchObject({
      species_slug: "central-bearded-dragon",
      storage_path: `central-bearded-dragon/tester-${FB_CONSENT}.jpg`,
      source: "tester", source_id: FB_CONSENT, licence: "tester_consent",
      photographer: "Jane Citizen", source_url: `atr:id_feedback/${FB_CONSENT}`,
      traits: ["translucent"], width: 1000, height: 750,
    });
    expect(db.objects["reference-photos"][row.storage_path]).toEqual(db.objects["id-photos"][`${TESTER_ID}/p1.jpg`]);
    // The inbox now shows it as filed, and a second add is refused.
    const list = await call(feedbackHandler);
    expect(list.body.items[0].inLibrary).toEqual({ speciesSlug: "central-bearded-dragon", status: "active" });
    const again = await call(feedbackHandler, { method: "POST", body: { feedbackId: FB_CONSENT } });
    expect(again.statusCode).toBe(409);
    expect(db.photos.filter(p => p.source === "tester")).toHaveLength(1);
  });

  test("refuses feedback without a consented photo, touching no storage", async () => {
    const r = await call(feedbackHandler, { method: "POST", body: { feedbackId: FB_NO_PHOTO } });
    expect(r.statusCode).toBe(409);
    expect(r.body.error).toMatch(/consented photo/);
    expect(calls((u) => u.pathname.startsWith("/storage/"))).toHaveLength(0);
  });

  test("refuses a photo row whose consent flag is off, even if a path is set", async () => {
    db.feedback[0].photo_consent = false;
    expect((await call(feedbackHandler, { method: "POST", body: { feedbackId: FB_CONSENT } })).statusCode).toBe(409);
    expect(db.photos.some(p => p.source === "tester")).toBe(false);
  });

  test("'other' species needs a chosen index species", async () => {
    expect((await call(feedbackHandler, { method: "POST", body: { feedbackId: FB_OTHER } })).statusCode).toBe(400);
    expect((await call(feedbackHandler, { method: "POST", body: { feedbackId: FB_OTHER, speciesSlug: "nope" } })).statusCode).toBe(400);
    const r = await call(feedbackHandler, { method: "POST", body: { feedbackId: FB_OTHER, speciesSlug: "eastern-bearded-dragon" } });
    expect(r.statusCode).toBe(201);
    expect(r.body.photo.species_slug).toBe("eastern-bearded-dragon");
  });

  test("a failed insert removes the copied file", async () => {
    db.failNext = "POST reference_photos";
    expect((await call(feedbackHandler, { method: "POST", body: { feedbackId: FB_CONSENT } })).statusCode).toBe(502);
    expect(db.objects["reference-photos"][`central-bearded-dragon/tester-${FB_CONSENT}.jpg`]).toBeUndefined();
  });
});

// ─── 4. Testers and invites ───────────────────────────────────────
describe("testers", () => {
  test("creating an invite returns the link once and never logs the code", async () => {
    const spies = ["log", "info", "warn", "error", "debug"].map(k => jest.spyOn(console, k).mockImplementation(() => {}));
    const r = await call(testersHandler, { method: "POST", body: { name: "New Tester", group: "breeder" } });
    const logged = spies.flatMap(s => s.mock.calls.flat()).map(String).join("\n");
    spies.forEach(s => s.mockRestore());

    expect(r.statusCode).toBe(201);
    const code = new URL(r.body.inviteLink).searchParams.get("invite");
    expect(r.body.inviteLink).toBe(`https://app.allthingsreptile.com.au/id?invite=${code}`);
    expect(code).toMatch(/^[A-Za-z0-9_-]{43}$/);
    const stored = db.testers.find(t => t.name === "New Tester");
    expect(stored).toMatchObject({ invite_code: code, group: "breeder", active: true, is_admin: false });
    expect(r.body.tester.invite_code).toBeUndefined();
    expect(logged).not.toContain(code);

    // The list never carries codes, and the code isn't sent again.
    const list = await call(testersHandler);
    expect(JSON.stringify(list.body)).not.toContain(code);
    expect(list.body.testers.every(t => !("invite_code" in t))).toBe(true);
    expect(calls((u) => u.pathname === "/rest/v1/beta_testers" && !u.search.includes("invite_code=")).every(([u]) => !u.includes("invite_code"))).toBe(true);
  });

  test("validates the name and group", async () => {
    expect((await call(testersHandler, { method: "POST", body: { name: "" } })).statusCode).toBe(400);
    expect((await call(testersHandler, { method: "POST", body: { name: "X", group: "VIP" } })).statusCode).toBe(400);
  });

  test("deactivate and reactivate a tester", async () => {
    let r = await call(testersHandler, { method: "PATCH", body: { id: TESTER_ID, active: false } });
    expect(r.statusCode).toBe(200);
    expect(db.testers[1].active).toBe(false);
    r = await call(testersHandler, { method: "PATCH", body: { id: TESTER_ID, active: true } });
    expect(r.body.tester.active).toBe(true);
  });

  test("an admin can't remove their own admin flag or deactivate themselves", async () => {
    expect((await call(testersHandler, { method: "PATCH", body: { id: ADMIN_ID, is_admin: false } })).statusCode).toBe(400);
    expect((await call(testersHandler, { method: "PATCH", body: { id: ADMIN_ID.toUpperCase(), active: false } })).statusCode).toBe(400);
    expect(db.testers[0]).toMatchObject({ is_admin: true, active: true });
    expect((await call(testersHandler, { method: "PATCH", body: { id: TESTER_ID, is_admin: true } })).body.tester.is_admin).toBe(true);
  });
});

// ─── 5. Photo changes ─────────────────────────────────────────────
describe("photo changes", () => {
  const patch = (changes, id = PHOTO_ID) => call(photosHandler, { method: "PATCH", body: { id, changes } });

  test("hide, reject and restore", async () => {
    for (const status of ["hidden", "rejected", "active"]) {
      const r = await patch({ status });
      expect(r.statusCode).toBe(200);
      expect(db.photos[0].status).toBe(status);
    }
    expect((await patch({ status: "deleted" })).statusCode).toBe(400);
  });

  test("the species list shows active only unless asked for all", async () => {
    await patch({ status: "hidden" });
    expect((await call(photosHandler, { query: { species: "central-bearded-dragon" } })).body.photos).toHaveLength(0);
    const all = await call(photosHandler, { query: { species: "central-bearded-dragon", all: "1" } });
    expect(all.body.photos).toHaveLength(1);
    expect(all.body.photos[0].url).toContain("token=");
  });

  test("best, traits and notes", async () => {
    const r = await patch({ is_best: false, traits: ["translucent", "translucent"], notes: "  Good side view " });
    expect(r.body.photo).toMatchObject({ is_best: false, traits: ["translucent"], notes: "Good side view" });
    expect((await patch({ is_best: "yes" })).statusCode).toBe(400);
    expect((await patch({ photographer: "Someone" })).statusCode).toBe(400);
    expect((await patch({ traits: ["Bad Trait!"] })).statusCode).toBe(400);
  });

  test("move to another species moves the file and drops best", async () => {
    const r = await patch({ species_slug: "eastern-bearded-dragon" });
    expect(r.statusCode).toBe(200);
    expect(db.photos[0]).toMatchObject({ species_slug: "eastern-bearded-dragon", storage_path: "eastern-bearded-dragon/inaturalist-123.jpg", is_best: false });
    expect(db.objects["reference-photos"]["eastern-bearded-dragon/inaturalist-123.jpg"]).toBeDefined();
    expect(db.objects["reference-photos"]["central-bearded-dragon/inaturalist-123.jpg"]).toBeUndefined();
  });

  test("move refuses unknown or same species", async () => {
    expect((await patch({ species_slug: "leopard-gecko" })).statusCode).toBe(400);
    expect((await patch({ species_slug: "central-bearded-dragon" })).statusCode).toBe(400);
    expect(calls((u) => u.pathname === "/storage/v1/object/move")).toHaveLength(0);
  });

  test("a failed move update puts the file back", async () => {
    db.failNext = "PATCH reference_photos";
    expect((await patch({ species_slug: "eastern-bearded-dragon" })).statusCode).toBe(502);
    expect(db.photos[0].species_slug).toBe("central-bearded-dragon");
    expect(db.objects["reference-photos"]["central-bearded-dragon/inaturalist-123.jpg"]).toBeDefined();
  });

  test("an unknown photo id is 404; a bad id is 400", async () => {
    expect((await patch({ status: "hidden" }, "dddddddd-0000-4000-8000-00000000ffff")).statusCode).toBe(404);
    expect((await patch({ status: "hidden" }, "1; drop table")).statusCode).toBe(400);
  });
});
