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
import SnakeHandling from "../../../components/SnakeHandling";
import SnakeBreeding from "../../../components/SnakeBreeding";

const OlivePythonPage = ({ onBack }) => (
  <SpeciesPage onBack={onBack} name="Olive Python" latin="Liasis olivaceus" emoji="🐍"
    badges={[["Advanced", C.redPale, C.red], ["Australian native", C.bluePale, C.blue], ["Large species", C.redPale, C.red]]}
    tabs={["overview", "feeding", "health & shedding", "handling & breeding", "licencing"]}
    tabContent={(tab) => <>
      {tab === "overview" && <>
        <p style={{ fontSize: 13, color: "#666", lineHeight: 1.6, marginBottom: 14 }}>Australia's second largest python — a powerful, olive-brown snake with an iridescent sheen. Found near rocky gorges and water sources across northern and north-western Australia. Impressive in scale and personality. Suited to experienced keepers only due to their size, strength, and specific requirements.</p>
        <WarnBox type="red" title="Advanced species">Olive Pythons grow large and are very strong. They require large enclosures, significant feeding costs, and confident, experienced handling. Not suitable for beginners.</WarnBox>
        <SectionLabel>Quick stats</SectionLabel>
        <StatGrid stats={[["📏", "Adult size", "2.5–4.0 m"], ["⏳", "Lifespan", "25–35 yrs"], ["🏠", "Min. enclosure", "240 × 90 cm"], ["💧", "Humidity", "50–70%"]]} />
        <SectionLabel>Temperature requirements</SectionLabel>
        <TempBar label="Basking spot" value="35–38°C" width="86%" color="#e05a2b" />
        <TempBar label="Warm side" value="28–32°C" width="66%" color="#e0922b" />
        <TempBar label="Cool side" value="22–26°C" width="44%" color="#4a9e6b" />
        <TempBar label="Overnight low" value="20–22°C" width="32%" color="#2b7ec0" />
        <SectionLabel>Enclosure setup</SectionLabel>
        <div style={{ background: C.cream, borderRadius: 12, padding: "12px 14px", border: "0.5px solid #e8e8e4", fontSize: 13, color: "#666", lineHeight: 1.7 }}>A very large, secure enclosure is non-negotiable. Timber or PVC construction must be robust — Olive Pythons are powerful and will exploit any weakness. Large water feature or soaking tub strongly recommended — they love water. Rocky hides, sturdy climbing branches. Security locks on all doors.</div>
        <ShopBtn>🛒 Shop Olive Python supplies</ShopBtn>
        <ShopBtn secondary>Ask a question ↗</ShopBtn>
      </>}
      {tab === "feeding" && <>
        <p style={{ fontSize: 13, color: "#666", lineHeight: 1.6, marginBottom: 12 }}>Carnivorous and a powerful feeder. Adults require large prey items. The feeding cost of an Olive Python is significant — factor this into your decision to keep one.</p>
        <div style={{ background: C.cream, borderRadius: 12, border: "0.5px solid #e8e8e4", padding: "0 14px" }}>
          <FoodItem icon="🐭" name="Mice / small rats" detail="Hatchlings and juveniles" freq="Every 7–10 days" />
          <FoodItem icon="🐀" name="Large rats" detail="Sub-adults" freq="Every 10–14 days" />
          <FoodItem icon="🐇" name="Rabbits / large rats" detail="Adults" freq="Every 14–21 days" />
        </div>
        <WarnBox type="red" title="Feeding safety">Olive Pythons are powerful constrictors with a strong feeding response. Two-person handling during feeding interaction is recommended for large adults. Always use extra-long tongs. Never free-feed by hand. Have a plan for a constriction emergency.</WarnBox>
        <WarnBox type="gold" title="Cost consideration">Feeding a large adult Olive Python is expensive. Budget for regular large prey items and factor in the cost of a suitably large enclosure before committing to this species.</WarnBox>
      </>}
      {tab === "health & shedding" && <>
        <SectionLabel mt={0}>Common health issues</SectionLabel>
        <HealthItem title="Respiratory infection" detail="Watch for mucus, wheezing, open-mouth breathing. Veterinary treatment required. Their size makes treatment more complex and expensive." />
        <HealthItem title="Obesity" detail="Large pythons can become obese if overfed. Feed appropriately sized prey at appropriate intervals — an overfed Olive Python is a serious health risk." />
        <HealthItem title="Injury during handling" detail="Their size and strength means improper handling can injure both snake and keeper. Always handle with a second person present for large adults." />
        <HealthItem title="Enclosure security failures" detail="A large escaped Olive Python is a serious situation. Check all locks and enclosure integrity regularly." />
        <HealthItem dot="#4a9e6b" title="Signs of good health" detail="Olive-brown iridescent colouration, alert and responsive, strong muscle tone, regular feeding and shedding." />
        <SnakeShedding />
      </>}
      {tab === "handling & breeding" && <>
        <SnakeHandling biteRisk="medium" notes="Olive Pythons are generally not aggressive but their size makes any defensive behaviour significant. Always use a hook to signal handling intent. Two-person handling is recommended for adults over 2.5 m. Their strength means they can be difficult to control if they decide to move quickly. Never handle alone when the snake is large." />
        <SnakeBreeding clutchSize="10–20 eggs" incubationTemp="30–32°C" incubationDays="60–70 days" maturityAge="4–6 years" notes="A breeding project only for very experienced keepers with appropriate space and resources. Requires a cooling period. Females are dedicated egg-guarders. Hatchlings are large and should readily accept mice from the start." />
      </>}
      {tab === "licencing" && <LegalTab note="Can be kept in NSW, VIC, QLD, SA, WA, ACT and NT. Not permitted in TAS. Licence names are each authority's own; checked November 2026." states={[{ abbr: "NSW", cat: "Companion or Class 1 licence", ok: true }, { abbr: "VIC", cat: "Basic licence", ok: true }, { abbr: "QLD", cat: "Standard licence", ok: true }, { abbr: "SA", cat: "Basic permit (one animal permit-free)", ok: true }, { abbr: "WA", cat: "Pet keeper's licence (advanced)", ok: true }, { abbr: "TAS", cat: "Not permitted (TAS natives only)", ok: false }, { abbr: "ACT", cat: "Keeper licence (case by case)", ok: true }, { abbr: "NT", cat: "Permit to keep", ok: true }]} />}
    </>}
  />
);

export default OlivePythonPage;
