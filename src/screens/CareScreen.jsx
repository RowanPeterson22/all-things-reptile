import { C } from "../constants/colours";
import { CARE_GUIDES } from "../data/careGuides";

const CareScreen = ({ onGuide }) => (
  <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>
    <div style={{ fontSize: 11, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 14 }}>Care guide topics</div>
    {CARE_GUIDES.map(g => (
      <div key={g.id} onClick={() => g.page && onGuide(g.page)} style={{ background: "white", borderRadius: 14, border: "0.5px solid #e8e8e4", padding: 14, marginBottom: 10, display: "flex", alignItems: "center", gap: 12, cursor: g.page ? "pointer" : "default", opacity: g.page ? 1 : 0.8 }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: C.greenPale, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>{g.icon}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 2 }}>{g.title}</div>
          <div style={{ fontSize: 12, color: "#888" }}>{g.sub}</div>
          {!g.page && <div style={{ fontSize: 10, color: "#bbb", marginTop: 3 }}>Coming soon</div>}
        </div>
        <div style={{ fontSize: 18, color: "#ccc" }}>›</div>
      </div>
    ))}
  </div>
);

export default CareScreen;
