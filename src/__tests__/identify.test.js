/**
 * @jest-environment node
 */
// Unit tests for the AI ID function (lib/identify.js + api/identify.js).
// Jest-only: nothing under src/__tests__ is imported by the app, so it stays
// out of the production bundle.
import { SPECIES as APP_SPECIES } from "../data/species";

const lib = require("../../lib/identify");
const handler = require("../../api/identify");
const { clearTesterCache } = require("../../lib/beta");
const { MORPHS, TRAIT_IDS } = require("../../lib/morphs");

const INDEX = require("../../lib/speciesIndex");
const { identify, validateRequest, parseAnthropicResponse, buildAnthropicRequest, MAX_BASE64_CHARS } = lib;

const JPEG = Buffer.concat([Buffer.from([0xff, 0xd8, 0xff, 0xe0]), Buffer.alloc(200, 7)]).toString("base64");
const PNG = Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), Buffer.alloc(200, 1)]).toString("base64");

const apiReply = (obj, extra = {}) => ({
  ok: true, status: 200,
  json: async () => ({ content: [{ type: "text", text: JSON.stringify(obj) }], stop_reason: "end_turn", ...extra }),
});

describe("species mirror", () => {
  test("matches src/data/species.js", () => {
    const pick = s => ({ slug: s.slug, name: s.name, latin: s.latin, type: s.type });
    expect(lib.SPECIES).toEqual(APP_SPECIES.map(pick));
    expect(lib.SPECIES).toHaveLength(46);
  });
  test("every app species is exactly one index record, and the two Black-headed species stay apart", () => {
    for (const s of lib.SPECIES) {
      const rs = INDEX.RECORDS.filter(r => r.appSlug === s.slug);
      expect(rs).toHaveLength(1);
      expect(rs[0].slug).toBe(s.slug);
    }
    expect(INDEX.RECORDS.filter(r => r.appSlug)).toHaveLength(46);
    expect(INDEX.BY_SLUG.get("black-headed-monitor").scientific).toBe("Varanus tristis");
    expect(INDEX.BY_SLUG.get("black-headed-python").scientific).toBe("Aspidites melanocephalus");
  });
  test("schema asks for index names, not app slugs", () => {
    const item = lib.OUTPUT_SCHEMA.properties.suggestions.items;
    expect(item.properties.slug).toBeUndefined();
    expect(item.required).toEqual(expect.arrayContaining(["scientific_name", "common_name", "confidence"]));
  });
});

describe("species index mapping", () => {
  test("finds records by slug, scientific name, synonym, trinomial and unique common name", () => {
    const find = (q) => { const h = INDEX.findRecord(q); return h && [h.record.slug, h.via]; };
    expect(find({ slug: "Jacky-Dragon" })).toEqual(["jacky-dragon", "slug"]);
    expect(find({ scientific: "amphibolurus  muricatus" })).toEqual(["jacky-dragon", "scientific"]);
    expect(find({ scientific: "Lophognathus burnsi" })).toEqual(["channel-dragon", "synonym"]);
    expect(find({ scientific: "Tiliqua scincoides scincoides" })).toEqual(["eastern-blue-tongue-skink", "scientific"]);
    expect(find({ scientific: "Nephrurus spp." })).toEqual(["knob-tailed-gecko", "scientific"]);
    expect(find({ common: "Jacky Lizard" })).toEqual(["jacky-dragon", "common"]);
    expect(find({ scientific: "Pogona imaginaria", common: "Made-up Dragon" })).toBeNull();
  });
  test("an ambiguous common name doesn't match on its own", () => {
    expect(INDEX.findRecord({ common: "Northern Barred Frog" })).toBeNull();
  });
});

