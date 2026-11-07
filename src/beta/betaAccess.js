import { useEffect, useState } from "react";

// ─── AI ID closed-beta access (D9) ────────────────────────────────
// A tester opens /id?invite=<code>. The code is kept in localStorage and
// confirmed with /api/beta-check on every app load. Until the server says yes,
// the ID tab and route don't exist: the public sees no trace of the feature.
// The server re-checks the code on every AI ID request, so this is only about
// what the UI shows, not the security boundary.

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

export const inviteFromSearch = (search) => {
  try {
    const v = new URLSearchParams(search || "").get("invite");
    return isCodeShape(v) ? v : "";
  } catch (e) { return ""; }
};

// → { ok: true, name, traits } | { ok: false, revoked: boolean }
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
    return { ok: true, name: typeof data.name === "string" ? data.name : "", traits: data.traits && typeof data.traits === "object" ? data.traits : {} };
  } catch (e) {
    return { ok: false, revoked: false };
  }
};

// status: "none" (no code, or rejected) | "checking" | "ok"
// onInvite(): called once after an invite code is taken from the URL, so the
// caller can strip ?invite= from the address bar and history.
export const useBetaAccess = (search, onInvite) => {
  const fromUrl = inviteFromSearch(search);
  const [state, setState] = useState(() => {
    const code = fromUrl || readCode();
    return { status: code ? "checking" : "none", code, name: "", traits: {} };
  });

  useEffect(() => {
    if (!fromUrl) return;
    saveCode(fromUrl);
    setState(s => (s.code === fromUrl && s.status !== "none" ? s : { status: "checking", code: fromUrl, name: "", traits: {} }));
    if (onInvite) onInvite();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromUrl]);

  useEffect(() => {
    if (state.status !== "checking") return undefined;
    let live = true;
    checkCode(state.code).then(r => {
      if (!live) return;
      if (r.ok) setState(s => (s.code === state.code ? { ...s, status: "ok", name: r.name, traits: r.traits } : s));
      else {
        if (r.revoked) clearCode();
        setState(s => (s.code === state.code ? { status: "none", code: "", name: "", traits: {} } : s));
      }
    });
    return () => { live = false; };
  }, [state.status, state.code]);

  // A 403 mid-session (tester deactivated): hide the feature straight away.
  const revoke = () => { clearCode(); setState({ status: "none", code: "", name: "", traits: {} }); };

  return { ...state, revoke };
};
