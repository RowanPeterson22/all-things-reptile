import { useState } from "react";
import { C } from "../../../constants/colours";
import SectionLabel from "../../../components/SectionLabel";
import WarnBox from "../../../components/WarnBox";
import ShopBtn from "../../../components/ShopBtn";
import TempBar from "../../../components/TempBar";
import FoodItem from "../../../components/FoodItem";
import HealthItem from "../../../components/HealthItem";
import StatGrid from "../../../components/StatGrid";
import LegalTab from "../../../components/LegalTab";
import SpeciesPage from "../../../components/SpeciesPage";

// ─── Bearded Dragon page (unchanged) ─────────────────────────────
const BeardiePage = ({ onBack }) => {
  const [ageTab, setAgeTab] = useState("juv");
  const tabs = ["overview", "feeding", "health", "licencing"];
  return (
    <SpeciesPage onBack={onBack} name="Central Bearded Dragon" latin="Pogona vitticeps" emoji="🦎"
      badges={[["Beginner friendly", C.greenPale, C.green], ["Australian native", C.bluePale, C.blue], ["Diurnal", C.goldLight, "#7a5a1e"]]}
      tabs={tabs}
      tabContent={(t) => <>
        {t === "overview" && <>
          <p style={{ fontSize: 13, color: "#666", lineHeight: 1.6, marginBottom: 14 }}>Australia's most popular pet reptile. Curious, handleable from a young age, and well suited to families and first-time keepers.</p>
          <SectionLabel mt={0}>Quick stats</SectionLabel>
          <StatGrid stats={[["📏", "Adult size", "45–60 cm"], ["⏳", "Lifespan", "10–15 yrs"], ["🏠", "Min. enclosure", "120 × 60 cm"], ["💧", "Humidity", "30–40%"]]} />
          <SectionLabel>Temperature requirements</SectionLabel>
          <TempBar label="Basking spot" value="40–45°C" width="95%" color="#e03a1a" />
          <TempBar label="Warm side" value="30–35°C" width="72%" color="#e0782b" />
          <TempBar label="Cool side" value="24–28°C" width="48%" color="#4a9e6b" />
          <TempBar label="Overnight low" value="18–22°C" width="28%" color="#2b7ec0" />
          <SectionLabel>UVB requirements</SectionLabel>
          <WarnBox type="blue" title="T5 HO 10.0 UVB — essential">Run 12–14 hrs/day. Replace every 12 months. Mount inside, 30–40 cm above basking spot. Without strong UVB, Bearded Dragons cannot synthesise vitamin D3, leading to metabolic bone disease.</WarnBox>
          <SectionLabel>Brumation</SectionLabel>
          <div style={{ background: C.cream, borderRadius: 12, padding: "12px 14px", border: "0.5px solid #e8e8e4", fontSize: 13, color: "#666", lineHeight: 1.7 }}>As temps drop in autumn/winter, many beardies slow right down, sleep for extended periods, and refuse food. Completely normal. Reduce lighting to 8–10 hrs. Don't force-feed. Always offer fresh water. A vet check before brumation is a good idea.</div>
          <ShopBtn>🛒 Shop Bearded Dragon supplies</ShopBtn><ShopBtn secondary>Ask a question ↗</ShopBtn>
        </>}
        {t === "feeding" && <>
          <div style={{ display: "flex", background: C.cream, borderRadius: 10, padding: 3, border: "0.5px solid #e8e8e4", marginBottom: 14 }}>
            {[["juv", "Juvenile (0–12 months)"], ["adult", "Adult (12+ months)"]].map(([id, label]) => (
              <button key={id} onClick={() => setAgeTab(id)} style={{ flex: 1, padding: 7, border: "none", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", background: ageTab === id ? C.green : "none", color: ageTab === id ? "white" : "#888" }}>{label}</button>
            ))}
          </div>
          {ageTab === "juv" ? <>
            <WarnBox type="gold" title="70% protein / 30% greens">Young beardies need high protein to grow. Feed insects as the main staple with greens offered daily.</WarnBox>
            <div style={{ background: C.cream, borderRadius: 12, border: "0.5px solid #e8e8e4", padding: "0 14px" }}>
              <FoodItem icon="🦗" name="Crickets / black crickets" detail="Main staple — gut load before feeding" freq="2× daily" />
              <FoodItem icon="🪲" name="Wood roaches (Woodies)" detail="Excellent nutrition" freq="Daily" />
              <FoodItem icon="🥬" name="Collard / mustard greens" detail="Always available alongside insects" freq="Daily" />
            </div>
            <WarnBox type="red" title="Avoid for juveniles">No spinach, avocado, citrus, or fireflies. No wild-caught insects.</WarnBox>
          </> : <>
            <WarnBox type="green" title="70% greens / 30% protein">Adult beardies need far fewer insects. Shift the balance to leafy greens as the main meal.</WarnBox>
            <div style={{ background: C.cream, borderRadius: 12, border: "0.5px solid #e8e8e4", padding: "0 14px" }}>
              <FoodItem icon="🥬" name="Collard / mustard greens" detail="Main daily staple" freq="Daily" />
              <FoodItem icon="🥕" name="Butternut squash / pumpkin" detail="Great vitamins" freq="Several× week" />
              <FoodItem icon="🦗" name="Wood roaches (Woodies) / crickets" detail="Occasional protein top-up" freq="2–3× week" />
            </div>
          </>}
          <ShopBtn>🛒 Shop feeders & supplements</ShopBtn>
        </>}
        {t === "health" && <>
          <SectionLabel mt={0}>Common health issues</SectionLabel>
          <HealthItem title="Metabolic bone disease (MBD)" detail="Soft jaw, limb tremors, bowed legs. Caused by insufficient UVB and/or calcium. Completely preventable. See a vet immediately if suspected." />
          <HealthItem title="Impaction" detail="Inability to pass stool, lethargy, swollen abdomen. Caused by swallowing loose substrate or oversized food. Never feed insects wider than the space between the dragon's eyes." />
          <HealthItem title="Parasites" detail="Weight loss, runny stools despite eating. A faecal test from a reptile vet is the only way to confirm." />
          <HealthItem title="Yellow fungus disease (YFD)" detail="Yellow/brown crusty spreading patches on skin. Serious and often fatal. Get to a reptile vet immediately." />
          <HealthItem dot="#4a9e6b" title="Signs of good health" detail="Alert and curious, bright clear eyes, firm body, regular healthy stools, good appetite outside brumation." />
          <SectionLabel>Common beginner mistakes</SectionLabel>
          {[["Never house two bearded dragons together.", "Cohabitation causes chronic stress to the submissive animal even if they appear fine."], ["Don't feed insects wider than the gap between the eyes.", "Oversized prey causes impaction and hind leg paralysis in juveniles."], ["Never use a compact/coil UVB bulb.", "Only T5 HO linear tubes are adequate. Compact UVBs have been linked to eye damage."]].map(([title, detail], i) => (
            <div key={i} style={{ background: C.cream, borderRadius: 12, border: "0.5px solid #e8e8e4", padding: "12px 14px", marginBottom: 8, display: "flex", gap: 10 }}>
              <div style={{ width: 22, height: 22, borderRadius: "50%", background: C.red, color: "white", fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>{i + 1}</div>
              <div><div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{title}</div><div style={{ fontSize: 12, color: "#777", lineHeight: 1.6 }}>{detail}</div></div>
            </div>
          ))}
          <ShopBtn secondary>Ask about a health concern ↗</ShopBtn>
        </>}
        {t === "licencing" && <LegalTab note="Can be kept in NSW, VIC, QLD, SA, ACT and NT. Not permitted in WA and TAS. No licence or permit needed in SA and NT if captive-bred and lawfully sourced. Licence names are each authority's own; checked November 2026." states={[{ abbr: "NSW", cat: "Companion or Class 1 licence", ok: true }, { abbr: "VIC", cat: "Basic licence", ok: true }, { abbr: "QLD", cat: "Standard licence", ok: true }, { abbr: "SA", cat: "No permit needed", ok: true }, { abbr: "WA", cat: "Not permitted", ok: false }, { abbr: "TAS", cat: "Not permitted (TAS natives only)", ok: false }, { abbr: "ACT", cat: "Keeper licence (case by case)", ok: true }, { abbr: "NT", cat: "No permit needed", ok: true }]} />}
      </>}
    />
  );
};

export default BeardiePage;
