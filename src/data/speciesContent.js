import { useEffect, useState, useSyncExternalStore } from "react";
import SNAPSHOT from "./speciesContent.json";
import { validateDoc } from "./speciesContentShape";
import { readCode, BETA_HEADER } from "../beta/betaAccess";

// ─── Species content in the app (D5) ──────────────────────────────
// Every species page is one document (shape: ./speciesContentShape.js),
// mastered in the atr Supabase project and edited in /admin. The app paints
// straight away from the snapshot bundled at build time (speciesContent.json,
// also the offline fallback), then asks GET /api/species-photos?content=<slug>
// for the published document and swaps it in if it's valid. No rebuild is
// needed for an edit to show; the bundled copy only goes stale.
//
// Before launch the endpoint answers testers only (the atr_gate cookie, which
// the browser sends by itself, or the x-atr-beta code); anyone else gets 401
// and keeps the snapshot, which they could only have if they got past the gate.
//
// Freshness (D5 step 2): answers are kept 15 s in this tab, so a species
// opened again after a Publish in /admin fetches again; with the server's 15 s
// caches, an edit shows within about a minute (lib/speciesContent.js).

export const BUNDLED = Object.fromEntries(SNAPSHOT.map(d => [d.slug, d]));
export const BUNDLED_LIST = SNAPSHOT;
export const LIST_TTL_MS = 15 * 1000;

const cache = new Map(); // slug → { at, p: Promise<doc | null> }

export const fetchSpeciesContent = (slug, fetchImpl) => {
  const hit = !fetchImpl && cache.get(slug);
  if (hit && Date.now() - hit.at < LIST_TTL_MS) return hit.p;
  const doFetch = fetchImpl || (typeof fetch === "function" ? fetch : null);
  if (!doFetch || !slug) return Promise.resolve(null);
  const code = readCode();
  const headers = { Accept: "application/json", ...(code ? { [BETA_HEADER]: code } : {}) };
  const p = Promise.resolve()
    .then(() => doFetch(`/api/species-photos?content=${encodeURIComponent(slug)}`, { headers, credentials: "same-origin" }))
    .then(res => (res && res.ok ? res.json() : null))
    .then(data => {
      const doc = data && data.species;
      return doc && doc.slug === slug && validateDoc(doc).length === 0 ? doc : null;
    })
    .catch(() => null);
  if (!fetchImpl) {
    cache.set(slug, { at: Date.now(), p });
    p.then(doc => { if (!doc) cache.delete(slug); }); // try again next visit
  }
  return p;
};

// ─── The species list (Browse, Search, page titles) ───────────────
// Identity fields (name, latin, aka, category, level, emoji, order) of the
// 46, from the published documents (GET /api/species-photos?contentList=1),
// each falling back to the bundled snapshot. The slugs and categories are
// fixed (D4; /admin can't change them), so routes and counts never move;
// names, latin, level and order can.
const identity = (d) => ({ id: d.id, page: d.id, slug: d.slug, name: d.name, latin: d.latin, aka: d.aka || null, type: d.type, level: d.level, emoji: d.emoji, sortOrder: d.sortOrder });
const ordered = (list) => [...list].sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, "en"));
export const BUNDLED_SPECIES = ordered(SNAPSHOT.map(identity));
const BUNDLED_BY_SLUG = Object.fromEntries(BUNDLED_SPECIES.map(s => [s.slug, s]));

// Published rows over the snapshot: only known slugs, never a new category or id.
export const mergeSpeciesList = (published) => {
  const fresh = Object.fromEntries((Array.isArray(published) ? published : [])
    .filter(r => r && BUNDLED_BY_SLUG[r.slug] && typeof r.name === "string" && r.name.trim() && typeof r.latin === "string" && typeof r.level === "string" && Number.isInteger(r.sortOrder))
    .map(r => [r.slug, r]));
  return ordered(BUNDLED_SPECIES.map(b => (fresh[b.slug]
    ? { ...b, name: fresh[b.slug].name, latin: fresh[b.slug].latin, aka: fresh[b.slug].aka || null, level: fresh[b.slug].level, sortOrder: fresh[b.slug].sortOrder }
    : b)));
};

let listState = { at: 0, list: BUNDLED_SPECIES, pending: null };
const listeners = new Set();
const emit = () => listeners.forEach(f => f());

export const refreshSpeciesList = (fetchImpl) => {
  const doFetch = fetchImpl || (typeof fetch === "function" ? fetch : null);
  if (!doFetch) return Promise.resolve(listState.list);
  if (listState.pending) return listState.pending;
  if (listState.at && Date.now() - listState.at < LIST_TTL_MS) return Promise.resolve(listState.list);
  const code = readCode();
  const headers = { Accept: "application/json", ...(code ? { [BETA_HEADER]: code } : {}) };
  const p = Promise.resolve()
    .then(() => doFetch("/api/species-photos?contentList=1", { headers, credentials: "same-origin" }))
    .then(res => (res && res.ok ? res.json() : null))
    .catch(() => null)
    .then(data => {
      const next = data && Array.isArray(data.species) ? mergeSpeciesList(data.species) : null;
      const changed = next && JSON.stringify(next) !== JSON.stringify(listState.list);
      // A failed or refused fetch keeps what we have and tries again next time.
      listState = { at: next ? Date.now() : 0, list: next || listState.list, pending: null };
      if (changed) emit();
      return listState.list;
    });
  listState = { ...listState, pending: p };
  return p;
};

// The current list (snapshot until the server answers), synchronously.
export const currentSpeciesList = () => listState.list;
export const speciesBySlug = (slug) => listState.list.find(s => s.slug === slug) || null;

const subscribe = (f) => { listeners.add(f); return () => listeners.delete(f); };
// live: ask the server (a verified tester, or the site is public). Otherwise
// the endpoint would only answer 401, so the snapshot stands and nothing is sent.
export const useSpeciesList = (live = false) => {
  const list = useSyncExternalStore(subscribe, currentSpeciesList, currentSpeciesList);
  useEffect(() => { if (live) refreshSpeciesList(); }, [live]);
  return list;
};

export const clearSpeciesContentCache = () => {
  cache.clear();
  listState = { at: 0, list: BUNDLED_SPECIES, pending: null };
  emit();
};

// The document for a slug: the bundled copy first, then the published one.
// With `doc` (the /admin preview) that document is shown as given and nothing is fetched.
export const useSpeciesContent = (slug, { fetchImpl, doc: given } = {}) => {
  const [doc, setDoc] = useState(() => BUNDLED[slug] || null);
  const preview = Boolean(given);
  useEffect(() => {
    if (preview) return undefined;
    setDoc(BUNDLED[slug] || null);
    if (!slug) return undefined;
    let live = true;
    fetchSpeciesContent(slug, fetchImpl).then(fresh => { if (live && fresh) setDoc(fresh); });
    return () => { live = false; };
  }, [slug, fetchImpl, preview]);
  return given || doc;
};
