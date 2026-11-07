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

// ─── Lace Monitor page ────────────────────────────────────────────
const LaceMonitorPage = ({ onBack }) => (
  <SpeciesPage onBack={onBack} name="Lace Monitor" latin="Varanus varius" emoji="🦎"
    badges={[["Advanced", C.redPale, C.red], ["Australian native", C.bluePale, C.blue], ["Arboreal", C.goldLight, "#7a5a1e"]]}
    tabs={["overview","feeding","health","handling","licencing"]}
    tabContent={(tab) => <>
      {tab === "overview" && <>
        <p style={{fontSize:13,color:"#666",lineHeight:1.6,marginBottom:14}}>Australia's second largest lizard and arguably its most spectacular monitor. Found across eastern Australia from Cape York to Victoria in forests, woodlands, and suburban bushland. Their intricate lace-like pattern is unmistakable. Semi-arboreal — excellent climbers that spend significant time in trees. An impressive, intelligent, and long-lived species for serious, experienced keepers only.</p>
        <SectionLabel mt={0}>Quick stats</SectionLabel>
        <StatGrid stats={[["📏","Adult size","120–200 cm"],["⏳","Lifespan","20–30+ yrs"],["🏠","Min. enclosure","300 × 200 × 200 cm"],["💧","Humidity","50–70%"]]} />
        <WarnBox type="red" title="Requires very large outdoor or indoor-outdoor setup">Adult Lace Monitors require enormous enclosures — a minimum 3×2×2m for a single adult. Most experienced keepers use outdoor setups or dedicated reptile rooms. This is a serious commitment for advanced keepers only.</WarnBox>
        <SectionLabel>Temperature requirements</SectionLabel>
        <TempBar label="Basking surface temp" value="50–60°C" width="100%" color="#cc2200"/>
        <TempBar label="Warm side ambient" value="28–35°C" width="68%" color="#e05a2b"/>
        <TempBar label="Cool side" value="22–26°C" width="44%" color="#4a9e6b"/>
        <TempBar label="Overnight low" value="16–20°C" width="24%" color="#2b7ec0"/>
        <SectionLabel>Enclosure setup</SectionLabel>
        <div style={{background:C.cream,borderRadius:12,padding:"12px 14px",border:"0.5px solid #e8e8e4",fontSize:13,color:"#666",lineHeight:1.7}}>An outdoor or large indoor-outdoor enclosure is ideal. Robust construction — these are very strong animals. Large trees or substantial vertical climbing structures — they are arboreal and need to climb. Deep substrate for burrowing. Multiple large hides. A large water feature — they enjoy soaking and swimming. UVB lighting essential for indoor setups. Many keepers use a naturally planted outdoor enclosure in warmer months.</div>
        <ShopBtn>🛒 Shop monitor supplies</ShopBtn>
        <ShopBtn secondary>Ask a question ↗</ShopBtn>
      </>}
      {tab === "feeding" && <>
        <p style={{fontSize:13,color:"#666",lineHeight:1.6,marginBottom:12}}>Carnivorous opportunists — in the wild they eat anything they can catch including birds, mammals, reptiles, eggs, and carrion. In captivity a varied diet is important.</p>
        <div style={{background:C.cream,borderRadius:12,border:"0.5px solid #e8e8e4",padding:"0 14px"}}>
          <FoodItem icon="🐭" name="Rats / rabbits (adults)" detail="Staple prey for adults" freq="Weekly"/>
          <FoodItem icon="🥚" name="Eggs" detail="Quail, chicken — a natural favourite" freq="Weekly"/>
          <FoodItem icon="🐔" name="Whole chicken pieces" detail="On the bone for jaw exercise" freq="Occasionally"/>
          <FoodItem icon="🐟" name="Whole fish" detail="Good variety and calcium" freq="Occasionally"/>
          <FoodItem icon="🦗" name="Large insects" detail="Good supplement especially juveniles" freq="Several× week (juveniles)"/>
        </div>
        <WarnBox type="red" title="Always use long feeding tongs">Lace Monitors have an extremely powerful bite and strong feeding response. Long tongs are essential for every feed. Never hand-feed under any circumstances.</WarnBox>
        <ShopBtn>🛒 Shop feeders</ShopBtn>
      </>}
      {tab === "health" && <>
        <SectionLabel mt={0}>Common health issues</SectionLabel>
        <HealthItem title="Injuries from inadequate space" detail="Lace Monitors confined in undersized enclosures suffer chronic stress and physical injury. Enclosure size is the single most important factor in keeping this species successfully."/>
        <HealthItem title="Respiratory infection" detail="Common in cold, damp conditions without adequate heating. Ensure basking heat is always available."/>
        <HealthItem title="Bite wounds (from conspecifics)" detail="Males are highly territorial — never house two males together. Fights cause serious injuries."/>
        <HealthItem dot="#4a9e6b" title="Signs of good health" detail="Active and alert, regular basking, feeding well, using full enclosure including climbing structures, regular shedding, good body weight."/>
        <SnakeShedding animal="lizard"/>
      </>}
      {tab === "handling" && <>
        <div style={{background:C.redPale,borderRadius:12,padding:"12px 14px",marginBottom:12,border:`0.5px solid ${C.red}22`}}>
          <div style={{fontSize:12,fontWeight:700,color:C.red,marginBottom:6}}>BITE RISK — VERY HIGH — ADVANCED KEEPERS ONLY</div>
          <div style={{fontSize:13,color:"#555",lineHeight:1.6}}>Lace Monitors are powerful animals capable of inflicting serious injuries with their bite, claws, and tail. Even well-habituated animals can bite unexpectedly. Two-person handling is strongly recommended for large adults. Hook-train before every interaction without exception. Wear thick protective gloves.</div>
        </div>
        <WarnBox type="red" title="Lace Monitor bites are serious injuries">Their serrated teeth cause deep lacerations with high infection risk. Seek medical attention immediately after any bite. Lace Monitor mouths carry significant bacterial load.</WarnBox>
        <div style={{background:C.cream,borderRadius:12,padding:"12px 14px",border:"0.5px solid #e8e8e4",fontSize:13,color:"#666",lineHeight:1.7}}>With significant time and patient work from a young age, Lace Monitors can become manageable display and interaction animals. Many long-term keepers report very tame adults. But this takes years of consistent work and respect for the animal.</div>
      </>}
      {tab === "licencing" && <LegalTab note="Lace Monitors require an advanced keeper licence in most states due to their large size and advanced care requirements. One of the most demanding monitors to keep." states={[{ abbr: "NSW", cat: "Advanced licence", ok: true }, { abbr: "VIC", cat: "Advanced licence", ok: true }, { abbr: "QLD", cat: "Advanced licence", ok: true }, { abbr: "SA", cat: "Advanced licence", ok: true }, { abbr: "WA", cat: "Advanced licence", ok: true }, { abbr: "TAS", cat: "TAS natives only", ok: false }, { abbr: "ACT", cat: "Advanced licence", ok: true }, { abbr: "NT", cat: "Check with authority", ok: true }]} />}
    </>}
  />
);

export default LaceMonitorPage;
