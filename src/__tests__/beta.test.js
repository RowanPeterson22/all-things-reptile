/**
 * @jest-environment node
 */
// AI ID closed beta: invite gate, feedback validation/submission and the
// beta-check / feedback handlers. Supabase is a mocked fetch throughout.

const { requireTester, clearTesterCache, FORBIDDEN, NOT_SET_UP } = require("../../lib/beta");
const { validateFeedback, submitFeedback } = require("../../lib/feedback");
const feedbackHandler = require("../../api/feedback");
const betaCheckHandler = require("../../api/beta-check");
const { MAX_BASE64_CHARS } = require("../../lib/identify");

const URL_ = "https://ledcvbyiqkygcdleucqo.supabase.co";
const KEY = "sb_secret_test";
const ENV = { SUPABASE_URL: URL_, SUPABASE_SECRET_KEY: KEY };
const CODE = "Zx9_-".repeat(9).slice(0, 43);
const TESTER = { id: "11111111-2222-3333-4444-555555555555", name: "Jane" };
const JPEG = Buffer.concat([Buffer.from([0xff, 0xd8, 0xff, 0xe0]), Buffer.alloc(200, 7)]).toString("base64");
const PNG = Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), Buffer.alloc(200, 1)]).toString("base64");

const AI = {
  subject: "reptile", note: "", model: "claude-sonnet-5-5",
  suggestions: [{ slug: "central-bearded-dragon", inApp: true, name: "Central Bearded Dragon", latin: "Pogona vitticeps", confidence: "likely", reason: "",
    traits: [{ id: "translucent", name: "Translucent", confidence: "likely" }, { id: "made-up", confidence: "likely" }] }],
};
const json = (status, body) => ({ ok: status >= 200 && status < 300, status, json: async () => body, text: async () => JSON.stringify(body) });

beforeEach(() => clearTesterCache());

describe("requireTester", () => {
  const req = (code) => ({ headers: code === undefined ? {} : { "x-atr-beta": code } });

  test("503 when either env var is missing, without calling Supabase", async () => {
    const fetchImpl = jest.fn();
    expect(await requireTester(req(CODE), { env: { SUPABASE_URL: URL_ }, fetchImpl })).toEqual({ status: 503, body: { error: NOT_SET_UP } });
    expect(await requireTester(req(CODE), { env: { SUPABASE_SECRET_KEY: KEY }, fetchImpl })).toMatchObject({ status: 503 });
    expect(fetchImpl).not.toHaveBeenCalled();
  });
  test("403 for missing or malformed codes, without calling Supabase", async () => {
    const fetchImpl = jest.fn();
    for (const c of [undefined, "", "abc", "a".repeat(31), "a".repeat(129), `${"a".repeat(40)}&active=is.false`, ["x"]]) {
      expect(await requireTester(req(c), { env: ENV, fetchImpl })).toEqual({ status: 403, body: { error: FORBIDDEN } });
    }
    expect(fetchImpl).not.toHaveBeenCalled();
  });
  test("403 for an unknown or inactive code", async () => {
    const fetchImpl = jest.fn(async () => json(200, []));
    expect(await requireTester(req(CODE), { env: ENV, fetchImpl })).toEqual({ status: 403, body: { error: FORBIDDEN } });
    expect(fetchImpl.mock.calls[0][0]).toContain("&active=is.true");
  });
  test("passes an active tester and caches briefly", async () => {
    const fetchImpl = jest.fn(async () => json(200, [TESTER]));
    const a = await requireTester(req(CODE), { env: ENV, fetchImpl });
    expect(a.tester).toEqual(TESTER);
    expect(a.cfg).toEqual({ url: URL_, key: KEY });
    const b = await requireTester(req(CODE), { env: ENV, fetchImpl });
    expect(b.tester).toEqual(TESTER);
    expect(b.cfg).toEqual({ url: URL_, key: KEY });
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });
  test("502 when Supabase fails, and logs no secrets", async () => {
    const err = jest.spyOn(console, "error").mockImplementation(() => {});
    expect((await requireTester(req(CODE), { env: ENV, fetchImpl: async () => json(500, {}) })).status).toBe(502);
    expect((await requireTester(req(CODE), { env: ENV, fetchImpl: async () => { throw new Error("net"); } })).status).toBe(502);
    for (const call of err.mock.calls) expect(call.join(" ")).not.toMatch(new RegExp(`${KEY}|${CODE.slice(0, 10)}`));
    err.mockRestore();
  });
});

