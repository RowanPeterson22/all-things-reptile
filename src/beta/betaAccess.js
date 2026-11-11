import { useEffect, useState } from "react";
import { normaliseSections } from "../constants/sections";
import { cleanApp, fallbackApp } from "../constants/appLayout";

// ─── Beta access: AI ID (D9) and the pre-launch gate ──────────────
// A tester opens /id?invite=<code>. On Vercel, middleware.js sends that to
// /api/beta-check, which sets the signed access cookie and redirects with no
// code in the URL; the code reaches the app in the short-lived atr_invite
// cookie, which is moved into localStorage here and deleted. (Under `npm start`
// there's no middleware, so ?invite= is still read straight from the URL.)
//
// The code is confirmed with /api/beta-check on every app load, which returns
// the tester's sections. Until the server says yes, no tester tab or route
// exists. The security boundary is the server: the middleware for the bundle,
// and every API call re-checks the code.

export const STORAGE_KEY = "atr-ai-id-invite";
export const BETA_HEADER = "x-atr-beta";
const CODE_RE = /^[A-Za-z0-9_-]{32,128}$/;

export const isCodeShape = (code) => typeof code === "string" && CODE_RE.test(code);

// Storage can throw (private mode, blocked site data); treat that as "no code".
export const readCode = () => {
  try {
    const v = window.localStorage.getItem(STORAGE_KEY);
    return isCodeShape(v) ? v : "";
  } catch (e) { return ""; }
};
export const saveCode = (code) => { try { window.localStorage.setItem(STORAGE_KEY, code); } catch (e) { /* session-only */ } };
export const clearCode = () => { try { window.localStorage.removeItem(STORAGE_KEY); } catch (e) { /* nothing to clear */ } };

export const HANDOFF_COOKIE = "atr_invite";

// The bootstrap's hand-off cookie → code, deleting it. "" if none.
export const takeHandoffCode = () => {
  try {
    const hit = String(document.cookie || "").split(";").map(c => c.trim()).find(c => c.startsWith(`${HANDOFF_COOKIE}=`));
    if (!hit) return "";
    document.cookie = `${HANDOFF_COOKIE}=; Path=/; Max-Age=0; Secure; SameSite=Lax`;
    const v = decodeURIComponent(hit.slice(HANDOFF_COOKIE.length + 1));
    return isCodeShape(v) ? v : "";
  } catch (e) { return ""; }
};

export const inviteFromSearch = (search) => {
  try {
    const v = new URLSearchParams(search || "").get("invite");
    return isCodeShape(v) ? v : "";
  } catch (e) { return ""; }
};

// → { ok: true, name, traits, sections, app, isAdmin, gated } | { ok: false, revoked: boolean }
// app: the layout for this tester (tabs, Home blocks, visible sections); the
// app's own defaults if the server sent none.
// revoked = the server rejected the code (403); anything else is a transient failure.
export const checkCode = async (code, fetchImpl) => {
  const doFetch = fetchImpl || (typeof fetch === "function" ? fetch : null);
  if (!doFetch || !isCodeShape(code)) return { ok: false, revoked: false };
  try {
    const res = await doFetch("/api/beta-check", { method: "POST", headers: { [BETA_HEADER]: code } });
    if (res.status === 403) return { ok: false, revoked: true };
    if (!res.ok) return { ok: false, revoked: false };
    const data = await res.json().catch(() => null);
    if (!data || data.ok !== true) return { ok: false, revoked: false };
    // Missing → the DB default (ID only), never more.
    const sections = Array.isArray(data.sections) ? normaliseSections(data.sections) : ["id"];
    const isAdmin = data.isAdmin === true;
    return {
      ok: true,
      name: typeof data.name === "string" ? data.name : "",
      traits: data.traits && typeof data.traits === "object" ? data.traits : {},
      sections,
      app: cleanApp(data.app) || fallbackApp(sections, isAdmin ? "admin" : "tester"),
      isAdmin,
      gated: data.gated !== false,
    };
  } catch (e) {
    return { ok: false, revoked: false };
  }
};

