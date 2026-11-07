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

// ─── Thick-tailed Gecko page ──────────────────────────────────────
const ThickTailedGeckoPage = ({ onBack }) => (
  <SpeciesPage onBack={onBack} name="Thick-tailed Gecko" latin="Underwoodisaurus milii" emoji="🦎"
    badges={[["Beginner friendly", C.greenPale, C.green], ["Australian native", C.bluePale, C.blue], ["Nocturnal", C.goldLight, "#7a5a1e"]]}
    tabs={["overview","feeding","health & shedding","handling","licencing"]}
    tabContent={(tab) => <>
      {tab === "overview" && <>
        <p style={{fontSize:13,color:"#666",lineHeight:1.6,marginBottom:14}}>Also known as the Barking Gecko — named for the loud barking vocalisations they produce when threatened. A robust, hardy gecko found across much of southern Australia. Their striking yellow and black banded pattern and manageable temperament make them an excellent beginner gecko. More forgiving of handling than Knob-tailed Geckos.</p>
        <SectionLabel mt={0}>Quick stats</SectionLabel>
        <StatGrid stats={[["📏","Adult size","14–20 cm"],["⏳","Lifespan","15–20 yrs"],["🏠","Min. enclosure","60 × 45 cm"],["💧","Humidity","30–45%"]]} />
        <SectionLabel>Temperature requirements</SectionLabel>
        <TempBar label="Warm side" value="28–32°C" width="66%" color="#e05a2b"/>
        <TempBar label="Cool side" value="20–24°C" width="36%" color="#4a9e6b"/>
        <TempBar label="Overnight low" value="15–18°C" width="20%" color="#2b7ec0"/>
        <WarnBox type="blue" title="Cool overnight temps important">Thick-tailed Geckos naturally experience significant temperature drops at night. This thermal cycling is important for their health and natural behaviour. Do not maintain constant warm temperatures overnight.</WarnBox>
        <SectionLabel>Enclosure setup</SectionLabel>
        <div style={{background:C.cream,borderRadius:12,padding:"12px 14px",border:"0.5px solid #e8e8e4",fontSize:13,color:"#666",lineHeight:1.7}}>A 60×45cm enclosure works well for one adult. Low, wide footprint preferred. Cork bark hides at both warm and cool ends. Rocky substrate or red clay mix. A moist hide for shedding. Small water bowl. Under-tank heat mat on one side, thermostat controlled. They can vocalise loudly at night — an endearing trait!</div>
        <ShopBtn>🛒 Shop Thick-tailed Gecko supplies</ShopBtn>
        <ShopBtn secondary>Ask a question ↗</ShopBtn>
      </>}
      {tab === "feeding" && <>
        <p style={{fontSize:13,color:"#666",lineHeight:1.6,marginBottom:12}}>Insectivores. Feed a variety of live insects, always gut-loaded and supplemented. Feed at night when naturally active.</p>
        <div style={{background:C.cream,borderRadius:12,border:"0.5px solid #e8e8e4",padding:"0 14px"}}>
          <FoodItem icon="🦗" name="Crickets" detail="Staple feeder — gut load well" freq="Every 2–3 nights"/>
          <FoodItem icon="🦟" name="Wood roaches (Woodies)" detail="Excellent nutrition" freq="Every 2–3 nights"/>
          <FoodItem icon="🪲" name="Mealworms" detail="Moderate fat — good supplement" freq="Weekly"/>
        </div>
        <WarnBox type="gold" title="Calcium dust every feed">Dust all insects with calcium + D3 at every feeding for juveniles, every other feeding for adults. Essential for long-term bone health.</WarnBox>
        <ShopBtn>🛒 Shop feeders & supplements</ShopBtn>
      </>}
      {tab === "health & shedding" && <>
        <SectionLabel mt={0}>Common health issues</SectionLabel>
        <HealthItem title="Retained shed" detail="A moist hide prevents most shed issues. Check toes carefully after each shed — retained shed on toes can constrict circulation."/>
        <HealthItem title="Tail loss" detail="Can drop their tail when very stressed. Unlike the Knob-tail, the Thick-tail's regrown tail looks reasonably similar to the original."/>
        <HealthItem title="Overheating" detail="They prefer cooler conditions. Never allow temperatures to exceed 33°C anywhere in the enclosure."/>
        <HealthItem dot="#4a9e6b" title="Signs of good health" detail="Plump tail, active at night, vocalising (normal!), feeding well, clean bright pattern."/>
        <SnakeShedding animal="gecko" />
      </>}
      {tab === "handling" && <>
        <div style={{background:C.greenPale,borderRadius:12,padding:"12px 14px",marginBottom:12,border:`0.5px solid ${C.green}22`}}>
          <div style={{fontSize:12,fontWeight:700,color:C.green,marginBottom:6}}>BITE RISK — LOW</div>
          <div style={{fontSize:13,color:"#555",lineHeight:1.6}}>Thick-tailed Geckos are calmer and more handleable than Knob-tailed Geckos. They may vocalise when first picked up — this is normal and not a sign of serious distress. With regular gentle handling they become quite tame. A good gecko for someone wanting to handle their pet regularly.</div>
        </div>
        <div style={{background:C.cream,borderRadius:12,padding:"12px 14px",border:"0.5px solid #e8e8e4",fontSize:13,color:"#666",lineHeight:1.7}}>Handle at night when active. Support the full body. Start with short 5–10 minute sessions. Their vocalisation (a soft barking sound) is part of their charm — enjoy it! Never grab the tail.</div>
      </>}
      {tab === "licencing" && <LegalTab note="Thick-tailed Geckos are widely available from licensed breeders across Australia." states={[{ abbr: "NSW", cat: "Standard keeper licence", ok: true }, { abbr: "VIC", cat: "Basic wildlife licence", ok: true }, { abbr: "QLD", cat: "Standard keeper licence", ok: true }, { abbr: "SA", cat: "Basic permit", ok: true }, { abbr: "WA", cat: "Standard licence", ok: true }, { abbr: "TAS", cat: "TAS natives only", ok: false }, { abbr: "ACT", cat: "Standard licence", ok: true }, { abbr: "NT", cat: "Check with authority", ok: true }]} />}
    </>}
  />
);

export default ThickTailedGeckoPage;
