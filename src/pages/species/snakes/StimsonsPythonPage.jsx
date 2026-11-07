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

const StimsonsPythonPage = ({ onBack }) => (
  <SpeciesPage onBack={onBack} name="Stimson's Python" latin="Antaresia stimsoni" emoji="🐍"
    badges={[["Beginner friendly", C.greenPale, C.green], ["Australian native", C.bluePale, C.blue], ["Nocturnal", C.goldLight, "#7a5a1e"]]}
    tabs={["overview", "feeding", "health & shedding", "handling & breeding", "licencing"]}
    tabContent={(tab) => <>
      {tab === "overview" && <>
        <p style={{ fontSize: 13, color: "#666", lineHeight: 1.6, marginBottom: 14 }}>A compact, beautifully patterned python from arid and semi-arid Australia. Often compared to Children's Pythons in temperament — calm, manageable, and well suited to beginners. Their striking blotched pattern makes them a favourite.</p>
        <SectionLabel mt={0}>Quick stats</SectionLabel>
        <StatGrid stats={[["📏", "Adult size", "0.8–1.2 m"], ["⏳", "Lifespan", "20–25 yrs"], ["🏠", "Min. enclosure", "90 × 45 cm"], ["💧", "Humidity", "30–50%"]]} />
        <SectionLabel>Temperature requirements</SectionLabel>
        <TempBar label="Basking spot" value="33–36°C" width="80%" color="#e05a2b" />
        <TempBar label="Warm side" value="28–30°C" width="62%" color="#e0922b" />
        <TempBar label="Cool side" value="22–26°C" width="44%" color="#4a9e6b" />
        <TempBar label="Overnight low" value="16–18°C" width="22%" color="#2b7ec0" />
        <SectionLabel>Enclosure setup</SectionLabel>
        <div style={{ background: C.cream, borderRadius: 12, padding: "12px 14px", border: "0.5px solid #e8e8e4", fontSize: 13, color: "#666", lineHeight: 1.7 }}>Arid setup — low humidity. Sandy red substrate or reptile sand/coir mix works well. Rocky hides. A small water bowl changed regularly. Keep the enclosure dry — this species is prone to respiratory issues in damp conditions.</div>
        <ShopBtn>🛒 Shop Stimson's Python supplies</ShopBtn>
        <ShopBtn secondary>Ask a question ↗</ShopBtn>
      </>}
      {tab === "feeding" && <>
        <p style={{ fontSize: 13, color: "#666", lineHeight: 1.6, marginBottom: 12 }}>Carnivorous — pre-killed or frozen/thawed mice. A strong feeding response species. Always use tongs.</p>
        <div style={{ background: C.cream, borderRadius: 12, border: "0.5px solid #e8e8e4", padding: "0 14px" }}>
          <FoodItem icon="🐭" name="Pinky / fuzzy mice" detail="Hatchlings and juveniles" freq="Every 5–7 days" />
          <FoodItem icon="🐭" name="Adult mice" detail="Sub-adults and adults" freq="Every 7–10 days" />
        </div>
        <WarnBox type="red" title="Strong feeding response">Stimson's Pythons are enthusiastic feeders. Always use tongs and hook-train from day one. Feeding response bites are common and not a sign of aggression.</WarnBox>
        <WarnBox type="gold" title="Frozen/thawed preferred">Always thaw prey completely. Offer at room temperature or slightly warmer. Never use a microwave to thaw.</WarnBox>
      </>}
      {tab === "health & shedding" && <>
        <SectionLabel mt={0}>Common health issues</SectionLabel>
        <HealthItem title="Respiratory infection" detail="Most common in Stimson's Pythons due to their arid origins — they are particularly sensitive to high humidity and cold temperatures. Keep enclosure dry and warm." />
        <HealthItem title="Scale rot" detail="Brown or blistered scales, usually on the belly. Caused by substrate being too damp. Ensure substrate is dry and clean." />
        <HealthItem title="Mites" detail="Tiny moving dots on skin or in water bowl. Treat snake and fully disinfect enclosure." />
        <HealthItem dot="#4a9e6b" title="Signs of good health" detail="Smooth, patterned scales, clear eyes, strong feeding response, firm muscular body." />
        <SnakeShedding />
      </>}
      {tab === "handling & breeding" && <>
        <SnakeHandling biteRisk="medium" notes="Stimson's Pythons can be more defensive than Children's Pythons, especially as hatchlings. Regular handling from a young age makes a significant difference. Most adults become quite calm. Bites are small but can startle." />
        <SnakeBreeding clutchSize="5–12 eggs" incubationTemp="30–32°C" incubationDays="55–65 days" maturityAge="2–3 years" notes="Requires a cooling period in winter. Drop overnight temps to 15–17°C for 6–8 weeks. Females coil around their eggs and should not be disturbed once laid. Remove eggs carefully to an incubator." />
      </>}
      {tab === "licencing" && <LegalTab note="Stimson's Pythons are a commonly kept beginner snake available across most of Australia." states={[{ abbr: "NSW", cat: "Standard keeper licence", ok: true }, { abbr: "VIC", cat: "Basic wildlife licence", ok: true }, { abbr: "QLD", cat: "Standard keeper licence", ok: true }, { abbr: "SA", cat: "Basic permit", ok: true }, { abbr: "WA", cat: "Standard licence", ok: true }, { abbr: "TAS", cat: "TAS natives only", ok: false }, { abbr: "ACT", cat: "Standard licence", ok: true }, { abbr: "NT", cat: "Check with authority", ok: true }]} />}
    </>}
  />
);

export default StimsonsPythonPage;
