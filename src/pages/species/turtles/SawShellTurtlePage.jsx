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

// ─── Saw-shelled Turtle page ──────────────────────────────────────
const SawShellTurtlePage = ({ onBack }) => (
  <SpeciesPage onBack={onBack} name="Saw-shelled Turtle" latin="Myuchelys latisternum" emoji="🐢"
    badges={[["Intermediate", T.chipBg, T.chip], ["Australian native", T.infoBg, T.info], ["Native to QLD & NSW", T.infoBg, T.info]]}
    tabs={["overview","feeding","health & setup","handling","licencing"]}
    tabContent={(tab) => <>
      {tab === "overview" && <>
        <p style={{fontSize: 15, color: T.body,lineHeight:1.6,marginBottom:14}}>A distinctive turtle found in the rivers and streams of coastal Queensland and New South Wales. Named for the serrated, saw-like edges on the rear of their shell — particularly prominent in juveniles. A shorter-necked side-necked turtle like the Murray River Turtle. Active and alert, with an aggressive feeding response that makes feeding time entertaining.</p>
        <SectionLabel mt={0}>Quick stats</SectionLabel>
        <StatGrid stats={[["📏","Shell length","22–28 cm"],["⏳","Lifespan","25–35+ yrs"],["🏠","Min. tank","300L+"],["💧","Water temp","20–26°C"]]} />
        <WarnBox type="gold" title="Four states only">Saw-shelled Turtles can be kept in NSW, Victoria, Queensland and South Australia. They can't be kept in WA, Tasmania or the ACT, and turtles can't be imported into the NT. Check current requirements with your state wildlife authority.</WarnBox>
        <SectionLabel>Tank setup</SectionLabel>
        <div style={{background:T.card,borderRadius:14,padding:"12px 14px",border: "none",fontSize: 15, color: T.body,lineHeight:1.7}}>A 300L+ tank for one adult. Large basking platform with heat lamp and UVB above. High-quality canister filtration — they are messy feeders. Regular weekly 25–30% water changes. They prefer slightly warmer water than Murray River Turtles, reflecting their more tropical habitat. Provide plenty of open swimming space.</div>
        <TempCard>
          <TempBar label="Basking spot (air temp)" value="28–32°C" width="66%" color="#e05a2b"/>
          <TempBar label="Water temperature" value="20–26°C" width="44%" color="#2b7ec0"/>
        </TempCard>
        <ShopBtn>Shop turtle supplies</ShopBtn>
        <ShopBtn secondary>Ask a question ↗</ShopBtn>
      </>}
      {tab === "feeding" && <>
        <p style={{fontSize: 15, color: T.body,lineHeight:1.6,marginBottom:12}}>Primarily carnivorous with an aggressive feeding response. One of the most enthusiastic feeders of all Australian turtles — use tongs to avoid accidental bites.</p>
        <div style={FOOD_CARD}>
          <FoodItem icon="🐟" name="Feeder fish / whitebait" detail="Eagerly taken — whole fish for calcium" freq="2–3x per week"/>
          <FoodItem icon="🦐" name="Prawns / yabbies" detail="Shell-on preferred" freq="2–3x per week"/>
          <FoodItem icon="🪱" name="Earthworms" detail="Natural prey — taken enthusiastically" freq="Weekly"/>
          <FoodItem icon="🦗" name="Crickets / woodies" detail="Drop into water — provides enrichment" freq="Weekly"/>
          <FoodItem icon="🐢" name="Turtle pellets" detail="Quality commercial pellets" freq="2–3x per week"/>
        </div>
        <WarnBox type="red" title="Aggressive feeder — use tongs always">Saw-shelled Turtles have an extremely fast and enthusiastic feeding strike. Always use long tongs. Never put fingers near the water surface during feeding — even experienced keepers get caught out by their speed.</WarnBox>
        <ShopBtn>Shop turtle food</ShopBtn>
      </>}
      {tab === "health & setup" && <>
        <SectionLabel mt={0}>Common health issues</SectionLabel>
        <HealthItem title="Shell rot" detail="Monitor the serrated shell edges carefully — these irregular areas can trap debris and develop infections. Regular visual checks are important."/>
        <HealthItem title="Water quality" detail="Their aggressive feeding style means they are very messy eaters. Feed in a separate container or remove uneaten food within 20 minutes."/>
        <HealthItem title="Respiratory infection" detail="Listing to one side or bubbles from the nose indicate respiratory problems. Prompt vet attention required."/>
        <HealthItem dot="#4a9e6b" title="Signs of good health" detail="Active and alert, enthusiastic feeder, basking regularly, clear bright eyes, hard smooth shell with intact serrations."/>
        <SectionLabel>Feeding tip</SectionLabel>
        <div style={{background:T.card,borderRadius:14,padding:"12px 14px",border: "none",fontSize: 15, color: T.body,lineHeight:1.7}}>Many keepers of Saw-shelled Turtles feed them in a separate container (a bucket or tub) to keep the main tank cleaner. Move the turtle to the feeding container, offer food with tongs, then return to the main tank after 20–30 minutes.</div>
      </>}
      {tab === "handling" && <>
        <div style={{background:T.chipBg,borderRadius:14,padding:"12px 14px",marginBottom:12,border: "none"}}>
          <div style={{fontSize:12,fontWeight:700,color:T.chip,marginBottom:6}}>HANDLING — EXPERIENCED KEEPERS</div>
          <div style={{fontSize: 15, color: T.body,lineHeight:1.6}}>Saw-shelled Turtles can be defensive and their bites are fast and painful. Hold firmly at the sides of the shell — their neck can reach further back than you might expect. Keep handling minimal and always wash hands thoroughly after.</div>
        </div>
        <WarnBox type="red" title="Fast biter">The Saw-shelled Turtle has one of the fastest feeding strikes of any Australian turtle. Even outside of feeding time they can be defensive biters. Hold at the very back of the shell and keep fingers away from the neck area.</WarnBox>
        <WarnBox type="gold" title="Salmonella risk">All turtles can carry Salmonella. Always wash hands after handling or working with aquarium water.</WarnBox>
      </>}
      {tab === "licencing" && <LegalTab note="Can be kept in NSW, VIC, QLD and SA. Not permitted in WA, TAS, ACT and NT. Licence names are each authority's own; checked November 2026." states={[{ abbr: "NSW", cat: "Companion or Class 1 licence", ok: true }, { abbr: "VIC", cat: "Basic licence", ok: true }, { abbr: "QLD", cat: "Standard licence", ok: true }, { abbr: "SA", cat: "Basic permit (one animal permit-free)", ok: true }, { abbr: "WA", cat: "Not permitted", ok: false }, { abbr: "TAS", cat: "Not permitted (TAS natives only)", ok: false }, { abbr: "ACT", cat: "Not permitted", ok: false }, { abbr: "NT", cat: "Not permitted · confirm with authority", ok: false }]} />}
    </>}
  />
);

export default SawShellTurtlePage;
