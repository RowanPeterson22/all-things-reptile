import { useEffect, useState } from "react";
import { CreditedImage } from "./PhotoCredit";
import ScrollRow from "./ScrollRow";

// ─── Species photo gallery ────────────────────────────────────────
// The photos Rowan chose in /admin for this species, from the public, read-only
// GET /api/species-photos (edge-cached). Renders nothing while loading, on any
// error, and when a species has no public photos, so a page without photos
// looks exactly as it did before.

const cache = new Map(); // url → Promise<photos[]>, for the life of the tab

export const fetchPublicPhotos = (species, fetchImpl) => {
  const url = species ? `/api/species-photos?species=${encodeURIComponent(species)}` : "/api/species-photos";
  if (!fetchImpl && cache.has(url)) return cache.get(url);
  const doFetch = fetchImpl || (typeof fetch === "function" ? fetch : null);
  if (!doFetch) return Promise.resolve([]);
  const p = Promise.resolve()
    .then(() => doFetch(url, { headers: { Accept: "application/json" } }))
    .then(res => (res && res.ok ? res.json() : { photos: [] }))
    .then(data => (data && Array.isArray(data.photos) ? data.photos.filter(ph => ph && ph.url) : []))
    .catch(() => []);
  if (!fetchImpl) {
    cache.set(url, p);
    p.then(list => { if (!list.length) cache.delete(url); }); // retry next visit if empty or failed
  }
  return p;
};

export const clearPhotoCache = () => cache.clear();

export const usePublicPhotos = (species, { all = false, fetchImpl } = {}) => {
  const [photos, setPhotos] = useState([]);
  useEffect(() => {
    if (!species && !all) { setPhotos([]); return undefined; }
    let live = true;
    fetchPublicPhotos(all ? null : species, fetchImpl).then(list => { if (live) setPhotos(list); });
    return () => { live = false; };
  }, [species, all, fetchImpl]);
  return photos;
};

// skip: how many leading photos are already shown elsewhere (the page hero).
const SpeciesGallery = ({ species, fetchImpl, skip = 0 }) => {
  const photos = usePublicPhotos(species, { fetchImpl }).slice(skip);
  if (!photos.length) return null;
  const single = photos.length === 1;
  return (
    <ScrollRow data-testid="species-gallery" aria-label="Photos" role="region" label="Photos"
      style={{ display: "flex", gap: 8, overflowX: "auto", scrollSnapType: "x mandatory", margin: "0 -18px 14px", padding: "0 18px", scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}>
      {photos.map(p => (
        <CreditedImage key={p.id} src={p.url} alt={p.alt} credit={p.credit} width={p.width} height={p.height} focal={p.focal}
          style={{ flex: single ? "1 0 100%" : "0 0 82%", maxWidth: single ? "100%" : 360, aspectRatio: "4 / 3", scrollSnapAlign: "start", borderRadius: 12, overflow: "hidden", background: "#f0f0ec" }} />
      ))}
    </ScrollRow>
  );
};

export default SpeciesGallery;
