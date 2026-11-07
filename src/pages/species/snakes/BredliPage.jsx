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
import SnakeShedding from "../../../components/SnakeShedding";
import SnakeHandling from "../../../components/SnakeHandling";
import SnakeBreeding from "../../../components/SnakeBreeding";

const BredliPage = ({ onBack }) => (
  <SpeciesPage onBack={onBack} name="Bredli Python" latin="Morelia bredli" emoji="🐍"
    badges={[["Intermediate", C.goldLight, "#7a5a1e"], ["Australian native", C.bluePale, C.blue], ["Nocturnal", C.goldLight, "#7a5a1e"]]}
    tabs={["overview", "feeding", "health & shedding", "handling & breeding", "licencing"]}
    tabContent={(tab) => <>
      {tab === "overview" && <>
        <p style={{ fontSize: 13, color: "#666", lineHeight: 1.6, marginBottom: 14 }}>The Centralian Carpet Python — known for its stunning red-orange and brown patterning. Found in the rocky gorges of central Australia. One of the calmer large pythons, making it a popular choice for keepers stepping up to a bigger snake.</p>
        <SectionLabel mt={0}>Quick stats</SectionLabel>
        <StatGrid stats={[["📏", "Adult size", "2.0–2.8 m"], ["⏳", "Lifespan", "20–30 yrs"], ["🏠", "Min. enclosure", "180 × 60 cm"], ["💧", "Humidity", "40–55%"]]} />
        <SectionLabel>Temperature requirements</SectionLabel>
        <TempBar label="Basking spot" value="35–38°C" width="86%" color="#e05a2b" />
        <TempBar label="Warm side" value="28–32°C" width="66%" color="#e0922b" />
        <TempBar label="Cool side" value="22–26°C" width="44%" color="#4a9e6b" />
        <TempBar label="Overnight low" value="16–20°C" width="24%" color="#2b7ec0" />
        <SectionLabel>Enclosure setup</SectionLabel>
        <div style={{ background: C.cream, borderRadius: 12, padding: "12px 14px", border: "0.5px solid #e8e8e4", fontSize: 13, color: "#666", lineHeight: 1.7 }}>Large timber or PVC enclosure. Rocky substrate and hide décor suits their natural environment. Climbing branches appreciated. Lower humidity than tropical carpet subspecies — keep ventilation good. Water bowl large enough for soaking.</div>
        <ShopBtn>🛒 Shop Bredli Python supplies</ShopBtn>
        <ShopBtn secondary>Ask a question ↗</ShopBtn>
      </>}
      {tab === "feeding" && <>
        <p style={{ fontSize: 13, color: "#666", lineHeight: 1.6, marginBottom: 12 }}>Carnivorous. Generally reliable feeders. Adults require larger prey items — always size prey appropriately (no wider than the widest body point).</p>
        <div style={{ background: C.cream, borderRadius: 12, border: "0.5px solid #e8e8e4", padding: "0 14px" }}>
          <FoodItem icon="🐭" name="Mice (various sizes)" detail="Hatchlings through to small juveniles" freq="Every 7 days" />
          <FoodItem icon="🐀" name="Medium to large rats" detail="Sub-adults and adults" freq="Every 10–14 days" />
        </div>
        <WarnBox type="gold" title="Winter feeding slowdown">Bredlis often slow or stop feeding in winter. Don't force feed — this is natural behaviour linked to their arid origin. Resume normal feeding as temps rise in spring.</WarnBox>
        <WarnBox type="red" title="Feeding response">Use tongs and hook-train. Bredlis are generally calmer than many carpets but should always be hook-trained before handling.</WarnBox>
      </>}
      {tab === "health & shedding" && <>
        <SectionLabel mt={0}>Common health issues</SectionLabel>
        <HealthItem title="Respiratory infection" detail="Keep humidity below 60% and ensure good ventilation. Bredlis are from an arid environment and prone to respiratory issues in damp conditions." />
        <HealthItem title="Mites" detail="Check regularly, especially around the heat source. Full enclosure treatment required." />
        <HealthItem title="Anorexia in winter" detail="Normal seasonal fasting — not a health issue if the snake maintains body condition. If weight loss is significant, consult a reptile vet." />
        <HealthItem dot="#4a9e6b" title="Signs of good health" detail="Rich orange-red patterning, alert posture, strong feeding response (outside winter), smooth shedding." />
        <SnakeShedding />
      </>}
      {tab === "handling & breeding" && <>
        <SnakeHandling biteRisk="low" notes="Bredlis have a reputation as one of the calmer large pythons. Most adults are quite relaxed and tolerate handling well. Juveniles can be nippy — regular handling from an early age is key. Hook-training is still important given their size." />
        <SnakeBreeding clutchSize="12–25 eggs" incubationTemp="30–32°C" incubationDays="55–65 days" maturityAge="3–4 years" notes="Winter cooling is essential for successful breeding. Drop overnight temps to 15–18°C for 8–10 weeks. Females are protective egg-guarders. Bredlis are a popular breeding project due to their beautiful colouration." />
      </>}
      {tab === "licencing" && <LegalTab note="Bredli Pythons require an advanced keeper licence. Available from licensed breeders across Australia." states={[{ abbr: "NSW", cat: "Advanced licence", ok: true }, { abbr: "VIC", cat: "Advanced licence", ok: true }, { abbr: "QLD", cat: "Advanced licence", ok: true }, { abbr: "SA", cat: "Advanced permit", ok: true }, { abbr: "WA", cat: "Advanced licence", ok: true }, { abbr: "TAS", cat: "TAS natives only", ok: false }, { abbr: "ACT", cat: "Advanced licence", ok: true }, { abbr: "NT", cat: "Check with authority", ok: true }]} />}
    </>}
  />
);

export default BredliPage;
