import { T } from "../../../constants/theme";
import SectionLabel from "../../../components/SectionLabel";
import WarnBox from "../../../components/WarnBox";
import BaskingBanner from "../../../components/BaskingBanner";
import ShopBtn from "../../../components/ShopBtn";
import TempBar, { TempCard } from "../../../components/TempBar";
import FoodItem, { FOOD_CARD } from "../../../components/FoodItem";
import HealthItem from "../../../components/HealthItem";
import StatGrid from "../../../components/StatGrid";
import LegalTab from "../../../components/LegalTab";
import SpeciesPage from "../../../components/SpeciesPage";
import SnakeShedding from "../../../components/SnakeShedding";

// ─── Black-spotted Ridge-tailed Monitor page ────────────────────────────────────
const RidgeTailedMonitorPage = ({ onBack }) => (
  <SpeciesPage onBack={onBack} name="Black-spotted Ridge-tailed Monitor" latin="Varanus baritji" emoji="🦎"
    badges={[["Intermediate", T.chipBg, T.chip], ["Australian native", T.infoBg, T.info], ["Native to the NT", T.infoBg, T.info]]}
    tabs={["overview","feeding","health","handling","licencing"]}
    tabContent={(tab) => <>
      {tab === "overview" && <>
        <p style={{fontSize: 15, color: T.body,lineHeight:1.6,marginBottom:14}}>Similar in appearance to the Ackie Monitor but from a different part of Australia — found only in the rocky outcrops and escarpments of the Northern Territory. Their strongly keeled, spiny tail scales give them their name. Hardy and active, with care requirements almost identical to the Ackie Monitor. A less commonly available but equally impressive alternative to the Ackie.</p>
        <SectionLabel mt={0}>Quick stats</SectionLabel>
        <StatGrid stats={[["📏","Adult size","55–75 cm"],["⏳","Lifespan","15–20 yrs"],["🏠","Min. enclosure","120 × 60 × 60 cm"],["💧","Humidity","25–40%"]]} />
        <BaskingBanner range="50–60°C" title="Very hot basking spot essential">Like the Ackie Monitor, Ridge-tailed Monitors require a very hot basking spot — 50–60°C surface temperature. This is essential for digestion and health.</BaskingBanner>
        <SectionLabel>Temperature requirements</SectionLabel>
        <TempCard>
          <TempBar label="Basking surface temp" value="50–60°C" width="100%" color="#cc2200"/>
          <TempBar label="Warm side ambient" value="32–36°C" width="74%" color="#e05a2b"/>
          <TempBar label="Cool side" value="26–28°C" width="52%" color="#4a9e6b"/>
          <TempBar label="Overnight low" value="20–22°C" width="30%" color="#2b7ec0"/>
        </TempCard>
        <SectionLabel>Enclosure setup</SectionLabel>
        <div style={{background:T.card,borderRadius:14,padding:"12px 14px",border: "none",fontSize: 15, color: T.body,lineHeight:1.7}}>Almost identical to Ackie Monitor setup. 120×60×60cm minimum for one adult. Deep sandy substrate (20–30cm) for burrowing. Large flat rock under basking lamp. Multiple hides at both ends. Branches and cork bark for enrichment. A damp sand corner for shedding assistance. These monitors are from rocky escarpment habitat so rock piles and crevice hides are particularly appreciated.</div>
        <ShopBtn>Shop monitor supplies</ShopBtn>
        <ShopBtn secondary>Ask a question ↗</ShopBtn>
      </>}
      {tab === "feeding" && <>
        <p style={{fontSize: 15, color: T.body,lineHeight:1.6,marginBottom:12}}>Carnivorous. Almost identical feeding requirements to the Ackie Monitor. A varied diet of insects and occasional small vertebrates.</p>
        <div style={FOOD_CARD}>
          <FoodItem icon="🦗" name="Large crickets / Wood Roaches" detail="Staple feeders — gut load well" freq="Every 2 days (juveniles), 3x week (adults)"/>
          <FoodItem icon="🥚" name="Quail eggs" detail="Natural prey — nutritious treat" freq="Weekly"/>
          <FoodItem icon="🐭" name="Pinky / fuzzy mice (adults)" detail="Occasional protein boost" freq="Monthly"/>
          <FoodItem icon="🪲" name="Superworms" detail="Good variety item" freq="Weekly"/>
        </div>
        <WarnBox type="gold" title="Similar to Ackie Monitor">Feeding requirements and frequency are almost identical to the Ackie Monitor. Refer to general monitor feeding guidance — variety and gut-loading are key.</WarnBox>
        <ShopBtn>Shop feeders & supplements</ShopBtn>
      </>}
      {tab === "health" && <>
        <SectionLabel mt={0}>Common health issues</SectionLabel>
        <HealthItem title="Insufficient basking heat" detail="The most critical requirement. Without adequate basking heat (50–60°C surface), these monitors cannot thrive. Always verify with an infrared thermometer."/>
        <HealthItem title="Parasites" detail="Annual faecal tests recommended. Quarantine all new animals."/>
        <HealthItem title="MBD" detail="From insufficient UVB or calcium. High-output UVB and calcium supplementation at every feed for juveniles."/>
        <HealthItem dot="#4a9e6b" title="Signs of good health" detail="Active during the day, regular basking, feeding well, complete sheds, good body condition, bright alert eyes."/>
        <SnakeShedding animal="lizard"/>
      </>}
      {tab === "handling" && <>
        <div style={{background:T.chipBg,borderRadius:14,padding:"12px 14px",marginBottom:12,border: "none"}}>
          <div style={{fontSize:12,fontWeight:700,color:T.chip,marginBottom:6}}>BITE RISK — MEDIUM</div>
          <div style={{fontSize: 15, color: T.body,lineHeight:1.6}}>Ridge-tailed Monitors are generally considered more defensive than Ackies. They can be fast and nippy as juveniles. With patient consistent handling they tame down well. Hook-train before every session. Their spiny tail can scratch — be aware.</div>
        </div>
        <div style={{background:T.card,borderRadius:14,padding:"12px 14px",border: "none",fontSize: 15, color: T.body,lineHeight:1.7}}>Same approach as Ackie Monitors. Hook-train, support full body, start short and build gradually. Less commonly kept than Ackies so community experience is somewhat limited — connect with experienced Ridge-tail keepers for species-specific advice.</div>
      </>}
      {tab === "licencing" && <LegalTab note="Can be kept in NSW, QLD, SA, ACT and NT. Not permitted in VIC, WA and TAS. Licence names are each authority's own; checked November 2026." states={[{ abbr: "NSW", cat: "Advanced licence", ok: true }, { abbr: "VIC", cat: "Not permitted · confirm with authority", ok: false }, { abbr: "QLD", cat: "Specialised licence", ok: true }, { abbr: "SA", cat: "Basic permit (one animal permit-free)", ok: true }, { abbr: "WA", cat: "Not permitted", ok: false }, { abbr: "TAS", cat: "Not permitted (TAS natives only)", ok: false }, { abbr: "ACT", cat: "Keeper licence (case by case)", ok: true }, { abbr: "NT", cat: "Permit to keep", ok: true }]} />}
    </>}
  />
);

export default RidgeTailedMonitorPage;