describe("validateRequest", () => {
  test("accepts raw base64 JPEG and sniffs the type", () => {
    expect(validateRequest({ image: JPEG })).toEqual({ data: JPEG, mediaType: "image/jpeg" });
  });
  test("accepts a data URL and strips the prefix", () => {
    expect(validateRequest({ image: `data:image/png;base64,${PNG}` })).toEqual({ data: PNG, mediaType: "image/png" });
  });
  test("uses the sniffed type over a mislabelled one", () => {
    expect(validateRequest({ image: `data:image/png;base64,${JPEG}` }).mediaType).toBe("image/jpeg");
  });
  const status = (body) => { try { validateRequest(body); return 200; } catch (e) { return e.status; } };
  test("rejects missing or malformed bodies", () => {
    expect(status(undefined)).toBe(400);
    expect(status([])).toBe(400);
    expect(status({})).toBe(400);
    expect(status({ image: 42 })).toBe(400);
    expect(status({ image: "abc" })).toBe(400);
    expect(status({ image: "!!!" + JPEG })).toBe(400);
  });
  test("rejects oversize images with 413", () => {
    expect(status({ image: "A".repeat(MAX_BASE64_CHARS + 4) })).toBe(413);
  });
  test("rejects non-image content and unsupported declared types with 415", () => {
    expect(status({ image: Buffer.alloc(200, 65).toString("base64") })).toBe(415);
    expect(status({ image: `data:image/heic;base64,${JPEG}` })).toBe(415);
  });
});

describe("buildAnthropicRequest", () => {
  const build = (model) => buildAnthropicRequest({ data: JPEG, mediaType: "image/jpeg" }, model);

  test("puts the image first and asks for JSON schema output", () => {
    const r = build();
    expect(r.model).toBe(lib.DEFAULT_MODEL);
    expect(r.messages[0].content[0]).toEqual({ type: "image", source: { type: "base64", media_type: "image/jpeg", data: JPEG } });
    expect(r.output_config.format.type).toBe("json_schema");
  });
  test("the whole species list is one prompt-cached system block", () => {
    const r = build();
    expect(r.system).toHaveLength(1);
    expect(r.system[0]).toMatchObject({ type: "text", cache_control: { type: "ephemeral", ttl: "1h" } });
    const sys = r.system[0].text;
    for (const rec of INDEX.RECORDS) expect(sys).toContain(rec.scientific);
    expect(sys).toContain("Jacky Dragon|Amphibolurus muricatus");
    expect(sys).toContain("Black-headed Monitor|Varanus tristis");
    // Byte-identical across requests, or the cache never hits.
    expect(build().system[0].text).toBe(sys);
    expect(JSON.stringify(build("claude-haiku-5-5").system)).toBe(JSON.stringify(r.system));
  });
  test("prompt weighs every species equally: no app slugs, no 'our species' steer, always 3", () => {
    const sys = build().system[0].text;
    expect(sys).not.toMatch(/not-one-of-our-species|Prefer species from the app/);
    expect(sys).not.toContain("eastern-water-dragon");
    expect(sys).toMatch(/equally possible/);
    expect(sys).toContain(`Return exactly ${lib.MAX_SUGGESTIONS} candidates`);
    expect(build().messages[0].content[1].text).toContain(`top ${lib.MAX_SUGGESTIONS}`);
  });
  test("temperature 0 only on models that accept sampling parameters", () => {
    expect(build("claude-sonnet-5-5")).not.toHaveProperty("temperature");
    expect(build("claude-haiku-5-5")).not.toHaveProperty("temperature");
    expect(build("claude-opus-4-7")).not.toHaveProperty("temperature");
    expect(build("claude-sonnet-4-6")).not.toHaveProperty("temperature");
    expect(build("claude-haiku-4-5").temperature).toBe(0);
    expect(build("claude-sonnet-4-5-20250929").temperature).toBe(0);
    expect(build("claude-opus-4-1").temperature).toBe(0);
  });
});

