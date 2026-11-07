/**
 * @jest-environment node
 */
// Pre-launch gate: middleware.js (holding page vs app) and the invite
// bootstrap in /api/beta-check (cookie + redirect with no code in the URL).
// Node environment for Web Crypto, Request and Response. Supabase is a mocked fetch.

import { handleGate, config } from "../../middleware";

// Jest 27's node environment doesn't expose Node 22's fetch-API and Web Crypto
// globals, which Vercel's runtime has. Borrow the real ones from the host.
const host = require("vm").runInThisContext("({ Request, Response, Headers, crypto })");
for (const k of ["Request", "Response", "Headers", "crypto"]) if (!globalThis[k]) globalThis[k] = host[k];

const gate = require("../../lib/gate");
const { holdingPage } = require("../../lib/holdingPage");
const betaCheck = require("../../api/beta-check");
const { clearTesterCache } = require("../../lib/beta");

const SECRET = "s".repeat(48);
const TESTER = "11111111-2222-4333-8444-555555555555";
const CODE = "a".repeat(43);
const HOST = "https://app.allthingsreptile.com.au";
const ENV = { ATR_GATE_SECRET: SECRET, VERCEL_ENV: "production" };

const reqFor = (path, cookie) => new Request(`${HOST}${path}`, { headers: cookie ? { cookie } : {} });
const isHolding = async (res) => res.status === 200 && res.headers.get("x-middleware-next") === null && /coming 2027/.test(await res.text());
const passes = (res) => res.headers.get("x-middleware-next") === "1";
const validCookie = async (over = {}) => `${gate.COOKIE}=${await gate.signToken({ testerId: TESTER, exp: gate.nowSec() + 3600, ...over }, SECRET)}`;

describe("middleware", () => {
  test("matcher covers every path except /api", () => {
    const re = new RegExp(`^${config.matcher[0]}$`);
    for (const p of ["/", "/id", "/species/carpet-python", "/static/js/main.js", "/admin"]) expect(re.test(p)).toBe(true);
    expect(re.test("/api/beta-check")).toBe(false);
  });

  test("no cookie: holding page, 200, noindex, no-store, for pages and assets alike", async () => {
    for (const p of ["/", "/care", "/static/js/main.5facbfc8.js", "/index.html", "/admin"]) {
      const res = await handleGate(reqFor(p), ENV);
      expect(res.status).toBe(200);
      expect(res.headers.get("x-robots-tag")).toBe("noindex, nofollow");
      expect(res.headers.get("cache-control")).toBe("no-store");
      expect(res.headers.get("content-type")).toMatch(/^text\/html/);
      const html = await res.text();
      expect(html).toContain("All Things Reptile — coming 2027");
      expect(html).toContain("Have an invite? Use the link we sent you.");
      expect(html).toContain('<meta name="robots" content="noindex, nofollow">');
      expect(html).not.toMatch(/<script[^>]+src=|static\/js|Carpet Python/);
    }
  });

  test("a bad signature, a tampered payload, an expired cookie or the wrong secret: holding page", async () => {
    const good = (await validCookie()).split("=")[1];
    const [v, body, sig] = good.split(".");
    const flipped = sig.slice(0, -1) + (sig.slice(-1) === "A" ? "B" : "A");
    const otherBody = Buffer.from(JSON.stringify({ t: "someone-else", exp: gate.nowSec() + 3600 })).toString("base64url");
    const cases = [
      `${gate.COOKIE}=${v}.${body}.${flipped}`,
      `${gate.COOKIE}=${v}.${otherBody}.${sig}`,
      `${gate.COOKIE}=garbage`,
      await validCookie({ exp: gate.nowSec() - 1 }),
      `${gate.COOKIE}=${await gate.signToken({ testerId: TESTER, exp: gate.nowSec() + 3600 }, "x".repeat(48))}`,
    ];
    for (const c of cases) expect(await isHolding(await handleGate(reqFor("/", c), ENV))).toBe(true);
  });

  test("a valid cookie gets the app (continues, still noindex)", async () => {
    const res = await handleGate(reqFor("/species/carpet-python", `other=1; ${await validCookie()}`), ENV);
    expect(passes(res)).toBe(true);
    expect(res.headers.get("x-robots-tag")).toBe("noindex, nofollow");
  });

  test("/api passes through without a cookie", async () => {
    expect(passes(await handleGate(reqFor("/api/beta-check"), ENV))).toBe(true);
    expect(passes(await handleGate(reqFor("/api/identify"), { ...ENV, ATR_GATE_SECRET: "" }))).toBe(true);
  });

  test("/id?invite= is rewritten to the bootstrap, gated or public", async () => {
    for (const env of [ENV, { ...ENV, ATR_PUBLIC: "true" }, { VERCEL_ENV: "production" }]) {
      const res = await handleGate(reqFor(`/id?invite=${CODE}`), env);
      const dest = new URL(res.headers.get("x-middleware-rewrite"));
      expect(dest.pathname).toBe("/api/beta-check");
      expect(dest.searchParams.get("invite")).toBe(CODE);
    }
  });

  test("robots.txt disallows everything while gated; favicon is served", async () => {
    const r = await handleGate(reqFor("/robots.txt"), ENV);
    expect(await r.text()).toBe("User-agent: *\nDisallow: /\n");
    expect(passes(await handleGate(reqFor("/favicon.ico"), ENV))).toBe(true);
    expect(passes(await handleGate(reqFor("/holding-logo.webp"), ENV))).toBe(true);
    expect(passes(await handleGate(reqFor("/holding-logo.png"), ENV))).toBe(true);
  });

  test("ATR_PUBLIC=true opens everything and allows robots", async () => {
    const env = { ...ENV, ATR_PUBLIC: "true" };
    for (const p of ["/", "/admin", "/static/js/main.js"]) expect(passes(await handleGate(reqFor(p), env))).toBe(true);
    expect(passes(await handleGate(reqFor("/"), { ATR_PUBLIC: "TRUE", VERCEL_ENV: "production" }))).toBe(true);
    expect(await (await handleGate(reqFor("/robots.txt"), env)).text()).toBe("User-agent: *\nDisallow:\n");
    // Anything but "true" keeps the gate.
    expect(await isHolding(await handleGate(reqFor("/"), { ...ENV, ATR_PUBLIC: "yes" }))).toBe(true);
  });

  test("a missing or short secret fails closed, even with a cookie; vercel dev stays open", async () => {
    const cookie = await validCookie();
    for (const env of [{ VERCEL_ENV: "production" }, { VERCEL_ENV: "preview" }, { ATR_GATE_SECRET: "short", VERCEL_ENV: "production" }, {}]) {
      expect(await isHolding(await handleGate(reqFor("/", cookie), env))).toBe(true);
    }
    expect(passes(await handleGate(reqFor("/"), { VERCEL_ENV: "development" }))).toBe(true);
  });
});

