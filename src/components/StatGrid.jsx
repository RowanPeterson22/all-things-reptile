import { T, SIZE } from "../constants/theme";

// 2 × 2 quick stats. The pages still pass [emoji, label, value]; the design
// has no emoji in stat tiles, so the first item is ignored.
const StatGrid = ({ stats }) => (
  <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 8, marginBottom: 4 }}>
    {stats.map(([, label, val]) => (
      <div key={label} style={{ background: T.card, borderRadius: SIZE.radius, padding: "12px 14px", minWidth: 0 }}>
        <div style={{ fontSize: 12, color: T.muted, lineHeight: 1.35 }}>{label}</div>
        <div style={{ fontSize: 17, fontWeight: 700, color: T.text, marginTop: 3, lineHeight: 1.3, overflowWrap: "anywhere" }}>{val}</div>
      </div>
    ))}
  </div>
);

export default StatGrid;
