import { T } from "../../../constants/theme";
import SectionLabel from "../../../components/SectionLabel";
import WarnBox from "../../../components/WarnBox";
import ShopBtn from "../../../components/ShopBtn";
import TempBar, { TempCard } from "../../../components/TempBar";
import FoodItem, { FOOD_CARD } from "../../../components/FoodItem";
import HealthItem from "../../../components/HealthItem";
import StatGrid from "../../../components/StatGrid";
import LegalTab from "../../../components/LegalTab";
import SpeciesPage from "../../../components/SpeciesPage";

// ─── Southern Leaf-tailed Gecko page ─────────────────────────────
const LeafTailGeckoPage = ({ onBack }) => (
  <SpeciesPage onBack={onBack} name="Southern Leaf-tailed Gecko" latin="Phyllurus platurus" emoji="🦎"
    badges={[["Intermediate", T.chipBg, T.chip], ["Australian native", T.infoBg, T.info], ["Nocturnal", T.chipBg, T.accentText]]}
    tabs={["overview","feeding","health & shedding","handling","licencing"]}
    tabContent={(tab) => <>
      {tab === "overview" && <>
        <p style={{fontSize: 15, color: T.body,lineHeight:1.6,marginBottom:14}}>One of Australia's most extraordinary native geckos. Found in the sandstone habitats of the Sydney Basin and surrounds, including urban areas where they enter garages and homes. Their flattened body, incredible bark-mimicking camouflage, and distinctive leaf-shaped tail make them unmistakable. A fascinating display animal that rewards patient observation.</p>
        <SectionLabel mt={0}>Quick stats</SectionLabel>
        <StatGrid stats={[["📏","Adult size","14–18 cm"],["⏳","Lifespan","15–20+ yrs"],["🏠","Min. enclosure","45 × 45 × 60 cm"],["💧","Humidity","50–70%"]]} />
        <WarnBox type="gold" title="Display animal — not for handling">Southern Leaf-tailed Geckos are stressed by frequent handling. They are best kept as a display species to observe their remarkable camouflage and nocturnal behaviour. Their welfare depends on minimal disturbance.</WarnBox>
        <SectionLabel>Temperature requirements</SectionLabel>
        <TempCard>
          <TempBar label="Warm side" value="24–28°C" width="50%" color="#e05a2b"/>
          <TempBar label="Cool side" value="18–22°C" width="30%" color="#4a9e6b"/>
          <TempBar label="Overnight low" value="15–18°C" width="20%" color="#2b7ec0"/>
        </TempCard>
        <WarnBox type="red" title="Cool temperatures essential">Leaf-tailed Geckos are sensitive to heat. Never allow temperatures to exceed 30°C anywhere in the enclosure. They come from cool sandstone environments and will suffer in overheated setups.</WarnBox>
        <SectionLabel>Enclosure setup</SectionLabel>
        <div style={{background:T.card,borderRadius:14,padding:"12px 14px",border: "none",fontSize: 15, color: T.body,lineHeight:1.7}}>A tall enclosure with plenty of vertical surface area — they spend most of their time pressed flat against bark or rock surfaces. Cork bark sheets and flat pieces of sandstone or slate leaning against the walls are ideal. Low UVB lighting recommended. Coconut coir or sandy substrate. Mist one side of the enclosure lightly 2–3 times per week — they drink from droplets. A shallow water bowl. Good ventilation is essential to prevent respiratory issues.</div>
        <ShopBtn>Shop gecko supplies</ShopBtn>
        <ShopBtn secondary>Ask a question ↗</ShopBtn>
      </>}
      {tab === "feeding" && <>
        <p style={{fontSize: 15, color: T.body,lineHeight:1.6,marginBottom:12}}>Insectivorous. Feed at night when naturally active. Ambush hunters — they wait motionless for prey to come within range rather than actively chasing it.</p>
        <div style={FOOD_CARD}>
          <FoodItem icon="🦗" name="Crickets" detail="Staple feeder — appropriately sized" freq="Every 2–3 nights"/>
          <FoodItem icon="🦟" name="Wood Roaches" detail="Excellent Australian native feeder" freq="Every 2–3 nights"/>
          <FoodItem icon="🪲" name="Mealworms" detail="Occasional treat — high fat" freq="Weekly"/>
          <FoodItem icon="🐛" name="Silkworms" detail="High moisture — good for hydration" freq="Occasionally"/>
        </div>
        <WarnBox type="gold" title="Feed at night only">These geckos are strictly nocturnal. Offer food after lights out. They will ignore prey during the day and uneaten insects left in the enclosure can stress or injure the gecko.</WarnBox>
        <WarnBox type="blue" title="Calcium supplementation">Dust all insects with calcium + D3 at every feed for juveniles, every other feed for adults. Low UVB lighting should be supplemented with D3 powder.</WarnBox>
        <ShopBtn>Shop feeders & supplements</ShopBtn>
      </>}
      {tab === "health & shedding" && <>
        <SectionLabel mt={0}>Common health issues</SectionLabel>
        <HealthItem title="Overheating" detail="The most common cause of decline in captivity. Always monitor temperatures closely. Install a reliable thermometer at enclosure height where the gecko rests."/>
        <HealthItem title="Respiratory infection" detail="Caused by insufficient ventilation or temperatures too cold combined with high humidity. Signs include wheezing or mucus. Ensure excellent airflow."/>
        <HealthItem title="Stress" detail="These geckos are sensitive to disturbance. A stressed gecko will be inactive, refuse food, and lose weight. Minimise handling and unnecessary disturbance during the day."/>
        <HealthItem title="Retained shed" detail="Usually caused by low humidity. A light misting 24 hours before a shed helps. Check carefully around toes after shedding."/>
        <HealthItem dot="#4a9e6b" title="Signs of good health" detail="Flat against a surface during the day (normal resting position), active and hunting at night, excellent camouflage colouration, plump body condition."/>
        <SectionLabel>Shedding</SectionLabel>
        <div style={{background:T.card,borderRadius:14,padding:"12px 14px",border: "none",fontSize: 15, color: T.body,lineHeight:1.7}}>Leaf-tailed Geckos shed every 6–8 weeks. Unlike many geckos, they typically eat their shed. A light mist the day before a shed helps. Do not disturb during or immediately after shedding.</div>
      </>}
      {tab === "handling" && <>
        <div style={{background:T.chipBg,borderRadius:14,padding:"12px 14px",marginBottom:12,border: "none"}}>
          <div style={{fontSize:12,fontWeight:700,color:T.chip,marginBottom:6}}>HANDLING — KEEP TO ABSOLUTE MINIMUM</div>
          <div style={{fontSize: 15, color: T.body,lineHeight:1.6}}>Southern Leaf-tailed Geckos are not handling animals. They are fragile, stress easily, and can drop their tail or suffer injury if mishandled. Handle only for health checks and keep sessions under 2 minutes. This species is best enjoyed through observation.</div>
        </div>
        <div style={{background:T.card,borderRadius:14,padding:"12px 14px",border: "none",fontSize: 15, color: T.body,lineHeight:1.7}}>If handling is necessary, support the full body from below. Never grab from above or restrain forcefully. Work at night when they are naturally active and more responsive. Their remarkable camouflage can make them very hard to find in the enclosure during the day — resist the urge to disturb them.</div>
        <WarnBox type="red" title="Tail drop risk">Like many geckos, Leaf-tails can drop their tail under extreme stress. The tail regrows but never matches the original leaf shape — the species' most distinctive feature is permanently altered. Minimise stress at all times.</WarnBox>
      </>}
      {tab === "licencing" && <LegalTab note="Can be kept in NSW, QLD, SA, ACT and NT. Not permitted in VIC, WA and TAS. Licence names are each authority's own; checked November 2026." states={[{ abbr: "NSW", cat: "Companion or Class 1 licence", ok: true }, { abbr: "VIC", cat: "Not permitted · confirm with authority", ok: false }, { abbr: "QLD", cat: "Standard licence · confirm with authority", ok: true }, { abbr: "SA", cat: "Specialist permit", ok: true }, { abbr: "WA", cat: "Not permitted", ok: false }, { abbr: "TAS", cat: "Not permitted (TAS natives only)", ok: false }, { abbr: "ACT", cat: "Keeper licence (case by case)", ok: true }, { abbr: "NT", cat: "Import + keep permit (case by case)", ok: true }]} />}
    </>}
  />
);

export default LeafTailGeckoPage;
