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

// ─── Peron's Tree Frog page ──────────────────────────────────────
const PeronsFrogPage = ({ onBack }) => (
  <SpeciesPage onBack={onBack} name="Peron's Tree Frog" latin="Litoria peronii" emoji="🐸"
    badges={[["Beginner friendly", C.greenPale, C.green], ["Australian native", C.bluePale, C.blue], ["Nocturnal", C.goldLight, "#7a5a1e"]]}
    tabs={["overview","feeding","health & shedding","handling","licencing"]}
    tabContent={(tab) => <>
      {tab === "overview" && <>
        <p style={{fontSize:13,color:"#666",lineHeight:1.6,marginBottom:14}}>A beautiful and distinctive tree frog found across south-eastern Australia. Their grey-brown cryptic colouration with bright yellow and black inner thighs — revealed as a flash of colour when they jump — makes them unmistakable. Known for their loud, distinctive cackling call. An active and engaging species that adapts well to captivity.</p>
        <SectionLabel mt={0}>Quick stats</SectionLabel>
        <StatGrid stats={[["📏","Adult size","4–6.5 cm"],["⏳","Lifespan","8–12 yrs"],["🏠","Min. enclosure","45 × 45 × 60 cm"],["💧","Humidity","50–70%"]]} />
        <SectionLabel>Temperature requirements</SectionLabel>
        <TempBar label="Daytime ambient" value="20–26°C" width="44%" color="#e05a2b"/>
        <TempBar label="Nighttime low" value="14–18°C" width="22%" color="#2b7ec0"/>
        <WarnBox type="blue" title="Cooler temperate species">Peron's Tree Frogs are from temperate south-eastern Australia. They prefer cooler conditions than tropical species and tolerate a wide seasonal temperature variation — this is natural and healthy.</WarnBox>
        <SectionLabel>Enclosure setup</SectionLabel>
        <div style={{background:C.cream,borderRadius:12,padding:"12px 14px",border:"0.5px solid #e8e8e4",fontSize:13,color:"#666",lineHeight:1.7}}>A tall enclosure with branches and plants for climbing and hiding. Cork bark and leaf litter at ground level. A shallow water bowl. Mist one side of the enclosure each evening. Good ventilation is essential. They are excellent climbers and will use all vertical space available.</div>
        <ShopBtn>🛒 Shop frog supplies</ShopBtn>
        <ShopBtn secondary>Ask a question ↗</ShopBtn>
      </>}
      {tab === "feeding" && <>
        <p style={{fontSize:13,color:"#666",lineHeight:1.6,marginBottom:12}}>Insectivorous. Active hunters that respond well to moving prey. Feed at night when naturally active.</p>
        <div style={{background:C.cream,borderRadius:12,border:"0.5px solid #e8e8e4",padding:"0 14px"}}>
          <FoodItem icon="🦗" name="Crickets" detail="Staple feeder — gut load well" freq="Every 2–3 nights"/>
          <FoodItem icon="🦟" name="Wood Roaches (Woodies)" detail="Excellent Australian feeder" freq="Every 2–3 nights"/>
          <FoodItem icon="🪲" name="Mealworms" detail="Treat only — high fat" freq="Occasionally"/>
          <FoodItem icon="🐛" name="Silkworms" detail="Good hydration source" freq="Occasionally"/>
        </div>
        <WarnBox type="gold" title="Flash colour display when feeding">When Peron's Tree Frogs jump or are startled, they reveal their vivid yellow and black inner thighs — a deimatic (startle) display to confuse predators. Completely normal and spectacular to observe!</WarnBox>
        <ShopBtn>🛒 Shop feeders & supplements</ShopBtn>
      </>}
      {tab === "health & shedding" && <>
        <SectionLabel mt={0}>Common health issues</SectionLabel>
        <HealthItem title="Chytridiomycosis" detail="All frogs are susceptible. Strict hygiene essential. Never release captive frogs into the wild."/>
        <HealthItem title="Dehydration" detail="Ensure fresh dechlorinated water is always available. Mist the enclosure every evening."/>
        <HealthItem title="Stress from overhandling" detail="Peron's Tree Frogs can be more stress-prone than Green Tree Frogs. Keep handling to a minimum."/>
        <HealthItem dot="#4a9e6b" title="Signs of good health" detail="Active at night, calling (males), feeding well, good body condition, moist skin, using climbing structures."/>
        <SnakeShedding animal="frog"/>
      </>}
      {tab === "handling" && <>
        <div style={{background:C.goldLight,borderRadius:12,padding:"12px 14px",marginBottom:12,border:`0.5px solid #c8963c44`}}>
          <div style={{fontSize:12,fontWeight:700,color:"#7a5a1e",marginBottom:6}}>HANDLING — MINIMAL, CLEAN HANDS</div>
          <div style={{fontSize:13,color:"#555",lineHeight:1.6}}>Peron's Tree Frogs tolerate brief handling but are best kept as observation animals. They are more flighty than Green Tree Frogs. Always wet hands with dechlorinated water before any contact. Keep sessions very brief.</div>
        </div>
        <div style={{background:C.cream,borderRadius:12,padding:"12px 14px",border:"0.5px solid #e8e8e4",fontSize:13,color:"#666",lineHeight:1.7}}>Their flash colour display when disturbed is a highlight of keeping this species — enjoy it during brief, calm handling sessions. Never handle after using any chemical products on hands.</div>
      </>}
      {tab === "licencing" && <LegalTab note="Can be kept in NSW, VIC, QLD, SA and ACT. Not permitted in WA, TAS and NT. No licence or permit needed in SA if captive-bred and lawfully sourced. Licence names are each authority's own; checked November 2026." states={[{ abbr: "NSW", cat: "Companion or Class 1 licence", ok: true }, { abbr: "VIC", cat: "Basic licence", ok: true }, { abbr: "QLD", cat: "Standard licence", ok: true }, { abbr: "SA", cat: "No permit needed · confirm with authority", ok: true }, { abbr: "WA", cat: "Not permitted", ok: false }, { abbr: "TAS", cat: "Not permitted (TAS natives only)", ok: false }, { abbr: "ACT", cat: "Keeper licence (case by case)", ok: true }, { abbr: "NT", cat: "Not permitted", ok: false }]} />}
    </>}
  />
);

export default PeronsFrogPage;
