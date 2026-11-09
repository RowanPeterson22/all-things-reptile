import { T } from "../constants/theme";

// A feeder insect: name and tag, three nutrition tiles, best for,
// availability and notes. `tagColor` from the pages is ignored: the design
// uses one chip colour (orange on dark).
const InsectCard = ({ name, protein, fat, calcium, availability, best, notes, tag }) => (
  <div style={{ background: T.card, borderRadius: 18, padding: 16, marginBottom: 12 }}>
    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, marginBottom: 10, flexWrap: "wrap" }}>
      <div style={{ fontSize: 15, fontWeight: 700, color: T.text, minWidth: 0, flex: "1 1 160px" }}>{name}</div>
      {tag && <span style={{ fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 999, background: T.chipBg, color: T.chip }}>{tag}</span>}
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 6, marginBottom: 12 }}>
      {[["Protein", protein, T.ok], ["Fat", fat, T.chip], ["Ca:P ratio", calcium, T.info]].map(([label, val, col]) => (
        <div key={label} style={{ background: T.bg, borderRadius: 10, padding: "8px 6px", textAlign: "center", minWidth: 0 }}>
          <div style={{ fontSize: 11, color: T.muted, fontWeight: 700, marginBottom: 2 }}>{label}</div>
          <div style={{ fontSize: 12, fontWeight: 700, color: col, overflowWrap: "anywhere", lineHeight: 1.35 }}>{val}</div>
        </div>
      ))}
    </div>
    <div style={{ fontSize: 14, color: T.body, marginBottom: 6, lineHeight: 1.5 }}><span style={{ fontWeight: 700, color: T.text }}>Best for: </span>{best}</div>
    <div style={{ fontSize: 14, color: T.body, marginBottom: 6, lineHeight: 1.5 }}><span style={{ fontWeight: 700, color: T.text }}>Availability: </span>{availability}</div>
    <div style={{ fontSize: 13, color: T.muted, lineHeight: 1.6, fontStyle: "italic" }}>{notes}</div>
  </div>
);

export default InsectCard;