describe("validateFeedback", () => {
  const base = { ai: AI, verdict: "partly", correctSpeciesSlug: "central-bearded-dragon", correctTraits: ["translucent", "leatherback"], notes: " hypo trans " };
  const status = (body) => { try { validateFeedback(body); return 200; } catch (e) { return e.status; } };

  test("builds the row from a valid body", () => {
    const { row, photo } = validateFeedback(base);
    expect(photo).toBeNull();
    expect(row).toEqual({
      model: "claude-sonnet-5-5",
      ai_top_species_slug: "central-bearded-dragon",
      ai_traits: [{ id: "translucent", confidence: "likely" }],
      ai_raw: AI,
      verdict: "partly",
      correct_species_slug: "central-bearded-dragon",
      correct_species_other: null,
      correct_traits: ["translucent", "leatherback"],
      notes: "hypo trans",
      photo_consent: false,
    });
  });
  test("'correct' fills in the AI's top species", () => {
    expect(validateFeedback({ ai: AI, verdict: "correct" }).row.correct_species_slug).toBe("central-bearded-dragon");
  });
  test("a non-app species is stored as its index slug, not a sentinel (Rowan's Jacky Dragon)", () => {
    const { row } = validateFeedback({ ...base, verdict: "wrong", correctSpeciesSlug: "jacky-dragon", correctTraits: [] });
    expect(row.correct_species_slug).toBe("jacky-dragon");
    expect(row.correct_species_other).toBeNull();
  });
  test("'other' needs a typed name and stores free text only, with no slug", () => {
    expect(status({ ...base, correctSpeciesSlug: "other" })).toBe(400);
    const { row } = validateFeedback({ ...base, correctSpeciesSlug: "other", correctSpeciesOther: "Some undescribed Ctenotus" });
    expect(row.correct_species_slug).toBeNull();
    expect(row.correct_species_other).toBe("Some undescribed Ctenotus");
    expect(JSON.stringify(row)).not.toContain("not-one-of-our-species");
  });
  test("the old sentinel is no longer accepted as a species", () => {
    expect(status({ ...base, correctSpeciesSlug: "not-one-of-our-species" })).toBe(400);
  });
  test("AI top pick: index slug for any matched species, null when unmatched", () => {
    const jacky = { ...AI, suggestions: [{ slug: "jacky-dragon", matched: true, inApp: false, name: "Jacky Dragon", traits: [] }] };
    expect(validateFeedback({ ai: jacky, verdict: "correct" }).row).toMatchObject({ ai_top_species_slug: "jacky-dragon", correct_species_slug: "jacky-dragon" });
    const made = { ...AI, suggestions: [{ slug: null, matched: false, name: "Rainbow Dragon", traits: [] }] };
    const { row } = validateFeedback({ ai: made, verdict: "correct" });
    expect(row.ai_top_species_slug).toBeNull();
    expect(row.correct_species_slug).toBeNull();
  });
  test("'wrong' needs a species, an Other name or a note", () => {
    expect(status({ ai: AI, verdict: "wrong" })).toBe(400);
    expect(status({ ai: AI, verdict: "wrong", notes: "It's a Lace Monitor hatchling" })).toBe(200);
    expect(status({ ai: AI, verdict: "wrong", correctSpeciesSlug: "other", correctSpeciesOther: "Unknown skink" })).toBe(200);
  });
  test("rejects bad verdicts, species, traits, notes and AI payloads", () => {
    expect(status(null)).toBe(400);
    expect(status({ ...base, verdict: "maybe" })).toBe(400);
    expect(status({ ...base, ai: undefined })).toBe(400);
    expect(status({ ...base, ai: [] })).toBe(400);
    expect(status({ ...base, ai: { blob: "x".repeat(25000) } })).toBe(413);
    expect(status({ ...base, correctSpeciesSlug: "leopard-gecko" })).toBe(400);
    expect(status({ ...base, correctTraits: "translucent" })).toBe(400);
    expect(status({ ...base, correctTraits: ["glow-in-the-dark"] })).toBe(400);
    expect(status({ ...base, correctTraits: Array(31).fill("zero") })).toBe(400);
    expect(status({ ...base, notes: "x".repeat(2001) })).toBe(400);
    expect(status({ ...base, notes: 7 })).toBe(400);
  });
  test("dedupes traits", () => {
    expect(validateFeedback({ ...base, correctTraits: ["zero", "zero"] }).row.correct_traits).toEqual(["zero"]);
  });

  describe("photo consent", () => {
    test("photo without consent is rejected, not silently dropped", () => {
      expect(status({ ...base, photo: JPEG })).toBe(400);
      expect(status({ ...base, photo: JPEG, photoConsent: false })).toBe(400);
    });
    test("consent without a photo is rejected", () => {
      expect(status({ ...base, photoConsent: true })).toBe(400);
    });
    test("consent must be a real boolean", () => {
      expect(status({ ...base, photoConsent: "true", photo: JPEG })).toBe(400);
    });
    test("accepts a consented JPEG (raw or data URL)", () => {
      const a = validateFeedback({ ...base, photoConsent: true, photo: JPEG });
      expect(a.row.photo_consent).toBe(true);
      expect(Buffer.isBuffer(a.photo)).toBe(true);
      expect(a.photo[0]).toBe(0xff);
      expect(validateFeedback({ ...base, photoConsent: true, photo: `data:image/jpeg;base64,${JPEG}` }).photo.length).toBe(a.photo.length);
    });
    test("validates photos like /api/identify does (size, base64, type)", () => {
      expect(status({ ...base, photoConsent: true, photo: "A".repeat(MAX_BASE64_CHARS + 4) })).toBe(413);
      expect(status({ ...base, photoConsent: true, photo: "abc" })).toBe(400);
      expect(status({ ...base, photoConsent: true, photo: "!!" + JPEG })).toBe(400);
      expect(status({ ...base, photoConsent: true, photo: PNG })).toBe(415);
      expect(status({ ...base, photoConsent: true, photo: `data:image/png;base64,${JPEG}` })).toBe(415);
    });
  });
});

