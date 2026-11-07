import { C } from "../constants/colours";

const TempBar = ({ label, value, width, color }) => (
  <div style={{ background: C.cream, borderRadius: 12, padding: "10px 14px", border: "0.5px solid #e0e0dc", marginBottom: 8 }}>
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
      <span style={{ fontSize: 13, color: "#666" }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 700 }}>{value}</span>
    </div>
    <div style={{ height: 6, borderRadius: 3, background: "#e8e8e4", overflow: "hidden" }}>
      <div style={{ height: "100%", width, background: color, borderRadius: 3 }} />
    </div>
  </div>
);

export default TempBar;
