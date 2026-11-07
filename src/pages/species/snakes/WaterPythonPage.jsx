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

// ─── Water Python page ────────────────────────────────────────────
const WaterPythonPage = ({ onBack }) => (
  <SpeciesPage onBack={onBack} name="Water Python" latin="Liasis fuscus" emoji="🐍"
    badges={[["Intermediate", C.goldLight, "#7a5a1e"], ["Australian native", C.bluePale, C.blue], ["Semi-aquatic", C.greenPale, C.green]]}
    tabs={["overview","feeding","health & shedding","handling & breeding","licencing"]}
    tabContent={(tab) => <>
      {tab === "overview" && <>
        <p style={{fontSize:13,color:"#666",lineHeight:1.6,marginBottom:14}}>A sleek, iridescent python from the tropical north of Australia. Found near rivers, lakes, and wetlands across northern Australia and New Guinea. Their dark brown scales with a beautiful blue-purple iridescent sheen make them a striking display animal. Active, alert, and fast-moving.</p>
        <SectionLabel mt={0}>Quick stats</SectionLabel>
        <StatGrid stats={[["📏","Adult size","1.5–2.5 m"],["⏳","Lifespan","20–25 yrs"],["🏠","Min. enclosure","180 × 60 cm"],["💧","Humidity","60–80%"]]} />
        <SectionLabel>Temperature requirements</SectionLabel>
        <TempBar label="Basking spot" value="33–36°C" width="82%" color="#e05a2b"/>
        <TempBar label="Warm side" value="28–32°C" width="66%" color="#e0922b"/>
        <TempBar label="Cool side" value="24–28°C" width="50%" color="#4a9e6b"/>
        <TempBar label="Overnight low" value="22–24°C" width="36%" color="#2b7ec0"/>
        <WarnBox type="blue" title="Water access is essential">Water Pythons are semi-aquatic and should have access to a large water feature or soaking tub. They frequently soak and swim — this is natural behaviour, not a sign of mites or illness.</WarnBox>
        <SectionLabel>Enclosure setup</SectionLabel>
        <div style={{background:C.cream,borderRadius:12,padding:"12px 14px",border:"0.5px solid #e8e8e4",fontSize:13,color:"#666",lineHeight:1.7}}>Large PVC or timber enclosure with a significant water feature — at minimum a tub large enough for the snake to fully submerge. High humidity. Sturdy branches for climbing. Cork bark hides at warm and cool ends. Ensure excellent ventilation to prevent respiratory issues despite the high humidity.</div>
        <ShopBtn>🛒 Shop Water Python supplies</ShopBtn>
        <ShopBtn secondary>Ask a question ↗</ShopBtn>
      </>}
      {tab === "feeding" && <>
        <p style={{fontSize:13,color:"#666",lineHeight:1.6,marginBottom:12}}>Carnivorous. In the wild, Water Pythons feed heavily on rats, birds, and aquatic prey. In captivity they adapt well to rodents. Can be enthusiastic but sometimes defensive feeders.</p>
        <div style={{background:C.cream,borderRadius:12,border:"0.5px solid #e8e8e4",padding:"0 14px"}}>
          <FoodItem icon="🐭" name="Mice (various sizes)" detail="Hatchlings through juveniles" freq="Every 5–7 days"/>
          <FoodItem icon="🐀" name="Small to medium rats" detail="Sub-adults and adults" freq="Every 10–14 days"/>
        </div>
        <WarnBox type="red" title="Active feeding response">Water Pythons can be enthusiastic and fast-striking feeders. Always use long tongs and hook-train before every interaction.</WarnBox>
        <WarnBox type="gold" title="Feeding near water">Some Water Pythons prefer to be fed near their water feature — this mimics their natural feeding environment and can improve feeding response in reluctant individuals.</WarnBox>
        <ShopBtn>🛒 Shop feeders</ShopBtn>
      </>}
      {tab === "health & shedding" && <>
        <SectionLabel mt={0}>Common health issues</SectionLabel>
        <HealthItem title="Respiratory infection" detail="High humidity environments require excellent ventilation. Wheezing or mucus needs prompt vet attention."/>
        <HealthItem title="Scale rot" detail="Caused by sitting in stagnant water or wet substrate for extended periods. Change water regularly and keep substrate clean."/>
        <HealthItem title="Mites" detail="Check around the water bowl and heat source regularly. Water Pythons frequently soak, which can actually help dislodge mites."/>
        <HealthItem dot="#4a9e6b" title="Signs of good health" detail="Iridescent sheen on scales, alert and active, uses water feature regularly, strong feeding response."/>
        <SnakeShedding />
      </>}
      {tab === "handling & breeding" && <>
        <SnakeHandling biteRisk="medium" notes="Water Pythons are fast and alert — they can be defensive, particularly when young. They move quickly and can be unpredictable. Regular consistent handling from an early age significantly improves temperament. Always hook-train. Adults can become quite calm with regular interaction." />
        <SnakeBreeding clutchSize="8–16 eggs" incubationTemp="30–32°C" incubationDays="58–65 days" maturityAge="3–4 years" notes="Requires a winter cooling period. Females are good egg-guarders. A less commonly bred species in Australian collections — captive-bred animals are more tractable than wild-caught individuals. Their iridescent colouration makes them a unique and attractive breeding project." />
      </>}
      {tab === "licencing" && <LegalTab note="Can be kept in NSW, VIC, QLD, SA, WA, ACT and NT. Not permitted in TAS. Licence names are each authority's own; checked November 2026." states={[{ abbr: "NSW", cat: "Companion or Class 1 licence", ok: true }, { abbr: "VIC", cat: "Basic licence", ok: true }, { abbr: "QLD", cat: "Standard licence", ok: true }, { abbr: "SA", cat: "Basic permit (one animal permit-free)", ok: true }, { abbr: "WA", cat: "Pet keeper's licence", ok: true }, { abbr: "TAS", cat: "Not permitted (TAS natives only)", ok: false }, { abbr: "ACT", cat: "Keeper licence (case by case)", ok: true }, { abbr: "NT", cat: "Permit to keep", ok: true }]} />}
    </>}
  />
);

export default WaterPythonPage;
