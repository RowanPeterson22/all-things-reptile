import { BETA_HEADER } from "../beta/betaAccess";

// ─── Admin API client ─────────────────────────────────────────────
// Every call carries the admin's invite code in x-atr-beta; the server checks
// is_admin on each one. A 403 means access was withdrawn: onForbidden() runs
// so the app can leave /admin.

// data: the server's JSON body, for routes that explain a refusal (the
// species editor's problems list, or a 409 conflict's current state).
export class ApiError extends Error {
  constructor(status, message, data = null) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

export const makeApi = (code, onForbidden, fetchImpl) => async (route, { method = "GET", body, query } = {}) => {
  const doFetch = fetchImpl || fetch;
  const qs = query ? `?${new URLSearchParams(Object.entries(query).filter(([, v]) => v !== undefined && v !== null && v !== ""))}` : "";
  let res;
  try {
    res = await doFetch(`/api/${route}${qs === "?" ? "" : qs}`, {
      method,
      headers: { [BETA_HEADER]: code, ...(body !== undefined ? { "Content-Type": "application/json" } : {}) },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (e) {
    throw new ApiError(0, "Couldn't reach the server. Check your connection.");
  }
  const data = await res.json().catch(() => null);
  if (res.status === 403) {
    if (onForbidden) onForbidden();
    throw new ApiError(403, "Admin access isn't available for this code.");
  }
  if (!res.ok) throw new ApiError(res.status, (data && data.error) || `Request failed (${res.status}).`, data);
  return data;
};