describe("parseAnthropicResponse", () => {
  const parse = (obj, extra) => parseAnthropicResponse({ content: [{ type: "text", text: JSON.stringify(obj) }], ...extra });
  const s = (scientific_name, common_name = "", confidence = "possible", extra = {}) => ({ scientific_name, common_name, confidence, reason: "", traits: [], ...extra });

  test("maps app species to the index with a care link", () => {
    const out = parse({ subject: "reptile", note: "", suggestions: [s("Morelia spilota", "x", "LIKELY", { reason: "Blotched pattern." })] });
    expect(out.suggestions[0]).toEqual({
      slug: "carpet-python", appSlug: "carpet-python", inApp: true, matched: true, name: "Carpet Python", latin: "Morelia spilota",
      group: "python", dangerouslyVenomous: false, confidence: "likely", reason: "Blotched pattern.", traits: [],
    });
  });
  test("a non-app species is matched but has no care link (Rowan's Jacky Dragon)", () => {
    const out = parse({ subject: "reptile", note: "", suggestions: [s("Amphibolurus muricatus", "Jacky Dragon", "likely"), s("Intellagama lesueurii", "Eastern Water Dragon")] });
    expect(out.suggestions[0]).toMatchObject({ slug: "jacky-dragon", appSlug: null, inApp: false, matched: true, name: "Jacky Dragon", latin: "Amphibolurus muricatus" });
    expect(out.suggestions[1]).toMatchObject({ slug: "eastern-water-dragon", inApp: true });
  });
  test("maps a model answer through a synonym to the current name", () => {
    const out = parse({ subject: "reptile", note: "", suggestions: [s("Lophognathus burnsi", "Burns' Dragon")] });
    expect(out.suggestions[0]).toMatchObject({ slug: "channel-dragon", matched: true, latin: "Amphibolurus burnsi", inApp: false });
  });
  test("flags dangerously venomous species from the index", () => {
    const out = parse({ subject: "reptile", note: "", suggestions: [s("Pseudonaja textilis", "Eastern Brown Snake", "likely"), s("Dendrelaphis punctulatus", "Common Tree Snake")] });
    expect(out.suggestions[0]).toMatchObject({ slug: "eastern-brown-snake", dangerouslyVenomous: true, inApp: false });
    expect(out.suggestions[1].dangerouslyVenomous).toBe(false);
  });
  test("a name that isn't in the index is shown unmatched, never as an index species", () => {
    const out = parse({ subject: "reptile", note: "", suggestions: [s("Pogona imaginaria", "Rainbow Bearded Dragon", "weird")] });
    expect(out.suggestions[0]).toEqual({
      slug: null, appSlug: null, inApp: false, matched: false, name: "Rainbow Bearded Dragon", latin: "Pogona imaginaria",
      group: null, dangerouslyVenomous: false, confidence: "possible", reason: "", traits: [],
    });
  });
  test("keeps 3, drops duplicates (same species via a synonym) and junk", () => {
    const out = parse({ subject: "reptile", note: "", suggestions: [
      s("Amphibolurus burnsi"), null, s("Lophognathus burnsi"), s("Amphibolurus muricatus"), s("Intellagama lesueurii"), s("Pogona barbata"),
    ] });
    expect(out.suggestions.map(x => x.slug)).toEqual(["channel-dragon", "jacky-dragon", "eastern-water-dragon"]);
  });
  test("drops suggestions when the subject isn't a reptile or frog", () => {
    const out = parse({ subject: "not_reptile_or_frog", note: "Looks like a cat.", suggestions: [s("Aspidites ramsayi", "Woma", "likely")] });
    expect(out).toEqual({ subject: "not_reptile_or_frog", notNative: false, note: "Looks like a cat.", suggestions: [] });
  });
  test("a non-native animal is flagged and its guesses are outside coverage, never matched to the index", () => {
    const out = parse({ subject: "reptile", australian_native: false, note: "", suggestions: [
      s("Eublepharis macularius", "Leopard Gecko", "likely"),
      s("Hemidactylus frenatus", "Asian House Gecko"),
      // Even a name that is in the index stays unmatched when the model says it's not native.
      s("Christinus marmoratus", "Marbled Gecko", "unlikely"),
    ] });
    expect(out.notNative).toBe(true);
    expect(out.suggestions).toHaveLength(3);
    for (const sug of out.suggestions) {
      expect(sug).toMatchObject({ slug: null, appSlug: null, inApp: false, matched: false, outsideCoverage: true, traits: [] });
    }
    expect(out.suggestions[0]).toMatchObject({ name: "Leopard Gecko", latin: "Eublepharis macularius", confidence: "likely" });
  });
  test("introduced species (not in the index yet) are treated as not native", () => {
    const out = parse({ subject: "frog", australian_native: false, note: "", suggestions: [s("Rhinella marina", "Cane Toad", "likely")] });
    expect(out.notNative).toBe(true);
    expect(out.suggestions[0]).toMatchObject({ name: "Cane Toad", matched: false, outsideCoverage: true });
    expect(INDEX.findRecord({ scientific: "Rhinella marina" })).toBeNull();
  });
  test("natives aren't flagged, and a missing flag counts as native", () => {
    expect(parse({ subject: "reptile", australian_native: true, note: "", suggestions: [s("Amphibolurus muricatus")] }).notNative).toBe(false);
    const out = parse({ subject: "reptile", note: "", suggestions: [s("Amphibolurus muricatus")] });
    expect(out.notNative).toBe(false);
    expect(out.suggestions[0].outsideCoverage).toBeUndefined();
  });
  test("schema and prompt cover non-native animals", () => {
    expect(lib.OUTPUT_SCHEMA.required).toContain("australian_native");
    const sys = buildAnthropicRequest({ data: JPEG, mediaType: "image/jpeg" }).system[0].text;
    expect(sys).toMatch(/Cane Toad/);
    expect(sys).toMatch(/australian_native to false/);
  });
  test("unknown subject becomes unclear", () => {
    expect(parse({ subject: "dragon", suggestions: [], note: "" }).subject).toBe("unclear");
  });
  test("handles bad replies", () => {
    const st = (msg) => { try { parseAnthropicResponse(msg); return 200; } catch (e) { return e.status; } };
    expect(st(null)).toBe(502);
    expect(st({ content: [] })).toBe(502);
    expect(st({ content: [{ type: "text", text: "not json" }] })).toBe(502);
    expect(st({ content: [{ type: "text", text: "{}" }], stop_reason: "max_tokens" })).toBe(502);
    expect(st({ content: [], stop_reason: "refusal" })).toBe(422);
  });
});

