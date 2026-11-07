// ─── Photo prep for the library ───────────────────────────────────
// Same approach as IdentifyScreen: decode in the browser, redraw on a canvas
// and re-encode as JPEG. Redrawing drops all EXIF (including GPS). The long
// edge is cut to MAX_EDGE and the quality stepped down until the file fits
// the reference-photos bucket's 2 MB cap.

export const MAX_EDGE = 1000;
export const MAX_BYTES = 2 * 1024 * 1024;
const QUALITIES = [0.85, 0.75, 0.65, 0.55];

export const dataUrlBytes = (dataUrl) => {
  const b64 = String(dataUrl).split(",")[1] || "";
  return Math.floor((b64.length * 3) / 4) - (b64.endsWith("==") ? 2 : b64.endsWith("=") ? 1 : 0);
};

// → { dataUrl, width, height, bytes }
export const toLibraryJpeg = (file) => new Promise((resolve, reject) => {
  const url = URL.createObjectURL(file);
  const img = new Image();
  img.onload = () => {
    const scale = Math.min(1, MAX_EDGE / Math.max(img.naturalWidth, img.naturalHeight));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
    canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
    URL.revokeObjectURL(url);
    for (const q of QUALITIES) {
      const dataUrl = canvas.toDataURL("image/jpeg", q);
      const bytes = dataUrlBytes(dataUrl);
      if (bytes <= MAX_BYTES) return resolve({ dataUrl, width: canvas.width, height: canvas.height, bytes });
    }
    reject(new Error("too-large"));
  };
  img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("decode")); };
  img.src = url;
});
