// Best-effort per-IP limiter for the Vercel functions. Fluid compute reuses
// instances, so this catches a single client hammering an endpoint; it isn't a
// global quota. Each function makes its own limiter.
// Lives outside api/ so Vercel doesn't deploy it as a function.

const clientIp = (req) =>
  String((req.headers && req.headers["x-forwarded-for"]) || "").split(",")[0].trim() || "unknown";

const makeRateLimiter = ({ windowMs = 60 * 1000, max = 8 } = {}) => {
  const hits = new Map();
  return (ip) => {
    const now = Date.now();
    if (hits.size > 5000) hits.clear();
    const recent = (hits.get(ip) || []).filter(t => now - t < windowMs);
    recent.push(now);
    hits.set(ip, recent);
    return recent.length > max;
  };
};

module.exports = { makeRateLimiter, clientIp };
