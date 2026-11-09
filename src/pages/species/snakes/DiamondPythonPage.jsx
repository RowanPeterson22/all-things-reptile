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

const DiamondPythonPage = ({ onBack }) => (
  <SpeciesPage onBack={onBack} name="Diamond Python" latin="Morelia spilota spilota" emoji="🐍"
    badges={[["Intermediate", T.chipBg, T.chip], ["Australian native", T.infoBg, T.info], ["Cool climate", T.chipBg, T.accentText]]}
    tabs={["overview", "feeding", "health & shedding", "handling & breeding", "licencing"]}
    tabContent={(tab) => <>
      {tab === "overview" && <>
        <p style={{ fontSize: 15, color: T.body, lineHeight: 1.6, marginBottom: 14 }}>The iconic black and gold python of south-eastern Australia. Strikingly beautiful and unique among Australian pythons in their preference for cooler temperatures. Found naturally in the forests of NSW and Victoria — including Sydney's outer suburbs. Requires a different approach to heating than most pythons.</p>
        <SectionLabel mt={0}>Quick stats</SectionLabel>
        <StatGrid stats={[["📏", "Adult size", "2.0–3.0 m"], ["⏳", "Lifespan", "20–30 yrs"], ["🏠", "Min. enclosure", "180 × 60 cm"], ["💧", "Humidity", "60–80%"]]} />
        <SectionLabel>Temperature requirements</SectionLabel>
        <TempCard>
          <TempBar label="Basking spot" value="30–33°C" width="70%" color="#e05a2b" />
          <TempBar label="Warm side" value="25–28°C" width="54%" color="#e0922b" />
          <TempBar label="Cool side" value="18–22°C" width="34%" color="#4a9e6b" />
          <TempBar label="Overnight low" value="12–16°C" width="16%" color="#2b7ec0" />
        </TempCard>
        <WarnBox type="blue" title="Cooler temps than most pythons">Diamond Pythons overheat easily. Their basking temp is significantly lower than other carpets. Do not apply standard carpet python heating to a diamond — it can be fatal. Cool end temperatures as low as 12°C in winter are normal and beneficial.</WarnBox>
        <SectionLabel>Enclosure setup</SectionLabel>
        <div style={{ background: T.card, borderRadius: 14, padding: "12px 14px", border: "none", fontSize: 15, color: T.body, lineHeight: 1.7 }}>Tall timber enclosure with climbing branches — diamonds are highly arboreal. Higher humidity than most pythons; misting is beneficial. Ensure excellent ventilation despite the higher humidity. Forest substrate (coir, leaf litter mix). Water bowl large enough to soak in.</div>
        <ShopBtn>Shop Diamond Python supplies</ShopBtn>
        <ShopBtn secondary>Ask a question ↗</ShopBtn>
      </>}
      {tab === "feeding" && <>
        <p style={{ fontSize: 15, color: T.body, lineHeight: 1.6, marginBottom: 12 }}>Carnivorous. Diamond Pythons can be fussier feeders than other carpets, especially in captivity. Patience is key. They may refuse food in summer when ambient temps are high.</p>
        <div style={FOOD_CARD}>
          <FoodItem icon="🐭" name="Mice (various sizes)" detail="Juveniles" freq="Every 7–10 days" />
          <FoodItem icon="🐀" name="Small to medium rats" detail="Adults" freq="Every 14 days" />
        </div>
        <WarnBox type="gold" title="Fussy feeders">Diamonds can be reluctant feeders, particularly in summer. Try scenting prey with lizard or frog (avoid wild-caught). Some individuals only accept prey from a hide or in darkness. Patience and consistency pays off.</WarnBox>
        <WarnBox type="blue" title="Summer fasting is normal">Many Diamond Pythons fast through summer when temperatures peak. As long as body condition is maintained, this is normal seasonal behaviour.</WarnBox>
      </>}
      {tab === "health & shedding" && <>
        <SectionLabel mt={0}>Common health issues</SectionLabel>
        <HealthItem title="Overheating" detail="The most critical risk for Diamond Pythons. Always ensure cool end temps are low enough — especially in summer. A cool, damp hide is essential." />
        <HealthItem title="Respiratory infection" detail="Despite preferring cooler temps, poor ventilation with high humidity can cause respiratory issues. Good airflow is essential." />
        <HealthItem title="Anorexia" detail="Common and often seasonal. Long-term fasting without weight loss is generally normal. Persistent refusal with weight loss warrants a vet check." />
        <HealthItem title="Mites" detail="Can stress a snake that prefers cooler temps. Regular checks and prompt treatment important." />
        <HealthItem dot="#4a9e6b" title="Signs of good health" detail="Striking black and gold pattern, alert and arboreal behaviour, shedding in good condition, feeding through autumn and winter." />
        <SnakeShedding />
      </>}
      {tab === "handling & breeding" && <>
        <SnakeHandling biteRisk="medium" notes="Diamond Pythons can be more defensive than other carpet subspecies. Individual temperaments vary widely. Some are handleable from an early age; others remain defensive. They can be nippy especially in summer. Never rush handling — build trust slowly." />
        <SnakeBreeding clutchSize="10–25 eggs" incubationTemp="27–29°C" incubationDays="55–70 days" maturityAge="3–5 years" notes="Diamonds require a genuine winter cooling period — drop to 12–16°C overnight for 10–14 weeks. Lower incubation temps than most pythons. A challenging but rewarding breeding project. Captive-bred animals are far easier to keep and feed than wild-caught." />
      </>}
      {tab === "licencing" && <LegalTab note="Can be kept in NSW, VIC, QLD, SA, ACT and NT. Not permitted in WA and TAS. Licence names are each authority's own; checked November 2026." states={[{ abbr: "NSW", cat: "Companion or Class 1 licence", ok: true }, { abbr: "VIC", cat: "Basic licence", ok: true }, { abbr: "QLD", cat: "Standard licence · confirm with authority", ok: true }, { abbr: "SA", cat: "Basic permit (one animal permit-free) · confirm with authority", ok: true }, { abbr: "WA", cat: "Not permitted", ok: false }, { abbr: "TAS", cat: "Not permitted (TAS natives only)", ok: false }, { abbr: "ACT", cat: "Keeper licence (case by case)", ok: true }, { abbr: "NT", cat: "Import + keep permit (case by case)", ok: true }]} />}
    </>}
  />
);

export default DiamondPythonPage;
