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

// ─── Blotched Blue-tongue Skink page ─────────────────────────────
const BlotchedBlueTonguePage = ({ onBack }) => (
  <SpeciesPage onBack={onBack} name="Blotched Blue-tongue Skink" latin="Tiliqua nigrolutea" emoji="🦎"
    badges={[["Beginner friendly", C.greenPale, C.green], ["Australian native", C.bluePale, C.blue], ["Cool climate", C.goldLight, "#7a5a1e"]]}
    tabs={["overview","feeding","health & shedding","handling","licencing"]}
    tabContent={(tab) => <>
      {tab === "overview" && <>
        <p style={{fontSize:13,color:"#666",lineHeight:1.6,marginBottom:14}}>A beautifully patterned blue-tongue found in the cool, high-altitude regions of south-eastern Australia — Victoria, NSW highlands, South Australia, and Tasmania. Their bold dark blotches on a pale background make them one of the most visually striking blue-tongues. Adapted to cooler conditions, they are robust, hardy, and surprisingly active for a cool-climate species.</p>
        <SectionLabel mt={0}>Quick stats</SectionLabel>
        <StatGrid stats={[["📏","Adult size","40–55 cm"],["⏳","Lifespan","15–20+ yrs"],["🏠","Min. enclosure","120 × 60 cm"],["💧","Humidity","40–60%"]]} />
        <WarnBox type="blue" title="Cool climate species — lower temperatures required">Blotched Blue-tongues are from alpine and sub-alpine environments. They require significantly cooler temperatures than other blue-tongue subspecies. Overheating is a serious risk — never allow temperatures to exceed 35°C.</WarnBox>
        <SectionLabel>Temperature requirements</SectionLabel>
        <TempBar label="Basking spot" value="32–35°C" width="72%" color="#e05a2b"/>
        <TempBar label="Warm side" value="24–28°C" width="50%" color="#e0922b"/>
        <TempBar label="Cool side" value="18–22°C" width="28%" color="#4a9e6b"/>
        <TempBar label="Overnight low" value="10–15°C" width="15%" color="#2b7ec0"/>
        <SectionLabel>Enclosure setup</SectionLabel>
        <div style={{background:C.cream,borderRadius:12,padding:"12px 14px",border:"0.5px solid #e8e8e4",fontSize:13,color:"#666",lineHeight:1.7}}>A 120×60cm enclosure for one adult. Ground-dwelling — prioritise floor space. Coconut coir, soil mix, or reptile carpet. Multiple hides at warm and cool ends. A robust basking spot but a large cool retreat. They naturally experience very cold winters and brumation is natural and healthy — allow temperatures to drop in winter. UVB lighting recommended.</div>
        <WarnBox type="gold" title="Brumation is natural">Blotched Blue-tongues naturally brumate (hibernate) during winter. Allow temperatures to cool down in autumn — they will reduce feeding and become less active. This is completely normal and important for their long-term health.</WarnBox>
        <ShopBtn>🛒 Shop Blue-tongue supplies</ShopBtn>
        <ShopBtn secondary>Ask a question ↗</ShopBtn>
      </>}
      {tab === "feeding" && <>
        <p style={{fontSize:13,color:"#666",lineHeight:1.6,marginBottom:12}}>Omnivores. Same broad diet as other blue-tongues, though they may have reduced appetite in cooler months — this is normal. Do not force-feed during winter slowdown.</p>
        <div style={{background:C.cream,borderRadius:12,border:"0.5px solid #e8e8e4",padding:"0 14px"}}>
          <FoodItem icon="🍗" name="Lean chicken / turkey mince" detail="Low fat protein staple" freq="2–3× week"/>
          <FoodItem icon="🥚" name="Boiled or scrambled egg" detail="Excellent protein source" freq="1× week"/>
          <FoodItem icon="🐌" name="Snails / wood roaches (Woodies)" detail="Natural prey items" freq="Occasional"/>
          <FoodItem icon="🥬" name="Leafy greens" detail="Collard greens, endive, bok choy" freq="Daily"/>
          <FoodItem icon="🥕" name="Root vegetables" detail="Carrot, pumpkin, sweet potato" freq="Several× week"/>
        </div>
        <WarnBox type="blue" title="Reduced feeding in winter is normal">Blotched Blue-tongues naturally eat less or stop eating entirely during cooler months. Do not be alarmed — maintain access to fresh water and allow them to follow their natural seasonal cycle.</WarnBox>
        <ShopBtn>🛒 Shop supplements & feeders</ShopBtn>
      </>}
      {tab === "health & shedding" && <>
        <SectionLabel mt={0}>Common health issues</SectionLabel>
        <HealthItem title="Overheating" detail="The most serious risk for this cool-climate species. Never allow temperatures to exceed 35°C anywhere in the enclosure. Always provide a large, cool retreat area."/>
        <HealthItem title="Respiratory infection" detail="Paradoxically, despite being a cool-climate species, sudden temperature drops or cold draughts can cause respiratory issues. Gradual seasonal cooling is fine; abrupt cold spells are not."/>
        <HealthItem title="Obesity" detail="They have hearty appetites but their slower cool-climate metabolism means they need less food than tropical blue-tongue subspecies. Feed conservatively."/>
        <HealthItem dot="#4a9e6b" title="Signs of good health" detail="Active during warmer parts of the day, alert tongue-flicking, regular feeding, smooth complete sheds, clear eyes, brumation in winter."/>
        <SnakeShedding animal="lizard"/>
      </>}
      {tab === "handling" && <>
        <div style={{background:C.greenPale,borderRadius:12,padding:"12px 14px",marginBottom:12,border:`0.5px solid ${C.green}22`}}>
          <div style={{fontSize:12,fontWeight:700,color:C.green,marginBottom:6}}>BITE RISK — LOW</div>
          <div style={{fontSize:13,color:"#555",lineHeight:1.6}}>Blotched Blue-tongues are generally calm and handleable, similar in temperament to Eastern Blue-tongues. Their cool-climate origin means they may be slower and less active than northern subspecies — they are often very easy to handle as a result. Regular gentle handling from a young age produces very tame adults.</div>
        </div>
        <div style={{background:C.cream,borderRadius:12,padding:"12px 14px",border:"0.5px solid #e8e8e4",fontSize:13,color:"#666",lineHeight:1.7}}>Support the full body. Allow 2 weeks to settle before regular handling. Do not handle during brumation — they need rest during this period. Handle during the warmest part of the day when they are most active.</div>
      </>}
      {tab === "licencing" && <LegalTab note="Can be kept in NSW, VIC, QLD, SA, TAS, ACT and NT. Not permitted in WA. No licence or permit needed in VIC if captive-bred and lawfully sourced. Licence names are each authority's own; checked November 2026." states={[{ abbr: "NSW", cat: "Companion or Class 1 licence", ok: true }, { abbr: "VIC", cat: "No licence needed", ok: true }, { abbr: "QLD", cat: "Standard licence", ok: true }, { abbr: "SA", cat: "Basic permit (one animal permit-free)", ok: true }, { abbr: "WA", cat: "Not permitted", ok: false }, { abbr: "TAS", cat: "Herpetofauna permit", ok: true }, { abbr: "ACT", cat: "Keeper licence (case by case)", ok: true }, { abbr: "NT", cat: "Import + keep permit (case by case)", ok: true }]} />}
    </>}
  />
);

export default BlotchedBlueTonguePage;
