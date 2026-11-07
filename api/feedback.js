// ─── POST /api/feedback (AI ID closed beta) ───────────────────────
// A beta tester's verdict on an AI ID result. Needs the x-atr-beta invite header.
// Body (JSON):
//   ai                  the result object /api/identify returned (required)
//   verdict             "correct" | "partly" | "wrong"
//   correctSpeciesSlug  an index slug from src/data/australianSpecies.json (any of the
//                       1,363 natives, e.g. "jacky-dragon"), or "other" (+ correctSpeciesOther)
//   correctTraits       trait ids from lib/morphs.js
//   notes               free text, max 2000 chars
//   photoConsent        true only if the tester ticked the per-photo consent box
//   photo               JPEG base64 / data URL — accepted ONLY with photoConsent: true
// Env: SUPABASE_URL, SUPABASE_SECRET_KEY.

const { requireTester } = require("../lib/beta");
const { submitFeedback } = require("../lib/feedback");
const { makeRateLimiter, clientIp } = require("../lib/rateLimit");

const rateLimited = makeRateLimiter({ windowMs: 60 * 1000, max: 12 });

module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Use POST." });
  }
  if (rateLimited(clientIp(req))) {
    return res.status(429).json({ error: "Too many submissions in a short time. Wait a minute and try again." });
  }

  const gate = await requireTester(req, { section: "id" });
  if (!gate.tester) return res.status(gate.status).json(gate.body);

  if (!/^application\/json\b/i.test(req.headers["content-type"] || "")) {
    return res.status(415).json({ error: "Send JSON." });
  }
  let body;
  try { body = req.body; } catch (e) { return res.status(400).json({ error: "Send a JSON body." }); }

  const { status, body: out } = await submitFeedback(body, { tester: gate.tester, cfg: gate.cfg });
  return res.status(status).json(out);
};
