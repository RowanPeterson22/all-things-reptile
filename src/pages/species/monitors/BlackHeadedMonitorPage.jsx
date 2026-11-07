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

// ─── Black-headed Monitor page ────────────────────────────────────
const BlackHeadedMonitorPage = ({ onBack }) => (
  <SpeciesPage onBack={onBack} name="Black-headed Monitor" latin="Varanus tristis" emoji="🦎"
    badges={[["Intermediate", C.goldLight, "#7a5a1e"], ["Australian native", C.bluePale, C.blue], ["Arboreal", C.greenPale, C.green]]}
    tabs={["overview","feeding","health","handling","licencing"]}
    tabContent={(tab) => <>
      {tab === "overview" && <>
        <p style={{fontSize:13,color:"#666",lineHeight:1.6,marginBottom:14}}>Also known as the Freckled Monitor. Found across most of Australia except the south-east and Tasmania. Their striking black head and neck contrasting with a pale spotted body makes them distinctive. Semi-arboreal and highly active. A popular monitor for intermediate keepers — more manageable than Lace or Sand Monitors but still requiring significant commitment and appropriate experience.</p>
        <SectionLabel mt={0}>Quick stats</SectionLabel>
        <StatGrid stats={[["📏","Adult size","60–100 cm"],["⏳","Lifespan","15–20 yrs"],["🏠","Min. enclosure","150 × 60 × 90 cm"],["💧","Humidity","30–50%"]]} />
        <SectionLabel>Temperature requirements</SectionLabel>
        <TempBar label="Basking surface temp" value="50–60°C" width="100%" color="#cc2200"/>
        <TempBar label="Warm side ambient" value="32–36°C" width="74%" color="#e05a2b"/>
        <TempBar label="Cool side" value="26–28°C" width="52%" color="#4a9e6b"/>
        <TempBar label="Overnight low" value="18–22°C" width="28%" color="#2b7ec0"/>
        <SectionLabel>Enclosure setup</SectionLabel>
        <div style={{background:C.cream,borderRadius:12,padding:"12px 14px",border:"0.5px solid #e8e8e4",fontSize:13,color:"#666",lineHeight:1.7}}>A tall enclosure with ample vertical space — they are semi-arboreal and need to climb. Minimum 150×60×90cm for one adult. Sandy substrate for burrowing. Large flat basking rock under the heat lamp. Multiple cork bark hides and climbing branches at varying heights. A shallow water bowl. UVB lighting essential.</div>
        <ShopBtn>🛒 Shop monitor supplies</ShopBtn>
        <ShopBtn secondary>Ask a question ↗</ShopBtn>
      </>}
      {tab === "feeding" && <>
        <p style={{fontSize:13,color:"#666",lineHeight:1.6,marginBottom:12}}>Carnivorous. In the wild they eat insects, small lizards, eggs, and small mammals. A varied diet is important in captivity.</p>
        <div style={{background:C.cream,borderRadius:12,border:"0.5px solid #e8e8e4",padding:"0 14px"}}>
          <FoodItem icon="🦗" name="Large crickets / Wood Roaches" detail="Excellent staple insect feeders" freq="Every 2 days (juveniles), 3x week (adults)"/>
          <FoodItem icon="🥚" name="Quail / small eggs" detail="Natural prey — eagerly taken" freq="Weekly"/>
          <FoodItem icon="🐭" name="Mice (adults)" detail="Occasional protein boost" freq="Monthly"/>
          <FoodItem icon="🪲" name="Superworms" detail="Good variety item" freq="Weekly"/>
        </div>
        <WarnBox type="gold" title="Feeding tongs always">Black-headed Monitors have a fast feeding strike. Always use tongs — never hand-feed. Hook-train before every feeding session.</WarnBox>
        <ShopBtn>🛒 Shop feeders & supplements</ShopBtn>
      </>}
      {tab === "health" && <>
        <SectionLabel mt={0}>Common health issues</SectionLabel>
        <HealthItem title="Insufficient basking temperature" detail="Like all monitors, an extremely hot basking spot is essential. Verify surface temperature with an infrared thermometer — not just air temperature."/>
        <HealthItem title="Respiratory infection" detail="From temperatures too cold or damp conditions without ventilation. Maintain warm arid conditions."/>
        <HealthItem title="Parasites" detail="Annual faecal tests recommended. Quarantine all new animals strictly."/>
        <HealthItem dot="#4a9e6b" title="Signs of good health" detail="Active and alert, climbing regularly, basking daily, feeding well, bright alert eyes, good body condition."/>
        <SnakeShedding animal="lizard"/>
      </>}
      {tab === "handling" && <>
        <div style={{background:C.goldLight,borderRadius:12,padding:"12px 14px",marginBottom:12,border:`0.5px solid #c8963c44`}}>
          <div style={{fontSize:12,fontWeight:700,color:"#7a5a1e",marginBottom:6}}>BITE RISK — MEDIUM TO HIGH</div>
          <div style={{fontSize:13,color:"#555",lineHeight:1.6}}>Black-headed Monitors are more flighty and defensive than Ackies. Juveniles in particular can be quite nippy and fast. With consistent patient handling from a young age they tame down reasonably well. Hook-train before every session. Respect their speed and agility.</div>
        </div>
        <div style={{background:C.cream,borderRadius:12,padding:"12px 14px",border:"0.5px solid #e8e8e4",fontSize:13,color:"#666",lineHeight:1.7}}>Always hook-train before picking up. Support the full body including the tail — their tail whip can sting. Wear long sleeves for new or unsettled animals. Short sessions initially, building gradually with patience.</div>
      </>}
      {tab === "licencing" && <LegalTab note="Can be kept in NSW, VIC, QLD, SA, WA, ACT and NT. Not permitted in TAS. Licence names are each authority's own; checked November 2026." states={[{ abbr: "NSW", cat: "Companion or Class 1 licence", ok: true }, { abbr: "VIC", cat: "Basic licence", ok: true }, { abbr: "QLD", cat: "Standard licence", ok: true }, { abbr: "SA", cat: "Basic permit (one animal permit-free)", ok: true }, { abbr: "WA", cat: "Pet keeper's licence", ok: true }, { abbr: "TAS", cat: "Not permitted (TAS natives only)", ok: false }, { abbr: "ACT", cat: "Keeper licence (case by case)", ok: true }, { abbr: "NT", cat: "Permit to keep", ok: true }]} />}
    </>}
  />
);

export default BlackHeadedMonitorPage;
