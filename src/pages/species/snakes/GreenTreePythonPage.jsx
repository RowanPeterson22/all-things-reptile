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
import SnakeHandling from "../../../components/SnakeHandling";
import SnakeBreeding from "../../../components/SnakeBreeding";

// ─── Green Tree Python page ───────────────────────────────────────
const GreenTreePythonPage = ({ onBack }) => (
  <SpeciesPage onBack={onBack} name="Green Tree Python" latin="Morelia viridis" emoji="🐍"
    badges={[["Advanced", C.redPale, C.red], ["Australian native", C.bluePale, C.blue], ["Arboreal", C.greenPale, C.green]]}
    tabs={["overview","feeding","health & shedding","handling & breeding","licencing"]}
    tabContent={(tab) => <>
      {tab === "overview" && <>
        <p style={{fontSize:13,color:"#666",lineHeight:1.6,marginBottom:14}}>One of the world's most visually stunning reptiles. Found in the rainforests of Cape York Peninsula in far north Queensland and throughout New Guinea. Their vivid emerald green colouration — achieved as juveniles transition from yellow or red — and their distinctive coiled perching posture make them the most recognisable arboreal python in the world. A display animal first and foremost, suited only to experienced keepers.</p>
        <WarnBox type="red" title="Advanced species — display animal">Green Tree Pythons are not a handling species. They are kept primarily for their extraordinary beauty. They can be defensive and their bites, while not dangerous, are painful. This is a species for experienced keepers who understand and respect their nature.</WarnBox>
        <SectionLabel mt={0}>Quick stats</SectionLabel>
        <StatGrid stats={[["📏","Adult size","1.5–2.0 m"],["⏳","Lifespan","15–20+ yrs"],["🏠","Min. enclosure","90 × 60 × 120 cm"],["💧","Humidity","70–90%"]]} />
        <SectionLabel>Temperature requirements</SectionLabel>
        <TempBar label="Basking spot" value="30–32°C" width="68%" color="#e05a2b"/>
        <TempBar label="Ambient warm" value="27–30°C" width="60%" color="#e0922b"/>
        <TempBar label="Cool side" value="24–26°C" width="46%" color="#4a9e6b"/>
        <TempBar label="Overnight low" value="22–24°C" width="36%" color="#2b7ec0"/>
        <WarnBox type="blue" title="Lower basking temps than most pythons">Green Tree Pythons are rainforest animals — they do not require the intense basking temperatures of arid-adapted pythons. Overheating is a serious risk. Never exceed 33°C anywhere in the enclosure.</WarnBox>
        <SectionLabel>Enclosure setup</SectionLabel>
        <div style={{background:C.cream,borderRadius:12,padding:"12px 14px",border:"0.5px solid #e8e8e4",fontSize:13,color:"#666",lineHeight:1.7}}>A tall enclosure is essential — minimum 120cm height. PVC or timber with excellent ventilation. Horizontal perches of varying diameters at different heights are critical — GTPs spend virtually their entire lives coiled on branches. A large water bowl for soaking. Misting system or daily hand misting to maintain 70–90% humidity. Live or artificial plants add security and help maintain humidity. The enclosure should prioritise height over floor space.</div>
        <WarnBox type="gold" title="Perch diameter matters">Provide perches of varying diameters. GTPs coil differently depending on perch thickness — this is not just aesthetic, it affects their physical comfort and muscle health. A variety of 2–5cm diameter perches is ideal.</WarnBox>
        <ShopBtn>🛒 Shop Green Tree Python supplies</ShopBtn>
        <ShopBtn secondary>Ask a question ↗</ShopBtn>
      </>}
      {tab === "feeding" && <>
        <p style={{fontSize:13,color:"#666",lineHeight:1.6,marginBottom:12}}>Carnivorous. In the wild they eat lizards as juveniles, transitioning to small mammals as adults. In captivity they adapt well to rodents but can be challenging feeders, particularly juveniles.</p>
        <div style={{background:C.cream,borderRadius:12,border:"0.5px solid #e8e8e4",padding:"0 14px"}}>
          <FoodItem icon="🦎" name="Lizard-scented mice (juveniles)" detail="Hatchlings often need lizard scenting to trigger feeding response" freq="Every 7–10 days"/>
          <FoodItem icon="🐭" name="Mice (various sizes)" detail="Juveniles and small adults" freq="Every 7–10 days"/>
          <FoodItem icon="🐀" name="Small rats" detail="Large adults" freq="Every 10–14 days"/>
        </div>
        <WarnBox type="red" title="Feeding can be very challenging">Green Tree Python hatchlings are notoriously difficult feeders. Many require lizard scenting, live prey, or assist feeding to get started. Purchase only captive-bred animals with a confirmed established feeding record — this cannot be stressed enough.</WarnBox>
        <WarnBox type="gold" title="Feed on the perch">GTPs are ambush hunters that strike from their perch. Offer prey using long tongs, dangling it near the snake at perch level to simulate natural hunting behaviour. Never place prey on the enclosure floor.</WarnBox>
        <WarnBox type="blue" title="Do not disturb after feeding">GTPs are particularly prone to regurgitation if disturbed after feeding. Do not handle or significantly disturb the enclosure for at least 72 hours after a feed.</WarnBox>
        <ShopBtn>🛒 Shop feeders</ShopBtn>
      </>}
      {tab === "health & shedding" && <>
        <SectionLabel mt={0}>Common health issues</SectionLabel>
        <HealthItem title="Regurgitation" detail="Very common in GTPs. Caused by handling too soon after feeding, temperatures too low, prey too large, or stress. Fast for 3 weeks after regurgitation before attempting to feed again."/>
        <HealthItem title="Respiratory infection" detail="Despite needing high humidity, poor ventilation causes respiratory infections. Excellent airflow is critical. Watch for wheezing, mucus, or open-mouth breathing."/>
        <HealthItem title="Inclusion Body Disease (IBD)" detail="A serious viral disease affecting pythons. GTPs are susceptible. Strict quarantine of all new animals — minimum 90 days. Symptoms include regurgitation and neurological signs."/>
        <HealthItem title="Mites" detail="Very common. Check regularly around heat sources and water bowl. Mites are harder to detect on GTPs due to their scale texture."/>
        <HealthItem title="Cryptosporidiosis" detail="Serious parasitic infection — no cure. Quarantine all new animals strictly. Symptoms include chronic regurgitation and weight loss."/>
        <HealthItem title="Perch sores" detail="Caused by perches that are too thin, too hot, or rough. Ensure perches are smooth, correctly sized, and not placed too close to heat sources."/>
        <HealthItem dot="#4a9e6b" title="Signs of good health" detail="Vivid green colouration with clean white or blue dorsal spots, bright eyes, coiled symmetrically on perch, accepting regular feeds, good body condition."/>
        <SectionLabel>Shedding</SectionLabel>
        <div style={{background:C.cream,borderRadius:12,padding:"12px 14px",border:"0.5px solid #e8e8e4",fontSize:13,color:"#666",lineHeight:1.7}}>GTPs typically shed every 6–10 weeks. Increase misting frequency during the pre-shed period (blue eyes, dull colouration). A complete shed in one piece is a good indicator of correct humidity. Retained shed around eye caps requires prompt attention — do not attempt to remove forcefully. Soak the animal in warm water and consult a reptile vet if eye caps are retained.</div>
      </>}
      {tab === "handling & breeding" && <>
        <SnakeHandling biteRisk="high" notes="Green Tree Pythons are not a handling species — they are a display animal. Many individuals are defensive throughout their lives and will strike without warning. Their teeth are long relative to their body size and bites are painful. If handling is necessary (for health checks etc.) use a snake hook to move the animal onto a perch or your arm — never reach in and grab. Some individuals become more tolerant with age and regular very gentle interaction, but this is not guaranteed. Respect their nature." />
        <SnakeBreeding clutchSize="10–25 eggs" incubationTemp="28–30°C" incubationDays="45–55 days" maturityAge="3–4 years" notes="A prestigious breeding project for experienced keepers. Females coil around their eggs and actively thermoregulate them — do not disturb the female during incubation. Hatchlings emerge yellow or red and gradually transition to green over 6–12 months — this colour change is one of the most remarkable in the reptile world. The colour and pattern of adults is highly variable and certain colour morphs and localities command premium prices." />
        <WarnBox type="gold" title="Juvenile colour transition">Hatchlings are bright yellow or red — not green! The transition to adult green colouration occurs gradually over 6–12 months and is one of the most spectacular transformations in the reptile world. During this period feeding can become irregular — this is normal.</WarnBox>
      </>}
      {tab === "licencing" && <>
        <LegalTab note="Green Tree Pythons require an advanced keeper licence. Limited availability from specialist breeders only." states={[{ abbr: "NSW", cat: "Advanced licence", ok: true }, { abbr: "VIC", cat: "Advanced licence", ok: true }, { abbr: "QLD", cat: "Advanced licence", ok: true }, { abbr: "SA", cat: "Advanced permit", ok: true }, { abbr: "WA", cat: "Advanced licence", ok: true }, { abbr: "TAS", cat: "TAS natives only", ok: false }, { abbr: "ACT", cat: "Advanced licence", ok: true }, { abbr: "NT", cat: "Check with authority", ok: true }]} />
        <WarnBox type="blue" title="Cape York population">Australian GTPs are sourced from the Cape York Peninsula population. New Guinea populations are not available for private keeping in Australia. Always ensure any animal you purchase is legally captive-bred from documented Australian stock.</WarnBox>
      </>}
    </>}
  />
);

export default GreenTreePythonPage;
