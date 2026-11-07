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

const CarpetPythonPage = ({ onBack }) => (
  <SpeciesPage onBack={onBack} name="Carpet Python" latin="Morelia spilota" emoji="🐍"
    badges={[["Intermediate", C.goldLight, "#7a5a1e"], ["Australian native", C.bluePale, C.blue], ["Nocturnal", C.goldLight, "#7a5a1e"]]}
    tabs={["overview", "feeding", "health & shedding", "handling & breeding", "licencing"]}
    tabContent={(tab) => <>
      {tab === "overview" && <>
        <p style={{ fontSize: 13, color: "#666", lineHeight: 1.6, marginBottom: 14 }}>Australia's most widely kept python and one of the most variable — with multiple subspecies ranging from the coastal Jungle Carpet to the Coastal Carpet. Bold, inquisitive, and impressive. A rewarding snake for keepers ready to step up from smaller pythons.</p>
        <SectionLabel mt={0}>Quick stats</SectionLabel>
        <StatGrid stats={[["📏", "Adult size", "1.5–3.0 m"], ["⏳", "Lifespan", "20–30 yrs"], ["🏠", "Min. enclosure", "180 × 60 cm"], ["💧", "Humidity", "50–70%"]]} />
        <SectionLabel>Temperature requirements</SectionLabel>
        <TempBar label="Basking spot" value="33–36°C" width="82%" color="#e05a2b" />
        <TempBar label="Warm side" value="28–30°C" width="64%" color="#e0922b" />
        <TempBar label="Cool side" value="22–26°C" width="46%" color="#4a9e6b" />
        <TempBar label="Overnight low" value="18–22°C" width="28%" color="#2b7ec0" />
        <SectionLabel>Enclosure setup</SectionLabel>
        <div style={{ background: C.cream, borderRadius: 12, padding: "12px 14px", border: "0.5px solid #e8e8e4", fontSize: 13, color: "#666", lineHeight: 1.7 }}>Tall timber or PVC enclosure with good climbing opportunities — sturdy horizontal branches are essential. Cypress mulch or coir substrate. Large snug hides. A water bowl large enough to soak in. Carpets are semi-arboreal so vertical space matters.</div>
        <WarnBox type="gold" title="Subspecies vary significantly">Jungle Carpets prefer higher humidity and temps; Inland Carpets are more arid. Research your specific subspecies before setting up.</WarnBox>
        <ShopBtn>🛒 Shop Carpet Python supplies</ShopBtn>
        <ShopBtn secondary>Ask a question ↗</ShopBtn>
      </>}
      {tab === "feeding" && <>
        <p style={{ fontSize: 13, color: "#666", lineHeight: 1.6, marginBottom: 12 }}>Carnivorous. Carpet Pythons are generally enthusiastic feeders. Feed pre-killed or frozen/thawed prey. Adults can take small rats — do not feed live prey.</p>
        <div style={{ background: C.cream, borderRadius: 12, border: "0.5px solid #e8e8e4", padding: "0 14px" }}>
          <FoodItem icon="🐭" name="Fuzzy / hopper mice" detail="Hatchlings and small juveniles" freq="Every 5–7 days" />
          <FoodItem icon="🐭" name="Adult mice" detail="Juveniles" freq="Every 7–10 days" />
          <FoodItem icon="🐀" name="Small to medium rats" detail="Sub-adults and adults" freq="Every 10–14 days" />
        </div>
        <WarnBox type="red" title="Watch for feeding strikes">Carpet Pythons can be defensive feeders, especially juveniles and around feeding time. Always use long tongs — not hands — and hook-train your snake before every interaction.</WarnBox>
        <WarnBox type="gold" title="Refusing food is common">Carpet Pythons often refuse food in winter or during shed. Don't panic — as long as the snake maintains body weight, short fasts are normal.</WarnBox>
      </>}
      {tab === "health & shedding" && <>
        <SectionLabel mt={0}>Common health issues</SectionLabel>
        <HealthItem title="Respiratory infection" detail="Common in carpets kept too cool or too damp. Wheezing, mucus, open-mouth breathing — needs veterinary treatment." />
        <HealthItem title="Mites" detail="Very common with carpets, especially from wild-caught or recently imported animals. Check skin folds and around eyes. Full enclosure strip-down required." />
        <HealthItem title="Inclusion body disease (IBD)" detail="A serious viral disease. Signs include regurgitation, loss of coordination, head wobbling. No treatment — strict quarantine of any new animals is essential." />
        <HealthItem title="Mouth rot" detail="Redness, swelling, or discharge from the mouth. Usually secondary to another issue. Veterinary care required." />
        <HealthItem dot="#4a9e6b" title="Signs of good health" detail="Alert and curious, strong feeding response, smooth patterned scales, regular shedding in one piece, firm muscular body." />
        <SnakeShedding />
      </>}
      {tab === "handling & breeding" && <>
        <SnakeHandling biteRisk="medium" notes="Carpet Python temperament varies widely by subspecies and individual. Jungle Carpets are notoriously feistier; Coastal Carpets tend to be calmer. Juveniles can be defensive. With consistent handling most become tractable adults — but they always retain a personality. Always hook-train." />
        <SnakeBreeding clutchSize="10–30 eggs" incubationTemp="30–32°C" incubationDays="55–65 days" maturityAge="3–4 years" notes="Requires a significant winter cooling period (drop to 18–20°C overnight for 8–10 weeks). Females are dedicated egg-guarders and will shiver to generate heat for the clutch — a fascinating behaviour. Remove eggs to an incubator for best results." />
      </>}
      {tab === "licencing" && <LegalTab note="Can be kept in NSW, VIC, QLD, SA, WA, ACT and NT. Not permitted in TAS. Licence names are each authority's own; checked November 2026." states={[{ abbr: "NSW", cat: "Companion or Class 1 licence", ok: true }, { abbr: "VIC", cat: "Basic licence", ok: true }, { abbr: "QLD", cat: "Standard licence", ok: true }, { abbr: "SA", cat: "Basic permit (one animal permit-free)", ok: true }, { abbr: "WA", cat: "Pet keeper's licence", ok: true }, { abbr: "TAS", cat: "Not permitted (TAS natives only)", ok: false }, { abbr: "ACT", cat: "Keeper licence (case by case)", ok: true }, { abbr: "NT", cat: "Permit to keep (varies by form)", ok: true }]} />}
    </>}
  />
);

export default CarpetPythonPage;
