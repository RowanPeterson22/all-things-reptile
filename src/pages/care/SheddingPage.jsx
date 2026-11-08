import { useState } from "react";
import { C } from "../../constants/colours";
import SectionLabel from "../../components/SectionLabel";
import WarnBox from "../../components/WarnBox";
import HealthItem from "../../components/HealthItem";
import CareGuideHeader from "../../components/CareGuideHeader";

// ─── Shedding & Skin Care page ────────────────────────────────────
const SheddingPage = ({ onBack }) => {
  const [tab, setTab] = useState("how shedding works");
  const tabs = ["how shedding works", "helping a shed", "problems", "skin care"];
  return (
    <div style={{ flex: 1, overflowY: "auto" }}>
      <CareGuideHeader onBack={onBack} emoji="✨" title="Shedding & Skin Care" subtitle="Helping with a healthy shed" tabs={tabs} tab={tab} onTab={setTab} />
      <div style={{ background: "white", padding: "16px 18px 40px" }}>
        {tab === "how shedding works" && <>
          <p style={{ fontSize: 13, color: "#666", lineHeight: 1.6, marginBottom: 14 }}>All reptiles shed their outer layer of skin (ecdysis) as they grow. It is a completely normal and essential process. Understanding the stages helps you provide the right support at the right time.</p>
          <SectionLabel mt={0}>The shedding cycle</SectionLabel>
          {[
            ["Normal phase", "Skin is clear and vibrant. Eyes clear. Normal feeding and behaviour."],
            ["Pre-shed (blue/dull phase)", "Skin becomes dull and milky. Eyes turn blue or opaque — a fluid layer separates the old skin from the new. The reptile may become less active, refuse food, and be more irritable. Lasts 5–14 days."],
            ["Clear phase", "Eyes clear again but skin still dull. Shedding is imminent — usually within 24–72 hours."],
            ["Shedding", "The reptile rubs against rough surfaces to break the old skin and crawls out. Do not disturb. Snakes shed in one piece; lizards typically shed in patches."],
            ["Post-shed", "Vibrant new colours and clear eyes. Resume normal feeding 24–48 hours after a complete shed."],
          ].map(([phase, detail], i) => (
            <div key={phase} style={{ background: i === 1 || i === 2 ? C.goldLight : i === 3 ? C.greenPale : C.cream, borderRadius: 10, padding: "10px 12px", marginBottom: 8, border: "0.5px solid #e8e8e4" }}>
              <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 2, color: i === 3 ? C.green : "#333" }}>{phase}</div>
              <div style={{ fontSize: 12, color: "#666", lineHeight: 1.5 }}>{detail}</div>
            </div>
          ))}
          <SectionLabel>Shedding frequency</SectionLabel>
          {[["Hatchlings & juveniles", "Every 3–4 weeks — growing rapidly"], ["Sub-adults", "Every 4–8 weeks"], ["Adults", "Every 6–12 weeks — slower growth"]].map(([age, freq]) => (
            <div key={age} style={{ background: C.cream, borderRadius: 10, padding: "10px 12px", marginBottom: 8, border: "0.5px solid #e8e8e4", display: "flex", justifyContent: "space-between" }}>
              <div style={{ fontSize: 12, color: "#555" }}>{age}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.green }}>{freq}</div>
            </div>
          ))}
        </>}
        {tab === "helping a shed" && <>
          <p style={{ fontSize: 13, color: "#666", lineHeight: 1.6, marginBottom: 14 }}>Most healthy reptiles in correct conditions shed without any help. Your job is to ensure the right conditions are in place. Intervene only when there is a problem.</p>
          <SectionLabel mt={0}>Optimal shedding conditions</SectionLabel>
          {[
            ["Correct humidity", "The most important factor. Increase humidity slightly during the pre-shed phase. A humid hide (a container with moist sphagnum moss) is essential for most species."],
            ["Rough surfaces", "Provide rocks, cork bark, branches — the reptile uses these to grip and pull the old skin off. Smooth enclosures make shedding harder."],
            ["Fresh water", "Always have clean water available. Many reptiles soak themselves before a shed. Shallow water dish they can fully submerge in."],
            ["Leave them alone", "Do not handle during the blue/pre-shed phase. They have reduced vision and are more stressed and irritable."],
          ].map(([name, detail]) => (
            <div key={name} style={{ background: C.cream, borderRadius: 12, padding: "12px 14px", marginBottom: 10, border: "0.5px solid #e8e8e4" }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>{name}</div>
              <div style={{ fontSize: 12, color: "#666", lineHeight: 1.6 }}>{detail}</div>
            </div>
          ))}
          <SectionLabel>Assisting a stuck shed</SectionLabel>
          <div style={{ background: C.cream, borderRadius: 12, padding: "12px 14px", border: "0.5px solid #e8e8e4", fontSize: 13, color: "#666", lineHeight: 1.7, marginBottom: 10 }}>If shed is retained 48+ hours after it began, assist gently. Soak the reptile in shallow warm water (28–30°C) for 20–30 minutes. The retained skin will soften. Use a damp cloth or your fingers to very gently roll the skin off. Never pull dried, stuck skin — soak first. Check toes, tail tip, and eye caps (spectacles) carefully — these areas retain shed most commonly.</div>
          <WarnBox type="red" title="Retained eye caps — see a vet">Retained spectacles (eye caps in snakes and some geckos) are delicate. Do not attempt to remove them yourself — you risk serious eye damage. Soak, then take to a reptile vet if they don't come off naturally.</WarnBox>
        </>}
        {tab === "problems" && <>
          <SectionLabel mt={0}>Common shedding problems</SectionLabel>
          {[
            ["Dysecdysis (incomplete / retained shed)", "Most common shedding problem. Usually caused by low humidity or dehydration. Retained shed on toes can cut off circulation and cause toe loss. Retained eye caps affect vision. Soak and gently remove if possible — vet if eye caps retained."],
            ["Too frequent shedding", "May indicate a skin irritation, mite infestation, or infection. Check for mites carefully and consult a vet."],
            ["Dull colouration after shed", "If colours do not return to full vibrancy within 48 hours of shedding, consider nutritional deficiency or underlying illness."],
            ["Blistering or weeping under shed", "Indicates scale rot or bacterial infection under the old skin. Vet attention required."],
            ["Refusing food during shed", "Normal — do not be alarmed. Resume feeding 24–48 hours after a complete shed."],
          ].map(([title, detail]) => (
            <HealthItem key={title} title={title} detail={detail} />
          ))}
        </>}
        {tab === "skin care" && <>
          <p style={{ fontSize: 13, color: "#666", lineHeight: 1.6, marginBottom: 14 }}>Between sheds, healthy reptile skin requires very little intervention. Correct husbandry does most of the work.</p>
          {[
            ["Regular health checks", "Inspect your reptile during handling. Look for mites (tiny moving dots, often seen around eyes and in skin folds), unusual lumps, cuts, or discolouration. Early detection makes treatment easier."],
            ["Mite prevention & treatment", "Mites are small but serious. Check new animals carefully. If found, treat the reptile (reptile-safe mite treatment) and thoroughly clean and treat the entire enclosure. Remove all hides and decor. Treat again in 7–10 days to break the life cycle."],
            ["Burns from heat sources", "Unregulated heat sources cause burns — always use thermostats. Burns appear as discoloured, blistered, or weeping scales. Veterinary treatment required. Prevent by always using properly controlled heat."],
            ["Wounds and abrasions", "Minor cuts from enclosure furniture or handling can occur. Clean gently with diluted betadine. Monitor closely — reptile wounds can become infected quickly. Any wound that does not heal within one shed cycle should be seen by a vet."],
            ["Cleaning the animal", "Reptiles generally keep themselves clean. A warm water soak for 20–30 minutes is beneficial occasionally — it aids hydration, can help loosen pre-shed skin, and allows you to inspect the animal closely. Never use soap or chemical cleaners on a reptile."],
          ].map(([name, detail]) => (
            <div key={name} style={{ background: C.cream, borderRadius: 12, padding: "12px 14px", marginBottom: 10, border: "0.5px solid #e8e8e4" }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>{name}</div>
              <div style={{ fontSize: 12, color: "#666", lineHeight: 1.6 }}>{detail}</div>
            </div>
          ))}
        </>}
      </div>
    </div>
  );
};

export default SheddingPage;
