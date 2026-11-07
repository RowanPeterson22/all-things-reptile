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

// ─── Northern Blue-tongue Skink page ─────────────────────────────
const NorthernBlueTonguePage = ({ onBack }) => (
  <SpeciesPage onBack={onBack} name="Northern Blue-tongue Skink" latin="Tiliqua scincoides intermedia" emoji="🦎"
    badges={[["Beginner friendly", C.greenPale, C.green], ["Australian native", C.bluePale, C.blue], ["Diurnal", C.goldLight, "#7a5a1e"]]}
    tabs={["overview","feeding","health & shedding","handling","licencing"]}
    tabContent={(tab) => <>
      {tab === "overview" && <>
        <p style={{fontSize:13,color:"#666",lineHeight:1.6,marginBottom:14}}>The largest of Australia's blue-tongue skinks. Found across northern Australia from Queensland through the NT to WA. Larger, faster, and often more defensive than the Eastern Blue-tongue — but equally rewarding when well socialised. Their paler colouration, longer limbs, and more slender build distinguish them from the Eastern subspecies. A stunning and impressive species.</p>
        <SectionLabel mt={0}>Quick stats</SectionLabel>
        <StatGrid stats={[["📏","Adult size","55–70 cm"],["⏳","Lifespan","15–25+ yrs"],["🏠","Min. enclosure","150 × 60 cm"],["💧","Humidity","40–60%"]]} />
        <SectionLabel>Temperature requirements</SectionLabel>
        <TempBar label="Basking spot" value="38–42°C" width="88%" color="#e05a2b"/>
        <TempBar label="Warm side" value="28–32°C" width="66%" color="#e0922b"/>
        <TempBar label="Cool side" value="22–26°C" width="44%" color="#4a9e6b"/>
        <TempBar label="Overnight low" value="18–22°C" width="28%" color="#2b7ec0"/>
        <WarnBox type="blue" title="UVB lighting strongly recommended">Northern Blue-tongues come from tropical and subtropical Australia where UVB exposure is intense. A T5 HO 10.0 UVB tube is strongly recommended for long-term health.</WarnBox>
        <SectionLabel>Enclosure setup</SectionLabel>
        <div style={{background:C.cream,borderRadius:12,padding:"12px 14px",border:"0.5px solid #e8e8e4",fontSize:13,color:"#666",lineHeight:1.7}}>A 150×60cm enclosure minimum for an adult — they are larger and more active than Eastern Blue-tongues and benefit from more space. Prioritise floor space over height. Coconut coir, topsoil mix, or reptile carpet substrate. Hides at both warm and cool ends. Fresh vegetables and protein offered in bowls. UVB tube running the full length of the enclosure.</div>
        <ShopBtn>🛒 Shop Blue-tongue supplies</ShopBtn>
        <ShopBtn secondary>Ask a question ↗</ShopBtn>
      </>}
      {tab === "feeding" && <>
        <p style={{fontSize:13,color:"#666",lineHeight:1.6,marginBottom:12}}>Omnivores with hearty appetites. The Northern Blue-tongue tends to be a more enthusiastic feeder than other subspecies. Rotate proteins, vegetables, and occasional fruit.</p>
        <div style={{background:C.cream,borderRadius:12,border:"0.5px solid #e8e8e4",padding:"0 14px"}}>
          <FoodItem icon="🍗" name="Lean chicken / turkey mince" detail="Low fat — avoid fatty cuts" freq="2–3× week"/>
          <FoodItem icon="🥚" name="Boiled or scrambled egg" detail="Excellent protein source" freq="1× week"/>
          <FoodItem icon="🐌" name="Snails / wood roaches (Woodies)" detail="Natural prey — eagerly taken" freq="Occasional"/>
          <FoodItem icon="🥬" name="Leafy greens" detail="Collard greens, endive, bok choy, kale" freq="Daily"/>
          <FoodItem icon="🥕" name="Root vegetables" detail="Carrot, pumpkin, sweet potato" freq="Several× week"/>
          <FoodItem icon="🍓" name="Fruit" detail="Small amounts as treats only" freq="Occasionally"/>
        </div>
        <WarnBox type="gold" title="Feeding schedule">Juveniles: feed daily. Adults: every 2–3 days. Remove uneaten food within a few hours. Northern Blue-tongues can be prone to obesity — keep protein lean and portions appropriate.</WarnBox>
        <ShopBtn>🛒 Shop supplements & feeders</ShopBtn>
      </>}
      {tab === "health & shedding" && <>
        <SectionLabel mt={0}>Common health issues</SectionLabel>
        <HealthItem title="Respiratory infection" detail="Caused by temperatures too low or humidity imbalance. Signs include wheezing, mucus, open-mouth breathing. Seek vet attention promptly."/>
        <HealthItem title="Obesity" detail="Very common in captivity. Northern Blue-tongues are enthusiastic feeders. Keep protein lean and ensure adequate space for movement."/>
        <HealthItem title="Mouth rot (stomatitis)" detail="Redness, swelling, or cheesy discharge around the gums. Check regularly during handling."/>
        <HealthItem title="Retained shed" detail="Particularly around toes and eyes. Soak in shallow warm water and gently assist if retained shed is present."/>
        <HealthItem dot="#4a9e6b" title="Signs of good health" detail="Alert and active during the day, regular feeding, smooth complete sheds, clear eyes, firm body condition, active tongue-flicking."/>
        <SnakeShedding animal="lizard"/>
      </>}
      {tab === "handling" && <>
        <div style={{background:C.goldLight,borderRadius:12,padding:"12px 14px",marginBottom:12,border:`0.5px solid #c8963c44`}}>
          <div style={{fontSize:12,fontWeight:700,color:"#7a5a1e",marginBottom:6}}>BITE RISK — LOW TO MEDIUM</div>
          <div style={{fontSize:13,color:"#555",lineHeight:1.6}}>Northern Blue-tongues can be more defensive than Eastern Blue-tongues, particularly as juveniles or unsocialised adults. Their bite is painless but can leave a bruise due to their strong jaw. With regular gentle handling they become very tame. Their large size makes them impressive and satisfying to handle.</div>
        </div>
        <div style={{background:C.cream,borderRadius:12,padding:"12px 14px",border:"0.5px solid #e8e8e4",fontSize:13,color:"#666",lineHeight:1.7}}>Support the full body when handling — they are heavy animals. Allow 2 weeks to settle before regular handling. Start with short 5–10 minute sessions and build gradually. Once tame they are calm and enjoy sitting on a warm lap. Wash hands before and after handling.</div>
      </>}
      {tab === "licencing" && <LegalTab note="Northern Blue-tongue Skinks require a standard keeper licence in most states. Must be purchased from a licensed breeder — wild collection is illegal." states={[{ abbr: "NSW", cat: "Standard keeper licence", ok: true }, { abbr: "VIC", cat: "Basic wildlife licence", ok: true }, { abbr: "QLD", cat: "Standard keeper licence", ok: true }, { abbr: "SA", cat: "Basic permit", ok: true }, { abbr: "WA", cat: "Standard licence", ok: true }, { abbr: "TAS", cat: "TAS natives only", ok: false }, { abbr: "ACT", cat: "Standard licence", ok: true }, { abbr: "NT", cat: "Check with authority", ok: true }]} />}
    </>}
  />
);

export default NorthernBlueTonguePage;
