/**
 * @jest-environment node
 */
// Morphs in Supabase: the morph store (load, cache, fallback), the AI prompt
// and enum built from it, feedback trait validation, and the admin morph CRUD
// and species assignment on /api/admin-species. Supabase is an in-memory fake.

const store = require("../../lib/morphStore");
const { seedRows } = require("../../lib/morphs");
const { buildAnthropicRequest, buildSystemPrompt, outputSchemaFor, parseAnthropicResponse, SYSTEM_PROMPT } = require("../../lib/identify");
const { validateFeedback, submitFeedback } = require("../../lib/feedback");
const speciesHandler = require("../../api/admin-species");
const betaCheckHandler = require("../../api/beta-check");
const { assertKnownTraits } = require("../../lib/adminMorphs");
const { clearTesterCache } = require("../../lib/beta");

const URL_ = "https://ledcvbyiqkygcdleucqo.supabase.co";
const KEY = "sb_secret_test";
const CFG = { url: URL_, key: KEY };
const ADMIN_CODE = "A".repeat(43);
const TESTER_CODE = "T".repeat(43);
const JPEG = Buffer.concat([Buffer.from([0xff, 0xd8, 0xff, 0xe0]), Buffer.alloc(200, 7)]).toString("base64");

const res = (status, body) => ({
  ok: status >= 200 && status < 300, status,
  json: async () => body,
  text: async () => (body === undefined || body === null ? "" : JSON.stringify(body)),
});

// ─── Fake Supabase ────────────────────────────────────────────────
let db;
const fresh = () => {
  const seed = seedRows();
  return {
    morphs: seed.morphs.map(m => ({ ...m, created_at: "2026-11-08T00:00:00Z", updated_at: "2026-11-08T00:00:00Z" })),
    links: seed.links.map(l => ({ ...l })),
    testers: [
      { id: "aaaaaaaa-0000-4000-8000-000000000001", name: "Rowan Peterson", active: true, is_admin: true, invite_code: ADMIN_CODE, sections: ["id"] },
      { id: "bbbbbbbb-0000-4000-8000-000000000002", name: "Jane Citizen", active: true, is_admin: false, invite_code: TESTER_CODE, sections: ["id"] },
    ],
    down: false,
  };
};
const eq = (q, k) => { const v = q.get(k); return v && v.startsWith("eq.") ? decodeURIComponent(v.slice(3)) : null; };

const fakeImpl = async (url, init = {}) => {
  const u = new URL(url);
  const method = init.method || "GET";
  const q = u.searchParams;
  const body = typeof init.body === "string" && init.body ? JSON.parse(init.body) : undefined;
  const table = u.pathname.slice("/rest/v1/".length);
  if (db.down && (table === "morphs" || table === "species_morphs")) throw new Error("network down");

  if (table === "beta_testers") {
    let rows = db.testers.filter(t => t.invite_code === eq(q, "invite_code") && t.active);
    if (q.get("is_admin") === "is.true") rows = rows.filter(t => t.is_admin);
    return res(200, rows);
  }
  if (table === "morphs") {
    if (method === "GET") {
      let rows = db.morphs;
      if (eq(q, "id") !== null) rows = rows.filter(r => r.id === eq(q, "id"));
      const ids = q.get("id");
      if (ids && ids.startsWith("in.(")) { const list = ids.slice(4, -1).split(",").map(decodeURIComponent); rows = rows.filter(r => list.includes(r.id)); }
      return res(200, rows.map(r => ({ ...r })));
    }
    if (method === "POST") {
      if (db.morphs.some(m => m.id === body.id)) return res(409, { code: "23505" });
      db.morphs.push({ deleted_at: null, created_at: "2026-11-08T01:00:00Z", updated_at: "2026-11-08T01:00:00Z", ...body });
      return res(201, null);
    }
    if (method === "PATCH") {
      const rows = db.morphs.filter(m => m.id === eq(q, "id"));
      rows.forEach(r => Object.assign(r, body, { updated_at: "2026-11-08T02:00:00Z" }));
      return res(200, rows.map(r => ({ id: r.id })));
    }
  }
  if (table === "species_morphs") {
    const match = (l) => (eq(q, "species_slug") === null || l.species_slug === eq(q, "species_slug")) && (eq(q, "morph_id") === null || l.morph_id === eq(q, "morph_id"));
    if (method === "GET") return res(200, db.links.filter(match).map(l => ({ ...l })));
    if (method === "DELETE") { db.links = db.links.filter(l => !match(l)); return res(204, null); }
    if (method === "POST") {
      expect(q.get("on_conflict")).toBe("species_slug,morph_id");
      if (!db.morphs.some(m => m.id === body.morph_id)) return res(409, { code: "23503" });
      const cur = db.links.find(l => l.species_slug === body.species_slug && l.morph_id === body.morph_id);
      if (cur) Object.assign(cur, body); else db.links.push({ ...body });
      return res(201, null);
    }
  }
  if (table === "id_feedback" && method === "POST") return res(201, null);
  if (table === "rpc/admin_photo_counts") return res(200, []);
  throw new Error(`fake supabase: unhandled ${method} ${u.pathname}`);
};
let fakeFetch;

