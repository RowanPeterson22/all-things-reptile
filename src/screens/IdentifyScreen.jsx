import { useState } from "react";
import { C } from "../constants/colours";
import WarnBox from "../components/WarnBox";

const IdentifyScreen = () => {
  const [desc, setDesc] = useState("");
  return (
    <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>
      <div style={{ background: "white", border: "1.5px dashed #e0e0dc", borderRadius: 14, padding: "32px 16px", textAlign: "center", marginBottom: 16 }}>
        <div style={{ fontSize: 36, marginBottom: 10 }}>📷</div>
        <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>Identify a reptile</div>
        <div style={{ fontSize: 13, color: "#888" }}>Upload a photo and our AI will identify the species for you</div>
        <button style={{ marginTop: 14, background: C.green, color: "white", border: "none", borderRadius: 10, padding: "10px 24px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Upload a photo ↗</button>
      </div>
      <div style={{ fontSize: 11, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 10 }}>Or describe what you saw</div>
      <div style={{ background: "white", borderRadius: 14, border: "0.5px solid #e8e8e4", padding: 14 }}>
        <input value={desc} onChange={e => setDesc(e.target.value)} placeholder="e.g. brown striped snake, found near creek in QLD..." style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "0.5px solid #e8e8e4", fontSize: 13, fontFamily: "inherit", background: C.cream, color: "#111", outline: "none" }} />
        <div style={{ fontSize: 11, color: "#aaa", marginTop: 6 }}>Press enter to search</div>
      </div>
      <WarnBox type="green" title="Coming soon">AI-powered species identification from photos is coming soon.</WarnBox>
    </div>
  );
};

export default IdentifyScreen;
