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

// ─── Rankins Dragon page ──────────────────────────────────────────
const RankinsDragonPage = ({ onBack }) => (
  <SpeciesPage onBack={onBack} name="Pygmy Bearded Dragon" latin="Pogona henrylawsoni" emoji="🦎"
    badges={[["Beginner friendly", T.chipBg, T.accentText], ["Australian native", T.infoBg, T.info], ["Compact size", T.chipBg, T.chip]]}
    tabs={["overview","feeding","health & shedding","handling","licencing"]}
    tabContent={(tab) => <>
      {tab === "overview" && <>
        <p style={{fontSize: 15, color: T.body,lineHeight:1.6,marginBottom:14}}>A smaller, more compact alternative to the Central Bearded Dragon. Found in Queensland's black-soil plains. Also known as Rankins Dragon, Lawson's Dragon, and the Black-soil Beardie. They share the friendly temperament of their bearded dragon cousins but require less space — perfect for keepers with limited room.</p>
        <SectionLabel mt={0}>Quick stats</SectionLabel>
        <StatGrid stats={[["📏","Adult size","25–30 cm"],["⏳","Lifespan","8–12 yrs"],["🏠","Min. enclosure","90 × 45 cm"],["💧","Humidity","30–40%"]]} />
        <SectionLabel>Temperature requirements</SectionLabel>
        <TempCard>
          <TempBar label="Basking spot" value="38–42°C" width="88%" color="#e05a2b"/>
          <TempBar label="Warm side" value="28–32°C" width="66%" color="#e0922b"/>
          <TempBar label="Cool side" value="22–26°C" width="44%" color="#4a9e6b"/>
          <TempBar label="Overnight low" value="18–22°C" width="28%" color="#2b7ec0"/>
        </TempCard>
        <WarnBox type="blue" title="UVB lighting essential">Like all bearded dragons, Rankins require high-output UVB. T5 HO 10.0 or 12% tube. They are more heat-tolerant than Central Beardies but still need proper UVB.</WarnBox>
        <SectionLabel>Enclosure setup</SectionLabel>
        <div style={{background:T.card,borderRadius:14,padding:"12px 14px",border: "none",fontSize: 15, color: T.body,lineHeight:1.7}}>A 90×45cm enclosure suits one adult comfortably. Rankins Dragons can be kept in pairs or small groups more successfully than Central Beardies — but monitor carefully for competition at feeding time. Same setup as Central Bearded Dragon — basking rock or branch, cool hide, fresh vegetables daily.</div>
        <WarnBox type="gold" title="Can be housed in pairs">Unlike most reptiles, Rankins Dragons tolerate cohabitation reasonably well. Always provide multiple basking spots and feeding stations. Separate if aggression is observed.</WarnBox>
        <ShopBtn>Shop Rankins Dragon supplies</ShopBtn>
        <ShopBtn secondary>Ask a question ↗</ShopBtn>
      </>}
      {tab === "feeding" && <>
        <p style={{fontSize: 15, color: T.body,lineHeight:1.6,marginBottom:12}}>Omnivores with the same dietary requirements as Central Bearded Dragons. Diet varies with age.</p>
        <div style={FOOD_CARD}>
          <FoodItem icon="🦗" name="Crickets / roaches" detail="Protein staple — appropriately sized" freq="Daily (juveniles), 3x week (adults)"/>
          <FoodItem icon="🥬" name="Leafy greens" detail="Collard greens, kale, endive, rocket" freq="Daily"/>
          <FoodItem icon="🫑" name="Vegetables" detail="Capsicum, squash, beans" freq="Daily"/>
        </div>
        <WarnBox type="gold" title="Smaller prey for smaller dragon">Rankins Dragons are smaller than Bearded Dragons — ensure all prey items are appropriately sized. Maximum prey size should be no wider than the space between the dragon's eyes.</WarnBox>
        <ShopBtn>Shop feeders & supplements</ShopBtn>
      </>}
      {tab === "health & shedding" && <>
        <SectionLabel mt={0}>Common health issues</SectionLabel>
        <HealthItem title="MBD" detail="Same risk as all bearded dragons. Proper UVB and calcium supplementation prevents this entirely."/>
        <HealthItem title="Cohabitation stress" detail="If housing together, watch for one animal bullying or outcompeting the other at feeding time. Separate if one animal loses weight."/>
        <HealthItem title="Parasites" detail="Annual faecal tests recommended. Common in wild-caught animals."/>
        <HealthItem dot="#4a9e6b" title="Signs of good health" detail="Alert and active during the day, basking regularly, eating well, firm body condition, clear eyes."/>
        <SnakeShedding animal="lizard" />
      </>}
      {tab === "handling" && <>
        <div style={{background:T.chipBg,borderRadius:14,padding:"12px 14px",marginBottom:12,border: "none"}}>
          <div style={{fontSize:12,fontWeight:700,color:T.accentText,marginBottom:6}}>BITE RISK — VERY LOW</div>
          <div style={{fontSize: 15, color: T.body,lineHeight:1.6}}>Rankins Dragons are exceptionally calm and handleable — arguably even more docile than Central Bearded Dragons. Their small size makes them easy to manage and a great choice for children. They rarely show defensive behaviour.</div>
        </div>
        <div style={{background:T.card,borderRadius:14,padding:"12px 14px",border: "none",fontSize: 15, color: T.body,lineHeight:1.7}}>Same handling approach as Bearded Dragons. Support the full body, start with short sessions, build gradually. Their small size means they move quickly — handle over a soft surface initially.</div>
      </>}
      {tab === "licencing" && <LegalTab note="Can be kept in NSW, VIC, QLD, SA, ACT and NT. Not permitted in WA and TAS. Licence names are each authority's own; checked November 2026." states={[{ abbr: "NSW", cat: "Companion or Class 1 licence", ok: true }, { abbr: "VIC", cat: "Advanced licence", ok: true }, { abbr: "QLD", cat: "Standard licence", ok: true }, { abbr: "SA", cat: "Basic permit (one animal permit-free)", ok: true }, { abbr: "WA", cat: "Not permitted", ok: false }, { abbr: "TAS", cat: "Not permitted (TAS natives only)", ok: false }, { abbr: "ACT", cat: "Keeper licence (case by case)", ok: true }, { abbr: "NT", cat: "Import + keep permit (case by case)", ok: true }]} />}
    </>}
  />
);

export default RankinsDragonPage;
