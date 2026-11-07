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

// ─── Shingleback Lizard page ──────────────────────────────────────
const ShinglebackPage = ({ onBack }) => (
  <SpeciesPage onBack={onBack} name="Shingleback Lizard" latin="Tiliqua rugosa" emoji="🦎"
    badges={[["Intermediate", C.goldLight, "#7a5a1e"], ["Australian native", C.bluePale, C.blue], ["Monogamous", C.greenPale, C.green]]}
    tabs={["overview","feeding","health & shedding","handling","licencing"]}
    tabContent={(tab) => <>
      {tab === "overview" && <>
        <p style={{fontSize:13,color:"#666",lineHeight:1.6,marginBottom:14}}>One of Australia's most unique and beloved reptiles. Also known as the Bobtail, Stumpy-tail, Pinecone Lizard, and Two-headed Skink (their fat tail resembles their head as a defensive adaptation). Found across southern Australia from WA through SA to NSW. Famous for forming lifelong monogamous pair bonds — the same two individuals reunite each breeding season for decades. An extraordinary animal with genuine personality.</p>
        <WarnBox type="gold" title="Monogamous pair bonds">Shinglebacks are one of very few reptiles known to form long-term monogamous pair bonds. Partners return to each other year after year and have been documented together for over 20 years. If keeping a pair, they should stay together for life.</WarnBox>
        <SectionLabel mt={0}>Quick stats</SectionLabel>
        <StatGrid stats={[["📏","Adult size","30–45 cm"],["⏳","Lifespan","20–50+ yrs"],["🏠","Min. enclosure","120 × 60 cm"],["💧","Humidity","30–45%"]]} />
        <SectionLabel>Temperature requirements</SectionLabel>
        <TempBar label="Basking spot" value="35–40°C" width="84%" color="#e05a2b"/>
        <TempBar label="Warm side" value="26–30°C" width="58%" color="#e0922b"/>
        <TempBar label="Cool side" value="18–22°C" width="28%" color="#4a9e6b"/>
        <TempBar label="Overnight low" value="10–15°C" width="15%" color="#2b7ec0"/>
        <WarnBox type="blue" title="Brumation is natural and important">Shinglebacks naturally brumate in winter. This seasonal cycling is essential for their long-term health and reproductive success. Allow temperatures to cool and do not disturb during brumation periods.</WarnBox>
        <SectionLabel>Enclosure setup</SectionLabel>
        <div style={{background:C.cream,borderRadius:12,padding:"12px 14px",border:"0.5px solid #e8e8e4",fontSize:13,color:"#666",lineHeight:1.7}}>A 120×60cm enclosure minimum. Ground-dwelling — prioritise floor space. Sandy or rocky substrate to match their natural arid habitat. Multiple flat rock hides and bark pieces for shelter. Robust basking rock or branch directly under a heat lamp. UVB tube strongly recommended. A shallow water bowl — they drink regularly. Many keepers of Shinglebacks maintain outdoor enclosures in warmer months.</div>
        <ShopBtn>🛒 Shop lizard supplies</ShopBtn>
        <ShopBtn secondary>Ask a question ↗</ShopBtn>
      </>}
      {tab === "feeding" && <>
        <p style={{fontSize:13,color:"#666",lineHeight:1.6,marginBottom:12}}>Omnivores with a diet heavier in plant material than other blue-tongues. They naturally consume a wide variety of fruits, flowers, and vegetation alongside invertebrates. Variety is key.</p>
        <div style={{background:C.cream,borderRadius:12,border:"0.5px solid #e8e8e4",padding:"0 14px"}}>
          <FoodItem icon="🥬" name="Leafy greens & flowers" detail="Dandelion flowers, clover, leafy greens — they love flowers" freq="Daily"/>
          <FoodItem icon="🍓" name="Fruit" detail="Strawberries, apple, pear — more fruit than other blue-tongues" freq="Several× week"/>
          <FoodItem icon="🥕" name="Root vegetables" detail="Carrot, pumpkin, sweet potato" freq="Several× week"/>
          <FoodItem icon="🐌" name="Snails" detail="A natural favourite — shell provides calcium" freq="Weekly"/>
          <FoodItem icon="🍗" name="Lean chicken mince" detail="Small amounts of protein" freq="1–2× week"/>
          <FoodItem icon="🪱" name="Earthworms" detail="Natural prey — good calcium source" freq="Weekly"/>
        </div>
        <WarnBox type="gold" title="More plant-based than other blue-tongues">In the wild, Shinglebacks eat a diet that is predominantly plant material including flowers, fruits, and berries. Offer a wider variety of fruits and flowers than you would for Eastern or Northern Blue-tongues.</WarnBox>
        <WarnBox type="red" title="Avoid high-protein diets">Excessive animal protein causes kidney disease in Shinglebacks over time. Keep protein portions small and infrequent compared to their plant-based diet.</WarnBox>
        <ShopBtn>🛒 Shop supplements</ShopBtn>
      </>}
      {tab === "health & shedding" && <>
        <SectionLabel mt={0}>Common health issues</SectionLabel>
        <HealthItem title="Kidney disease" detail="Often caused by excessive dietary protein over many years. Feed a predominantly plant-based diet with small amounts of protein. Annual vet checks recommended for long-term health monitoring."/>
        <HealthItem title="Tick infestation" detail="Wild-caught Shinglebacks often carry ticks. Inspect any newly acquired animal thoroughly. Never collect from the wild."/>
        <HealthItem title="Respiratory infection" detail="From temperature extremes or sudden cold snaps. Maintain stable temperatures and allow gradual seasonal cooling."/>
        <HealthItem title="Metabolic Bone Disease" detail="From insufficient calcium or UVB. Dust food with calcium powder and provide UVB lighting."/>
        <HealthItem dot="#4a9e6b" title="Signs of good health" detail="Alert and active on warm days, regular feeding, complete sheds, clear bright eyes, firm body condition, active tongue-flicking, natural brumation in winter."/>
        <SectionLabel>Shedding</SectionLabel>
        <div style={{background:C.cream,borderRadius:12,padding:"12px 14px",border:"0.5px solid #e8e8e4",fontSize:13,color:"#666",lineHeight:1.7}}>Shinglebacks shed in large pieces rather than one complete shed like snakes. Their thick, rough scales mean shedding is less uniform. This is normal. Increase humidity slightly during shedding periods and provide rough surfaces to assist.</div>
      </>}
      {tab === "handling" && <>
        <div style={{background:C.greenPale,borderRadius:12,padding:"12px 14px",marginBottom:12,border:`0.5px solid ${C.green}22`}}>
          <div style={{fontSize:12,fontWeight:700,color:C.green,marginBottom:6}}>BITE RISK — LOW TO MEDIUM</div>
          <div style={{fontSize:13,color:"#555",lineHeight:1.6}}>Shinglebacks are generally calm but can be defensive when first encountered — they will open their vivid blue mouth wide and hiss as a threat display. This is bluffing behaviour. With regular gentle handling they become extremely tame and many develop genuine recognition of their keeper. Long-lived animals that build real bonds over time.</div>
        </div>
        <div style={{background:C.cream,borderRadius:12,padding:"12px 14px",border:"0.5px solid #e8e8e4",fontSize:13,color:"#666",lineHeight:1.7}}>Support the full body — their heavy build means they need full support. Their slow movement makes them easy to handle. Allow 2–3 weeks to settle before regular handling. Do not handle during brumation. Their blue tongue and gaping mouth display is impressive — enjoy it as part of their character.</div>
        <WarnBox type="gold" title="Long-term relationships">Shinglebacks kept for many years often become remarkably tame and will recognise their keeper. Their exceptional lifespan (20–50+ years) means a Shingleback you acquire today could be with you for the rest of your life.</WarnBox>
      </>}
      {tab === "licencing" && <LegalTab note="Can be kept in NSW, VIC, QLD, SA, WA, ACT and NT. Not permitted in TAS. No licence or permit needed in SA if captive-bred and lawfully sourced. Licence names are each authority's own; checked November 2026." states={[{ abbr: "NSW", cat: "Companion or Class 1 licence", ok: true }, { abbr: "VIC", cat: "Basic licence", ok: true }, { abbr: "QLD", cat: "Standard licence", ok: true }, { abbr: "SA", cat: "No permit needed", ok: true }, { abbr: "WA", cat: "Pet keeper's licence", ok: true }, { abbr: "TAS", cat: "Not permitted (TAS natives only)", ok: false }, { abbr: "ACT", cat: "Keeper licence (case by case)", ok: true }, { abbr: "NT", cat: "Import + keep permit (case by case)", ok: true }]} />}
    </>}
  />
);

export default ShinglebackPage;
