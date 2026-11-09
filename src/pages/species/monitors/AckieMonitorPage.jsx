import { T } from "../../../constants/theme";
import SectionLabel from "../../../components/SectionLabel";
import WarnBox from "../../../components/WarnBox";
import BaskingBanner from "../../../components/BaskingBanner";
import ShopBtn from "../../../components/ShopBtn";
import TempBar, { TempCard } from "../../../components/TempBar";
import FoodItem, { FOOD_CARD } from "../../../components/FoodItem";
import HealthItem from "../../../components/HealthItem";
import StatGrid from "../../../components/StatGrid";
import LegalTab from "../../../components/LegalTab";
import SpeciesPage from "../../../components/SpeciesPage";
import SnakeShedding from "../../../components/SnakeShedding";

// ─── Ackie Monitor page ───────────────────────────────────────────
const AckieMonitorPage = ({ onBack }) => (
  <SpeciesPage onBack={onBack} name="Ackie Monitor" latin="Varanus acanthurus" emoji="🦎"
    badges={[["Intermediate", T.chipBg, T.chip], ["Australian native", T.infoBg, T.info], ["Beginner monitor", T.chipBg, T.accentText]]}
    tabs={["overview","feeding","health","handling","licencing"]}
    tabContent={(tab) => <>
      {tab === "overview" && <>
        <p style={{fontSize: 15, color: T.body,lineHeight:1.6,marginBottom:14}}>Also known as the Spiny-tailed Monitor, the Ackie is widely considered the best beginner monitor lizard in the world. Native to arid and semi-arid north-western Australia. Their manageable size, bold personality, intelligence, and relative tolerance of handling set them apart from larger monitor species. Highly active and inquisitive — they are endlessly entertaining to observe and interact with.</p>
        <SectionLabel mt={0}>Quick stats</SectionLabel>
        <StatGrid stats={[["📏","Adult size","60–70 cm"],["⏳","Lifespan","15–20 yrs"],["🏠","Min. enclosure","120 × 60 × 60 cm"],["💧","Humidity","30–40%"]]} />
        <BaskingBanner range="50–60°C" title="Very hot basking spot essential">Ackie Monitors require an extremely hot basking spot — 50–60°C surface temperature is required for proper digestion and metabolic function. This is significantly hotter than most other reptiles. A high-wattage basking lamp with a thermostat is essential. Without adequate basking heat, Ackies decline rapidly.</BaskingBanner>
        <SectionLabel>Temperature requirements</SectionLabel>
        <TempCard>
          <TempBar label="Basking surface temp" value="50–60°C" width="100%" color="#cc2200"/>
          <TempBar label="Warm side ambient" value="32–36°C" width="74%" color="#e05a2b"/>
          <TempBar label="Cool side" value="26–28°C" width="52%" color="#4a9e6b"/>
          <TempBar label="Overnight low" value="20–22°C" width="30%" color="#2b7ec0"/>
        </TempCard>
        <SectionLabel>Enclosure setup</SectionLabel>
        <div style={{background:T.card,borderRadius:14,padding:"12px 14px",border: "none",fontSize: 15, color: T.body,lineHeight:1.7}}>A minimum 120×60×60cm enclosure for one adult — bigger is always better. Deep sandy substrate (20–30cm) for burrowing — this is important for thermoregulation and natural behaviour. A large flat rock or slate directly under the basking lamp as a basking platform. Multiple hides at both warm and cool ends. Cork bark and branches for enrichment. A damp sand box (one corner of the enclosure kept slightly moist) helps with shedding and egg laying.</div>
        <ShopBtn>Shop monitor supplies</ShopBtn>
        <ShopBtn secondary>Ask a question ↗</ShopBtn>
      </>}
      {tab === "feeding" && <>
        <p style={{fontSize: 15, color: T.body,lineHeight:1.6,marginBottom:12}}>Carnivorous. A varied diet of insects, small vertebrates, and eggs is ideal. Their intelligence means they can be trained to eat from tongs and even target-trained for handling.</p>
        <div style={FOOD_CARD}>
          <FoodItem icon="🦗" name="Large crickets / Wood Roaches" detail="Staple insect feeders — gut load well" freq="Every 2 days (juveniles), 3x week (adults)"/>
          <FoodItem icon="🥚" name="Quail eggs / small eggs" detail="Highly nutritious — eagerly taken" freq="Weekly"/>
          <FoodItem icon="🐭" name="Pinky / fuzzy mice" detail="Adults only — occasional protein boost" freq="Monthly"/>
          <FoodItem icon="🪲" name="Superworms / mealworms" detail="Good variety item" freq="Weekly"/>
          <FoodItem icon="🦎" name="Small lizards (skinks)" detail="Rare occasional treat for adults" freq="Rarely"/>
        </div>
        <WarnBox type="gold" title="Variety is essential">Ackies fed on a single prey type develop nutritional deficiencies. Rotate between at least 3–4 different feeders. Gut-load all insects 24 hours before feeding. Dust with calcium and multivitamin supplements.</WarnBox>
        <ShopBtn>Shop feeders & supplements</ShopBtn>
      </>}
      {tab === "health" && <>
        <SectionLabel mt={0}>Common health issues</SectionLabel>
        <HealthItem title="Metabolic Bone Disease (MBD)" detail="From insufficient basking heat, UVB, or calcium. Ackies need very hot basking spots AND high-output UVB. Calcium supplementation at every feed for juveniles."/>
        <HealthItem title="Dysecdysis (retained shed)" detail="Usually caused by low humidity. The damp sand box in the enclosure helps prevent this. Check between toes after shedding."/>
        <HealthItem title="Obesity" detail="Surprisingly common when fed too many fatty foods (superworms, mice). Keep diet varied and lean."/>
        <HealthItem title="Respiratory infection" detail="From temperatures that are too low. Ackies need consistently warm conditions — ensure heat is maintained overnight in winter."/>
        <HealthItem dot="#4a9e6b" title="Signs of good health" detail="Active and alert during the day, basking regularly, feeding enthusiastically, eyes clear and bright, good body condition, regularly shedding."/>
        <SnakeShedding animal="lizard"/>
      </>}
      {tab === "handling" && <>
        <div style={{background:T.chipBg,borderRadius:14,padding:"12px 14px",marginBottom:12,border: "none"}}>
          <div style={{fontSize:12,fontWeight:700,color:T.chip,marginBottom:6}}>BITE RISK — MEDIUM (juveniles) / LOW (tame adults)</div>
          <div style={{fontSize: 15, color: T.body,lineHeight:1.6}}>Juvenile Ackies can be nippy and fast. With consistent gentle handling from a young age they become remarkably tame — often described as having dog-like personalities. Target training (teaching them to touch a target stick for food rewards) significantly speeds up taming. Patient, consistent handling pays dividends with this species.</div>
        </div>
        <div style={{background:T.card,borderRadius:14,padding:"12px 14px",border: "none",fontSize: 15, color: T.body,lineHeight:1.7}}>Hook-train before every handling session — tap gently with a snake hook before picking up to signal handling rather than feeding time. Support the full body. Start with short sessions and build gradually. Well-socialised adults can be extremely tame and interactive — one of the most rewarding monitors to work with.</div>
      </>}
      {tab === "licencing" && <LegalTab note="Can be kept in NSW, VIC, QLD, SA, WA, ACT and NT. Not permitted in TAS. Licence names are each authority's own; checked November 2026." states={[{ abbr: "NSW", cat: "Companion or Class 1 licence", ok: true }, { abbr: "VIC", cat: "Basic licence", ok: true }, { abbr: "QLD", cat: "Standard licence", ok: true }, { abbr: "SA", cat: "Basic permit (one animal permit-free)", ok: true }, { abbr: "WA", cat: "Pet keeper's licence", ok: true }, { abbr: "TAS", cat: "Not permitted (TAS natives only)", ok: false }, { abbr: "ACT", cat: "Keeper licence (case by case)", ok: true }, { abbr: "NT", cat: "Permit to keep", ok: true }]} />}
    </>}
  />
);

export default AckieMonitorPage;
