import { T } from "../../../constants/theme";
import SectionLabel from "../../../components/SectionLabel";
import WarnBox from "../../../components/WarnBox";
import ShopBtn from "../../../components/ShopBtn";
import TempBar, { TempCard } from "../../../components/TempBar";
import FoodItem, { FOOD_CARD } from "../../../components/FoodItem";
import HealthItem from "../../../components/HealthItem";
import StatGrid from "../../../components/StatGrid";
import LegalTab from "../../../components/LegalTab";
import SpeciesPage from "../../../components/SpeciesPage";
import SnakeShedding from "../../../components/SnakeShedding";

// ─── Magnificent Tree Frog page ───────────────────────────────────
const MagnificentFrogPage = ({ onBack }) => (
  <SpeciesPage onBack={onBack} name="Magnificent Tree Frog" latin="Litoria splendida" emoji="🐸"
    badges={[["Intermediate", T.chipBg, T.chip], ["Australian native", T.infoBg, T.info], ["Native to WA & NT", T.infoBg, T.info]]}
    tabs={["overview","feeding","health & shedding","handling","licencing"]}
    tabContent={(tab) => <>
      {tab === "overview" && <>
        <p style={{fontSize: 15, color: T.body,lineHeight:1.6,marginBottom:14}}>Arguably Australia's most stunning tree frog. Found only in the Kimberley region of Western Australia and adjacent Northern Territory. Similar in appearance to the Green Tree Frog but distinguished by large glands on the head and behind the eyes that give them a more dramatic appearance. Larger, rarer, and more challenging to source than Green Tree Frogs — but a truly spectacular species for experienced frog keepers.</p>
        <SectionLabel mt={0}>Quick stats</SectionLabel>
        <StatGrid stats={[["📏","Adult size","8–13 cm"],["⏳","Lifespan","15–20 yrs"],["🏠","Min. enclosure","60 × 45 × 90 cm"],["💧","Humidity","60–80%"]]} />
        <WarnBox type="red" title="Limited availability">Magnificent Tree Frogs are endemic to the Kimberley and NT. They are less commonly available than Green Tree Frogs and command higher prices. Only available from specialist breeders. Confirm availability and licencing requirements carefully before purchasing.</WarnBox>
        <SectionLabel>Temperature requirements</SectionLabel>
        <TempCard>
          <TempBar label="Daytime ambient" value="26–30°C" width="60%" color="#e05a2b"/>
          <TempBar label="Nighttime low" value="20–24°C" width="36%" color="#2b7ec0"/>
        </TempCard>
        <SectionLabel>Enclosure setup</SectionLabel>
        <div style={{background:T.card,borderRadius:14,padding:"12px 14px",border: "none",fontSize: 15, color: T.body,lineHeight:1.7}}>A large tall enclosure with dense branching and live plants. Higher temperatures than Green Tree Frogs — they are from tropical north-western Australia. Large shallow water bowl. Heavy evening misting. Bioactive setups work excellently. The large parotoid glands on the head are a distinguishing feature — these are not a health concern.</div>
        <ShopBtn>Shop frog supplies</ShopBtn>
        <ShopBtn secondary>Ask a question ↗</ShopBtn>
      </>}
      {tab === "feeding" && <>
        <p style={{fontSize: 15, color: T.body,lineHeight:1.6,marginBottom:12}}>Insectivorous with a strong feeding response. Similar feeding requirements to Green Tree Frogs but their larger size means bigger prey items are appropriate for adults.</p>
        <div style={FOOD_CARD}>
          <FoodItem icon="🦗" name="Large crickets" detail="Staple feeder — gut load well" freq="Every 2–3 nights"/>
          <FoodItem icon="🦟" name="Wood Roaches (Woodies)" detail="Excellent Australian feeder" freq="Every 2–3 nights"/>
          <FoodItem icon="🐛" name="Silkworms / hornworms" detail="High moisture feeders" freq="Occasionally"/>
          <FoodItem icon="🐭" name="Pinky mice (large adults only)" detail="Very occasional protein boost" freq="Rarely"/>
        </div>
        <WarnBox type="red" title="Monitor weight carefully">Like all large tree frogs, obesity is a real risk. Fat deposits over the eyes indicate overfeeding. Feed 4–5 insects every 2–3 nights for adults — not every night.</WarnBox>
        <ShopBtn>Shop feeders & supplements</ShopBtn>
      </>}
      {tab === "health & shedding" && <>
        <SectionLabel mt={0}>Common health issues</SectionLabel>
        <HealthItem title="Chytridiomycosis" detail="All frogs are susceptible. Strict hygiene essential. Never release captive frogs into the wild."/>
        <HealthItem title="Obesity" detail="Common in all large tree frogs. Monitor body condition and reduce feeding if fat pads develop."/>
        <HealthItem title="Respiratory infection" detail="From temperatures too low or poor ventilation. Maintain warm tropical temperatures with excellent airflow."/>
        <HealthItem dot="#4a9e6b" title="Signs of good health" detail="Vivid green colouration, prominent head glands, active at night, feeding well, strong toe pad grip."/>
        <SnakeShedding animal="frog"/>
      </>}
      {tab === "handling" && <>
        <div style={{background:T.chipBg,borderRadius:14,padding:"12px 14px",marginBottom:12,border: "none"}}>
          <div style={{fontSize:12,fontWeight:700,color:T.chip,marginBottom:6}}>HANDLING — MINIMAL, CLEAN HANDS ESSENTIAL</div>
          <div style={{fontSize: 15, color: T.body,lineHeight:1.6}}>Magnificent Tree Frogs tolerate brief handling similarly to Green Tree Frogs. Their larger size makes them impressive to hold. Always wet hands with dechlorinated water before handling. Keep sessions brief and infrequent — these are primarily display animals.</div>
        </div>
        <div style={{background:T.card,borderRadius:14,padding:"12px 14px",border: "none",fontSize: 15, color: T.body,lineHeight:1.7}}>Wash and rinse hands with dechlorinated water before handling. Never handle after using any chemical products. Their large size and calm temperament make them one of the more handleable frog species — but handling should still be kept minimal.</div>
      </>}
      {tab === "licencing" && <LegalTab note="Can be kept in NSW, VIC, QLD, SA, WA, ACT and NT. Not permitted in TAS. No licence or permit needed in SA if captive-bred and lawfully sourced. Licence names are each authority's own; checked November 2026." states={[{ abbr: "NSW", cat: "Companion or Class 1 licence", ok: true }, { abbr: "VIC", cat: "Advanced licence", ok: true }, { abbr: "QLD", cat: "Standard licence", ok: true }, { abbr: "SA", cat: "No permit needed · confirm with authority", ok: true }, { abbr: "WA", cat: "Pet keeper's licence", ok: true }, { abbr: "TAS", cat: "Not permitted (TAS natives only)", ok: false }, { abbr: "ACT", cat: "Keeper licence (case by case)", ok: true }, { abbr: "NT", cat: "Permit to keep · confirm with authority", ok: true }]} />}
    </>}
  />
);

export default MagnificentFrogPage;