describe("traits", () => {
  const parse = (obj) => parseAnthropicResponse({ content: [{ type: "text", text: JSON.stringify(obj) }] });
  const sugg = (slug, traits) => ({ slug, common_name: "", latin_name: "", confidence: "likely", reason: "", traits });

  test("morph list keys are real app slugs, ids are consistent and every entry has a cue", () => {
    const slugs = new Set(lib.SPECIES.map(s => s.slug));
    const names = {};
    for (const [slug, list] of Object.entries(MORPHS)) {
      expect(slugs.has(slug)).toBe(true);
      for (const t of list) {
        expect(t.id).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
        expect(t.cue.length).toBeGreaterThan(10);
        expect(["established", "check"]).toContain(t.au);
        if (names[t.id]) expect(t.name).toBe(names[t.id]);
        names[t.id] = t.name;
      }
    }
    expect(MORPHS["central-bearded-dragon"].map(t => t.id)).toEqual(expect.arrayContaining(["translucent", "hypomelanistic", "leatherback", "silkback", "zero", "witblits", "dunner", "paradox", "red", "citrus", "yellow"]));
  });
  test("schema and prompt carry the trait list", () => {
    const item = lib.OUTPUT_SCHEMA.properties.suggestions.items;
    expect(item.required).toContain("traits");
    expect(item.properties.traits.items.properties.id.enum).toEqual(TRAIT_IDS);
    const sys = buildAnthropicRequest({ data: JPEG, mediaType: "image/jpeg" }).system[0].text;
    expect(sys).toContain("Central Bearded Dragon|Pogona vitticeps:");
    expect(sys).toContain("translucent (Translucent):");
  });
  test("returns combined traits (translucent + leatherback), likely first", () => {
    const out = parse({ subject: "reptile", note: "", suggestions: [sugg("central-bearded-dragon", [
      { id: "leatherback", confidence: "possible" }, { id: "Translucent", confidence: "LIKELY" }, { id: "hypomelanistic", confidence: "likely" },
    ])] });
    expect(out.suggestions[0].traits).toEqual([
      { id: "translucent", name: "Translucent", confidence: "likely" },
      { id: "hypomelanistic", name: "Hypomelanistic", confidence: "likely" },
      { id: "leatherback", name: "Leatherback", confidence: "possible" },
    ]);
  });
  test("drops traits not listed for that species, duplicates and junk", () => {
    const out = parse({ subject: "reptile", note: "", suggestions: [
      sugg("central-bearded-dragon", [{ id: "jaguar", confidence: "likely" }, { id: "zero", confidence: "odd" }, { id: "zero", confidence: "likely" }, null, "red", { id: 4 }]),
      sugg("lace-monitor", [{ id: "albino", confidence: "likely" }]),
      { ...sugg(null, [{ id: "albino", confidence: "likely" }]), scientific_name: "Amphibolurus muricatus" },
    ] });
    expect(out.suggestions[0].traits).toEqual([{ id: "zero", name: "Zero", confidence: "possible" }]);
    expect(out.suggestions[1].traits).toEqual([]);
    // Non-app species have no morph list, so no traits.
    expect(out.suggestions[2]).toMatchObject({ slug: "jacky-dragon", traits: [] });
  });
  test("missing traits field is fine, and the list is capped", () => {
    expect(parse({ subject: "reptile", note: "", suggestions: [sugg("carpet-python")] }).suggestions[0].traits).toEqual([]);
    const all = MORPHS["central-bearded-dragon"].map(t => ({ id: t.id, confidence: "likely" }));
    expect(parse({ subject: "reptile", note: "", suggestions: [sugg("central-bearded-dragon", all)] }).suggestions[0].traits).toHaveLength(lib.MAX_TRAITS);
  });
});

