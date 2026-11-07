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

// ─── Golden-tailed Gecko page ─────────────────────────────────────
const GoldenTailGeckoPage = ({ onBack }) => (
  <SpeciesPage onBack={onBack} name="Golden-tailed Gecko" latin="Strophurus taenicauda" emoji="🦎"
    badges={[["Beginner friendly", C.greenPale, C.green], ["Australian native", C.bluePale, C.blue], ["Arboreal", C.goldLight, "#7a5a1e"]]}
    tabs={["overview","feeding","health & shedding","handling","licencing"]}
    tabContent={(tab) => <>
      {tab === "overview" && <>
        <p style={{fontSize:13,color:"#666",lineHeight:1.6,marginBottom:14}}>One of Australia's most beautiful geckos — their striking golden-orange tail with black markings is instantly recognisable and makes them highly sought after in the hobby. Found in dry woodlands and brigalow scrub of southern Queensland. Like all Strophurus, they possess the remarkable ability to squirt a defensive fluid from their tail. Arboreal, nocturnal, and endlessly fascinating to observe.</p>
        <SectionLabel mt={0}>Quick stats</SectionLabel>
        <StatGrid stats={[["📏","Adult size","10–12 cm"],["⏳","Lifespan","8–12 yrs"],["🏠","Min. enclosure","45 × 45 × 45 cm"],["💧","Humidity","30–45%"]]} />
        <WarnBox type="gold" title="State restrictions apply">Golden-tailed Geckos require an Advanced (Schedule 3) licence in Victoria, and a restricted licence in Queensland. Always verify your state requirements before purchasing.</WarnBox>
        <SectionLabel>Temperature requirements</SectionLabel>
        <TempBar label="Warm side" value="26–30°C" width="58%" color="#e05a2b"/>
        <TempBar label="Cool side" value="20–24°C" width="36%" color="#4a9e6b"/>
        <TempBar label="Overnight low" value="18–20°C" width="26%" color="#2b7ec0"/>
        <SectionLabel>Enclosure setup</SectionLabel>
        <div style={{background:C.cream,borderRadius:12,padding:"12px 14px",border:"0.5px solid #e8e8e4",fontSize:13,color:"#666",lineHeight:1.7}}>A 45×45×45cm or taller enclosure works well for 1–3 animals (one male with females). Fine sand substrate. A network of thin climbing branches — they are highly arboreal and sleep on exposed branches during the day, relying on camouflage. Low UVB lighting beneficial. Mist the enclosure 1–2 times per week — they drink from droplets. Provide a small moist hide or egg-laying container for breeding females.</div>
        <ShopBtn>🛒 Shop gecko supplies</ShopBtn>
        <ShopBtn secondary>Ask a question ↗</ShopBtn>
      </>}
      {tab === "feeding" && <>
        <p style={{fontSize:13,color:"#666",lineHeight:1.6,marginBottom:12}}>Insectivorous. Despite their small size they have impressive appetites and will take surprisingly large prey. Feed at night when naturally active.</p>
        <div style={{background:C.cream,borderRadius:12,border:"0.5px solid #e8e8e4",padding:"0 14px"}}>
          <FoodItem icon="🦗" name="Crickets" detail="Staple feeder — gut load well" freq="Every 2–3 nights"/>
          <FoodItem icon="🦟" name="Woodies" detail="Excellent Australian feeder" freq="Every 2–3 nights"/>
          <FoodItem icon="🪲" name="Small mealworms" detail="Occasional treat" freq="Weekly"/>
          <FoodItem icon="🐛" name="Waxworms" detail="High-fat treat — very sparingly" freq="Occasionally"/>
        </div>
        <WarnBox type="gold" title="Productive breeders — feed females well">Breeding females are prolific egg-layers, producing 4–6+ clutches per season. Gravid and breeding females need increased calcium supplementation and more frequent feeding to maintain body condition.</WarnBox>
        <ShopBtn>🛒 Shop feeders & supplements</ShopBtn>
      </>}
      {tab === "health & shedding" && <>
        <SectionLabel mt={0}>Common health issues</SectionLabel>
        <HealthItem title="Egg binding" detail="Breeding females can become egg-bound if not provided a suitable laying site or if calcium deficient. Always provide a small container of moist substrate for egg laying."/>
        <HealthItem title="Male aggression" detail="Males are territorial — never house two males together. One male can be kept with 2–4 females successfully."/>
        <HealthItem title="Respiratory infection" detail="From excessive humidity or poor ventilation. Keep humidity moderate and ensure good airflow."/>
        <HealthItem dot="#4a9e6b" title="Signs of good health" detail="Vivid golden-orange tail colouration, active at night on branches, feeding readily, alert bright eyes, firm body condition."/>
        <SnakeShedding animal="gecko" />
      </>}
      {tab === "handling" && <>
        <div style={{background:C.greenPale,borderRadius:12,padding:"12px 14px",marginBottom:12,border:`0.5px solid ${C.green}22`}}>
          <div style={{fontSize:12,fontWeight:700,color:C.green,marginBottom:6}}>HANDLING — CALM BUT FRAGILE</div>
          <div style={{fontSize:13,color:"#555",lineHeight:1.6}}>Golden-tailed Geckos are calm and generally tolerate brief handling well. Their small size makes them delicate — handle carefully and always over a soft surface. Like all Strophurus, they can squirt defensive fluid from the tail if stressed. Handle gently and avoid sudden movements.</div>
        </div>
        <div style={{background:C.cream,borderRadius:12,padding:"12px 14px",border:"0.5px solid #e8e8e4",fontSize:13,color:"#666",lineHeight:1.7}}>Handle at night when active. Support the full body. Short sessions only. Their remarkable golden tail is their most striking feature — never grab by the tail. Wash hands before and after handling.</div>
        <WarnBox type="gold" title="Tail fluid warning">Like all Strophurus, can squirt foul-smelling defensive fluid from the tail if threatened. Avoid eye contact with the fluid and wash immediately if it makes contact.</WarnBox>
      </>}
      {tab === "licencing" && <LegalTab note="Golden-tailed Geckos require an Advanced (Schedule 3) licence in Victoria and a restricted licence in QLD." states={[{ abbr: "NSW", cat: "Standard keeper licence", ok: true }, { abbr: "VIC", cat: "Advanced licence", ok: true }, { abbr: "QLD", cat: "Restricted — check DES", ok: true }, { abbr: "SA", cat: "Basic permit", ok: true }, { abbr: "WA", cat: "Standard licence", ok: true }, { abbr: "TAS", cat: "TAS natives only", ok: false }, { abbr: "ACT", cat: "Standard licence", ok: true }, { abbr: "NT", cat: "Check with authority", ok: true }]} />}
    </>}
  />
);

export default GoldenTailGeckoPage;
