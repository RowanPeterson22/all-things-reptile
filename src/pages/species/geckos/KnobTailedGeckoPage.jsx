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

// ─── Knob-tailed Gecko page ───────────────────────────────────────
const KnobTailedGeckoPage = ({ onBack }) => (
  <SpeciesPage onBack={onBack} name="Knob-tailed Gecko" latin="Nephrurus spp." emoji="🦎"
    badges={[["Intermediate", T.chipBg, T.chip], ["Australian native", T.infoBg, T.info], ["Nocturnal", T.chipBg, T.accentText]]}
    tabs={["overview","feeding","health & shedding","handling","licencing"]}
    tabContent={(tab) => <>
      {tab === "overview" && <>
        <p style={{fontSize: 15, color: T.body,lineHeight:1.6,marginBottom:14}}>A fascinating group of uniquely Australian geckos — instantly recognisable by their distinctive bulbous knob at the end of a short, stubby tail. Multiple species are kept in captivity including the Smooth Knob-tail (N. levis), Rough Knob-tail (N. amyae), and Common Knob-tail (N. milii). Arid-adapted, nocturnal, and full of personality.</p>
        <SectionLabel mt={0}>Quick stats</SectionLabel>
        <StatGrid stats={[["📏","Adult size","10–20 cm"],["⏳","Lifespan","12–20 yrs"],["🏠","Min. enclosure","60 × 45 cm"],["💧","Humidity","20–35%"]]} />
        <SectionLabel>Temperature requirements</SectionLabel>
        <TempCard>
          <TempBar label="Warm side" value="28–32°C" width="66%" color="#e05a2b"/>
          <TempBar label="Cool side" value="20–24°C" width="36%" color="#4a9e6b"/>
          <TempBar label="Overnight low" value="16–20°C" width="24%" color="#2b7ec0"/>
        </TempCard>
        <WarnBox type="gold" title="Cooler temps than most reptiles">Knob-tailed Geckos are from arid Australia and prefer cooler temperatures than many tropical species. Overheating is a significant risk — never exceed 35°C anywhere in the enclosure.</WarnBox>
        <SectionLabel>Enclosure setup</SectionLabel>
        <div style={{background:T.card,borderRadius:14,padding:"12px 14px",border: "none",fontSize: 15, color: T.body,lineHeight:1.7}}>A 60×45cm enclosure suits one adult. Low, wide enclosure preferred — they are ground-dwelling and do not climb. Sandy or red clay-based substrate to mimic their natural habitat. Multiple cork bark hides. A small shallow water bowl. Under-tank heat mat on one side controlled by thermostat. Low humidity is critical — good ventilation essential.</div>
        <ShopBtn>Shop Knob-tailed Gecko supplies</ShopBtn>
        <ShopBtn secondary>Ask a question ↗</ShopBtn>
      </>}
      {tab === "feeding" && <>
        <p style={{fontSize: 15, color: T.body,lineHeight:1.6,marginBottom:12}}>Insectivores. Feed a variety of live insects at night when they are naturally active. Always gut-load and dust prey with supplements.</p>
        <div style={FOOD_CARD}>
          <FoodItem icon="🦗" name="Crickets" detail="Staple feeder — appropriate size" freq="Every 2–3 nights"/>
          <FoodItem icon="🪲" name="Mealworms" detail="Good treat — moderate fat content" freq="Weekly"/>
          <FoodItem icon="🦟" name="Wood roaches (Woodies)" detail="Excellent nutrition" freq="Every 2–3 nights"/>
          <FoodItem icon="🐛" name="Waxworms" detail="High-fat treat only" freq="Occasionally"/>
        </div>
        <WarnBox type="gold" title="Feed at night">Knob-tailed Geckos are nocturnal — feed after lights out. Offering food during the day causes stress and prey items may go uneaten.</WarnBox>
        <ShopBtn>Shop feeders & supplements</ShopBtn>
      </>}
      {tab === "health & shedding" && <>
        <SectionLabel mt={0}>Common health issues</SectionLabel>
        <HealthItem title="Overheating" detail="Their arid habitat has cool nights. Ensure temperatures drop at night and the cool side never exceeds 26°C. Overheating is fatal."/>
        <HealthItem title="Retained shed" detail="Usually around the knob tail or toes. A slightly moist hide during shedding helps. Soak in warm water if retained shed is present."/>
        <HealthItem title="Dehydration" detail="Despite preferring low humidity, fresh water must always be available. Mist one side of the enclosure lightly once a week."/>
        <HealthItem dot="#4a9e6b" title="Signs of good health" detail="Active at night, feeding well, plump tail knob (fat storage indicator), clear eyes, firm body condition."/>
        <SnakeShedding animal="gecko" />
      </>}
      {tab === "handling" && <>
        <div style={{background:T.chipBg,borderRadius:14,padding:"12px 14px",marginBottom:12,border: "none"}}>
          <div style={{fontSize:12,fontWeight:700,color:T.chip,marginBottom:6}}>BITE RISK — LOW TO MEDIUM</div>
          <div style={{fontSize: 15, color: T.body,lineHeight:1.6}}>Knob-tailed Geckos vary in temperament by species. Some individuals are calm, others defensive. They are fast-moving and can vocalise loudly when stressed. Handle at night when they are naturally active. Never handle during the day — this causes significant stress.</div>
        </div>
        <div style={{background:T.card,borderRadius:14,padding:"12px 14px",border: "none",fontSize: 15, color: T.body,lineHeight:1.7}}>Short handling sessions only — these are primarily display animals. Never grab the tail. Support the full body. Handle after they have warmed up for the evening. Frequent, brief, calm interactions build confidence over time.</div>
        <WarnBox type="red" title="Never grab the tail">Like many geckos, Knob-tails can drop their tail under stress. The tail regrows but the knob does not reform properly — it is a permanent loss of their most distinctive feature.</WarnBox>
      </>}
      {tab === "licencing" && <LegalTab note="Can be kept in NSW, VIC, QLD, SA, WA, ACT and NT. Not permitted in TAS. Licence names are each authority's own; checked November 2026." states={[{ abbr: "NSW", cat: "Companion or Class 1 licence · confirm with authority", ok: true }, { abbr: "VIC", cat: "Basic or Advanced licence", ok: true }, { abbr: "QLD", cat: "Standard licence", ok: true }, { abbr: "SA", cat: "Basic permit (one animal permit-free)", ok: true }, { abbr: "WA", cat: "Pet keeper's licence", ok: true }, { abbr: "TAS", cat: "Not permitted (TAS natives only)", ok: false }, { abbr: "ACT", cat: "Keeper licence (case by case)", ok: true }, { abbr: "NT", cat: "Permit to keep (varies by form)", ok: true }]} />}
    </>}
  />
);

export default KnobTailedGeckoPage;
