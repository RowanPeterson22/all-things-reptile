// ─── /api/beta-check (pre-launch gate + AI ID closed beta) ────────
// Three jobs in one function (the project is near Vercel Hobby's function cap):
//
//   GET ?invite=CODE   Invite bootstrap. middleware.js rewrites /id?invite=CODE
//                      here. Checks the code against beta_testers (active), sets
//                      the signed access cookie (atr_gate, 14 days) plus a
//                      2-minute atr_invite cookie that hands the code to the
//                      app's localStorage, and 303s to the tester's first allowed
//                      section, so no code is left in the URL. A bad code gets
//                      the holding page.
//   GET                { gated, sections } for a visitor with no invite code:
//                      what the app shell shows before launch (nothing) and
//                      after ATR_PUBLIC=true (the public sections).
//   POST               The app's start-up check, x-atr-beta header as before.
//                      200 { ok, name, traits, sections, isAdmin, gated } for an
//                      active tester, and the access cookie is renewed; 403 (and
//                      the cookie cleared) otherwise, so a deactivated tester is
//                      locked out at their next app load. 503 if not set up.
//
// `traits` is the draft morph list for the feedback form; it's only sent to
// testers so the public bundle never carries it. Never log codes or cookies.

const { requireTester, CODE_RE } = require("../lib/beta");
const { supabaseConfig, findActiveTester, SupabaseError } = require("../lib/supabase");
const { MORPHS } = require("../lib/morphs");
const { makeRateLimiter, clientIp } = require("../lib/rateLimit");
const gate = require("../lib/gate");
const { holdingPage, HOLDING_HEADERS } = require("../lib/holdingPage");
const { effectiveSections, firstSectionPath, PUBLIC_SECTIONS } = require("../lib/sections");

// Tight limits: this is the endpoint someone would use to guess codes.
const checkLimited = makeRateLimiter({ windowMs: 60 * 1000, max: 10 });
const bootstrapLimited = makeRateLimiter({ windowMs: 60 * 1000, max: 10 });

// species slug → [{ id, name }] (visual cues stay server-side)
const TRAITS_BY_SPECIES = Object.fromEntries(
  Object.entries(MORPHS).map(([slug, list]) => [slug, list.map(t => ({ id: t.id, name: t.name }))])
);

const holdingReply = (res, notice, cookies = []) => {
  for (const [k, v] of Object.entries(HOLDING_HEADERS)) res.setHeader(k, v);
  if (cookies.length) res.setHeader("Set-Cookie", cookies);
  return res.status(200).send(holdingPage({ notice }));
};

const accessCookie = async (tester, mode) => {
  if (!mode.secretSet) return null;
  const token = await gate.signToken({ testerId: String(tester.id), exp: gate.nowSec() + gate.MAX_AGE }, mode.secret);
  return gate.gateCookie(token);
};

// GET ?invite=CODE
const bootstrap = async (req, res, mode) => {
  res.setHeader("Referrer-Policy", "no-referrer");
  // After launch a dead link just opens the public app; before it, the holding page.
  const sendHolding = (r, notice, cookies = []) => {
    if (!mode.isPublic) return holdingReply(r, notice, cookies);
    if (cookies.length) r.setHeader("Set-Cookie", cookies);
    r.setHeader("Location", "/");
    return r.status(303).send("");
  };
  if (bootstrapLimited(clientIp(req))) return sendHolding(res, "unavailable");
  const raw = req.query && typeof req.query.invite === "string" ? req.query.invite.trim() : "";
  const cfg = supabaseConfig();
  // Gated, and no way to issue a cookie: fail closed.
  if (mode.gated && !mode.secretSet && !mode.dev) return sendHolding(res, "unavailable");
  if (!cfg) return sendHolding(res, "unavailable");
  if (!CODE_RE.test(raw)) return sendHolding(res, "inactive", [gate.clearGateCookie()]);

  let tester;
  try {
    tester = await findActiveTester(cfg, raw);
  } catch (e) {
    if (!(e instanceof SupabaseError)) console.error("beta-check: unexpected bootstrap error");
    return sendHolding(res, "unavailable");
  }
  if (!tester) return sendHolding(res, "inactive", [gate.clearGateCookie()]);

  const cookies = [gate.handoffCookie(raw)];
  const access = await accessCookie(tester, mode);
  if (access) cookies.push(access);
  res.setHeader("Set-Cookie", cookies);
  res.setHeader("Location", firstSectionPath(effectiveSections(tester, { isPublic: mode.isPublic })));
  return res.status(303).send("");
};

module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  const mode = gate.gateMode();

  if (req.method === "GET") {
    if (req.query && req.query.invite !== undefined) return bootstrap(req, res, mode);
    return res.status(200).json({ gated: mode.gated, sections: mode.isPublic ? PUBLIC_SECTIONS : [] });
  }
  if (req.method !== "POST") {
    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ error: "Use POST." });
  }
  if (checkLimited(clientIp(req))) return res.status(429).json({ error: "Too many tries. Wait a minute." });

  // Start-up check: always straight to the database, never the 60 s cache.
  const result = await requireTester(req, { useCache: false });
  if (!result.tester) {
    if (result.status === 403) res.setHeader("Set-Cookie", [gate.clearGateCookie()]);
    return res.status(result.status).json(result.body);
  }
  const t = result.tester;
  const access = await accessCookie(t, mode);
  if (access) res.setHeader("Set-Cookie", [access]);
  return res.status(200).json({
    ok: true,
    name: t.name,
    traits: TRAITS_BY_SPECIES,
    sections: effectiveSections(t, { isPublic: mode.isPublic }),
    isAdmin: t.isAdmin === true,
    gated: mode.gated,
  });
};
