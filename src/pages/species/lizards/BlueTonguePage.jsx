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

// ─── Blue-tongue Skink page (unchanged) ──────────────────────────
const BlueTonguePage = ({ onBack }) => {
  const [tab, setTab] = useState("overview"); // eslint-disable-line no-unused-vars
  const tabs = ["overview", "feeding", "health", "licencing"];
  return (
    <SpeciesPage onBack={onBack} name="Eastern Blue-tongue Skink" latin="Tiliqua scincoides" emoji="🦎"
      badges={[["Beginner friendly", C.greenPale, C.green], ["Australian native", C.bluePale, C.blue], ["Diurnal", C.goldLight, "#7a5a1e"]]}
      tabs={tabs}
      tabContent={(t) => <>
        {t === "overview" && <>
          <p style={{ fontSize: 13, color: "#666", lineHeight: 1.6, marginBottom: 4 }}>One of Australia's most popular pet reptiles. Docile, hardy, and genuinely interactive — blue-tongues make an ideal first reptile for keepers of any age.</p>
          <SectionLabel mt={14}>Quick stats</SectionLabel>
          <StatGrid stats={[["📏", "Adult size", "45–60 cm"], ["⏳", "Lifespan", "15–20+ yrs"], ["🏠", "Min. enclosure", "120 × 60 cm"], ["💧", "Humidity", "40–60%"]]} />
          <SectionLabel>Temperature requirements</SectionLabel>
          <TempBar label="Basking spot" value="35–40°C" width="90%" color="#e05a2b" />
          <TempBar label="Warm side" value="28–32°C" width="68%" color="#e0922b" />
          <TempBar label="Cool side" value="22–26°C" width="45%" color="#4a9e6b" />
          <TempBar label="Overnight low" value="18°C min" width="25%" color="#2b7ec0" />
          <SectionLabel>Enclosure setup tips</SectionLabel>
          <div style={{ background: C.cream, borderRadius: 12, padding: "12px 14px", border: "0.5px solid #e8e8e4", fontSize: 13, color: "#666", lineHeight: 1.7 }}>Ground-dwellers — prioritise floor space over height. Use coconut coir or topsoil mix as substrate. Provide hides at both warm and cool ends. UVB lighting (T5 HO 10.0) strongly recommended.</div>
          <ShopBtn>🛒 Shop Blue-tongue supplies</ShopBtn><ShopBtn secondary>Ask a question ↗</ShopBtn>
        </>}
        {t === "feeding" && <>
          <p style={{ fontSize: 13, color: "#666", lineHeight: 1.6, marginBottom: 12 }}>Blue-tongues are omnivores. Rotate proteins, vegetables, and occasional fruit. Dust with calcium + D3 2–3× per week.</p>
          <SectionLabel mt={0}>Proteins</SectionLabel>
          <div style={{ background: C.cream, borderRadius: 12, border: "0.5px solid #e8e8e4", padding: "0 14px" }}>
            <FoodItem icon="🍗" name="Lean chicken / turkey mince" detail="Low fat — avoid fatty meats" freq="2–3× week" />
            <FoodItem icon="🥚" name="Boiled or scrambled egg" detail="Great protein source" freq="1× week" />
            <FoodItem icon="🐌" name="Snails / insects" detail="Wood roaches (Woodies), crickets, snails" freq="Occasional" />
          </div>
          <SectionLabel>Vegetables</SectionLabel>
          <div style={{ background: C.cream, borderRadius: 12, border: "0.5px solid #e8e8e4", padding: "0 14px" }}>
            <FoodItem icon="🥬" name="Leafy greens" detail="Collard greens, endive, bok choy" freq="Daily" />
            <FoodItem icon="🥕" name="Root vegetables" detail="Carrot, pumpkin, sweet potato" freq="Several× week" />
          </div>
          <WarnBox type="gold" title="Feeding schedule">Juveniles: feed daily. Adults: every 2–3 days. Remove uneaten food within a few hours.</WarnBox>
          <ShopBtn>🛒 Shop supplements & feeders</ShopBtn>
        </>}
        {t === "health" && <>
          <SectionLabel mt={0}>Common health issues</SectionLabel>
          <HealthItem title="Respiratory infection" detail="Wheezing, mucus around mouth or nose. Usually caused by temps being too low. See a vet promptly." />
          <HealthItem title="Mouth rot (stomatitis)" detail="Redness, swelling, or cheesy discharge around gums. Check mouth regularly during handling." />
          <HealthItem title="Retained shed" detail="Stuck skin especially around toes and eyes. Soak in shallow warm water and gently assist." />
          <HealthItem title="Obesity" detail="Very common in captivity. Keep protein portions lean and ensure enough space for movement." />
          <HealthItem dot="#4a9e6b" title="Signs of good health" detail="Clear eyes, alert behaviour, regular appetite, smooth shedding, firm body condition." />
          <WarnBox type="green" title="Find a reptile vet">Always use a vet with exotic / reptile experience.</WarnBox>
          <ShopBtn secondary>Ask about finding a vet ↗</ShopBtn>
        </>}
        {t === "licencing" && <LegalTab note="Blue-tongue Skinks are a popular beginner species. Victoria does not require a licence for Eastern Blue-tongues." states={[{ abbr: "NSW", cat: "Standard keeper licence", ok: true }, { abbr: "VIC", cat: "No licence required", ok: true }, { abbr: "QLD", cat: "Standard keeper licence", ok: true }, { abbr: "SA", cat: "Basic permit", ok: true }, { abbr: "WA", cat: "Standard licence", ok: true }, { abbr: "TAS", cat: "TAS natives only", ok: false }, { abbr: "ACT", cat: "Standard licence", ok: true }, { abbr: "NT", cat: "Check with authority", ok: true }]} />}
      </>}
    />
  );
};

export default BlueTonguePage;
