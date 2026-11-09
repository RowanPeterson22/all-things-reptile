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

// ─── Rough-scaled Python page ─────────────────────────────────────
const RoughScaledPythonPage = ({ onBack }) => (
  <SpeciesPage onBack={onBack} name="Rough-scaled Python" latin="Morelia carinata" emoji="🐍"
    badges={[["Advanced", T.noBg, T.no], ["Australian native", T.infoBg, T.info], ["Extremely rare", T.noBg, T.no]]}
    tabs={["overview","feeding","health & shedding","handling & breeding","licencing"]}
    tabContent={(tab) => <>
      {tab === "overview" && <>
        <p style={{fontSize: 15, color: T.body,lineHeight:1.6,marginBottom:14}}>One of Australia's rarest and most unique pythons. Found only in the remote rocky gorges of the Kimberley region in Western Australia. Distinguished by their strongly keeled (ridged) scales — unique among Australian pythons. Exceptionally rarely available in captivity and found in very few collections worldwide.</p>
        <WarnBox type="red" title="Extremely rare — specialist only">Rough-scaled Pythons are almost never available in Australian captivity. If you encounter one for sale, verify the legitimacy of the seller and all documentation carefully. This is a species for specialist collectors with advanced experience only.</WarnBox>
        <SectionLabel>Quick stats</SectionLabel>
        <StatGrid stats={[["📏","Adult size","1.2–2.0 m"],["⏳","Lifespan","20–25 yrs"],["🏠","Min. enclosure","150 × 60 cm"],["💧","Humidity","50–70%"]]} />
        <SectionLabel>Temperature requirements</SectionLabel>
        <TempCard>
          <TempBar label="Basking spot" value="33–36°C" width="82%" color="#e05a2b"/>
          <TempBar label="Warm side" value="28–30°C" width="62%" color="#e0922b"/>
          <TempBar label="Cool side" value="22–26°C" width="44%" color="#4a9e6b"/>
          <TempBar label="Overnight low" value="18–22°C" width="28%" color="#2b7ec0"/>
        </TempCard>
        <WarnBox type="gold" title="Limited husbandry data">Due to the extreme rarity of this species in captivity, published husbandry data is limited. The care requirements above are based on their natural habitat in rocky Kimberley gorges and comparison with related species. Experienced mentorship is strongly recommended.</WarnBox>
        <SectionLabel>Enclosure setup</SectionLabel>
        <div style={{background:T.card,borderRadius:14,padding:"12px 14px",border: "none",fontSize: 15, color: T.body,lineHeight:1.7}}>Rocky gorge-style setup. Cork bark and rock hides. Moderate humidity with good ventilation. Sturdy climbing opportunities — they are semi-arboreal in the wild. A water bowl large enough to soak in. The enclosure should reflect their natural rocky habitat as closely as possible.</div>
        <ShopBtn secondary>Ask a question ↗</ShopBtn>
      </>}
      {tab === "feeding" && <>
        <p style={{fontSize: 15, color: T.body,lineHeight:1.6,marginBottom:12}}>Carnivorous. Expected to feed on small mammals and possibly lizards in the wild. In captivity, rodents are the standard prey item. Feeding data from captive specimens is very limited.</p>
        <div style={FOOD_CARD}>
          <FoodItem icon="🐭" name="Mice (various sizes)" detail="Juveniles and adults" freq="Every 7–10 days"/>
          <FoodItem icon="🐀" name="Small rats" detail="Large adults" freq="Every 10–14 days"/>
        </div>
        <WarnBox type="gold" title="Scenting may be needed">Some captive specimens have required scenting of prey with lizard to initiate feeding. Purchase only animals with a confirmed established feeding record.</WarnBox>
        <WarnBox type="red" title="Feeding response">Always use tongs and hook-train. Given the extreme rarity of this species, the risk of injury to the animal during feeding must be minimised.</WarnBox>
      </>}
      {tab === "health & shedding" && <>
        <SectionLabel mt={0}>Common health issues</SectionLabel>
        <HealthItem title="Limited data available" detail="Due to the rarity of this species in captivity, comprehensive health data is not available. A reptile vet experienced with pythons should be identified before acquiring this species."/>
        <HealthItem title="Feeding refusal" detail="Some captive specimens are reluctant feeders. Purchase only animals with a confirmed, established feeding record from reputable sources."/>
        <HealthItem title="Stress" detail="This species is so rarely kept that stress from improper husbandry is a significant risk. Thorough research and experienced mentorship is essential."/>
        <HealthItem dot="#4a9e6b" title="Signs of good health" detail="Alert behaviour, keeled scales in good condition, accepting regular feeds, active at night."/>
        <SnakeShedding />
      </>}
      {tab === "handling & breeding" && <>
        <SnakeHandling biteRisk="medium" notes="Temperament data is very limited given the rarity of this species in captivity. Approach with the same respect as any wild-type python. Hook-train consistently. Given the extreme value and rarity of this species, minimising handling stress is a priority." />
        <SnakeBreeding clutchSize="Unknown" incubationTemp="30–32°C" incubationDays="Unknown" maturityAge="Unknown" notes="Breeding data for this species in captivity is essentially non-existent. Any successful breeding would be a significant achievement and contribution to the captive population. Collaboration with other specialist keepers and herpetological societies is strongly encouraged." />
      </>}
      {tab === "licencing" && <>
        <p style={{fontSize: 15, color: T.body,lineHeight:1.6,marginBottom:12}}>Rough-scaled Pythons are found only in WA and may have been recorded in QLD. Licence requirements and availability vary significantly by state. Verify all documentation extremely carefully before any transaction involving this species.</p>
        <WarnBox type="red" title="Due diligence critical">Given the extreme rarity and value of this species, thoroughly verify the legitimacy of any seller, the legality of the animal, and all documentation. Consult your state wildlife authority before acquiring.</WarnBox>
        <LegalTab note="Can be kept in NSW, VIC, QLD, SA, WA, ACT and NT. Not permitted in TAS. Licence names are each authority's own; checked November 2026." states={[{ abbr: "NSW", cat: "Advanced licence", ok: true }, { abbr: "VIC", cat: "Advanced licence", ok: true }, { abbr: "QLD", cat: "Standard licence", ok: true }, { abbr: "SA", cat: "Basic permit (one animal permit-free)", ok: true }, { abbr: "WA", cat: "Pet keeper's licence (advanced)", ok: true }, { abbr: "TAS", cat: "Not permitted (TAS natives only)", ok: false }, { abbr: "ACT", cat: "Keeper licence (case by case)", ok: true }, { abbr: "NT", cat: "Import + keep permit (case by case)", ok: true }]} />
      </>}
    </>}
  />
);

export default RoughScaledPythonPage;
