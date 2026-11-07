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

// ─── Jungle Carpet Python page ───────────────────────────────────
const JungleCarpetPage = ({ onBack }) => (
  <SpeciesPage onBack={onBack} name="Jungle Carpet Python" latin="Morelia spilota cheynei" emoji="🐍"
    badges={[["Intermediate", C.goldLight, "#7a5a1e"], ["Australian native", C.bluePale, C.blue], ["Semi-arboreal", C.goldLight, "#7a5a1e"]]}
    tabs={["overview","feeding","health & shedding","handling & breeding","licencing"]}
    tabContent={(tab) => <>
      {tab === "overview" && <>
        <p style={{fontSize:13,color:"#666",lineHeight:1.6,marginBottom:14}}>The most visually striking of all carpet python subspecies — a vibrant yellow and black pattern that intensifies with age. Found in the rainforests of north Queensland. One of the most sought-after pythons in Australian collections. Requires higher humidity and temperatures than other carpet subspecies.</p>
        <SectionLabel mt={0}>Quick stats</SectionLabel>
        <StatGrid stats={[["📏","Adult size","1.5–2.5 m"],["⏳","Lifespan","20–30 yrs"],["🏠","Min. enclosure","180 × 60 cm"],["💧","Humidity","60–80%"]]} />
        <SectionLabel>Temperature requirements</SectionLabel>
        <TempBar label="Basking spot" value="34–37°C" width="84%" color="#e05a2b"/>
        <TempBar label="Warm side" value="28–32°C" width="66%" color="#e0922b"/>
        <TempBar label="Cool side" value="24–28°C" width="50%" color="#4a9e6b"/>
        <TempBar label="Overnight low" value="20–24°C" width="34%" color="#2b7ec0"/>
        <WarnBox type="blue" title="Higher humidity than other carpets">Jungle Carpets come from tropical rainforest. They require significantly higher humidity (60–80%) than inland carpet subspecies. Regular misting or a fogger is beneficial.</WarnBox>
        <SectionLabel>Enclosure setup</SectionLabel>
        <div style={{background:C.cream,borderRadius:12,padding:"12px 14px",border:"0.5px solid #e8e8e4",fontSize:13,color:"#666",lineHeight:1.7}}>Tall timber or PVC enclosure — Jungles are highly arboreal. Sturdy horizontal branches are essential. Cypress mulch or coir substrate. Excellent ventilation is critical despite the higher humidity. Large water bowl. The colouration improves dramatically in proper conditions.</div>
        <ShopBtn>🛒 Shop Jungle Carpet supplies</ShopBtn>
        <ShopBtn secondary>Ask a question ↗</ShopBtn>
      </>}
      {tab === "feeding" && <>
        <p style={{fontSize:13,color:"#666",lineHeight:1.6,marginBottom:12}}>Carnivorous. Generally good feeders once established. Feed pre-killed or frozen/thawed prey. Always use long tongs.</p>
        <div style={{background:C.cream,borderRadius:12,border:"0.5px solid #e8e8e4",padding:"0 14px"}}>
          <FoodItem icon="🐭" name="Fuzzy / hopper mice" detail="Hatchlings and small juveniles" freq="Every 5–7 days"/>
          <FoodItem icon="🐭" name="Adult mice" detail="Juveniles" freq="Every 7–10 days"/>
          <FoodItem icon="🐀" name="Small to medium rats" detail="Sub-adults and adults" freq="Every 10–14 days"/>
        </div>
        <WarnBox type="red" title="Defensive feeders">Jungle Carpets can be feistier feeders than other carpet subspecies. Always hook-train and use long tongs. Juveniles in particular can be defensive.</WarnBox>
        <WarnBox type="gold" title="Colour and feeding">Good nutrition and proper temperatures directly affect the quality of their yellow and black colouration. Well-fed, properly kept animals have dramatically better colour.</WarnBox>
        <ShopBtn>🛒 Shop feeders & supplements</ShopBtn>
      </>}
      {tab === "health & shedding" && <>
        <SectionLabel mt={0}>Common health issues</SectionLabel>
        <HealthItem title="Respiratory infection" detail="Despite needing high humidity, poor ventilation causes respiratory issues. Ensure airflow is excellent."/>
        <HealthItem title="Scale rot" detail="High humidity without good ventilation causes bacterial skin infections. Keep substrate dry on top even if humidity is high."/>
        <HealthItem title="Mites" detail="Very common with all carpet pythons. Check regularly, especially around heat source areas."/>
        <HealthItem title="Dull colouration" detail="Poor colour is often a husbandry issue — check temperatures, humidity, nutrition, and UVB levels."/>
        <HealthItem dot="#4a9e6b" title="Signs of good health" detail="Vivid yellow and black pattern, alert and arboreal behaviour, strong feeding response, regular shedding."/>
        <SnakeShedding />
      </>}
      {tab === "handling & breeding" && <>
        <SnakeHandling biteRisk="medium" notes="Jungle Carpets have a reputation as the feistiest carpet subspecies. Many individuals are defensive especially as juveniles, and some remain so throughout their lives. Consistent handling from an early age is essential. Always hook-train. Adults generally become much calmer with regular interaction." />
        <SnakeBreeding clutchSize="10–25 eggs" incubationTemp="30–32°C" incubationDays="55–65 days" maturityAge="3–4 years" notes="Requires a significant winter cooling period with reduced temperatures and lighting. Females are dedicated egg-guarders and will shiver to generate heat. Their stunning colouration makes them a popular and rewarding breeding project. High-colour individuals command premium prices." />
      </>}
      {tab === "licencing" && <LegalTab note="Can be kept in NSW, VIC, QLD, SA, ACT and NT. Not permitted in WA and TAS. Licence names are each authority's own; checked November 2026." states={[{ abbr: "NSW", cat: "Companion or Class 1 licence", ok: true }, { abbr: "VIC", cat: "Basic licence", ok: true }, { abbr: "QLD", cat: "Standard licence · confirm with authority", ok: true }, { abbr: "SA", cat: "Basic permit (one animal permit-free) · confirm with authority", ok: true }, { abbr: "WA", cat: "Not permitted", ok: false }, { abbr: "TAS", cat: "Not permitted (TAS natives only)", ok: false }, { abbr: "ACT", cat: "Keeper licence (case by case)", ok: true }, { abbr: "NT", cat: "Import + keep permit (case by case)", ok: true }]} />}
    </>}
  />
);

export default JungleCarpetPage;
