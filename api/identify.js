// ─── POST /api/identify (D9 AI species ID — closed beta) ──────────
// Vercel Node.js function. Body: JSON { image: "<base64 or data URL>" }.
// Beta-only: needs a valid, active invite code in the x-atr-beta header
// (checked against beta_testers in the atr Supabase project); 403 otherwise.
// Env: ANTHROPIC_API_KEY (ANTHROPIC_MODEL optional), SUPABASE_URL, SUPABASE_SECRET_KEY.
// The photo is passed to the Anthropic API and never stored or logged here.
// The trait list comes from the morph store (lib/morphStore.js, cached ~60 s).

const { identify } = require("../lib/identify");
const { requireTester } = require("../lib/beta");
const { makeRateLimiter, clientIp } = require("../lib/rateLimit");

const rateLimited = makeRateLimiter({ windowMs: 60 * 1000, max: 8 });

module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Use POST." });
  }
  if (rateLimited(clientIp(req))) {
    return res.status(429).json({ error: "Too many photos in a short time. Wait a minute and try again." });
  }

  // Gate before anything else that reveals the feature or costs money.
  const gate = await requireTester(req, { section: "id" });
  if (!gate.tester) return res.status(gate.status).json(gate.body);

  if (!/^application\/json\b/i.test(req.headers["content-type"] || "")) {
    return res.status(415).json({ error: "Send JSON." });
  }
  let body;
  try { body = req.body; } catch (e) { return res.status(400).json({ error: "Send a JSON body with an image." }); }

  const { status, body: out } = await identify(body, {
    apiKey: process.env.ANTHROPIC_API_KEY,
    model: process.env.ANTHROPIC_MODEL,
    cfg: gate.cfg,
  });
  return res.status(status).json(out);
};
