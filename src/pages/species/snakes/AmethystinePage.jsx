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

// ─── Amethystine Python page ──────────────────────────────────────
const AmethystinePage = ({ onBack }) => (
  <SpeciesPage onBack={onBack} name="Amethystine Python" latin="Simalia amethistina" emoji="🐍"
    badges={[["Advanced", C.redPale, C.red], ["Australian native", C.bluePale, C.blue], ["Largest Australian python", C.redPale, C.red]]}
    tabs={["overview","feeding","health & shedding","handling & breeding","licencing"]}
    tabContent={(tab) => <>
      {tab === "overview" && <>
        <p style={{fontSize:13,color:"#666",lineHeight:1.6,marginBottom:14}}>Australia's largest python and one of the longest snakes in the world. Found in the tropical rainforests of far north Queensland. Their scales have a beautiful amethyst iridescence in sunlight. An impressive and long-lived species suited only to experienced keepers with significant space and resources.</p>
        <WarnBox type="red" title="Advanced species — significant commitment">Amethystine Pythons grow very large and live for 25+ years. Housing, feeding costs, and handling requirements are substantial. Two-person handling is essential for large adults. Not suitable for beginners or intermediate keepers.</WarnBox>
        <SectionLabel>Quick stats</SectionLabel>
        <StatGrid stats={[["📏","Adult size","3.0–5.0 m"],["⏳","Lifespan","25–30+ yrs"],["🏠","Min. enclosure","300 × 90 cm"],["💧","Humidity","60–80%"]]} />
        <SectionLabel>Temperature requirements</SectionLabel>
        <TempBar label="Basking spot" value="34–37°C" width="84%" color="#e05a2b"/>
        <TempBar label="Warm side" value="28–32°C" width="66%" color="#e0922b"/>
        <TempBar label="Cool side" value="24–28°C" width="50%" color="#4a9e6b"/>
        <TempBar label="Overnight low" value="22–24°C" width="36%" color="#2b7ec0"/>
        <SectionLabel>Enclosure setup</SectionLabel>
        <div style={{background:C.cream,borderRadius:12,padding:"12px 14px",border:"0.5px solid #e8e8e4",fontSize:13,color:"#666",lineHeight:1.7}}>An extremely large, custom-built enclosure is non-negotiable. Solid timber construction with reinforced security locks. Very large water feature — they love to soak. Sturdy climbing branches. High humidity with excellent ventilation. The enclosure must be escape-proof — a large escaped Amethystine Python is a serious situation.</div>
        <ShopBtn>🛒 Shop Amethystine Python supplies</ShopBtn>
        <ShopBtn secondary>Ask a question ↗</ShopBtn>
      </>}
      {tab === "feeding" && <>
        <p style={{fontSize:13,color:"#666",lineHeight:1.6,marginBottom:12}}>Carnivorous. Adults require very large prey items — the feeding cost of an Amethystine Python is significant. Always use extra-long tongs and never free-hand feed.</p>
        <div style={{background:C.cream,borderRadius:12,border:"0.5px solid #e8e8e4",padding:"0 14px"}}>
          <FoodItem icon="🐭" name="Mice / small rats" detail="Hatchlings and juveniles" freq="Every 7 days"/>
          <FoodItem icon="🐀" name="Large rats" detail="Sub-adults" freq="Every 10–14 days"/>
          <FoodItem icon="🐇" name="Rabbits / large rats" detail="Adults" freq="Every 14–21 days"/>
        </div>
        <WarnBox type="red" title="Feeding safety critical">Amethystine Pythons are powerful constrictors. Two-person presence during feeding interaction is strongly recommended for large adults. Have an emergency plan for a constriction incident.</WarnBox>
        <WarnBox type="gold" title="Feeding cost">Budget carefully — feeding a large adult Amethystine Python is a significant ongoing expense. Factor this into your decision before acquiring this species.</WarnBox>
        <ShopBtn>🛒 Shop feeders</ShopBtn>
      </>}
      {tab === "health & shedding" && <>
        <SectionLabel mt={0}>Common health issues</SectionLabel>
        <HealthItem title="Respiratory infection" detail="Their size makes treatment complex and expensive. Prevention through proper temperatures and ventilation is critical."/>
        <HealthItem title="Obesity" detail="Large pythons can become obese if overfed. Keep portions appropriate — an obese Amethystine Python is a serious health risk."/>
        <HealthItem title="Handling injuries" detail="Their size and strength means improper handling can injure both snake and keeper. Always handle with a second person for large adults."/>
        <HealthItem title="Enclosure security" detail="Check all locks and enclosure integrity regularly. A large escaped python requires immediate professional assistance."/>
        <HealthItem dot="#4a9e6b" title="Signs of good health" detail="Amethyst iridescence in sunlight, alert and responsive, firm muscle tone, regular feeding and shedding."/>
        <SnakeShedding />
      </>}
      {tab === "handling & breeding" && <>
        <SnakeHandling biteRisk="medium" notes="Amethystine Pythons vary in temperament but their size makes any defensive behaviour extremely significant. Always hook-train. Two-person handling is mandatory for adults over 2.5m. Their power means they can be difficult to control if startled. Never handle alone when the snake is large. Despite their size, well-socialised adults can be manageable." />
        <SnakeBreeding clutchSize="8–20 eggs" incubationTemp="30–32°C" incubationDays="65–75 days" maturityAge="4–6 years" notes="A breeding project only for very experienced keepers with appropriate space and facilities. Requires a winter cooling period. Females are dedicated egg-guarders. Hatchlings are large and should feed readily from the start. A prestigious and rewarding project given their status as Australia's largest python." />
      </>}
      {tab === "licencing" && <LegalTab note="Amethystine Pythons require an advanced keeper licence. A significant long-term commitment due to their size." states={[{ abbr: "NSW", cat: "Advanced licence", ok: true }, { abbr: "VIC", cat: "Advanced licence", ok: true }, { abbr: "QLD", cat: "Advanced licence", ok: true }, { abbr: "SA", cat: "Advanced permit", ok: true }, { abbr: "WA", cat: "Advanced licence", ok: true }, { abbr: "TAS", cat: "TAS natives only", ok: false }, { abbr: "ACT", cat: "Advanced licence", ok: true }, { abbr: "NT", cat: "Check with authority", ok: true }]} />}
    </>}
  />
);

export default AmethystinePage;