describe("submitFeedback (mocked Supabase)", () => {
  const cfg = { url: URL_, key: KEY };
  const body = { ai: AI, verdict: "correct" };

  test("inserts the row with the tester id and no photo", async () => {
    const fetchImpl = jest.fn(async () => json(201, null));
    const out = await submitFeedback(body, { tester: TESTER, cfg, fetchImpl });
    expect(out).toEqual({ status: 201, body: { ok: true, photoSaved: false } });
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    const [url, init] = fetchImpl.mock.calls[0];
    expect(url).toBe(`${URL_}/rest/v1/id_feedback`);
    expect(init.headers).toMatchObject({ apikey: KEY, Authorization: `Bearer ${KEY}`, Prefer: "return=minimal" });
    const row = JSON.parse(init.body);
    expect(row).toMatchObject({ tester_id: TESTER.id, photo_path: null, photo_consent: false, verdict: "correct" });
  });
  test("uploads a consented photo to id-photos/<tester_id>/<uuid>.jpg first", async () => {
    const fetchImpl = jest.fn(async () => json(200, {}));
    const out = await submitFeedback({ ...body, photoConsent: true, photo: JPEG }, { tester: TESTER, cfg, fetchImpl, uuid: () => "abc-uuid" });
    expect(out.body.photoSaved).toBe(true);
    const [upUrl, upInit] = fetchImpl.mock.calls[0];
    expect(upUrl).toBe(`${URL_}/storage/v1/object/id-photos/${TESTER.id}/abc-uuid.jpg`);
    expect(upInit.headers["Content-Type"]).toBe("image/jpeg");
    expect(upInit.headers["x-upsert"]).toBe("false");
    expect(Buffer.isBuffer(upInit.body)).toBe(true);
    const row = JSON.parse(fetchImpl.mock.calls[1][1].body);
    expect(row).toMatchObject({ photo_path: `${TESTER.id}/abc-uuid.jpg`, photo_consent: true });
  });
  test("removes the uploaded photo if the insert fails", async () => {
    const err = jest.spyOn(console, "error").mockImplementation(() => {});
    const fetchImpl = jest.fn(async (url, init) => (url.includes("/rest/v1/") ? json(500, {}) : json(200, {})));
    const out = await submitFeedback({ ...body, photoConsent: true, photo: JPEG }, { tester: TESTER, cfg, fetchImpl, uuid: () => "u1" });
    expect(out.status).toBe(502);
    const del = fetchImpl.mock.calls[2];
    expect(del[1].method).toBe("DELETE");
    expect(JSON.parse(del[1].body)).toEqual({ prefixes: [`${TESTER.id}/u1.jpg`] });
    err.mockRestore();
  });
  test("validation errors never touch Supabase", async () => {
    const fetchImpl = jest.fn();
    expect((await submitFeedback({ ai: AI, verdict: "nope" }, { tester: TESTER, cfg, fetchImpl })).status).toBe(400);
    expect((await submitFeedback({ ...body, photo: JPEG }, { tester: TESTER, cfg, fetchImpl })).status).toBe(400);
    expect(fetchImpl).not.toHaveBeenCalled();
  });
});

