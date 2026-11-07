// ─── Photo prep for the library ───────────────────────────────────
// Decode in the browser, redraw on a canvas and re-encode as JPEG. Redrawing
// drops all EXIF (including GPS). Two copies, the same spec as the server
// (lib/imageResize.js) and the iNaturalist import:
//   reference  500 px long edge, q 0.80   what the AI ID compares against
//   master    1600 px long edge, q 0.85   private, the source for species pages
// Never upscales. Quality steps down only if a copy won't fit its cap.

export const SPEC = {
  reference: { edge: 500, quality: 0.8 },
  master: { edge: 1600, quality: 0.85 },
};
export const MAX_EDGE = SPEC.reference.edge;
export const MASTER_EDGE = SPEC.master.edge;
export const MIN_PUBLIC_EDGE = 800;
export const MAX_BYTES = 2 * 1024 * 1024;     // the reference-photos bucket cap
export const MASTER_MAX_BYTES = 1536 * 1024;  // keeps the request under Vercel's 4.5 MB body limit

// The size w × h becomes with its long edge cut to max. Never upscales.
export const fitLongEdge = (w, h, max) => {
  const width = Math.max(0, Math.round(Number(w) || 0));
  const height = Math.max(0, Math.round(Number(h) || 0));
  if (!width || !height) return { width, height };
  const scale = Math.min(1, max / Math.max(width, height));
  return { width: Math.max(1, Math.round(width * scale)), height: Math.max(1, Math.round(height * scale)) };
};

export const dataUrlBytes = (dataUrl) => {
  const b64 = String(dataUrl).split(",")[1] || "";
  return Math.floor((b64.length * 3) / 4) - (b64.endsWith("==") ? 2 : b64.endsWith("=") ? 1 : 0);
};

// A drawable (img or canvas) with its natural size → one JPEG copy at spec.
const encode = (src, sw, sh, { edge, quality }, maxBytes) => {
  const { width, height } = fitLongEdge(sw, sh, edge);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(src, 0, 0, width, height);
  for (let q = quality; q >= 0.5; q = Math.round((q - 0.1) * 100) / 100) {
    const dataUrl = canvas.toDataURL("image/jpeg", q);
    const bytes = dataUrlBytes(dataUrl);
    if (bytes <= maxBytes) return { dataUrl, width, height, bytes };
  }
  throw new Error("too-large");
};

// → { reference, master } where each is { dataUrl, width, height, bytes }.
// master is null when the source is no bigger than the reference copy.
export const copiesFrom = (src, sw, sh) => {
  const reference = encode(src, sw, sh, SPEC.reference, MAX_BYTES);
  const master = Math.max(sw, sh) > Math.max(reference.width, reference.height) ? encode(src, sw, sh, SPEC.master, MASTER_MAX_BYTES) : null;
  return { reference, master };
};

const loadImage = (src, { crossOrigin = false } = {}) => new Promise((resolve, reject) => {
  const img = new Image();
  if (crossOrigin) img.crossOrigin = "anonymous"; // signed Supabase URLs allow CORS, so the canvas stays readable
  img.onload = () => resolve(img);
  img.onerror = () => reject(new Error("decode"));
  img.src = src;
});

// A picked file → { reference, master }.
export const toLibraryJpegs = async (file) => {
  const url = URL.createObjectURL(file);
  try {
    const img = await loadImage(url);
    return copiesFrom(img, img.naturalWidth, img.naturalHeight);
  } finally {
    URL.revokeObjectURL(url);
  }
};

// The size a w × h image is after a quarter turn.
export const rotatedSize = (w, h, quarterTurns = 1) => (quarterTurns % 2 ? { width: h, height: w } : { width: w, height: h });

// An image URL (the best copy, via a signed download URL) turned 90° clockwise
// → { reference, master }, ready for Replace image.
export const rotate90 = async (url) => {
  const img = await loadImage(url, { crossOrigin: true });
  const { width, height } = rotatedSize(img.naturalWidth, img.naturalHeight);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  ctx.translate(width, 0);
  ctx.rotate(Math.PI / 2);
  ctx.drawImage(img, 0, 0);
  return copiesFrom(canvas, width, height);
};