describe("gate token", () => {
  test("round-trips and refuses to sign without a usable secret", async () => {
    const exp = gate.nowSec() + 60;
    const t = await gate.signToken({ testerId: TESTER, exp }, SECRET);
    expect(await gate.verifyToken(t, SECRET)).toEqual({ testerId: TESTER, exp });
    expect(await gate.verifyToken(t, "")).toBeNull();
    await expect(gate.signToken({ testerId: TESTER, exp }, "short")).rejects.toThrow();
  });
  test("cookie attributes: HttpOnly, Secure, SameSite=Lax, 14 days", () => {
    const c = gate.gateCookie("v1.a.b");
    expect(c).toMatch(/^atr_gate=v1\.a\.b; Path=\/; Max-Age=1209600; HttpOnly; Secure; SameSite=Lax$/);
    expect(gate.MAX_AGE).toBe(14 * 24 * 3600);
  });
  test("holding page clears a stored code only when told the invite is inactive", () => {
    expect(holdingPage({ notice: "inactive" })).toContain("localStorage.removeItem(KEY); return;");
    expect(holdingPage()).not.toContain("localStorage.removeItem");
  });
});

// ─── Invite bootstrap (/api/beta-check) ───────────────────────────
const mockRes = () => {
  const r = { headers: {}, statusCode: 200, body: undefined };
  r.setHeader = (k, v) => { r.headers[k.toLowerCase()] = v; };
  r.status = (c) => { r.statusCode = c; return r; };
  r.json = (b) => { r.body = b; return r; };
  r.send = (b) => { r.body = b; return r; };
  return r;
};
let ip = 0;
const call = async ({ method = "GET", query = {}, headers = {} } = {}) => {
  const r = mockRes();
  await betaCheck({ method, query, headers: { "x-forwarded-for": `10.7.0.${ip++}`, ...headers } }, r);
  return r;
};
const testerRows = (rows) => jest.fn(async () => ({ ok: true, status: 200, json: async () => rows }));
const cookieValue = (setCookies, name) => {
  const hit = (setCookies || []).find(c => c.startsWith(`${name}=`));
  return hit ? hit.slice(name.length + 1).split(";")[0] : null;
};

