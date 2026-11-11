// ─── Crops (server): species hero, category card and banner ───────
// The species-page hero is the dark design's tall photo: min(103vw, 440px)
// high, so 100 : 103 (TALL_ASPECT) on every phone. Category page headers keep
// the 2.4 : 1 banner (HERO_ASPECT, the old species hero's shape); Browse
// category cards use their own aspect (lib/categoryImages.js). Rowan picks the
// crop in /admin; it's stored as hero_crop { x, y, w, h }, fractions 0–1 of
// the image. Because the fractions are of the image, an aspect A in pixels means
//   (w × imageWidth) / (h × imageHeight) = A.
// Crops saved before the tall hero are 2.4 : 1; they stay in the database and
// the app centres on them (src/components/heroCrop.js), but new saves must be
// 100 : 103.
// The client maths (src/components/heroCrop.js) mirrors this; the server is
// the real check.

const { fail } = require("./admin");

const HERO_ASPECT = 2.4;        // the 2.4 : 1 banner (category headers; old species crops)
const TALL_ASPECT = 100 / 103;  // the species page's tall hero
const MIN_CROP_W = 0.3;        // at least 30 % of the image's width
const ASPECT_TOLERANCE = 0.02; // 2 %: rounding in the client and between image sizes
const EDGE = 0.001;

const round4 = (v) => Math.round(v * 10000) / 10000;

// The image's shape: the public copy, else the master, else the reference copy.
// All three are resizes of the same picture, so any gives the ratio.
const imageSize = (photo) => {
  const pairs = [[photo.public_width, photo.public_height], [photo.master_width, photo.master_height], [photo.width, photo.height]];
  const hit = pairs.find(([w, h]) => w > 0 && h > 0);
  return hit ? { width: hit[0], height: hit[1] } : null;
};

// The widest crop that fits (fraction of the image's width), for a frame of
// the given aspect (2.4 : 1 unless said otherwise).
const maxCropWidth = (imgAspect, aspect = HERO_ASPECT) => Math.min(1, aspect / imgAspect);
const minCropWidth = (imgAspect, aspect = HERO_ASPECT) => Math.min(MIN_CROP_W, maxCropWidth(imgAspect, aspect));

const fmtAspect = (a) => (Math.abs(a - TALL_ASPECT) < 1e-9 ? "100 : 103 (the tall species-page hero)" : `${Math.round(a * 100) / 100} : 1`);

// Any frame aspect (the hero's 2.4 : 1, a Browse card's 1.85 : 1). label names
// the crop in messages ("The hero crop", "The card crop").
// → the normalised crop (h recomputed from w so the aspect is exact, x/y
// clamped inside the image), or throws a 400 AdminError.
const validateCrop = (input, size, { aspect: frame = HERO_ASPECT, label = "The crop" } = {}) => {
  if (input === null) return null;
  if (!(typeof frame === "number" && frame > 0)) throw new Error("validateCrop: bad aspect");
  if (!input || typeof input !== "object" || Array.isArray(input)) fail(400, `${label} must be { x, y, w, h }.`);
  const keys = Object.keys(input);
  if (keys.length !== 4 || !["x", "y", "w", "h"].every(k => keys.includes(k))) fail(400, `${label} must be { x, y, w, h }.`);
  for (const k of ["x", "y", "w", "h"]) {
    const v = input[k];
    if (typeof v !== "number" || !Number.isFinite(v) || v < 0 || v > 1) fail(400, `${label} values must be between 0 and 1.`);
  }
  if (!size || !(size.width > 0) || !(size.height > 0)) fail(400, `This photo's size isn't known, so ${label.charAt(0).toLowerCase()}${label.slice(1)} can't be checked.`);
  const imgAspect = size.width / size.height;
  const { x, y, w, h } = input;
  if (w <= 0 || h <= 0) fail(400, `${label} is empty.`);
  if (w < minCropWidth(imgAspect, frame) - EDGE) fail(400, `${label} must be at least 30% of the photo's width.`);
  if (x + w > 1 + EDGE || y + h > 1 + EDGE) fail(400, `${label} goes outside the photo.`);
  const got = (w * imgAspect) / h;
  if (Math.abs(got / frame - 1) > ASPECT_TOLERANCE) fail(400, `${label} must be ${fmtAspect(frame)}.`);
  // Exact aspect from the width, then keep it inside the image.
  const cw = Math.min(w, maxCropWidth(imgAspect, frame));
  const ch = Math.min(1, (cw * imgAspect) / frame);
  const cx = Math.min(Math.max(0, x), 1 - cw);
  const cy = Math.min(Math.max(0, y), 1 - ch);
  return { x: round4(cx), y: round4(cy), w: round4(cw), h: round4(ch) };
};

const validateHeroCrop = (input, size) => validateCrop(input, size, { aspect: TALL_ASPECT, label: "The hero crop" });

module.exports = { HERO_ASPECT, TALL_ASPECT, MIN_CROP_W, ASPECT_TOLERANCE, imageSize, maxCropWidth, minCropWidth, validateCrop, validateHeroCrop };
