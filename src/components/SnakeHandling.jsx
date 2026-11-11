import { T } from "../constants/theme";
import SectionLabel from "./SectionLabel";
import WarnBox from "./WarnBox";

const RISK = {
  low: { label: "Low", bg: T.okBg, fg: T.ok },
  medium: { label: "Medium", bg: T.chipBg, fg: T.chip },
  high: { label: "Higher", bg: T.noBg, fg: T.no },
};

// The bite-risk card (the design's Handling tab), then tips and the
// feeding-response warning. Text from the species document (`snakeHandling` block).
const SnakeHandling = ({ biteRisk = "low", notes, tipsLabel, tipsTitle, tips = [], warn }) => {
  const r = RISK[biteRisk] || RISK.high;
  return (
    <>
      <div style={{ background: T.card, borderRadius: 18, padding: 16, display: "flex", flexDirection: "column", gap: 10, marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: T.muted }}>Bite risk</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: r.fg, background: r.bg, borderRadius: 999, padding: "4px 12px" }}>{r.label}</div>
        </div>
        <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: T.body }}>{notes}</p>
      </div>
      <SectionLabel>{tipsLabel}</SectionLabel>
      <div style={{ background: T.card, borderRadius: 18, padding: 16, marginBottom: 10 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: T.text, marginBottom: 10 }}>{tipsTitle}</div>
        {tips.map((tip, i) => (
          <div key={i} style={{ fontSize: 14, color: T.body, lineHeight: 1.55, paddingLeft: 12, borderLeft: `2px solid ${T.accent}`, marginBottom: 8 }}>{tip}</div>
        ))}
      </div>
      <WarnBox type="gold" title={warn.title}>{warn.text}</WarnBox>
    </>
  );
};

export default SnakeHandling;