// status: "none" (no code, or rejected) | "checking" | "ok" | "locked" (revoked
// mid-session while gated; reloading) | "error" (a code,
// but the check failed for a transient reason: the shell offers a retry rather
// than opening up sections the tester may not have).
// onInvite(): called once after an invite code is taken from the URL, so the
// caller can strip ?invite= from the address bar and history.
const EMPTY = { name: "", traits: {}, sections: [], app: null, isAdmin: false, gated: null };

export const useBetaAccess = (search, onInvite) => {
  const fromUrl = inviteFromSearch(search);
  const [state, setState] = useState(() => {
    const handoff = takeHandoffCode();
    if (handoff) saveCode(handoff);
    const code = fromUrl || handoff || readCode();
    return { status: code ? "checking" : "none", code, ...EMPTY };
  });

  useEffect(() => {
    if (!fromUrl) return;
    saveCode(fromUrl);
    setState(s => (s.code === fromUrl && s.status !== "none" ? s : { status: "checking", code: fromUrl, ...EMPTY }));
    if (onInvite) onInvite();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromUrl]);

  useEffect(() => {
    if (state.status !== "checking") return undefined;
    let live = true;
    checkCode(state.code).then(r => {
      if (!live) return;
      if (r.ok) setState(s => (s.code === state.code ? { ...s, status: "ok", name: r.name, traits: r.traits, sections: r.sections, app: r.app, isAdmin: r.isAdmin, gated: r.gated } : s));
      else if (r.revoked) {
        clearCode();
        setState(s => (s.code === state.code ? { status: "none", code: "", ...EMPTY } : s));
      } else setState(s => (s.code === state.code ? { ...s, status: "error" } : s));
    });
    return () => { live = false; };
  }, [state.status, state.code]);

  const retry = () => setState(s => (s.code ? { ...s, status: "checking" } : s));

  // A 403 mid-session (tester deactivated): hide everything straight away. While
  // gated, ask the server once more (its 403 clears the access cookie) and
  // reload, which lands on the holding page.
  const revoke = () => {
    const { code, gated } = state;
    clearCode();
    // "locked": nothing to show while gated (not the public sections).
    setState({ status: gated ? "locked" : "none", code: "", ...EMPTY, gated });
    if (gated && code) {
      checkCode(code).finally(() => { try { window.location.replace("/"); } catch (e) { /* tests */ } });
    }
  };

  return { ...state, revoke, retry };
};

// ─── Visitors with no code ────────────────────────────────────────
// GET /api/beta-check (no header, edge cached) → the public sections and
// layout. Before launch the server sends nothing (and on Vercel nobody without
// a pass gets this far); then, and when there is no API at all (`npm start`)
// or it fails, the app's own defaults stand in: the public sections, as before.
export const fetchPublicLayout = async (fetchImpl) => {
  const doFetch = fetchImpl || (typeof fetch === "function" ? fetch : null);
  const fallback = () => {
    const app = fallbackApp([], "public");
    return { sections: normaliseSections(app.items.map(i => i.key)), app };
  };
  if (!doFetch) return fallback();
  try {
    const res = await doFetch("/api/beta-check", { method: "GET" });
    if (!res || !res.ok) return fallback();
    const data = await res.json().catch(() => null);
    const app = data && data.gated === false ? cleanApp(data.app) : null;
    if (!app || !Array.isArray(data.sections)) return fallback();
    // live: the site is public (ATR_PUBLIC=true), so published content is open to all.
    return { sections: normaliseSections(data.sections), app, live: true };
  } catch (e) {
    return fallback();
  }
};

// status "idle" (not needed) | "loading" | "ok"
export const usePublicLayout = (enabled) => {
  const [state, setState] = useState({ status: "idle", sections: [], app: null });
  useEffect(() => {
    if (!enabled || state.status !== "idle") return undefined;
    let live = true;
    setState(s => ({ ...s, status: "loading" }));
    fetchPublicLayout().then(r => { if (live) setState({ status: "ok", sections: r.sections, app: r.app, live: r.live === true }); });
    return () => { live = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);
  return enabled ? state : { status: "idle", sections: [], app: null };
};
