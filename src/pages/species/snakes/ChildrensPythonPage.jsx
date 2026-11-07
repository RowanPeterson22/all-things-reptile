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

const ChildrensPythonPage = ({ onBack }) => (
  <SpeciesPage onBack={onBack} name="Children's Python" latin="Antaresia childreni" emoji="🐍"
    badges={[["Beginner friendly", C.greenPale, C.green], ["Australian native", C.bluePale, C.blue], ["Nocturnal", C.goldLight, "#7a5a1e"]]}
    tabs={["overview", "feeding", "health & shedding", "handling & breeding", "licencing"]}
    tabContent={(tab) => <>
      {tab === "overview" && <>
        <p style={{ fontSize: 13, color: "#666", lineHeight: 1.6, marginBottom: 14 }}>One of the best beginner snakes in Australia. Small, manageable, and with a calm temperament once settled — Children's Pythons are perfect for first-time snake keepers of all ages.</p>
        <SectionLabel mt={0}>Quick stats</SectionLabel>
        <StatGrid stats={[["📏", "Adult size", "1.0–1.5 m"], ["⏳", "Lifespan", "20–30 yrs"], ["🏠", "Min. enclosure", "90 × 45 cm"], ["💧", "Humidity", "40–60%"]]} />
        <SectionLabel>Temperature requirements</SectionLabel>
        <TempBar label="Basking spot" value="32–35°C" width="78%" color="#e05a2b" />
        <TempBar label="Warm side" value="28–30°C" width="62%" color="#e0922b" />
        <TempBar label="Cool side" value="22–26°C" width="44%" color="#4a9e6b" />
        <TempBar label="Overnight low" value="18–20°C" width="26%" color="#2b7ec0" />
        <SectionLabel>Enclosure setup</SectionLabel>
        <div style={{ background: C.cream, borderRadius: 12, padding: "12px 14px", border: "0.5px solid #e8e8e4", fontSize: 13, color: "#666", lineHeight: 1.7 }}>Timber or PVC enclosure. Provide two snug hides (warm and cool end). Newspaper, paper towel, or cypress mulch substrate. A small water bowl for soaking. Low-level lighting — they're nocturnal so UVB is not essential, but a low-output UVB is beneficial.</div>
        <ShopBtn>🛒 Shop Children's Python supplies</ShopBtn>
        <ShopBtn secondary>Ask a question ↗</ShopBtn>
      </>}
      {tab === "feeding" && <>
        <p style={{ fontSize: 13, color: "#666", lineHeight: 1.6, marginBottom: 12 }}>Strictly carnivorous. Feed pre-killed or frozen/thawed mice — never feed live prey. The size of prey should not exceed the widest part of the snake's body.</p>
        <SectionLabel mt={0}>Feeding schedule</SectionLabel>
        <div style={{ background: C.cream, borderRadius: 12, border: "0.5px solid #e8e8e4", padding: "0 14px" }}>
          <FoodItem icon="🐭" name="Pinky / fuzzy mice" detail="Hatchlings and juveniles" freq="Every 5–7 days" />
          <FoodItem icon="🐭" name="Adult mice" detail="Sub-adults and adults" freq="Every 7–10 days" />
          <FoodItem icon="🐭" name="Small rats" detail="Large adults only" freq="Every 10–14 days" />
        </div>
        <WarnBox type="gold" title="Frozen/thawed is always preferred">Pre-killed or frozen/thawed prey eliminates the risk of injury to your snake from live prey. Thaw completely in warm water before feeding — never microwave.</WarnBox>
        <WarnBox type="red" title="Feeding response">Always use feeding tongs — never hand-feed. Hook-train from an early age to distinguish feeding from handling.</WarnBox>
      </>}
      {tab === "health & shedding" && <>
        <SectionLabel mt={0}>Common health issues</SectionLabel>
        <HealthItem title="Respiratory infection" detail="Wheezing, mucus, open-mouth breathing. Caused by temperatures being too low or humidity too high. Veterinary treatment required." />
        <HealthItem title="Mites" detail="Tiny moving dots on the snake or in the water bowl. Treat the snake and completely strip and disinfect the enclosure. Reptile-safe mite spray available from reptile stores." />
        <HealthItem title="Regurgitation" detail="Usually caused by handling too soon after feeding, temperatures too low, or prey too large. Wait 48–72 hrs after feeding before handling." />
        <HealthItem dot="#4a9e6b" title="Signs of good health" detail="Clear eyes (between sheds), regular feeding response, firm body, clean vent, and active exploration at night." />
        <SnakeShedding />
      </>}
      {tab === "handling & breeding" && <>
        <SnakeHandling biteRisk="low" notes="Children's Pythons are generally very calm and reluctant to bite once settled. Hatchlings can be nippy — handle regularly from an early age to build confidence. Bites are small and superficial." />
        <SnakeBreeding clutchSize="8–15 eggs" incubationTemp="30–32°C" incubationDays="55–65 days" maturityAge="2–3 years" notes="Cooling in winter (dropping temps to 18–20°C overnight for 6–8 weeks) triggers breeding behaviour. Females lay eggs approximately 30–40 days after mating. Eggs should be incubated in a moist vermiculite medium." />
      </>}
      {tab === "licencing" && <LegalTab note="Can be kept in NSW, VIC, QLD, SA, WA, ACT and NT. Not permitted in TAS. No licence or permit needed in NT if captive-bred and lawfully sourced. Licence names are each authority's own; checked November 2026." states={[{ abbr: "NSW", cat: "Companion or Class 1 licence", ok: true }, { abbr: "VIC", cat: "Basic licence", ok: true }, { abbr: "QLD", cat: "Standard licence", ok: true }, { abbr: "SA", cat: "Basic permit (one animal permit-free)", ok: true }, { abbr: "WA", cat: "Pet keeper's licence", ok: true }, { abbr: "TAS", cat: "Not permitted (TAS natives only)", ok: false }, { abbr: "ACT", cat: "Keeper licence (case by case)", ok: true }, { abbr: "NT", cat: "No permit needed", ok: true }]} />}
    </>}
  />
);

export default ChildrensPythonPage;
