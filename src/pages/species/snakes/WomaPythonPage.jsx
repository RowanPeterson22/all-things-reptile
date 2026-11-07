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

const WomaPythonPage = ({ onBack }) => (
  <SpeciesPage onBack={onBack} name="Woma Python" latin="Aspidites ramsayi" emoji="🐍"
    badges={[["Intermediate", C.goldLight, "#7a5a1e"], ["Australian native", C.bluePale, C.blue], ["Nocturnal", C.goldLight, "#7a5a1e"]]}
    tabs={["overview", "feeding", "health & shedding", "handling & breeding", "licencing"]}
    tabContent={(tab) => <>
      {tab === "overview" && <>
        <p style={{ fontSize: 13, color: "#666", lineHeight: 1.6, marginBottom: 14 }}>A beautifully banded python from arid Australia. Womas are unique among pythons for lacking heat-sensing pits and eating other reptiles in the wild (though captive animals readily eat rodents). Calm, smooth to handle, and striking in appearance — a favourite among experienced keepers.</p>
        <SectionLabel mt={0}>Quick stats</SectionLabel>
        <StatGrid stats={[["📏", "Adult size", "1.4–1.8 m"], ["⏳", "Lifespan", "20–30 yrs"], ["🏠", "Min. enclosure", "150 × 60 cm"], ["💧", "Humidity", "30–50%"]]} />
        <SectionLabel>Temperature requirements</SectionLabel>
        <TempBar label="Basking spot" value="35–40°C" width="88%" color="#e05a2b" />
        <TempBar label="Warm side" value="28–32°C" width="66%" color="#e0922b" />
        <TempBar label="Cool side" value="22–26°C" width="44%" color="#4a9e6b" />
        <TempBar label="Overnight low" value="16–18°C" width="20%" color="#2b7ec0" />
        <SectionLabel>Enclosure setup</SectionLabel>
        <div style={{ background: C.cream, borderRadius: 12, padding: "12px 14px", border: "0.5px solid #e8e8e4", fontSize: 13, color: "#666", lineHeight: 1.7 }}>Arid setup — keep it dry. Sandy or coir substrate with a dry feel. Womas are burrowers — a deep substrate layer (10–15 cm) is appreciated. Snug hides at both ends. Low humidity is essential — they are very prone to respiratory issues if kept damp. A small water bowl changed regularly.</div>
        <ShopBtn>🛒 Shop Woma Python supplies</ShopBtn>
        <ShopBtn secondary>Ask a question ↗</ShopBtn>
      </>}
      {tab === "feeding" && <>
        <p style={{ fontSize: 13, color: "#666", lineHeight: 1.6, marginBottom: 12 }}>Carnivorous. In the wild, Womas eat lizards and small mammals. In captivity, they adapt well to rodents. Can be fussy as hatchlings — scenting prey may be needed.</p>
        <div style={{ background: C.cream, borderRadius: 12, border: "0.5px solid #e8e8e4", padding: "0 14px" }}>
          <FoodItem icon="🐭" name="Pinky / fuzzy mice" detail="Hatchlings — may need scenting" freq="Every 7 days" />
          <FoodItem icon="🐭" name="Adult mice" detail="Juveniles" freq="Every 7–10 days" />
          <FoodItem icon="🐀" name="Small to medium rats" detail="Adults" freq="Every 10–14 days" />
        </div>
        <WarnBox type="gold" title="Scenting for fussy hatchlings">Rub prey with a skink or gecko to add lizard scent if the hatchling refuses plain mice. Most Womas convert to unscented rodents within a few feeds.</WarnBox>
        <WarnBox type="red" title="Constriction feeding behaviour">Womas use a unique constriction technique — pressing prey against burrow walls. They may try to constrict tongs or hands during feeding. Always use long tongs.</WarnBox>
      </>}
      {tab === "health & shedding" && <>
        <SectionLabel mt={0}>Common health issues</SectionLabel>
        <HealthItem title="Respiratory infection" detail="Womas are highly sensitive to humidity. Keep enclosure dry. Any signs of mucus or wheezing need prompt vet attention." />
        <HealthItem title="Cryptosporidiosis" detail="A serious parasitic infection that can cause chronic regurgitation and wasting. No reliable cure — prevention through quarantine of new animals is critical." />
        <HealthItem title="Hatchling feeding issues" detail="Some hatchlings are reluctant to switch from lizards to rodents. Scenting, offering in a paper bag, or using lizard-scented prey helps. Seek advice from an experienced keeper if problems persist." />
        <HealthItem dot="#4a9e6b" title="Signs of good health" detail="Banded pattern with good colour contrast, active at night, regular feeding, burrows into substrate, firm muscular body." />
        <SnakeShedding />
      </>}
      {tab === "handling & breeding" && <>
        <SnakeHandling biteRisk="low" notes="Womas are generally very calm and smooth to handle. They rarely bite defensively — but have a strong feeding response. Hook-train religiously and always ensure your hands don't smell of food. Once hook-trained, adults are a pleasure to handle." />
        <SnakeBreeding clutchSize="5–20 eggs" incubationTemp="30–32°C" incubationDays="55–65 days" maturityAge="3–4 years" notes="Requires a good winter cooling period. Drop to 15–18°C overnight for 8–10 weeks. Womas are a popular breeding project — their beautiful banding and calm nature make them highly sought after. Females guard their eggs and should be disturbed as little as possible." />
      </>}
      {tab === "licencing" && <LegalTab note="Can be kept in NSW, VIC, QLD, SA, WA, ACT and NT. Not permitted in TAS. Licence names are each authority's own; checked November 2026." states={[{ abbr: "NSW", cat: "Companion or Class 1 licence", ok: true }, { abbr: "VIC", cat: "Basic licence", ok: true }, { abbr: "QLD", cat: "Standard licence", ok: true }, { abbr: "SA", cat: "Basic permit (one animal permit-free)", ok: true }, { abbr: "WA", cat: "Pet keeper's licence", ok: true }, { abbr: "TAS", cat: "Not permitted (TAS natives only)", ok: false }, { abbr: "ACT", cat: "Keeper licence (case by case)", ok: true }, { abbr: "NT", cat: "Permit to keep", ok: true }]} />}
    </>}
  />
);

export default WomaPythonPage;
