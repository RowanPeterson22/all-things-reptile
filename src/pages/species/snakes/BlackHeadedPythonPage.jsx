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

const BlackHeadedPythonPage = ({ onBack }) => (
  <SpeciesPage onBack={onBack} name="Black-headed Python" latin="Aspidites melanocephalus" emoji="🐍"
    badges={[["Intermediate", C.goldLight, "#7a5a1e"], ["Australian native", C.bluePale, C.blue], ["Specialist care", C.redPale, C.red]]}
    tabs={["overview", "feeding", "health & shedding", "handling & breeding", "licencing"]}
    tabContent={(tab) => <>
      {tab === "overview" && <>
        <p style={{ fontSize: 13, color: "#666", lineHeight: 1.6, marginBottom: 14 }}>One of Australia's most striking pythons — a glossy black head and banded red-brown body. Related to the Woma, they share the characteristic of having no heat-sensing pits. Found in tropical and subtropical northern Australia. An impressive species that requires committed, experienced husbandry.</p>
        <SectionLabel mt={0}>Quick stats</SectionLabel>
        <StatGrid stats={[["📏", "Adult size", "1.5–2.5 m"], ["⏳", "Lifespan", "25–30 yrs"], ["🏠", "Min. enclosure", "180 × 60 cm"], ["💧", "Humidity", "50–65%"]]} />
        <SectionLabel>Temperature requirements</SectionLabel>
        <TempBar label="Basking spot" value="38–42°C" width="94%" color="#e03a1a" />
        <TempBar label="Warm side" value="30–34°C" width="72%" color="#e05a2b" />
        <TempBar label="Cool side" value="24–28°C" width="50%" color="#4a9e6b" />
        <TempBar label="Overnight low" value="20–24°C" width="34%" color="#2b7ec0" />
        <WarnBox type="blue" title="Higher basking temps than most pythons">Black-headed Pythons use their dark head to absorb radiant heat before warming their body — a unique adaptation. They require higher basking spot temps than most Australian pythons. A proper thermal gradient is essential.</WarnBox>
        <SectionLabel>Enclosure setup</SectionLabel>
        <div style={{ background: C.cream, borderRadius: 12, padding: "12px 14px", border: "0.5px solid #e8e8e4", fontSize: 13, color: "#666", lineHeight: 1.7 }}>Large timber or PVC enclosure. Sandy or coir substrate — they burrow. Deep hides at both ends. Moderate humidity (not as dry as Womas, not as humid as tropical species). Water bowl large enough to soak in. A powerful basking spot with a good temperature gradient is the most important element.</div>
        <ShopBtn>🛒 Shop Black-headed Python supplies</ShopBtn>
        <ShopBtn secondary>Ask a question ↗</ShopBtn>
      </>}
      {tab === "feeding" && <>
        <p style={{ fontSize: 13, color: "#666", lineHeight: 1.6, marginBottom: 12 }}>In the wild, Black-headed Pythons primarily eat reptiles — including venomous snakes. Captive animals are fed rodents, though some individuals (especially hatchlings) are reluctant to accept them.</p>
        <div style={{ background: C.cream, borderRadius: 12, border: "0.5px solid #e8e8e4", padding: "0 14px" }}>
          <FoodItem icon="🐭" name="Mice (scented)" detail="Hatchlings — often need lizard scenting" freq="Every 7–10 days" />
          <FoodItem icon="🐭" name="Adult mice" detail="Juveniles once established" freq="Every 7–10 days" />
          <FoodItem icon="🐀" name="Medium rats" detail="Adults" freq="Every 10–14 days" />
        </div>
        <WarnBox type="red" title="Hatchling feeding can be challenging">Many Black-headed Python hatchlings are reluctant to take rodents. Scenting with lizard, offering live then pre-killed, or using assist-feeding techniques may be required. This is a species best purchased from an established, feeding captive-bred animal.</WarnBox>
        <WarnBox type="gold" title="Never house with other reptiles">In the wild they eat other snakes and lizards. Do not house with any other reptile species — ever.</WarnBox>
      </>}
      {tab === "health & shedding" && <>
        <SectionLabel mt={0}>Common health issues</SectionLabel>
        <HealthItem title="Feeding refusal in hatchlings" detail="One of the most common challenges. Persistence, scenting, and purchasing already-feeding animals helps significantly." />
        <HealthItem title="Respiratory infection" detail="Watch for mucus and wheezing. Ensure temperatures are appropriate and humidity is not excessive." />
        <HealthItem title="Cryptosporidiosis" detail="As with all Aspidites, quarantine all new animals strictly. Crypto can cause chronic regurgitation and wasting with no reliable cure." />
        <HealthItem title="Dysecdysis (stuck shed)" detail="Common if humidity is insufficient. Provide a humid hide during shed and monitor closely." />
        <HealthItem dot="#4a9e6b" title="Signs of good health" detail="Glossy jet-black head, rich banding, active at night, burrows readily, accepting regular feeds." />
        <SnakeShedding />
      </>}
      {tab === "handling & breeding" && <>
        <SnakeHandling biteRisk="medium" notes="Black-headed Pythons vary in temperament. Some are calm and handleable; others remain defensive throughout their lives. Their size and feeding history with other reptiles means respect is important. Always hook-train. Juveniles can be particularly defensive — patience and consistency is key." />
        <SnakeBreeding clutchSize="5–12 eggs" incubationTemp="30–32°C" incubationDays="60–70 days" maturityAge="4–5 years" notes="A challenging but rewarding breeding project. Requires a significant cooling period. Clutches are relatively small. Getting hatchlings established on rodents is often the biggest challenge — purchase from proven breeders with established feeding animals where possible." />
      </>}
      {tab === "licencing" && <LegalTab note="Can be kept in NSW, VIC, QLD, SA, WA, ACT and NT. Not permitted in TAS. Licence names are each authority's own; checked November 2026." states={[{ abbr: "NSW", cat: "Companion or Class 1 licence", ok: true }, { abbr: "VIC", cat: "Basic licence", ok: true }, { abbr: "QLD", cat: "Standard licence", ok: true }, { abbr: "SA", cat: "Basic permit (one animal permit-free)", ok: true }, { abbr: "WA", cat: "Pet keeper's licence", ok: true }, { abbr: "TAS", cat: "Not permitted (TAS natives only)", ok: false }, { abbr: "ACT", cat: "Keeper licence (case by case)", ok: true }, { abbr: "NT", cat: "Permit to keep", ok: true }]} />}
    </>}
  />
);

export default BlackHeadedPythonPage;
