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

// ─── Sand Monitor page ────────────────────────────────────────────
const SandMonitorPage = ({ onBack }) => (
  <SpeciesPage onBack={onBack} name="Sand Monitor" latin="Varanus gouldii" emoji="🦎"
    badges={[["Advanced", C.redPale, C.red], ["Australian native", C.bluePale, C.blue], ["Large species", C.goldLight, "#7a5a1e"]]}
    tabs={["overview","feeding","health","handling","licencing"]}
    tabContent={(tab) => <>
      {tab === "overview" && <>
        <p style={{fontSize:13,color:"#666",lineHeight:1.6,marginBottom:14}}>Also known as Gould's Monitor or the Racehorse Goanna — named for their extraordinary speed. One of Australia's most widespread monitor lizards, found across most of the continent except the far north. A large, powerful, and highly intelligent species suited only to experienced keepers with the space and commitment required. Their bold personality and striking appearance make them impressive animals — but they demand respect and a serious commitment.</p>
        <SectionLabel mt={0}>Quick stats</SectionLabel>
        <StatGrid stats={[["📏","Adult size","100–160 cm"],["⏳","Lifespan","15–20 yrs"],["🏠","Min. enclosure","240 × 90 × 90 cm"],["💧","Humidity","30–50%"]]} />
        <WarnBox type="red" title="Large, powerful species — experienced keepers only">Sand Monitors are fast, strong, and can inflict serious bites and scratches. Adults require very large enclosures. This is not a beginner species. Significant experience with reptiles is required before keeping this species.</WarnBox>
        <SectionLabel>Temperature requirements</SectionLabel>
        <WarnBox type="red" title="Very hot basking spot essential">Like all monitors, Sand Monitors need a very hot basking spot — 50–65°C surface temperature. This is essential for digestion and health. Measure the surface with an infrared thermometer, not the air temperature.</WarnBox>
        <TempBar label="Basking surface temp" value="50–65°C" width="100%" color="#cc2200"/>
        <TempBar label="Warm side ambient" value="32–38°C" width="78%" color="#e05a2b"/>
        <TempBar label="Cool side" value="26–28°C" width="52%" color="#4a9e6b"/>
        <TempBar label="Overnight low" value="20–22°C" width="30%" color="#2b7ec0"/>
        <SectionLabel>Enclosure setup</SectionLabel>
        <div style={{background:C.cream,borderRadius:12,padding:"12px 14px",border:"0.5px solid #e8e8e4",fontSize:13,color:"#666",lineHeight:1.7}}>A very large custom enclosure — minimum 240×90×90cm for one adult. Many experienced keepers house adults in outdoor enclosures. Deep substrate (30+ cm) for burrowing — they spend significant time underground. Very large flat rock or slate basking platform. Robust hides. Heavy-duty construction — these are powerful animals that will test any weak points in an enclosure.</div>
        <ShopBtn>🛒 Shop monitor supplies</ShopBtn>
        <ShopBtn secondary>Ask a question ↗</ShopBtn>
      </>}
      {tab === "feeding" && <>
        <p style={{fontSize:13,color:"#666",lineHeight:1.6,marginBottom:12}}>Carnivorous. Active hunters that eat a wide variety of prey. Their large size means they can take substantial prey items as adults.</p>
        <div style={{background:C.cream,borderRadius:12,border:"0.5px solid #e8e8e4",padding:"0 14px"}}>
          <FoodItem icon="🐭" name="Rats / mice" detail="Staple prey for adults" freq="Weekly"/>
          <FoodItem icon="🥚" name="Eggs" detail="Quail, chicken — eagerly taken" freq="Weekly"/>
          <FoodItem icon="🦗" name="Large insects" detail="Good supplement and enrichment" freq="2–3x week"/>
          <FoodItem icon="🐟" name="Whole fish" detail="Good protein and calcium source" freq="Occasionally"/>
          <FoodItem icon="🐔" name="Lean chicken pieces" detail="On the bone for enrichment" freq="Occasionally"/>
        </div>
        <WarnBox type="gold" title="Always use feeding tongs">Sand Monitors have a strong feeding response and can bite hard. Always use long feeding tongs. Never hand-feed. Hook-train before every feeding session.</WarnBox>
        <ShopBtn>🛒 Shop feeders</ShopBtn>
      </>}
      {tab === "health" && <>
        <SectionLabel mt={0}>Common health issues</SectionLabel>
        <HealthItem title="Injuries from inadequate enclosure" detail="Sand Monitors are fast and powerful. Sharp enclosure edges, inadequate height, or insufficient burrowing depth cause injuries. Enclosure construction must be robust and well-finished."/>
        <HealthItem title="Obesity" detail="Common when fed too many rodents. Vary the diet and include insects and eggs alongside mammals."/>
        <HealthItem title="Parasites" detail="Annual faecal tests strongly recommended. These monitors have large home ranges in the wild and encounter many parasite sources."/>
        <HealthItem dot="#4a9e6b" title="Signs of good health" detail="Active and alert, strong muscular build, regular feeding, complete sheds, bright eyes, using full enclosure."/>
        <SnakeShedding animal="lizard"/>
      </>}
      {tab === "handling" && <>
        <div style={{background:C.redPale,borderRadius:12,padding:"12px 14px",marginBottom:12,border:`0.5px solid ${C.red}22`}}>
          <div style={{fontSize:12,fontWeight:700,color:C.red,marginBottom:6}}>BITE RISK — HIGH — EXPERIENCED KEEPERS ONLY</div>
          <div style={{fontSize:13,color:"#555",lineHeight:1.6}}>Sand Monitors can inflict serious bites and lacerations from their claws. Even well-tamed adults can bite hard if startled or in feeding mode. Hook-train before every interaction without exception. Wear thick gloves when working with unsettled animals. Two-person handling recommended for large adults.</div>
        </div>
        <div style={{background:C.cream,borderRadius:12,padding:"12px 14px",border:"0.5px solid #e8e8e4",fontSize:13,color:"#666",lineHeight:1.7}}>With significant patient work, Sand Monitors can become manageable — but they will never be as relaxed as an Ackie. Always hook-train. Support the full body. Respect their power and speed. Never rush handling sessions.</div>
        <WarnBox type="red" title="Seek medical attention for bites">Monitor bites carry a high bacterial load and risk of infection. Clean any bite wound thoroughly and seek medical advice. Monitor bites can be serious injuries.</WarnBox>
      </>}
      {tab === "licencing" && <LegalTab note="Can be kept in NSW, VIC, QLD, SA, WA, ACT and NT. Not permitted in TAS. Licence names are each authority's own; checked November 2026." states={[{ abbr: "NSW", cat: "Companion or Class 1 licence", ok: true }, { abbr: "VIC", cat: "Basic licence", ok: true }, { abbr: "QLD", cat: "Standard licence", ok: true }, { abbr: "SA", cat: "Basic permit (one animal permit-free)", ok: true }, { abbr: "WA", cat: "Pet keeper's licence (advanced)", ok: true }, { abbr: "TAS", cat: "Not permitted (TAS natives only)", ok: false }, { abbr: "ACT", cat: "Keeper licence (case by case)", ok: true }, { abbr: "NT", cat: "Permit to keep", ok: true }]} />}
    </>}
  />
);

export default SandMonitorPage;
