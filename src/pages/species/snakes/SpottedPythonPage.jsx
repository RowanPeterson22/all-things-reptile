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

const SpottedPythonPage = ({ onBack }) => (
  <SpeciesPage onBack={onBack} name="Spotted Python" latin="Antaresia maculosa" emoji="🐍"
    badges={[["Beginner friendly", C.greenPale, C.green], ["Australian native", C.bluePale, C.blue], ["Nocturnal", C.goldLight, "#7a5a1e"]]}
    tabs={["overview", "feeding", "health & shedding", "handling & breeding", "licencing"]}
    tabContent={(tab) => <>
      {tab === "overview" && <>
        <p style={{ fontSize: 13, color: "#666", lineHeight: 1.6, marginBottom: 14 }}>The largest of the Antaresia genus — still a manageable beginner snake with an attractive spotted pattern. Naturally found in rocky terrain across northern and eastern Australia. Hardy, adaptable, and with a generally calm disposition.</p>
        <SectionLabel mt={0}>Quick stats</SectionLabel>
        <StatGrid stats={[["📏", "Adult size", "1.2–1.6 m"], ["⏳", "Lifespan", "20–25 yrs"], ["🏠", "Min. enclosure", "90 × 45 cm"], ["💧", "Humidity", "40–60%"]]} />
        <SectionLabel>Temperature requirements</SectionLabel>
        <TempBar label="Basking spot" value="32–35°C" width="78%" color="#e05a2b" />
        <TempBar label="Warm side" value="28–30°C" width="62%" color="#e0922b" />
        <TempBar label="Cool side" value="22–26°C" width="44%" color="#4a9e6b" />
        <TempBar label="Overnight low" value="18–20°C" width="26%" color="#2b7ec0" />
        <SectionLabel>Enclosure setup</SectionLabel>
        <div style={{ background: C.cream, borderRadius: 12, padding: "12px 14px", border: "0.5px solid #e8e8e4", fontSize: 13, color: "#666", lineHeight: 1.7 }}>Timber or PVC enclosure. Cypress mulch or coir substrate. Rocky hides work well and match their natural environment. A water bowl large enough to soak in. Add some climbing opportunities — they enjoy exploring vertically despite being primarily ground-dwellers.</div>
        <ShopBtn>🛒 Shop Spotted Python supplies</ShopBtn>
        <ShopBtn secondary>Ask a question ↗</ShopBtn>
      </>}
      {tab === "feeding" && <>
        <p style={{ fontSize: 13, color: "#666", lineHeight: 1.6, marginBottom: 12 }}>Carnivorous. Enthusiastic feeders — one of the easiest Antaresia species to feed consistently. Always use pre-killed or frozen/thawed prey and feeding tongs.</p>
        <div style={{ background: C.cream, borderRadius: 12, border: "0.5px solid #e8e8e4", padding: "0 14px" }}>
          <FoodItem icon="🐭" name="Pinky / fuzzy mice" detail="Hatchlings" freq="Every 5–7 days" />
          <FoodItem icon="🐭" name="Weaner / adult mice" detail="Juveniles and sub-adults" freq="Every 7–10 days" />
          <FoodItem icon="🐭" name="Adult mice / small rats" detail="Adults" freq="Every 10–14 days" />
        </div>
        <WarnBox type="red" title="Strong feeding response">Spotted Pythons are eager feeders. Always use tongs and hook-train. Never hand-feed. The feeding response can be triggered by food smells on hands.</WarnBox>
      </>}
      {tab === "health & shedding" && <>
        <SectionLabel mt={0}>Common health issues</SectionLabel>
        <HealthItem title="Respiratory infection" detail="Watch for wheezing, mucus, or open-mouth breathing. Usually temperature or humidity related. Seek vet care promptly." />
        <HealthItem title="Obesity" detail="Spotted Pythons have a great feeding response but can become overweight if fed too often or prey is too large. Keep portions appropriately sized." />
        <HealthItem title="Regurgitation" detail="Usually from handling too soon after feeding, prey too large, or temperatures too low. Fast for 2 weeks after regurgitation before offering food again." />
        <HealthItem dot="#4a9e6b" title="Signs of good health" detail="Strong feeding response, clear eyes, smooth spotted pattern, active at night, regular shedding." />
        <SnakeShedding />
      </>}
      {tab === "handling & breeding" && <>
        <SnakeHandling biteRisk="low" notes="Spotted Pythons are generally calm and tolerate handling well once settled. Hatchlings can be more defensive. Regular gentle handling builds confidence quickly. Adults are typically very relaxed." />
        <SnakeBreeding clutchSize="8–20 eggs" incubationTemp="30–32°C" incubationDays="55–65 days" maturityAge="2–3 years" notes="One of the easier Antaresia to breed. Requires a winter cooling period. Females are good egg-guarders and will coil around the clutch. Incubate eggs in a moist substrate at stable temperature for best hatch rates." />
      </>}
      {tab === "licencing" && <LegalTab note="Can be kept in NSW, VIC, QLD, SA, ACT and NT. Not permitted in WA and TAS. Licence names are each authority's own; checked November 2026." states={[{ abbr: "NSW", cat: "Companion or Class 1 licence", ok: true }, { abbr: "VIC", cat: "Basic licence", ok: true }, { abbr: "QLD", cat: "Standard licence", ok: true }, { abbr: "SA", cat: "Basic permit (one animal permit-free)", ok: true }, { abbr: "WA", cat: "Not permitted", ok: false }, { abbr: "TAS", cat: "Not permitted (TAS natives only)", ok: false }, { abbr: "ACT", cat: "Keeper licence (case by case)", ok: true }, { abbr: "NT", cat: "Import + keep permit (case by case)", ok: true }]} />}
    </>}
  />
);

export default SpottedPythonPage;
