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

// ─── Pygmy Mulga Monitor page ─────────────────────────────────────
const PygmyMulgaPage = ({ onBack }) => (
  <SpeciesPage onBack={onBack} name="Pygmy Mulga Monitor" latin="Varanus gilleni" emoji="🦎"
    badges={[["Intermediate", C.goldLight, "#7a5a1e"], ["Australian native", C.bluePale, C.blue], ["Small species", C.greenPale, C.green]]}
    tabs={["overview","feeding","health","handling","licencing"]}
    tabContent={(tab) => <>
      {tab === "overview" && <>
        <p style={{fontSize:13,color:"#666",lineHeight:1.6,marginBottom:14}}>The smallest commonly kept monitor in Australia — adults reach just 40cm. Found in the spinifex sandplains and mulga woodlands of central and north-western Australia. Arboreal with a semi-prehensile tail used for gripping branches. Hardy, active, and fascinating to observe. An excellent choice for keepers who want a monitor but have limited space.</p>
        <SectionLabel mt={0}>Quick stats</SectionLabel>
        <StatGrid stats={[["📏","Adult size","35–42 cm"],["⏳","Lifespan","10–15 yrs"],["🏠","Min. enclosure","60 × 45 × 60 cm"],["💧","Humidity","20–35%"]]} />
        <WarnBox type="red" title="Very hot basking spot essential">Like all monitors, Pygmy Mulgas require a very hot basking spot — at least 45–60°C surface temperature. This is non-negotiable for their health and digestion.</WarnBox>
        <SectionLabel>Temperature requirements</SectionLabel>
        <TempBar label="Basking surface temp" value="45–60°C" width="96%" color="#cc2200"/>
        <TempBar label="Warm side ambient" value="30–35°C" width="70%" color="#e05a2b"/>
        <TempBar label="Cool side" value="24–28°C" width="50%" color="#4a9e6b"/>
        <TempBar label="Overnight low" value="18–22°C" width="28%" color="#2b7ec0"/>
        <SectionLabel>Enclosure setup</SectionLabel>
        <div style={{background:C.cream,borderRadius:12,padding:"12px 14px",border:"0.5px solid #e8e8e4",fontSize:13,color:"#666",lineHeight:1.7}}>A taller enclosure than other arid monitors — they are arboreal and need vertical space with branches to climb. Cork bark tubes and flats for hiding. Sandy substrate. A flat rock under the basking lamp. Multiple climbing branches at varying heights. Despite being small, they are very active and appreciate enrichment. A bioactive setup with live plants works very well for this species.</div>
        <ShopBtn>🛒 Shop monitor supplies</ShopBtn>
        <ShopBtn secondary>Ask a question ↗</ShopBtn>
      </>}
      {tab === "feeding" && <>
        <p style={{fontSize:13,color:"#666",lineHeight:1.6,marginBottom:12}}>Insectivorous with some small vertebrate prey. Their small size means prey must be appropriately sized. Enthusiastic feeders.</p>
        <div style={{background:C.cream,borderRadius:12,border:"0.5px solid #e8e8e4",padding:"0 14px"}}>
          <FoodItem icon="🦗" name="Crickets / Wood Roaches" detail="Staple feeders — appropriately sized" freq="Every 2 days"/>
          <FoodItem icon="🥚" name="Small quail eggs" detail="Nutritious treat — occasionally" freq="Weekly"/>
          <FoodItem icon="🪲" name="Mealworms / small superworms" detail="Good variety item" freq="Weekly"/>
          <FoodItem icon="🐭" name="Pinky mice (adults)" detail="Very occasional — high fat" freq="Rarely"/>
        </div>
        <WarnBox type="gold" title="Small prey for small monitors">Prey must be appropriately sized — no wider than the monitor's head. Pygmy Mulgas are small animals and oversized prey is a real risk.</WarnBox>
        <ShopBtn>🛒 Shop feeders & supplements</ShopBtn>
      </>}
      {tab === "health" && <>
        <SectionLabel mt={0}>Common health issues</SectionLabel>
        <HealthItem title="Insufficient basking heat" detail="The most common husbandry mistake. Without a hot basking spot, Pygmy Mulgas cannot digest food properly and decline quickly. Always verify surface temperature with an infrared thermometer."/>
        <HealthItem title="Parasites" detail="Annual faecal tests recommended. Newly acquired animals should be tested before joining an existing collection."/>
        <HealthItem title="Dehydration" detail="Despite coming from arid environments they still need access to fresh water. A small shallow water bowl and occasional light misting."/>
        <HealthItem dot="#4a9e6b" title="Signs of good health" detail="Active climber, basking regularly, alert and curious, feeding well, regular shedding, good body condition."/>
        <SnakeShedding animal="lizard"/>
      </>}
      {tab === "handling" && <>
        <div style={{background:C.goldLight,borderRadius:12,padding:"12px 14px",marginBottom:12,border:`0.5px solid #c8963c44`}}>
          <div style={{fontSize:12,fontWeight:700,color:"#7a5a1e",marginBottom:6}}>BITE RISK — LOW TO MEDIUM</div>
          <div style={{fontSize:13,color:"#555",lineHeight:1.6}}>Pygmy Mulgas are generally calmer than Ackies or Black-headed Monitors. They can be flighty when young but tame down well with regular gentle handling. Their small size makes them easy to manage. Hook-train before every session.</div>
        </div>
        <div style={{background:C.cream,borderRadius:12,padding:"12px 14px",border:"0.5px solid #e8e8e4",fontSize:13,color:"#666",lineHeight:1.7}}>Support the full body. Handle at a comfortable temperature when the animal is warm and active. Short sessions initially, building gradually. Their prehensile tail will grip your hand and fingers — this is normal and not a sign of stress.</div>
      </>}
      {tab === "licencing" && <LegalTab note="Pygmy Mulga Monitors require a standard keeper licence in most states. The smallest commonly kept monitor — widely available from licensed breeders." states={[{ abbr: "NSW", cat: "Standard licence", ok: true }, { abbr: "VIC", cat: "Advanced licence", ok: true }, { abbr: "QLD", cat: "Standard licence", ok: true }, { abbr: "SA", cat: "Standard licence", ok: true }, { abbr: "WA", cat: "Standard licence", ok: true }, { abbr: "TAS", cat: "TAS natives only", ok: false }, { abbr: "ACT", cat: "Standard licence", ok: true }, { abbr: "NT", cat: "Check with authority", ok: true }]} />}
    </>}
  />
);

export default PygmyMulgaPage;
