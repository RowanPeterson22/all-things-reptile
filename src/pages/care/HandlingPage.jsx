import { useState } from "react";
import { C } from "../../constants/colours";
import SectionLabel from "../../components/SectionLabel";
import WarnBox from "../../components/WarnBox";

// ─── Handling & Socialising page ──────────────────────────────────
const HandlingPage = ({ onBack }) => {
  const [tab, setTab] = useState("getting started");
  const tabs = ["getting started", "technique", "reading behaviour", "safety"];
  return (
    <div style={{ flex: 1, overflowY: "auto" }}>
      <div style={{ background: C.green, padding: "calc(env(safe-area-inset-top, 0px) + 10px) 20px 0" }}>
        <button onClick={onBack} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.7)", fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, marginBottom: 16, fontFamily: "inherit" }}>‹ Back to care guides</button>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 14 }}>
          <div style={{ fontSize: 64, lineHeight: 1, marginBottom: -4 }}>🤲</div>
          <div style={{ paddingBottom: 18 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.gold, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 4 }}>Care guide</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: "white", lineHeight: 1.2 }}>Handling & Socialising</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", marginTop: 3 }}>Building trust & safe interaction</div>
          </div>
        </div>
        <div style={{ display: "flex", borderBottom: "0.5px solid rgba(255,255,255,0.2)", margin: "0 -20px", padding: "0 20px", gap: 4, overflowX: "auto", scrollbarWidth: "none" }}>
          {tabs.map(t => <button key={t} onClick={() => setTab(t)} style={{ background: "none", border: "none", borderBottom: tab === t ? "2px solid #fff" : "2px solid transparent", color: tab === t ? "white" : "rgba(255,255,255,0.55)", fontSize: 12, fontWeight: 700, padding: "8px 12px", cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap", marginBottom: -1, textTransform: "capitalize" }}>{t}</button>)}
        </div>
      </div>
      <div style={{ background: "white", padding: "16px 18px 40px" }}>
        {tab === "getting started" && <>
          <p style={{ fontSize: 13, color: "#666", lineHeight: 1.6, marginBottom: 14 }}>Handling builds trust over time. Patience and consistency are far more effective than rushing the process. A reptile that is handled correctly from a young age will be calmer and more confident throughout its life.</p>
          <WarnBox type="red" title="Allow settling time first">Every new reptile needs time to adjust to its new home before handling begins. Give your reptile at least 1–2 weeks (longer for shy or wild-caught species) with no handling — just food, water, and peace.</WarnBox>
          <SectionLabel>Building up gradually</SectionLabel>
          {[
            ["Week 1–2", "No handling. Allow the reptile to adjust to sights, sounds, and smells of its new environment. Just observe."],
            ["Week 3–4", "Begin very short sessions — 2–5 minutes. Let the reptile walk onto your hand rather than being grabbed. End on a calm note."],
            ["Month 2", "Gradually extend sessions to 10–15 minutes. Handle in a calm environment away from other pets and loud noises."],
            ["Month 3+", "Regular daily or every-other-day handling. Sessions can extend to 20–30 minutes for most species. Always watch for stress signals."],
          ].map(([time, detail]) => (
            <div key={time} style={{ background: C.cream, borderRadius: 10, padding: "10px 12px", marginBottom: 8, border: "0.5px solid #e8e8e4" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.green, marginBottom: 3 }}>{time}</div>
              <div style={{ fontSize: 12, color: "#666", lineHeight: 1.5 }}>{detail}</div>
            </div>
          ))}
          <WarnBox type="gold" title="Never handle these times">Never handle within 48 hours of feeding. Never handle during shedding. Never handle a sick reptile. Never handle when the reptile is in threat display. Never handle when temperatures are too cold — reptiles are sluggish and unable to regulate stress responses.</WarnBox>
        </>}
        {tab === "technique" && <>
          <SectionLabel mt={0}>General technique</SectionLabel>
          <div style={{ background: C.cream, borderRadius: 12, padding: "12px 14px", border: "0.5px solid #e8e8e4", fontSize: 13, color: "#666", lineHeight: 1.7, marginBottom: 12 }}>Always approach slowly and from the side — never from directly above, which mimics a predator attack. Support the full body at all times. Let the reptile walk onto your hand rather than grabbing. Move slowly and deliberately. If the animal tries to escape, guide it gently — don't grip tightly.</div>
          {[
            ["🦎 Lizards & dragons", "Support the full body including the tail. Place one hand under the chest, the other supporting the hindquarters and tail. Never pick up by the tail — many species can drop their tail as a stress response."],
            ["🐍 Snakes", "Support multiple points along the body. Never restrain the head unless medically necessary. Let the snake move between your hands in a flowing figure-8 motion. Do not dangle from one point."],
            ["🐢 Turtles", "Hold at the sides of the shell — not the legs or neck. Be aware of the reach of the neck, especially Long-necked Turtles which can bite. Keep sessions brief and return to water promptly."],
            ["🦎 Geckos", "Handle at night when active. Support the full body — never grab. Handle close to a surface in case they jump. Very short sessions only for delicate species."],
          ].map(([title, detail]) => (
            <div key={title} style={{ background: C.cream, borderRadius: 12, padding: "12px 14px", marginBottom: 10, border: "0.5px solid #e8e8e4" }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>{title}</div>
              <div style={{ fontSize: 12, color: "#666", lineHeight: 1.6 }}>{detail}</div>
            </div>
          ))}
        </>}
        {tab === "reading behaviour" && <>
          <p style={{ fontSize: 13, color: "#666", lineHeight: 1.6, marginBottom: 14 }}>Learning to read your reptile's body language is one of the most important handling skills. Respecting stress signals prevents bites and builds trust faster.</p>
          <SectionLabel mt={0}>Signs of stress — end the session</SectionLabel>
          {[
            ["Trying to escape constantly", "The animal wants to return to its enclosure. End the session."],
            ["Hissing or puffing up", "Clear warning — the animal feels threatened."],
            ["Gaping mouth / open mouth breathing", "Defensive warning display — particularly in lizards and pythons."],
            ["Beard darkening (Bearded Dragons)", "Stress or irritability. Give the animal a break."],
            ["Musking (turtles, snakes)", "Releasing foul-smelling fluid — a stress response. Return to enclosure."],
            ["Tail wagging rapidly (lizards)", "An agitation or warning signal in many species."],
          ].map(([sign, detail]) => (
            <div key={sign} style={{ background: "#fce8e8", borderRadius: 10, padding: "10px 12px", marginBottom: 8, border: "0.5px solid #8b202033" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.red, marginBottom: 2 }}>{sign}</div>
              <div style={{ fontSize: 12, color: "#555" }}>{detail}</div>
            </div>
          ))}
          <SectionLabel>Signs of comfort — continue</SectionLabel>
          {[
            ["Resting calmly on hand", "Relaxed and comfortable."],
            ["Tongue flicking (lizards/snakes)", "Normal exploratory behaviour — they are curious, not stressed."],
            ["Eyes open, alert but not darting", "Calm and aware."],
            ["Moving slowly and deliberately", "Confident and relaxed movement."],
          ].map(([sign, detail]) => (
            <div key={sign} style={{ background: C.greenPale, borderRadius: 10, padding: "10px 12px", marginBottom: 8, border: `0.5px solid ${C.green}33` }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.green, marginBottom: 2 }}>{sign}</div>
              <div style={{ fontSize: 12, color: "#555" }}>{detail}</div>
            </div>
          ))}
        </>}
        {tab === "safety" && <>
          <SectionLabel mt={0}>Hygiene — always</SectionLabel>
          <div style={{ background: C.cream, borderRadius: 12, padding: "12px 14px", border: "0.5px solid #e8e8e4", fontSize: 13, color: "#666", lineHeight: 1.7, marginBottom: 12 }}>Always wash hands with soap and water before and after handling any reptile. All reptiles can carry Salmonella — this is manageable with good hygiene but should never be ignored. Supervise children carefully and ensure they wash hands immediately after handling.</div>
          <WarnBox type="red" title="If you are bitten">Most reptile bites are minor. Wash the wound thoroughly with soap and water. Apply antiseptic. Seek medical advice if the wound is deep, if you are bitten by a large python (bites from large pythons require proper wound care), or if any signs of infection develop. Do NOT jerk away when bitten — this causes more tissue damage. Stay calm and gently support the animal until it releases.</WarnBox>
          <SectionLabel>Children and reptiles</SectionLabel>
          <div style={{ background: C.cream, borderRadius: 12, padding: "12px 14px", border: "0.5px solid #e8e8e4", fontSize: 13, color: "#666", lineHeight: 1.7 }}>Children can have wonderful interactions with reptiles under proper adult supervision. Beginner species like Central Bearded Dragons, Eastern Blue-tongue Skinks, and Children's Pythons are ideal for families. Always supervise. Ensure hand washing after every interaction. Teach children to be calm and gentle — sudden movements stress reptiles and increase bite risk.</div>
        </>}
      </div>
    </div>
  );
};

export default HandlingPage;
