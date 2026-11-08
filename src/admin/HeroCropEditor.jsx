import { useEffect, useRef, useState } from "react";
import { C } from "../constants/colours";
import { HERO_ASPECT, fitCrop, defaultCrop, moveCrop, zoomCrop, maxCropWidth, minCropWidth, heroImageStyle } from "../components/heroCrop";
import { N, smallBtn, hint } from "./ui";

// ─── Crop editor (species hero, category card and banner) ────────
// The whole photo with a fixed-aspect crop box over it (2.4 : 1 for the
// species hero and category banners; the Browse card's aspect for category
// cards). Drag (mouse, pen or
// one finger) to position it; pinch, drag the corner handle or use the Zoom
// slider to resize it (never under 30 % of the photo's width). Arrow keys
// move it, + and − zoom. A live preview shows the species-page header.
// Saves { x, y, w, h } (0–1); the server checks it again. The species-page
// use (hero_crop) is the default; CropEditor takes aspect, stored crop, labels
// and its own preview for other frames.

const STEP = 0.01;

// Build a crop from a stored value (or the focus-point default).
export const initialCrop = (photo, imgAspect, { stored = photo.hero_crop, aspect = HERO_ASPECT } = {}) => (stored
  ? fitCrop(stored, imgAspect, aspect)
  : defaultCrop(imgAspect, { x: photo.focal_x ?? 0.5, y: photo.focal_y ?? 0.5 }, aspect));

const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

export const HeroPreview = ({ url, crop, label = "Preview of the species-page header" }) => (
  <div aria-label={label} role="img" style={{ position: "relative", width: "100%", aspectRatio: `${HERO_ASPECT} / 1`, overflow: "hidden", background: C.black, borderRadius: 8 }}>
    <img src={url} alt="" style={heroImageStyle(crop)} />
    <div aria-hidden="true" style={{ position: "absolute", top: 0, left: 0, right: 0, height: "54%", background: "linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0))" }} />
    <div aria-hidden="true" style={{ position: "absolute", top: 8, left: 12, color: "white", fontSize: 11, fontWeight: 700 }}>‹ Back to browse</div>
    <span aria-hidden="true" style={{ position: "absolute", right: 10, bottom: 20 + 10, width: 18, height: 18, borderRadius: "50%", background: "rgba(0,0,0,0.55)", border: "1.5px solid rgba(255,255,255,0.9)", color: "white", fontSize: 11, lineHeight: "15px", textAlign: "center", fontFamily: "Georgia, serif", fontStyle: "italic", fontWeight: 700, boxSizing: "border-box" }}>i</span>
    {/* The white sheet overlaps the bottom 20 px on the real page. */}
    <div aria-hidden="true" style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 20, background: "white", borderRadius: "14px 14px 0 0" }} />
  </div>
);

