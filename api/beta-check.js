// ─── POST /api/beta-check (AI ID closed beta) ─────────────────────
// Tells the app whether the invite code in x-atr-beta is valid and active.
// 200 { ok: true, name, traits } for a tester; 403 otherwise (503 if not set up).
// `traits` is the draft morph list for the feedback form; it's only sent to
// testers so the public bundle never carries it.

const { requireTester } = require("../lib/beta");
const { MORPHS } = require("../lib/morphs");
const { makeRateLimiter, clientIp } = require("../lib/rateLimit");

const rateLimited = makeRateLimiter({ windowMs: 60 * 1000, max: 10 });

// species slug → [{ id, name }] (visual cues stay server-side)
const TRAITS_BY_SPECIES = Object.fromEntries(
  Object.entries(MORPHS).map(([slug, list]) => [slug, list.map(t => ({ id: t.id, name: t.name }))])
);

module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Use POST." });
  }
  // Tight limit: this is the endpoint someone would use to guess codes.
  if (rateLimited(clientIp(req))) return res.status(429).json({ error: "Too many tries. Wait a minute." });

  const gate = await requireTester(req);
  if (!gate.tester) return res.status(gate.status).json(gate.body);
  return res.status(200).json({ ok: true, name: gate.tester.name, traits: TRAITS_BY_SPECIES });
};
