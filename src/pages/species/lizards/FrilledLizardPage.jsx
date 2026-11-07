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

// ─── Frilled-neck Lizard page ──────────────────────────────────────────
const FrilledLizardPage = ({ onBack }) => (
  <SpeciesPage onBack={onBack} name="Frilled-neck Lizard" latin="Chlamydosaurus kingii" emoji="🦎"
    badges={[["Intermediate", C.goldLight, "#7a5a1e"], ["Australian native", C.bluePale, C.blue], ["Arboreal", C.greenPale, C.green]]}
    tabs={["overview","feeding","health & shedding","handling","licencing"]}
    tabContent={(tab) => <>
      {tab === "overview" && <>
        <p style={{fontSize:13,color:"#666",lineHeight:1.6,marginBottom:14}}>One of Australia's most iconic reptiles — the dramatic frill display and bipedal running are instantly recognisable worldwide. Found across northern Australia and southern New Guinea in tropical and dry woodland. An impressive display animal that becomes surprisingly personable with regular handling.</p>
        <SectionLabel mt={0}>Quick stats</SectionLabel>
        <StatGrid stats={[["📏","Adult size","60–90 cm"],["⏳","Lifespan","10–15 yrs"],["🏠","Min. enclosure","120 × 60 × 120 cm"],["💧","Humidity","50–70%"]]} />
        <WarnBox type="red" title="Tall enclosure essential">Frilled Lizards are highly arboreal — they spend most of their time off the ground. A minimum height of 120cm is required. Width and length are secondary to height.</WarnBox>
        <SectionLabel>Temperature requirements</SectionLabel>
        <TempBar label="Basking spot" value="38–42°C" width="88%" color="#e05a2b"/>
        <TempBar label="Warm side" value="28–32°C" width="66%" color="#e0922b"/>
        <TempBar label="Cool side" value="24–28°C" width="50%" color="#4a9e6b"/>
        <TempBar label="Overnight low" value="20–24°C" width="34%" color="#2b7ec0"/>
        <SectionLabel>Enclosure setup</SectionLabel>
        <div style={{background:C.cream,borderRadius:12,padding:"12px 14px",border:"0.5px solid #e8e8e4",fontSize:13,color:"#666",lineHeight:1.7}}>A very tall custom enclosure is essential. Multiple vertical branches and perches at varying heights. Misting system or regular hand misting for humidity. UVB tube running vertically or at height. Cork bark at the top of the enclosure for hiding. Coconut coir or bioactive substrate.</div>
        <ShopBtn>🛒 Shop Frilled Lizard supplies</ShopBtn>
        <ShopBtn secondary>Ask a question ↗</ShopBtn>
      </>}
      {tab === "feeding" && <>
        <p style={{fontSize:13,color:"#666",lineHeight:1.6,marginBottom:12}}>Primarily insectivorous with some small vertebrate prey. In captivity, insects form the bulk of the diet supplemented with occasional pinky mice for adults.</p>
        <div style={{background:C.cream,borderRadius:12,border:"0.5px solid #e8e8e4",padding:"0 14px"}}>
          <FoodItem icon="🦗" name="Crickets" detail="Staple feeder — large size for adults" freq="Every 2 days"/>
          <FoodItem icon="🪲" name="Wood roaches (Woodies)" detail="Excellent nutrition" freq="Every 2 days"/>
          <FoodItem icon="🐛" name="Silkworms / hornworms" detail="High moisture, good supplement" freq="Weekly"/>
          <FoodItem icon="🐭" name="Pinky mice" detail="Adults only — occasional protein boost" freq="Monthly"/>
        </div>
        <WarnBox type="gold" title="Feed at height">Frilled Lizards feel most secure feeding off the ground. Place food in a bowl partway up the enclosure or use feeding tongs at height.</WarnBox>
        <ShopBtn>🛒 Shop feeders & supplements</ShopBtn>
      </>}
      {tab === "health & shedding" && <>
        <SectionLabel mt={0}>Common health issues</SectionLabel>
        <HealthItem title="Respiratory infection" detail="Often caused by insufficient temperature or humidity inconsistency. Watch for gaping, wheezing, or mucus."/>
        <HealthItem title="MBD" detail="Proper UVB at height is critical — they bask high up in trees naturally and receive intense UV radiation. Ensure UVB reaches their main basking position."/>
        <HealthItem title="Stress" detail="Frilled Lizards can be shy when new. Avoid excessive disturbance. A stressed frill display at every interaction means the animal needs more settling time."/>
        <HealthItem dot="#4a9e6b" title="Signs of good health" detail="Active climbing, alert frill display when stimulated, feeding well, full frill with no tears or damage."/>
        <SnakeShedding animal="lizard" />
      </>}
      {tab === "handling" && <>
        <div style={{background:C.goldLight,borderRadius:12,padding:"12px 14px",marginBottom:12,border:`0.5px solid #c8963c44`}}>
          <div style={{fontSize:12,fontWeight:700,color:"#7a5a1e",marginBottom:6}}>BITE RISK — MEDIUM</div>
          <div style={{fontSize:13,color:"#555",lineHeight:1.6}}>Frilled Lizards can be defensive, especially when new. The frill display and gaping mouth are warnings — respect them. With consistent gentle handling they become significantly calmer. Their claws are sharp — wear long sleeves when handling nervous individuals.</div>
        </div>
        <div style={{background:C.cream,borderRadius:12,padding:"12px 14px",border:"0.5px solid #e8e8e4",fontSize:13,color:"#666",lineHeight:1.7}}>Allow 3–4 weeks to settle before regular handling. Approach slowly and from the side, not from above. Let them walk onto your hand rather than grabbing them. Their frill display is spectacular to see but means they are stressed — end the session if they display persistently.</div>
      </>}
      {tab === "licencing" && <LegalTab note="Frilled-neck Lizards require an advanced keeper licence in most states. Always verify current availability before purchasing." states={[{ abbr: "NSW", cat: "Advanced licence", ok: true }, { abbr: "VIC", cat: "Advanced licence", ok: true }, { abbr: "QLD", cat: "Standard keeper licence", ok: true }, { abbr: "SA", cat: "Check with authority", ok: true }, { abbr: "WA", cat: "Advanced licence", ok: true }, { abbr: "TAS", cat: "TAS natives only", ok: false }, { abbr: "ACT", cat: "Check with authority", ok: true }, { abbr: "NT", cat: "Check with authority", ok: true }]} />}
    </>}
  />
);

export default FrilledLizardPage;
