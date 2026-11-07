// ─── AI ID closed-beta gate ───────────────────────────────────────
// Every AI ID endpoint calls requireTester() first. The invite code comes in the
// x-atr-beta header and must match an active row in beta_testers (atr project).
//
// Returns { tester, cfg } on success or { status, body } to send back:
//   503 when SUPABASE_URL / SUPABASE_SECRET_KEY aren't set
//   403 when the code is missing, malformed, unknown or deactivated
//   502 when Supabase can't be reached

const { supabaseConfig, findActiveTester, SupabaseError } = require("./supabase");

const HEADER = "x-atr-beta";
// Codes are minted by scripts/beta-invite.mjs (32 random bytes, base64url = 43
// chars). The DB allows 32–128 of [A-Za-z0-9_-]; anything else never hits the DB.
const CODE_RE = /^[A-Za-z0-9_-]{32,128}$/;

const NOT_SET_UP = "The AI ID beta isn't set up yet.";
const FORBIDDEN = "This feature isn't available.";

// Positive results are cached briefly so each photo doesn't cost an extra
// round-trip. A deactivated tester is locked out within CACHE_MS.
const CACHE_MS = 60 * 1000;
const cache = new Map();

const inviteFrom = (req) => {
  const v = req && req.headers ? req.headers[HEADER] : undefined;
  return typeof v === "string" ? v.trim() : "";
};

const requireTester = async (req, { env = process.env, fetchImpl, useCache = true } = {}) => {
  const cfg = supabaseConfig(env);
  if (!cfg) return { status: 503, body: { error: NOT_SET_UP } };

  const code = inviteFrom(req);
  if (!CODE_RE.test(code)) return { status: 403, body: { error: FORBIDDEN } };

  const hit = useCache && cache.get(code);
  if (hit && Date.now() - hit.at < CACHE_MS) return { tester: hit.tester, cfg };

  try {
    const tester = await findActiveTester(cfg, code, fetchImpl);
    if (!tester) { cache.delete(code); return { status: 403, body: { error: FORBIDDEN } }; }
    if (cache.size > 1000) cache.clear();
    cache.set(code, { tester, at: Date.now() });
    return { tester, cfg };
  } catch (e) {
    if (e instanceof SupabaseError) return { status: e.status, body: { error: e.message } };
    console.error("beta: unexpected error");
    return { status: 500, body: { error: "Something went wrong. Try again." } };
  }
};

const clearTesterCache = () => cache.clear();

module.exports = { requireTester, clearTesterCache, HEADER, CODE_RE, NOT_SET_UP, FORBIDDEN };
