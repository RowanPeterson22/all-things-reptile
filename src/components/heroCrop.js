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
// About 400 px tall on a 390 px phone: height min(103vw, 440px), so on every
// phone from 291 to 427 px wide the frame is exactly 100 : 103 (TALL_ASPECT).
// hero_crop is now stored at that aspect (lib/heroCrop.js checks it), and the
// hero shows Rowan's crop exactly. Old crops saved for the 2.4 : 1 banner
// can't fill a near-square frame, so for those (and with no crop) the photo
// covers the frame on the crop's centre (else the focus point), as before.

export const TALL_H = "min(103vw, 440px)";
export const TALL_MIN_H = 300;
export const TALL_ASPECT = 100 / 103;
export const CROP_TOLERANCE = 0.02; // as the server's ASPECT_TOLERANCE

// Is this crop (fractions of an image of aspect imgAspect) at the frame's aspect?
export const isCropAt = (crop, imgAspect, aspect) => Boolean(crop && crop.w > 0 && crop.h > 0 && imgAspect > 0
  && Math.abs(((crop.w * imgAspect) / crop.h) / aspect - 1) <= CROP_TOLERANCE);

export const cropCentre = (crop) => (crop ? { x: crop.x + crop.w / 2, y: crop.y + crop.h / 2 } : null);

// The photo's tall-hero crop, or null (none, a legacy 2.4 : 1 one, or no size).
export const tallCropFor = (photo) => {
  if (!photo || !photo.heroCrop || !(photo.width > 0) || !(photo.height > 0)) return null;
  const A = photo.width / photo.height;
  return isCropAt(photo.heroCrop, A, TALL_ASPECT) ? fitCrop(photo.heroCrop, A, TALL_ASPECT) : null;
};

// Legacy and no-crop framing: cover, positioned on the crop's centre (else the focus point).
export const tallPosition = (photo) => {
  const c = photo && photo.heroCrop && photo.width > 0 && photo.height > 0 ? heroCropFor(photo) : null;
  if (!c) return objectPosition(photo && photo.focal);
  return objectPosition(cropCentre(c));
};

// The part of the image a frame of aspect F shows for a crop: the whole crop,
// widened (or deepened) about its centre to the frame's shape, kept inside the
// image; only if the image runs out is the crop itself trimmed. At F equal to
// the crop's aspect (every phone) it is the crop exactly.
export const coverRegion = (crop, imgAspect, F) => {
  const cA = (crop.w * imgAspect) / crop.h;
  if (Math.abs(F / cA - 1) < 0.002) return crop; // the frame is the crop's shape (every phone)
  let w; let h;
  if (F >= cA) { h = crop.h; w = (h * F) / imgAspect; } else { w = crop.w; h = (w * imgAspect) / F; }
  if (w > 1) { w = 1; h = imgAspect / F; }
  if (h > 1) { h = 1; w = F / imgAspect; }
  const c = cropCentre(crop);
  return { x: clamp(c.x - w / 2, 0, 1 - w), y: clamp(c.y - h / 2, 0, 1 - h), w, h };
};

// The <img> style for one photo in the tall hero, whose frame has aspect F
// (measured; TALL_ASPECT until it is).
export const tallImageStyle = (photo, F = TALL_ASPECT) => {
  const crop = tallCropFor(photo);
  if (crop) return heroImageStyle(coverRegion(crop, photo.width / photo.height, F));
  return { position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: tallPosition(photo), display: "block" };
};
