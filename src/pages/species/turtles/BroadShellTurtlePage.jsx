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

// ─── Broad-shelled Turtle page ────────────────────────────────────
const BroadShellTurtlePage = ({ onBack }) => (
  <SpeciesPage onBack={onBack} name="Broad-shelled Turtle" latin="Chelodina expansa" emoji="🐢"
    badges={[["Intermediate", T.chipBg, T.chip], ["Australian native", T.infoBg, T.info], ["Large species", T.noBg, T.no]]}
    tabs={["overview","feeding","health & setup","handling","licencing"]}
    tabContent={(tab) => <>
      {tab === "overview" && <>
        <p style={{fontSize: 15, color: T.body,lineHeight:1.6,marginBottom:14}}>Australia's largest freshwater turtle and one of the largest side-necked turtles in the world. Found in the Murray-Darling river system and coastal rivers of eastern Australia. An impressive animal requiring a very large aquatic setup — not suitable for small spaces. Their broad, flattened shell and enormous neck make them unmistakable.</p>
        <SectionLabel mt={0}>Quick stats</SectionLabel>
        <StatGrid stats={[["📏","Shell length","35–48 cm"],["⏳","Lifespan","50+ yrs"],["🏠","Min. tank","500L+"],["💧","Water temp","18–24°C"]]} />
        <WarnBox type="red" title="Very large species — significant space required">Broad-shelled Turtles are one of Australia's largest reptiles. A 500L+ tank is the minimum for an adult — many keepers use custom-built pond systems. Do not underestimate the space and filtration requirements of this species.</WarnBox>
        <SectionLabel>Tank setup</SectionLabel>
        <div style={{background:T.card,borderRadius:14,padding:"12px 14px",border: "none",fontSize: 15, color: T.body,lineHeight:1.7}}>A very large tank or custom pond setup is essential. Industrial-grade canister filtration — they produce enormous amounts of waste. Large basking platform with heat lamp and UVB above. Water depth sufficient for full submersion. Weekly 30–40% water changes are the minimum. Many keepers of large Broad-shells transition to outdoor pond systems as the animal grows.</div>
        <TempCard>
          <TempBar label="Basking spot (air temp)" value="28–32°C" width="66%" color="#e05a2b"/>
          <TempBar label="Water temperature" value="18–24°C" width="36%" color="#2b7ec0"/>
        </TempCard>
        <ShopBtn>Shop turtle supplies</ShopBtn>
        <ShopBtn secondary>Ask a question ↗</ShopBtn>
      </>}
      {tab === "feeding" && <>
        <p style={{fontSize: 15, color: T.body,lineHeight:1.6,marginBottom:12}}>Primarily carnivorous. Adults are powerful predators capable of taking surprisingly large prey. Their long neck strikes with remarkable speed — use tongs when feeding.</p>
        <div style={FOOD_CARD}>
          <FoodItem icon="🐟" name="Whole fish" detail="Large whitebait, smelt, small fish" freq="2–3x per week"/>
          <FoodItem icon="🦐" name="Prawns / yabbies" detail="Shell-on for calcium" freq="2–3x per week"/>
          <FoodItem icon="🪱" name="Large earthworms" detail="Excellent protein source" freq="Weekly"/>
          <FoodItem icon="🐢" name="Quality turtle pellets" detail="Large pellets for adult turtles" freq="2–3x per week"/>
        </div>
        <WarnBox type="red" title="Powerful strike — use tongs">Broad-shelled Turtles have a very fast and powerful neck strike when feeding. Always use long tongs to offer food — never fingers near the water surface during feeding time.</WarnBox>
        <ShopBtn>Shop turtle food</ShopBtn>
      </>}
      {tab === "health & setup" && <>
        <SectionLabel mt={0}>Common health issues</SectionLabel>
        <HealthItem title="Shell rot" detail="Serious risk with insufficient basking or poor water quality. Their large shell size means infections can become extensive before being noticed. Inspect the shell regularly."/>
        <HealthItem title="Water quality issues" detail="Their large size and appetite means they produce a lot of waste. Poor filtration rapidly leads to health problems. Invest in the best filtration available."/>
        <HealthItem title="Respiratory infection" detail="Uneven floating or listing to one side indicates respiratory issues. Prompt veterinary attention required."/>
        <HealthItem dot="#4a9e6b" title="Signs of good health" detail="Active and alert in water, basking regularly, eating well, hard smooth broad shell, bright eyes."/>
        <SectionLabel>Water quality</SectionLabel>
        <div style={{background:T.card,borderRadius:14,padding:"12px 14px",border: "none",fontSize: 15, color: T.body,lineHeight:1.7}}>Weekly water testing is essential. Ammonia and nitrite must be zero. Nitrates below 20ppm. For large setups, consider a sump filter or multiple canister filters running in series. An outdoor pond with a biological filter is ideal for large adults.</div>
      </>}
      {tab === "handling" && <>
        <div style={{background:T.noBg,borderRadius:14,padding:"12px 14px",marginBottom:12,border: "none"}}>
          <div style={{fontSize:12,fontWeight:700,color:T.no,marginBottom:6}}>HANDLING — EXPERIENCED KEEPERS ONLY</div>
          <div style={{fontSize: 15, color: T.body,lineHeight:1.6}}>Large Broad-shelled Turtles require two people to handle safely. Their powerful neck can reach all the way to the back of their shell — hold at the very back of the shell on each side. They can inflict painful bites and their claws are sharp. Minimise handling to health checks only.</div>
        </div>
        <WarnBox type="red" title="Musk gland warning">Like all long-necked turtles, Broad-shells release a very pungent musk when stressed. Handle over a sink or outdoors.</WarnBox>
      </>}
      {tab === "licencing" && <LegalTab note="Can be kept in NSW, VIC, QLD, SA and ACT. Not permitted in WA, TAS and NT. Licence names are each authority's own; checked November 2026." states={[{ abbr: "NSW", cat: "Advanced licence", ok: true }, { abbr: "VIC", cat: "Basic licence", ok: true }, { abbr: "QLD", cat: "Standard licence", ok: true }, { abbr: "SA", cat: "Basic permit (one animal permit-free)", ok: true }, { abbr: "WA", cat: "Not permitted", ok: false }, { abbr: "TAS", cat: "Not permitted (TAS natives only)", ok: false }, { abbr: "ACT", cat: "Keeper licence (case by case)", ok: true }, { abbr: "NT", cat: "Not permitted", ok: false }]} />}
    </>}
  />
);

export default BroadShellTurtlePage;
