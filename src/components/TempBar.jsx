import { Children, cloneElement, isValidElement } from "react";
import { T, SIZE } from "../constants/theme";

// ─── Temperatures ────────────────────────────────────────────────
// One row: label and value over a bar. rank 0 is the hottest (orange, label in
// orange), then greys stepping down (T.temps). The pages still pass a colour;
// the design ranks by position instead, so `color` is ignored.
const TempBar = ({ label, value, width, rank = 0 }) => {
  const hot = rank === 0;
  const fill = T.temps[Math.min(rank, T.temps.length - 1)];
  const text = { fontSize: 14, color: hot ? T.accentText : T.text, fontWeight: hot ? 700 : 500 };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
        <span style={{ ...text, minWidth: 0 }}>{label}</span>
        <span style={{ ...text, marginLeft: "auto", textAlign: "right" }}>{value}</span>
      </div>
      <div style={{ height: 8, borderRadius: 4, background: T.track, overflow: "hidden" }}>
        <div style={{ height: "100%", width, background: fill, borderRadius: 4 }} />
      </div>
    </div>
  );
};

// The card the rows sit in. Ranks its TempBar children by order.
export const TempCard = ({ children, title = "Temperatures" }) => {
  let i = 0;
  return (
    <div style={{ background: T.card, borderRadius: SIZE.radiusLg, padding: 16, display: "flex", flexDirection: "column", gap: 12, marginBottom: 10 }}>
      {title && <div style={{ fontSize: 13, fontWeight: 700, color: T.muted }}>{title}</div>}
      {Children.map(children, c => (isValidElement(c) && c.type === TempBar ? cloneElement(c, { rank: i++ }) : c))}
    </div>
  );
};

export default TempBar;
