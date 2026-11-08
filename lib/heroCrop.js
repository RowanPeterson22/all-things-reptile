// ─── Hero crop (server) ───────────────────────────────────────────
// The species-page hero is a fixed 2.4 : 1 banner. Rowan picks the crop in
// /admin; it's stored as hero_crop { x, y, w, h }, fractions 0–1 of the image.
// Because the fractions are of the image, the 2.4 : 1 aspect in pixels means
//   (w × imageWidth) / (h × imageHeight) = 2.4.
// The client maths (src/components/heroCrop.js) mirrors this; the server is
// the real check.

const { fail } = require("./admin");

const HERO_ASPECT = 2.4;
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

// The widest crop that fits (fraction of the image's width).
const maxCropWidth = (imgAspect) => Math.min(1, HERO_ASPECT / imgAspect);
const minCropWidth = (imgAspect) => Math.min(MIN_CROP_W, maxCropWidth(imgAspect));

// → the normalised crop (h recomputed from w so the aspect is exact, x/y
// clamped inside the image), or throws a 400 AdminError.
const validateHeroCrop = (input, size) => {
  if (input === null) return null;
  if (!input || typeof input !== "object" || Array.isArray(input)) fail(400, "The hero crop must be { x, y, w, h }.");
  const keys = Object.keys(input);
  if (keys.length !== 4 || !["x", "y", "w", "h"].every(k => keys.includes(k))) fail(400, "The hero crop must be { x, y, w, h }.");
  for (const k of ["x", "y", "w", "h"]) {
    const v = input[k];
    if (typeof v !== "number" || !Number.isFinite(v) || v < 0 || v > 1) fail(400, "Hero crop values must be between 0 and 1.");
  }
  if (!size || !(size.width > 0) || !(size.height > 0)) fail(400, "This photo's size isn't known, so a hero crop can't be checked.");
  const imgAspect = size.width / size.height;
  const { x, y, w, h } = input;
  if (w <= 0 || h <= 0) fail(400, "The hero crop is empty.");
  if (w < minCropWidth(imgAspect) - EDGE) fail(400, "The hero crop must be at least 30% of the photo's width.");
  if (x + w > 1 + EDGE || y + h > 1 + EDGE) fail(400, "The hero crop goes outside the photo.");
  const aspect = (w * imgAspect) / h;
  if (Math.abs(aspect / HERO_ASPECT - 1) > ASPECT_TOLERANCE) fail(400, "The hero crop must be 2.4 : 1.");
  // Exact aspect from the width, then keep it inside the image.
  const cw = Math.min(w, maxCropWidth(imgAspect));
  const ch = Math.min(1, (cw * imgAspect) / HERO_ASPECT);
  const cx = Math.min(Math.max(0, x), 1 - cw);
  const cy = Math.min(Math.max(0, y), 1 - ch);
  return { x: round4(cx), y: round4(cy), w: round4(cw), h: round4(ch) };
};

module.exports = { HERO_ASPECT, MIN_CROP_W, ASPECT_TOLERANCE, imageSize, maxCropWidth, minCropWidth, validateHeroCrop };