describe("invite bootstrap", () => {
  const saved = { ...process.env };
  const savedFetch = global.fetch;
  beforeEach(() => {
    clearTesterCache();
    Object.assign(process.env, { SUPABASE_URL: "https://ledcvbyiqkygcdleucqo.supabase.co", SUPABASE_SECRET_KEY: "sb_secret_test", ATR_GATE_SECRET: SECRET, VERCEL_ENV: "production" });
    delete process.env.ATR_PUBLIC;
  });
  afterEach(() => { process.env = { ...saved }; global.fetch = savedFetch; });

  test("a valid code sets the access cookie and hand-off, and redirects with no code in the URL", async () => {
    global.fetch = testerRows([{ id: TESTER, name: "Jane", sections: ["id"], is_admin: false }]);
    const r = await call({ query: { invite: CODE } });
    expect(r.statusCode).toBe(303);
    expect(r.headers.location).toBe("/id");
    expect(r.headers.location).not.toContain(CODE);
    expect(r.headers["cache-control"]).toBe("no-store");
    const set = r.headers["set-cookie"];
    const access = set.find(c => c.startsWith("atr_gate="));
    expect(access).toMatch(/HttpOnly; Secure; SameSite=Lax$/);
    expect(access).toContain("Max-Age=1209600");
    expect(await gate.verifyToken(cookieValue(set, "atr_gate"), SECRET)).toMatchObject({ testerId: TESTER });
    expect(access).not.toContain(CODE);
    // The hand-off cookie (not HttpOnly) carries the code to localStorage for 2 minutes.
    const handoff = set.find(c => c.startsWith("atr_invite="));
    expect(handoff).toContain(`atr_invite=${CODE}`);
    expect(handoff).toContain("Max-Age=120");
    expect(handoff).not.toContain("HttpOnly");
    // Checked against active testers in the atr project.
    expect(global.fetch.mock.calls[0][0]).toContain(`invite_code=eq.${CODE}&active=is.true`);
  });

  test("lands on the first allowed section; admins on the first of all", async () => {
    global.fetch = testerRows([{ id: TESTER, name: "Jane", sections: ["glossary", "care"], is_admin: false }]);
    expect((await call({ query: { invite: CODE } })).headers.location).toBe("/care");
    global.fetch = testerRows([{ id: TESTER, name: "Rowan", sections: [], is_admin: true }]);
    expect((await call({ query: { invite: CODE } })).headers.location).toBe("/id");
  });

  test("an unknown, inactive or malformed code gets the holding page and a cleared cookie", async () => {
    global.fetch = testerRows([]);
    for (const invite of [CODE, "short"]) {
      const r = await call({ query: { invite } });
      expect(r.statusCode).toBe(200);
      expect(r.headers["x-robots-tag"]).toBe("noindex, nofollow");
      expect(r.body).toContain("isn't active any more");
      expect(r.headers["set-cookie"]).toEqual([gate.clearGateCookie()]);
      expect(r.headers.location).toBeUndefined();
    }
  });

  test("no gate secret: fails closed without asking Supabase", async () => {
    delete process.env.ATR_GATE_SECRET;
    global.fetch = jest.fn();
    const r = await call({ query: { invite: CODE } });
    expect(r.statusCode).toBe(200);
    expect(r.body).toContain("coming 2027");
    expect(r.headers["set-cookie"]).toBeUndefined();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test("after launch a dead link opens the public app", async () => {
    process.env.ATR_PUBLIC = "true";
    global.fetch = testerRows([]);
    const r = await call({ query: { invite: CODE } });
    expect(r.statusCode).toBe(303);
    expect(r.headers.location).toBe("/");
  });

  test("start-up check returns sections and renews the cookie; a 403 clears it", async () => {
    global.fetch = testerRows([{ id: TESTER, name: "Jane", sections: ["id", "care"], is_admin: false }]);
    const ok = await call({ method: "POST", headers: { "x-atr-beta": CODE } });
    expect(ok.statusCode).toBe(200);
    expect(ok.body).toMatchObject({ ok: true, name: "Jane", sections: ["id", "care"], isAdmin: false, gated: true });
    expect(await gate.verifyToken(cookieValue(ok.headers["set-cookie"], "atr_gate"), SECRET)).toMatchObject({ testerId: TESTER });

    // Deactivated: the very next check (no cache) says no and clears the cookie.
    global.fetch = testerRows([]);
    const gone = await call({ method: "POST", headers: { "x-atr-beta": CODE } });
    expect(gone.statusCode).toBe(403);
    expect(gone.headers["set-cookie"]).toEqual([gate.clearGateCookie()]);
  });

  test("admins get every section; after launch testers also get the public ones", async () => {
    global.fetch = testerRows([{ id: TESTER, name: "Rowan", sections: ["id"], is_admin: true }]);
    expect((await call({ method: "POST", headers: { "x-atr-beta": CODE } })).body.sections).toEqual(["id", "species", "care", "licensing", "glossary", "search", "credits"]);
    process.env.ATR_PUBLIC = "true";
    global.fetch = testerRows([{ id: TESTER, name: "Jane", sections: ["id"], is_admin: false }]);
    const r = await call({ method: "POST", headers: { "x-atr-beta": CODE } });
    expect(r.body).toMatchObject({ gated: false, sections: ["id", "species", "care", "licensing", "glossary", "search", "credits"] });
    expect((await call()).body).toEqual({ gated: false, sections: ["species", "care", "licensing", "glossary", "search", "credits"] });
  });

  test("the AI ID endpoints refuse a tester without the id section", async () => {
    const { requireTester } = require("../../lib/beta");
    const env = { SUPABASE_URL: "https://x.supabase.co", SUPABASE_SECRET_KEY: "k" };
    const fetchImpl = testerRows([{ id: TESTER, name: "Jane", sections: ["care"], is_admin: false }]);
    const r = await requireTester({ headers: { "x-atr-beta": CODE } }, { env, fetchImpl, useCache: false, section: "id" });
    expect(r.status).toBe(403);
  });
});
