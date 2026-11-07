// ─── POST /api/admin-check ────────────────────────────────────────
// Tells the app whether the invite code in x-atr-beta belongs to an active
// admin. 200 { ok: true, name } for an admin; 403 for anyone else. The app only
// loads the /admin screens after a 200. Rate limited: it's a code oracle.

const { adminRoute } = require("../lib/admin");
const { makeRateLimiter, clientIp } = require("../lib/rateLimit");

const rateLimited = makeRateLimiter({ windowMs: 60 * 1000, max: 10 });

module.exports = adminRoute(
  { POST: async ({ admin }) => ({ status: 200, body: { ok: true, name: admin.name } }) },
  { limiter: (req) => rateLimited(clientIp(req)) },
);
