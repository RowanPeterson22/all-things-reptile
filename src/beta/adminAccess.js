import { useCallback, useEffect, useState } from "react";
import { BETA_HEADER, isCodeShape } from "./betaAccess";

// ─── Admin access (interim, until the ATR login, D7) ──────────────
// /admin is only for an invite code whose tester has is_admin = true. The app
// asks /api/admin-check only when someone opens /admin with a verified beta
// code, and loads the admin screens (a separate chunk) only after a yes. Like
// the beta gate, this decides what the UI shows; every api/admin-* route
// re-checks the code on the server.

// → { ok: true, id, name } | { ok: false }
export const checkAdmin = async (code, fetchImpl) => {
  const doFetch = fetchImpl || (typeof fetch === "function" ? fetch : null);
  if (!doFetch || !isCodeShape(code)) return { ok: false };
  try {
    const res = await doFetch("/api/admin-check", {
      method: "POST",
      headers: { [BETA_HEADER]: code, "Content-Type": "application/json" },
      body: "{}",
    });
    if (!res.ok) return { ok: false };
    const data = await res.json().catch(() => null);
    if (!data || data.ok !== true) return { ok: false };
    return { ok: true, id: String(data.id || ""), name: typeof data.name === "string" ? data.name : "" };
  } catch (e) {
    return { ok: false };
  }
};

// status: "idle" (not asked) | "checking" | "ok" | "denied"
export const useAdminAccess = (code, enabled) => {
  const [state, setState] = useState({ status: "idle", code: "", id: "", name: "" });

  useEffect(() => {
    if (!enabled || !code) return undefined;
    if (state.code === code && state.status === "ok") return undefined;
    let live = true;
    setState({ status: "checking", code, id: "", name: "" });
    checkAdmin(code).then(r => {
      if (!live) return;
      setState(r.ok ? { status: "ok", code, id: r.id, name: r.name } : { status: "denied", code, id: "", name: "" });
    });
    return () => { live = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, enabled]);

  const deny = useCallback(() => setState(s => ({ ...s, status: "denied" })), []);
  return { ...state, status: enabled && code ? state.status : "idle", deny };
};
