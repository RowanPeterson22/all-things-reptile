/**
 * @jest-environment node
 */
// Species content endpoint (GET /api/species-photos?content=<slug>, D5) and
// the pre-launch gate: /api/* bypasses the middleware, so before launch the
// content must only reach a valid atr_gate cookie or tester code; everyone
// else gets 401 and Supabase is never asked. Supabase is a fake behind
// global.fetch.

const host = require("vm").runInThisContext("({ crypto, TextEncoder, TextDecoder })");
for (const k of ["crypto", "TextEncoder", "TextDecoder"]) if (!globalThis[k]) globalThis[k] = host[k];

const handler = require("../../api/species-photos");
const gate = require("../../lib/gate");
const { clearTesterCache } = require("../../lib/beta");
const { clearContentCache } = require("../../lib/speciesContent");
const SNAPSHOT = require("../data/speciesContent.json");

const SECRET = "s".repeat(48);
const TESTER = "11111111-2222-4333-8444-555555555555";
const CODE = "c".repeat(43);
const REVOKED = "r".repeat(43);
const ACKIE = SNAPSHOT.find(d => d.slug === "ackie-monitor");

let rows;
let calls;
const res = (status, body) => ({ ok: status >= 200 && status < 300, status, json: async () => body });
const fakeFetch = async (url) => {
  const u = new URL(url);
  calls.push(u.pathname);
  if (u.pathname === "/rest/v1/beta_testers") {
    const code = decodeURIComponent((u.searchParams.get("invite_code") || "").replace(/^eq\./, ""));
    return res(200, code === CODE ? [{ id: TESTER, name: "Tess", sections: ["species"], is_admin: false }] : []);
  }
  if (u.pathname === "/rest/v1/species_content") {
    const slug = decodeURIComponent((u.searchParams.get("slug") || "").replace(/^eq\./, ""));
    return res(200, rows[slug] ? [{ published: rows[slug] }] : []);
  }
  return res(404, null);
};

const mockRes = () => {
  const r = { headers: {}, statusCode: 200, body: undefined };
  r.setHeader = (k, v) => { r.headers[k.toLowerCase()] = v; };
  r.status = (c) => { r.statusCode = c; return r; };
  r.json = (b) => { r.body = b; return r; };
  return r;
};
const get = async (slug, headers = {}) => {
  const r = mockRes();
  await handler({ method: "GET", headers, query: { content: slug } }, r);
  return r;
};
const cookieFor = async (over = {}) => `${gate.COOKIE}=${await gate.signToken({ testerId: TESTER, exp: gate.nowSec() + 3600, ...over }, SECRET)}`;

const saved = { env: { ...process.env }, fetch: global.fetch };
let errSpy;
beforeEach(() => {
  rows = { "ackie-monitor": ACKIE };
  calls = [];
  clearTesterCache();
  clearContentCache();
  global.fetch = jest.fn(fakeFetch);
  Object.assign(process.env, { SUPABASE_URL: "https://ledcvbyiqkygcdleucqo.supabase.co", SUPABASE_SECRET_KEY: "sb_secret_test", ATR_GATE_SECRET: SECRET, VERCEL_ENV: "production" });
  delete process.env.ATR_PUBLIC;
  errSpy = jest.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => { process.env = { ...saved.env }; global.fetch = saved.fetch; errSpy.mockRestore(); });

describe("gated (before launch)", () => {
  test("no cookie, no code: 401, not cached, Supabase never asked", async () => {
    const r = await get("ackie-monitor");
    expect(r.statusCode).toBe(401);
    expect(r.headers["cache-control"]).toBe("no-store");
    expect(r.body.species).toBeUndefined();
    expect(calls).toEqual([]);
  });

  test("a forged, expired or wrong-secret cookie: 401", async () => {
    const good = (await cookieFor()).split("=")[1];
    const [v, body, sig] = good.split(".");
    const bad = [
      `${gate.COOKIE}=${v}.${body}.${sig.slice(0, -1)}${sig.endsWith("A") ? "B" : "A"}`,
      await cookieFor({ exp: gate.nowSec() - 5 }),
      `${gate.COOKIE}=${await gate.signToken({ testerId: TESTER, exp: gate.nowSec() + 3600 }, "x".repeat(48))}`,
      `${gate.COOKIE}=garbage`,
    ];
    for (const cookie of bad) {
      const r = await get("ackie-monitor", { cookie });
      expect(r.statusCode).toBe(401);
    }
    expect(calls).toEqual([]);
  });

  test("a valid atr_gate cookie: 200 with the document, private cache only", async () => {
    const r = await get("ackie-monitor", { cookie: `other=1; ${await cookieFor()}` });
    expect(r.statusCode).toBe(200);
    expect(r.body.species).toEqual(ACKIE);
    expect(r.headers["cache-control"]).toMatch(/^private/);
    expect(r.headers["cache-control"]).not.toMatch(/s-maxage|public/);
  });

  test("a valid tester code (x-atr-beta): 200; an unknown or revoked code: 401", async () => {
    const ok = await get("ackie-monitor", { "x-atr-beta": CODE });
    expect(ok.statusCode).toBe(200);
    expect(ok.headers["cache-control"]).toMatch(/^private/);
    const no = await get("ackie-monitor", { "x-atr-beta": REVOKED });
    expect(no.statusCode).toBe(401);
    expect(no.body.species).toBeUndefined();
    const junk = await get("ackie-monitor", { "x-atr-beta": "short" });
    expect(junk.statusCode).toBe(401);
  });

  test("no ATR_GATE_SECRET in production: fails closed even with a cookie", async () => {
    const cookie = await cookieFor();
    delete process.env.ATR_GATE_SECRET;
    const r = await get("ackie-monitor", { cookie });
    expect(r.statusCode).toBe(401);
  });

  test("vercel dev with no secret stays open, like the middleware", async () => {
    delete process.env.ATR_GATE_SECRET;
    process.env.VERCEL_ENV = "development";
    const r = await get("ackie-monitor");
    expect(r.statusCode).toBe(200);
  });

  test("the gate is checked before the slug, so nothing about species leaks", async () => {
    const r = await get("../etc/passwd");
    expect(r.statusCode).toBe(401);
  });
});

describe("public (ATR_PUBLIC=true)", () => {
  beforeEach(() => { process.env.ATR_PUBLIC = "true"; });

  test("anyone gets the published document, edge-cached", async () => {
    const r = await get("ackie-monitor");
    expect(r.statusCode).toBe(200);
    expect(r.body.species.slug).toBe("ackie-monitor");
    expect(r.headers["cache-control"]).toMatch(/^public, .*s-maxage=300/);
  });

  test("bad slugs and unpublished species: 404", async () => {
    expect((await get("Ackie Monitor")).statusCode).toBe(404);
    expect((await get("lace-monitor")).statusCode).toBe(404);
  });

  test("a document that fails the shape (e.g. a Dubia roach feeder) is never served", async () => {
    const bad = JSON.parse(JSON.stringify(ACKIE));
    bad.tabs[1].blocks[1].items[0].name = "Dubia roaches";
    rows["ackie-monitor"] = bad;
    const r = await get("ackie-monitor");
    expect(r.statusCode).toBe(404);
    expect(r.body.species).toBeUndefined();
  });

  test("Supabase down: 502, not cached", async () => {
    global.fetch = jest.fn(async () => res(500, null));
    const r = await get("ackie-monitor");
    expect(r.statusCode).toBe(502);
    expect(r.headers["cache-control"]).toBe("no-store");
  });
});
