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

// ─── Eastern Water Dragon page ────────────────────────────────────
const WaterDragonPage = ({ onBack }) => (
  <SpeciesPage onBack={onBack} name="Eastern Water Dragon" latin="Intellagama lesueurii" emoji="🦎"
    badges={[["Intermediate", C.goldLight, "#7a5a1e"], ["Australian native", C.bluePale, C.blue], ["Semi-aquatic", C.greenPale, C.green]]}
    tabs={["overview","feeding","health & shedding","handling","licencing"]}
    tabContent={(tab) => <>
      {tab === "overview" && <>
        <p style={{fontSize:13,color:"#666",lineHeight:1.6,marginBottom:14}}>A large, impressive lizard found along waterways of eastern Australia. Males develop striking red and green colouration on the chest and are visually stunning. They are semi-aquatic — excellent swimmers that can remain submerged for extended periods. An active and engaging species that requires a large, well-designed enclosure.</p>
        <SectionLabel mt={0}>Quick stats</SectionLabel>
        <StatGrid stats={[["📏","Adult size","80–100 cm"],["⏳","Lifespan","15–20 yrs"],["🏠","Min. enclosure","180 × 90 cm"],["💧","Humidity","60–80%"]]} />
        <WarnBox type="red" title="Large water feature essential">Eastern Water Dragons require a significant water feature — large enough to fully submerge in. A built-in pond section or large tub is non-negotiable. They will not thrive without regular access to water.</WarnBox>
        <SectionLabel>Temperature requirements</SectionLabel>
        <TempBar label="Basking spot" value="35–40°C" width="84%" color="#e05a2b"/>
        <TempBar label="Warm side" value="26–30°C" width="58%" color="#e0922b"/>
        <TempBar label="Cool side" value="22–26°C" width="44%" color="#4a9e6b"/>
        <TempBar label="Overnight low" value="18–22°C" width="28%" color="#2b7ec0"/>
        <SectionLabel>Enclosure setup</SectionLabel>
        <div style={{background:C.cream,borderRadius:12,padding:"12px 14px",border:"0.5px solid #e8e8e4",fontSize:13,color:"#666",lineHeight:1.7}}>A very large custom enclosure — minimum 180×90cm footprint with height of at least 90cm. Built-in water section with filtration. Branches for climbing at varying heights. UVB tube at the top. Coconut coir or bioactive substrate in the land section. Cork bark hides. Good filtration in the water section is critical.</div>
        <ShopBtn>🛒 Shop Water Dragon supplies</ShopBtn>
        <ShopBtn secondary>Ask a question ↗</ShopBtn>
      </>}
      {tab === "feeding" && <>
        <p style={{fontSize:13,color:"#666",lineHeight:1.6,marginBottom:12}}>Omnivores. A varied diet of insects, small vertebrates, and some plant matter. Adults can be fed less frequently than juveniles.</p>
        <div style={{background:C.cream,borderRadius:12,border:"0.5px solid #e8e8e4",padding:"0 14px"}}>
          <FoodItem icon="🦗" name="Crickets / roaches" detail="Protein staple" freq="Every 2 days (juv), 3x week (adult)"/>
          <FoodItem icon="🐭" name="Pinky mice" detail="Adults — occasional protein boost" freq="Monthly"/>
          <FoodItem icon="🥬" name="Leafy greens" detail="Supplement to insect diet" freq="Weekly"/>
          <FoodItem icon="🐟" name="Small fish / shrimp" detail="Can be fed in their water section" freq="Occasionally"/>
        </div>
        <WarnBox type="gold" title="They may feed in water">Water Dragons sometimes prefer to eat in or near water. Offering some prey items near the water section can improve feeding response.</WarnBox>
        <ShopBtn>🛒 Shop feeders & supplements</ShopBtn>
      </>}
      {tab === "health & shedding" && <>
        <SectionLabel mt={0}>Common health issues</SectionLabel>
        <HealthItem title="Snout rubbing" detail="Very common in newly acquired Water Dragons. They run into glass repeatedly causing snout injuries. Cover lower portions of glass with a visual barrier until settled."/>
        <HealthItem title="Water quality issues" detail="Poor water filtration leads to bacterial infections and skin problems. Invest in quality filtration and change water regularly."/>
        <HealthItem title="MBD" detail="Proper UVB is essential. Ensure the UVB tube reaches all areas the dragon uses regularly."/>
        <HealthItem title="Stress" detail="Water Dragons can be flighty and nervous. A well-planted, naturalistic enclosure significantly reduces stress."/>
        <HealthItem dot="#4a9e6b" title="Signs of good health" detail="Bright colouration (especially males), active climbing and swimming, feeding well, alert and responsive."/>
        <SnakeShedding animal="lizard" />
      </>}
      {tab === "handling" && <>
        <div style={{background:C.goldLight,borderRadius:12,padding:"12px 14px",marginBottom:12,border:`0.5px solid #c8963c44`}}>
          <div style={{fontSize:12,fontWeight:700,color:"#7a5a1e",marginBottom:6}}>BITE RISK — MEDIUM</div>
          <div style={{fontSize:13,color:"#555",lineHeight:1.6}}>Eastern Water Dragons are alert and fast-moving. Juveniles can be quite flighty. Adults tame down significantly with regular gentle handling. Their tail is powerful and can whip if they feel threatened. Sharp claws.</div>
        </div>
        <div style={{background:C.cream,borderRadius:12,padding:"12px 14px",border:"0.5px solid #e8e8e4",fontSize:13,color:"#666",lineHeight:1.7}}>Allow 3–4 weeks to settle. Approach slowly, support the full body. Once settled they can become very tame and will often voluntarily approach their keeper. Well-handled adults are impressive and engaging animals to interact with.</div>
      </>}
      {tab === "licencing" && <LegalTab note="Can be kept in NSW, VIC, QLD, SA and NT. Not permitted in WA, TAS and ACT. Licence names are each authority's own; checked November 2026." states={[{ abbr: "NSW", cat: "Companion or Class 1 licence", ok: true }, { abbr: "VIC", cat: "Basic licence", ok: true }, { abbr: "QLD", cat: "Standard licence", ok: true }, { abbr: "SA", cat: "Basic permit (one animal permit-free)", ok: true }, { abbr: "WA", cat: "Not permitted", ok: false }, { abbr: "TAS", cat: "Not permitted (TAS natives only)", ok: false }, { abbr: "ACT", cat: "Not permitted · confirm with authority", ok: false }, { abbr: "NT", cat: "Import + keep permit (case by case)", ok: true }]} />}
    </>}
  />
);

export default WaterDragonPage;