const mockRes = () => {
  const r = { headers: {}, statusCode: 200, body: undefined };
  r.setHeader = (k, v) => { r.headers[k] = v; };
  r.status = (c) => { r.statusCode = c; return r; };
  r.json = (b) => { r.body = b; return r; };
  r.send = (b) => { r.body = b; return r; };
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
const morphCalls = () => fakeFetch.mock.calls.filter(([u]) => /\/rest\/v1\/(morphs|species_morphs)\?/.test(u));

const saved = { url: process.env.SUPABASE_URL, key: process.env.SUPABASE_SECRET_KEY, fetch: global.fetch };
let errSpy;
beforeEach(() => {
  db = fresh();
  fakeFetch = jest.fn(fakeImpl);
  global.fetch = fakeFetch;
  process.env.SUPABASE_URL = URL_;
  process.env.SUPABASE_SECRET_KEY = KEY;
  store.clearMorphCache();
  clearTesterCache();
  errSpy = jest.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => errSpy.mockRestore());
afterAll(() => {
  if (saved.url === undefined) delete process.env.SUPABASE_URL; else process.env.SUPABASE_URL = saved.url;
  if (saved.key === undefined) delete process.env.SUPABASE_SECRET_KEY; else process.env.SUPABASE_SECRET_KEY = saved.key;
  global.fetch = saved.fetch;
});

// A snapshot with an extra morph on a non-app species, and one deleted morph.
const custom = () => {
  const seed = seedRows();
  return store.buildSnapshot({
    morphs: [
      ...seed.morphs.map(m => (m.id === "zero" ? { ...m, deleted_at: "2026-11-08T03:00:00Z" } : m)),
      { id: "red-phase", name: "Red phase", cue: "Rusty red  back\nand flanks.", au_status: "check", notes: null, deleted_at: null },
    ],
    links: [...seed.links, { species_slug: "jacky-dragon", morph_id: "red-phase", cue_override: null, sort: 10 }],
  }, "db");
};

// ─── 1. The store ─────────────────────────────────────────────────
describe("morph store", () => {
  test("loads from Supabase with the secret key and builds the species lists", async () => {
    const snap = await store.getMorphs({ cfg: CFG });
    expect(snap.source).toBe("db");
    expect(morphCalls()).toHaveLength(2);
    expect(morphCalls()[0][1].headers).toMatchObject({ apikey: KEY, Authorization: `Bearer ${KEY}` });
    expect(snap.bySpecies["central-bearded-dragon"].map(t => t.id)).toEqual(["hypomelanistic", "translucent", "leatherback", "silkback", "zero", "witblits", "dunner", "paradox", "red", "citrus", "yellow"]);
    // per-species cue override wins
    expect(snap.bySpecies["water-python"][0].cue).toMatch(/iridescent olive-black/);
    expect(snap.all.leatherback.au).toBe("established");
    expect(snap.traitIds).toEqual([...snap.traitIds].sort());
  });

  test("caches for about a minute per instance, then reloads; invalidate reloads at once", async () => {
    let t = 1000;
    const s = store.createMorphStore({ now: () => t });
    await s.get({ cfg: CFG });
    await s.get({ cfg: CFG });
    expect(morphCalls()).toHaveLength(2);
    t += store.CACHE_MS - 1;
    await s.get({ cfg: CFG });
    expect(morphCalls()).toHaveLength(2);
    t += 2;
    db.morphs.push({ id: "new-one", name: "New one", cue: "A cue.", au_status: "check", notes: null, deleted_at: null });
    db.links.push({ species_slug: "carpet-python", morph_id: "new-one", cue_override: null, sort: 99 });
    const after = await s.get({ cfg: CFG });
    expect(morphCalls()).toHaveLength(4);
    expect(after.bySpecies["carpet-python"].map(m => m.id)).toContain("new-one");
    s.invalidate();
    await s.get({ cfg: CFG });
    expect(morphCalls()).toHaveLength(6);
  });

  test("concurrent loads share one request", async () => {
    const s = store.createMorphStore();
    const [a, b] = await Promise.all([s.get({ cfg: CFG }), s.get({ cfg: CFG })]);
    expect(a).toBe(b);
    expect(morphCalls()).toHaveLength(2);
  });

  test("falls back to the lib/morphs.js seed when Supabase is down, and retries later", async () => {
    let t = 0;
    const s = store.createMorphStore({ now: () => t });
    db.down = true;
    const snap = await s.get({ cfg: CFG });
    expect(snap.source).toBe("fallback");
    expect(snap.bySpecies["central-bearded-dragon"].length).toBe(11);
    await s.get({ cfg: CFG });
    expect(morphCalls()).toHaveLength(2); // not hammered
    t += store.RETRY_MS + 1;
    db.down = false;
    expect((await s.get({ cfg: CFG })).source).toBe("db");
  });

  test("keeps the last good copy over the seed when Supabase drops out", async () => {
    let t = 0;
    const s = store.createMorphStore({ now: () => t });
    db.morphs.push({ id: "only-in-db", name: "Only in DB", cue: "A cue.", au_status: "check", notes: null, deleted_at: null });
    db.links.push({ species_slug: "carpet-python", morph_id: "only-in-db", cue_override: null, sort: 99 });
    await s.get({ cfg: CFG });
    t += store.CACHE_MS + 1;
    db.down = true;
    const snap = await s.get({ cfg: CFG });
    expect(snap.source).toBe("db");
    expect(snap.all["only-in-db"]).toBeTruthy();
  });

  test("a bad reply (non-JSON array, 500) also falls back", async () => {
    const s = store.createMorphStore();
    const snap = await s.get({ cfg: CFG, fetchImpl: async () => res(500, {}) });
    expect(snap.source).toBe("fallback");
    const s2 = store.createMorphStore();
    expect((await s2.get({ cfg: CFG, fetchImpl: async () => res(200, { not: "a list" }) })).source).toBe("fallback");
  });

  test("no Supabase config: the seed, without any fetch", async () => {
    const s = store.createMorphStore();
    const snap = await s.get({ env: {} });
    expect(snap.source).toBe("fallback");
    expect(fakeFetch).not.toHaveBeenCalled();
  });

  test("deleted morphs drop out of the lists but keep their names; unknown species and links are skipped", () => {
    const snap = custom();
    expect(snap.activeIds.has("zero")).toBe(false);
    expect(snap.all.zero.name).toBe("Zero");
    expect(snap.bySpecies["central-bearded-dragon"].map(t => t.id)).not.toContain("zero");
    expect(snap.traitIds).not.toContain("zero");
    const odd = store.buildSnapshot({ morphs: [{ id: "x", name: "X", cue: "c", au_status: "check" }], links: [{ species_slug: "not-a-species", morph_id: "x", sort: 1 }, { species_slug: "jacky-dragon", morph_id: "missing", sort: 1 }] });
    expect(odd.bySpecies).toEqual({});
  });
});

// ─── 2. Prompt and enum ───────────────────────────────────────────
describe("prompt and output schema from the store", () => {
  const enumOf = (schema) => schema.properties.suggestions.items.properties.traits.items.properties.id.enum;

  test("the trait list and enum come from the snapshot (any species, deleted ones left out)", () => {
    const snap = custom();
    const req = buildAnthropicRequest({ data: JPEG, mediaType: "image/jpeg" }, "claude-sonnet-5-5", snap);
    const sys = req.system[0].text;
    expect(sys).toContain("Jacky Dragon|Amphibolurus muricatus:\n  - red-phase (Red phase): Rusty red back and flanks.");
    expect(sys).not.toMatch(/- zero \(Zero\)/);
    expect(enumOf(req.output_config.format.schema)).toContain("red-phase");
    expect(enumOf(req.output_config.format.schema)).not.toContain("zero");
    expect(enumOf(req.output_config.format.schema)).toEqual(snap.traitIds);
  });

  test("the cached system prompt stays byte-stable for the same morphs and changes when they do", () => {
    const a = custom();
    const b = custom();
    expect(a).not.toBe(b);
    const pa = buildAnthropicRequest({ data: JPEG, mediaType: "image/jpeg" }, undefined, a).system[0];
    const pb = buildAnthropicRequest({ data: JPEG, mediaType: "image/jpeg" }, undefined, b).system[0];
    expect(pa.text).toBe(pb.text);
    expect(pa.cache_control).toEqual({ type: "ephemeral", ttl: "1h" });
    expect(outputSchemaFor(a)).toBe(outputSchemaFor(b));
    // The seed from the database gives the same prompt as the fallback seed.
    const fromDb = store.buildSnapshot(seedRows(), "db");
    expect(buildSystemPrompt(fromDb)).toBe(SYSTEM_PROMPT);
    expect(buildSystemPrompt(a)).not.toBe(SYSTEM_PROMPT);
    // Nothing per-request in the system block.
    const other = buildAnthropicRequest({ data: JPEG.replace(/A/g, "B"), mediaType: "image/jpeg" }, undefined, a);
    expect(other.system).toEqual(buildAnthropicRequest({ data: JPEG, mediaType: "image/jpeg" }, undefined, a).system);
  });

  test("no assigned morphs: a plain string id rather than an empty enum", () => {
    const snap = store.buildSnapshot({ morphs: [], links: [] });
    const schema = outputSchemaFor(snap);
    expect(schema.properties.suggestions.items.properties.traits.items.properties.id).toEqual({ type: "string" });
    expect(buildSystemPrompt(snap)).toContain("Trait list (species, then trait id (name): visual cue):\n(none)\n\nSpecies list:");
  });

  test("returned traits are checked against the snapshot's list for that species", () => {
    const snap = custom();
    const out = parseAnthropicResponse({ content: [{ type: "text", text: JSON.stringify({ subject: "reptile", note: "", suggestions: [
      { scientific_name: "Amphibolurus muricatus", common_name: "Jacky Dragon", confidence: "likely", reason: "", traits: [{ id: "red-phase", confidence: "likely" }, { id: "albino", confidence: "likely" }] },
      { scientific_name: "Pogona vitticeps", common_name: "Central Bearded Dragon", confidence: "possible", reason: "", traits: [{ id: "zero", confidence: "likely" }, { id: "translucent", confidence: "likely" }] },
    ] }) }] }, snap);
    expect(out.suggestions[0].traits).toEqual([{ id: "red-phase", name: "Red phase", confidence: "likely" }]);
    expect(out.suggestions[1].traits).toEqual([{ id: "translucent", name: "Translucent", confidence: "likely" }]);
  });

  test("identify() loads the morphs from Supabase and sends them", async () => {
    db.morphs.push({ id: "red-phase", name: "Red phase", cue: "Rusty red.", au_status: "check", notes: null, deleted_at: null });
    db.links.push({ species_slug: "jacky-dragon", morph_id: "red-phase", cue_override: null, sort: 10 });
    const { identify } = require("../../lib/identify");
    const anthropic = jest.fn(async () => res(200, { stop_reason: "end_turn", content: [{ type: "text", text: JSON.stringify({ subject: "reptile", australian_native: true, note: "", suggestions: [{ scientific_name: "Amphibolurus muricatus", common_name: "Jacky Dragon", confidence: "likely", reason: "", traits: [{ id: "red-phase", confidence: "possible" }] }] }) }] }));
    const out = await identify({ image: JPEG }, { apiKey: "k", fetchImpl: anthropic, cfg: CFG });
    expect(out.status).toBe(200);
    expect(out.body.suggestions[0].traits).toEqual([{ id: "red-phase", name: "Red phase", confidence: "possible" }]);
    const sent = JSON.parse(anthropic.mock.calls[0][1].body);
    expect(sent.system[0].text).toContain("red-phase (Red phase): Rusty red.");
    expect(sent.output_config.format.schema.properties.suggestions.items.properties.traits.items.properties.id.enum).toContain("red-phase");
  });

  test("beta-check sends trait names by index slug from the store, no cues", async () => {
    db.morphs.push({ id: "red-phase", name: "Red phase", cue: "Rusty red.", au_status: "check", notes: null, deleted_at: null });
    db.links.push({ species_slug: "jacky-dragon", morph_id: "red-phase", cue_override: null, sort: 10 });
    const r = await call(betaCheckHandler, { method: "POST", code: TESTER_CODE, body: {} });
    expect(r.statusCode).toBe(200);
    expect(r.body.traits["jacky-dragon"]).toEqual([{ id: "red-phase", name: "Red phase" }]);
    expect(JSON.stringify(r.body.traits)).not.toMatch(/Rusty|cue/);
  });
});

// ─── 3. Feedback ──────────────────────────────────────────────────
describe("feedback trait validation", () => {
  const AI = { model: "m", suggestions: [{ slug: "central-bearded-dragon", traits: [{ id: "zero", confidence: "likely" }, { id: "made-up", confidence: "likely" }] }] };
  const body = (correctTraits) => ({ ai: AI, verdict: "partly", correctSpeciesSlug: "central-bearded-dragon", correctTraits });

  test("accepts active morphs, rejects deleted and unknown ones", () => {
    const snap = custom();
    expect(validateFeedback(body(["translucent", "red-phase"]), snap).row.correct_traits).toEqual(["translucent", "red-phase"]);
    expect(() => validateFeedback(body(["zero"]), snap)).toThrow("Unknown trait.");
    expect(() => validateFeedback(body(["made-up"]), snap)).toThrow("Unknown trait.");
  });

  test("the AI traits the tester saw are kept if the morph is known, even deleted", () => {
    const snap = custom();
    expect(validateFeedback(body([]), snap).row.ai_traits).toEqual([{ id: "zero", confidence: "likely" }]);
  });

  test("submitFeedback loads the store: a morph deleted in the database is refused", async () => {
    db.morphs.find(m => m.id === "translucent").deleted_at = "2026-11-08T04:00:00Z";
    const tester = { id: "bbbbbbbb-0000-4000-8000-000000000002" };
    const out = await submitFeedback(body(["translucent"]), { tester, cfg: CFG });
    expect(out).toEqual({ status: 400, body: { error: "Unknown trait." } });
    store.clearMorphCache();
    const ok = await submitFeedback(body(["hypomelanistic"]), { tester, cfg: CFG });
    expect(ok.status).toBe(201);
  });
});

// ─── 4. Admin CRUD ────────────────────────────────────────────────
describe("admin morphs (api/admin-species)", () => {
  const post = (morph, code) => call(speciesHandler, { method: "POST", body: { morph }, code });
  const patch = (id, changes, code) => call(speciesHandler, { method: "PATCH", body: { id, changes }, code });
  const put = (b, code) => call(speciesHandler, { method: "PUT", body: b, code });
  const find = (r, id) => r.body.morphs.find(m => m.id === id);

  test("every write is admin-only, checked on the server", async () => {
    for (const code of [TESTER_CODE, null, "x".repeat(43)]) {
      expect((await post({ name: "Ghost", cue: "A cue." }, code)).statusCode).toBe(403);
      expect((await patch("zero", { name: "Hacked" }, code)).statusCode).toBe(403);
      expect((await put({ morphId: "zero", speciesSlug: "jacky-dragon", assigned: true }, code)).statusCode).toBe(403);
      expect((await call(speciesHandler, { query: { only: "morphs" }, code })).statusCode).toBe(403);
    }
    expect(db.morphs.find(m => m.id === "zero").name).toBe("Zero");
    expect(db.morphs.some(m => m.id === "ghost")).toBe(false);
  });

  test("GET returns the catalogue with species, and the index carries it", async () => {
    const r = await call(speciesHandler, { query: { only: "morphs" } });
    expect(r.statusCode).toBe(200);
    expect(r.body.morphs).toHaveLength(23);
    expect(find(r, "albino").species.map(s => s.slug)).toEqual(expect.arrayContaining(["carpet-python", "eastern-blue-tongue-skink"]));
  });

  test("the index still loads (read-only seed) if the morph tables can't be read", async () => {
    db.down = true;
    const r = await call(speciesHandler);
    expect(r.statusCode).toBe(200);
    expect(r.body.morphSource).toBe("fallback");
    expect(r.body.morphs.length).toBe(23);
  });

  test("create: id from the name, validated, unique", async () => {
    const r = await post({ name: "  Hypo   Translucent ", cue: "Pale nails\nand see-through scales.", au_status: "established", notes: "Combo" });
    expect(r.statusCode).toBe(201);
    expect(find(r, "hypo-translucent")).toMatchObject({ name: "Hypo Translucent", cue: "Pale nails and see-through scales.", au_status: "established", notes: "Combo", deleted_at: null, species: [] });

    expect((await post({ name: "", cue: "x" })).body.error).toBe("Name is required.");
    expect((await post({ name: "X", cue: "   " })).body.error).toBe("Visual cue is required.");
    expect((await post({ name: "X", cue: "c", id: "Bad Id" })).statusCode).toBe(400);
    expect((await post({ name: "X", cue: "c", au_status: "maybe" })).statusCode).toBe(400);
    expect((await post({ name: "X", cue: "c".repeat(501) })).statusCode).toBe(400);
    expect((await post({ name: "!!!", cue: "c" })).statusCode).toBe(400); // no usable id
    const dup = await post({ name: "Albino again", cue: "c", id: "albino" });
    expect(dup.statusCode).toBe(409);
    expect(dup.body.error).toMatch(/already exists/);
  });

  test("edit: fields change, the id never does", async () => {
    const r = await patch("leatherback", { cue: "Smooth back, small scales.", au_status: "check", notes: "x" });
    expect(r.statusCode).toBe(200);
    expect(find(r, "leatherback")).toMatchObject({ cue: "Smooth back, small scales.", au_status: "check", notes: "x" });
    expect((await patch("leatherback", { id: "smooth" })).body.error).toBe("A morph's id can't be changed.");
    expect((await patch("leatherback", { name: "" })).statusCode).toBe(400);
    expect((await patch("leatherback", {})).statusCode).toBe(400);
    expect((await patch("no-such-morph", { name: "X" })).statusCode).toBe(404);
  });

  test("soft delete keeps the morph and its name; restore brings it back; its id stays taken", async () => {
    const r = await patch("zero", { deleted: true });
    expect(r.statusCode).toBe(200);
    expect(find(r, "zero").deleted_at).toBeTruthy();
    expect(find(r, "zero").name).toBe("Zero");
    expect(db.morphs.some(m => m.id === "zero")).toBe(true);
    // The store sees it as deleted, but still knows its name.
    const snap = await store.getMorphs({ cfg: CFG });
    expect(snap.activeIds.has("zero")).toBe(false);
    expect(snap.all.zero.name).toBe("Zero");
    // Can't be reused or assigned while deleted.
    expect((await post({ name: "Zero", cue: "c" })).body.error).toMatch(/deleted morph/);
    expect((await put({ morphId: "zero", speciesSlug: "pygmy-bearded-dragon", assigned: true })).body.error).toMatch(/Restore it/);
    const back = await patch("zero", { deleted: false });
    expect(find(back, "zero").deleted_at).toBeNull();
    expect((await patch("zero", { deleted: "yes" })).statusCode).toBe(400);
  });

  test("a write invalidates this instance's store, so the next ID uses it", async () => {
    await store.getMorphs({ cfg: CFG });
    await post({ name: "Granite", cue: "Speckled grey." });
    await put({ morphId: "granite", speciesSlug: "carpet-python", assigned: true });
    const snap = await store.getMorphs({ cfg: CFG });
    expect(snap.bySpecies["carpet-python"].map(m => m.id)).toContain("granite");
  });

  test("assign to any index species, with an optional cue; update; unassign", async () => {
    let r = await put({ morphId: "albino", speciesSlug: "jacky-dragon", assigned: true, cueOverride: "Pale with red eyes." });
    expect(r.statusCode).toBe(200);
    expect(find(r, "albino").species).toEqual(expect.arrayContaining([{ slug: "jacky-dragon", cue_override: "Pale with red eyes.", sort: 10 }]));
    // A second morph goes to the end of that species' list.
    r = await put({ morphId: "hypomelanistic", speciesSlug: "jacky-dragon", assigned: true });
    expect(find(r, "hypomelanistic").species.find(s => s.slug === "jacky-dragon").sort).toBe(20);
    // Updating keeps the place and can clear the cue.
    r = await put({ morphId: "albino", speciesSlug: "jacky-dragon", assigned: true, cueOverride: "" });
    expect(find(r, "albino").species.find(s => s.slug === "jacky-dragon")).toEqual({ slug: "jacky-dragon", cue_override: null, sort: 10 });
    r = await put({ morphId: "albino", speciesSlug: "jacky-dragon", assigned: false });
    expect(find(r, "albino").species.some(s => s.slug === "jacky-dragon")).toBe(false);
    expect(db.links.some(l => l.morph_id === "albino" && l.species_slug === "carpet-python")).toBe(true);
  });

  test("assignment is validated", async () => {
    expect((await put({ morphId: "albino", speciesSlug: "leopard-gecko", assigned: true })).body.error).toBe("Unknown species.");
    expect((await put({ morphId: "albino", speciesSlug: "jacky-dragon" })).statusCode).toBe(400);
    expect((await put({ morphId: "nope", speciesSlug: "jacky-dragon", assigned: true })).statusCode).toBe(404);
    expect((await put({ morphId: "albino", speciesSlug: "jacky-dragon", assigned: true, sort: 1.5 })).statusCode).toBe(400);
  });

  test("photo trait tags must be morphs in the database; deleted ones only if already on the photo", async () => {
    await expect(assertKnownTraits(CFG, ["albino", "zero"])).resolves.toBeUndefined();
    await expect(assertKnownTraits(CFG, ["made-up"])).rejects.toThrow(/Unknown or deleted trait: made-up/);
    db.morphs.find(m => m.id === "zero").deleted_at = "2026-11-08T05:00:00Z";
    await expect(assertKnownTraits(CFG, ["zero"])).rejects.toThrow(/zero/);
    await expect(assertKnownTraits(CFG, ["zero", "albino"], ["zero"])).resolves.toBeUndefined();
    await expect(assertKnownTraits(CFG, [])).resolves.toBeUndefined();
  });
});
