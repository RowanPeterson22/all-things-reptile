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

// ─── Eastern Bearded Dragon page ──────────────────────────────────
const EasternBeardedDragonPage = ({ onBack }) => (
  <SpeciesPage onBack={onBack} name="Eastern Bearded Dragon" latin="Pogona barbata" emoji="🦎"
    badges={[["Beginner friendly", C.greenPale, C.green], ["Australian native", C.bluePale, C.blue], ["Diurnal", C.goldLight, "#7a5a1e"]]}
    tabs={["overview","feeding","health & shedding","handling","licencing"]}
    tabContent={(tab) => <>
      {tab === "overview" && <>
        <p style={{fontSize:13,color:"#666",lineHeight:1.6,marginBottom:14}}>The Eastern Bearded Dragon is the larger, darker cousin of the Central Bearded Dragon. Found along the eastern coast of Australia in woodland and scrubland. Slightly more defensive than the Central Beardie but still an excellent pet with proper socialisation. Their dark beard display is more dramatic than other species.</p>
        <SectionLabel mt={0}>Quick stats</SectionLabel>
        <StatGrid stats={[["📏","Adult size","50–60 cm"],["⏳","Lifespan","10–15 yrs"],["🏠","Min. enclosure","120 × 60 cm"],["💧","Humidity","30–40%"]]} />
        <SectionLabel>Temperature requirements</SectionLabel>
        <TempBar label="Basking spot" value="40–45°C" width="92%" color="#e05a2b"/>
        <TempBar label="Warm side" value="28–32°C" width="66%" color="#e0922b"/>
        <TempBar label="Cool side" value="22–26°C" width="44%" color="#4a9e6b"/>
        <TempBar label="Overnight low" value="18–22°C" width="28%" color="#2b7ec0"/>
        <WarnBox type="blue" title="UVB lighting essential">Eastern Bearded Dragons require high UVB output. Use a T5 HO 10.0 or 12% UVB tube. Replace every 6–12 months even if still producing visible light — UVB output degrades before the bulb stops glowing.</WarnBox>
        <SectionLabel>Enclosure setup</SectionLabel>
        <div style={{background:C.cream,borderRadius:12,padding:"12px 14px",border:"0.5px solid #e8e8e4",fontSize:13,color:"#666",lineHeight:1.7}}>120×60cm minimum for an adult. Larger is always better. Timber or PVC enclosure. Reptile carpet, tiles, or bioactive substrate. A sturdy basking branch or rock directly under the heat lamp. Hide at the cool end. Fresh vegetables daily in a bowl. UVB tube running the length of the enclosure.</div>
        <ShopBtn>🛒 Shop Bearded Dragon supplies</ShopBtn>
        <ShopBtn secondary>Ask a question ↗</ShopBtn>
      </>}
      {tab === "feeding" && <>
        <p style={{fontSize:13,color:"#666",lineHeight:1.6,marginBottom:12}}>Omnivores. Diet varies significantly with age — juveniles need more protein, adults need more vegetables. A varied diet is key to good health.</p>
        <div style={{background:C.cream,borderRadius:12,border:"0.5px solid #e8e8e4",padding:"0 14px"}}>
          <FoodItem icon="🦗" name="Crickets / roaches" detail="Protein staple — gut load well" freq="Daily (juveniles), 3x week (adults)"/>
          <FoodItem icon="🥬" name="Leafy greens" detail="Collard greens, kale, endive, rocket" freq="Daily"/>
          <FoodItem icon="🫑" name="Vegetables" detail="Capsicum, squash, sweet potato (cooked)" freq="Daily"/>
          <FoodItem icon="🍓" name="Fruit" detail="Small amounts as treats only" freq="Occasionally"/>
        </div>
        <WarnBox type="red" title="Avoid spinach, lettuce, avocado">Spinach and beet greens bind calcium. Iceberg lettuce has no nutritional value. Avocado is toxic to bearded dragons.</WarnBox>
        <WarnBox type="gold" title="Calcium & UVB work together">Calcium supplementation AND proper UVB are both required to prevent MBD. Neither alone is sufficient.</WarnBox>
        <ShopBtn>🛒 Shop feeders & supplements</ShopBtn>
      </>}
      {tab === "health & shedding" && <>
        <SectionLabel mt={0}>Common health issues</SectionLabel>
        <HealthItem title="MBD (Metabolic Bone Disease)" detail="Very common without proper UVB and calcium. Soft bones, tremors, swollen limbs. Preventable with correct setup."/>
        <HealthItem title="Adenovirus (ADV)" detail="Also called Stargazing disease. Neurological symptoms — head tilting, spinning. No cure. Quarantine new animals strictly."/>
        <HealthItem title="Parasites" detail="Internal parasites are common. Annual faecal tests recommended. Signs include weight loss and loose stools."/>
        <HealthItem title="Brumation" detail="Eastern Bearded Dragons brumate more reliably than Centrals. Reduced appetite and activity in winter is normal."/>
        <HealthItem dot="#4a9e6b" title="Signs of good health" detail="Bright eyes, firm body condition, alert basking behaviour, regular feeding, beard display when stimulated."/>
        <SnakeShedding animal="lizard" />
      </>}
      {tab === "handling" && <>
        <div style={{background:C.greenPale,borderRadius:12,padding:"12px 14px",marginBottom:12,border:`0.5px solid ${C.green}22`}}>
          <div style={{fontSize:12,fontWeight:700,color:C.green,marginBottom:6}}>BITE RISK — LOW TO MEDIUM</div>
          <div style={{fontSize:13,color:"#555",lineHeight:1.6}}>Eastern Bearded Dragons can be slightly more defensive than Central Beardies, particularly unsocialised adults. Their beard blackening and gaping is a warning display. With regular handling from a young age they become very tame and personable.</div>
        </div>
        <div style={{background:C.cream,borderRadius:12,padding:"12px 14px",border:"0.5px solid #e8e8e4",fontSize:13,color:"#666",lineHeight:1.7}}>Support the full body when handling. Allow 2 weeks to settle before regular handling. Short sessions initially, building to longer periods. They enjoy supervised free-roaming time and will often seek warmth from their keeper's hands and body.</div>
      </>}
      {tab === "licencing" && <LegalTab note="Eastern Bearded Dragons are a popular beginner species available from licensed breeders across Australia." states={[{ abbr: "NSW", cat: "Standard keeper licence", ok: true }, { abbr: "VIC", cat: "Basic wildlife licence", ok: true }, { abbr: "QLD", cat: "Standard keeper licence", ok: true }, { abbr: "SA", cat: "Basic permit", ok: true }, { abbr: "WA", cat: "Standard licence", ok: true }, { abbr: "TAS", cat: "TAS natives only", ok: false }, { abbr: "ACT", cat: "Standard licence", ok: true }, { abbr: "NT", cat: "Check with authority", ok: true }]} />}
    </>}
  />
);

export default EasternBeardedDragonPage;
