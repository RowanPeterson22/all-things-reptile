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

// ─── White-lipped Tree Frog page ──────────────────────────────────
const WhiteLippedFrogPage = ({ onBack }) => (
  <SpeciesPage onBack={onBack} name="White-lipped Tree Frog" latin="Litoria infrafrenata" emoji="🐸"
    badges={[["Intermediate", C.goldLight, "#7a5a1e"], ["Australian native", C.bluePale, C.blue], ["Large species", C.greenPale, C.green]]}
    tabs={["overview","feeding","health & shedding","handling","licencing"]}
    tabContent={(tab) => <>
      {tab === "overview" && <>
        <p style={{fontSize:13,color:"#666",lineHeight:1.6,marginBottom:14}}>The largest tree frog in Australia and one of the largest in the world. Found in tropical north Queensland and New Guinea. Distinguished from the Green Tree Frog by their white lower lip stripe and larger size. An impressive display animal — adults are truly spectacular. Requires a large enclosure and warm tropical conditions.</p>
        <SectionLabel mt={0}>Quick stats</SectionLabel>
        <StatGrid stats={[["📏","Adult size","10–14 cm"],["⏳","Lifespan","10–15 yrs"],["🏠","Min. enclosure","60 × 45 × 90 cm"],["💧","Humidity","60–80%"]]} />
        <SectionLabel>Temperature requirements</SectionLabel>
        <TempBar label="Daytime ambient" value="26–30°C" width="60%" color="#e05a2b"/>
        <TempBar label="Nighttime low" value="20–24°C" width="36%" color="#2b7ec0"/>
        <WarnBox type="blue" title="Tropical species — warmth essential">White-lipped Tree Frogs come from tropical north Queensland and require warmer temperatures than Green Tree Frogs. They do not tolerate cool conditions well.</WarnBox>
        <SectionLabel>Enclosure setup</SectionLabel>
        <div style={{background:C.cream,borderRadius:12,padding:"12px 14px",border:"0.5px solid #e8e8e4",fontSize:13,color:"#666",lineHeight:1.7}}>A large tall enclosure — adults are big frogs and need space. Height is important. Live plants strongly recommended for humidity and cover. Large shallow water bowl. Dense branching for perching and climbing. Mist heavily each evening. Excellent ventilation essential. Bioactive setups work very well for this species.</div>
        <ShopBtn>🛒 Shop frog supplies</ShopBtn>
        <ShopBtn secondary>Ask a question ↗</ShopBtn>
      </>}
      {tab === "feeding" && <>
        <p style={{fontSize:13,color:"#666",lineHeight:1.6,marginBottom:12}}>Voracious insectivores. Their large size means they can take larger prey than most frogs. Feed at night. Like Green Tree Frogs, obesity is a real risk.</p>
        <div style={{background:C.cream,borderRadius:12,border:"0.5px solid #e8e8e4",padding:"0 14px"}}>
          <FoodItem icon="🦗" name="Large crickets" detail="Staple feeder — gut load well" freq="Every 2–3 nights"/>
          <FoodItem icon="🦟" name="Wood Roaches (Woodies)" detail="Large adults — excellent feeder" freq="Every 2–3 nights"/>
          <FoodItem icon="🐛" name="Silkworms / hornworms" detail="High moisture feeders" freq="Occasionally"/>
          <FoodItem icon="🐭" name="Pinky mice (adults only)" detail="Occasional protein boost for very large adults" freq="Rarely"/>
        </div>
        <WarnBox type="red" title="Monitor weight carefully">White-lipped Tree Frogs grow very large and can become seriously obese. Monitor body condition — a healthy frog should have a firm, not rounded, body with no fat deposits over the eyes.</WarnBox>
        <ShopBtn>🛒 Shop feeders & supplements</ShopBtn>
      </>}
      {tab === "health & shedding" && <>
        <SectionLabel mt={0}>Common health issues</SectionLabel>
        <HealthItem title="Chytridiomycosis" detail="Same risk as all frogs. Strict hygiene essential. Never release captive frogs into the wild."/>
        <HealthItem title="Respiratory infection" detail="Caused by temperatures too low or excessive humidity without adequate ventilation. Signs include wheezing or lethargy. Veterinary attention required."/>
        <HealthItem title="Obesity" detail="Very common — these frogs are enthusiastic feeders. Reduce feeding frequency if fat pads develop over the eyes."/>
        <HealthItem dot="#4a9e6b" title="Signs of good health" detail="Vivid green colouration with clear white lip stripe, active and alert at night, feeding well, strong toe pad grip, regular shedding."/>
        <SnakeShedding animal="frog"/>
      </>}
      {tab === "handling" && <>
        <div style={{background:C.goldLight,borderRadius:12,padding:"12px 14px",marginBottom:12,border:`0.5px solid #c8963c44`}}>
          <div style={{fontSize:12,fontWeight:700,color:"#7a5a1e",marginBottom:6}}>HANDLING — MINIMAL, CLEAN HANDS ESSENTIAL</div>
          <div style={{fontSize:13,color:"#555",lineHeight:1.6}}>White-lipped Tree Frogs can be more flighty than Green Tree Frogs. Their large size makes them impressive to hold but they may jump unexpectedly. Always handle over a safe surface. Wet hands with dechlorinated water before every interaction.</div>
        </div>
        <div style={{background:C.cream,borderRadius:12,padding:"12px 14px",border:"0.5px solid #e8e8e4",fontSize:13,color:"#666",lineHeight:1.7}}>Wash and rinse hands with dechlorinated water before handling. Keep sessions brief. Their powerful legs mean they can jump considerable distances — be prepared. Never handle after using any chemical products on your hands.</div>
      </>}
      {tab === "licencing" && <LegalTab note="White-lipped Tree Frogs require a standard keeper licence in most states. Primarily available in QLD where they are native. Check availability in your state before purchasing." states={[{ abbr: "NSW", cat: "Standard licence", ok: true }, { abbr: "VIC", cat: "Check with authority", ok: true }, { abbr: "QLD", cat: "Standard licence", ok: true }, { abbr: "SA", cat: "Check with authority", ok: true }, { abbr: "WA", cat: "Check with authority", ok: true }, { abbr: "TAS", cat: "TAS natives only", ok: false }, { abbr: "ACT", cat: "Check with authority", ok: true }, { abbr: "NT", cat: "Check with authority", ok: true }]} />}
    </>}
  />
);

export default WhiteLippedFrogPage;
