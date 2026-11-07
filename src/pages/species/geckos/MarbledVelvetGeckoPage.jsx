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

// ─── Marbled Velvet Gecko page ────────────────────────────────────
const MarbledVelvetGeckoPage = ({ onBack }) => (
  <SpeciesPage onBack={onBack} name="Marbled Velvet Gecko" latin="Oedura marmorata" emoji="🦎"
    badges={[["Beginner friendly", C.greenPale, C.green], ["Australian native", C.bluePale, C.blue], ["Nocturnal", C.goldLight, "#7a5a1e"]]}
    tabs={["overview","feeding","health & shedding","handling","licencing"]}
    tabContent={(tab) => <>
      {tab === "overview" && <>
        <p style={{fontSize:13,color:"#666",lineHeight:1.6,marginBottom:14}}>A beautifully patterned gecko found across inland Australia. Their marbled purple-grey and cream pattern is stunning and varies between individuals. Hardy, long-lived, and relatively easy to care for — an excellent choice for gecko enthusiasts looking for a uniquely Australian species. Semi-arboreal, enjoying both ground hides and climbing.</p>
        <SectionLabel mt={0}>Quick stats</SectionLabel>
        <StatGrid stats={[["📏","Adult size","12–17 cm"],["⏳","Lifespan","15–20 yrs"],["🏠","Min. enclosure","60 × 45 cm"],["💧","Humidity","30–45%"]]} />
        <SectionLabel>Temperature requirements</SectionLabel>
        <TempBar label="Warm side" value="28–32°C" width="66%" color="#e05a2b"/>
        <TempBar label="Cool side" value="20–24°C" width="36%" color="#4a9e6b"/>
        <TempBar label="Overnight low" value="15–18°C" width="20%" color="#2b7ec0"/>
        <SectionLabel>Enclosure setup</SectionLabel>
        <div style={{background:C.cream,borderRadius:12,padding:"12px 14px",border:"0.5px solid #e8e8e4",fontSize:13,color:"#666",lineHeight:1.7}}>A 60×45cm enclosure with some height for climbing. Cork bark flats leaning against the wall and cork bark hides on the ground. Rocky substrate or reptile carpet. A moist hide. Small water bowl. Under-tank heat mat one side, thermostat controlled. They love to squeeze behind cork bark flats — mimic this in captivity.</div>
        <ShopBtn>🛒 Shop Marbled Velvet Gecko supplies</ShopBtn>
        <ShopBtn secondary>Ask a question ↗</ShopBtn>
      </>}
      {tab === "feeding" && <>
        <p style={{fontSize:13,color:"#666",lineHeight:1.6,marginBottom:12}}>Insectivores. Feed at night when naturally active. Variety of insects gut-loaded and dusted with supplements.</p>
        <div style={{background:C.cream,borderRadius:12,border:"0.5px solid #e8e8e4",padding:"0 14px"}}>
          <FoodItem icon="🦗" name="Crickets" detail="Staple — appropriate size" freq="Every 2–3 nights"/>
          <FoodItem icon="🦟" name="Wood roaches (Woodies)" detail="Excellent nutrition" freq="Every 2–3 nights"/>
          <FoodItem icon="🪲" name="Mealworms" detail="Treat — moderate fat" freq="Weekly"/>
        </div>
        <WarnBox type="gold" title="Dust every feed">Calcium with D3 at every feed for juveniles, every other feed for adults. These geckos are long-lived — consistent supplementation pays off over their lifetime.</WarnBox>
        <ShopBtn>🛒 Shop feeders & supplements</ShopBtn>
      </>}
      {tab === "health & shedding" && <>
        <SectionLabel mt={0}>Common health issues</SectionLabel>
        <HealthItem title="Retained shed" detail="Moist hide prevents most issues. Check between toes and around eyes after shedding."/>
        <HealthItem title="Tail loss" detail="Can drop tail under severe stress. Regrows but imperfectly. Minimise stress during handling."/>
        <HealthItem dot="#4a9e6b" title="Signs of good health" detail="Active at night, beautiful marbled pattern, plump tail base, feeding well, clean eyes."/>
        <SnakeShedding animal="gecko" />
      </>}
      {tab === "handling" && <>
        <div style={{background:C.greenPale,borderRadius:12,padding:"12px 14px",marginBottom:12,border:`0.5px solid ${C.green}22`}}>
          <div style={{fontSize:12,fontWeight:700,color:C.green,marginBottom:6}}>BITE RISK — LOW</div>
          <div style={{fontSize:13,color:"#555",lineHeight:1.6}}>Marbled Velvet Geckos are calm and handleable for their size. Faster than Knob-tailed Geckos but manageable with gentle consistent handling. Handle at night when active for best results.</div>
        </div>
        <div style={{background:C.cream,borderRadius:12,padding:"12px 14px",border:"0.5px solid #e8e8e4",fontSize:13,color:"#666",lineHeight:1.7}}>Support full body. Short sessions initially. They are more confident in low light — dim the room for handling sessions. Never grab the tail.</div>
      </>}
      {tab === "licencing" && <LegalTab note="Marbled Velvet Geckos are available from licensed breeders across Australia." states={[{ abbr: "NSW", cat: "Standard keeper licence", ok: true }, { abbr: "VIC", cat: "Basic wildlife licence", ok: true }, { abbr: "QLD", cat: "Standard keeper licence", ok: true }, { abbr: "SA", cat: "Basic permit", ok: true }, { abbr: "WA", cat: "Standard licence", ok: true }, { abbr: "TAS", cat: "TAS natives only", ok: false }, { abbr: "ACT", cat: "Standard licence", ok: true }, { abbr: "NT", cat: "Check with authority", ok: true }]} />}
    </>}
  />
);

export default MarbledVelvetGeckoPage;
