import { T, SIZE } from "../constants/theme";

// ─── Callout card ────────────────────────────────────────────────
// Types map onto the design's status colours:
//   gold  → an orange-outlined card (the design's "Variety is essential")
//   green → ok (#7FD39B on #1F3A2A)   red → no (#FF8A70 on #3A1A14)
//   blue  → info (#8EC5F0 on #10202E)
// `light` keeps the old light look for /admin, which stays light.

const LIGHT = {
  gold:  { bg: "#f5e8d0", border: "0.5px solid rgba(200,150,60,0.3)", title: "#7a5a1e", body: "#7a5a1e" },
  green: { bg: "#fdf0e8", border: "0.5px solid rgba(30,58,47,0.15)", title: "#d15917", body: "#2a5040" },
  red:   { bg: "#fce8e8", border: "0.5px solid rgba(139,32,32,0.15)", title: "#8b2020", body: "#8b2020" },
  blue:  { bg: "#e8eef8", border: "0.5px solid rgba(26,58,92,0.15)", title: "#1a3a5c", body: "#1a3a5c" },
};

export const warnLook = (type = "gold") => ({
  gold:  { bg: "transparent", border: `1.5px solid ${T.accent}`, title: T.accentText, body: T.body },
  green: { bg: T.okBg, border: "none", title: T.ok, body: T.body },
  red:   { bg: T.noBg, border: "none", title: T.no, body: T.body },
  blue:  { bg: T.infoBg, border: "none", title: T.info, body: T.body },
}[type] || {});

const WarnBox = ({ type = "gold", title, children, light = false }) => {
  if (light) {
    const s = LIGHT[type];
    return (
      <div style={{ background: s.bg, border: s.border, borderRadius: 12, padding: "12px 14px", marginBottom: 10 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: s.title, marginBottom: 3 }}>{title}</div>
        <div style={{ fontSize: 12, color: s.body, lineHeight: 1.6 }}>{children}</div>
      </div>
    );
  }
  const s = warnLook(type);
  return (
    <div style={{ background: s.bg, border: s.border, borderRadius: SIZE.radiusLg, padding: "14px 16px", marginBottom: 10 }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: s.title, marginBottom: 4, lineHeight: 1.4 }}>{title}</div>
      <div style={{ fontSize: 14, color: s.body, lineHeight: 1.55 }}>{children}</div>
    </div>
  );
};

export default WarnBox;
