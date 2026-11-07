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

// ─── Eastern Dwarf Tree Frog page ─────────────────────────────────
const EasternDwarfFrogPage = ({ onBack }) => (
  <SpeciesPage onBack={onBack} name="Eastern Dwarf Tree Frog" latin="Litoria fallax" emoji="🐸"
    badges={[["Beginner friendly", C.greenPale, C.green], ["Australian native", C.bluePale, C.blue], ["Tiny species", C.goldLight, "#7a5a1e"]]}
    tabs={["overview","feeding","health & shedding","handling","licencing"]}
    tabContent={(tab) => <>
      {tab === "overview" && <>
        <p style={{fontSize:13,color:"#666",lineHeight:1.6,marginBottom:14}}>One of Australia's smallest and most charming frogs. Found in eastern Australia from Queensland to Victoria in vegetation near water. Their tiny size — adults reach just 2.5 cm — and bright green colouration make them a delightful species to keep. Best kept in groups and observed rather than handled. A popular choice for naturalistic bioactive enclosures.</p>
        <SectionLabel mt={0}>Quick stats</SectionLabel>
        <StatGrid stats={[["📏","Adult size","2–2.5 cm"],["⏳","Lifespan","3–5 yrs"],["🏠","Min. enclosure","45 × 45 × 45 cm"],["💧","Humidity","60–75%"]]} />
        <WarnBox type="red" title="Very small — escape risk">Eastern Dwarf Tree Frogs are tiny and can escape through very small gaps. Ensure the enclosure is completely escape-proof with fine mesh or sealed joins. They can fit through gaps smaller than you'd expect.</WarnBox>
        <SectionLabel>Temperature requirements</SectionLabel>
        <TempBar label="Daytime ambient" value="22–26°C" width="46%" color="#e05a2b"/>
        <TempBar label="Nighttime low" value="16–20°C" width="28%" color="#2b7ec0"/>
        <SectionLabel>Enclosure setup</SectionLabel>
        <div style={{background:C.cream,borderRadius:12,padding:"12px 14px",border:"0.5px solid #e8e8e4",fontSize:13,color:"#666",lineHeight:1.7}}>A bioactive enclosure with live plants works beautifully for this species. They love dense vegetation to hide in. A small water area. Fine-mesh ventilation — they can escape through large gaps. Keep in groups of 3+ as they are social. Cork bark and leaf litter on the substrate. Mist every evening.</div>
        <ShopBtn>🛒 Shop frog supplies</ShopBtn>
        <ShopBtn secondary>Ask a question ↗</ShopBtn>
      </>}
      {tab === "feeding" && <>
        <p style={{fontSize:13,color:"#666",lineHeight:1.6,marginBottom:12}}>Insectivorous. Their tiny size means prey must be very small — pinhead or small crickets only. Feeding can be tricky due to their size.</p>
        <div style={{background:C.cream,borderRadius:12,border:"0.5px solid #e8e8e4",padding:"0 14px"}}>
          <FoodItem icon="🦗" name="Pinhead / small crickets" detail="Only appropriately tiny prey" freq="Every 2 nights"/>
          <FoodItem icon="🦟" name="Woodies nymphs (baby roaches)" detail="Small nymphs only — excellent nutrition" freq="Every 2 nights"/>
          <FoodItem icon="🪲" name="Fruit flies (Drosophila)" detail="Good for very small juveniles" freq="Occasional supplement"/>
        </div>
        <WarnBox type="red" title="Prey size is critical">Prey must be no larger than the width of the frog's head — for Eastern Dwarf Tree Frogs that means very small insects. Oversized prey causes choking. Never offer adult crickets or large woodies to this species.</WarnBox>
        <ShopBtn>🛒 Shop feeders & supplements</ShopBtn>
      </>}
      {tab === "health & shedding" && <>
        <SectionLabel mt={0}>Common health issues</SectionLabel>
        <HealthItem title="Chytridiomycosis" detail="All frogs are susceptible. Strict hygiene essential."/>
        <HealthItem title="Escape and dehydration" detail="Escaped frogs dehydrate rapidly. Ensure the enclosure is escape-proof and check the enclosure thoroughly if you suspect an escape."/>
        <HealthItem title="Overfeeding" detail="Despite their small size they can overeat. Feed small amounts every 2 nights rather than large amounts infrequently."/>
        <HealthItem dot="#4a9e6b" title="Signs of good health" detail="Bright green colouration, active at night, calling (males), feeding well, using all levels of the enclosure."/>
        <SnakeShedding animal="frog"/>
      </>}
      {tab === "handling" && <>
        <div style={{background:C.redPale,borderRadius:12,padding:"12px 14px",marginBottom:12,border:`0.5px solid ${C.red}22`}}>
          <div style={{fontSize:12,fontWeight:700,color:C.red,marginBottom:6}}>HANDLING — NOT RECOMMENDED</div>
          <div style={{fontSize:13,color:"#555",lineHeight:1.6}}>Eastern Dwarf Tree Frogs are observation animals — their tiny size makes handling very difficult and stressful for the frog. They are fragile and fast-moving. Handling is not recommended except for essential health checks. Enjoy them through the glass.</div>
        </div>
      </>}
      {tab === "licencing" && <LegalTab note="Eastern Dwarf Tree Frogs require a standard keeper licence in eastern Australian states. Available from licensed breeders in NSW, VIC, and QLD." states={[{ abbr: "NSW", cat: "Standard licence", ok: true }, { abbr: "VIC", cat: "Standard licence", ok: true }, { abbr: "QLD", cat: "Standard licence", ok: true }, { abbr: "SA", cat: "Check with authority", ok: true }, { abbr: "WA", cat: "Not available", ok: false }, { abbr: "TAS", cat: "TAS natives only", ok: false }, { abbr: "ACT", cat: "Standard licence", ok: true }, { abbr: "NT", cat: "Not available", ok: false }]} />}
    </>}
  />
);

export default EasternDwarfFrogPage;
