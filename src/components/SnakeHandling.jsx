import { C } from "../constants/colours";
import SectionLabel from "./SectionLabel";
import WarnBox from "./WarnBox";

const SnakeHandling = ({ biteRisk = "low", notes }) => (
  <>
    <SectionLabel mt={0}>Handling tips</SectionLabel>
    <div style={{ background: C.cream, borderRadius: 12, border: "0.5px solid #e8e8e4", padding: "12px 14px", marginBottom: 8 }}>
      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Building trust with your snake</div>
      {["Wait 5–7 days after feeding before handling — handling too soon causes regurgitation.", "Keep early sessions short (5–10 mins). Build up gradually as the snake settles.", "Support the snake's full body weight — never let it dangle unsupported.", "Move calmly and slowly. Sudden movements trigger a defensive response.", "Always wash hands before handling — food smells on hands can trigger a feeding response."].map((tip, i) => (
        <div key={i} style={{ fontSize: 12, color: "#666", lineHeight: 1.6, paddingLeft: 12, borderLeft: `2px solid ${C.greenPale}`, marginBottom: 6 }}>{tip}</div>
      ))}
    </div>
    <div style={{ background: biteRisk === "low" ? C.greenPale : biteRisk === "medium" ? C.goldLight : C.redPale, borderRadius: 12, padding: "12px 14px", border: `0.5px solid ${biteRisk === "low" ? "rgba(30,58,47,0.15)" : biteRisk === "medium" ? "rgba(200,150,60,0.3)" : "rgba(139,32,32,0.15)"}`, marginBottom: 10 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: biteRisk === "low" ? C.green : biteRisk === "medium" ? "#7a5a1e" : C.red, marginBottom: 3 }}>Bite risk: {biteRisk === "low" ? "Low" : biteRisk === "medium" ? "Medium" : "Higher"}</div>
      <div style={{ fontSize: 12, color: biteRisk === "low" ? "#2a5040" : biteRisk === "medium" ? "#7a5a1e" : C.red, lineHeight: 1.6 }}>{notes}</div>
    </div>
    <WarnBox type="gold" title="Feeding response bites">Even calm snakes can strike if they smell food. Always hook-train your snake (use a snake hook to touch the snake before picking up, signalling it's not feeding time). Wash hands thoroughly before any interaction.</WarnBox>
  </>
);

export default SnakeHandling;
