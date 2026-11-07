// ─── POST /api/admin-check ────────────────────────────────────────
// Tells the app whether the invite code in x-atr-beta belongs to an active
// admin. 200 { ok: true, id, name, gate } for an admin; 403 for anyone else. The app only
// loads the /admin screens after a 200. Rate limited: it's a code oracle.

const { adminRoute } = require("../lib/admin");
const { gateMode } = require("../lib/gate");

// For the /admin banner: is the site gated or public, and is the gate secret set?
// (Never the secret itself.)
const gateStatus = () => {
  const m = gateMode();
  return { public: m.isPublic, gated: m.gated, secretSet: m.secretSet };
};
const { makeRateLimiter, clientIp } = require("../lib/rateLimit");

const rateLimited = makeRateLimiter({ windowMs: 60 * 1000, max: 10 });

module.exports = adminRoute(
  { POST: async ({ admin }) => ({ status: 200, body: { ok: true, id: admin.id, name: admin.name, gate: gateStatus() } }) },
  { limiter: (req) => rateLimited(clientIp(req)) },
);