describe("identify (mocked fetch)", () => {
  test("503 without an API key, and never calls fetch", async () => {
    const fetchImpl = jest.fn();
    expect(await identify({ image: JPEG }, { apiKey: "", fetchImpl })).toEqual({ status: 503, body: { error: "AI ID isn't set up yet." } });
    expect(fetchImpl).not.toHaveBeenCalled();
  });
  test("validation errors don't call fetch", async () => {
    const fetchImpl = jest.fn();
    expect((await identify({}, { apiKey: "k", fetchImpl })).status).toBe(400);
    expect(fetchImpl).not.toHaveBeenCalled();
  });
  test("sends the right headers and returns parsed suggestions", async () => {
    const fetchImpl = jest.fn(async () => apiReply({ subject: "frog", note: "", suggestions: [{ scientific_name: "Litoria caerulea", common_name: "Green Tree Frog", confidence: "likely", reason: "Green, large toe pads.", traits: [] }] }));
    const out = await identify({ image: JPEG }, { apiKey: "test-key", model: "claude-haiku-5-5", fetchImpl });
    expect(out.status).toBe(200);
    expect(out.body.suggestions[0]).toMatchObject({ slug: "green-tree-frog", inApp: true, name: "Green Tree Frog", traits: [] });
    expect(out.body.model).toBe("claude-haiku-5-5");
    const [url, init] = fetchImpl.mock.calls[0];
    expect(url).toBe("https://api.anthropic.com/v1/messages");
    expect(init.headers).toMatchObject({ "x-api-key": "test-key", "anthropic-version": "2023-06-01" });
    expect(JSON.parse(init.body).model).toBe("claude-haiku-5-5");
  });
  test("maps upstream failures without leaking details", async () => {
    const err = jest.spyOn(console, "error").mockImplementation(() => {});
    expect((await identify({ image: JPEG }, { apiKey: "k", fetchImpl: async () => ({ ok: false, status: 429 }) })).status).toBe(503);
    const r = await identify({ image: JPEG }, { apiKey: "k", fetchImpl: async () => ({ ok: false, status: 400 }) });
    expect(r).toEqual({ status: 502, body: { error: "The ID service had a problem. Try again." } });
    expect((await identify({ image: JPEG }, { apiKey: "k", fetchImpl: async () => { throw new Error("net"); } })).status).toBe(502);
    // Logs never contain the image or key.
    for (const call of err.mock.calls) expect(call.join(" ")).not.toMatch(new RegExp(`${JPEG.slice(0, 20)}|\\bk\\b`));
    err.mockRestore();
  });
});

