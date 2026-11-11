import { useEffect, useState } from "react";
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

export const BUNDLED = Object.fromEntries(SNAPSHOT.map(d => [d.slug, d]));
export const BUNDLED_LIST = SNAPSHOT;

const cache = new Map(); // slug → Promise<doc | null>, for the life of the tab

export const fetchSpeciesContent = (slug, fetchImpl) => {
  if (!fetchImpl && cache.has(slug)) return cache.get(slug);
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
    cache.set(slug, p);
    p.then(doc => { if (!doc) cache.delete(slug); }); // try again next visit
  }
  return p;
};

export const clearSpeciesContentCache = () => cache.clear();

// The document for a slug: the bundled copy first, then the published one.
export const useSpeciesContent = (slug, { fetchImpl } = {}) => {
  const [doc, setDoc] = useState(() => BUNDLED[slug] || null);
  useEffect(() => {
    setDoc(BUNDLED[slug] || null);
    if (!slug) return undefined;
    let live = true;
    fetchSpeciesContent(slug, fetchImpl).then(fresh => { if (live && fresh) setDoc(fresh); });
    return () => { live = false; };
  }, [slug, fetchImpl]);
  return doc;
};
