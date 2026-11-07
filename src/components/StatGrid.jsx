import { C } from "../constants/colours";

const StatGrid = ({ stats }) => (
  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 4 }}>
    {stats.map(([icon, label, val]) => (
      <div key={label} style={{ background: C.cream, borderRadius: 12, padding: "10px 12px", border: "0.5px solid #e8e8e4" }}>
        <div style={{ fontSize: 14, marginBottom: 4 }}>{icon}</div>
        <div style={{ fontSize: 10, color: "#888", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 3 }}>{label}</div>
        <div style={{ fontSize: 15, fontWeight: 700 }}>{val}</div>
      </div>
    ))}
  </div>
);

export default StatGrid;