describe("api/identify handler", () => {
  const CODE = "A".repeat(43);
  const mockRes = () => {
    const res = { headers: {}, statusCode: 200, body: undefined };
    res.setHeader = (k, v) => { res.headers[k] = v; };
    res.status = (c) => { res.statusCode = c; return res; };
    res.json = (b) => { res.body = b; return res; };
    return res;
  };
  const req = (over = {}) => {
    const headers = { "content-type": "application/json", "x-atr-beta": CODE, "x-forwarded-for": `10.0.0.${Math.random()}`, ...(over.headers || {}) };
    return { method: "POST", body: { image: JPEG }, ...over, headers };
  };
  const ENV = ["ANTHROPIC_API_KEY", "SUPABASE_URL", "SUPABASE_SECRET_KEY"];
  const saved = Object.fromEntries(ENV.map(k => [k, process.env[k]]));
  const savedFetch = global.fetch;
  // Supabase says the tester exists; Anthropic isn't configured.
  const testerFetch = (rows = [{ id: "t1", name: "Tester" }]) => jest.fn(async () => ({ ok: true, status: 200, json: async () => rows }));
  beforeEach(() => {
    clearTesterCache();
    process.env.SUPABASE_URL = "https://ledcvbyiqkygcdleucqo.supabase.co";
    process.env.SUPABASE_SECRET_KEY = "sb_secret_test";
    delete process.env.ANTHROPIC_API_KEY;
    global.fetch = testerFetch();
  });
  afterEach(() => {
    for (const k of ENV) { if (saved[k] === undefined) delete process.env[k]; else process.env[k] = saved[k]; }
    global.fetch = savedFetch;
  });

  test("405 for non-POST", async () => {
    const res = mockRes();
    await handler(req({ method: "GET" }), res);
    expect(res.statusCode).toBe(405);
    expect(res.headers.Allow).toBe("POST");
  });
  test("503 when Supabase isn't configured, before anything else", async () => {
    delete process.env.SUPABASE_SECRET_KEY;
    const res = mockRes();
    await handler(req(), res);
    expect(res.statusCode).toBe(503);
    expect(res.body.error).toBe("The AI ID beta isn't set up yet.");
    expect(global.fetch).not.toHaveBeenCalled();
  });
  test("403 without an invite code, with a malformed one, or an unknown one", async () => {
    for (const code of [undefined, "short", "x".repeat(40) + "!"]) {
      const res = mockRes();
      await handler(req({ headers: { "content-type": "application/json", "x-atr-beta": code } }), res);
      expect(res.statusCode).toBe(403);
      expect(res.body.error).toBe("This feature isn't available.");
    }
    expect(global.fetch).not.toHaveBeenCalled();
    global.fetch = testerFetch([]);
    const res = mockRes();
    await handler(req(), res);
    expect(res.statusCode).toBe(403);
  });
  test("checks the code with the secret key against active testers only", async () => {
    const res = mockRes();
    await handler(req(), res);
    const [url, init] = global.fetch.mock.calls[0];
    expect(url).toBe(`https://ledcvbyiqkygcdleucqo.supabase.co/rest/v1/beta_testers?select=id,name,sections,is_admin&invite_code=eq.${CODE}&active=is.true&limit=1`);
    expect(init.headers).toMatchObject({ apikey: "sb_secret_test", Authorization: "Bearer sb_secret_test" });
    // Gate passed; Anthropic key missing → the identify 503.
    expect(res.statusCode).toBe(503);
    expect(res.body.error).toBe("AI ID isn't set up yet.");
    expect(res.headers["Cache-Control"]).toBe("no-store");
  });
  test("415 for non-JSON once the gate passes", async () => {
    const res = mockRes();
    await handler(req({ headers: { "content-type": "text/plain", "x-atr-beta": CODE } }), res);
    expect(res.statusCode).toBe(415);
  });
  test("400 when the body getter throws on malformed JSON", async () => {
    const r = req();
    Object.defineProperty(r, "body", { get() { throw new Error("bad json"); } });
    const res = mockRes();
    await handler(r, res);
    expect(res.statusCode).toBe(400);
  });
  test("502 when Supabase is down", async () => {
    const err = jest.spyOn(console, "error").mockImplementation(() => {});
    global.fetch = jest.fn(async () => ({ ok: false, status: 500 }));
    const res = mockRes();
    await handler(req(), res);
    expect(res.statusCode).toBe(502);
    for (const call of err.mock.calls) expect(call.join(" ")).not.toMatch(/sb_secret_test|AAAAAAAAAA/);
    err.mockRestore();
  });
  test("429 after too many requests from one IP", async () => {
    const ip = { "content-type": "application/json", "x-atr-beta": CODE, "x-forwarded-for": "203.0.113.9" };
    let last;
    for (let i = 0; i < 9; i++) { last = mockRes(); await handler({ method: "POST", headers: ip, body: { image: JPEG } }, last); }
    expect(last.statusCode).toBe(429);
  });
});
