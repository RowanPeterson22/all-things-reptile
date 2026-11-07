// Shared helpers for the AI ID beta admin scripts. Node 18+ (global fetch).
// Reads SUPABASE_URL and SUPABASE_SECRET_KEY from the environment; never prints them.
// Not part of the app bundle (CRA only bundles what src/ imports).

export const EXPECTED_REF = "ledcvbyiqkygcdleucqo"; // the atr project — never amphibian-social/-studio

export const config = (env = process.env) => {
  const url = (env.SUPABASE_URL || "").trim().replace(/\/+$/, "");
  const key = (env.SUPABASE_SECRET_KEY || "").trim();
  if (!url || !key) throw new Error("Set SUPABASE_URL and SUPABASE_SECRET_KEY (atr project) in the environment.");
  let host;
  try { host = new URL(url).hostname; } catch (e) { throw new Error("SUPABASE_URL isn't a valid URL."); }
  if (host !== `${EXPECTED_REF}.supabase.co` && !env.ATR_ALLOW_OTHER_SUPABASE) {
    throw new Error(`SUPABASE_URL must point at the atr project (${EXPECTED_REF}.supabase.co), not ${host}.`);
  }
  return { url, key };
};

export const rest = async (cfg, path, init = {}, fetchImpl = globalThis.fetch) => {
  const res = await fetchImpl(`${cfg.url}/rest/v1/${path}`, {
    ...init,
    headers: { apikey: cfg.key, Authorization: `Bearer ${cfg.key}`, Accept: "application/json", ...(init.headers || {}) },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Supabase ${init.method || "GET"} ${path.split("?")[0]} failed: ${res.status} ${text.slice(0, 300)}`);
  }
  if (res.status === 204) return null;
  const text = await res.text();
  return text ? JSON.parse(text) : null;
};
