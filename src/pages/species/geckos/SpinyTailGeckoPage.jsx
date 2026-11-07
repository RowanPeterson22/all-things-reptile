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

// ─── Spiny-tailed Gecko page ──────────────────────────────────────
const SpinyTailGeckoPage = ({ onBack }) => (
  <SpeciesPage onBack={onBack} name="Northern Spiny-tailed Gecko" latin="Strophurus ciliaris" emoji="🦎"
    badges={[["Beginner friendly", C.greenPale, C.green], ["Australian native", C.bluePale, C.blue], ["Arboreal", C.goldLight, "#7a5a1e"]]}
    tabs={["overview","feeding","health & shedding","handling","licencing"]}
    tabContent={(tab) => <>
      {tab === "overview" && <>
        <p style={{fontSize:13,color:"#666",lineHeight:1.6,marginBottom:14}}>One of Australia's most spectacular geckos. Found across northern and central Australia in dry woodlands and spinifex grasslands. Their signature feature is a tail lined with prominent spines — and a remarkable defence mechanism: when threatened they can squirt a harmless but foul-smelling sticky fluid from glands in their tail. Arboreal and highly visible at night, making them fascinating display animals.</p>
        <SectionLabel mt={0}>Quick stats</SectionLabel>
        <StatGrid stats={[["📏","Adult size","12–16 cm"],["⏳","Lifespan","10–15 yrs"],["🏠","Min. enclosure","45 × 45 × 60 cm"],["💧","Humidity","30–50%"]]} />
        <WarnBox type="gold" title="Unique defence — tail fluid">Spiny-tailed Geckos can squirt a sticky, foul-smelling fluid from glands in their tail when threatened. This is harmless but can irritate eyes. Avoid sudden movements when handling and never approach them from directly above.</WarnBox>
        <SectionLabel>Temperature requirements</SectionLabel>
        <TempBar label="Warm side / basking" value="28–32°C" width="66%" color="#e05a2b"/>
        <TempBar label="Cool side" value="22–26°C" width="44%" color="#4a9e6b"/>
        <TempBar label="Overnight low" value="19–22°C" width="30%" color="#2b7ec0"/>
        <SectionLabel>Enclosure setup</SectionLabel>
        <div style={{background:C.cream,borderRadius:12,padding:"12px 14px",border:"0.5px solid #e8e8e4",fontSize:13,color:"#666",lineHeight:1.7}}>A tall enclosure with plenty of thin branches at varying heights — they are highly arboreal and spend most of their time on branches and twigs. Cork bark and textured back wall. Sandy substrate. Low UVB lighting recommended. Mist lightly 2–3 times per week — they prefer to drink from droplets rather than a bowl. Excellent ventilation is essential — avoid stagnant humid air.</div>
        <ShopBtn>🛒 Shop gecko supplies</ShopBtn>
        <ShopBtn secondary>Ask a question ↗</ShopBtn>
      </>}
      {tab === "feeding" && <>
        <p style={{fontSize:13,color:"#666",lineHeight:1.6,marginBottom:12}}>Insectivorous. Despite their slender build they have surprisingly large mouths and can take relatively large prey items. Feed at night when naturally active.</p>
        <div style={{background:C.cream,borderRadius:12,border:"0.5px solid #e8e8e4",padding:"0 14px"}}>
          <FoodItem icon="🦗" name="Crickets" detail="Staple feeder — gut load well" freq="Every 2–3 nights"/>
          <FoodItem icon="🦟" name="Woodies" detail="Excellent Australian feeder" freq="Every 2–3 nights"/>
          <FoodItem icon="🪲" name="Small mealworms" detail="Occasional treat" freq="Weekly"/>
          <FoodItem icon="🐛" name="Waxworms" detail="High-fat treat — very sparingly" freq="Occasionally"/>
        </div>
        <WarnBox type="gold" title="Feed 3–4 insects per session">These geckos have big appetites but overfeeding causes obesity. Offer 3–4 appropriately sized prey items every 2–3 nights for adults. Juveniles can be fed daily.</WarnBox>
        <ShopBtn>🛒 Shop feeders & supplements</ShopBtn>
      </>}
      {tab === "health & shedding" && <>
        <SectionLabel mt={0}>Common health issues</SectionLabel>
        <HealthItem title="Respiratory infection" detail="Caused by high humidity combined with poor ventilation. Keep humidity moderate and ensure excellent airflow. Signs include wheezing or mucus."/>
        <HealthItem title="Obesity" detail="Enthusiastic feeders that can overeat. Monitor body condition — a healthy gecko should have a firm, not swollen, body with no fat deposits behind the eyes."/>
        <HealthItem title="Egg binding (females)" detail="Gravid females need a suitable laying site — a container of moist sand or coconut coir with an access hole. If a female appears distended and restless, seek vet advice promptly."/>
        <HealthItem dot="#4a9e6b" title="Signs of good health" detail="Alert and active at night on branches, feeding readily, bright eyes, good body condition, clean spines on tail."/>
        <SnakeShedding animal="gecko" />
      </>}
      {tab === "handling" && <>
        <div style={{background:C.greenPale,borderRadius:12,padding:"12px 14px",marginBottom:12,border:`0.5px solid ${C.green}22`}}>
          <div style={{fontSize:12,fontWeight:700,color:C.green,marginBottom:6}}>HANDLING — LOW RISK BUT USE CAUTION</div>
          <div style={{fontSize:13,color:"#555",lineHeight:1.6}}>Northern Spiny-tailed Geckos are relatively calm but their primary defence (squirting tail fluid) can be activated by sudden movements or being grabbed from above. Handle gently and slowly, from below. Their small size means they are best enjoyed as display animals rather than handling pets.</div>
        </div>
        <div style={{background:C.cream,borderRadius:12,padding:"12px 14px",border:"0.5px solid #e8e8e4",fontSize:13,color:"#666",lineHeight:1.7}}>Handle at night when active. Support the full body. Avoid holding near the tail — this is where the defensive glands are located. If the gecko raises its tail in a curved position it is warning you. Short sessions only. Wash hands after handling.</div>
        <WarnBox type="gold" title="Tail fluid warning">If the gecko squirts fluid, avoid touching your eyes and wash the affected area immediately. The fluid is harmless but has an extremely unpleasant smell that can linger. Handle with care to avoid triggering this response.</WarnBox>
      </>}
      {tab === "licencing" && <LegalTab note="Can be kept in NSW, VIC, QLD, SA, WA, ACT and NT. Not permitted in TAS. Licence names are each authority's own; checked November 2026." states={[{ abbr: "NSW", cat: "Class 1 licence", ok: true }, { abbr: "VIC", cat: "Basic licence", ok: true }, { abbr: "QLD", cat: "Standard licence", ok: true }, { abbr: "SA", cat: "Basic permit (one animal permit-free)", ok: true }, { abbr: "WA", cat: "Pet keeper's licence", ok: true }, { abbr: "TAS", cat: "Not permitted (TAS natives only)", ok: false }, { abbr: "ACT", cat: "Keeper licence (case by case)", ok: true }, { abbr: "NT", cat: "Permit to keep", ok: true }]} />}
    </>}
  />
);

export default SpinyTailGeckoPage;
