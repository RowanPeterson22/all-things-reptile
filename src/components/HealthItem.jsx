import { T } from "../constants/theme";

// A dot-led row. The pages pass green (#4a9e6b) for good signs and nothing
// (or a red/orange) for problems: good → ok green, anything else → orange.
const GOOD = new Set(["#4a9e6b", "#2a7e4a", "#2e8b57"]);

const HealthItem = ({ dot, title, detail }) => {
  const good = dot && GOOD.has(String(dot).toLowerCase());
  return (
    <div data-health-row="" style={{ background: T.card, borderRadius: 14, padding: "14px 16px", marginBottom: 8, display: "flex", gap: 12 }}>
      <span aria-hidden="true" style={{ width: 10, height: 10, borderRadius: 5, marginTop: 6, flexShrink: 0, background: good ? T.okDot : T.accent }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: T.text, lineHeight: 1.35 }}>{title}</div>
        <div style={{ fontSize: 14, color: T.body, lineHeight: 1.55, marginTop: 3 }}>{detail}</div>
      </div>
    </div>
  );
};

export default HealthItem;
