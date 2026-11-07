import { C } from "../constants/colours";

const HealthItem = ({ dot = "#e05a2b", title, detail }) => (
  <div style={{ background: C.cream, borderRadius: 12, padding: "12px 14px", border: "0.5px solid #e8e8e4", marginBottom: 8, display: "flex", gap: 10 }}>
    <div style={{ width: 8, height: 8, borderRadius: "50%", background: dot, marginTop: 5, flexShrink: 0 }} />
    <div>
      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{title}</div>
      <div style={{ fontSize: 12, color: "#777", lineHeight: 1.6 }}>{detail}</div>
    </div>
  </div>
);

export default HealthItem;
