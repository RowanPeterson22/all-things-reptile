// ─── Pre-launch gate: signed access cookie ────────────────────────
// Shared by middleware.js (verifies on every page and asset request) and
// api/beta-check.js (issues the cookie after checking an invite against
// beta_testers). Web Crypto only (globalThis.crypto.subtle), so the same code
// runs in Routing Middleware and in Node functions. No Supabase here: the
// middleware trusts the signature, and the app's start-up check and every API
// call re-validate the tester against the database.
//
// Cookie value: v1.<base64url(JSON {t: testerId, exp: unix seconds})>.<base64url(HMAC-SHA256)>
// Signed with ATR_GATE_SECRET (server env only; never REACT_APP_*).
// Never log the cookie, the secret or invite codes.

const COOKIE = "atr_gate";
// Short-lived, readable by the app: hands the invite code to localStorage after
// the bootstrap redirect, so the code never sits in the URL. The app deletes it.
const HANDOFF_COOKIE = "atr_invite";
const MAX_AGE = 14 * 24 * 60 * 60; // 14 days
const HANDOFF_MAX_AGE = 120;
const MIN_SECRET = 32;
const VERSION = "v1";

const enc = new TextEncoder();

const b64url = (bytes) => {
  let s = "";
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  for (let i = 0; i < arr.length; i++) s += String.fromCharCode(arr[i]);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};
const fromB64url = (str) => {
  if (typeof str !== "string" || !/^[A-Za-z0-9_-]*$/.test(str)) return null;
  try {
    const bin = atob(str.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((str.length + 3) % 4));
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  } catch (e) { return null; }
};

const subtle = () => {
  const c = globalThis.crypto;
  if (!c || !c.subtle) throw new Error("Web Crypto is not available");
  return c.subtle;
};

const keyFor = (secret, usage) => subtle().importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, [usage]);

// A secret shorter than MIN_SECRET counts as missing: the gate fails closed.
const usableSecret = (secret) => (typeof secret === "string" && secret.trim().length >= MIN_SECRET ? secret.trim() : "");

const nowSec = () => Math.floor(Date.now() / 1000);

// → token string
const signToken = async ({ testerId, exp }, secret) => {
  const s = usableSecret(secret);
  if (!s) throw new Error("ATR_GATE_SECRET is missing or too short");
  if (typeof testerId !== "string" || !testerId) throw new Error("testerId required");
  const body = b64url(enc.encode(JSON.stringify({ t: testerId, exp: Math.floor(exp) })));
  const sig = await subtle().sign("HMAC", await keyFor(s, "sign"), enc.encode(`${VERSION}.${body}`));
  return `${VERSION}.${body}.${b64url(sig)}`;
};

// → { testerId, exp } or null (bad shape, bad signature, expired, no secret).
// crypto.subtle.verify compares in constant time.
const verifyToken = async (token, secret, now = nowSec()) => {
  const s = usableSecret(secret);
  if (!s || typeof token !== "string" || token.length > 600) return null;
  const parts = token.split(".");
  if (parts.length !== 3 || parts[0] !== VERSION) return null;
  const sig = fromB64url(parts[2]);
  const bodyBytes = fromB64url(parts[1]);
  if (!sig || !bodyBytes || sig.length !== 32) return null;
  let ok = false;
  try {
    ok = await subtle().verify("HMAC", await keyFor(s, "verify"), sig, enc.encode(`${VERSION}.${parts[1]}`));
  } catch (e) { return null; }
  if (!ok) return null;
  let payload;
  try { payload = JSON.parse(new TextDecoder().decode(bodyBytes)); } catch (e) { return null; }
  if (!payload || typeof payload.t !== "string" || !payload.t || typeof payload.exp !== "number") return null;
  if (payload.exp <= now) return null;
  return { testerId: payload.t, exp: payload.exp };
};

const parseCookies = (header) => {
  const out = {};
  if (typeof header !== "string") return out;
  for (const part of header.split(";")) {
    const i = part.indexOf("=");
    if (i < 0) continue;
    const k = part.slice(0, i).trim();
    if (!k || k in out) continue;
    let v = part.slice(i + 1).trim();
    if (v.startsWith("\"") && v.endsWith("\"")) v = v.slice(1, -1);
    try { out[k] = decodeURIComponent(v); } catch (e) { out[k] = v; }
  }
  return out;
};

const gateCookie = (token, maxAge = MAX_AGE) => `${COOKIE}=${token}; Path=/; Max-Age=${maxAge}; HttpOnly; Secure; SameSite=Lax`;
const clearGateCookie = () => `${COOKIE}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax`;
const handoffCookie = (code) => `${HANDOFF_COOKIE}=${encodeURIComponent(code)}; Path=/; Max-Age=${HANDOFF_MAX_AGE}; Secure; SameSite=Lax`;

// The switches, from env. ATR_PUBLIC=true is the launch switch: no gate at all.
// `dev` is `vercel dev` (VERCEL_ENV=development); `npm start` runs no middleware.
const gateMode = (env = process.env) => {
  const isPublic = String(env.ATR_PUBLIC || "").trim().toLowerCase() === "true";
  const secret = usableSecret(env.ATR_GATE_SECRET);
  const dev = env.VERCEL_ENV === "development" || (!env.VERCEL_ENV && env.NODE_ENV === "development");
  return { isPublic, secret, secretSet: Boolean(secret), dev, gated: !isPublic };
};

module.exports = {
  COOKIE, HANDOFF_COOKIE, MAX_AGE, HANDOFF_MAX_AGE, MIN_SECRET,
  signToken, verifyToken, parseCookies, gateCookie, clearGateCookie, handoffCookie, gateMode, usableSecret, nowSec,
};
