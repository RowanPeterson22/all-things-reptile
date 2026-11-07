// ─── POST /api/identify (D9 AI species ID) ────────────────────────
// Vercel Node.js function. Body: JSON { image: "<base64 or data URL>" }.
// Needs the ANTHROPIC_API_KEY env var; ANTHROPIC_MODEL optionally overrides the model.
// The photo is passed to the Anthropic API and never stored or logged.

const { identify } = require("../lib/identify");

// Best-effort per-IP limit. Fluid compute reuses instances, so this catches a
// single client hammering the endpoint; it isn't a global quota.
const WINDOW_MS = 60 * 1000;
const MAX_PER_WINDOW = 8;
const hits = new Map();
const rateLimited = (ip) => {
  const now = Date.now();
  if (hits.size > 5000) hits.clear();
  const recent = (hits.get(ip) || []).filter(t => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > MAX_PER_WINDOW;
};

module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Use POST." });
  }
  if (!/^application\/json\b/i.test(req.headers["content-type"] || "")) {
    return res.status(415).json({ error: "Send JSON." });
  }
  const ip = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim() || "unknown";
  if (rateLimited(ip)) {
    return res.status(429).json({ error: "Too many photos in a short time. Wait a minute and try again." });
  }

  let body;
  try { body = req.body; } catch (e) { return res.status(400).json({ error: "Send a JSON body with an image." }); }

  const { status, body: out } = await identify(body, {
    apiKey: process.env.ANTHROPIC_API_KEY,
    model: process.env.ANTHROPIC_MODEL,
  });
  return res.status(status).json(out);
};
