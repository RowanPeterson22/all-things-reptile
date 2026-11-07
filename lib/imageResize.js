// ─── Server-side JPEG resizing (pure JS) ─────────────────────────
// jpeg-js decodes and encodes; a separable box (area-average) filter shrinks.
// No native binaries, so it runs on Vercel's Node runtime as-is. Re-encoding
// writes a bare JFIF, so EXIF (GPS, camera) never survives.
//
// The sizes, shared with the browser side (src/admin/image.js):
//   reference  500 px long edge, q 0.80   private reference-photos (AI ID)
//   master    1600 px long edge, q 0.85   private, source for public use
//   public    1280 px long edge, q 0.82   public species-photos
// Never upscales. Public use needs a source of at least 800 px.

const jpeg = require("jpeg-js");

const SPEC = {
  reference: { edge: 500, quality: 0.8 },
  master: { edge: 1600, quality: 0.85 },
  public: { edge: 1280, quality: 0.82 },
};
const MIN_PUBLIC_EDGE = 800;

// The size an image of w × h becomes with its long edge cut to max. Never upscales.
const fitLongEdge = (w, h, max) => {
  const width = Math.max(0, Math.round(Number(w) || 0));
  const height = Math.max(0, Math.round(Number(h) || 0));
  if (!width || !height) return { width, height };
  const scale = Math.min(1, max / Math.max(width, height));
  return { width: Math.max(1, Math.round(width * scale)), height: Math.max(1, Math.round(height * scale)) };
};

const longEdge = (w, h) => Math.max(Number(w) || 0, Number(h) || 0);

// One axis of a box filter: averages each output cell's footprint, with
// fractional weights at the edges. src/dst are RGBA Uint8 / Float32 buffers.
const resampleAxis = (src, sw, sh, dw, horizontal) => {
  const inLen = horizontal ? sw : sh;
  const lines = horizontal ? sh : sw;
  const outW = horizontal ? dw : sw;
  const outH = horizontal ? sh : dw;
  const out = new Float32Array(outW * outH * 4);
  const ratio = inLen / dw;
  for (let o = 0; o < dw; o++) {
    const start = o * ratio;
    const end = start + ratio;
    const i0 = Math.floor(start);
    const i1 = Math.min(inLen, Math.ceil(end));
    for (let line = 0; line < lines; line++) {
      let r = 0, g = 0, b = 0, a = 0, wsum = 0;
      for (let i = i0; i < i1; i++) {
        const w = Math.min(end, i + 1) - Math.max(start, i);
        if (w <= 0) continue;
        const si = (horizontal ? line * sw + i : i * sw + line) * 4;
        r += src[si] * w; g += src[si + 1] * w; b += src[si + 2] * w; a += src[si + 3] * w; wsum += w;
      }
      const di = (horizontal ? line * outW + o : o * outW + line) * 4;
      out[di] = r / wsum; out[di + 1] = g / wsum; out[di + 2] = b / wsum; out[di + 3] = a / wsum;
    }
  }
  return out;
};

const resizeRgba = (data, sw, sh, dw, dh) => {
  if (dw === sw && dh === sh) return data;
  const pass1 = dw === sw ? data : resampleAxis(data, sw, sh, dw, true);
  const pass2 = dh === sh ? pass1 : resampleAxis(pass1, dw, sh, dh, false);
  const out = Buffer.alloc(dw * dh * 4);
  for (let i = 0; i < out.length; i++) out[i] = Math.max(0, Math.min(255, Math.round(pass2[i])));
  return out;
};

const decode = (buf) => jpeg.decode(buf, { useTArray: true, formatAsRGBA: true, maxResolutionInMP: 40, maxMemoryUsageInMB: 512 });

// JPEG buffer → { buf, width, height, sourceWidth, sourceHeight } at the spec.
// `decoded` lets several sizes share one decode.
// maxBytes: steps the quality down (by 0.1, to 0.5 at most) until it fits a bucket cap.
const toJpeg = (input, { edge, quality }, decoded, { maxBytes = Infinity } = {}) => {
  const img = decoded || decode(input);
  const { width, height } = fitLongEdge(img.width, img.height, edge);
  const data = resizeRgba(img.data, img.width, img.height, width, height);
  let q = quality;
  let out = Buffer.from(jpeg.encode({ data, width, height }, Math.round(q * 100)).data);
  while (out.length > maxBytes && q > 0.55) {
    q = Math.round((q - 0.1) * 100) / 100;
    out = Buffer.from(jpeg.encode({ data, width, height }, Math.round(q * 100)).data);
  }
  if (out.length > maxBytes) throw Object.assign(new Error("too-large"), { code: "too-large" });
  return { buf: out, width, height, sourceWidth: img.width, sourceHeight: img.height };
};

module.exports = { SPEC, MIN_PUBLIC_EDGE, fitLongEdge, longEdge, toJpeg, decode, resizeRgba };
