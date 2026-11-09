import { T } from "../constants/theme";
import SectionLabel from "./SectionLabel";
import WarnBox from "./WarnBox";

const RISK = {
  low: { label: "Low", bg: T.okBg, fg: T.ok },
  medium: { label: "Medium", bg: T.chipBg, fg: T.chip },
  high: { label: "Higher", bg: T.noBg, fg: T.no },
};

// The bite-risk card (the design's Handling tab), then tips and the
// feeding-response warning.
const SnakeHandling = ({ biteRisk = "low", notes }) => {
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
      <SectionLabel>Handling tips</SectionLabel>
      <div style={{ background: T.card, borderRadius: 18, padding: 16, marginBottom: 10 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: T.text, marginBottom: 10 }}>Building trust with your snake</div>
        {["Wait 5–7 days after feeding before handling — handling too soon causes regurgitation.", "Keep early sessions short (5–10 mins). Build up gradually as the snake settles.", "Support the snake's full body weight — never let it dangle unsupported.", "Move calmly and slowly. Sudden movements trigger a defensive response.", "Always wash hands before handling — food smells on hands can trigger a feeding response."].map((tip, i) => (
          <div key={i} style={{ fontSize: 14, color: T.body, lineHeight: 1.55, paddingLeft: 12, borderLeft: `2px solid ${T.accent}`, marginBottom: 8 }}>{tip}</div>
        ))}
      </div>
      <WarnBox type="gold" title="Feeding response bites">Even calm snakes can strike if they smell food. Always hook-train your snake (use a snake hook to touch the snake before picking up, signalling it's not feeding time). Wash hands thoroughly before any interaction.</WarnBox>
    </>
  );
};

export default SnakeHandling;
