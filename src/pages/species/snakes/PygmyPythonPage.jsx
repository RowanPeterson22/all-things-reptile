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
import SnakeHandling from "../../../components/SnakeHandling";
import SnakeBreeding from "../../../components/SnakeBreeding";

// ─── Pygmy Python page ────────────────────────────────────────────
const PygmyPythonPage = ({ onBack }) => (
  <SpeciesPage onBack={onBack} name="Pygmy Python" latin="Antaresia perthensis" emoji="🐍"
    badges={[["Beginner friendly", T.chipBg, T.accentText], ["Australian native", T.infoBg, T.info], ["Nocturnal", T.chipBg, T.chip]]}
    tabs={["overview","feeding","health & shedding","handling & breeding","licencing"]}
    tabContent={(tab) => <>
      {tab === "overview" && <>
        <p style={{fontSize: 15, color: T.body,lineHeight:1.6,marginBottom:14}}>Australia's smallest python and one of the world's smallest python species. Found in the Pilbara region of Western Australia. Despite their tiny size they make fascinating and rewarding pets — perfect for keepers with limited space.</p>
        <SectionLabel mt={0}>Quick stats</SectionLabel>
        <StatGrid stats={[["📏","Adult size","40–60 cm"],["⏳","Lifespan","15–20 yrs"],["🏠","Min. enclosure","60 × 45 cm"],["💧","Humidity","40–55%"]]} />
        <SectionLabel>Temperature requirements</SectionLabel>
        <TempCard>
          <TempBar label="Basking spot" value="32–34°C" width="75%" color="#e05a2b"/>
          <TempBar label="Warm side" value="27–30°C" width="60%" color="#e0922b"/>
          <TempBar label="Cool side" value="22–25°C" width="42%" color="#4a9e6b"/>
          <TempBar label="Overnight low" value="18–20°C" width="26%" color="#2b7ec0"/>
        </TempCard>
        <SectionLabel>Enclosure setup</SectionLabel>
        <div style={{background:T.card,borderRadius:14,padding:"12px 14px",border: "none",fontSize: 15, color: T.body,lineHeight:1.7}}>Small timber or PVC enclosure. Snug hides are essential — Pygmy Pythons feel most secure in very tight spaces. Newspaper or paper towel substrate. A small water bowl. Despite their small size they are active and curious at night.</div>
        <WarnBox type="gold" title="WA restricted species">Pygmy Pythons originate from WA. Check current availability in your state as interstate movement of some Antaresia species may require additional permits.</WarnBox>
        <ShopBtn>Shop Pygmy Python supplies</ShopBtn>
        <ShopBtn secondary>Ask a question ↗</ShopBtn>
      </>}
      {tab === "feeding" && <>
        <p style={{fontSize: 15, color: T.body,lineHeight:1.6,marginBottom:12}}>Carnivorous. Due to their small size, Pygmy Pythons eat pinky mice for most of their lives. Always use tongs and pre-killed or frozen/thawed prey.</p>
        <div style={FOOD_CARD}>
          <FoodItem icon="🐭" name="Pinky mice" detail="Main prey item — appropriately sized" freq="Every 5–7 days"/>
          <FoodItem icon="🐭" name="Fuzzy mice" detail="Large adults only" freq="Every 7–10 days"/>
        </div>
        <WarnBox type="gold" title="Size matters">Never feed prey wider than the widest part of the snake's body. For Pygmy Pythons this usually means pinky mice throughout their lives.</WarnBox>
        <WarnBox type="red" title="Feeding response">Despite their small size, Pygmy Pythons can have a strong feeding response. Always use tongs and hook-train.</WarnBox>
        <ShopBtn>Shop feeders</ShopBtn>
      </>}
      {tab === "health & shedding" && <>
        <SectionLabel mt={0}>Common health issues</SectionLabel>
        <HealthItem title="Respiratory infection" detail="Watch for wheezing or mucus. Keep temperatures appropriate and humidity not too high."/>
        <HealthItem title="Mites" detail="Check regularly — even small pythons can carry mites. Full enclosure treatment required."/>
        <HealthItem title="Regurgitation" detail="Common if prey is too large or handling occurs too soon after feeding. Fast for 2 weeks after regurgitation."/>
        <HealthItem dot="#4a9e6b" title="Signs of good health" detail="Active at night, alert, strong feeding response, regular shedding, clean vent."/>
        <SnakeShedding />
      </>}
      {tab === "handling & breeding" && <>
        <SnakeHandling biteRisk="low" notes="Pygmy Pythons are generally calm for their size. Hatchlings can be nippy — handle carefully given they are very small and delicate. Regular gentle handling builds confidence. Their small size means they can move quickly." />
        <SnakeBreeding clutchSize="2–5 eggs" incubationTemp="30–32°C" incubationDays="55–65 days" maturityAge="2–3 years" notes="One of the smallest clutch sizes of any python — typically just 2–5 eggs. Requires a winter cooling period. Eggs are relatively large compared to the female's body size. A rewarding breeding project given their rarity in captivity." />
      </>}
      {tab === "licencing" && <LegalTab note="Can be kept in NSW, VIC, QLD, SA, WA, ACT and NT. Not permitted in TAS. Licence names are each authority's own; checked November 2026." states={[{ abbr: "NSW", cat: "Companion or Class 1 licence", ok: true }, { abbr: "VIC", cat: "Advanced licence", ok: true }, { abbr: "QLD", cat: "Standard licence", ok: true }, { abbr: "SA", cat: "Specialist permit", ok: true }, { abbr: "WA", cat: "Pet keeper's licence", ok: true }, { abbr: "TAS", cat: "Not permitted (TAS natives only)", ok: false }, { abbr: "ACT", cat: "Keeper licence (case by case)", ok: true }, { abbr: "NT", cat: "Import + keep permit (case by case)", ok: true }]} />}
    </>}
  />
);

export default PygmyPythonPage;
