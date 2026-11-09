import { T } from "../constants/theme";

// ─── Back buttons ────────────────────────────────────────────────
// BackButton: the "‹ Back to …" text link (Coming soon pages, category pages,
// care guides). Vertical padding (cancelled by negative margins) makes it a
// 44px-tall tap target without moving the text. `onPhoto` puts it on a
// translucent pill so it reads over a photo.
//
// RoundBack: the design's round translucent button that floats on a photo
// (species hero). Its label is the accessible name.

const PAD = 12;

const BackButton = ({ onClick, children, marginBottom = 16, onPhoto = false }) => (
  <button type="button" onClick={onClick} style={onPhoto ? {
    background: T.overlay, border: "none", color: T.onAccent, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
    display: "inline-flex", alignItems: "center", gap: 6, minHeight: 44, padding: "0 16px", borderRadius: 22, marginBottom,
  } : {
    background: "none", border: "none", color: T.accentText, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
    display: "flex", alignItems: "center", gap: 6,
    padding: `${PAD}px 16px ${PAD}px 0`, margin: `-${PAD}px 0 ${marginBottom - PAD}px`, minHeight: 44, boxSizing: "border-box",
  }}>{children}</button>
);

export const RoundBack = ({ onClick, label }) => (
  <button type="button" onClick={onClick} aria-label={label} title={label}
    style={{ width: 44, height: 44, borderRadius: 22, border: "none", background: T.overlay, color: T.onAccent, display: "flex", alignItems: "center", justifyContent: "center", padding: 0, cursor: "pointer" }}>
    <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 6l-6 6 6 6" /></svg>
  </button>
);

export default BackButton;
