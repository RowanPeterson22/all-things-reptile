/**
 * @jest-environment node
 */
// Unit tests for the AI ID function (lib/identify.js + api/identify.js).
// Jest-only: nothing under src/__tests__ is imported by the app, so it stays
// out of the production bundle.
import { SPECIES as APP_SPECIES } from "../data/species";

const lib = require("../../lib/identify");
const handler = require("../../api/identify");

const { identify, validateRequest, parseAnthropicResponse, buildAnthropicRequest, MAX_BASE64_CHARS, OTHER } = lib;

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
  test("schema enum lists every slug plus the escape hatch", () => {
    const enumSlugs = lib.OUTPUT_SCHEMA.properties.suggestions.items.properties.slug.enum;
    expect(enumSlugs).toContain("black-headed-monitor");
    expect(enumSlugs).toContain("black-headed-python");
    expect(enumSlugs).toContain(OTHER);
    expect(new Set(enumSlugs).size).toBe(47);
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
  test("puts the image first and asks for JSON schema output", () => {
    const r = buildAnthropicRequest({ data: JPEG, mediaType: "image/jpeg" });
    expect(r.model).toBe(lib.DEFAULT_MODEL);
    expect(r.messages[0].content[0]).toEqual({ type: "image", source: { type: "base64", media_type: "image/jpeg", data: JPEG } });
    expect(r.output_config.format.type).toBe("json_schema");
    expect(r.system).toContain("black-headed-monitor | Black-headed Monitor | Varanus tristis");
  });
});

describe("parseAnthropicResponse", () => {
  const parse = (obj, extra) => parseAnthropicResponse({ content: [{ type: "text", text: JSON.stringify(obj) }], ...extra });

  test("maps our species to app data and keeps others unlinked", () => {
    const out = parse({
      subject: "reptile", note: "",
      suggestions: [
        { slug: "Carpet-Python", common_name: "x", latin_name: "y", confidence: "LIKELY", reason: "Blotched pattern." },
        { slug: OTHER, common_name: "Eastern Brown Snake", latin_name: "Pseudonaja textilis", confidence: "possible", reason: "Uniform brown." },
        { slug: "made-up-slug", common_name: "Red-bellied Black Snake", latin_name: "Pseudechis porphyriacus", confidence: "weird", reason: "" },
        { slug: "woma-python", common_name: "", latin_name: "", confidence: "unlikely", reason: "" },
      ],
    });
    expect(out.subject).toBe("reptile");
    expect(out.suggestions).toHaveLength(3);
    expect(out.suggestions[0]).toEqual({ slug: "carpet-python", inApp: true, name: "Carpet Python", latin: "Morelia spilota", confidence: "likely", reason: "Blotched pattern." });
    expect(out.suggestions[1]).toMatchObject({ slug: null, inApp: false, name: "Eastern Brown Snake", latin: "Pseudonaja textilis" });
    expect(out.suggestions[2]).toMatchObject({ slug: null, inApp: false, confidence: "possible" });
  });
  test("drops suggestions when the subject isn't a reptile or frog", () => {
    const out = parse({ subject: "not_reptile_or_frog", note: "Looks like a cat.", suggestions: [{ slug: "woma-python", common_name: "", latin_name: "", confidence: "likely", reason: "" }] });
    expect(out).toEqual({ subject: "not_reptile_or_frog", note: "Looks like a cat.", suggestions: [] });
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
    const fetchImpl = jest.fn(async () => apiReply({ subject: "frog", note: "", suggestions: [{ slug: "green-tree-frog", common_name: "", latin_name: "", confidence: "likely", reason: "Green, large toe pads." }] }));
    const out = await identify({ image: JPEG }, { apiKey: "test-key", model: "claude-haiku-5-5", fetchImpl });
    expect(out.status).toBe(200);
    expect(out.body.suggestions[0]).toMatchObject({ slug: "green-tree-frog", inApp: true, name: "Green Tree Frog" });
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
  const mockRes = () => {
    const res = { headers: {}, statusCode: 200, body: undefined };
    res.setHeader = (k, v) => { res.headers[k] = v; };
    res.status = (c) => { res.statusCode = c; return res; };
    res.json = (b) => { res.body = b; return res; };
    return res;
  };
  const req = (over = {}) => ({ method: "POST", headers: { "content-type": "application/json", "x-forwarded-for": `10.0.0.${Math.random()}` }, body: { image: JPEG }, ...over });
  const saved = process.env.ANTHROPIC_API_KEY;
  afterEach(() => { if (saved === undefined) delete process.env.ANTHROPIC_API_KEY; else process.env.ANTHROPIC_API_KEY = saved; });

  test("405 for non-POST", async () => {
    const res = mockRes();
    await handler(req({ method: "GET" }), res);
    expect(res.statusCode).toBe(405);
    expect(res.headers.Allow).toBe("POST");
  });
  test("415 for non-JSON", async () => {
    const res = mockRes();
    await handler(req({ headers: { "content-type": "text/plain" } }), res);
    expect(res.statusCode).toBe(415);
  });
  test("400 when the body getter throws on malformed JSON", async () => {
    const r = req();
    Object.defineProperty(r, "body", { get() { throw new Error("bad json"); } });
    const res = mockRes();
    await handler(r, res);
    expect(res.statusCode).toBe(400);
  });
  test("503 when ANTHROPIC_API_KEY is unset", async () => {
    delete process.env.ANTHROPIC_API_KEY;
    const res = mockRes();
    await handler(req(), res);
    expect(res.statusCode).toBe(503);
    expect(res.body.error).toBe("AI ID isn't set up yet.");
    expect(res.headers["Cache-Control"]).toBe("no-store");
  });
  test("429 after too many requests from one IP", async () => {
    delete process.env.ANTHROPIC_API_KEY;
    const ip = { "content-type": "application/json", "x-forwarded-for": "203.0.113.9" };
    let last;
    for (let i = 0; i < 9; i++) { last = mockRes(); await handler(req({ headers: ip }), last); }
    expect(last.statusCode).toBe(429);
  });
});