export const CropEditor = ({
  photo, busy, onSave, onCancel,
  frame = HERO_ASPECT, stored = photo.hero_crop, title = "Hero crop", saveLabel = "Save hero crop",
  testId = "hero-crop", boxLabel = "Hero crop box", renderPreview, defaultHint,
}) => {
  const [nat, setNat] = useState({ w: photo.public_width || photo.width || 4, h: photo.public_height || photo.height || 3 });
  const aspect = nat.w / nat.h; // the image's
  const [crop, setCrop] = useState(() => initialCrop(photo, aspect, { stored, aspect: frame }));
  const stageRef = useRef(null);
  const pointers = useRef(new Map());
  const gesture = useRef(null);
  const minW = minCropWidth(aspect, frame);
  const maxW = maxCropWidth(aspect, frame);

  // The real image shape can differ from the stored numbers (e.g. before load).
  useEffect(() => { setCrop(c => fitCrop(c, aspect, frame)); }, [aspect, frame]);

  const stageBox = () => (stageRef.current ? stageRef.current.getBoundingClientRect() : { width: 1, height: 1, left: 0, top: 0 });

  const startGesture = () => {
    const pts = [...pointers.current.values()];
    if (pts.length >= 2) gesture.current = { kind: "pinch", crop, d: dist(pts[0], pts[1]) || 1 };
    else if (pts.length === 1) gesture.current = { kind: pts[0].handle ? "resize" : "move", crop, x: pts[0].x, y: pts[0].y };
    else gesture.current = null;
  };

  const onPointerDown = (e) => {
    if (busy) return;
    e.preventDefault();
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch (err) { /* jsdom / old browsers */ }
    const handle = Boolean(e.target && e.target.closest && e.target.closest("[data-crop-handle]"));
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY, handle });
    startGesture();
  };
  const onPointerMove = (e) => {
    if (!pointers.current.has(e.pointerId) || !gesture.current) return;
    pointers.current.set(e.pointerId, { ...pointers.current.get(e.pointerId), x: e.clientX, y: e.clientY });
    const g = gesture.current;
    const box = stageBox();
    if (g.kind === "pinch") {
      const pts = [...pointers.current.values()];
      if (pts.length < 2) return;
      const d = dist(pts[0], pts[1]) || 1;
      // Fingers apart → zoom in → a smaller crop.
      setCrop(zoomCrop(g.crop, g.crop.w * (g.d / d), aspect, frame));
    } else if (g.kind === "resize") {
      const w = g.crop.w + (e.clientX - g.x) / box.width;
      setCrop(fitCrop({ x: g.crop.x, y: g.crop.y, w: Math.min(Math.max(w, minW), Math.min(maxW, 1 - g.crop.x)) }, aspect, frame));
    } else {
      setCrop(moveCrop(g.crop, (e.clientX - g.x) / box.width, (e.clientY - g.y) / box.height, aspect, frame));
    }
  };
  const onPointerUp = (e) => {
    pointers.current.delete(e.pointerId);
    startGesture(); // a pinch that drops to one finger carries on as a move
  };

  const zoom = maxW > minW ? (maxW - crop.w) / (maxW - minW) : 0;
  const setZoom = (z) => setCrop(c => zoomCrop(c, maxW - z * (maxW - minW), aspect, frame));

  const onKeyDown = (e) => {
    const move = { ArrowLeft: [-STEP, 0], ArrowRight: [STEP, 0], ArrowUp: [0, -STEP], ArrowDown: [0, STEP] }[e.key];
    if (move) { e.preventDefault(); setCrop(c => moveCrop(c, move[0], move[1], aspect, frame)); return; }
    if (e.key === "+" || e.key === "=") { e.preventDefault(); setCrop(c => zoomCrop(c, c.w - 0.02, aspect, frame)); }
    if (e.key === "-" || e.key === "_") { e.preventDefault(); setCrop(c => zoomCrop(c, c.w + 0.02, aspect, frame)); }
  };

  const pct = (v) => `${v * 100}%`;
  return (
    <div data-testid={`${testId}-editor`} style={{ background: N.wash, borderRadius: 10, padding: 10, margin: "10px 0" }}>
      <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 2 }}>{title}</div>
      <div style={{ ...hint, marginTop: 0, marginBottom: 6 }}>Drag the box to frame the animal. Pinch, drag the corner or use Zoom to resize.</div>
      <div ref={stageRef} data-testid={`${testId}-stage`}
        onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp}
        style={{ position: "relative", width: `min(100%, calc(60vh * ${aspect}))`, aspectRatio: `${nat.w} / ${nat.h}`, margin: "0 auto", background: "#222", borderRadius: 8, overflow: "hidden", touchAction: "none", userSelect: "none", WebkitUserSelect: "none", cursor: busy ? "default" : "move" }}>
        <img src={photo.url} alt="" draggable={false}
          onLoad={e => { const { naturalWidth: w, naturalHeight: h } = e.currentTarget; if (w && h) setNat({ w, h }); }}
          style={{ width: "100%", height: "100%", display: "block", pointerEvents: "none" }} />
        <div data-testid={`${testId}-box`} role="slider" tabIndex={0} aria-label={`${boxLabel}. Arrow keys move it; plus and minus resize it.`}
          aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(crop.x * 100)}
          aria-valuetext={`${Math.round(crop.x * 100)}% across, ${Math.round(crop.y * 100)}% down, ${Math.round(crop.w * 100)}% wide`}
          onKeyDown={onKeyDown}
          style={{ position: "absolute", left: pct(crop.x), top: pct(crop.y), width: pct(crop.w), height: pct(crop.h), boxSizing: "border-box", border: "2px solid white", boxShadow: "0 0 0 9999px rgba(0,0,0,0.55)", outline: "none" }}>
          {/* Rule of thirds */}
          <div aria-hidden="true" style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(to right, transparent 33.2%, rgba(255,255,255,0.45) 33.3%, transparent 33.6%, transparent 66.5%, rgba(255,255,255,0.45) 66.6%, transparent 66.9%)" }} />
          <div data-crop-handle="true" aria-hidden="true"
            style={{ position: "absolute", right: -16, bottom: -16, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "nwse-resize" }}>
            <span style={{ width: 16, height: 16, borderRadius: "50%", background: C.green, border: "2px solid white", boxShadow: "0 1px 3px rgba(0,0,0,0.5)" }} />
          </div>
        </div>
      </div>

      <label style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12, fontWeight: 700, margin: "10px 0 4px" }}>
        Zoom
        <input type="range" min={0} max={1} step={0.01} value={Math.round(zoom * 100) / 100} disabled={busy || maxW <= minW}
          onChange={e => setZoom(Number(e.target.value))} aria-label="Zoom" style={{ flex: 1, minHeight: 36, accentColor: C.green }} />
      </label>
      <div style={{ fontSize: 11, color: N.muted, marginBottom: 8 }}>Crop is {Math.round(crop.w * 100)}% of the photo's width (minimum {Math.round(minW * 100)}%).</div>

      <div style={{ fontSize: 11, fontWeight: 700, color: N.muted, marginBottom: 4 }}>Preview</div>
      {renderPreview ? renderPreview(crop) : <HeroPreview url={photo.url} crop={crop} />}

      <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
        <button type="button" disabled={busy} onClick={() => onSave(crop)} style={smallBtn("primary", busy)}>{saveLabel}</button>
        <button type="button" disabled={busy} onClick={() => setCrop(defaultCrop(aspect, { x: photo.focal_x ?? 0.5, y: photo.focal_y ?? 0.5 }, frame))} style={smallBtn("ghost", busy)}>Centre on focus point</button>
        {stored && <button type="button" disabled={busy} onClick={() => onSave(null)} style={smallBtn("ghost", busy)}>Clear crop</button>}
        <button type="button" disabled={busy} onClick={onCancel} style={smallBtn("ghost", busy)}>Cancel</button>
      </div>
      <div style={hint}>{defaultHint || "No crop saved: the header uses the widest 2.4 : 1 crop centred on the focus point."}</div>
    </div>
  );
};

// The species-page hero (hero_crop, 2.4 : 1).
const HeroCropEditor = (props) => <CropEditor {...props} />;

export default HeroCropEditor;
