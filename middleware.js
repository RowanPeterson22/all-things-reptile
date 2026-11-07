// ─── Pre-launch gate (Vercel Routing Middleware) ──────────────────
// Runs before the CDN cache and the static files, so without a valid access
// cookie no request gets the app shell, the JS bundle or anything baked into
// it. Everyone else gets the holding page (HTTP 200, noindex).
//
//   /api/*             not matched (the functions check the tester themselves)
//   /id?invite=CODE    rewritten to /api/beta-check, which checks the code,
//                      sets the cookie and redirects with no code in the URL
//   /robots.txt, /favicon.ico, /holding-logo.(webp|png)   always served (the holding page's only assets)
//   anything else      needs the atr_gate cookie (HMAC-SHA256, ATR_GATE_SECRET)
//
// ATR_PUBLIC=true is the launch switch: the gate is off and robots are allowed.
// No ATR_GATE_SECRET: fail closed (holding page), except under `vercel dev`.
// `npm start` doesn't run middleware at all.
//
// Docs: https://vercel.com/docs/routing-middleware/getting-started (middleware.js
// at the project root for non-Next.js frameworks, default nodejs runtime) and
// https://vercel.com/docs/routing-middleware/js-reference (config.matcher,
// next() and rewrite() from @vercel/functions).

import { next, rewrite } from "@vercel/functions";
import gate from "./lib/gate.js";
import holding from "./lib/holdingPage.js";

export const config = {
  // Everything except the API. The code below re-checks /api/ anyway.
  matcher: ["/((?!api/).*)"],
};

const ROBOTS_GATED = "User-agent: *\nDisallow: /\n";
const ROBOTS_PUBLIC = "User-agent: *\nDisallow:\n";
const ALWAYS_OPEN = new Set(["/robots.txt", "/favicon.ico", "/holding-logo.webp", "/holding-logo.png"]);

const text = (body) => new Response(body, { status: 200, headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" } });
const holdingResponse = () => new Response(holding.holdingPage(), { status: 200, headers: holding.HOLDING_HEADERS });

export async function handleGate(request, env = process.env) {
  const url = new URL(request.url);
  const path = url.pathname;
  if (path === "/api" || path.startsWith("/api/")) return next();

  const mode = gate.gateMode(env);

  // Invite bootstrap, gated or public: the function checks the code against
  // beta_testers, sets the cookie and redirects to the tester's first section.
  if ((path === "/id" || path === "/id/") && url.searchParams.has("invite")) {
    const dest = new URL("/api/beta-check", url);
    dest.searchParams.set("invite", url.searchParams.get("invite") || "");
    return rewrite(dest);
  }

  if (mode.isPublic) return path === "/robots.txt" ? text(ROBOTS_PUBLIC) : next();

  if (path === "/robots.txt") return text(ROBOTS_GATED);
  if (ALWAYS_OPEN.has(path)) return next();

  if (!mode.secretSet) return mode.dev ? next() : holdingResponse();

  const cookies = gate.parseCookies(request.headers.get("cookie"));
  const pass = cookies[gate.COOKIE] ? await gate.verifyToken(cookies[gate.COOKIE], mode.secret) : null;
  if (!pass) return holdingResponse();

  // The app itself is not for search engines until launch either.
  return next({ headers: { "X-Robots-Tag": "noindex, nofollow" } });
}

export default function middleware(request) {
  return handleGate(request, process.env);
}