describe("handlers", () => {
  const mockRes = () => {
    const res = { headers: {}, statusCode: 200, body: undefined };
    res.setHeader = (k, v) => { res.headers[k] = v; };
    res.status = (c) => { res.statusCode = c; return res; };
    res.json = (b) => { res.body = b; return res; };
    return res;
  };
  const req = (over = {}) => ({
    method: "POST", body: { ai: AI, verdict: "correct" }, ...over,
    headers: { "content-type": "application/json", "x-atr-beta": CODE, "x-forwarded-for": `10.1.0.${Math.random()}`, ...(over.headers || {}) },
  });
  const saved = { url: process.env.SUPABASE_URL, key: process.env.SUPABASE_SECRET_KEY, fetch: global.fetch };
  beforeEach(() => { process.env.SUPABASE_URL = URL_; process.env.SUPABASE_SECRET_KEY = KEY; });
  afterEach(() => {
    if (saved.url === undefined) delete process.env.SUPABASE_URL; else process.env.SUPABASE_URL = saved.url;
    if (saved.key === undefined) delete process.env.SUPABASE_SECRET_KEY; else process.env.SUPABASE_SECRET_KEY = saved.key;
    global.fetch = saved.fetch;
  });

  test("feedback: 503 without env, 403 without a code, 405 for GET", async () => {
    delete process.env.SUPABASE_URL;
    let res = mockRes(); await feedbackHandler(req(), res);
    expect(res.statusCode).toBe(503);
    process.env.SUPABASE_URL = URL_;
    global.fetch = jest.fn();
    res = mockRes(); await feedbackHandler(req({ headers: { "x-atr-beta": "" } }), res);
    expect(res.statusCode).toBe(403);
    res = mockRes(); await feedbackHandler(req({ method: "GET" }), res);
    expect(res.statusCode).toBe(405);
    expect(global.fetch).not.toHaveBeenCalled();
  });
  test("feedback: saves for a valid tester", async () => {
    global.fetch = jest.fn(async (url) => (url.includes("beta_testers") ? json(200, [TESTER]) : json(201, null)));
    const res = mockRes(); await feedbackHandler(req(), res);
    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual({ ok: true, photoSaved: false });
    expect(res.headers["Cache-Control"]).toBe("no-store");
  });
  test("feedback: 415 for non-JSON, 400 for invalid body", async () => {
    global.fetch = jest.fn(async () => json(200, [TESTER]));
    let res = mockRes(); await feedbackHandler(req({ headers: { "content-type": "text/plain" } }), res);
    expect(res.statusCode).toBe(415);
    res = mockRes(); await feedbackHandler(req({ body: { ai: AI, verdict: "?" } }), res);
    expect(res.statusCode).toBe(400);
  });
  test("beta-check: 403 for unknown, 200 with trait names (no cues) for a tester", async () => {
    global.fetch = jest.fn(async () => json(200, []));
    let res = mockRes(); await betaCheckHandler(req(), res);
    expect(res.statusCode).toBe(403);
    clearTesterCache();
    global.fetch = jest.fn(async () => json(200, [TESTER]));
    res = mockRes(); await betaCheckHandler(req(), res);
    expect(res.statusCode).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.name).toBe("Jane");
    expect(res.body.traits["central-bearded-dragon"]).toEqual(expect.arrayContaining([{ id: "translucent", name: "Translucent" }]));
    expect(JSON.stringify(res.body)).not.toMatch(/"cue"|"au"/);
  });
  test("beta-check: rate limited per IP", async () => {
    global.fetch = jest.fn(async () => json(200, []));
    let last;
    for (let i = 0; i < 11; i++) { last = mockRes(); await betaCheckHandler(req({ headers: { "x-forwarded-for": "198.51.100.7" } }), last); }
    expect(last.statusCode).toBe(429);
  });
});
