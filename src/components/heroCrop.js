import { objectPosition } from "./focal";

// ─── Hero crop maths (client) ─────────────────────────────────────
// The species-page hero is a fixed 2.4 : 1 banner. A crop is { x, y, w, h },
// fractions 0–1 of the image (lib/heroCrop.js checks the same rules on the
// server). With the image's aspect A = width / height, a 2.4 : 1 crop has
//   h = w × A / 2.4.
// The banner shows the crop exactly: the image is absolutely positioned and
// scaled so the crop rect fills the banner (heroImageStyle).

export const HERO_ASPECT = 2.4;
export const MIN_CROP_W = 0.3;

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const num = (v, d) => (typeof v === "number" && Number.isFinite(v) ? v : d);
const round4 = (v) => Math.round(v * 10000) / 10000;

// Every helper takes the frame's aspect last (2.4 : 1 unless said otherwise),
// so the same maths serves the hero, category banners and Browse cards.
export const maxCropWidth = (imgAspect, aspect = HERO_ASPECT) => Math.min(1, aspect / imgAspect);
export const minCropWidth = (imgAspect, aspect = HERO_ASPECT) => Math.min(MIN_CROP_W, maxCropWidth(imgAspect, aspect));
export const heightFor = (w, imgAspect, aspect = HERO_ASPECT) => (w * imgAspect) / aspect;

// Any { x, y, w } → a valid 2.4 : 1 crop inside the image: w clamped to
// [min, max], h from the aspect, x/y kept inside.
export const fitCrop = (crop, imgAspect, aspect = HERO_ASPECT) => {
  const w = clamp(num(crop && crop.w, maxCropWidth(imgAspect, aspect)), minCropWidth(imgAspect, aspect), maxCropWidth(imgAspect, aspect));
  const h = Math.min(1, heightFor(w, imgAspect, aspect));
  const x = clamp(num(crop && crop.x, (1 - w) / 2), 0, 1 - w);
  const y = clamp(num(crop && crop.y, (1 - h) / 2), 0, 1 - h);
  return { x: round4(x), y: round4(y), w: round4(w), h: round4(h) };
};

// The widest 2.4 : 1 crop, centred on the focus point (then clamped): the
// fallback when Rowan hasn't chosen a crop.
export const defaultCrop = (imgAspect, focal, aspect = HERO_ASPECT) => {
  const w = maxCropWidth(imgAspect, aspect);
  const h = Math.min(1, heightFor(w, imgAspect, aspect));
  const fx = clamp(num(focal && focal.x, 0.5), 0, 1);
  const fy = clamp(num(focal && focal.y, 0.5), 0, 1);
  return fitCrop({ x: fx - w / 2, y: fy - h / 2, w }, imgAspect, aspect);
};

// Move by (dx, dy) in image fractions, staying inside.
export const moveCrop = (crop, dx, dy, imgAspect, aspect = HERO_ASPECT) => fitCrop({ ...crop, x: crop.x + dx, y: crop.y + dy }, imgAspect, aspect);

// Resize to width w about the crop's centre, staying inside.
export const zoomCrop = (crop, w, imgAspect, aspect = HERO_ASPECT) => {
  const cx = crop.x + crop.w / 2;
  const cy = crop.y + crop.h / 2;
  const nw = clamp(w, minCropWidth(imgAspect, aspect), maxCropWidth(imgAspect, aspect));
  const nh = Math.min(1, heightFor(nw, imgAspect, aspect));
  return fitCrop({ x: cx - nw / 2, y: cy - nh / 2, w: nw }, imgAspect, aspect);
};

// The crop to show for a public photo: the stored one, else centred on the
// focus point. Needs the image's size; null when it isn't known.
export const heroCropFor = (photo) => cropFor(photo, photo && photo.heroCrop, HERO_ASPECT);

// The same for any frame: the stored crop fitted to the frame's aspect, else
// the widest one centred on the focus point.
export const cropFor = (photo, stored, aspect = HERO_ASPECT) => {
  if (!photo || !(photo.width > 0) || !(photo.height > 0)) return null;
  const imgAspect = photo.width / photo.height;
  return stored ? fitCrop(stored, imgAspect, aspect) : defaultCrop(imgAspect, photo.focal, aspect);
};

// Crop rect → the <img> style inside a box of the crop's aspect with overflow hidden.
// Percentages of the box, so it holds at any banner width.
export const heroImageStyle = (crop) => {
  const pct = (v) => `${Math.round(v * 10000) / 100}%`;
  return {
    position: "absolute",
    width: pct(1 / crop.w),
    height: pct(1 / crop.h),
    left: pct(-crop.x / crop.w),
    top: pct(-crop.y / crop.h),
    maxWidth: "none",
    display: "block",
  };
};

// The species' main image: the one ticked as hero, else the first by order
// (the list arrives sorted by public_order).
export const pickHero = (photos) => (photos && photos.length ? photos.find(p => p && p.hero) || photos[0] : null);
export const othersThan = (photos, hero) => (photos || []).filter(p => p !== hero);

// ─── The species page's tall hero (the dark design) ───────────────
// About 400 px tall on a 390 px phone. A 2.4 : 1 crop can't fill a near-square
// frame, so the photo covers it centred on the stored crop's centre (else the
// focus point). The /admin crop editor still previews the 2.4 : 1 banner.
export const TALL_H = "min(103vw, 440px)";

export const tallPosition = (photo) => {
  const c = photo && photo.heroCrop && photo.width > 0 && photo.height > 0 ? heroCropFor(photo) : null;
  if (!c) return objectPosition(photo && photo.focal);
  return objectPosition({ x: c.x + c.w / 2, y: c.y + c.h / 2 });
};
