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

// ─── Eastern Long-necked Turtle page ─────────────────────────────
const EasternLongNeckPage = ({ onBack }) => (
  <SpeciesPage onBack={onBack} name="Eastern Long-necked Turtle" latin="Chelodina longicollis" emoji="🐢"
    badges={[["Intermediate", C.goldLight, "#7a5a1e"], ["Australian native", C.bluePale, C.blue], ["Aquatic", C.greenPale, C.green]]}
    tabs={["overview","feeding","health & setup","handling","licencing"]}
    tabContent={(tab) => <>
      {tab === "overview" && <>
        <p style={{fontSize:13,color:"#666",lineHeight:1.6,marginBottom:14}}>Australia's most commonly kept freshwater turtle. Found across south-eastern Australia in rivers, lakes, and wetlands. Their extraordinarily long neck — sometimes as long as their shell — is used to strike at prey with lightning speed. Fascinating to watch, long-lived, and rewarding to keep with the right setup.</p>
        <SectionLabel mt={0}>Quick stats</SectionLabel>
        <StatGrid stats={[["📏","Shell length","20–28 cm"],["⏳","Lifespan","30–50+ yrs"],["🏠","Min. tank","200L+"],["💧","Water temp","18–24°C"]]} />
        <WarnBox type="red" title="Long term commitment">Eastern Long-necked Turtles can live for 30–50+ years in captivity. This is a multi-decade commitment. Plan accordingly before purchasing.</WarnBox>
        <SectionLabel>Tank setup</SectionLabel>
        <div style={{background:C.cream,borderRadius:12,padding:"12px 14px",border:"0.5px solid #e8e8e4",fontSize:13,color:"#666",lineHeight:1.7}}>A large aquatic setup is essential — minimum 200 litres for one adult. A basking platform above the waterline where the turtle can fully dry out under a heat lamp is critical. UVB lighting over the basking area. Water depth should allow the turtle to fully submerge but also stand on the bottom and breathe. A high-quality canister filter — turtles are extremely messy and produce a lot of waste. Regular partial water changes (25–30% weekly) regardless of filtration.</div>
        <WarnBox type="gold" title="Filtration is critical">Turtles produce significantly more waste than fish of equivalent size. Under-filtration leads to rapid water quality decline, shell rot, and respiratory infections. Invest in a filter rated for at least 3–4 times your tank volume.</WarnBox>
        <SectionLabel>Temperature & lighting</SectionLabel>
        <TempBar label="Basking spot (air temp)" value="28–32°C" width="66%" color="#e05a2b"/>
        <TempBar label="Water temperature" value="18–24°C" width="36%" color="#2b7ec0"/>
        <ShopBtn>🛒 Shop turtle supplies</ShopBtn>
        <ShopBtn secondary>Ask a question ↗</ShopBtn>
      </>}
      {tab === "feeding" && <>
        <p style={{fontSize:13,color:"#666",lineHeight:1.6,marginBottom:12}}>Carnivorous. Feed in the water — turtles cannot swallow food on land as they need water to help them swallow. A varied diet promotes good health and enrichment.</p>
        <div style={{background:C.cream,borderRadius:12,border:"0.5px solid #e8e8e4",padding:"0 14px"}}>
          <FoodItem icon="🐟" name="Feeder fish / whitebait" detail="Whole fish provide bones for calcium" freq="2–3x per week"/>
          <FoodItem icon="🦐" name="Prawns / shrimp" detail="Shell-on for calcium content" freq="2–3x per week"/>
          <FoodItem icon="🪱" name="Earthworms" detail="Excellent nutrition — eagerly taken" freq="2–3x per week"/>
          <FoodItem icon="🦗" name="Crickets / woodies" detail="Good variety item — drop into water" freq="Weekly"/>
          <FoodItem icon="🐌" name="Snails" detail="Shell provides calcium — a favourite" freq="Weekly"/>
          <FoodItem icon="🐢" name="Turtle pellets" detail="Quality commercial pellets as supplement" freq="2–3x per week"/>
        </div>
        <WarnBox type="gold" title="Feed in water only">Long-necked Turtles cannot eat on land — they need water to swallow. Always feed in the tank or in a separate feeding container to keep the main tank cleaner.</WarnBox>
        <WarnBox type="red" title="Remove uneaten food promptly">Uneaten food rapidly degrades water quality. Remove any uneaten food within 30 minutes of feeding.</WarnBox>
        <ShopBtn>🛒 Shop turtle food</ShopBtn>
      </>}
      {tab === "health & setup" && <>
        <SectionLabel mt={0}>Common health issues</SectionLabel>
        <HealthItem title="Shell rot" detail="Bacterial or fungal infection of the shell — usually caused by poor water quality or insufficient basking time. Signs include soft or pitting areas on the shell, discolouration, or odour. Requires veterinary treatment and improved husbandry."/>
        <HealthItem title="Respiratory infection" detail="Turtles with respiratory infections often list to one side or float unevenly. Caused by cold water temperatures or poor water quality. Prompt vet attention required."/>
        <HealthItem title="Vitamin A deficiency" detail="Causes swollen eyelids and lethargy. Prevented by feeding a varied diet including whole prey items."/>
        <HealthItem title="Salmonella" detail="All turtles can carry Salmonella. Always wash hands thoroughly after handling turtles or aquarium water. Keep children supervised during interactions."/>
        <HealthItem title="Hibernation (aestivation)" detail="In cooler months some turtles become less active. This is normal. Maintain water temperature and ensure basking is available."/>
        <HealthItem dot="#4a9e6b" title="Signs of good health" detail="Active swimming, basking regularly, eating well, clear eyes, hard smooth shell, alert when approached."/>
        <SectionLabel>Water quality guide</SectionLabel>
        <div style={{background:C.cream,borderRadius:12,padding:"12px 14px",border:"0.5px solid #e8e8e4",fontSize:13,color:"#666",lineHeight:1.7}}>Test water weekly — ammonia and nitrite should always be zero. Nitrates should be kept below 20ppm with regular water changes. pH 6.5–7.5 is ideal. Dechlorinate all tap water before adding to the tank. A reliable test kit is an essential purchase.</div>
      </>}
      {tab === "handling" && <>
        <div style={{background:C.goldLight,borderRadius:12,padding:"12px 14px",marginBottom:12,border:`0.5px solid #c8963c44`}}>
          <div style={{fontSize:12,fontWeight:700,color:"#7a5a1e",marginBottom:6}}>HANDLING — KEEP MINIMAL</div>
          <div style={{fontSize:13,color:"#555",lineHeight:1.6}}>Eastern Long-necked Turtles are aquatic animals — they are not handling pets. Excessive handling causes significant stress. Keep handling to a minimum and for health checks only.</div>
        </div>
        <div style={{background:C.cream,borderRadius:12,padding:"12px 14px",border:"0.5px solid #e8e8e4",fontSize:13,color:"#666",lineHeight:1.7}}>When handling is necessary, hold the turtle at the sides of the shell — never by the neck or limbs. Their long neck can reach around to bite surprisingly easily. Always wash hands immediately after handling. Keep sessions brief and return to water promptly.</div>
        <WarnBox type="red" title="Musk gland warning">When stressed, Long-necked Turtles release a foul-smelling musk from glands near their legs. This is a defence mechanism — if your turtle musks frequently during handling, reduce handling sessions significantly.</WarnBox>
      </>}
      {tab === "licencing" && <LegalTab note="Can be kept in NSW, VIC, QLD, SA and ACT. Not permitted in WA, TAS and NT. No licence or permit needed in VIC and SA if captive-bred and lawfully sourced. Licence names are each authority's own; checked November 2026." states={[{ abbr: "NSW", cat: "Companion or Class 1 licence", ok: true }, { abbr: "VIC", cat: "No licence needed", ok: true }, { abbr: "QLD", cat: "Standard licence", ok: true }, { abbr: "SA", cat: "No permit needed", ok: true }, { abbr: "WA", cat: "Not permitted", ok: false }, { abbr: "TAS", cat: "Not permitted (TAS natives only)", ok: false }, { abbr: "ACT", cat: "Keeper licence (case by case)", ok: true }, { abbr: "NT", cat: "Not permitted", ok: false }]} />}
    </>}
  />
);

export default EasternLongNeckPage;
