import { T, SIZE } from "../constants/theme";

// ─── Basking surface banner (monitor pages) ──────────────────────
// Monitors need a 50–60°C basking surface (two recorded exceptions, D8:
// Pygmy Mulga 45–60°C, Sand Monitor 50–65°C), so it leads the Overview as a
// solid orange banner: the range big, then the page's own warning.
const BaskingBanner = ({ range, title, children }) => (
  <div data-testid="basking-banner" style={{ background: T.accent, color: T.onAccent, borderRadius: SIZE.radiusLg, padding: 16, display: "flex", flexDirection: "column", gap: 8, marginBottom: 10 }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
      <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>Basking surface</div>
      <div style={{ fontSize: 30, fontWeight: 700, lineHeight: 1, whiteSpace: "nowrap" }}>{range}</div>
    </div>
    <div style={{ fontSize: 14, lineHeight: 1.55 }}>
      {title && <b>{title}. </b>}{children}
    </div>
  </div>
);

export default BaskingBanner;
