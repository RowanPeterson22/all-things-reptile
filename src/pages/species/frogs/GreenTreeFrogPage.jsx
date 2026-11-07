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

// ─── Green Tree Frog page ─────────────────────────────────────────
const GreenTreeFrogPage = ({ onBack }) => (
  <SpeciesPage onBack={onBack} name="Green Tree Frog" latin="Litoria caerulea" emoji="🐸"
    badges={[["Beginner friendly", C.greenPale, C.green], ["Australian native", C.bluePale, C.blue], ["Nocturnal", C.goldLight, "#7a5a1e"]]}
    tabs={["overview","feeding","health & shedding","handling","licencing"]}
    tabContent={(tab) => <>
      {tab === "overview" && <>
        <p style={{fontSize:13,color:"#666",lineHeight:1.6,marginBottom:14}}>Australia's most iconic frog and one of the most popular amphibian pets in the world. Found across northern and eastern Australia in tropical and subtropical regions. Their bright green colouration, large toe pads, and gentle temperament make them irresistible. Hardy, long-lived, and forgiving of beginner mistakes — an excellent first frog.</p>
        <SectionLabel mt={0}>Quick stats</SectionLabel>
        <StatGrid stats={[["📏","Adult size","6–11 cm"],["⏳","Lifespan","15–20+ yrs"],["🏠","Min. enclosure","45 × 45 × 60 cm"],["💧","Humidity","50–70%"]]} />
        <SectionLabel>Temperature requirements</SectionLabel>
        <TempBar label="Daytime ambient" value="24–28°C" width="52%" color="#e05a2b"/>
        <TempBar label="Nighttime low" value="18–22°C" width="30%" color="#2b7ec0"/>
        <WarnBox type="red" title="No chlorine or chloramine in water">Frogs absorb water through their skin. Tap water must be dechlorinated before use — either let it sit for 24 hours or use a reptile-safe dechlorinator. Never use tap water directly.</WarnBox>
        <SectionLabel>Enclosure setup</SectionLabel>
        <div style={{background:C.cream,borderRadius:12,padding:"12px 14px",border:"0.5px solid #e8e8e4",fontSize:13,color:"#666",lineHeight:1.7}}>A tall glass or PVC enclosure — height is important as they are semi-arboreal. Coconut coir or bioactive substrate. Live or artificial plants for cover and climbing. A large shallow water bowl they can fully submerge in. Cork bark and branches for perching. Mist one side of the enclosure every evening. Ventilation is critical — avoid stagnant air.</div>
        <ShopBtn>🛒 Shop frog supplies</ShopBtn>
        <ShopBtn secondary>Ask a question ↗</ShopBtn>
      </>}
      {tab === "feeding" && <>
        <p style={{fontSize:13,color:"#666",lineHeight:1.6,marginBottom:12}}>Insectivorous — enthusiastic and sometimes greedy feeders. Feed at night when naturally active. Obesity is a common problem — resist the urge to overfeed.</p>
        <div style={{background:C.cream,borderRadius:12,border:"0.5px solid #e8e8e4",padding:"0 14px"}}>
          <FoodItem icon="🦗" name="Crickets" detail="Staple feeder — gut load well" freq="Every 2–3 nights"/>
          <FoodItem icon="🦟" name="Wood Roaches (Woodies)" detail="Excellent Australian feeder" freq="Every 2–3 nights"/>
          <FoodItem icon="🐛" name="Silkworms" detail="High moisture — great for hydration" freq="Occasionally"/>
          <FoodItem icon="🪲" name="Mealworms" detail="Treat only — high fat" freq="Occasionally"/>
        </div>
        <WarnBox type="red" title="Obesity is very common">Green Tree Frogs will eat as much as offered. Adults should be fed 3–4 appropriately sized insects every 2–3 nights — not every night. An obese frog develops fat deposits over the eyes ("fat pads") and has a significantly reduced lifespan.</WarnBox>
        <WarnBox type="gold" title="Prey sizing">Prey should be no larger than the width of the frog's head. Large prey causes choking and regurgitation.</WarnBox>
        <ShopBtn>🛒 Shop feeders & supplements</ShopBtn>
      </>}
      {tab === "health & shedding" && <>
        <SectionLabel mt={0}>Common health issues</SectionLabel>
        <HealthItem title="Chytridiomycosis (Chytrid fungus)" detail="A devastating amphibian disease caused by the fungus Batrachochytrium dendrobatidis. Symptoms include lethargy, skin shedding, and loss of righting reflex. Strict hygiene between enclosures. Never release captive frogs into the wild."/>
        <HealthItem title="Red Leg Syndrome" detail="Bacterial infection causing reddening of the legs and abdomen. Usually caused by poor water quality or stress. Requires veterinary treatment with antibiotics."/>
        <HealthItem title="Obesity" detail="Extremely common. Fat deposits visible over the eyes indicate an obese frog. Reduce feeding frequency and prey size immediately."/>
        <HealthItem title="Toxic out syndrome" detail="Caused by contact with cleaning products, insecticides, or other chemicals. Frogs absorb through skin — keep all chemicals away from the enclosure and always wash hands before handling."/>
        <HealthItem dot="#4a9e6b" title="Signs of good health" detail="Bright green colouration, active at night, feeding well, moist skin, strong grip on surfaces, regular shedding."/>
        <SectionLabel>Shedding</SectionLabel>
        <div style={{background:C.cream,borderRadius:12,padding:"12px 14px",border:"0.5px solid #e8e8e4",fontSize:13,color:"#666",lineHeight:1.7}}>Green Tree Frogs shed their skin regularly — every 1–2 weeks. They typically eat the shed skin immediately, which is normal. A frog that appears dull or is rubbing against surfaces is likely about to shed. Ensure adequate humidity during shedding.</div>
      </>}
      {tab === "handling" && <>
        <div style={{background:C.goldLight,borderRadius:12,padding:"12px 14px",marginBottom:12,border:`0.5px solid #c8963c44`}}>
          <div style={{fontSize:12,fontWeight:700,color:"#7a5a1e",marginBottom:6}}>HANDLING — KEEP MINIMAL & HANDS CLEAN</div>
          <div style={{fontSize:13,color:"#555",lineHeight:1.6}}>Green Tree Frogs tolerate handling better than most frogs but handling should still be kept to a minimum. Their skin is permeable — chemicals, oils, and salt from hands can cause irritation or toxicity. Always wet hands with dechlorinated water before handling.</div>
        </div>
        <div style={{background:C.cream,borderRadius:12,padding:"12px 14px",border:"0.5px solid #e8e8e4",fontSize:13,color:"#666",lineHeight:1.7}}>Always wash hands thoroughly and rinse with dechlorinated water before handling. Never handle after using hand cream, insect repellent, or cleaning products. Keep sessions brief. Their large toe pads allow them to cling to surfaces — never pull them off forcefully.</div>
      </>}
      {tab === "licencing" && <LegalTab note="Green Tree Frogs require a standard keeper licence in most states. One of the most commonly kept frogs in Australia. Must be purchased from a licensed breeder — never collected from the wild." states={[{ abbr: "NSW", cat: "Standard licence", ok: true }, { abbr: "VIC", cat: "Standard licence", ok: true }, { abbr: "QLD", cat: "Standard licence", ok: true }, { abbr: "SA", cat: "Standard licence", ok: true }, { abbr: "WA", cat: "Standard licence", ok: true }, { abbr: "TAS", cat: "TAS natives only", ok: false }, { abbr: "ACT", cat: "Standard licence", ok: true }, { abbr: "NT", cat: "Check with authority", ok: true }]} />}
    </>}
  />
);

export default GreenTreeFrogPage;
