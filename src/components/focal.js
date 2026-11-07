// ─── Focus point ──────────────────────────────────────────────────
// Species-page galleries show every photo in a fixed 4:3 frame with
// object-fit: cover. focal_x / focal_y (0–1, default the centre) become the
// image's object-position, so the animal stays in frame when it's cropped.

export const clamp01 = (v) => (typeof v === "number" && Number.isFinite(v) ? Math.min(1, Math.max(0, v)) : 0.5);

// { x, y } → "30% 70%"
export const objectPosition = (focal) => {
  const x = clamp01(focal && focal.x);
  const y = clamp01(focal && focal.y);
  const pct = (v) => `${Math.round(v * 1000) / 10}%`;
  return `${pct(x)} ${pct(y)}`;
};

// Where the image actually sits inside a box when it's shown with
// object-fit: contain. → { left, top, width, height } relative to the box.
export const containRect = (boxW, boxH, imgW, imgH) => {
  if (!boxW || !boxH || !imgW || !imgH) return { left: 0, top: 0, width: boxW || 0, height: boxH || 0 };
  const scale = Math.min(boxW / imgW, boxH / imgH);
  const width = imgW * scale;
  const height = imgH * scale;
  return { left: (boxW - width) / 2, top: (boxH - height) / 2, width, height };
};

// A tap at (clientX, clientY) on a box (its getBoundingClientRect) showing an
// image of imgW × imgH with object-fit: contain → the focus point { x, y },
// each 0–1 and clamped to the picture, rounded to 3 places.
export const focalFromTap = (clientX, clientY, box, imgW, imgH) => {
  const r = containRect(box.width, box.height, imgW, imgH);
  const round = (v) => Math.round(v * 1000) / 1000;
  const x = r.width ? (clientX - box.left - r.left) / r.width : 0.5;
  const y = r.height ? (clientY - box.top - r.top) / r.height : 0.5;
  return { x: round(clamp01(x)), y: round(clamp01(y)) };
};
