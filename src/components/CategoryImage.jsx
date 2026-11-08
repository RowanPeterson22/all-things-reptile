import { useEffect, useState } from "react";
import { PhotoCredit } from "./PhotoCredit";
import { objectPosition } from "./focal";
import { cropFor, heroImageStyle } from "./heroCrop";
import { CARD_ASPECT } from "../constants/categoryFrames";

// ─── Category images ──────────────────────────────────────────────
// The photo Rowan chose for each Browse category (/admin → Categories), from
// the public, read-only GET /api/species-photos?categories=1 (edge-cached).
// Fetched once per tab, like usePublicPhotos; a failed or empty answer is
// retried on the next visit. Each entry:
//   { category, url, width, height, focal, crop, bannerCrop, credit, alt, speciesName }

const URL_ = "/api/species-photos?categories=1";
let cached = null; // Promise<images[]>

export const fetchCategoryImages = (fetchImpl) => {
  if (!fetchImpl && cached) return cached;
  const doFetch = fetchImpl || (typeof fetch === "function" ? fetch : null);
  if (!doFetch) return Promise.resolve([]);
  const p = Promise.resolve()
    .then(() => doFetch(URL_, { headers: { Accept: "application/json" } }))
    .then(res => (res && res.ok ? res.json() : { categories: [] }))
    .then(data => (data && Array.isArray(data.categories) ? data.categories.filter(c => c && c.url && c.category) : []))
    .catch(() => []);
  if (!fetchImpl) {
    cached = p;
    p.then(list => { if (!list.length) cached = null; });
  }
  return p;
};

export const clearCategoryImageCache = () => { cached = null; };

// → { [category id]: image }
export const useCategoryImages = ({ fetchImpl } = {}) => {
  const [byId, setById] = useState({});
  useEffect(() => {
    let live = true;
    fetchCategoryImages(fetchImpl).then(list => { if (live) setById(Object.fromEntries(list.map(c => [c.category, c]))); });
    return () => { live = false; };
  }, [fetchImpl]);
  return byId;
};

// The Browse card's image block: the card crop exactly, with the credit icon.
// Keeps the card's aspect (90 px tall at 375 px) at every width. onBroken lets
// the card fall back to its emoji.
export const CategoryCardImage = ({ image, bg, onBroken }) => {
  const crop = cropFor(image, image.crop, CARD_ASPECT);
  const style = crop
    ? heroImageStyle(crop)
    : { position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: objectPosition(image.focal), display: "block" };
  return (
    <div data-testid="category-card-image" style={{ position: "relative", width: "100%", aspectRatio: `${CARD_ASPECT} / 1`, overflow: "hidden", background: bg }}>
      <img src={image.url} alt={image.alt || ""} loading="lazy" decoding="async" onError={() => onBroken && onBroken()} style={style} />
      <PhotoCredit credit={image.credit} />
    </div>
  );
};

// The emoji block, at the same aspect so a row of cards lines up.
export const CategoryEmoji = ({ emoji, bg }) => (
  <div data-testid="category-card-emoji" style={{ width: "100%", aspectRatio: `${CARD_ASPECT} / 1`, background: bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 42 }}>{emoji}</div>
);

// Remembers images that failed to load, so their cards show the emoji.
export const useBrokenSet = () => {
  const [broken, setBroken] = useState({});
  return [broken, (key) => setBroken(b => ({ ...b, [key]: true }))];
};
