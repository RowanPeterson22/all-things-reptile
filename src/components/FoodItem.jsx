import { C } from "../constants/colours";

const FoodItem = ({ icon, name, detail, freq }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: "0.5px solid #f0f0ea" }}>
    <div style={{ width: 36, height: 36, borderRadius: 10, background: C.greenPale, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{icon}</div>
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 1 }}>{name}</div>
      <div style={{ fontSize: 12, color: "#888" }}>{detail}</div>
    </div>
    <div style={{ fontSize: 11, padding: "3px 8px", borderRadius: 8, background: C.greenPale, color: C.green, fontWeight: 700, whiteSpace: "nowrap" }}>{freq}</div>
  </div>
);

export default FoodItem;
