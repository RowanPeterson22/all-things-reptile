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

// ─── Striped Marsh Frog page ──────────────────────────────────────
const StripedMarshFrogPage = ({ onBack }) => (
  <SpeciesPage onBack={onBack} name="Striped Marsh Frog" latin="Limnodynastes peronii" emoji="🐸"
    badges={[["Beginner friendly", C.greenPale, C.green], ["Australian native", C.bluePale, C.blue], ["Ground dwelling", C.goldLight, "#7a5a1e"]]}
    tabs={["overview","feeding","health & shedding","handling","licencing"]}
    tabContent={(tab) => <>
      {tab === "overview" && <>
        <p style={{fontSize:13,color:"#666",lineHeight:1.6,marginBottom:14}}>One of Australia's most common and recognisable frogs — found in backyards and gardens across eastern Australia. Their distinctive brown striped pattern and loud "tok" call are familiar to anyone who lives near water. Unlike tree frogs, Striped Marsh Frogs are ground-dwelling and semi-aquatic. Hardy, adaptable, and easy to keep — a great beginner frog that is often overlooked in favour of tree frogs.</p>
        <SectionLabel mt={0}>Quick stats</SectionLabel>
        <StatGrid stats={[["📏","Adult size","4–7 cm"],["⏳","Lifespan","5–10 yrs"],["🏠","Min. enclosure","60 × 45 × 30 cm"],["💧","Humidity","60–80%"]]} />
        <SectionLabel>Temperature requirements</SectionLabel>
        <TempBar label="Daytime ambient" value="20–26°C" width="44%" color="#e05a2b"/>
        <TempBar label="Nighttime low" value="14–18°C" width="22%" color="#2b7ec0"/>
        <WarnBox type="blue" title="Cooler temperatures preferred">Striped Marsh Frogs are from temperate eastern Australia and prefer cooler conditions than tropical tree frogs. They tolerate a wide temperature range but do not thrive in warm tropical setups.</WarnBox>
        <SectionLabel>Enclosure setup</SectionLabel>
        <div style={{background:C.cream,borderRadius:12,padding:"12px 14px",border:"0.5px solid #e8e8e4",fontSize:13,color:"#666",lineHeight:1.7}}>A wider rather than taller enclosure — they are ground-dwelling, not climbers. Coconut coir substrate. A large water section is important — they are semi-aquatic and spend significant time in water. Cork bark and leaf litter hides. Low plants for cover. Mist regularly to maintain humidity. Good ventilation essential.</div>
        <ShopBtn>🛒 Shop frog supplies</ShopBtn>
        <ShopBtn secondary>Ask a question ↗</ShopBtn>
      </>}
      {tab === "feeding" && <>
        <p style={{fontSize:13,color:"#666",lineHeight:1.6,marginBottom:12}}>Insectivorous. Will feed both on land and at the water's edge. Active feeders that respond well to moving prey.</p>
        <div style={{background:C.cream,borderRadius:12,border:"0.5px solid #e8e8e4",padding:"0 14px"}}>
          <FoodItem icon="🦗" name="Crickets" detail="Staple feeder — appropriately sized" freq="Every 2–3 nights"/>
          <FoodItem icon="🦟" name="Wood Roaches (Woodies)" detail="Excellent Australian feeder" freq="Every 2–3 nights"/>
          <FoodItem icon="🪱" name="Earthworms" detail="Natural prey — eagerly taken" freq="Weekly"/>
          <FoodItem icon="🪲" name="Mealworms" detail="Treat only" freq="Occasionally"/>
        </div>
        <WarnBox type="gold" title="Feed near water">Striped Marsh Frogs often prefer to feed at the water's edge. Placing prey items near or at the water section can improve feeding response.</WarnBox>
        <ShopBtn>🛒 Shop feeders & supplements</ShopBtn>
      </>}
      {tab === "health & shedding" && <>
        <SectionLabel mt={0}>Common health issues</SectionLabel>
        <HealthItem title="Chytridiomycosis" detail="All frogs are susceptible. Strict hygiene and never releasing captive frogs into the wild is essential."/>
        <HealthItem title="Water quality" detail="As semi-aquatic frogs they are particularly sensitive to water quality. Change water frequently and dechlorinate all water used."/>
        <HealthItem title="Dehydration" detail="Despite tolerating cooler conditions, they still need adequate access to water. Ensure the water section is always clean and accessible."/>
        <HealthItem dot="#4a9e6b" title="Signs of good health" detail="Active at night, feeding well, using both land and water areas, clear eyes, moist skin, calling (males)."/>
        <SnakeShedding animal="frog"/>
      </>}
      {tab === "handling" && <>
        <div style={{background:C.goldLight,borderRadius:12,padding:"12px 14px",marginBottom:12,border:`0.5px solid #c8963c44`}}>
          <div style={{fontSize:12,fontWeight:700,color:"#7a5a1e",marginBottom:6}}>HANDLING — KEEP MINIMAL</div>
          <div style={{fontSize:13,color:"#555",lineHeight:1.6}}>Striped Marsh Frogs are more of an observation species than a handling species. They are fast-moving and jumpy when disturbed. Handling should be kept to a minimum and only for health checks. Always wet hands with dechlorinated water first.</div>
        </div>
        <WarnBox type="gold" title="Loud call">Males produce a loud repetitive "tok" call, particularly at night and before rain. This is a sign of a healthy, content frog — but worth considering if you are a light sleeper!</WarnBox>
      </>}
      {tab === "licencing" && <LegalTab note="Can be kept in NSW, VIC, QLD, SA and ACT. Not permitted in WA, TAS and NT. No licence or permit needed in SA if captive-bred and lawfully sourced. Licence names are each authority's own; checked November 2026." states={[{ abbr: "NSW", cat: "Companion or Class 1 licence", ok: true }, { abbr: "VIC", cat: "Basic licence", ok: true }, { abbr: "QLD", cat: "Standard licence", ok: true }, { abbr: "SA", cat: "No permit needed · confirm with authority", ok: true }, { abbr: "WA", cat: "Not permitted", ok: false }, { abbr: "TAS", cat: "Not permitted (TAS natives only)", ok: false }, { abbr: "ACT", cat: "Keeper licence (case by case)", ok: true }, { abbr: "NT", cat: "Not permitted", ok: false }]} />}
    </>}
  />
);

export default StripedMarshFrogPage;
