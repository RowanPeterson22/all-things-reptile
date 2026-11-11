import { useCallback, useEffect, useState } from "react";

// ─── Customise Home (Rowan, 11 Nov 2026) ──────────────────────────
// Each keeper chooses which section tiles their Home shows, and in what
// order. Home only: the ☰ menu, Learn, Community and My Profile always list
// everything. Until ATR logins exist (D7) the choice lives on this device
// (localStorage); it moves to the account when accounts arrive.
//
// Stored: { v: 1, order: [keys], hidden: [keys] }. Keys the visitor can't
// see are ignored; tiles not in `order` (new sections) keep their default
// place after the ordered ones, and show unless hidden. Storage can throw or
// come back empty (private mode): then everything is the default.

export const HOME_PREFS_KEY = "atr_home_tiles_v1";
const EMPTY = { v: 1, order: [], hidden: [] };

const clean = (p) => ({
  v: 1,
  order: Array.isArray(p && p.order) ? p.order.filter(k => typeof k === "string") : [],
  hidden: Array.isArray(p && p.hidden) ? p.hidden.filter(k => typeof k === "string") : [],
});

export const loadHomePrefs = () => {
  try {
    const raw = window.localStorage.getItem(HOME_PREFS_KEY);
    return raw ? clean(JSON.parse(raw)) : EMPTY;
  } catch { return EMPTY; }
};

const saveHomePrefs = (p) => {
  try {
    if (!p.order.length && !p.hidden.length) window.localStorage.removeItem(HOME_PREFS_KEY);
    else window.localStorage.setItem(HOME_PREFS_KEY, JSON.stringify(p));
  } catch { /* the choice still holds for this visit */ }
};

// Tiles in the keeper's order, each with `shown`.
export const arrangeTiles = (tiles, prefs) => {
  const byKey = new Map(tiles.map(t => [t.key, t]));
  const seen = new Set();
  const out = [];
  for (const k of prefs.order) if (byKey.has(k) && !seen.has(k)) { seen.add(k); out.push(byKey.get(k)); }
  for (const t of tiles) if (!seen.has(t.key)) out.push(t);
  const hidden = new Set(prefs.hidden);
  return out.map(t => ({ ...t, shown: !hidden.has(t.key) }));
};

// What Home's Explore block shows.
export const homeTiles = (tiles, prefs) => arrangeTiles(tiles, prefs).filter(t => t.shown);

export const isCustomised = (prefs) => prefs.order.length > 0 || prefs.hidden.length > 0;

export function useHomePrefs() {
  const [prefs, setPrefs] = useState(loadHomePrefs);
  // Another tab of the app changed it.
  useEffect(() => {
    const onStorage = (e) => { if (e.key === HOME_PREFS_KEY) setPrefs(loadHomePrefs()); };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);
  const update = useCallback((next) => { const c = clean(next); saveHomePrefs(c); setPrefs(c); }, []);
  const reset = useCallback(() => update(EMPTY), [update]);
  return { prefs, update, reset };
}
