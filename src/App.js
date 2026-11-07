import { useState } from "react";
import { C } from "./constants/colours";
import SectionLabel from "./components/SectionLabel";
import WarnBox from "./components/WarnBox";
import ShopBtn from "./components/ShopBtn";
import TempBar from "./components/TempBar";
import FoodItem from "./components/FoodItem";
import HealthItem from "./components/HealthItem";
import StatGrid from "./components/StatGrid";
import LegalTab from "./components/LegalTab";
import SplashScreen from "./components/SplashScreen";
import InsectCard from "./components/InsectCard";
import BrowseScreen from "./screens/BrowseScreen";
import CareScreen from "./screens/CareScreen";
import LegalScreen from "./screens/LegalScreen";
import IdentifyScreen from "./screens/IdentifyScreen";
import GlossaryScreen from "./screens/GlossaryScreen";
import SearchResults from "./screens/SearchResults";
import SnakeShedding from "./components/SnakeShedding";
import SnakeHandling from "./components/SnakeHandling";
import SnakeBreeding from "./components/SnakeBreeding";
import SpeciesPage from "./components/SpeciesPage";


// ─── SNAKE PAGES ──────────────────────────────────────────────────

const ChildrensPythonPage = ({ onBack }) => (
  <SpeciesPage onBack={onBack} name="Children's Python" latin="Antaresia childreni" emoji="🐍"
    badges={[["Beginner friendly", C.greenPale, C.green], ["Australian native", C.bluePale, C.blue], ["Nocturnal", C.goldLight, "#7a5a1e"]]}
    tabs={["overview", "feeding", "health & shedding", "handling & breeding", "licencing"]}
    tabContent={(tab) => <>
      {tab === "overview" && <>
        <p style={{ fontSize: 13, color: "#666", lineHeight: 1.6, marginBottom: 14 }}>One of the best beginner snakes in Australia. Small, manageable, and with a calm temperament once settled — Children's Pythons are perfect for first-time snake keepers of all ages.</p>
        <SectionLabel mt={0}>Quick stats</SectionLabel>
        <StatGrid stats={[["📏", "Adult size", "1.0–1.5 m"], ["⏳", "Lifespan", "20–30 yrs"], ["🏠", "Min. enclosure", "90 × 45 cm"], ["💧", "Humidity", "40–60%"]]} />
        <SectionLabel>Temperature requirements</SectionLabel>
        <TempBar label="Basking spot" value="32–35°C" width="78%" color="#e05a2b" />
        <TempBar label="Warm side" value="28–30°C" width="62%" color="#e0922b" />
        <TempBar label="Cool side" value="22–26°C" width="44%" color="#4a9e6b" />
        <TempBar label="Overnight low" value="18–20°C" width="26%" color="#2b7ec0" />
        <SectionLabel>Enclosure setup</SectionLabel>
        <div style={{ background: C.cream, borderRadius: 12, padding: "12px 14px", border: "0.5px solid #e8e8e4", fontSize: 13, color: "#666", lineHeight: 1.7 }}>Timber or PVC enclosure. Provide two snug hides (warm and cool end). Newspaper, paper towel, or cypress mulch substrate. A small water bowl for soaking. Low-level lighting — they're nocturnal so UVB is not essential, but a low-output UVB is beneficial.</div>
        <ShopBtn>🛒 Shop Children's Python supplies</ShopBtn>
        <ShopBtn secondary>Ask a question ↗</ShopBtn>
      </>}
      {tab === "feeding" && <>
        <p style={{ fontSize: 13, color: "#666", lineHeight: 1.6, marginBottom: 12 }}>Strictly carnivorous. Feed pre-killed or frozen/thawed mice — never feed live prey. The size of prey should not exceed the widest part of the snake's body.</p>
        <SectionLabel mt={0}>Feeding schedule</SectionLabel>
        <div style={{ background: C.cream, borderRadius: 12, border: "0.5px solid #e8e8e4", padding: "0 14px" }}>
          <FoodItem icon="🐭" name="Pinky / fuzzy mice" detail="Hatchlings and juveniles" freq="Every 5–7 days" />
          <FoodItem icon="🐭" name="Adult mice" detail="Sub-adults and adults" freq="Every 7–10 days" />
          <FoodItem icon="🐭" name="Small rats" detail="Large adults only" freq="Every 10–14 days" />
        </div>
        <WarnBox type="gold" title="Frozen/thawed is always preferred">Pre-killed or frozen/thawed prey eliminates the risk of injury to your snake from live prey. Thaw completely in warm water before feeding — never microwave.</WarnBox>
        <WarnBox type="red" title="Feeding response">Always use feeding tongs — never hand-feed. Hook-train from an early age to distinguish feeding from handling.</WarnBox>
      </>}
      {tab === "health & shedding" && <>
        <SectionLabel mt={0}>Common health issues</SectionLabel>
        <HealthItem title="Respiratory infection" detail="Wheezing, mucus, open-mouth breathing. Caused by temperatures being too low or humidity too high. Veterinary treatment required." />
        <HealthItem title="Mites" detail="Tiny moving dots on the snake or in the water bowl. Treat the snake and completely strip and disinfect the enclosure. Reptile-safe mite spray available from reptile stores." />
        <HealthItem title="Regurgitation" detail="Usually caused by handling too soon after feeding, temperatures too low, or prey too large. Wait 48–72 hrs after feeding before handling." />
        <HealthItem dot="#4a9e6b" title="Signs of good health" detail="Clear eyes (between sheds), regular feeding response, firm body, clean vent, and active exploration at night." />
        <SnakeShedding />
      </>}
      {tab === "handling & breeding" && <>
        <SnakeHandling biteRisk="low" notes="Children's Pythons are generally very calm and reluctant to bite once settled. Hatchlings can be nippy — handle regularly from an early age to build confidence. Bites are small and superficial." />
        <SnakeBreeding clutchSize="8–15 eggs" incubationTemp="30–32°C" incubationDays="55–65 days" maturityAge="2–3 years" notes="Cooling in winter (dropping temps to 18–20°C overnight for 6–8 weeks) triggers breeding behaviour. Females lay eggs approximately 30–40 days after mating. Eggs should be incubated in a moist vermiculite medium." />
      </>}
      {tab === "licencing" && <LegalTab note="Children's Pythons are one of the easiest snakes to licence in Australia." states={[{ abbr: "NSW", cat: "Standard keeper licence", ok: true }, { abbr: "VIC", cat: "Basic wildlife licence", ok: true }, { abbr: "QLD", cat: "Standard keeper licence", ok: true }, { abbr: "SA", cat: "Basic permit", ok: true }, { abbr: "WA", cat: "Standard licence", ok: true }, { abbr: "TAS", cat: "TAS natives only", ok: false }, { abbr: "ACT", cat: "Standard licence", ok: true }, { abbr: "NT", cat: "Check with authority", ok: true }]} />}
    </>}
  />
);

const StimsonsPythonPage = ({ onBack }) => (
  <SpeciesPage onBack={onBack} name="Stimson's Python" latin="Antaresia stimsoni" emoji="🐍"
    badges={[["Beginner friendly", C.greenPale, C.green], ["Australian native", C.bluePale, C.blue], ["Nocturnal", C.goldLight, "#7a5a1e"]]}
    tabs={["overview", "feeding", "health & shedding", "handling & breeding", "licencing"]}
    tabContent={(tab) => <>
      {tab === "overview" && <>
        <p style={{ fontSize: 13, color: "#666", lineHeight: 1.6, marginBottom: 14 }}>A compact, beautifully patterned python from arid and semi-arid Australia. Often compared to Children's Pythons in temperament — calm, manageable, and well suited to beginners. Their striking blotched pattern makes them a favourite.</p>
        <SectionLabel mt={0}>Quick stats</SectionLabel>
        <StatGrid stats={[["📏", "Adult size", "0.8–1.2 m"], ["⏳", "Lifespan", "20–25 yrs"], ["🏠", "Min. enclosure", "90 × 45 cm"], ["💧", "Humidity", "30–50%"]]} />
        <SectionLabel>Temperature requirements</SectionLabel>
        <TempBar label="Basking spot" value="33–36°C" width="80%" color="#e05a2b" />
        <TempBar label="Warm side" value="28–30°C" width="62%" color="#e0922b" />
        <TempBar label="Cool side" value="22–26°C" width="44%" color="#4a9e6b" />
        <TempBar label="Overnight low" value="16–18°C" width="22%" color="#2b7ec0" />
        <SectionLabel>Enclosure setup</SectionLabel>
        <div style={{ background: C.cream, borderRadius: 12, padding: "12px 14px", border: "0.5px solid #e8e8e4", fontSize: 13, color: "#666", lineHeight: 1.7 }}>Arid setup — low humidity. Sandy red substrate or reptile sand/coir mix works well. Rocky hides. A small water bowl changed regularly. Keep the enclosure dry — this species is prone to respiratory issues in damp conditions.</div>
        <ShopBtn>🛒 Shop Stimson's Python supplies</ShopBtn>
        <ShopBtn secondary>Ask a question ↗</ShopBtn>
      </>}
      {tab === "feeding" && <>
        <p style={{ fontSize: 13, color: "#666", lineHeight: 1.6, marginBottom: 12 }}>Carnivorous — pre-killed or frozen/thawed mice. A strong feeding response species. Always use tongs.</p>
        <div style={{ background: C.cream, borderRadius: 12, border: "0.5px solid #e8e8e4", padding: "0 14px" }}>
          <FoodItem icon="🐭" name="Pinky / fuzzy mice" detail="Hatchlings and juveniles" freq="Every 5–7 days" />
          <FoodItem icon="🐭" name="Adult mice" detail="Sub-adults and adults" freq="Every 7–10 days" />
        </div>
        <WarnBox type="red" title="Strong feeding response">Stimson's Pythons are enthusiastic feeders. Always use tongs and hook-train from day one. Feeding response bites are common and not a sign of aggression.</WarnBox>
        <WarnBox type="gold" title="Frozen/thawed preferred">Always thaw prey completely. Offer at room temperature or slightly warmer. Never use a microwave to thaw.</WarnBox>
      </>}
      {tab === "health & shedding" && <>
        <SectionLabel mt={0}>Common health issues</SectionLabel>
        <HealthItem title="Respiratory infection" detail="Most common in Stimson's Pythons due to their arid origins — they are particularly sensitive to high humidity and cold temperatures. Keep enclosure dry and warm." />
        <HealthItem title="Scale rot" detail="Brown or blistered scales, usually on the belly. Caused by substrate being too damp. Ensure substrate is dry and clean." />
        <HealthItem title="Mites" detail="Tiny moving dots on skin or in water bowl. Treat snake and fully disinfect enclosure." />
        <HealthItem dot="#4a9e6b" title="Signs of good health" detail="Smooth, patterned scales, clear eyes, strong feeding response, firm muscular body." />
        <SnakeShedding />
      </>}
      {tab === "handling & breeding" && <>
        <SnakeHandling biteRisk="medium" notes="Stimson's Pythons can be more defensive than Children's Pythons, especially as hatchlings. Regular handling from a young age makes a significant difference. Most adults become quite calm. Bites are small but can startle." />
        <SnakeBreeding clutchSize="5–12 eggs" incubationTemp="30–32°C" incubationDays="55–65 days" maturityAge="2–3 years" notes="Requires a cooling period in winter. Drop overnight temps to 15–17°C for 6–8 weeks. Females coil around their eggs and should not be disturbed once laid. Remove eggs carefully to an incubator." />
      </>}
      {tab === "licencing" && <LegalTab note="Stimson's Pythons are a commonly kept beginner snake available across most of Australia." states={[{ abbr: "NSW", cat: "Standard keeper licence", ok: true }, { abbr: "VIC", cat: "Basic wildlife licence", ok: true }, { abbr: "QLD", cat: "Standard keeper licence", ok: true }, { abbr: "SA", cat: "Basic permit", ok: true }, { abbr: "WA", cat: "Standard licence", ok: true }, { abbr: "TAS", cat: "TAS natives only", ok: false }, { abbr: "ACT", cat: "Standard licence", ok: true }, { abbr: "NT", cat: "Check with authority", ok: true }]} />}
    </>}
  />
);

const SpottedPythonPage = ({ onBack }) => (
  <SpeciesPage onBack={onBack} name="Spotted Python" latin="Antaresia maculosa" emoji="🐍"
    badges={[["Beginner friendly", C.greenPale, C.green], ["Australian native", C.bluePale, C.blue], ["Nocturnal", C.goldLight, "#7a5a1e"]]}
    tabs={["overview", "feeding", "health & shedding", "handling & breeding", "licencing"]}
    tabContent={(tab) => <>
      {tab === "overview" && <>
        <p style={{ fontSize: 13, color: "#666", lineHeight: 1.6, marginBottom: 14 }}>The largest of the Antaresia genus — still a manageable beginner snake with an attractive spotted pattern. Naturally found in rocky terrain across northern and eastern Australia. Hardy, adaptable, and with a generally calm disposition.</p>
        <SectionLabel mt={0}>Quick stats</SectionLabel>
        <StatGrid stats={[["📏", "Adult size", "1.2–1.6 m"], ["⏳", "Lifespan", "20–25 yrs"], ["🏠", "Min. enclosure", "90 × 45 cm"], ["💧", "Humidity", "40–60%"]]} />
        <SectionLabel>Temperature requirements</SectionLabel>
        <TempBar label="Basking spot" value="32–35°C" width="78%" color="#e05a2b" />
        <TempBar label="Warm side" value="28–30°C" width="62%" color="#e0922b" />
        <TempBar label="Cool side" value="22–26°C" width="44%" color="#4a9e6b" />
        <TempBar label="Overnight low" value="18–20°C" width="26%" color="#2b7ec0" />
        <SectionLabel>Enclosure setup</SectionLabel>
        <div style={{ background: C.cream, borderRadius: 12, padding: "12px 14px", border: "0.5px solid #e8e8e4", fontSize: 13, color: "#666", lineHeight: 1.7 }}>Timber or PVC enclosure. Cypress mulch or coir substrate. Rocky hides work well and match their natural environment. A water bowl large enough to soak in. Add some climbing opportunities — they enjoy exploring vertically despite being primarily ground-dwellers.</div>
        <ShopBtn>🛒 Shop Spotted Python supplies</ShopBtn>
        <ShopBtn secondary>Ask a question ↗</ShopBtn>
      </>}
      {tab === "feeding" && <>
        <p style={{ fontSize: 13, color: "#666", lineHeight: 1.6, marginBottom: 12 }}>Carnivorous. Enthusiastic feeders — one of the easiest Antaresia species to feed consistently. Always use pre-killed or frozen/thawed prey and feeding tongs.</p>
        <div style={{ background: C.cream, borderRadius: 12, border: "0.5px solid #e8e8e4", padding: "0 14px" }}>
          <FoodItem icon="🐭" name="Pinky / fuzzy mice" detail="Hatchlings" freq="Every 5–7 days" />
          <FoodItem icon="🐭" name="Weaner / adult mice" detail="Juveniles and sub-adults" freq="Every 7–10 days" />
          <FoodItem icon="🐭" name="Adult mice / small rats" detail="Adults" freq="Every 10–14 days" />
        </div>
        <WarnBox type="red" title="Strong feeding response">Spotted Pythons are eager feeders. Always use tongs and hook-train. Never hand-feed. The feeding response can be triggered by food smells on hands.</WarnBox>
      </>}
      {tab === "health & shedding" && <>
        <SectionLabel mt={0}>Common health issues</SectionLabel>
        <HealthItem title="Respiratory infection" detail="Watch for wheezing, mucus, or open-mouth breathing. Usually temperature or humidity related. Seek vet care promptly." />
        <HealthItem title="Obesity" detail="Spotted Pythons have a great feeding response but can become overweight if fed too often or prey is too large. Keep portions appropriately sized." />
        <HealthItem title="Regurgitation" detail="Usually from handling too soon after feeding, prey too large, or temperatures too low. Fast for 2 weeks after regurgitation before offering food again." />
        <HealthItem dot="#4a9e6b" title="Signs of good health" detail="Strong feeding response, clear eyes, smooth spotted pattern, active at night, regular shedding." />
        <SnakeShedding />
      </>}
      {tab === "handling & breeding" && <>
        <SnakeHandling biteRisk="low" notes="Spotted Pythons are generally calm and tolerate handling well once settled. Hatchlings can be more defensive. Regular gentle handling builds confidence quickly. Adults are typically very relaxed." />
        <SnakeBreeding clutchSize="8–20 eggs" incubationTemp="30–32°C" incubationDays="55–65 days" maturityAge="2–3 years" notes="One of the easier Antaresia to breed. Requires a winter cooling period. Females are good egg-guarders and will coil around the clutch. Incubate eggs in a moist substrate at stable temperature for best hatch rates." />
      </>}
      {tab === "licencing" && <LegalTab note="Spotted Pythons are a popular beginner species widely available from licensed breeders." states={[{ abbr: "NSW", cat: "Standard keeper licence", ok: true }, { abbr: "VIC", cat: "Basic wildlife licence", ok: true }, { abbr: "QLD", cat: "Standard keeper licence", ok: true }, { abbr: "SA", cat: "Basic permit", ok: true }, { abbr: "WA", cat: "Standard licence", ok: true }, { abbr: "TAS", cat: "TAS natives only", ok: false }, { abbr: "ACT", cat: "Standard licence", ok: true }, { abbr: "NT", cat: "Check with authority", ok: true }]} />}
    </>}
  />
);

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
      {tab === "licencing" && <LegalTab note="Carpet Pythons require an advanced keeper licence due to their size. Available from licensed breeders across Australia." states={[{ abbr: "NSW", cat: "Advanced licence", ok: true }, { abbr: "VIC", cat: "Advanced licence", ok: true }, { abbr: "QLD", cat: "Advanced licence", ok: true }, { abbr: "SA", cat: "Advanced permit", ok: true }, { abbr: "WA", cat: "Advanced licence", ok: true }, { abbr: "TAS", cat: "TAS natives only", ok: false }, { abbr: "ACT", cat: "Advanced licence", ok: true }, { abbr: "NT", cat: "Check with authority", ok: true }]} />}
    </>}
  />
);

const BredliPage = ({ onBack }) => (
  <SpeciesPage onBack={onBack} name="Bredli Python" latin="Morelia bredli" emoji="🐍"
    badges={[["Intermediate", C.goldLight, "#7a5a1e"], ["Australian native", C.bluePale, C.blue], ["Nocturnal", C.goldLight, "#7a5a1e"]]}
    tabs={["overview", "feeding", "health & shedding", "handling & breeding", "licencing"]}
    tabContent={(tab) => <>
      {tab === "overview" && <>
        <p style={{ fontSize: 13, color: "#666", lineHeight: 1.6, marginBottom: 14 }}>The Centralian Carpet Python — known for its stunning red-orange and brown patterning. Found in the rocky gorges of central Australia. One of the calmer large pythons, making it a popular choice for keepers stepping up to a bigger snake.</p>
        <SectionLabel mt={0}>Quick stats</SectionLabel>
        <StatGrid stats={[["📏", "Adult size", "2.0–2.8 m"], ["⏳", "Lifespan", "20–30 yrs"], ["🏠", "Min. enclosure", "180 × 60 cm"], ["💧", "Humidity", "40–55%"]]} />
        <SectionLabel>Temperature requirements</SectionLabel>
        <TempBar label="Basking spot" value="35–38°C" width="86%" color="#e05a2b" />
        <TempBar label="Warm side" value="28–32°C" width="66%" color="#e0922b" />
        <TempBar label="Cool side" value="22–26°C" width="44%" color="#4a9e6b" />
        <TempBar label="Overnight low" value="16–20°C" width="24%" color="#2b7ec0" />
        <SectionLabel>Enclosure setup</SectionLabel>
        <div style={{ background: C.cream, borderRadius: 12, padding: "12px 14px", border: "0.5px solid #e8e8e4", fontSize: 13, color: "#666", lineHeight: 1.7 }}>Large timber or PVC enclosure. Rocky substrate and hide décor suits their natural environment. Climbing branches appreciated. Lower humidity than tropical carpet subspecies — keep ventilation good. Water bowl large enough for soaking.</div>
        <ShopBtn>🛒 Shop Bredli Python supplies</ShopBtn>
        <ShopBtn secondary>Ask a question ↗</ShopBtn>
      </>}
      {tab === "feeding" && <>
        <p style={{ fontSize: 13, color: "#666", lineHeight: 1.6, marginBottom: 12 }}>Carnivorous. Generally reliable feeders. Adults require larger prey items — always size prey appropriately (no wider than the widest body point).</p>
        <div style={{ background: C.cream, borderRadius: 12, border: "0.5px solid #e8e8e4", padding: "0 14px" }}>
          <FoodItem icon="🐭" name="Mice (various sizes)" detail="Hatchlings through to small juveniles" freq="Every 7 days" />
          <FoodItem icon="🐀" name="Medium to large rats" detail="Sub-adults and adults" freq="Every 10–14 days" />
        </div>
        <WarnBox type="gold" title="Winter feeding slowdown">Bredlis often slow or stop feeding in winter. Don't force feed — this is natural behaviour linked to their arid origin. Resume normal feeding as temps rise in spring.</WarnBox>
        <WarnBox type="red" title="Feeding response">Use tongs and hook-train. Bredlis are generally calmer than many carpets but should always be hook-trained before handling.</WarnBox>
      </>}
      {tab === "health & shedding" && <>
        <SectionLabel mt={0}>Common health issues</SectionLabel>
        <HealthItem title="Respiratory infection" detail="Keep humidity below 60% and ensure good ventilation. Bredlis are from an arid environment and prone to respiratory issues in damp conditions." />
        <HealthItem title="Mites" detail="Check regularly, especially around the heat source. Full enclosure treatment required." />
        <HealthItem title="Anorexia in winter" detail="Normal seasonal fasting — not a health issue if the snake maintains body condition. If weight loss is significant, consult a reptile vet." />
        <HealthItem dot="#4a9e6b" title="Signs of good health" detail="Rich orange-red patterning, alert posture, strong feeding response (outside winter), smooth shedding." />
        <SnakeShedding />
      </>}
      {tab === "handling & breeding" && <>
        <SnakeHandling biteRisk="low" notes="Bredlis have a reputation as one of the calmer large pythons. Most adults are quite relaxed and tolerate handling well. Juveniles can be nippy — regular handling from an early age is key. Hook-training is still important given their size." />
        <SnakeBreeding clutchSize="12–25 eggs" incubationTemp="30–32°C" incubationDays="55–65 days" maturityAge="3–4 years" notes="Winter cooling is essential for successful breeding. Drop overnight temps to 15–18°C for 8–10 weeks. Females are protective egg-guarders. Bredlis are a popular breeding project due to their beautiful colouration." />
      </>}
      {tab === "licencing" && <LegalTab note="Bredli Pythons require an advanced keeper licence. Available from licensed breeders across Australia." states={[{ abbr: "NSW", cat: "Advanced licence", ok: true }, { abbr: "VIC", cat: "Advanced licence", ok: true }, { abbr: "QLD", cat: "Advanced licence", ok: true }, { abbr: "SA", cat: "Advanced permit", ok: true }, { abbr: "WA", cat: "Advanced licence", ok: true }, { abbr: "TAS", cat: "TAS natives only", ok: false }, { abbr: "ACT", cat: "Advanced licence", ok: true }, { abbr: "NT", cat: "Check with authority", ok: true }]} />}
    </>}
  />
);

const DiamondPythonPage = ({ onBack }) => (
  <SpeciesPage onBack={onBack} name="Diamond Python" latin="Morelia spilota spilota" emoji="🐍"
    badges={[["Intermediate", C.goldLight, "#7a5a1e"], ["Australian native", C.bluePale, C.blue], ["Cool climate", C.greenPale, C.green]]}
    tabs={["overview", "feeding", "health & shedding", "handling & breeding", "licencing"]}
    tabContent={(tab) => <>
      {tab === "overview" && <>
        <p style={{ fontSize: 13, color: "#666", lineHeight: 1.6, marginBottom: 14 }}>The iconic black and gold python of south-eastern Australia. Strikingly beautiful and unique among Australian pythons in their preference for cooler temperatures. Found naturally in the forests of NSW and Victoria — including Sydney's outer suburbs. Requires a different approach to heating than most pythons.</p>
        <SectionLabel mt={0}>Quick stats</SectionLabel>
        <StatGrid stats={[["📏", "Adult size", "2.0–3.0 m"], ["⏳", "Lifespan", "20–30 yrs"], ["🏠", "Min. enclosure", "180 × 60 cm"], ["💧", "Humidity", "60–80%"]]} />
        <SectionLabel>Temperature requirements</SectionLabel>
        <TempBar label="Basking spot" value="30–33°C" width="70%" color="#e05a2b" />
        <TempBar label="Warm side" value="25–28°C" width="54%" color="#e0922b" />
        <TempBar label="Cool side" value="18–22°C" width="34%" color="#4a9e6b" />
        <TempBar label="Overnight low" value="12–16°C" width="16%" color="#2b7ec0" />
        <WarnBox type="blue" title="Cooler temps than most pythons">Diamond Pythons overheat easily. Their basking temp is significantly lower than other carpets. Do not apply standard carpet python heating to a diamond — it can be fatal. Cool end temperatures as low as 12°C in winter are normal and beneficial.</WarnBox>
        <SectionLabel>Enclosure setup</SectionLabel>
        <div style={{ background: C.cream, borderRadius: 12, padding: "12px 14px", border: "0.5px solid #e8e8e4", fontSize: 13, color: "#666", lineHeight: 1.7 }}>Tall timber enclosure with climbing branches — diamonds are highly arboreal. Higher humidity than most pythons; misting is beneficial. Ensure excellent ventilation despite the higher humidity. Forest substrate (coir, leaf litter mix). Water bowl large enough to soak in.</div>
        <ShopBtn>🛒 Shop Diamond Python supplies</ShopBtn>
        <ShopBtn secondary>Ask a question ↗</ShopBtn>
      </>}
      {tab === "feeding" && <>
        <p style={{ fontSize: 13, color: "#666", lineHeight: 1.6, marginBottom: 12 }}>Carnivorous. Diamond Pythons can be fussier feeders than other carpets, especially in captivity. Patience is key. They may refuse food in summer when ambient temps are high.</p>
        <div style={{ background: C.cream, borderRadius: 12, border: "0.5px solid #e8e8e4", padding: "0 14px" }}>
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
      {tab === "licencing" && <LegalTab note="Diamond Pythons require an advanced keeper licence. Check current local requirements before purchasing." states={[{ abbr: "NSW", cat: "Advanced licence", ok: true }, { abbr: "VIC", cat: "Advanced licence", ok: true }, { abbr: "QLD", cat: "Advanced licence", ok: true }, { abbr: "SA", cat: "Advanced permit", ok: true }, { abbr: "WA", cat: "Advanced licence", ok: true }, { abbr: "TAS", cat: "TAS natives only", ok: false }, { abbr: "ACT", cat: "Advanced licence", ok: true }, { abbr: "NT", cat: "Check with authority", ok: true }]} />}
    </>}
  />
);

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
      {tab === "licencing" && <LegalTab note="Woma Pythons require an advanced keeper licence. Check current requirements in your state before purchasing." states={[{ abbr: "NSW", cat: "Advanced licence", ok: true }, { abbr: "VIC", cat: "Advanced licence", ok: true }, { abbr: "QLD", cat: "Advanced licence", ok: true }, { abbr: "SA", cat: "Advanced permit", ok: true }, { abbr: "WA", cat: "Advanced licence", ok: true }, { abbr: "TAS", cat: "TAS natives only", ok: false }, { abbr: "ACT", cat: "Advanced licence", ok: true }, { abbr: "NT", cat: "Check with authority", ok: true }]} />}
    </>}
  />
);

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
      {tab === "licencing" && <LegalTab note="Black-headed Pythons require an advanced keeper licence. Check current requirements in your state." states={[{ abbr: "NSW", cat: "Advanced licence", ok: true }, { abbr: "VIC", cat: "Advanced licence", ok: true }, { abbr: "QLD", cat: "Advanced licence", ok: true }, { abbr: "SA", cat: "Advanced permit", ok: true }, { abbr: "WA", cat: "Advanced licence", ok: true }, { abbr: "TAS", cat: "TAS natives only", ok: false }, { abbr: "ACT", cat: "Advanced licence", ok: true }, { abbr: "NT", cat: "Check with authority", ok: true }]} />}
    </>}
  />
);

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
      {tab === "licencing" && <LegalTab note="Olive Pythons require an advanced keeper licence due to their large size. Not a beginner species." states={[{ abbr: "NSW", cat: "Advanced licence", ok: true }, { abbr: "VIC", cat: "Advanced licence", ok: true }, { abbr: "QLD", cat: "Advanced licence", ok: true }, { abbr: "SA", cat: "Advanced permit", ok: true }, { abbr: "WA", cat: "Advanced licence", ok: true }, { abbr: "TAS", cat: "TAS natives only", ok: false }, { abbr: "ACT", cat: "Advanced licence", ok: true }, { abbr: "NT", cat: "Check with authority", ok: true }]} />}
    </>}
  />
);

// ─── Blue-tongue Skink page (unchanged) ──────────────────────────
const BlueTonguePage = ({ onBack }) => {
  const [tab, setTab] = useState("overview"); // eslint-disable-line no-unused-vars
  const tabs = ["overview", "feeding", "health", "licencing"];
  return (
    <SpeciesPage onBack={onBack} name="Eastern Blue-tongue Skink" latin="Tiliqua scincoides" emoji="🦎"
      badges={[["Beginner friendly", C.greenPale, C.green], ["Australian native", C.bluePale, C.blue], ["Diurnal", C.goldLight, "#7a5a1e"]]}
      tabs={tabs}
      tabContent={(t) => <>
        {t === "overview" && <>
          <p style={{ fontSize: 13, color: "#666", lineHeight: 1.6, marginBottom: 4 }}>One of Australia's most popular pet reptiles. Docile, hardy, and genuinely interactive — blue-tongues make an ideal first reptile for keepers of any age.</p>
          <SectionLabel mt={14}>Quick stats</SectionLabel>
          <StatGrid stats={[["📏", "Adult size", "45–60 cm"], ["⏳", "Lifespan", "15–20+ yrs"], ["🏠", "Min. enclosure", "120 × 60 cm"], ["💧", "Humidity", "40–60%"]]} />
          <SectionLabel>Temperature requirements</SectionLabel>
          <TempBar label="Basking spot" value="35–40°C" width="90%" color="#e05a2b" />
          <TempBar label="Warm side" value="28–32°C" width="68%" color="#e0922b" />
          <TempBar label="Cool side" value="22–26°C" width="45%" color="#4a9e6b" />
          <TempBar label="Overnight low" value="18°C min" width="25%" color="#2b7ec0" />
          <SectionLabel>Enclosure setup tips</SectionLabel>
          <div style={{ background: C.cream, borderRadius: 12, padding: "12px 14px", border: "0.5px solid #e8e8e4", fontSize: 13, color: "#666", lineHeight: 1.7 }}>Ground-dwellers — prioritise floor space over height. Use coconut coir or topsoil mix as substrate. Provide hides at both warm and cool ends. UVB lighting (T5 HO 10.0) strongly recommended.</div>
          <ShopBtn>🛒 Shop Blue-tongue supplies</ShopBtn><ShopBtn secondary>Ask a question ↗</ShopBtn>
        </>}
        {t === "feeding" && <>
          <p style={{ fontSize: 13, color: "#666", lineHeight: 1.6, marginBottom: 12 }}>Blue-tongues are omnivores. Rotate proteins, vegetables, and occasional fruit. Dust with calcium + D3 2–3× per week.</p>
          <SectionLabel mt={0}>Proteins</SectionLabel>
          <div style={{ background: C.cream, borderRadius: 12, border: "0.5px solid #e8e8e4", padding: "0 14px" }}>
            <FoodItem icon="🍗" name="Lean chicken / turkey mince" detail="Low fat — avoid fatty meats" freq="2–3× week" />
            <FoodItem icon="🥚" name="Boiled or scrambled egg" detail="Great protein source" freq="1× week" />
            <FoodItem icon="🐌" name="Snails / insects" detail="Wood roaches (Woodies), crickets, snails" freq="Occasional" />
          </div>
          <SectionLabel>Vegetables</SectionLabel>
          <div style={{ background: C.cream, borderRadius: 12, border: "0.5px solid #e8e8e4", padding: "0 14px" }}>
            <FoodItem icon="🥬" name="Leafy greens" detail="Collard greens, endive, bok choy" freq="Daily" />
            <FoodItem icon="🥕" name="Root vegetables" detail="Carrot, pumpkin, sweet potato" freq="Several× week" />
          </div>
          <WarnBox type="gold" title="Feeding schedule">Juveniles: feed daily. Adults: every 2–3 days. Remove uneaten food within a few hours.</WarnBox>
          <ShopBtn>🛒 Shop supplements & feeders</ShopBtn>
        </>}
        {t === "health" && <>
          <SectionLabel mt={0}>Common health issues</SectionLabel>
          <HealthItem title="Respiratory infection" detail="Wheezing, mucus around mouth or nose. Usually caused by temps being too low. See a vet promptly." />
          <HealthItem title="Mouth rot (stomatitis)" detail="Redness, swelling, or cheesy discharge around gums. Check mouth regularly during handling." />
          <HealthItem title="Retained shed" detail="Stuck skin especially around toes and eyes. Soak in shallow warm water and gently assist." />
          <HealthItem title="Obesity" detail="Very common in captivity. Keep protein portions lean and ensure enough space for movement." />
          <HealthItem dot="#4a9e6b" title="Signs of good health" detail="Clear eyes, alert behaviour, regular appetite, smooth shedding, firm body condition." />
          <WarnBox type="green" title="Find a reptile vet">Always use a vet with exotic / reptile experience.</WarnBox>
          <ShopBtn secondary>Ask about finding a vet ↗</ShopBtn>
        </>}
        {t === "licencing" && <LegalTab note="Blue-tongue Skinks are a popular beginner species. Victoria does not require a licence for Eastern Blue-tongues." states={[{ abbr: "NSW", cat: "Standard keeper licence", ok: true }, { abbr: "VIC", cat: "No licence required", ok: true }, { abbr: "QLD", cat: "Standard keeper licence", ok: true }, { abbr: "SA", cat: "Basic permit", ok: true }, { abbr: "WA", cat: "Standard licence", ok: true }, { abbr: "TAS", cat: "TAS natives only", ok: false }, { abbr: "ACT", cat: "Standard licence", ok: true }, { abbr: "NT", cat: "Check with authority", ok: true }]} />}
      </>}
    />
  );
};

// ─── Bearded Dragon page (unchanged) ─────────────────────────────
const BeardiePage = ({ onBack }) => {
  const [ageTab, setAgeTab] = useState("juv");
  const tabs = ["overview", "feeding", "health", "licencing"];
  return (
    <SpeciesPage onBack={onBack} name="Central Bearded Dragon" latin="Pogona vitticeps" emoji="🦎"
      badges={[["Beginner friendly", C.greenPale, C.green], ["Australian native", C.bluePale, C.blue], ["Diurnal", C.goldLight, "#7a5a1e"]]}
      tabs={tabs}
      tabContent={(t) => <>
        {t === "overview" && <>
          <p style={{ fontSize: 13, color: "#666", lineHeight: 1.6, marginBottom: 14 }}>Australia's most popular pet reptile. Curious, handleable from a young age, and well suited to families and first-time keepers.</p>
          <SectionLabel mt={0}>Quick stats</SectionLabel>
          <StatGrid stats={[["📏", "Adult size", "45–60 cm"], ["⏳", "Lifespan", "10–15 yrs"], ["🏠", "Min. enclosure", "120 × 60 cm"], ["💧", "Humidity", "30–40%"]]} />
          <SectionLabel>Temperature requirements</SectionLabel>
          <TempBar label="Basking spot" value="40–45°C" width="95%" color="#e03a1a" />
          <TempBar label="Warm side" value="30–35°C" width="72%" color="#e0782b" />
          <TempBar label="Cool side" value="24–28°C" width="48%" color="#4a9e6b" />
          <TempBar label="Overnight low" value="18–22°C" width="28%" color="#2b7ec0" />
          <SectionLabel>UVB requirements</SectionLabel>
          <WarnBox type="blue" title="T5 HO 10.0 UVB — essential">Run 12–14 hrs/day. Replace every 12 months. Mount inside, 30–40 cm above basking spot. Without strong UVB, Bearded Dragons cannot synthesise vitamin D3, leading to metabolic bone disease.</WarnBox>
          <SectionLabel>Brumation</SectionLabel>
          <div style={{ background: C.cream, borderRadius: 12, padding: "12px 14px", border: "0.5px solid #e8e8e4", fontSize: 13, color: "#666", lineHeight: 1.7 }}>As temps drop in autumn/winter, many beardies slow right down, sleep for extended periods, and refuse food. Completely normal. Reduce lighting to 8–10 hrs. Don't force-feed. Always offer fresh water. A vet check before brumation is a good idea.</div>
          <ShopBtn>🛒 Shop Bearded Dragon supplies</ShopBtn><ShopBtn secondary>Ask a question ↗</ShopBtn>
        </>}
        {t === "feeding" && <>
          <div style={{ display: "flex", background: C.cream, borderRadius: 10, padding: 3, border: "0.5px solid #e8e8e4", marginBottom: 14 }}>
            {[["juv", "Juvenile (0–12 months)"], ["adult", "Adult (12+ months)"]].map(([id, label]) => (
              <button key={id} onClick={() => setAgeTab(id)} style={{ flex: 1, padding: 7, border: "none", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", background: ageTab === id ? C.green : "none", color: ageTab === id ? "white" : "#888" }}>{label}</button>
            ))}
          </div>
          {ageTab === "juv" ? <>
            <WarnBox type="gold" title="70% protein / 30% greens">Young beardies need high protein to grow. Feed insects as the main staple with greens offered daily.</WarnBox>
            <div style={{ background: C.cream, borderRadius: 12, border: "0.5px solid #e8e8e4", padding: "0 14px" }}>
              <FoodItem icon="🦗" name="Crickets / black crickets" detail="Main staple — gut load before feeding" freq="2× daily" />
              <FoodItem icon="🪲" name="Wood roaches (Woodies)" detail="Excellent nutrition" freq="Daily" />
              <FoodItem icon="🥬" name="Collard / mustard greens" detail="Always available alongside insects" freq="Daily" />
            </div>
            <WarnBox type="red" title="Avoid for juveniles">No spinach, avocado, citrus, or fireflies. No wild-caught insects.</WarnBox>
          </> : <>
            <WarnBox type="green" title="70% greens / 30% protein">Adult beardies need far fewer insects. Shift the balance to leafy greens as the main meal.</WarnBox>
            <div style={{ background: C.cream, borderRadius: 12, border: "0.5px solid #e8e8e4", padding: "0 14px" }}>
              <FoodItem icon="🥬" name="Collard / mustard greens" detail="Main daily staple" freq="Daily" />
              <FoodItem icon="🥕" name="Butternut squash / pumpkin" detail="Great vitamins" freq="Several× week" />
              <FoodItem icon="🦗" name="Wood roaches (Woodies) / crickets" detail="Occasional protein top-up" freq="2–3× week" />
            </div>
          </>}
          <ShopBtn>🛒 Shop feeders & supplements</ShopBtn>
        </>}
        {t === "health" && <>
          <SectionLabel mt={0}>Common health issues</SectionLabel>
          <HealthItem title="Metabolic bone disease (MBD)" detail="Soft jaw, limb tremors, bowed legs. Caused by insufficient UVB and/or calcium. Completely preventable. See a vet immediately if suspected." />
          <HealthItem title="Impaction" detail="Inability to pass stool, lethargy, swollen abdomen. Caused by swallowing loose substrate or oversized food. Never feed insects wider than the space between the dragon's eyes." />
          <HealthItem title="Parasites" detail="Weight loss, runny stools despite eating. A faecal test from a reptile vet is the only way to confirm." />
          <HealthItem title="Yellow fungus disease (YFD)" detail="Yellow/brown crusty spreading patches on skin. Serious and often fatal. Get to a reptile vet immediately." />
          <HealthItem dot="#4a9e6b" title="Signs of good health" detail="Alert and curious, bright clear eyes, firm body, regular healthy stools, good appetite outside brumation." />
          <SectionLabel>Common beginner mistakes</SectionLabel>
          {[["Never house two bearded dragons together.", "Cohabitation causes chronic stress to the submissive animal even if they appear fine."], ["Don't feed insects wider than the gap between the eyes.", "Oversized prey causes impaction and hind leg paralysis in juveniles."], ["Never use a compact/coil UVB bulb.", "Only T5 HO linear tubes are adequate. Compact UVBs have been linked to eye damage."]].map(([title, detail], i) => (
            <div key={i} style={{ background: C.cream, borderRadius: 12, border: "0.5px solid #e8e8e4", padding: "12px 14px", marginBottom: 8, display: "flex", gap: 10 }}>
              <div style={{ width: 22, height: 22, borderRadius: "50%", background: C.red, color: "white", fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>{i + 1}</div>
              <div><div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{title}</div><div style={{ fontSize: 12, color: "#777", lineHeight: 1.6 }}>{detail}</div></div>
            </div>
          ))}
          <ShopBtn secondary>Ask about a health concern ↗</ShopBtn>
        </>}
        {t === "licencing" && <LegalTab note="Bearded Dragons are one of the most commonly kept reptiles in Australia." states={[{ abbr: "NSW", cat: "Standard keeper licence", ok: true }, { abbr: "VIC", cat: "Basic wildlife licence", ok: true }, { abbr: "QLD", cat: "Standard keeper licence", ok: true }, { abbr: "SA", cat: "Basic permit", ok: true }, { abbr: "WA", cat: "Standard licence", ok: true }, { abbr: "TAS", cat: "TAS natives only", ok: false }, { abbr: "ACT", cat: "Standard licence", ok: true }, { abbr: "NT", cat: "Check with authority", ok: true }]} />}
      </>}
    />
  );
};

// ─── Enclosure Guide page ─────────────────────────────────────────
const EnclosurePage = ({ onBack }) => {
  const [tab, setTab] = useState("types");
  const tabs = ["types", "sizing", "substrate", "setup"];
  const tabLabels = { types: "Enclosure types", sizing: "Sizing", substrate: "Substrate", setup: "Setup tips" };
  const sizes = [["Bearded Dragon", "Min: 120 × 60 × 60 cm", "150 × 60 × 60 cm"], ["Blue-tongue Skink", "Min: 120 × 60 × 45 cm", "150 × 60 × 60 cm"], ["Carpet Python (adult)", "Min: 180 × 60 × 60 cm", "210 × 60 × 90 cm"], ["Knob-tailed Gecko", "Min: 60 × 45 × 30 cm", "90 × 45 × 45 cm"], ["Woma Python (adult)", "Min: 150 × 60 × 60 cm", "180 × 60 × 60 cm"], ["Children's Python", "Min: 90 × 45 × 45 cm", "120 × 60 × 45 cm"], ["Olive Python (adult)", "Min: 240 × 90 × 90 cm", "300 × 90 × 90 cm"], ["Long-necked Turtle", "Min: 150 × 60 cm aquatic", "Pond setup"]];
  const TypeCard = ({ icon, name, detail, badge, bs }) => (
    <div style={{ background: C.cream, borderRadius: 14, border: "0.5px solid #e8e8e4", padding: "13px 14px", marginBottom: 8, display: "flex", gap: 12 }}>
      <div style={{ width: 40, height: 40, borderRadius: 10, background: C.greenPale, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>{icon}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 3 }}>{name}</div>
        <div style={{ fontSize: 12, color: "#777", lineHeight: 1.5, marginBottom: 5 }}>{detail}</div>
        <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 8, fontWeight: 700, ...bs }}>{badge}</span>
      </div>
    </div>
  );
  return (
    <div style={{ flex: 1, overflowY: "auto" }}>
      <div style={{ background: C.green, padding: "calc(env(safe-area-inset-top, 0px) + 10px) 20px 0" }}>
        <button onClick={onBack} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.7)", fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, marginBottom: 16, fontFamily: "inherit" }}>‹ Back to care guides</button>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 14 }}>
          <div style={{ fontSize: 64, lineHeight: 1, marginBottom: -4 }}>🏠</div>
          <div style={{ paddingBottom: 18 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.gold, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 4 }}>Care guide</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: "white", lineHeight: 1.2 }}>Enclosure setup & sizing</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", marginTop: 3 }}>For Australian reptile keepers</div>
          </div>
        </div>
        <div style={{ display: "flex", borderBottom: "2px solid rgba(255,255,255,0.1)", margin: "0 -20px", padding: "0 20px", gap: 4, overflowX: "auto", scrollbarWidth: "none" }}>
          {tabs.map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ background: "none", border: "none", borderBottom: tab === t ? `2px solid ${C.gold}` : "2px solid transparent", color: tab === t ? C.gold : "rgba(255,255,255,0.55)", fontSize: 12, fontWeight: 700, padding: "10px 12px", cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap", marginBottom: -2 }}>{tabLabels[t]}</button>
          ))}
        </div>
      </div>
      <div style={{ background: "white", padding: "16px 18px 24px", minHeight: 400 }}>
        {tab === "types" && <>
          <p style={{ fontSize: 13, color: "#666", lineHeight: 1.6, marginBottom: 14 }}>Three main enclosure styles are used in Australia. The right choice depends on your species, budget, and setup space.</p>
          <TypeCard icon="🪵" name="Timber with glass front" detail="Most popular for Australian species. Retains heat well, suits ground-dwellers and pythons. Easy to buy flat-pack locally." badge="Best for most species" bs={{ background: C.greenPale, color: C.green }} />
          <TypeCard icon="🪟" name="Glass terrarium" detail="Great visibility, easy to clean. Works well for smaller species and geckos. Can be harder to heat efficiently." badge="Good for geckos & small lizards" bs={{ background: C.goldLight, color: "#7a5a1e" }} />
          <TypeCard icon="🧱" name="PVC enclosure" detail="Lightweight, easy to clean, excellent for humidity-dependent species. Popular with python keepers. Higher upfront cost." badge="Good for pythons & tropical species" bs={{ background: C.goldLight, color: "#7a5a1e" }} />
          <TypeCard icon="🌿" name="Bioactive / naturalistic" detail="Live plants, deep substrate, cleanup crew. Stunning and low maintenance once established — requires more planning upfront." badge="Advanced keepers" bs={{ background: C.bluePale, color: C.blue }} />
          <WarnBox type="gold" title="Australian sourcing tip">Buy from Australian reptile specialty stores or local makers. Imported enclosures are often sized in imperial measurements.</WarnBox>
          <ShopBtn>🛒 Shop enclosures</ShopBtn>
        </>}
        {tab === "sizing" && <>
          <p style={{ fontSize: 13, color: "#666", lineHeight: 1.6, marginBottom: 14 }}>The enclosure should be at least as long as the animal's total body length — but bigger is always better.</p>
          <SectionLabel mt={0}>Minimum vs recommended sizes</SectionLabel>
          <div style={{ borderRadius: 14, border: "0.5px solid #e8e8e4", overflow: "hidden", marginBottom: 16 }}>
            <div style={{ background: C.green, padding: "8px 14px", display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.7)" }}>Species</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: C.gold }}>Recommended size</span>
            </div>
            {sizes.map(([species, min, rec], i) => (
              <div key={species} style={{ padding: "10px 14px", borderBottom: i < sizes.length - 1 ? "0.5px solid #f0f0ea" : "none", display: "flex", alignItems: "center", justifyContent: "space-between", background: i % 2 === 0 ? "white" : C.cream }}>
                <div><div style={{ fontSize: 13, fontWeight: 600 }}>{species}</div><div style={{ fontSize: 11, color: "#888", marginTop: 2 }}>{min}</div></div>
                <div style={{ fontSize: 11, padding: "3px 9px", borderRadius: 8, background: C.greenPale, color: C.green, fontWeight: 700, textAlign: "right", whiteSpace: "nowrap" }}>{rec}</div>
              </div>
            ))}
          </div>
          <WarnBox type="green" title="Ground vs arboreal species">Ground-dwellers like skinks and dragons need floor space. Arboreal species need height — at least 1.5× their body length in vertical space.</WarnBox>
          <ShopBtn secondary>Ask about your species ↗</ShopBtn>
        </>}
        {tab === "substrate" && <>
          <p style={{ fontSize: 13, color: "#666", lineHeight: 1.6, marginBottom: 14 }}>The right substrate affects hygiene, humidity, burrowing behaviour, and overall wellbeing.</p>
          {[["Coconut coir / coco fibre", "Best all-rounder", { background: C.greenPale, color: C.green }, "Holds humidity well, great for burrowers, easy to spot clean. Works for blue-tongues, pythons, and most lizards."], ["Topsoil / bioactive mix", "Naturalistic", { background: C.greenPale, color: C.green }, "Blend of topsoil, sand, and coir. Ideal for bioactive setups. Supports live plants and cleanup crews."], ["Reptile sand / clay mix", "Arid species only", { background: C.goldLight, color: "#7a5a1e" }, "Suits arid species like bearded dragons. Use reptile-specific sand — avoid fine play sand (impaction risk)."], ["Paper / newspaper", "Quarantine use", { background: C.goldLight, color: "#7a5a1e" }, "Cheapest and simplest. Zero impaction risk. Best in quarantine. Doesn't allow natural behaviour."], ["Cypress mulch", "Good for pythons", { background: C.goldLight, color: "#7a5a1e" }, "Holds humidity moderately well, looks natural. Works well for pythons. Replace fully every 3–6 months."]].map(([name, rating, bs, detail]) => (
            <div key={name} style={{ background: C.cream, borderRadius: 14, border: "0.5px solid #e8e8e4", padding: "12px 14px", marginBottom: 8 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{name}</div>
                <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 8, fontWeight: 700, ...bs }}>{rating}</span>
              </div>
              <div style={{ fontSize: 12, color: "#777", lineHeight: 1.5 }}>{detail}</div>
            </div>
          ))}
          <WarnBox type="red" title="Always avoid these">Cedar and pine shavings are toxic to reptiles. Cat litter, gravel, and calcium sand can all cause dangerous impaction.</WarnBox>
          <ShopBtn>🛒 Shop substrates</ShopBtn>
        </>}
        {tab === "setup" && <>
          <p style={{ fontSize: 13, color: "#666", lineHeight: 1.6, marginBottom: 14 }}>Getting the basics right from day one makes a huge difference.</p>
          {[["Create a thermal gradient", "One warm end, one cool end. Your reptile moves between them to self-regulate. Never heat the whole enclosure evenly."], ["Always use a thermostat", "Never run heat sources without a thermostat. It's a fire risk and can fatally overheat your animal."], ["Provide two hides minimum", "One at the warm end, one at the cool end. Hides should be snug — the animal should feel the walls around them."], ["UVB lighting on a timer", "T5 HO 10.0 for dragons and skinks, 5.0 for shade-dwellers. Run 10–12 hours per day. Replace every 12 months."], ["Ensure good ventilation", "Poor airflow causes respiratory infections and mould. Never seal mesh panels to retain heat."], ["Fresh water daily", "Use a heavy ceramic bowl large enough to soak in. Change water every day."]].map(([title, detail], i) => (
            <div key={i} style={{ background: C.cream, borderRadius: 14, border: "0.5px solid #e8e8e4", padding: "13px 14px", marginBottom: 8, display: "flex", gap: 10 }}>
              <div style={{ width: 24, height: 24, borderRadius: "50%", background: C.green, color: "white", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>{i + 1}</div>
              <div><div style={{ fontSize: 13, fontWeight: 600, marginBottom: 3 }}>{title}</div><div style={{ fontSize: 12, color: "#777", lineHeight: 1.6 }}>{detail}</div></div>
            </div>
          ))}
          <WarnBox type="green" title="New enclosure tip">Run the enclosure for 48–72 hours before introducing your reptile. Check temps at both ends and adjust before your animal moves in.</WarnBox>
          <ShopBtn>🛒 Shop heating & lighting</ShopBtn>
          <ShopBtn secondary>Explore more care guides ↗</ShopBtn>
        </>}
      </div>
    </div>
  );
};


// ─── Pygmy Python page ────────────────────────────────────────────
const PygmyPythonPage = ({ onBack }) => (
  <SpeciesPage onBack={onBack} name="Pygmy Python" latin="Antaresia perthensis" emoji="🐍"
    badges={[["Beginner friendly", C.greenPale, C.green], ["Australian native", C.bluePale, C.blue], ["Nocturnal", C.goldLight, "#7a5a1e"]]}
    tabs={["overview","feeding","health & shedding","handling & breeding","licencing"]}
    tabContent={(tab) => <>
      {tab === "overview" && <>
        <p style={{fontSize:13,color:"#666",lineHeight:1.6,marginBottom:14}}>Australia's smallest python and one of the world's smallest python species. Found in the Pilbara region of Western Australia. Despite their tiny size they make fascinating and rewarding pets — perfect for keepers with limited space.</p>
        <SectionLabel mt={0}>Quick stats</SectionLabel>
        <StatGrid stats={[["📏","Adult size","40–60 cm"],["⏳","Lifespan","15–20 yrs"],["🏠","Min. enclosure","60 × 45 cm"],["💧","Humidity","40–55%"]]} />
        <SectionLabel>Temperature requirements</SectionLabel>
        <TempBar label="Basking spot" value="32–34°C" width="75%" color="#e05a2b"/>
        <TempBar label="Warm side" value="27–30°C" width="60%" color="#e0922b"/>
        <TempBar label="Cool side" value="22–25°C" width="42%" color="#4a9e6b"/>
        <TempBar label="Overnight low" value="18–20°C" width="26%" color="#2b7ec0"/>
        <SectionLabel>Enclosure setup</SectionLabel>
        <div style={{background:C.cream,borderRadius:12,padding:"12px 14px",border:"0.5px solid #e8e8e4",fontSize:13,color:"#666",lineHeight:1.7}}>Small timber or PVC enclosure. Snug hides are essential — Pygmy Pythons feel most secure in very tight spaces. Newspaper or paper towel substrate. A small water bowl. Despite their small size they are active and curious at night.</div>
        <WarnBox type="gold" title="WA restricted species">Pygmy Pythons originate from WA. Check current availability in your state as interstate movement of some Antaresia species may require additional permits.</WarnBox>
        <ShopBtn>🛒 Shop Pygmy Python supplies</ShopBtn>
        <ShopBtn secondary>Ask a question ↗</ShopBtn>
      </>}
      {tab === "feeding" && <>
        <p style={{fontSize:13,color:"#666",lineHeight:1.6,marginBottom:12}}>Carnivorous. Due to their small size, Pygmy Pythons eat pinky mice for most of their lives. Always use tongs and pre-killed or frozen/thawed prey.</p>
        <div style={{background:C.cream,borderRadius:12,border:"0.5px solid #e8e8e4",padding:"0 14px"}}>
          <FoodItem icon="🐭" name="Pinky mice" detail="Main prey item — appropriately sized" freq="Every 5–7 days"/>
          <FoodItem icon="🐭" name="Fuzzy mice" detail="Large adults only" freq="Every 7–10 days"/>
        </div>
        <WarnBox type="gold" title="Size matters">Never feed prey wider than the widest part of the snake's body. For Pygmy Pythons this usually means pinky mice throughout their lives.</WarnBox>
        <WarnBox type="red" title="Feeding response">Despite their small size, Pygmy Pythons can have a strong feeding response. Always use tongs and hook-train.</WarnBox>
        <ShopBtn>🛒 Shop feeders</ShopBtn>
      </>}
      {tab === "health & shedding" && <>
        <SectionLabel mt={0}>Common health issues</SectionLabel>
        <HealthItem title="Respiratory infection" detail="Watch for wheezing or mucus. Keep temperatures appropriate and humidity not too high."/>
        <HealthItem title="Mites" detail="Check regularly — even small pythons can carry mites. Full enclosure treatment required."/>
        <HealthItem title="Regurgitation" detail="Common if prey is too large or handling occurs too soon after feeding. Fast for 2 weeks after regurgitation."/>
        <HealthItem dot="#4a9e6b" title="Signs of good health" detail="Active at night, alert, strong feeding response, regular shedding, clean vent."/>
        <SnakeShedding />
      </>}
      {tab === "handling & breeding" && <>
        <SnakeHandling biteRisk="low" notes="Pygmy Pythons are generally calm for their size. Hatchlings can be nippy — handle carefully given they are very small and delicate. Regular gentle handling builds confidence. Their small size means they can move quickly." />
        <SnakeBreeding clutchSize="2–5 eggs" incubationTemp="30–32°C" incubationDays="55–65 days" maturityAge="2–3 years" notes="One of the smallest clutch sizes of any python — typically just 2–5 eggs. Requires a winter cooling period. Eggs are relatively large compared to the female's body size. A rewarding breeding project given their rarity in captivity." />
      </>}
      {tab === "licencing" && <LegalTab note="Pygmy Pythons are a WA endemic species — confirm interstate availability before purchasing." states={[{ abbr: "NSW", cat: "Standard keeper licence", ok: true }, { abbr: "VIC", cat: "Basic wildlife licence", ok: true }, { abbr: "QLD", cat: "Standard keeper licence", ok: true }, { abbr: "SA", cat: "Basic permit", ok: true }, { abbr: "WA", cat: "Standard licence", ok: true }, { abbr: "TAS", cat: "TAS natives only", ok: false }, { abbr: "ACT", cat: "Standard licence", ok: true }, { abbr: "NT", cat: "Check with authority", ok: true }]} />}
    </>}
  />
);

// ─── Jungle Carpet Python page ───────────────────────────────────
const JungleCarpetPage = ({ onBack }) => (
  <SpeciesPage onBack={onBack} name="Jungle Carpet Python" latin="Morelia spilota cheynei" emoji="🐍"
    badges={[["Intermediate", C.goldLight, "#7a5a1e"], ["Australian native", C.bluePale, C.blue], ["Semi-arboreal", C.goldLight, "#7a5a1e"]]}
    tabs={["overview","feeding","health & shedding","handling & breeding","licencing"]}
    tabContent={(tab) => <>
      {tab === "overview" && <>
        <p style={{fontSize:13,color:"#666",lineHeight:1.6,marginBottom:14}}>The most visually striking of all carpet python subspecies — a vibrant yellow and black pattern that intensifies with age. Found in the rainforests of north Queensland. One of the most sought-after pythons in Australian collections. Requires higher humidity and temperatures than other carpet subspecies.</p>
        <SectionLabel mt={0}>Quick stats</SectionLabel>
        <StatGrid stats={[["📏","Adult size","1.5–2.5 m"],["⏳","Lifespan","20–30 yrs"],["🏠","Min. enclosure","180 × 60 cm"],["💧","Humidity","60–80%"]]} />
        <SectionLabel>Temperature requirements</SectionLabel>
        <TempBar label="Basking spot" value="34–37°C" width="84%" color="#e05a2b"/>
        <TempBar label="Warm side" value="28–32°C" width="66%" color="#e0922b"/>
        <TempBar label="Cool side" value="24–28°C" width="50%" color="#4a9e6b"/>
        <TempBar label="Overnight low" value="20–24°C" width="34%" color="#2b7ec0"/>
        <WarnBox type="blue" title="Higher humidity than other carpets">Jungle Carpets come from tropical rainforest. They require significantly higher humidity (60–80%) than inland carpet subspecies. Regular misting or a fogger is beneficial.</WarnBox>
        <SectionLabel>Enclosure setup</SectionLabel>
        <div style={{background:C.cream,borderRadius:12,padding:"12px 14px",border:"0.5px solid #e8e8e4",fontSize:13,color:"#666",lineHeight:1.7}}>Tall timber or PVC enclosure — Jungles are highly arboreal. Sturdy horizontal branches are essential. Cypress mulch or coir substrate. Excellent ventilation is critical despite the higher humidity. Large water bowl. The colouration improves dramatically in proper conditions.</div>
        <ShopBtn>🛒 Shop Jungle Carpet supplies</ShopBtn>
        <ShopBtn secondary>Ask a question ↗</ShopBtn>
      </>}
      {tab === "feeding" && <>
        <p style={{fontSize:13,color:"#666",lineHeight:1.6,marginBottom:12}}>Carnivorous. Generally good feeders once established. Feed pre-killed or frozen/thawed prey. Always use long tongs.</p>
        <div style={{background:C.cream,borderRadius:12,border:"0.5px solid #e8e8e4",padding:"0 14px"}}>
          <FoodItem icon="🐭" name="Fuzzy / hopper mice" detail="Hatchlings and small juveniles" freq="Every 5–7 days"/>
          <FoodItem icon="🐭" name="Adult mice" detail="Juveniles" freq="Every 7–10 days"/>
          <FoodItem icon="🐀" name="Small to medium rats" detail="Sub-adults and adults" freq="Every 10–14 days"/>
        </div>
        <WarnBox type="red" title="Defensive feeders">Jungle Carpets can be feistier feeders than other carpet subspecies. Always hook-train and use long tongs. Juveniles in particular can be defensive.</WarnBox>
        <WarnBox type="gold" title="Colour and feeding">Good nutrition and proper temperatures directly affect the quality of their yellow and black colouration. Well-fed, properly kept animals have dramatically better colour.</WarnBox>
        <ShopBtn>🛒 Shop feeders & supplements</ShopBtn>
      </>}
      {tab === "health & shedding" && <>
        <SectionLabel mt={0}>Common health issues</SectionLabel>
        <HealthItem title="Respiratory infection" detail="Despite needing high humidity, poor ventilation causes respiratory issues. Ensure airflow is excellent."/>
        <HealthItem title="Scale rot" detail="High humidity without good ventilation causes bacterial skin infections. Keep substrate dry on top even if humidity is high."/>
        <HealthItem title="Mites" detail="Very common with all carpet pythons. Check regularly, especially around heat source areas."/>
        <HealthItem title="Dull colouration" detail="Poor colour is often a husbandry issue — check temperatures, humidity, nutrition, and UVB levels."/>
        <HealthItem dot="#4a9e6b" title="Signs of good health" detail="Vivid yellow and black pattern, alert and arboreal behaviour, strong feeding response, regular shedding."/>
        <SnakeShedding />
      </>}
      {tab === "handling & breeding" && <>
        <SnakeHandling biteRisk="medium" notes="Jungle Carpets have a reputation as the feistiest carpet subspecies. Many individuals are defensive especially as juveniles, and some remain so throughout their lives. Consistent handling from an early age is essential. Always hook-train. Adults generally become much calmer with regular interaction." />
        <SnakeBreeding clutchSize="10–25 eggs" incubationTemp="30–32°C" incubationDays="55–65 days" maturityAge="3–4 years" notes="Requires a significant winter cooling period with reduced temperatures and lighting. Females are dedicated egg-guarders and will shiver to generate heat. Their stunning colouration makes them a popular and rewarding breeding project. High-colour individuals command premium prices." />
      </>}
      {tab === "licencing" && <LegalTab note="Jungle Carpet Pythons require an advanced keeper licence. Available from licensed breeders across Australia." states={[{ abbr: "NSW", cat: "Advanced licence", ok: true }, { abbr: "VIC", cat: "Advanced licence", ok: true }, { abbr: "QLD", cat: "Advanced licence", ok: true }, { abbr: "SA", cat: "Advanced permit", ok: true }, { abbr: "WA", cat: "Advanced licence", ok: true }, { abbr: "TAS", cat: "TAS natives only", ok: false }, { abbr: "ACT", cat: "Advanced licence", ok: true }, { abbr: "NT", cat: "Check with authority", ok: true }]} />}
    </>}
  />
);

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
      {tab === "licencing" && <LegalTab note="Water Pythons require an advanced keeper licence. Available from licensed breeders." states={[{ abbr: "NSW", cat: "Advanced licence", ok: true }, { abbr: "VIC", cat: "Advanced licence", ok: true }, { abbr: "QLD", cat: "Advanced licence", ok: true }, { abbr: "SA", cat: "Advanced permit", ok: true }, { abbr: "WA", cat: "Advanced licence", ok: true }, { abbr: "TAS", cat: "TAS natives only", ok: false }, { abbr: "ACT", cat: "Advanced licence", ok: true }, { abbr: "NT", cat: "Check with authority", ok: true }]} />}
    </>}
  />
);

// ─── Amethystine Python page ──────────────────────────────────────
const AmethystinePage = ({ onBack }) => (
  <SpeciesPage onBack={onBack} name="Amethystine Python" latin="Simalia amethistina" emoji="🐍"
    badges={[["Advanced", C.redPale, C.red], ["Australian native", C.bluePale, C.blue], ["Largest Australian python", C.redPale, C.red]]}
    tabs={["overview","feeding","health & shedding","handling & breeding","licencing"]}
    tabContent={(tab) => <>
      {tab === "overview" && <>
        <p style={{fontSize:13,color:"#666",lineHeight:1.6,marginBottom:14}}>Australia's largest python and one of the longest snakes in the world. Found in the tropical rainforests of far north Queensland. Their scales have a beautiful amethyst iridescence in sunlight. An impressive and long-lived species suited only to experienced keepers with significant space and resources.</p>
        <WarnBox type="red" title="Advanced species — significant commitment">Amethystine Pythons grow very large and live for 25+ years. Housing, feeding costs, and handling requirements are substantial. Two-person handling is essential for large adults. Not suitable for beginners or intermediate keepers.</WarnBox>
        <SectionLabel>Quick stats</SectionLabel>
        <StatGrid stats={[["📏","Adult size","3.0–5.0 m"],["⏳","Lifespan","25–30+ yrs"],["🏠","Min. enclosure","300 × 90 cm"],["💧","Humidity","60–80%"]]} />
        <SectionLabel>Temperature requirements</SectionLabel>
        <TempBar label="Basking spot" value="34–37°C" width="84%" color="#e05a2b"/>
        <TempBar label="Warm side" value="28–32°C" width="66%" color="#e0922b"/>
        <TempBar label="Cool side" value="24–28°C" width="50%" color="#4a9e6b"/>
        <TempBar label="Overnight low" value="22–24°C" width="36%" color="#2b7ec0"/>
        <SectionLabel>Enclosure setup</SectionLabel>
        <div style={{background:C.cream,borderRadius:12,padding:"12px 14px",border:"0.5px solid #e8e8e4",fontSize:13,color:"#666",lineHeight:1.7}}>An extremely large, custom-built enclosure is non-negotiable. Solid timber construction with reinforced security locks. Very large water feature — they love to soak. Sturdy climbing branches. High humidity with excellent ventilation. The enclosure must be escape-proof — a large escaped Amethystine Python is a serious situation.</div>
        <ShopBtn>🛒 Shop Amethystine Python supplies</ShopBtn>
        <ShopBtn secondary>Ask a question ↗</ShopBtn>
      </>}
      {tab === "feeding" && <>
        <p style={{fontSize:13,color:"#666",lineHeight:1.6,marginBottom:12}}>Carnivorous. Adults require very large prey items — the feeding cost of an Amethystine Python is significant. Always use extra-long tongs and never free-hand feed.</p>
        <div style={{background:C.cream,borderRadius:12,border:"0.5px solid #e8e8e4",padding:"0 14px"}}>
          <FoodItem icon="🐭" name="Mice / small rats" detail="Hatchlings and juveniles" freq="Every 7 days"/>
          <FoodItem icon="🐀" name="Large rats" detail="Sub-adults" freq="Every 10–14 days"/>
          <FoodItem icon="🐇" name="Rabbits / large rats" detail="Adults" freq="Every 14–21 days"/>
        </div>
        <WarnBox type="red" title="Feeding safety critical">Amethystine Pythons are powerful constrictors. Two-person presence during feeding interaction is strongly recommended for large adults. Have an emergency plan for a constriction incident.</WarnBox>
        <WarnBox type="gold" title="Feeding cost">Budget carefully — feeding a large adult Amethystine Python is a significant ongoing expense. Factor this into your decision before acquiring this species.</WarnBox>
        <ShopBtn>🛒 Shop feeders</ShopBtn>
      </>}
      {tab === "health & shedding" && <>
        <SectionLabel mt={0}>Common health issues</SectionLabel>
        <HealthItem title="Respiratory infection" detail="Their size makes treatment complex and expensive. Prevention through proper temperatures and ventilation is critical."/>
        <HealthItem title="Obesity" detail="Large pythons can become obese if overfed. Keep portions appropriate — an obese Amethystine Python is a serious health risk."/>
        <HealthItem title="Handling injuries" detail="Their size and strength means improper handling can injure both snake and keeper. Always handle with a second person for large adults."/>
        <HealthItem title="Enclosure security" detail="Check all locks and enclosure integrity regularly. A large escaped python requires immediate professional assistance."/>
        <HealthItem dot="#4a9e6b" title="Signs of good health" detail="Amethyst iridescence in sunlight, alert and responsive, firm muscle tone, regular feeding and shedding."/>
        <SnakeShedding />
      </>}
      {tab === "handling & breeding" && <>
        <SnakeHandling biteRisk="medium" notes="Amethystine Pythons vary in temperament but their size makes any defensive behaviour extremely significant. Always hook-train. Two-person handling is mandatory for adults over 2.5m. Their power means they can be difficult to control if startled. Never handle alone when the snake is large. Despite their size, well-socialised adults can be manageable." />
        <SnakeBreeding clutchSize="8–20 eggs" incubationTemp="30–32°C" incubationDays="65–75 days" maturityAge="4–6 years" notes="A breeding project only for very experienced keepers with appropriate space and facilities. Requires a winter cooling period. Females are dedicated egg-guarders. Hatchlings are large and should feed readily from the start. A prestigious and rewarding project given their status as Australia's largest python." />
      </>}
      {tab === "licencing" && <LegalTab note="Amethystine Pythons require an advanced keeper licence. A significant long-term commitment due to their size." states={[{ abbr: "NSW", cat: "Advanced licence", ok: true }, { abbr: "VIC", cat: "Advanced licence", ok: true }, { abbr: "QLD", cat: "Advanced licence", ok: true }, { abbr: "SA", cat: "Advanced permit", ok: true }, { abbr: "WA", cat: "Advanced licence", ok: true }, { abbr: "TAS", cat: "TAS natives only", ok: false }, { abbr: "ACT", cat: "Advanced licence", ok: true }, { abbr: "NT", cat: "Check with authority", ok: true }]} />}
    </>}
  />
);

// ─── Rough-scaled Python page ─────────────────────────────────────
const RoughScaledPythonPage = ({ onBack }) => (
  <SpeciesPage onBack={onBack} name="Rough-scaled Python" latin="Morelia carinata" emoji="🐍"
    badges={[["Advanced", C.redPale, C.red], ["Australian native", C.bluePale, C.blue], ["Extremely rare", C.redPale, C.red]]}
    tabs={["overview","feeding","health & shedding","handling & breeding","licencing"]}
    tabContent={(tab) => <>
      {tab === "overview" && <>
        <p style={{fontSize:13,color:"#666",lineHeight:1.6,marginBottom:14}}>One of Australia's rarest and most unique pythons. Found only in the remote rocky gorges of the Kimberley region in Western Australia. Distinguished by their strongly keeled (ridged) scales — unique among Australian pythons. Exceptionally rarely available in captivity and found in very few collections worldwide.</p>
        <WarnBox type="red" title="Extremely rare — specialist only">Rough-scaled Pythons are almost never available in Australian captivity. If you encounter one for sale, verify the legitimacy of the seller and all documentation carefully. This is a species for specialist collectors with advanced experience only.</WarnBox>
        <SectionLabel>Quick stats</SectionLabel>
        <StatGrid stats={[["📏","Adult size","1.2–2.0 m"],["⏳","Lifespan","20–25 yrs"],["🏠","Min. enclosure","150 × 60 cm"],["💧","Humidity","50–70%"]]} />
        <SectionLabel>Temperature requirements</SectionLabel>
        <TempBar label="Basking spot" value="33–36°C" width="82%" color="#e05a2b"/>
        <TempBar label="Warm side" value="28–30°C" width="62%" color="#e0922b"/>
        <TempBar label="Cool side" value="22–26°C" width="44%" color="#4a9e6b"/>
        <TempBar label="Overnight low" value="18–22°C" width="28%" color="#2b7ec0"/>
        <WarnBox type="gold" title="Limited husbandry data">Due to the extreme rarity of this species in captivity, published husbandry data is limited. The care requirements above are based on their natural habitat in rocky Kimberley gorges and comparison with related species. Experienced mentorship is strongly recommended.</WarnBox>
        <SectionLabel>Enclosure setup</SectionLabel>
        <div style={{background:C.cream,borderRadius:12,padding:"12px 14px",border:"0.5px solid #e8e8e4",fontSize:13,color:"#666",lineHeight:1.7}}>Rocky gorge-style setup. Cork bark and rock hides. Moderate humidity with good ventilation. Sturdy climbing opportunities — they are semi-arboreal in the wild. A water bowl large enough to soak in. The enclosure should reflect their natural rocky habitat as closely as possible.</div>
        <ShopBtn secondary>Ask a question ↗</ShopBtn>
      </>}
      {tab === "feeding" && <>
        <p style={{fontSize:13,color:"#666",lineHeight:1.6,marginBottom:12}}>Carnivorous. Expected to feed on small mammals and possibly lizards in the wild. In captivity, rodents are the standard prey item. Feeding data from captive specimens is very limited.</p>
        <div style={{background:C.cream,borderRadius:12,border:"0.5px solid #e8e8e4",padding:"0 14px"}}>
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
        <p style={{fontSize:13,color:"#666",lineHeight:1.6,marginBottom:12}}>Rough-scaled Pythons are found only in WA and may have been recorded in QLD. Licence requirements and availability vary significantly by state. Verify all documentation extremely carefully before any transaction involving this species.</p>
        <WarnBox type="red" title="Due diligence critical">Given the extreme rarity and value of this species, thoroughly verify the legitimacy of any seller, the legality of the animal, and all documentation. Consult your state wildlife authority before acquiring.</WarnBox>
        <LegalTab note="Rough-scaled Pythons are only available in QLD and WA." states={[{ abbr: "NSW", cat: "Not available", ok: false }, { abbr: "VIC", cat: "Not available", ok: false }, { abbr: "QLD", cat: "Advanced licence", ok: true }, { abbr: "SA", cat: "Not available", ok: false }, { abbr: "WA", cat: "Advanced licence", ok: true }, { abbr: "TAS", cat: "TAS natives only", ok: false }, { abbr: "ACT", cat: "Not available", ok: false }, { abbr: "NT", cat: "Not available", ok: false }]} />
      </>}
    </>}
  />
);


// ─── Eastern Bearded Dragon page ──────────────────────────────────
const EasternBeardedDragonPage = ({ onBack }) => (
  <SpeciesPage onBack={onBack} name="Eastern Bearded Dragon" latin="Pogona barbata" emoji="🦎"
    badges={[["Beginner friendly", C.greenPale, C.green], ["Australian native", C.bluePale, C.blue], ["Diurnal", C.goldLight, "#7a5a1e"]]}
    tabs={["overview","feeding","health & shedding","handling","licencing"]}
    tabContent={(tab) => <>
      {tab === "overview" && <>
        <p style={{fontSize:13,color:"#666",lineHeight:1.6,marginBottom:14}}>The Eastern Bearded Dragon is the larger, darker cousin of the Central Bearded Dragon. Found along the eastern coast of Australia in woodland and scrubland. Slightly more defensive than the Central Beardie but still an excellent pet with proper socialisation. Their dark beard display is more dramatic than other species.</p>
        <SectionLabel mt={0}>Quick stats</SectionLabel>
        <StatGrid stats={[["📏","Adult size","50–60 cm"],["⏳","Lifespan","10–15 yrs"],["🏠","Min. enclosure","120 × 60 cm"],["💧","Humidity","30–40%"]]} />
        <SectionLabel>Temperature requirements</SectionLabel>
        <TempBar label="Basking spot" value="40–45°C" width="92%" color="#e05a2b"/>
        <TempBar label="Warm side" value="28–32°C" width="66%" color="#e0922b"/>
        <TempBar label="Cool side" value="22–26°C" width="44%" color="#4a9e6b"/>
        <TempBar label="Overnight low" value="18–22°C" width="28%" color="#2b7ec0"/>
        <WarnBox type="blue" title="UVB lighting essential">Eastern Bearded Dragons require high UVB output. Use a T5 HO 10.0 or 12% UVB tube. Replace every 6–12 months even if still producing visible light — UVB output degrades before the bulb stops glowing.</WarnBox>
        <SectionLabel>Enclosure setup</SectionLabel>
        <div style={{background:C.cream,borderRadius:12,padding:"12px 14px",border:"0.5px solid #e8e8e4",fontSize:13,color:"#666",lineHeight:1.7}}>120×60cm minimum for an adult. Larger is always better. Timber or PVC enclosure. Reptile carpet, tiles, or bioactive substrate. A sturdy basking branch or rock directly under the heat lamp. Hide at the cool end. Fresh vegetables daily in a bowl. UVB tube running the length of the enclosure.</div>
        <ShopBtn>🛒 Shop Bearded Dragon supplies</ShopBtn>
        <ShopBtn secondary>Ask a question ↗</ShopBtn>
      </>}
      {tab === "feeding" && <>
        <p style={{fontSize:13,color:"#666",lineHeight:1.6,marginBottom:12}}>Omnivores. Diet varies significantly with age — juveniles need more protein, adults need more vegetables. A varied diet is key to good health.</p>
        <div style={{background:C.cream,borderRadius:12,border:"0.5px solid #e8e8e4",padding:"0 14px"}}>
          <FoodItem icon="🦗" name="Crickets / roaches" detail="Protein staple — gut load well" freq="Daily (juveniles), 3x week (adults)"/>
          <FoodItem icon="🥬" name="Leafy greens" detail="Collard greens, kale, endive, rocket" freq="Daily"/>
          <FoodItem icon="🫑" name="Vegetables" detail="Capsicum, squash, sweet potato (cooked)" freq="Daily"/>
          <FoodItem icon="🍓" name="Fruit" detail="Small amounts as treats only" freq="Occasionally"/>
        </div>
        <WarnBox type="red" title="Avoid spinach, lettuce, avocado">Spinach and beet greens bind calcium. Iceberg lettuce has no nutritional value. Avocado is toxic to bearded dragons.</WarnBox>
        <WarnBox type="gold" title="Calcium & UVB work together">Calcium supplementation AND proper UVB are both required to prevent MBD. Neither alone is sufficient.</WarnBox>
        <ShopBtn>🛒 Shop feeders & supplements</ShopBtn>
      </>}
      {tab === "health & shedding" && <>
        <SectionLabel mt={0}>Common health issues</SectionLabel>
        <HealthItem title="MBD (Metabolic Bone Disease)" detail="Very common without proper UVB and calcium. Soft bones, tremors, swollen limbs. Preventable with correct setup."/>
        <HealthItem title="Adenovirus (ADV)" detail="Also called Stargazing disease. Neurological symptoms — head tilting, spinning. No cure. Quarantine new animals strictly."/>
        <HealthItem title="Parasites" detail="Internal parasites are common. Annual faecal tests recommended. Signs include weight loss and loose stools."/>
        <HealthItem title="Brumation" detail="Eastern Bearded Dragons brumate more reliably than Centrals. Reduced appetite and activity in winter is normal."/>
        <HealthItem dot="#4a9e6b" title="Signs of good health" detail="Bright eyes, firm body condition, alert basking behaviour, regular feeding, beard display when stimulated."/>
        <SnakeShedding animal="lizard" />
      </>}
      {tab === "handling" && <>
        <div style={{background:C.greenPale,borderRadius:12,padding:"12px 14px",marginBottom:12,border:`0.5px solid ${C.green}22`}}>
          <div style={{fontSize:12,fontWeight:700,color:C.green,marginBottom:6}}>BITE RISK — LOW TO MEDIUM</div>
          <div style={{fontSize:13,color:"#555",lineHeight:1.6}}>Eastern Bearded Dragons can be slightly more defensive than Central Beardies, particularly unsocialised adults. Their beard blackening and gaping is a warning display. With regular handling from a young age they become very tame and personable.</div>
        </div>
        <div style={{background:C.cream,borderRadius:12,padding:"12px 14px",border:"0.5px solid #e8e8e4",fontSize:13,color:"#666",lineHeight:1.7}}>Support the full body when handling. Allow 2 weeks to settle before regular handling. Short sessions initially, building to longer periods. They enjoy supervised free-roaming time and will often seek warmth from their keeper's hands and body.</div>
      </>}
      {tab === "licencing" && <LegalTab note="Eastern Bearded Dragons are a popular beginner species available from licensed breeders across Australia." states={[{ abbr: "NSW", cat: "Standard keeper licence", ok: true }, { abbr: "VIC", cat: "Basic wildlife licence", ok: true }, { abbr: "QLD", cat: "Standard keeper licence", ok: true }, { abbr: "SA", cat: "Basic permit", ok: true }, { abbr: "WA", cat: "Standard licence", ok: true }, { abbr: "TAS", cat: "TAS natives only", ok: false }, { abbr: "ACT", cat: "Standard licence", ok: true }, { abbr: "NT", cat: "Check with authority", ok: true }]} />}
    </>}
  />
);

// ─── Rankins Dragon page ──────────────────────────────────────────
const RankinsDragonPage = ({ onBack }) => (
  <SpeciesPage onBack={onBack} name="Pygmy Bearded Dragon" latin="Pogona henrylawsoni" emoji="🦎"
    badges={[["Beginner friendly", C.greenPale, C.green], ["Australian native", C.bluePale, C.blue], ["Compact size", C.goldLight, "#7a5a1e"]]}
    tabs={["overview","feeding","health & shedding","handling","licencing"]}
    tabContent={(tab) => <>
      {tab === "overview" && <>
        <p style={{fontSize:13,color:"#666",lineHeight:1.6,marginBottom:14}}>A smaller, more compact alternative to the Central Bearded Dragon. Found in Queensland's black-soil plains. Also known as Rankins Dragon, Lawson's Dragon, and the Black-soil Beardie. They share the friendly temperament of their bearded dragon cousins but require less space — perfect for keepers with limited room.</p>
        <SectionLabel mt={0}>Quick stats</SectionLabel>
        <StatGrid stats={[["📏","Adult size","25–30 cm"],["⏳","Lifespan","8–12 yrs"],["🏠","Min. enclosure","90 × 45 cm"],["💧","Humidity","30–40%"]]} />
        <SectionLabel>Temperature requirements</SectionLabel>
        <TempBar label="Basking spot" value="38–42°C" width="88%" color="#e05a2b"/>
        <TempBar label="Warm side" value="28–32°C" width="66%" color="#e0922b"/>
        <TempBar label="Cool side" value="22–26°C" width="44%" color="#4a9e6b"/>
        <TempBar label="Overnight low" value="18–22°C" width="28%" color="#2b7ec0"/>
        <WarnBox type="blue" title="UVB lighting essential">Like all bearded dragons, Rankins require high-output UVB. T5 HO 10.0 or 12% tube. They are more heat-tolerant than Central Beardies but still need proper UVB.</WarnBox>
        <SectionLabel>Enclosure setup</SectionLabel>
        <div style={{background:C.cream,borderRadius:12,padding:"12px 14px",border:"0.5px solid #e8e8e4",fontSize:13,color:"#666",lineHeight:1.7}}>A 90×45cm enclosure suits one adult comfortably. Rankins Dragons can be kept in pairs or small groups more successfully than Central Beardies — but monitor carefully for competition at feeding time. Same setup as Central Bearded Dragon — basking rock or branch, cool hide, fresh vegetables daily.</div>
        <WarnBox type="gold" title="Can be housed in pairs">Unlike most reptiles, Rankins Dragons tolerate cohabitation reasonably well. Always provide multiple basking spots and feeding stations. Separate if aggression is observed.</WarnBox>
        <ShopBtn>🛒 Shop Rankins Dragon supplies</ShopBtn>
        <ShopBtn secondary>Ask a question ↗</ShopBtn>
      </>}
      {tab === "feeding" && <>
        <p style={{fontSize:13,color:"#666",lineHeight:1.6,marginBottom:12}}>Omnivores with the same dietary requirements as Central Bearded Dragons. Diet varies with age.</p>
        <div style={{background:C.cream,borderRadius:12,border:"0.5px solid #e8e8e4",padding:"0 14px"}}>
          <FoodItem icon="🦗" name="Crickets / roaches" detail="Protein staple — appropriately sized" freq="Daily (juveniles), 3x week (adults)"/>
          <FoodItem icon="🥬" name="Leafy greens" detail="Collard greens, kale, endive, rocket" freq="Daily"/>
          <FoodItem icon="🫑" name="Vegetables" detail="Capsicum, squash, beans" freq="Daily"/>
        </div>
        <WarnBox type="gold" title="Smaller prey for smaller dragon">Rankins Dragons are smaller than Bearded Dragons — ensure all prey items are appropriately sized. Maximum prey size should be no wider than the space between the dragon's eyes.</WarnBox>
        <ShopBtn>🛒 Shop feeders & supplements</ShopBtn>
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
        <div style={{background:C.greenPale,borderRadius:12,padding:"12px 14px",marginBottom:12,border:`0.5px solid ${C.green}22`}}>
          <div style={{fontSize:12,fontWeight:700,color:C.green,marginBottom:6}}>BITE RISK — VERY LOW</div>
          <div style={{fontSize:13,color:"#555",lineHeight:1.6}}>Rankins Dragons are exceptionally calm and handleable — arguably even more docile than Central Bearded Dragons. Their small size makes them easy to manage and a great choice for children. They rarely show defensive behaviour.</div>
        </div>
        <div style={{background:C.cream,borderRadius:12,padding:"12px 14px",border:"0.5px solid #e8e8e4",fontSize:13,color:"#666",lineHeight:1.7}}>Same handling approach as Bearded Dragons. Support the full body, start with short sessions, build gradually. Their small size means they move quickly — handle over a soft surface initially.</div>
      </>}
      {tab === "licencing" && <LegalTab note="Rankins Dragons are a beginner-friendly species available from licensed breeders across Australia." states={[{ abbr: "NSW", cat: "Standard keeper licence", ok: true }, { abbr: "VIC", cat: "Basic wildlife licence", ok: true }, { abbr: "QLD", cat: "Standard keeper licence", ok: true }, { abbr: "SA", cat: "Basic permit", ok: true }, { abbr: "WA", cat: "Standard licence", ok: true }, { abbr: "TAS", cat: "TAS natives only", ok: false }, { abbr: "ACT", cat: "Standard licence", ok: true }, { abbr: "NT", cat: "Check with authority", ok: true }]} />}
    </>}
  />
);

// ─── Frilled-neck Lizard page ──────────────────────────────────────────
const FrilledLizardPage = ({ onBack }) => (
  <SpeciesPage onBack={onBack} name="Frilled-neck Lizard" latin="Chlamydosaurus kingii" emoji="🦎"
    badges={[["Intermediate", C.goldLight, "#7a5a1e"], ["Australian native", C.bluePale, C.blue], ["Arboreal", C.greenPale, C.green]]}
    tabs={["overview","feeding","health & shedding","handling","licencing"]}
    tabContent={(tab) => <>
      {tab === "overview" && <>
        <p style={{fontSize:13,color:"#666",lineHeight:1.6,marginBottom:14}}>One of Australia's most iconic reptiles — the dramatic frill display and bipedal running are instantly recognisable worldwide. Found across northern Australia and southern New Guinea in tropical and dry woodland. An impressive display animal that becomes surprisingly personable with regular handling.</p>
        <SectionLabel mt={0}>Quick stats</SectionLabel>
        <StatGrid stats={[["📏","Adult size","60–90 cm"],["⏳","Lifespan","10–15 yrs"],["🏠","Min. enclosure","120 × 60 × 120 cm"],["💧","Humidity","50–70%"]]} />
        <WarnBox type="red" title="Tall enclosure essential">Frilled Lizards are highly arboreal — they spend most of their time off the ground. A minimum height of 120cm is required. Width and length are secondary to height.</WarnBox>
        <SectionLabel>Temperature requirements</SectionLabel>
        <TempBar label="Basking spot" value="38–42°C" width="88%" color="#e05a2b"/>
        <TempBar label="Warm side" value="28–32°C" width="66%" color="#e0922b"/>
        <TempBar label="Cool side" value="24–28°C" width="50%" color="#4a9e6b"/>
        <TempBar label="Overnight low" value="20–24°C" width="34%" color="#2b7ec0"/>
        <SectionLabel>Enclosure setup</SectionLabel>
        <div style={{background:C.cream,borderRadius:12,padding:"12px 14px",border:"0.5px solid #e8e8e4",fontSize:13,color:"#666",lineHeight:1.7}}>A very tall custom enclosure is essential. Multiple vertical branches and perches at varying heights. Misting system or regular hand misting for humidity. UVB tube running vertically or at height. Cork bark at the top of the enclosure for hiding. Coconut coir or bioactive substrate.</div>
        <ShopBtn>🛒 Shop Frilled Lizard supplies</ShopBtn>
        <ShopBtn secondary>Ask a question ↗</ShopBtn>
      </>}
      {tab === "feeding" && <>
        <p style={{fontSize:13,color:"#666",lineHeight:1.6,marginBottom:12}}>Primarily insectivorous with some small vertebrate prey. In captivity, insects form the bulk of the diet supplemented with occasional pinky mice for adults.</p>
        <div style={{background:C.cream,borderRadius:12,border:"0.5px solid #e8e8e4",padding:"0 14px"}}>
          <FoodItem icon="🦗" name="Crickets" detail="Staple feeder — large size for adults" freq="Every 2 days"/>
          <FoodItem icon="🪲" name="Wood roaches (Woodies)" detail="Excellent nutrition" freq="Every 2 days"/>
          <FoodItem icon="🐛" name="Silkworms / hornworms" detail="High moisture, good supplement" freq="Weekly"/>
          <FoodItem icon="🐭" name="Pinky mice" detail="Adults only — occasional protein boost" freq="Monthly"/>
        </div>
        <WarnBox type="gold" title="Feed at height">Frilled Lizards feel most secure feeding off the ground. Place food in a bowl partway up the enclosure or use feeding tongs at height.</WarnBox>
        <ShopBtn>🛒 Shop feeders & supplements</ShopBtn>
      </>}
      {tab === "health & shedding" && <>
        <SectionLabel mt={0}>Common health issues</SectionLabel>
        <HealthItem title="Respiratory infection" detail="Often caused by insufficient temperature or humidity inconsistency. Watch for gaping, wheezing, or mucus."/>
        <HealthItem title="MBD" detail="Proper UVB at height is critical — they bask high up in trees naturally and receive intense UV radiation. Ensure UVB reaches their main basking position."/>
        <HealthItem title="Stress" detail="Frilled Lizards can be shy when new. Avoid excessive disturbance. A stressed frill display at every interaction means the animal needs more settling time."/>
        <HealthItem dot="#4a9e6b" title="Signs of good health" detail="Active climbing, alert frill display when stimulated, feeding well, full frill with no tears or damage."/>
        <SnakeShedding animal="lizard" />
      </>}
      {tab === "handling" && <>
        <div style={{background:C.goldLight,borderRadius:12,padding:"12px 14px",marginBottom:12,border:`0.5px solid #c8963c44`}}>
          <div style={{fontSize:12,fontWeight:700,color:"#7a5a1e",marginBottom:6}}>BITE RISK — MEDIUM</div>
          <div style={{fontSize:13,color:"#555",lineHeight:1.6}}>Frilled Lizards can be defensive, especially when new. The frill display and gaping mouth are warnings — respect them. With consistent gentle handling they become significantly calmer. Their claws are sharp — wear long sleeves when handling nervous individuals.</div>
        </div>
        <div style={{background:C.cream,borderRadius:12,padding:"12px 14px",border:"0.5px solid #e8e8e4",fontSize:13,color:"#666",lineHeight:1.7}}>Allow 3–4 weeks to settle before regular handling. Approach slowly and from the side, not from above. Let them walk onto your hand rather than grabbing them. Their frill display is spectacular to see but means they are stressed — end the session if they display persistently.</div>
      </>}
      {tab === "licencing" && <LegalTab note="Frilled-neck Lizards require an advanced keeper licence in most states. Always verify current availability before purchasing." states={[{ abbr: "NSW", cat: "Advanced licence", ok: true }, { abbr: "VIC", cat: "Advanced licence", ok: true }, { abbr: "QLD", cat: "Standard keeper licence", ok: true }, { abbr: "SA", cat: "Check with authority", ok: true }, { abbr: "WA", cat: "Advanced licence", ok: true }, { abbr: "TAS", cat: "TAS natives only", ok: false }, { abbr: "ACT", cat: "Check with authority", ok: true }, { abbr: "NT", cat: "Check with authority", ok: true }]} />}
    </>}
  />
);

// ─── Eastern Water Dragon page ────────────────────────────────────
const WaterDragonPage = ({ onBack }) => (
  <SpeciesPage onBack={onBack} name="Eastern Water Dragon" latin="Intellagama lesueurii" emoji="🦎"
    badges={[["Intermediate", C.goldLight, "#7a5a1e"], ["Australian native", C.bluePale, C.blue], ["Semi-aquatic", C.greenPale, C.green]]}
    tabs={["overview","feeding","health & shedding","handling","licencing"]}
    tabContent={(tab) => <>
      {tab === "overview" && <>
        <p style={{fontSize:13,color:"#666",lineHeight:1.6,marginBottom:14}}>A large, impressive lizard found along waterways of eastern Australia. Males develop striking red and green colouration on the chest and are visually stunning. They are semi-aquatic — excellent swimmers that can remain submerged for extended periods. An active and engaging species that requires a large, well-designed enclosure.</p>
        <SectionLabel mt={0}>Quick stats</SectionLabel>
        <StatGrid stats={[["📏","Adult size","80–100 cm"],["⏳","Lifespan","15–20 yrs"],["🏠","Min. enclosure","180 × 90 cm"],["💧","Humidity","60–80%"]]} />
        <WarnBox type="red" title="Large water feature essential">Eastern Water Dragons require a significant water feature — large enough to fully submerge in. A built-in pond section or large tub is non-negotiable. They will not thrive without regular access to water.</WarnBox>
        <SectionLabel>Temperature requirements</SectionLabel>
        <TempBar label="Basking spot" value="35–40°C" width="84%" color="#e05a2b"/>
        <TempBar label="Warm side" value="26–30°C" width="58%" color="#e0922b"/>
        <TempBar label="Cool side" value="22–26°C" width="44%" color="#4a9e6b"/>
        <TempBar label="Overnight low" value="18–22°C" width="28%" color="#2b7ec0"/>
        <SectionLabel>Enclosure setup</SectionLabel>
        <div style={{background:C.cream,borderRadius:12,padding:"12px 14px",border:"0.5px solid #e8e8e4",fontSize:13,color:"#666",lineHeight:1.7}}>A very large custom enclosure — minimum 180×90cm footprint with height of at least 90cm. Built-in water section with filtration. Branches for climbing at varying heights. UVB tube at the top. Coconut coir or bioactive substrate in the land section. Cork bark hides. Good filtration in the water section is critical.</div>
        <ShopBtn>🛒 Shop Water Dragon supplies</ShopBtn>
        <ShopBtn secondary>Ask a question ↗</ShopBtn>
      </>}
      {tab === "feeding" && <>
        <p style={{fontSize:13,color:"#666",lineHeight:1.6,marginBottom:12}}>Omnivores. A varied diet of insects, small vertebrates, and some plant matter. Adults can be fed less frequently than juveniles.</p>
        <div style={{background:C.cream,borderRadius:12,border:"0.5px solid #e8e8e4",padding:"0 14px"}}>
          <FoodItem icon="🦗" name="Crickets / roaches" detail="Protein staple" freq="Every 2 days (juv), 3x week (adult)"/>
          <FoodItem icon="🐭" name="Pinky mice" detail="Adults — occasional protein boost" freq="Monthly"/>
          <FoodItem icon="🥬" name="Leafy greens" detail="Supplement to insect diet" freq="Weekly"/>
          <FoodItem icon="🐟" name="Small fish / shrimp" detail="Can be fed in their water section" freq="Occasionally"/>
        </div>
        <WarnBox type="gold" title="They may feed in water">Water Dragons sometimes prefer to eat in or near water. Offering some prey items near the water section can improve feeding response.</WarnBox>
        <ShopBtn>🛒 Shop feeders & supplements</ShopBtn>
      </>}
      {tab === "health & shedding" && <>
        <SectionLabel mt={0}>Common health issues</SectionLabel>
        <HealthItem title="Snout rubbing" detail="Very common in newly acquired Water Dragons. They run into glass repeatedly causing snout injuries. Cover lower portions of glass with a visual barrier until settled."/>
        <HealthItem title="Water quality issues" detail="Poor water filtration leads to bacterial infections and skin problems. Invest in quality filtration and change water regularly."/>
        <HealthItem title="MBD" detail="Proper UVB is essential. Ensure the UVB tube reaches all areas the dragon uses regularly."/>
        <HealthItem title="Stress" detail="Water Dragons can be flighty and nervous. A well-planted, naturalistic enclosure significantly reduces stress."/>
        <HealthItem dot="#4a9e6b" title="Signs of good health" detail="Bright colouration (especially males), active climbing and swimming, feeding well, alert and responsive."/>
        <SnakeShedding animal="lizard" />
      </>}
      {tab === "handling" && <>
        <div style={{background:C.goldLight,borderRadius:12,padding:"12px 14px",marginBottom:12,border:`0.5px solid #c8963c44`}}>
          <div style={{fontSize:12,fontWeight:700,color:"#7a5a1e",marginBottom:6}}>BITE RISK — MEDIUM</div>
          <div style={{fontSize:13,color:"#555",lineHeight:1.6}}>Eastern Water Dragons are alert and fast-moving. Juveniles can be quite flighty. Adults tame down significantly with regular gentle handling. Their tail is powerful and can whip if they feel threatened. Sharp claws.</div>
        </div>
        <div style={{background:C.cream,borderRadius:12,padding:"12px 14px",border:"0.5px solid #e8e8e4",fontSize:13,color:"#666",lineHeight:1.7}}>Allow 3–4 weeks to settle. Approach slowly, support the full body. Once settled they can become very tame and will often voluntarily approach their keeper. Well-handled adults are impressive and engaging animals to interact with.</div>
      </>}
      {tab === "licencing" && <LegalTab note="Eastern Water Dragons are a commonly kept species available from licensed breeders across Australia." states={[{ abbr: "NSW", cat: "Standard keeper licence", ok: true }, { abbr: "VIC", cat: "Basic wildlife licence", ok: true }, { abbr: "QLD", cat: "Standard keeper licence", ok: true }, { abbr: "SA", cat: "Basic permit", ok: true }, { abbr: "WA", cat: "Standard licence", ok: true }, { abbr: "TAS", cat: "TAS natives only", ok: false }, { abbr: "ACT", cat: "Standard licence", ok: true }, { abbr: "NT", cat: "Check with authority", ok: true }]} />}
    </>}
  />
);

// ─── Knob-tailed Gecko page ───────────────────────────────────────
const KnobTailedGeckoPage = ({ onBack }) => (
  <SpeciesPage onBack={onBack} name="Knob-tailed Gecko" latin="Nephrurus spp." emoji="🦎"
    badges={[["Intermediate", C.goldLight, "#7a5a1e"], ["Australian native", C.bluePale, C.blue], ["Nocturnal", C.greenPale, C.green]]}
    tabs={["overview","feeding","health & shedding","handling","licencing"]}
    tabContent={(tab) => <>
      {tab === "overview" && <>
        <p style={{fontSize:13,color:"#666",lineHeight:1.6,marginBottom:14}}>A fascinating group of uniquely Australian geckos — instantly recognisable by their distinctive bulbous knob at the end of a short, stubby tail. Multiple species are kept in captivity including the Smooth Knob-tail (N. levis), Rough Knob-tail (N. amyae), and Common Knob-tail (N. milii). Arid-adapted, nocturnal, and full of personality.</p>
        <SectionLabel mt={0}>Quick stats</SectionLabel>
        <StatGrid stats={[["📏","Adult size","10–20 cm"],["⏳","Lifespan","12–20 yrs"],["🏠","Min. enclosure","60 × 45 cm"],["💧","Humidity","20–35%"]]} />
        <SectionLabel>Temperature requirements</SectionLabel>
        <TempBar label="Warm side" value="28–32°C" width="66%" color="#e05a2b"/>
        <TempBar label="Cool side" value="20–24°C" width="36%" color="#4a9e6b"/>
        <TempBar label="Overnight low" value="16–20°C" width="24%" color="#2b7ec0"/>
        <WarnBox type="gold" title="Cooler temps than most reptiles">Knob-tailed Geckos are from arid Australia and prefer cooler temperatures than many tropical species. Overheating is a significant risk — never exceed 35°C anywhere in the enclosure.</WarnBox>
        <SectionLabel>Enclosure setup</SectionLabel>
        <div style={{background:C.cream,borderRadius:12,padding:"12px 14px",border:"0.5px solid #e8e8e4",fontSize:13,color:"#666",lineHeight:1.7}}>A 60×45cm enclosure suits one adult. Low, wide enclosure preferred — they are ground-dwelling and do not climb. Sandy or red clay-based substrate to mimic their natural habitat. Multiple cork bark hides. A small shallow water bowl. Under-tank heat mat on one side controlled by thermostat. Low humidity is critical — good ventilation essential.</div>
        <ShopBtn>🛒 Shop Knob-tailed Gecko supplies</ShopBtn>
        <ShopBtn secondary>Ask a question ↗</ShopBtn>
      </>}
      {tab === "feeding" && <>
        <p style={{fontSize:13,color:"#666",lineHeight:1.6,marginBottom:12}}>Insectivores. Feed a variety of live insects at night when they are naturally active. Always gut-load and dust prey with supplements.</p>
        <div style={{background:C.cream,borderRadius:12,border:"0.5px solid #e8e8e4",padding:"0 14px"}}>
          <FoodItem icon="🦗" name="Crickets" detail="Staple feeder — appropriate size" freq="Every 2–3 nights"/>
          <FoodItem icon="🪲" name="Mealworms" detail="Good treat — moderate fat content" freq="Weekly"/>
          <FoodItem icon="🦟" name="Wood roaches (Woodies)" detail="Excellent nutrition" freq="Every 2–3 nights"/>
          <FoodItem icon="🐛" name="Waxworms" detail="High-fat treat only" freq="Occasionally"/>
        </div>
        <WarnBox type="gold" title="Feed at night">Knob-tailed Geckos are nocturnal — feed after lights out. Offering food during the day causes stress and prey items may go uneaten.</WarnBox>
        <ShopBtn>🛒 Shop feeders & supplements</ShopBtn>
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
        <div style={{background:C.goldLight,borderRadius:12,padding:"12px 14px",marginBottom:12,border:`0.5px solid #c8963c44`}}>
          <div style={{fontSize:12,fontWeight:700,color:"#7a5a1e",marginBottom:6}}>BITE RISK — LOW TO MEDIUM</div>
          <div style={{fontSize:13,color:"#555",lineHeight:1.6}}>Knob-tailed Geckos vary in temperament by species. Some individuals are calm, others defensive. They are fast-moving and can vocalise loudly when stressed. Handle at night when they are naturally active. Never handle during the day — this causes significant stress.</div>
        </div>
        <div style={{background:C.cream,borderRadius:12,padding:"12px 14px",border:"0.5px solid #e8e8e4",fontSize:13,color:"#666",lineHeight:1.7}}>Short handling sessions only — these are primarily display animals. Never grab the tail. Support the full body. Handle after they have warmed up for the evening. Frequent, brief, calm interactions build confidence over time.</div>
        <WarnBox type="red" title="Never grab the tail">Like many geckos, Knob-tails can drop their tail under stress. The tail regrows but the knob does not reform properly — it is a permanent loss of their most distinctive feature.</WarnBox>
      </>}
      {tab === "licencing" && <LegalTab note="Knob-tailed Geckos are available from licensed breeders across most of Australia." states={[{ abbr: "NSW", cat: "Standard keeper licence", ok: true }, { abbr: "VIC", cat: "Basic wildlife licence", ok: true }, { abbr: "QLD", cat: "Standard keeper licence", ok: true }, { abbr: "SA", cat: "Basic permit", ok: true }, { abbr: "WA", cat: "Standard licence", ok: true }, { abbr: "TAS", cat: "TAS natives only", ok: false }, { abbr: "ACT", cat: "Standard licence", ok: true }, { abbr: "NT", cat: "Check with authority", ok: true }]} />}
    </>}
  />
);

// ─── Thick-tailed Gecko page ──────────────────────────────────────
const ThickTailedGeckoPage = ({ onBack }) => (
  <SpeciesPage onBack={onBack} name="Thick-tailed Gecko" latin="Underwoodisaurus milii" emoji="🦎"
    badges={[["Beginner friendly", C.greenPale, C.green], ["Australian native", C.bluePale, C.blue], ["Nocturnal", C.goldLight, "#7a5a1e"]]}
    tabs={["overview","feeding","health & shedding","handling","licencing"]}
    tabContent={(tab) => <>
      {tab === "overview" && <>
        <p style={{fontSize:13,color:"#666",lineHeight:1.6,marginBottom:14}}>Also known as the Barking Gecko — named for the loud barking vocalisations they produce when threatened. A robust, hardy gecko found across much of southern Australia. Their striking yellow and black banded pattern and manageable temperament make them an excellent beginner gecko. More forgiving of handling than Knob-tailed Geckos.</p>
        <SectionLabel mt={0}>Quick stats</SectionLabel>
        <StatGrid stats={[["📏","Adult size","14–20 cm"],["⏳","Lifespan","15–20 yrs"],["🏠","Min. enclosure","60 × 45 cm"],["💧","Humidity","30–45%"]]} />
        <SectionLabel>Temperature requirements</SectionLabel>
        <TempBar label="Warm side" value="28–32°C" width="66%" color="#e05a2b"/>
        <TempBar label="Cool side" value="20–24°C" width="36%" color="#4a9e6b"/>
        <TempBar label="Overnight low" value="15–18°C" width="20%" color="#2b7ec0"/>
        <WarnBox type="blue" title="Cool overnight temps important">Thick-tailed Geckos naturally experience significant temperature drops at night. This thermal cycling is important for their health and natural behaviour. Do not maintain constant warm temperatures overnight.</WarnBox>
        <SectionLabel>Enclosure setup</SectionLabel>
        <div style={{background:C.cream,borderRadius:12,padding:"12px 14px",border:"0.5px solid #e8e8e4",fontSize:13,color:"#666",lineHeight:1.7}}>A 60×45cm enclosure works well for one adult. Low, wide footprint preferred. Cork bark hides at both warm and cool ends. Rocky substrate or red clay mix. A moist hide for shedding. Small water bowl. Under-tank heat mat on one side, thermostat controlled. They can vocalise loudly at night — an endearing trait!</div>
        <ShopBtn>🛒 Shop Thick-tailed Gecko supplies</ShopBtn>
        <ShopBtn secondary>Ask a question ↗</ShopBtn>
      </>}
      {tab === "feeding" && <>
        <p style={{fontSize:13,color:"#666",lineHeight:1.6,marginBottom:12}}>Insectivores. Feed a variety of live insects, always gut-loaded and supplemented. Feed at night when naturally active.</p>
        <div style={{background:C.cream,borderRadius:12,border:"0.5px solid #e8e8e4",padding:"0 14px"}}>
          <FoodItem icon="🦗" name="Crickets" detail="Staple feeder — gut load well" freq="Every 2–3 nights"/>
          <FoodItem icon="🦟" name="Wood roaches (Woodies)" detail="Excellent nutrition" freq="Every 2–3 nights"/>
          <FoodItem icon="🪲" name="Mealworms" detail="Moderate fat — good supplement" freq="Weekly"/>
        </div>
        <WarnBox type="gold" title="Calcium dust every feed">Dust all insects with calcium + D3 at every feeding for juveniles, every other feeding for adults. Essential for long-term bone health.</WarnBox>
        <ShopBtn>🛒 Shop feeders & supplements</ShopBtn>
      </>}
      {tab === "health & shedding" && <>
        <SectionLabel mt={0}>Common health issues</SectionLabel>
        <HealthItem title="Retained shed" detail="A moist hide prevents most shed issues. Check toes carefully after each shed — retained shed on toes can constrict circulation."/>
        <HealthItem title="Tail loss" detail="Can drop their tail when very stressed. Unlike the Knob-tail, the Thick-tail's regrown tail looks reasonably similar to the original."/>
        <HealthItem title="Overheating" detail="They prefer cooler conditions. Never allow temperatures to exceed 33°C anywhere in the enclosure."/>
        <HealthItem dot="#4a9e6b" title="Signs of good health" detail="Plump tail, active at night, vocalising (normal!), feeding well, clean bright pattern."/>
        <SnakeShedding animal="gecko" />
      </>}
      {tab === "handling" && <>
        <div style={{background:C.greenPale,borderRadius:12,padding:"12px 14px",marginBottom:12,border:`0.5px solid ${C.green}22`}}>
          <div style={{fontSize:12,fontWeight:700,color:C.green,marginBottom:6}}>BITE RISK — LOW</div>
          <div style={{fontSize:13,color:"#555",lineHeight:1.6}}>Thick-tailed Geckos are calmer and more handleable than Knob-tailed Geckos. They may vocalise when first picked up — this is normal and not a sign of serious distress. With regular gentle handling they become quite tame. A good gecko for someone wanting to handle their pet regularly.</div>
        </div>
        <div style={{background:C.cream,borderRadius:12,padding:"12px 14px",border:"0.5px solid #e8e8e4",fontSize:13,color:"#666",lineHeight:1.7}}>Handle at night when active. Support the full body. Start with short 5–10 minute sessions. Their vocalisation (a soft barking sound) is part of their charm — enjoy it! Never grab the tail.</div>
      </>}
      {tab === "licencing" && <LegalTab note="Thick-tailed Geckos are widely available from licensed breeders across Australia." states={[{ abbr: "NSW", cat: "Standard keeper licence", ok: true }, { abbr: "VIC", cat: "Basic wildlife licence", ok: true }, { abbr: "QLD", cat: "Standard keeper licence", ok: true }, { abbr: "SA", cat: "Basic permit", ok: true }, { abbr: "WA", cat: "Standard licence", ok: true }, { abbr: "TAS", cat: "TAS natives only", ok: false }, { abbr: "ACT", cat: "Standard licence", ok: true }, { abbr: "NT", cat: "Check with authority", ok: true }]} />}
    </>}
  />
);

// ─── Marbled Velvet Gecko page ────────────────────────────────────
const MarbledVelvetGeckoPage = ({ onBack }) => (
  <SpeciesPage onBack={onBack} name="Marbled Velvet Gecko" latin="Oedura marmorata" emoji="🦎"
    badges={[["Beginner friendly", C.greenPale, C.green], ["Australian native", C.bluePale, C.blue], ["Nocturnal", C.goldLight, "#7a5a1e"]]}
    tabs={["overview","feeding","health & shedding","handling","licencing"]}
    tabContent={(tab) => <>
      {tab === "overview" && <>
        <p style={{fontSize:13,color:"#666",lineHeight:1.6,marginBottom:14}}>A beautifully patterned gecko found across inland Australia. Their marbled purple-grey and cream pattern is stunning and varies between individuals. Hardy, long-lived, and relatively easy to care for — an excellent choice for gecko enthusiasts looking for a uniquely Australian species. Semi-arboreal, enjoying both ground hides and climbing.</p>
        <SectionLabel mt={0}>Quick stats</SectionLabel>
        <StatGrid stats={[["📏","Adult size","12–17 cm"],["⏳","Lifespan","15–20 yrs"],["🏠","Min. enclosure","60 × 45 cm"],["💧","Humidity","30–45%"]]} />
        <SectionLabel>Temperature requirements</SectionLabel>
        <TempBar label="Warm side" value="28–32°C" width="66%" color="#e05a2b"/>
        <TempBar label="Cool side" value="20–24°C" width="36%" color="#4a9e6b"/>
        <TempBar label="Overnight low" value="15–18°C" width="20%" color="#2b7ec0"/>
        <SectionLabel>Enclosure setup</SectionLabel>
        <div style={{background:C.cream,borderRadius:12,padding:"12px 14px",border:"0.5px solid #e8e8e4",fontSize:13,color:"#666",lineHeight:1.7}}>A 60×45cm enclosure with some height for climbing. Cork bark flats leaning against the wall and cork bark hides on the ground. Rocky substrate or reptile carpet. A moist hide. Small water bowl. Under-tank heat mat one side, thermostat controlled. They love to squeeze behind cork bark flats — mimic this in captivity.</div>
        <ShopBtn>🛒 Shop Marbled Velvet Gecko supplies</ShopBtn>
        <ShopBtn secondary>Ask a question ↗</ShopBtn>
      </>}
      {tab === "feeding" && <>
        <p style={{fontSize:13,color:"#666",lineHeight:1.6,marginBottom:12}}>Insectivores. Feed at night when naturally active. Variety of insects gut-loaded and dusted with supplements.</p>
        <div style={{background:C.cream,borderRadius:12,border:"0.5px solid #e8e8e4",padding:"0 14px"}}>
          <FoodItem icon="🦗" name="Crickets" detail="Staple — appropriate size" freq="Every 2–3 nights"/>
          <FoodItem icon="🦟" name="Wood roaches (Woodies)" detail="Excellent nutrition" freq="Every 2–3 nights"/>
          <FoodItem icon="🪲" name="Mealworms" detail="Treat — moderate fat" freq="Weekly"/>
        </div>
        <WarnBox type="gold" title="Dust every feed">Calcium with D3 at every feed for juveniles, every other feed for adults. These geckos are long-lived — consistent supplementation pays off over their lifetime.</WarnBox>
        <ShopBtn>🛒 Shop feeders & supplements</ShopBtn>
      </>}
      {tab === "health & shedding" && <>
        <SectionLabel mt={0}>Common health issues</SectionLabel>
        <HealthItem title="Retained shed" detail="Moist hide prevents most issues. Check between toes and around eyes after shedding."/>
        <HealthItem title="Tail loss" detail="Can drop tail under severe stress. Regrows but imperfectly. Minimise stress during handling."/>
        <HealthItem dot="#4a9e6b" title="Signs of good health" detail="Active at night, beautiful marbled pattern, plump tail base, feeding well, clean eyes."/>
        <SnakeShedding animal="gecko" />
      </>}
      {tab === "handling" && <>
        <div style={{background:C.greenPale,borderRadius:12,padding:"12px 14px",marginBottom:12,border:`0.5px solid ${C.green}22`}}>
          <div style={{fontSize:12,fontWeight:700,color:C.green,marginBottom:6}}>BITE RISK — LOW</div>
          <div style={{fontSize:13,color:"#555",lineHeight:1.6}}>Marbled Velvet Geckos are calm and handleable for their size. Faster than Knob-tailed Geckos but manageable with gentle consistent handling. Handle at night when active for best results.</div>
        </div>
        <div style={{background:C.cream,borderRadius:12,padding:"12px 14px",border:"0.5px solid #e8e8e4",fontSize:13,color:"#666",lineHeight:1.7}}>Support full body. Short sessions initially. They are more confident in low light — dim the room for handling sessions. Never grab the tail.</div>
      </>}
      {tab === "licencing" && <LegalTab note="Marbled Velvet Geckos are available from licensed breeders across Australia." states={[{ abbr: "NSW", cat: "Standard keeper licence", ok: true }, { abbr: "VIC", cat: "Basic wildlife licence", ok: true }, { abbr: "QLD", cat: "Standard keeper licence", ok: true }, { abbr: "SA", cat: "Basic permit", ok: true }, { abbr: "WA", cat: "Standard licence", ok: true }, { abbr: "TAS", cat: "TAS natives only", ok: false }, { abbr: "ACT", cat: "Standard licence", ok: true }, { abbr: "NT", cat: "Check with authority", ok: true }]} />}
    </>}
  />
);


// ─── Feeder Guide page ────────────────────────────────────────────
const FeederGuidePage = ({ onBack }) => {
  const [tab, setTab] = useState("insects");
  const tabs = ["insects", "rodents", "supplements", "gut loading"];

  const RodentCard = ({ stage, size, weight, bestFor, notes, emoji }) => (
    <div style={{background:C.cream,borderRadius:12,padding:"14px 16px",marginBottom:12,border:"0.5px solid #e8e8e4"}}>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
        <span style={{fontSize:28}}>{emoji}</span>
        <div>
          <div style={{fontSize:14,fontWeight:700,color:"#111"}}>{stage}</div>
          <div style={{fontSize:11,color:"#888"}}>{size} · {weight}</div>
        </div>
      </div>
      <div style={{fontSize:12,color:"#555",marginBottom:6}}><span style={{fontWeight:700,color:"#333"}}>Best for: </span>{bestFor}</div>
      <div style={{fontSize:12,color:"#777",lineHeight:1.6,fontStyle:"italic"}}>{notes}</div>
    </div>
  );

  return (
    <div style={{flex:1,overflowY:"auto"}}>
      <div style={{background:C.green,padding:"calc(env(safe-area-inset-top, 0px) + 20px) 20px 0"}}>
        <button onClick={onBack} style={{background:"none",border:"none",color:"rgba(255,255,255,0.7)",fontSize:13,cursor:"pointer",display:"flex",alignItems:"center",gap:6,marginBottom:16,fontFamily:"inherit"}}>‹ Back to care guides</button>
        <div style={{fontSize:10,fontWeight:700,color:"rgba(255,255,255,0.6)",letterSpacing:"0.07em",marginBottom:4}}>CARE GUIDE</div>
        <div style={{fontSize:22,fontWeight:700,color:"white",marginBottom:4}}>Feeder Guide</div>
        <div style={{fontSize:13,color:"rgba(255,255,255,0.7)",marginBottom:16,lineHeight:1.5}}>Everything beginners need to know about feeding insects and rodents to Australian reptiles</div>
        <div style={{display:"flex",borderBottom:"0.5px solid rgba(255,255,255,0.2)",margin:"0 -20px",padding:"0 20px",gap:4,overflowX:"auto",scrollbarWidth:"none"}}>
          {tabs.map(t=>(
            <button key={t} onClick={()=>setTab(t)} style={{background:"none",border:"none",borderBottom:tab===t?"2px solid #fff":"2px solid transparent",color:tab===t?"white":"rgba(255,255,255,0.55)",fontSize:12,fontWeight:700,padding:"8px 12px",cursor:"pointer",fontFamily:"inherit",whiteSpace:"nowrap",marginBottom:-1,textTransform:"capitalize"}}>{t}</button>
          ))}
        </div>
      </div>

      <div style={{background:"white",padding:"16px 18px 40px"}}>

        {tab === "insects" && <>
          <div style={{background:C.greenPale,borderRadius:12,padding:"12px 14px",marginBottom:16,border:`0.5px solid ${C.green}22`}}>
            <div style={{fontSize:12,fontWeight:700,color:C.green,marginBottom:4}}>AUSTRALIAN FEEDER INSECTS</div>
            <div style={{fontSize:13,color:"#555",lineHeight:1.6}}>All feeder insects should be gut-loaded for 24 hours before feeding and dusted with calcium powder. Never feed wild-caught insects — they may carry pesticides or parasites.</div>
          </div>

          <InsectCard
            name="Wood Roaches"
            protein="High (~22%)"
            fat="Moderate (~8%)"
            calcium="Poor — dust every feed"
            availability="⭐⭐⭐⭐⭐ Widely available Australia-wide"
            best="All insectivorous reptiles and frogs. Suitable for all ages."
            notes="Australia's most popular feeder roach. Native species (Nauphoeta cinerea). Very active — excellent for stimulating natural hunting behaviour. Easy to keep a colony. Cannot infest homes if they escape unlike some roaches. Available live, frozen, and dried."
            tag="Australian Native"
            tagColor={C.green}
          />

          <InsectCard
            name="Dubia Roaches"
            protein="Very high (~23%)"
            fat="Low (~7%)"
            calcium="Poor — dust every feed"
            availability="⭐⭐⭐ Increasingly available Australia-wide (now legal)"
            best="Bearded Dragons, large geckos, monitors. Excellent staple."
            notes="Nutritionally superior to most other feeders — high protein, low fat, easy to digest due to low chitin content. Less active than Woodies so less stimulating for hunting. Cannot climb smooth surfaces — easier to contain. Previously thought illegal in Australia but now confirmed legal and becoming more widely available."
            tag="Nutritional Gold Standard"
            tagColor="#1a3a5c"
          />

          <InsectCard
            name="Crickets"
            protein="Moderate (~21%)"
            fat="Low (~7%)"
            calcium="Poor — dust every feed"
            availability="⭐⭐⭐⭐⭐ Available everywhere"
            best="All insectivorous reptiles. Great for stimulating hunting behaviour."
            notes="The most widely available feeder insect. Very active — great for stimulating hunting instincts. Downside: they are noisy, smelly, escape easily, and can bite reptiles if left uneaten. Never leave live crickets unattended with your reptile. Remove uneaten crickets after 15 minutes."
            tag="Most Available"
            tagColor={C.green}
          />

          <InsectCard
            name="Black Soldier Fly Larvae (BSFL / Calci-worms)"
            protein="High (~17%)"
            fat="Moderate (~14%)"
            calcium="Excellent — best Ca:P of any feeder"
            availability="⭐⭐⭐⭐ Widely available"
            best="All reptiles. Exceptional calcium source. Great supplement."
            notes="The highest natural calcium content of any commonly available feeder insect — one of the few feeders with a positive calcium to phosphorus ratio. They do not need to be dusted with calcium. Excellent supplement to rotate with other feeders. Available as live larvae, dried, and tinned."
            tag="Highest Calcium"
            tagColor="#7a5a1e"
          />

          <InsectCard
            name="Mealworms"
            protein="Moderate (~20%)"
            fat="High (~13%)"
            calcium="Poor — dust every feed"
            availability="⭐⭐⭐⭐⭐ Available everywhere"
            best="Occasional treat for most reptiles. Not suitable as a staple."
            notes="High fat content makes them unsuitable as a main feeder — use as treats only. High in chitin which is difficult to digest, particularly for younger animals. Giant mealworms (superworms) have similar issues. Knob-tailed Geckos and Blue-tongue Skinks particularly enjoy them as occasional treats."
            tag="Treat Only"
            tagColor={C.red}
          />

          <InsectCard
            name="Waxworms"
            protein="Low (~15%)"
            fat="Very high (~22%)"
            calcium="Very poor"
            availability="⭐⭐⭐ Available at most pet stores"
            best="Occasional treat only. Useful for underweight or recovering animals."
            notes="The junk food of the reptile world — extremely high in fat and highly palatable. Reptiles love them but they are nutritionally poor. Use very sparingly — once or twice a month maximum. Useful for tempting sick or underweight animals to eat, or as a reward during training."
            tag="Junk Food — Sparingly"
            tagColor={C.red}
          />

          <InsectCard
            name="Silkworms"
            protein="Moderate (~20%)"
            fat="Very low (~2%)"
            calcium="Good"
            availability="⭐⭐ Seasonal — online availability"
            best="Excellent supplement for all reptiles. High moisture content."
            notes="Very nutritious and low in fat. High moisture content makes them excellent for hydration. Soft-bodied and easy to digest. The downside is they require fresh mulberry leaves or artificial silkworm food to keep alive — they cannot be stored easily. Best ordered as needed rather than kept as a colony."
            tag="High Moisture"
            tagColor="#1a3a5c"
          />

          <InsectCard
            name="Cockroach Nymphs (Baby Woodies or Dubias)"
            protein="High"
            fat="Low"
            calcium="Poor — dust every feed"
            availability="⭐⭐⭐⭐ From roach colony keepers"
            best="Hatchling and juvenile reptiles. Small geckos and frogs."
            notes="Baby roaches (nymphs) are one of the best feeders for hatchling reptiles — small, soft-bodied, nutritious, and very active. If you keep a Woody or Dubia colony you will have a constant supply of nymphs. Far superior to pinhead crickets for very small animals."
            tag="Best for Hatchlings"
            tagColor={C.green}
          />

          <div style={{background:"#fff3e0",borderRadius:12,padding:"12px 14px",border:"0.5px solid #c8963c44",marginTop:8}}>
            <div style={{fontSize:12,fontWeight:700,color:"#7a5a1e",marginBottom:6}}>🦗 VARIETY IS KEY</div>
            <div style={{fontSize:13,color:"#555",lineHeight:1.6}}>No single feeder insect provides complete nutrition. Rotating between 3–4 different feeders gives your reptile a much broader nutritional profile than relying on just one type. A good rotation might be: Woodies (staple) + BSFL (calcium boost) + Crickets (hunting stimulation) + Silkworms (hydration).</div>
          </div>
        </>}

        {tab === "rodents" && <>
          <div style={{background:C.greenPale,borderRadius:12,padding:"12px 14px",marginBottom:16,border:`0.5px solid ${C.green}22`}}>
            <div style={{fontSize:12,fontWeight:700,color:C.green,marginBottom:4}}>MICE & RATS — STAGE GUIDE</div>
            <div style={{fontSize:13,color:"#555",lineHeight:1.6}}>Rodents are the staple food for all Australian pythons and many larger lizards. Always feed pre-killed or frozen/thawed — never live prey. Use long feeding tongs and hook-train before every interaction.</div>
          </div>

          <div style={{fontSize:13,fontWeight:700,color:C.green,marginBottom:10,marginTop:4}}>🐭 MICE — smallest to largest</div>

          <RodentCard emoji="🥚" stage="Pinky" size="Newborn mouse — no fur" weight="2–5g" bestFor="Hatchling pythons, small adult Children's and Stimson's Pythons, Pygmy Pythons" notes="Pink, hairless newborn mice. The smallest readily available rodent prey. Essential for hatchling pythons that are too small for anything larger. Named for their pink skin colour due to no fur." />
          <RodentCard emoji="🐭" stage="Fuzzy" size="1–2 week old mouse — light fur" weight="5–10g" bestFor="Juvenile small pythons, adult Pygmy and Children's Pythons" notes="Just starting to grow fine fur ('fuzz'). Eyes still closed. Larger than pinkies but still small. The next step up from pinkies for growing hatchlings." />
          <RodentCard emoji="🐭" stage="Hopper / Crawler" size="2–3 week old mouse — fully furred" weight="10–15g" bestFor="Juvenile Spotted Pythons, Stimson's Pythons, small Carpet Pythons" notes="Fully furred with eyes now open. Starting to move around actively — named 'hoppers' for their movement. Good intermediate size." />
          <RodentCard emoji="🐭" stage="Weaned / Small Mouse" size="3–4 week old mouse" weight="15–20g" bestFor="Juvenile Carpet Pythons, adult Spotted Pythons, large Children's Pythons" notes="Recently weaned — eating solid food. A versatile size for medium juvenile pythons." />
          <RodentCard emoji="🐭" stage="Adult Mouse" size="Fully grown mouse" weight="20–30g" bestFor="Adult Carpet Python subspecies, juvenile Woma and Bredli Pythons" notes="Full-grown adult mouse. A standard feeder size for medium pythons. Most widely available size from pet suppliers." />
          <RodentCard emoji="🐭" stage="Large / Jumbo Mouse" size="Large adult mouse" weight="30–45g" bestFor="Large adult Carpet Pythons, juvenile Olive and Water Pythons" notes="Extra large mice. Useful bridge between adult mice and small rats." />

          <div style={{fontSize:13,fontWeight:700,color:C.green,marginBottom:10,marginTop:16}}>🐀 RATS — smallest to largest</div>

          <RodentCard emoji="🐀" stage="Rat Pinky" size="Newborn rat — no fur" weight="5–10g" bestFor="Large hatchling pythons, juvenile Diamond Pythons" notes="Newborn rats are significantly larger than mouse pinkies — useful for large hatchling pythons that need a bigger first feed." />
          <RodentCard emoji="🐀" stage="Rat Fuzzy" size="1–2 week old rat" weight="10–20g" bestFor="Juvenile Bredli, Woma, and large Carpet Python subspecies" notes="Similar developmental stage to mouse fuzzies but much larger. Good transition size." />
          <RodentCard emoji="🐀" stage="Rat Pup / Crawler" size="2–3 week old rat" weight="20–40g" bestFor="Sub-adult Carpet Pythons, juvenile Olive Pythons" notes="Growing quickly — fully furred and eyes open. A versatile rat size for medium-large pythons." />
          <RodentCard emoji="🐀" stage="Small / Weaner Rat" size="Weaned juvenile rat" weight="40–80g" bestFor="Adult Carpet Pythons, Bredli, Woma, juvenile Olive and Amethystine Pythons" notes="The workhorse of python feeding — the most commonly used rat size for medium to large pythons." />
          <RodentCard emoji="🐀" stage="Medium Rat" size="Sub-adult rat" weight="80–150g" bestFor="Adult Olive Pythons, large adult Carpet Pythons, sub-adult Amethystine Pythons" notes="Large enough for big pythons but not so large as to cause regurgitation risk in most species." />
          <RodentCard emoji="🐀" stage="Large / Adult Rat" size="Fully grown adult rat" weight="150–300g" bestFor="Adult Olive and Amethystine Pythons" notes="Large prey for large pythons only. Always ensure prey is no wider than the widest point of the snake's body." />
          <RodentCard emoji="🐇" stage="Rabbit (various sizes)" size="From kitten to adult" weight="100g–2kg+" bestFor="Large adult Amethystine Pythons only" notes="Only appropriate for very large pythons. Rabbit kittens are used for large adult Amethystine Pythons. Full adult rabbits for the very largest specimens only." />

          <div style={{background:"#fce8e8",borderRadius:12,padding:"12px 14px",border:"0.5px solid #8b202022",marginTop:8}}>
            <div style={{fontSize:12,fontWeight:700,color:C.red,marginBottom:6}}>⚠️ SIZING RULE — ALWAYS FOLLOW THIS</div>
            <div style={{fontSize:13,color:"#555",lineHeight:1.6}}>Prey should never be wider than the widest point of your snake's body. Feeding prey that is too large causes regurgitation and can injure or even kill the snake. When in doubt — go smaller.</div>
          </div>

          <div style={{background:C.greenPale,borderRadius:12,padding:"12px 14px",border:`0.5px solid ${C.green}22`,marginTop:12}}>
            <div style={{fontSize:12,fontWeight:700,color:C.green,marginBottom:6}}>✅ ALWAYS FEED PRE-KILLED OR FROZEN/THAWED</div>
            <div style={{fontSize:13,color:"#555",lineHeight:1.6}}>Live prey can seriously injure or kill your snake — even a small mouse can bite and scratch a python badly enough to cause infection. Frozen/thawed prey is safer, more convenient, and equally nutritious. Thaw completely in warm water before feeding — never microwave.</div>
          </div>
        </>}

        {tab === "supplements" && <>
          <div style={{background:C.greenPale,borderRadius:12,padding:"12px 14px",marginBottom:16,border:`0.5px solid ${C.green}22`}}>
            <div style={{fontSize:12,fontWeight:700,color:C.green,marginBottom:4}}>SUPPLEMENTS — WHY THEY MATTER</div>
            <div style={{fontSize:13,color:"#555",lineHeight:1.6}}>Feeder insects are nutritionally incomplete on their own — they lack sufficient calcium and often have too much phosphorus. Supplementation bridges this gap and is essential for long-term health.</div>
          </div>

          {[
            ["Calcium + D3 powder","The most important supplement. Dust all insects before every feed for juveniles, every other feed for adults. D3 helps the animal absorb calcium. Essential for bone health and preventing MBD.","Critical","#8b2020"],
            ["Calcium WITHOUT D3","Use this if your reptile gets adequate UVB lighting — the UVB produces D3 naturally. Using D3 supplement AND strong UVB can cause D3 toxicity over time. Diurnal reptiles with good UVB should use no-D3 calcium most of the time.","Important","#1a3a5c"],
            ["Multivitamin powder","Provides vitamins A, E, and other micronutrients not well represented in feeder insects. Use 1–2 times per week — not every feed. Over-supplementation with vitamins can be as harmful as under-supplementation.","Weekly","#7a5a1e"],
            ["Reptile-specific probiotic","Supports gut health especially after illness, antibiotic treatment, or stress. Not essential for healthy animals but beneficial.","Optional","#2a7e4a"],
          ].map(([name,desc,freq,col])=>(
            <div key={name} style={{background:C.cream,borderRadius:12,padding:"14px 16px",marginBottom:12,border:"0.5px solid #e8e8e4"}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
                <div style={{fontSize:14,fontWeight:700,color:"#111"}}>{name}</div>
                <span style={{fontSize:10,fontWeight:700,padding:"3px 9px",borderRadius:10,background:col+"22",color:col}}>{freq}</span>
              </div>
              <div style={{fontSize:13,color:"#555",lineHeight:1.6}}>{desc}</div>
            </div>
          ))}

          <div style={{background:"#fff3e0",borderRadius:12,padding:"12px 14px",border:"0.5px solid #c8963c44",marginTop:4}}>
            <div style={{fontSize:12,fontWeight:700,color:"#7a5a1e",marginBottom:6}}>💡 SUPPLEMENTATION SCHEDULE — SIMPLE GUIDE</div>
            {[
              ["Juvenile reptiles (under 12 months)","Calcium + D3 at EVERY feed"],
              ["Adult reptiles with UVB","Calcium no-D3 most feeds, D3 version 1–2x per month, multivitamin 1–2x per week"],
              ["Adult reptiles WITHOUT UVB","Calcium + D3 every other feed, multivitamin 1–2x per week"],
              ["Nocturnal reptiles (geckos etc)","Calcium + D3 every feed — they cannot synthesise D3 from UVB"],
            ].map(([who,what])=>(
              <div key={who} style={{marginBottom:8,paddingBottom:8,borderBottom:"0.5px solid #f0e0c0"}}>
                <div style={{fontSize:12,fontWeight:700,color:"#7a5a1e",marginBottom:2}}>{who}</div>
                <div style={{fontSize:12,color:"#555"}}>{what}</div>
              </div>
            ))}
          </div>
        </>}

        {tab === "gut loading" && <>
          <div style={{background:C.greenPale,borderRadius:12,padding:"12px 14px",marginBottom:16,border:`0.5px solid ${C.green}22`}}>
            <div style={{fontSize:12,fontWeight:700,color:C.green,marginBottom:4}}>WHAT IS GUT LOADING?</div>
            <div style={{fontSize:13,color:"#555",lineHeight:1.6}}>Gut loading means feeding your feeder insects nutritious food 24–48 hours before offering them to your reptile. The insects digest this food and pass the nutrition on when eaten — effectively turning the insect into a nutritional delivery vehicle.</div>
          </div>

          <div style={{fontSize:13,fontWeight:700,color:C.green,marginBottom:10}}>✅ Best gut-loading foods:</div>
          {[
            ["Leafy greens","Collard greens, kale, mustard greens, dandelion leaves — high in calcium and vitamins"],
            ["Orange vegetables","Carrots, sweet potato, butternut squash — high in beta-carotene (vitamin A)"],
            ["Other vegetables","Zucchini, capsicum, cucumber — good hydration and nutrients"],
            ["Commercial gut load","Specialised powders and pellets designed for feeder insects — convenient and effective"],
          ].map(([name,desc])=>(
            <div key={name} style={{background:C.cream,borderRadius:12,padding:"12px 14px",marginBottom:10,border:"0.5px solid #e8e8e4"}}>
              <div style={{fontSize:13,fontWeight:700,color:"#111",marginBottom:4}}>{name}</div>
              <div style={{fontSize:13,color:"#555",lineHeight:1.5}}>{desc}</div>
            </div>
          ))}

          <div style={{fontSize:13,fontWeight:700,color:C.red,marginBottom:10,marginTop:4}}>❌ Do NOT gut load with:</div>
          {[
            ["Spinach & beet greens","Contain oxalates that bind calcium — counterproductive"],
            ["Iceberg lettuce","Almost no nutritional value — just water"],
            ["Citrus fruits","Too acidic for feeder insects"],
            ["Dog or cat food","Too high in protein — can cause gut load to go off quickly and smell bad"],
          ].map(([name,desc])=>(
            <div key={name} style={{background:C.cream,borderRadius:12,padding:"12px 14px",marginBottom:10,border:"0.5px solid #e8e8e4"}}>
              <div style={{fontSize:13,fontWeight:700,color:C.red,marginBottom:4}}>{name}</div>
              <div style={{fontSize:13,color:"#555",lineHeight:1.5}}>{desc}</div>
            </div>
          ))}

          <div style={{background:"#fff3e0",borderRadius:12,padding:"12px 14px",border:"0.5px solid #c8963c44",marginTop:4}}>
            <div style={{fontSize:12,fontWeight:700,color:"#7a5a1e",marginBottom:6}}>💡 GUT LOADING TIPS</div>
            <div style={{fontSize:13,color:"#555",lineHeight:1.6,marginBottom:8}}>Start gut loading 24–48 hours before feeding. A well gut-loaded cricket or Woody is significantly more nutritious than a starved one. Commercial gut load products take the guesswork out of it — a good option for beginners.</div>
            <div style={{fontSize:13,color:"#555",lineHeight:1.6}}>Even with gut loading, still dust insects with calcium powder before feeding — gut loading improves nutrition but does not fix the poor calcium to phosphorus ratio of most insects.</div>
          </div>
        </>}

      </div>
    </div>
  );
};


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


// ─── Eastern Long-necked Turtle page ─────────────────────────────
const EasternLongNeckPage = ({ onBack }) => (
  <SpeciesPage onBack={onBack} name="Eastern Long-necked Turtle" latin="Chelodina longicollis" emoji="🐢"
    badges={[["Intermediate", C.goldLight, "#7a5a1e"], ["Australian native", C.bluePale, C.blue], ["Aquatic", C.greenPale, C.green]]}
    tabs={["overview","feeding","health & setup","handling","licencing"]}
    tabContent={(tab) => <>
      {tab === "overview" && <>
        <p style={{fontSize:13,color:"#666",lineHeight:1.6,marginBottom:14}}>Australia's most commonly kept freshwater turtle. Found across south-eastern Australia in rivers, lakes, and wetlands. Their extraordinarily long neck — sometimes as long as their shell — is used to strike at prey with lightning speed. Fascinating to watch, long-lived, and rewarding to keep with the right setup.</p>
        <SectionLabel mt={0}>Quick stats</SectionLabel>
        <StatGrid stats={[["📏","Shell length","20–28 cm"],["⏳","Lifespan","30–50+ yrs"],["🏠","Min. tank","200L+"],["💧","Water temp","18–24°C"]]} />
        <WarnBox type="red" title="Long term commitment">Eastern Long-necked Turtles can live for 30–50+ years in captivity. This is a multi-decade commitment. Plan accordingly before purchasing.</WarnBox>
        <SectionLabel>Tank setup</SectionLabel>
        <div style={{background:C.cream,borderRadius:12,padding:"12px 14px",border:"0.5px solid #e8e8e4",fontSize:13,color:"#666",lineHeight:1.7}}>A large aquatic setup is essential — minimum 200 litres for one adult. A basking platform above the waterline where the turtle can fully dry out under a heat lamp is critical. UVB lighting over the basking area. Water depth should allow the turtle to fully submerge but also stand on the bottom and breathe. A high-quality canister filter — turtles are extremely messy and produce a lot of waste. Regular partial water changes (25–30% weekly) regardless of filtration.</div>
        <WarnBox type="gold" title="Filtration is critical">Turtles produce significantly more waste than fish of equivalent size. Under-filtration leads to rapid water quality decline, shell rot, and respiratory infections. Invest in a filter rated for at least 3–4 times your tank volume.</WarnBox>
        <SectionLabel>Temperature & lighting</SectionLabel>
        <TempBar label="Basking spot (air temp)" value="28–32°C" width="66%" color="#e05a2b"/>
        <TempBar label="Water temperature" value="18–24°C" width="36%" color="#2b7ec0"/>
        <ShopBtn>🛒 Shop turtle supplies</ShopBtn>
        <ShopBtn secondary>Ask a question ↗</ShopBtn>
      </>}
      {tab === "feeding" && <>
        <p style={{fontSize:13,color:"#666",lineHeight:1.6,marginBottom:12}}>Carnivorous. Feed in the water — turtles cannot swallow food on land as they need water to help them swallow. A varied diet promotes good health and enrichment.</p>
        <div style={{background:C.cream,borderRadius:12,border:"0.5px solid #e8e8e4",padding:"0 14px"}}>
          <FoodItem icon="🐟" name="Feeder fish / whitebait" detail="Whole fish provide bones for calcium" freq="2–3x per week"/>
          <FoodItem icon="🦐" name="Prawns / shrimp" detail="Shell-on for calcium content" freq="2–3x per week"/>
          <FoodItem icon="🪱" name="Earthworms" detail="Excellent nutrition — eagerly taken" freq="2–3x per week"/>
          <FoodItem icon="🦗" name="Crickets / woodies" detail="Good variety item — drop into water" freq="Weekly"/>
          <FoodItem icon="🐌" name="Snails" detail="Shell provides calcium — a favourite" freq="Weekly"/>
          <FoodItem icon="🐢" name="Turtle pellets" detail="Quality commercial pellets as supplement" freq="2–3x per week"/>
        </div>
        <WarnBox type="gold" title="Feed in water only">Long-necked Turtles cannot eat on land — they need water to swallow. Always feed in the tank or in a separate feeding container to keep the main tank cleaner.</WarnBox>
        <WarnBox type="red" title="Remove uneaten food promptly">Uneaten food rapidly degrades water quality. Remove any uneaten food within 30 minutes of feeding.</WarnBox>
        <ShopBtn>🛒 Shop turtle food</ShopBtn>
      </>}
      {tab === "health & setup" && <>
        <SectionLabel mt={0}>Common health issues</SectionLabel>
        <HealthItem title="Shell rot" detail="Bacterial or fungal infection of the shell — usually caused by poor water quality or insufficient basking time. Signs include soft or pitting areas on the shell, discolouration, or odour. Requires veterinary treatment and improved husbandry."/>
        <HealthItem title="Respiratory infection" detail="Turtles with respiratory infections often list to one side or float unevenly. Caused by cold water temperatures or poor water quality. Prompt vet attention required."/>
        <HealthItem title="Vitamin A deficiency" detail="Causes swollen eyelids and lethargy. Prevented by feeding a varied diet including whole prey items."/>
        <HealthItem title="Salmonella" detail="All turtles can carry Salmonella. Always wash hands thoroughly after handling turtles or aquarium water. Keep children supervised during interactions."/>
        <HealthItem title="Hibernation (aestivation)" detail="In cooler months some turtles become less active. This is normal. Maintain water temperature and ensure basking is available."/>
        <HealthItem dot="#4a9e6b" title="Signs of good health" detail="Active swimming, basking regularly, eating well, clear eyes, hard smooth shell, alert when approached."/>
        <SectionLabel>Water quality guide</SectionLabel>
        <div style={{background:C.cream,borderRadius:12,padding:"12px 14px",border:"0.5px solid #e8e8e4",fontSize:13,color:"#666",lineHeight:1.7}}>Test water weekly — ammonia and nitrite should always be zero. Nitrates should be kept below 20ppm with regular water changes. pH 6.5–7.5 is ideal. Dechlorinate all tap water before adding to the tank. A reliable test kit is an essential purchase.</div>
      </>}
      {tab === "handling" && <>
        <div style={{background:C.goldLight,borderRadius:12,padding:"12px 14px",marginBottom:12,border:`0.5px solid #c8963c44`}}>
          <div style={{fontSize:12,fontWeight:700,color:"#7a5a1e",marginBottom:6}}>HANDLING — KEEP MINIMAL</div>
          <div style={{fontSize:13,color:"#555",lineHeight:1.6}}>Eastern Long-necked Turtles are aquatic animals — they are not handling pets. Excessive handling causes significant stress. Keep handling to a minimum and for health checks only.</div>
        </div>
        <div style={{background:C.cream,borderRadius:12,padding:"12px 14px",border:"0.5px solid #e8e8e4",fontSize:13,color:"#666",lineHeight:1.7}}>When handling is necessary, hold the turtle at the sides of the shell — never by the neck or limbs. Their long neck can reach around to bite surprisingly easily. Always wash hands immediately after handling. Keep sessions brief and return to water promptly.</div>
        <WarnBox type="red" title="Musk gland warning">When stressed, Long-necked Turtles release a foul-smelling musk from glands near their legs. This is a defence mechanism — if your turtle musks frequently during handling, reduce handling sessions significantly.</WarnBox>
      </>}
      {tab === "licencing" && <LegalTab note="Eastern Long-necked Turtles are available from licensed breeders across most of Australia. Not available in Tasmania." states={[{ abbr: "NSW", cat: "Standard keeper licence", ok: true }, { abbr: "VIC", cat: "Basic wildlife licence", ok: true }, { abbr: "QLD", cat: "Standard keeper licence", ok: true }, { abbr: "SA", cat: "Basic permit", ok: true }, { abbr: "WA", cat: "Standard licence", ok: true }, { abbr: "TAS", cat: "TAS natives only", ok: false }, { abbr: "ACT", cat: "Standard licence", ok: true }, { abbr: "NT", cat: "Check with authority", ok: true }]} />}
    </>}
  />
);

// ─── Broad-shelled Turtle page ────────────────────────────────────
const BroadShellTurtlePage = ({ onBack }) => (
  <SpeciesPage onBack={onBack} name="Broad-shelled Turtle" latin="Chelodina expansa" emoji="🐢"
    badges={[["Intermediate", C.goldLight, "#7a5a1e"], ["Australian native", C.bluePale, C.blue], ["Large species", C.redPale, C.red]]}
    tabs={["overview","feeding","health & setup","handling","licencing"]}
    tabContent={(tab) => <>
      {tab === "overview" && <>
        <p style={{fontSize:13,color:"#666",lineHeight:1.6,marginBottom:14}}>Australia's largest freshwater turtle and one of the largest side-necked turtles in the world. Found in the Murray-Darling river system and coastal rivers of eastern Australia. An impressive animal requiring a very large aquatic setup — not suitable for small spaces. Their broad, flattened shell and enormous neck make them unmistakable.</p>
        <SectionLabel mt={0}>Quick stats</SectionLabel>
        <StatGrid stats={[["📏","Shell length","35–48 cm"],["⏳","Lifespan","50+ yrs"],["🏠","Min. tank","500L+"],["💧","Water temp","18–24°C"]]} />
        <WarnBox type="red" title="Very large species — significant space required">Broad-shelled Turtles are one of Australia's largest reptiles. A 500L+ tank is the minimum for an adult — many keepers use custom-built pond systems. Do not underestimate the space and filtration requirements of this species.</WarnBox>
        <SectionLabel>Tank setup</SectionLabel>
        <div style={{background:C.cream,borderRadius:12,padding:"12px 14px",border:"0.5px solid #e8e8e4",fontSize:13,color:"#666",lineHeight:1.7}}>A very large tank or custom pond setup is essential. Industrial-grade canister filtration — they produce enormous amounts of waste. Large basking platform with heat lamp and UVB above. Water depth sufficient for full submersion. Weekly 30–40% water changes are the minimum. Many keepers of large Broad-shells transition to outdoor pond systems as the animal grows.</div>
        <TempBar label="Basking spot (air temp)" value="28–32°C" width="66%" color="#e05a2b"/>
        <TempBar label="Water temperature" value="18–24°C" width="36%" color="#2b7ec0"/>
        <ShopBtn>🛒 Shop turtle supplies</ShopBtn>
        <ShopBtn secondary>Ask a question ↗</ShopBtn>
      </>}
      {tab === "feeding" && <>
        <p style={{fontSize:13,color:"#666",lineHeight:1.6,marginBottom:12}}>Primarily carnivorous. Adults are powerful predators capable of taking surprisingly large prey. Their long neck strikes with remarkable speed — use tongs when feeding.</p>
        <div style={{background:C.cream,borderRadius:12,border:"0.5px solid #e8e8e4",padding:"0 14px"}}>
          <FoodItem icon="🐟" name="Whole fish" detail="Large whitebait, smelt, small fish" freq="2–3x per week"/>
          <FoodItem icon="🦐" name="Prawns / yabbies" detail="Shell-on for calcium" freq="2–3x per week"/>
          <FoodItem icon="🪱" name="Large earthworms" detail="Excellent protein source" freq="Weekly"/>
          <FoodItem icon="🐢" name="Quality turtle pellets" detail="Large pellets for adult turtles" freq="2–3x per week"/>
        </div>
        <WarnBox type="red" title="Powerful strike — use tongs">Broad-shelled Turtles have a very fast and powerful neck strike when feeding. Always use long tongs to offer food — never fingers near the water surface during feeding time.</WarnBox>
        <ShopBtn>🛒 Shop turtle food</ShopBtn>
      </>}
      {tab === "health & setup" && <>
        <SectionLabel mt={0}>Common health issues</SectionLabel>
        <HealthItem title="Shell rot" detail="Serious risk with insufficient basking or poor water quality. Their large shell size means infections can become extensive before being noticed. Inspect the shell regularly."/>
        <HealthItem title="Water quality issues" detail="Their large size and appetite means they produce a lot of waste. Poor filtration rapidly leads to health problems. Invest in the best filtration available."/>
        <HealthItem title="Respiratory infection" detail="Uneven floating or listing to one side indicates respiratory issues. Prompt veterinary attention required."/>
        <HealthItem dot="#4a9e6b" title="Signs of good health" detail="Active and alert in water, basking regularly, eating well, hard smooth broad shell, bright eyes."/>
        <SectionLabel>Water quality</SectionLabel>
        <div style={{background:C.cream,borderRadius:12,padding:"12px 14px",border:"0.5px solid #e8e8e4",fontSize:13,color:"#666",lineHeight:1.7}}>Weekly water testing is essential. Ammonia and nitrite must be zero. Nitrates below 20ppm. For large setups, consider a sump filter or multiple canister filters running in series. An outdoor pond with a biological filter is ideal for large adults.</div>
      </>}
      {tab === "handling" && <>
        <div style={{background:C.redPale,borderRadius:12,padding:"12px 14px",marginBottom:12,border:`0.5px solid ${C.red}22`}}>
          <div style={{fontSize:12,fontWeight:700,color:C.red,marginBottom:6}}>HANDLING — EXPERIENCED KEEPERS ONLY</div>
          <div style={{fontSize:13,color:"#555",lineHeight:1.6}}>Large Broad-shelled Turtles require two people to handle safely. Their powerful neck can reach all the way to the back of their shell — hold at the very back of the shell on each side. They can inflict painful bites and their claws are sharp. Minimise handling to health checks only.</div>
        </div>
        <WarnBox type="red" title="Musk gland warning">Like all long-necked turtles, Broad-shells release a very pungent musk when stressed. Handle over a sink or outdoors.</WarnBox>
      </>}
      {tab === "licencing" && <LegalTab note="Broad-shelled Turtles are available from licensed breeders across most of Australia. Not available in Tasmania." states={[{ abbr: "NSW", cat: "Standard keeper licence", ok: true }, { abbr: "VIC", cat: "Basic wildlife licence", ok: true }, { abbr: "QLD", cat: "Standard keeper licence", ok: true }, { abbr: "SA", cat: "Basic permit", ok: true }, { abbr: "WA", cat: "Standard licence", ok: true }, { abbr: "TAS", cat: "TAS natives only", ok: false }, { abbr: "ACT", cat: "Standard licence", ok: true }, { abbr: "NT", cat: "Check with authority", ok: true }]} />}
    </>}
  />
);

// ─── Murray River Turtle page ─────────────────────────────────────
const MurrayRiverTurtlePage = ({ onBack }) => (
  <SpeciesPage onBack={onBack} name="Murray River Turtle" latin="Emydura macquarii" emoji="🐢"
    badges={[["Intermediate", C.goldLight, "#7a5a1e"], ["Australian native", C.bluePale, C.blue], ["Aquatic", C.greenPale, C.green]]}
    tabs={["overview","feeding","health & setup","handling","licencing"]}
    tabContent={(tab) => <>
      {tab === "overview" && <>
        <p style={{fontSize:13,color:"#666",lineHeight:1.6,marginBottom:14}}>A robust, active turtle from the Murray-Darling river system. Unlike the Long-necked Turtle, the Murray River Turtle has a shorter, more typical neck — they are a side-necked turtle (Pleurodire) that folds their neck sideways rather than retracting it back. Active swimmers and entertaining to watch. More tolerant of cooler water temperatures than many turtle species.</p>
        <SectionLabel mt={0}>Quick stats</SectionLabel>
        <StatGrid stats={[["📏","Shell length","22–30 cm"],["⏳","Lifespan","30–40+ yrs"],["🏠","Min. tank","300L+"],["💧","Water temp","16–22°C"]]} />
        <WarnBox type="blue" title="Cooler water preferred">Murray River Turtles are from a cooler climate river system. They prefer cooler water temperatures (16–22°C) than tropical species. A water heater may not be needed in most Australian homes — avoid overheating their water.</WarnBox>
        <SectionLabel>Tank setup</SectionLabel>
        <div style={{background:C.cream,borderRadius:12,padding:"12px 14px",border:"0.5px solid #e8e8e4",fontSize:13,color:"#666",lineHeight:1.7}}>A 300L+ tank for one adult. Large basking platform above waterline with heat lamp and UVB. High-quality canister filtration. Regular weekly water changes. They are active swimmers so depth and open swimming space is important. Can tolerate cooler winter temperatures — this is natural and good for their long-term health.</div>
        <TempBar label="Basking spot (air temp)" value="26–30°C" width="58%" color="#e05a2b"/>
        <TempBar label="Water temperature" value="16–22°C" width="32%" color="#2b7ec0"/>
        <ShopBtn>🛒 Shop turtle supplies</ShopBtn>
        <ShopBtn secondary>Ask a question ↗</ShopBtn>
      </>}
      {tab === "feeding" && <>
        <p style={{fontSize:13,color:"#666",lineHeight:1.6,marginBottom:12}}>Omnivorous — more plant material in their diet than Long-necked Turtles. A varied diet of animal protein and aquatic plants promotes good health.</p>
        <div style={{background:C.cream,borderRadius:12,border:"0.5px solid #e8e8e4",padding:"0 14px"}}>
          <FoodItem icon="🐟" name="Feeder fish / whitebait" detail="Whole fish for calcium" freq="2–3x per week"/>
          <FoodItem icon="🦐" name="Prawns / shrimp" detail="Shell-on preferred" freq="2–3x per week"/>
          <FoodItem icon="🪱" name="Earthworms" detail="Excellent natural food" freq="Weekly"/>
          <FoodItem icon="🌿" name="Aquatic plants" detail="Water hyacinth, duckweed — eat naturally" freq="Can be left in tank"/>
          <FoodItem icon="🐢" name="Turtle pellets" detail="Quality commercial pellets" freq="2–3x per week"/>
        </div>
        <WarnBox type="gold" title="Live plants add enrichment">Murray River Turtles naturally graze on aquatic plants. Adding live aquatic plants to the tank provides both nutrition and enrichment — and helps with water quality.</WarnBox>
        <ShopBtn>🛒 Shop turtle food</ShopBtn>
      </>}
      {tab === "health & setup" && <>
        <SectionLabel mt={0}>Common health issues</SectionLabel>
        <HealthItem title="Shell rot" detail="Caused by poor water quality or insufficient basking. Inspect shell regularly for soft spots, discolouration, or unusual odour."/>
        <HealthItem title="Eye infections" detail="Cloudy or swollen eyes indicate poor water quality or vitamin A deficiency. Improve water quality and vary diet."/>
        <HealthItem title="Respiratory infection" detail="Uneven floating indicates respiratory problems. Ensure water is not too warm and quality is maintained."/>
        <HealthItem title="Overheating" detail="Murray River Turtles prefer cooler water. A tank that is too warm causes chronic stress. Keep water at 16–22°C."/>
        <HealthItem dot="#4a9e6b" title="Signs of good health" detail="Active swimming, basking daily, eating well, smooth hard shell, clear eyes, alert and responsive."/>
      </>}
      {tab === "handling" && <>
        <div style={{background:C.goldLight,borderRadius:12,padding:"12px 14px",marginBottom:12,border:`0.5px solid #c8963c44`}}>
          <div style={{fontSize:12,fontWeight:700,color:"#7a5a1e",marginBottom:6}}>HANDLING — KEEP MINIMAL</div>
          <div style={{fontSize:13,color:"#555",lineHeight:1.6}}>Murray River Turtles are aquatic animals and handling should be kept to health checks only. They are generally less defensive than Long-necked Turtles but can still scratch with their claws. Hold at the sides of the shell, wash hands thoroughly after handling.</div>
        </div>
        <WarnBox type="gold" title="Salmonella risk">Like all turtles, Murray River Turtles can carry Salmonella. Always wash hands after handling or working with the aquarium water. Supervise children carefully.</WarnBox>
      </>}
      {tab === "licencing" && <LegalTab note="Murray River Turtles are available from licensed breeders across most of Australia. Not available in Tasmania." states={[{ abbr: "NSW", cat: "Standard keeper licence", ok: true }, { abbr: "VIC", cat: "Basic wildlife licence", ok: true }, { abbr: "QLD", cat: "Standard keeper licence", ok: true }, { abbr: "SA", cat: "Basic permit", ok: true }, { abbr: "WA", cat: "Standard licence", ok: true }, { abbr: "TAS", cat: "TAS natives only", ok: false }, { abbr: "ACT", cat: "Standard licence", ok: true }, { abbr: "NT", cat: "Check with authority", ok: true }]} />}
    </>}
  />
);

// ─── Saw-shelled Turtle page ──────────────────────────────────────
const SawShellTurtlePage = ({ onBack }) => (
  <SpeciesPage onBack={onBack} name="Saw-shelled Turtle" latin="Myuchelys latisternum" emoji="🐢"
    badges={[["Intermediate", C.goldLight, "#7a5a1e"], ["Australian native", C.bluePale, C.blue], ["QLD/NSW only", C.redPale, C.red]]}
    tabs={["overview","feeding","health & setup","handling","licencing"]}
    tabContent={(tab) => <>
      {tab === "overview" && <>
        <p style={{fontSize:13,color:"#666",lineHeight:1.6,marginBottom:14}}>A distinctive turtle found in the rivers and streams of coastal Queensland and New South Wales. Named for the serrated, saw-like edges on the rear of their shell — particularly prominent in juveniles. A shorter-necked side-necked turtle like the Murray River Turtle. Active and alert, with an aggressive feeding response that makes feeding time entertaining.</p>
        <SectionLabel mt={0}>Quick stats</SectionLabel>
        <StatGrid stats={[["📏","Shell length","22–28 cm"],["⏳","Lifespan","25–35+ yrs"],["🏠","Min. tank","300L+"],["💧","Water temp","20–26°C"]]} />
        <WarnBox type="gold" title="QLD and NSW only">Saw-shelled Turtles are only available to keepers in Queensland and New South Wales. They are not available in other states. Check current availability with your state wildlife authority.</WarnBox>
        <SectionLabel>Tank setup</SectionLabel>
        <div style={{background:C.cream,borderRadius:12,padding:"12px 14px",border:"0.5px solid #e8e8e4",fontSize:13,color:"#666",lineHeight:1.7}}>A 300L+ tank for one adult. Large basking platform with heat lamp and UVB above. High-quality canister filtration — they are messy feeders. Regular weekly 25–30% water changes. They prefer slightly warmer water than Murray River Turtles, reflecting their more tropical habitat. Provide plenty of open swimming space.</div>
        <TempBar label="Basking spot (air temp)" value="28–32°C" width="66%" color="#e05a2b"/>
        <TempBar label="Water temperature" value="20–26°C" width="44%" color="#2b7ec0"/>
        <ShopBtn>🛒 Shop turtle supplies</ShopBtn>
        <ShopBtn secondary>Ask a question ↗</ShopBtn>
      </>}
      {tab === "feeding" && <>
        <p style={{fontSize:13,color:"#666",lineHeight:1.6,marginBottom:12}}>Primarily carnivorous with an aggressive feeding response. One of the most enthusiastic feeders of all Australian turtles — use tongs to avoid accidental bites.</p>
        <div style={{background:C.cream,borderRadius:12,border:"0.5px solid #e8e8e4",padding:"0 14px"}}>
          <FoodItem icon="🐟" name="Feeder fish / whitebait" detail="Eagerly taken — whole fish for calcium" freq="2–3x per week"/>
          <FoodItem icon="🦐" name="Prawns / yabbies" detail="Shell-on preferred" freq="2–3x per week"/>
          <FoodItem icon="🪱" name="Earthworms" detail="Natural prey — taken enthusiastically" freq="Weekly"/>
          <FoodItem icon="🦗" name="Crickets / woodies" detail="Drop into water — provides enrichment" freq="Weekly"/>
          <FoodItem icon="🐢" name="Turtle pellets" detail="Quality commercial pellets" freq="2–3x per week"/>
        </div>
        <WarnBox type="red" title="Aggressive feeder — use tongs always">Saw-shelled Turtles have an extremely fast and enthusiastic feeding strike. Always use long tongs. Never put fingers near the water surface during feeding — even experienced keepers get caught out by their speed.</WarnBox>
        <ShopBtn>🛒 Shop turtle food</ShopBtn>
      </>}
      {tab === "health & setup" && <>
        <SectionLabel mt={0}>Common health issues</SectionLabel>
        <HealthItem title="Shell rot" detail="Monitor the serrated shell edges carefully — these irregular areas can trap debris and develop infections. Regular visual checks are important."/>
        <HealthItem title="Water quality" detail="Their aggressive feeding style means they are very messy eaters. Feed in a separate container or remove uneaten food within 20 minutes."/>
        <HealthItem title="Respiratory infection" detail="Listing to one side or bubbles from the nose indicate respiratory problems. Prompt vet attention required."/>
        <HealthItem dot="#4a9e6b" title="Signs of good health" detail="Active and alert, enthusiastic feeder, basking regularly, clear bright eyes, hard smooth shell with intact serrations."/>
        <SectionLabel>Feeding tip</SectionLabel>
        <div style={{background:C.cream,borderRadius:12,padding:"12px 14px",border:"0.5px solid #e8e8e4",fontSize:13,color:"#666",lineHeight:1.7}}>Many keepers of Saw-shelled Turtles feed them in a separate container (a bucket or tub) to keep the main tank cleaner. Move the turtle to the feeding container, offer food with tongs, then return to the main tank after 20–30 minutes.</div>
      </>}
      {tab === "handling" && <>
        <div style={{background:C.goldLight,borderRadius:12,padding:"12px 14px",marginBottom:12,border:`0.5px solid #c8963c44`}}>
          <div style={{fontSize:12,fontWeight:700,color:"#7a5a1e",marginBottom:6}}>HANDLING — EXPERIENCED KEEPERS</div>
          <div style={{fontSize:13,color:"#555",lineHeight:1.6}}>Saw-shelled Turtles can be defensive and their bites are fast and painful. Hold firmly at the sides of the shell — their neck can reach further back than you might expect. Keep handling minimal and always wash hands thoroughly after.</div>
        </div>
        <WarnBox type="red" title="Fast biter">The Saw-shelled Turtle has one of the fastest feeding strikes of any Australian turtle. Even outside of feeding time they can be defensive biters. Hold at the very back of the shell and keep fingers away from the neck area.</WarnBox>
        <WarnBox type="gold" title="Salmonella risk">All turtles can carry Salmonella. Always wash hands after handling or working with aquarium water.</WarnBox>
      </>}
      {tab === "licencing" && <LegalTab note="Saw-shelled Turtles are only available in QLD and NSW." states={[{ abbr: "NSW", cat: "Standard keeper licence", ok: true }, { abbr: "VIC", cat: "Not available", ok: false }, { abbr: "QLD", cat: "Standard keeper licence", ok: true }, { abbr: "SA", cat: "Not available", ok: false }, { abbr: "WA", cat: "Not available", ok: false }, { abbr: "TAS", cat: "TAS natives only", ok: false }, { abbr: "ACT", cat: "Not available", ok: false }, { abbr: "NT", cat: "Not available", ok: false }]} />}
    </>}
  />
);


// ─── Southern Leaf-tailed Gecko page ─────────────────────────────
const LeafTailGeckoPage = ({ onBack }) => (
  <SpeciesPage onBack={onBack} name="Southern Leaf-tailed Gecko" latin="Phyllurus platurus" emoji="🦎"
    badges={[["Intermediate", C.goldLight, "#7a5a1e"], ["Australian native", C.bluePale, C.blue], ["Nocturnal", C.greenPale, C.green]]}
    tabs={["overview","feeding","health & shedding","handling","licencing"]}
    tabContent={(tab) => <>
      {tab === "overview" && <>
        <p style={{fontSize:13,color:"#666",lineHeight:1.6,marginBottom:14}}>One of Australia's most extraordinary native geckos. Found in the sandstone habitats of the Sydney Basin and surrounds, including urban areas where they enter garages and homes. Their flattened body, incredible bark-mimicking camouflage, and distinctive leaf-shaped tail make them unmistakable. A fascinating display animal that rewards patient observation.</p>
        <SectionLabel mt={0}>Quick stats</SectionLabel>
        <StatGrid stats={[["📏","Adult size","14–18 cm"],["⏳","Lifespan","15–20+ yrs"],["🏠","Min. enclosure","45 × 45 × 60 cm"],["💧","Humidity","50–70%"]]} />
        <WarnBox type="gold" title="Display animal — not for handling">Southern Leaf-tailed Geckos are stressed by frequent handling. They are best kept as a display species to observe their remarkable camouflage and nocturnal behaviour. Their welfare depends on minimal disturbance.</WarnBox>
        <SectionLabel>Temperature requirements</SectionLabel>
        <TempBar label="Warm side" value="24–28°C" width="50%" color="#e05a2b"/>
        <TempBar label="Cool side" value="18–22°C" width="30%" color="#4a9e6b"/>
        <TempBar label="Overnight low" value="15–18°C" width="20%" color="#2b7ec0"/>
        <WarnBox type="red" title="Cool temperatures essential">Leaf-tailed Geckos are sensitive to heat. Never allow temperatures to exceed 30°C anywhere in the enclosure. They come from cool sandstone environments and will suffer in overheated setups.</WarnBox>
        <SectionLabel>Enclosure setup</SectionLabel>
        <div style={{background:C.cream,borderRadius:12,padding:"12px 14px",border:"0.5px solid #e8e8e4",fontSize:13,color:"#666",lineHeight:1.7}}>A tall enclosure with plenty of vertical surface area — they spend most of their time pressed flat against bark or rock surfaces. Cork bark sheets and flat pieces of sandstone or slate leaning against the walls are ideal. Low UVB lighting recommended. Coconut coir or sandy substrate. Mist one side of the enclosure lightly 2–3 times per week — they drink from droplets. A shallow water bowl. Good ventilation is essential to prevent respiratory issues.</div>
        <ShopBtn>🛒 Shop gecko supplies</ShopBtn>
        <ShopBtn secondary>Ask a question ↗</ShopBtn>
      </>}
      {tab === "feeding" && <>
        <p style={{fontSize:13,color:"#666",lineHeight:1.6,marginBottom:12}}>Insectivorous. Feed at night when naturally active. Ambush hunters — they wait motionless for prey to come within range rather than actively chasing it.</p>
        <div style={{background:C.cream,borderRadius:12,border:"0.5px solid #e8e8e4",padding:"0 14px"}}>
          <FoodItem icon="🦗" name="Crickets" detail="Staple feeder — appropriately sized" freq="Every 2–3 nights"/>
          <FoodItem icon="🦟" name="Wood Roaches" detail="Excellent Australian native feeder" freq="Every 2–3 nights"/>
          <FoodItem icon="🪲" name="Mealworms" detail="Occasional treat — high fat" freq="Weekly"/>
          <FoodItem icon="🐛" name="Silkworms" detail="High moisture — good for hydration" freq="Occasionally"/>
        </div>
        <WarnBox type="gold" title="Feed at night only">These geckos are strictly nocturnal. Offer food after lights out. They will ignore prey during the day and uneaten insects left in the enclosure can stress or injure the gecko.</WarnBox>
        <WarnBox type="blue" title="Calcium supplementation">Dust all insects with calcium + D3 at every feed for juveniles, every other feed for adults. Low UVB lighting should be supplemented with D3 powder.</WarnBox>
        <ShopBtn>🛒 Shop feeders & supplements</ShopBtn>
      </>}
      {tab === "health & shedding" && <>
        <SectionLabel mt={0}>Common health issues</SectionLabel>
        <HealthItem title="Overheating" detail="The most common cause of decline in captivity. Always monitor temperatures closely. Install a reliable thermometer at enclosure height where the gecko rests."/>
        <HealthItem title="Respiratory infection" detail="Caused by insufficient ventilation or temperatures too cold combined with high humidity. Signs include wheezing or mucus. Ensure excellent airflow."/>
        <HealthItem title="Stress" detail="These geckos are sensitive to disturbance. A stressed gecko will be inactive, refuse food, and lose weight. Minimise handling and unnecessary disturbance during the day."/>
        <HealthItem title="Retained shed" detail="Usually caused by low humidity. A light misting 24 hours before a shed helps. Check carefully around toes after shedding."/>
        <HealthItem dot="#4a9e6b" title="Signs of good health" detail="Flat against a surface during the day (normal resting position), active and hunting at night, excellent camouflage colouration, plump body condition."/>
        <SectionLabel>Shedding</SectionLabel>
        <div style={{background:C.cream,borderRadius:12,padding:"12px 14px",border:"0.5px solid #e8e8e4",fontSize:13,color:"#666",lineHeight:1.7}}>Leaf-tailed Geckos shed every 6–8 weeks. Unlike many geckos, they typically eat their shed. A light mist the day before a shed helps. Do not disturb during or immediately after shedding.</div>
      </>}
      {tab === "handling" && <>
        <div style={{background:C.goldLight,borderRadius:12,padding:"12px 14px",marginBottom:12,border:`0.5px solid #c8963c44`}}>
          <div style={{fontSize:12,fontWeight:700,color:"#7a5a1e",marginBottom:6}}>HANDLING — KEEP TO ABSOLUTE MINIMUM</div>
          <div style={{fontSize:13,color:"#555",lineHeight:1.6}}>Southern Leaf-tailed Geckos are not handling animals. They are fragile, stress easily, and can drop their tail or suffer injury if mishandled. Handle only for health checks and keep sessions under 2 minutes. This species is best enjoyed through observation.</div>
        </div>
        <div style={{background:C.cream,borderRadius:12,padding:"12px 14px",border:"0.5px solid #e8e8e4",fontSize:13,color:"#666",lineHeight:1.7}}>If handling is necessary, support the full body from below. Never grab from above or restrain forcefully. Work at night when they are naturally active and more responsive. Their remarkable camouflage can make them very hard to find in the enclosure during the day — resist the urge to disturb them.</div>
        <WarnBox type="red" title="Tail drop risk">Like many geckos, Leaf-tails can drop their tail under extreme stress. The tail regrows but never matches the original leaf shape — the species' most distinctive feature is permanently altered. Minimise stress at all times.</WarnBox>
      </>}
      {tab === "licencing" && <LegalTab note="Southern Leaf-tailed Geckos are primarily available in NSW. Confirm availability in your state." states={[{ abbr: "NSW", cat: "Standard keeper licence", ok: true }, { abbr: "VIC", cat: "Check with authority", ok: true }, { abbr: "QLD", cat: "Standard keeper licence", ok: true }, { abbr: "SA", cat: "Check with authority", ok: true }, { abbr: "WA", cat: "Check with authority", ok: true }, { abbr: "TAS", cat: "TAS natives only", ok: false }, { abbr: "ACT", cat: "Check with authority", ok: true }, { abbr: "NT", cat: "Check with authority", ok: true }]} />}
    </>}
  />
);

// ─── Spiny-tailed Gecko page ──────────────────────────────────────
const SpinyTailGeckoPage = ({ onBack }) => (
  <SpeciesPage onBack={onBack} name="Northern Spiny-tailed Gecko" latin="Strophurus ciliaris" emoji="🦎"
    badges={[["Beginner friendly", C.greenPale, C.green], ["Australian native", C.bluePale, C.blue], ["Arboreal", C.goldLight, "#7a5a1e"]]}
    tabs={["overview","feeding","health & shedding","handling","licencing"]}
    tabContent={(tab) => <>
      {tab === "overview" && <>
        <p style={{fontSize:13,color:"#666",lineHeight:1.6,marginBottom:14}}>One of Australia's most spectacular geckos. Found across northern and central Australia in dry woodlands and spinifex grasslands. Their signature feature is a tail lined with prominent spines — and a remarkable defence mechanism: when threatened they can squirt a harmless but foul-smelling sticky fluid from glands in their tail. Arboreal and highly visible at night, making them fascinating display animals.</p>
        <SectionLabel mt={0}>Quick stats</SectionLabel>
        <StatGrid stats={[["📏","Adult size","12–16 cm"],["⏳","Lifespan","10–15 yrs"],["🏠","Min. enclosure","45 × 45 × 60 cm"],["💧","Humidity","30–50%"]]} />
        <WarnBox type="gold" title="Unique defence — tail fluid">Spiny-tailed Geckos can squirt a sticky, foul-smelling fluid from glands in their tail when threatened. This is harmless but can irritate eyes. Avoid sudden movements when handling and never approach them from directly above.</WarnBox>
        <SectionLabel>Temperature requirements</SectionLabel>
        <TempBar label="Warm side / basking" value="28–32°C" width="66%" color="#e05a2b"/>
        <TempBar label="Cool side" value="22–26°C" width="44%" color="#4a9e6b"/>
        <TempBar label="Overnight low" value="19–22°C" width="30%" color="#2b7ec0"/>
        <SectionLabel>Enclosure setup</SectionLabel>
        <div style={{background:C.cream,borderRadius:12,padding:"12px 14px",border:"0.5px solid #e8e8e4",fontSize:13,color:"#666",lineHeight:1.7}}>A tall enclosure with plenty of thin branches at varying heights — they are highly arboreal and spend most of their time on branches and twigs. Cork bark and textured back wall. Sandy substrate. Low UVB lighting recommended. Mist lightly 2–3 times per week — they prefer to drink from droplets rather than a bowl. Excellent ventilation is essential — avoid stagnant humid air.</div>
        <ShopBtn>🛒 Shop gecko supplies</ShopBtn>
        <ShopBtn secondary>Ask a question ↗</ShopBtn>
      </>}
      {tab === "feeding" && <>
        <p style={{fontSize:13,color:"#666",lineHeight:1.6,marginBottom:12}}>Insectivorous. Despite their slender build they have surprisingly large mouths and can take relatively large prey items. Feed at night when naturally active.</p>
        <div style={{background:C.cream,borderRadius:12,border:"0.5px solid #e8e8e4",padding:"0 14px"}}>
          <FoodItem icon="🦗" name="Crickets" detail="Staple feeder — gut load well" freq="Every 2–3 nights"/>
          <FoodItem icon="🦟" name="Woodies" detail="Excellent Australian feeder" freq="Every 2–3 nights"/>
          <FoodItem icon="🪲" name="Small mealworms" detail="Occasional treat" freq="Weekly"/>
          <FoodItem icon="🐛" name="Waxworms" detail="High-fat treat — very sparingly" freq="Occasionally"/>
        </div>
        <WarnBox type="gold" title="Feed 3–4 insects per session">These geckos have big appetites but overfeeding causes obesity. Offer 3–4 appropriately sized prey items every 2–3 nights for adults. Juveniles can be fed daily.</WarnBox>
        <ShopBtn>🛒 Shop feeders & supplements</ShopBtn>
      </>}
      {tab === "health & shedding" && <>
        <SectionLabel mt={0}>Common health issues</SectionLabel>
        <HealthItem title="Respiratory infection" detail="Caused by high humidity combined with poor ventilation. Keep humidity moderate and ensure excellent airflow. Signs include wheezing or mucus."/>
        <HealthItem title="Obesity" detail="Enthusiastic feeders that can overeat. Monitor body condition — a healthy gecko should have a firm, not swollen, body with no fat deposits behind the eyes."/>
        <HealthItem title="Egg binding (females)" detail="Gravid females need a suitable laying site — a container of moist sand or coconut coir with an access hole. If a female appears distended and restless, seek vet advice promptly."/>
        <HealthItem dot="#4a9e6b" title="Signs of good health" detail="Alert and active at night on branches, feeding readily, bright eyes, good body condition, clean spines on tail."/>
        <SnakeShedding animal="gecko" />
      </>}
      {tab === "handling" && <>
        <div style={{background:C.greenPale,borderRadius:12,padding:"12px 14px",marginBottom:12,border:`0.5px solid ${C.green}22`}}>
          <div style={{fontSize:12,fontWeight:700,color:C.green,marginBottom:6}}>HANDLING — LOW RISK BUT USE CAUTION</div>
          <div style={{fontSize:13,color:"#555",lineHeight:1.6}}>Northern Spiny-tailed Geckos are relatively calm but their primary defence (squirting tail fluid) can be activated by sudden movements or being grabbed from above. Handle gently and slowly, from below. Their small size means they are best enjoyed as display animals rather than handling pets.</div>
        </div>
        <div style={{background:C.cream,borderRadius:12,padding:"12px 14px",border:"0.5px solid #e8e8e4",fontSize:13,color:"#666",lineHeight:1.7}}>Handle at night when active. Support the full body. Avoid holding near the tail — this is where the defensive glands are located. If the gecko raises its tail in a curved position it is warning you. Short sessions only. Wash hands after handling.</div>
        <WarnBox type="gold" title="Tail fluid warning">If the gecko squirts fluid, avoid touching your eyes and wash the affected area immediately. The fluid is harmless but has an extremely unpleasant smell that can linger. Handle with care to avoid triggering this response.</WarnBox>
      </>}
      {tab === "licencing" && <LegalTab note="Northern Spiny-tailed Geckos are available from licensed breeders. Confirm Strophurus species availability in your state before purchasing." states={[{ abbr: "NSW", cat: "Standard keeper licence", ok: true }, { abbr: "VIC", cat: "Basic wildlife licence", ok: true }, { abbr: "QLD", cat: "Standard keeper licence", ok: true }, { abbr: "SA", cat: "Basic permit", ok: true }, { abbr: "WA", cat: "Standard licence", ok: true }, { abbr: "TAS", cat: "TAS natives only", ok: false }, { abbr: "ACT", cat: "Standard licence", ok: true }, { abbr: "NT", cat: "Check with authority", ok: true }]} />}
    </>}
  />
);

// ─── Golden-tailed Gecko page ─────────────────────────────────────
const GoldenTailGeckoPage = ({ onBack }) => (
  <SpeciesPage onBack={onBack} name="Golden-tailed Gecko" latin="Strophurus taenicauda" emoji="🦎"
    badges={[["Beginner friendly", C.greenPale, C.green], ["Australian native", C.bluePale, C.blue], ["Arboreal", C.goldLight, "#7a5a1e"]]}
    tabs={["overview","feeding","health & shedding","handling","licencing"]}
    tabContent={(tab) => <>
      {tab === "overview" && <>
        <p style={{fontSize:13,color:"#666",lineHeight:1.6,marginBottom:14}}>One of Australia's most beautiful geckos — their striking golden-orange tail with black markings is instantly recognisable and makes them highly sought after in the hobby. Found in dry woodlands and brigalow scrub of southern Queensland. Like all Strophurus, they possess the remarkable ability to squirt a defensive fluid from their tail. Arboreal, nocturnal, and endlessly fascinating to observe.</p>
        <SectionLabel mt={0}>Quick stats</SectionLabel>
        <StatGrid stats={[["📏","Adult size","10–12 cm"],["⏳","Lifespan","8–12 yrs"],["🏠","Min. enclosure","45 × 45 × 45 cm"],["💧","Humidity","30–45%"]]} />
        <WarnBox type="gold" title="State restrictions apply">Golden-tailed Geckos require an Advanced (Schedule 3) licence in Victoria, and a restricted licence in Queensland. Always verify your state requirements before purchasing.</WarnBox>
        <SectionLabel>Temperature requirements</SectionLabel>
        <TempBar label="Warm side" value="26–30°C" width="58%" color="#e05a2b"/>
        <TempBar label="Cool side" value="20–24°C" width="36%" color="#4a9e6b"/>
        <TempBar label="Overnight low" value="18–20°C" width="26%" color="#2b7ec0"/>
        <SectionLabel>Enclosure setup</SectionLabel>
        <div style={{background:C.cream,borderRadius:12,padding:"12px 14px",border:"0.5px solid #e8e8e4",fontSize:13,color:"#666",lineHeight:1.7}}>A 45×45×45cm or taller enclosure works well for 1–3 animals (one male with females). Fine sand substrate. A network of thin climbing branches — they are highly arboreal and sleep on exposed branches during the day, relying on camouflage. Low UVB lighting beneficial. Mist the enclosure 1–2 times per week — they drink from droplets. Provide a small moist hide or egg-laying container for breeding females.</div>
        <ShopBtn>🛒 Shop gecko supplies</ShopBtn>
        <ShopBtn secondary>Ask a question ↗</ShopBtn>
      </>}
      {tab === "feeding" && <>
        <p style={{fontSize:13,color:"#666",lineHeight:1.6,marginBottom:12}}>Insectivorous. Despite their small size they have impressive appetites and will take surprisingly large prey. Feed at night when naturally active.</p>
        <div style={{background:C.cream,borderRadius:12,border:"0.5px solid #e8e8e4",padding:"0 14px"}}>
          <FoodItem icon="🦗" name="Crickets" detail="Staple feeder — gut load well" freq="Every 2–3 nights"/>
          <FoodItem icon="🦟" name="Woodies" detail="Excellent Australian feeder" freq="Every 2–3 nights"/>
          <FoodItem icon="🪲" name="Small mealworms" detail="Occasional treat" freq="Weekly"/>
          <FoodItem icon="🐛" name="Waxworms" detail="High-fat treat — very sparingly" freq="Occasionally"/>
        </div>
        <WarnBox type="gold" title="Productive breeders — feed females well">Breeding females are prolific egg-layers, producing 4–6+ clutches per season. Gravid and breeding females need increased calcium supplementation and more frequent feeding to maintain body condition.</WarnBox>
        <ShopBtn>🛒 Shop feeders & supplements</ShopBtn>
      </>}
      {tab === "health & shedding" && <>
        <SectionLabel mt={0}>Common health issues</SectionLabel>
        <HealthItem title="Egg binding" detail="Breeding females can become egg-bound if not provided a suitable laying site or if calcium deficient. Always provide a small container of moist substrate for egg laying."/>
        <HealthItem title="Male aggression" detail="Males are territorial — never house two males together. One male can be kept with 2–4 females successfully."/>
        <HealthItem title="Respiratory infection" detail="From excessive humidity or poor ventilation. Keep humidity moderate and ensure good airflow."/>
        <HealthItem dot="#4a9e6b" title="Signs of good health" detail="Vivid golden-orange tail colouration, active at night on branches, feeding readily, alert bright eyes, firm body condition."/>
        <SnakeShedding animal="gecko" />
      </>}
      {tab === "handling" && <>
        <div style={{background:C.greenPale,borderRadius:12,padding:"12px 14px",marginBottom:12,border:`0.5px solid ${C.green}22`}}>
          <div style={{fontSize:12,fontWeight:700,color:C.green,marginBottom:6}}>HANDLING — CALM BUT FRAGILE</div>
          <div style={{fontSize:13,color:"#555",lineHeight:1.6}}>Golden-tailed Geckos are calm and generally tolerate brief handling well. Their small size makes them delicate — handle carefully and always over a soft surface. Like all Strophurus, they can squirt defensive fluid from the tail if stressed. Handle gently and avoid sudden movements.</div>
        </div>
        <div style={{background:C.cream,borderRadius:12,padding:"12px 14px",border:"0.5px solid #e8e8e4",fontSize:13,color:"#666",lineHeight:1.7}}>Handle at night when active. Support the full body. Short sessions only. Their remarkable golden tail is their most striking feature — never grab by the tail. Wash hands before and after handling.</div>
        <WarnBox type="gold" title="Tail fluid warning">Like all Strophurus, can squirt foul-smelling defensive fluid from the tail if threatened. Avoid eye contact with the fluid and wash immediately if it makes contact.</WarnBox>
      </>}
      {tab === "licencing" && <LegalTab note="Golden-tailed Geckos require an Advanced (Schedule 3) licence in Victoria and a restricted licence in QLD." states={[{ abbr: "NSW", cat: "Standard keeper licence", ok: true }, { abbr: "VIC", cat: "Advanced licence", ok: true }, { abbr: "QLD", cat: "Restricted — check DES", ok: true }, { abbr: "SA", cat: "Basic permit", ok: true }, { abbr: "WA", cat: "Standard licence", ok: true }, { abbr: "TAS", cat: "TAS natives only", ok: false }, { abbr: "ACT", cat: "Standard licence", ok: true }, { abbr: "NT", cat: "Check with authority", ok: true }]} />}
    </>}
  />
);


// ─── Northern Blue-tongue Skink page ─────────────────────────────
const NorthernBlueTonguePage = ({ onBack }) => (
  <SpeciesPage onBack={onBack} name="Northern Blue-tongue Skink" latin="Tiliqua scincoides intermedia" emoji="🦎"
    badges={[["Beginner friendly", C.greenPale, C.green], ["Australian native", C.bluePale, C.blue], ["Diurnal", C.goldLight, "#7a5a1e"]]}
    tabs={["overview","feeding","health & shedding","handling","licencing"]}
    tabContent={(tab) => <>
      {tab === "overview" && <>
        <p style={{fontSize:13,color:"#666",lineHeight:1.6,marginBottom:14}}>The largest of Australia's blue-tongue skinks. Found across northern Australia from Queensland through the NT to WA. Larger, faster, and often more defensive than the Eastern Blue-tongue — but equally rewarding when well socialised. Their paler colouration, longer limbs, and more slender build distinguish them from the Eastern subspecies. A stunning and impressive species.</p>
        <SectionLabel mt={0}>Quick stats</SectionLabel>
        <StatGrid stats={[["📏","Adult size","55–70 cm"],["⏳","Lifespan","15–25+ yrs"],["🏠","Min. enclosure","150 × 60 cm"],["💧","Humidity","40–60%"]]} />
        <SectionLabel>Temperature requirements</SectionLabel>
        <TempBar label="Basking spot" value="38–42°C" width="88%" color="#e05a2b"/>
        <TempBar label="Warm side" value="28–32°C" width="66%" color="#e0922b"/>
        <TempBar label="Cool side" value="22–26°C" width="44%" color="#4a9e6b"/>
        <TempBar label="Overnight low" value="18–22°C" width="28%" color="#2b7ec0"/>
        <WarnBox type="blue" title="UVB lighting strongly recommended">Northern Blue-tongues come from tropical and subtropical Australia where UVB exposure is intense. A T5 HO 10.0 UVB tube is strongly recommended for long-term health.</WarnBox>
        <SectionLabel>Enclosure setup</SectionLabel>
        <div style={{background:C.cream,borderRadius:12,padding:"12px 14px",border:"0.5px solid #e8e8e4",fontSize:13,color:"#666",lineHeight:1.7}}>A 150×60cm enclosure minimum for an adult — they are larger and more active than Eastern Blue-tongues and benefit from more space. Prioritise floor space over height. Coconut coir, topsoil mix, or reptile carpet substrate. Hides at both warm and cool ends. Fresh vegetables and protein offered in bowls. UVB tube running the full length of the enclosure.</div>
        <ShopBtn>🛒 Shop Blue-tongue supplies</ShopBtn>
        <ShopBtn secondary>Ask a question ↗</ShopBtn>
      </>}
      {tab === "feeding" && <>
        <p style={{fontSize:13,color:"#666",lineHeight:1.6,marginBottom:12}}>Omnivores with hearty appetites. The Northern Blue-tongue tends to be a more enthusiastic feeder than other subspecies. Rotate proteins, vegetables, and occasional fruit.</p>
        <div style={{background:C.cream,borderRadius:12,border:"0.5px solid #e8e8e4",padding:"0 14px"}}>
          <FoodItem icon="🍗" name="Lean chicken / turkey mince" detail="Low fat — avoid fatty cuts" freq="2–3× week"/>
          <FoodItem icon="🥚" name="Boiled or scrambled egg" detail="Excellent protein source" freq="1× week"/>
          <FoodItem icon="🐌" name="Snails / wood roaches (Woodies)" detail="Natural prey — eagerly taken" freq="Occasional"/>
          <FoodItem icon="🥬" name="Leafy greens" detail="Collard greens, endive, bok choy, kale" freq="Daily"/>
          <FoodItem icon="🥕" name="Root vegetables" detail="Carrot, pumpkin, sweet potato" freq="Several× week"/>
          <FoodItem icon="🍓" name="Fruit" detail="Small amounts as treats only" freq="Occasionally"/>
        </div>
        <WarnBox type="gold" title="Feeding schedule">Juveniles: feed daily. Adults: every 2–3 days. Remove uneaten food within a few hours. Northern Blue-tongues can be prone to obesity — keep protein lean and portions appropriate.</WarnBox>
        <ShopBtn>🛒 Shop supplements & feeders</ShopBtn>
      </>}
      {tab === "health & shedding" && <>
        <SectionLabel mt={0}>Common health issues</SectionLabel>
        <HealthItem title="Respiratory infection" detail="Caused by temperatures too low or humidity imbalance. Signs include wheezing, mucus, open-mouth breathing. Seek vet attention promptly."/>
        <HealthItem title="Obesity" detail="Very common in captivity. Northern Blue-tongues are enthusiastic feeders. Keep protein lean and ensure adequate space for movement."/>
        <HealthItem title="Mouth rot (stomatitis)" detail="Redness, swelling, or cheesy discharge around the gums. Check regularly during handling."/>
        <HealthItem title="Retained shed" detail="Particularly around toes and eyes. Soak in shallow warm water and gently assist if retained shed is present."/>
        <HealthItem dot="#4a9e6b" title="Signs of good health" detail="Alert and active during the day, regular feeding, smooth complete sheds, clear eyes, firm body condition, active tongue-flicking."/>
        <SnakeShedding animal="lizard"/>
      </>}
      {tab === "handling" && <>
        <div style={{background:C.goldLight,borderRadius:12,padding:"12px 14px",marginBottom:12,border:`0.5px solid #c8963c44`}}>
          <div style={{fontSize:12,fontWeight:700,color:"#7a5a1e",marginBottom:6}}>BITE RISK — LOW TO MEDIUM</div>
          <div style={{fontSize:13,color:"#555",lineHeight:1.6}}>Northern Blue-tongues can be more defensive than Eastern Blue-tongues, particularly as juveniles or unsocialised adults. Their bite is painless but can leave a bruise due to their strong jaw. With regular gentle handling they become very tame. Their large size makes them impressive and satisfying to handle.</div>
        </div>
        <div style={{background:C.cream,borderRadius:12,padding:"12px 14px",border:"0.5px solid #e8e8e4",fontSize:13,color:"#666",lineHeight:1.7}}>Support the full body when handling — they are heavy animals. Allow 2 weeks to settle before regular handling. Start with short 5–10 minute sessions and build gradually. Once tame they are calm and enjoy sitting on a warm lap. Wash hands before and after handling.</div>
      </>}
      {tab === "licencing" && <LegalTab note="Northern Blue-tongue Skinks require a standard keeper licence in most states. Must be purchased from a licensed breeder — wild collection is illegal." states={[{ abbr: "NSW", cat: "Standard keeper licence", ok: true }, { abbr: "VIC", cat: "Basic wildlife licence", ok: true }, { abbr: "QLD", cat: "Standard keeper licence", ok: true }, { abbr: "SA", cat: "Basic permit", ok: true }, { abbr: "WA", cat: "Standard licence", ok: true }, { abbr: "TAS", cat: "TAS natives only", ok: false }, { abbr: "ACT", cat: "Standard licence", ok: true }, { abbr: "NT", cat: "Check with authority", ok: true }]} />}
    </>}
  />
);

// ─── Blotched Blue-tongue Skink page ─────────────────────────────
const BlotchedBlueTonguePage = ({ onBack }) => (
  <SpeciesPage onBack={onBack} name="Blotched Blue-tongue Skink" latin="Tiliqua nigrolutea" emoji="🦎"
    badges={[["Beginner friendly", C.greenPale, C.green], ["Australian native", C.bluePale, C.blue], ["Cool climate", C.goldLight, "#7a5a1e"]]}
    tabs={["overview","feeding","health & shedding","handling","licencing"]}
    tabContent={(tab) => <>
      {tab === "overview" && <>
        <p style={{fontSize:13,color:"#666",lineHeight:1.6,marginBottom:14}}>A beautifully patterned blue-tongue found in the cool, high-altitude regions of south-eastern Australia — Victoria, NSW highlands, South Australia, and Tasmania. Their bold dark blotches on a pale background make them one of the most visually striking blue-tongues. Adapted to cooler conditions, they are robust, hardy, and surprisingly active for a cool-climate species.</p>
        <SectionLabel mt={0}>Quick stats</SectionLabel>
        <StatGrid stats={[["📏","Adult size","40–55 cm"],["⏳","Lifespan","15–20+ yrs"],["🏠","Min. enclosure","120 × 60 cm"],["💧","Humidity","40–60%"]]} />
        <WarnBox type="blue" title="Cool climate species — lower temperatures required">Blotched Blue-tongues are from alpine and sub-alpine environments. They require significantly cooler temperatures than other blue-tongue subspecies. Overheating is a serious risk — never allow temperatures to exceed 35°C.</WarnBox>
        <SectionLabel>Temperature requirements</SectionLabel>
        <TempBar label="Basking spot" value="32–35°C" width="72%" color="#e05a2b"/>
        <TempBar label="Warm side" value="24–28°C" width="50%" color="#e0922b"/>
        <TempBar label="Cool side" value="18–22°C" width="28%" color="#4a9e6b"/>
        <TempBar label="Overnight low" value="10–15°C" width="15%" color="#2b7ec0"/>
        <SectionLabel>Enclosure setup</SectionLabel>
        <div style={{background:C.cream,borderRadius:12,padding:"12px 14px",border:"0.5px solid #e8e8e4",fontSize:13,color:"#666",lineHeight:1.7}}>A 120×60cm enclosure for one adult. Ground-dwelling — prioritise floor space. Coconut coir, soil mix, or reptile carpet. Multiple hides at warm and cool ends. A robust basking spot but a large cool retreat. They naturally experience very cold winters and brumation is natural and healthy — allow temperatures to drop in winter. UVB lighting recommended.</div>
        <WarnBox type="gold" title="Brumation is natural">Blotched Blue-tongues naturally brumate (hibernate) during winter. Allow temperatures to cool down in autumn — they will reduce feeding and become less active. This is completely normal and important for their long-term health.</WarnBox>
        <ShopBtn>🛒 Shop Blue-tongue supplies</ShopBtn>
        <ShopBtn secondary>Ask a question ↗</ShopBtn>
      </>}
      {tab === "feeding" && <>
        <p style={{fontSize:13,color:"#666",lineHeight:1.6,marginBottom:12}}>Omnivores. Same broad diet as other blue-tongues, though they may have reduced appetite in cooler months — this is normal. Do not force-feed during winter slowdown.</p>
        <div style={{background:C.cream,borderRadius:12,border:"0.5px solid #e8e8e4",padding:"0 14px"}}>
          <FoodItem icon="🍗" name="Lean chicken / turkey mince" detail="Low fat protein staple" freq="2–3× week"/>
          <FoodItem icon="🥚" name="Boiled or scrambled egg" detail="Excellent protein source" freq="1× week"/>
          <FoodItem icon="🐌" name="Snails / wood roaches (Woodies)" detail="Natural prey items" freq="Occasional"/>
          <FoodItem icon="🥬" name="Leafy greens" detail="Collard greens, endive, bok choy" freq="Daily"/>
          <FoodItem icon="🥕" name="Root vegetables" detail="Carrot, pumpkin, sweet potato" freq="Several× week"/>
        </div>
        <WarnBox type="blue" title="Reduced feeding in winter is normal">Blotched Blue-tongues naturally eat less or stop eating entirely during cooler months. Do not be alarmed — maintain access to fresh water and allow them to follow their natural seasonal cycle.</WarnBox>
        <ShopBtn>🛒 Shop supplements & feeders</ShopBtn>
      </>}
      {tab === "health & shedding" && <>
        <SectionLabel mt={0}>Common health issues</SectionLabel>
        <HealthItem title="Overheating" detail="The most serious risk for this cool-climate species. Never allow temperatures to exceed 35°C anywhere in the enclosure. Always provide a large, cool retreat area."/>
        <HealthItem title="Respiratory infection" detail="Paradoxically, despite being a cool-climate species, sudden temperature drops or cold draughts can cause respiratory issues. Gradual seasonal cooling is fine; abrupt cold spells are not."/>
        <HealthItem title="Obesity" detail="They have hearty appetites but their slower cool-climate metabolism means they need less food than tropical blue-tongue subspecies. Feed conservatively."/>
        <HealthItem dot="#4a9e6b" title="Signs of good health" detail="Active during warmer parts of the day, alert tongue-flicking, regular feeding, smooth complete sheds, clear eyes, brumation in winter."/>
        <SnakeShedding animal="lizard"/>
      </>}
      {tab === "handling" && <>
        <div style={{background:C.greenPale,borderRadius:12,padding:"12px 14px",marginBottom:12,border:`0.5px solid ${C.green}22`}}>
          <div style={{fontSize:12,fontWeight:700,color:C.green,marginBottom:6}}>BITE RISK — LOW</div>
          <div style={{fontSize:13,color:"#555",lineHeight:1.6}}>Blotched Blue-tongues are generally calm and handleable, similar in temperament to Eastern Blue-tongues. Their cool-climate origin means they may be slower and less active than northern subspecies — they are often very easy to handle as a result. Regular gentle handling from a young age produces very tame adults.</div>
        </div>
        <div style={{background:C.cream,borderRadius:12,padding:"12px 14px",border:"0.5px solid #e8e8e4",fontSize:13,color:"#666",lineHeight:1.7}}>Support the full body. Allow 2 weeks to settle before regular handling. Do not handle during brumation — they need rest during this period. Handle during the warmest part of the day when they are most active.</div>
      </>}
      {tab === "licencing" && <LegalTab note="Blotched Blue-tongue Skinks require a standard keeper licence in most states. Commonly available from licensed breeders in VIC, NSW, SA, and TAS. Must be purchased from a licensed breeder." states={[{ abbr: "NSW", cat: "Standard keeper licence", ok: true }, { abbr: "VIC", cat: "Basic wildlife licence", ok: true }, { abbr: "QLD", cat: "Standard keeper licence", ok: true }, { abbr: "SA", cat: "Basic permit", ok: true }, { abbr: "WA", cat: "Standard licence", ok: true }, { abbr: "TAS", cat: "Standard licence", ok: true }, { abbr: "ACT", cat: "Standard licence", ok: true }, { abbr: "NT", cat: "Check with authority", ok: true }]} />}
    </>}
  />
);

// ─── Shingleback Lizard page ──────────────────────────────────────
const ShinglebackPage = ({ onBack }) => (
  <SpeciesPage onBack={onBack} name="Shingleback Lizard" latin="Tiliqua rugosa" emoji="🦎"
    badges={[["Intermediate", C.goldLight, "#7a5a1e"], ["Australian native", C.bluePale, C.blue], ["Monogamous", C.greenPale, C.green]]}
    tabs={["overview","feeding","health & shedding","handling","licencing"]}
    tabContent={(tab) => <>
      {tab === "overview" && <>
        <p style={{fontSize:13,color:"#666",lineHeight:1.6,marginBottom:14}}>One of Australia's most unique and beloved reptiles. Also known as the Bobtail, Stumpy-tail, Pinecone Lizard, and Two-headed Skink (their fat tail resembles their head as a defensive adaptation). Found across southern Australia from WA through SA to NSW. Famous for forming lifelong monogamous pair bonds — the same two individuals reunite each breeding season for decades. An extraordinary animal with genuine personality.</p>
        <WarnBox type="gold" title="Monogamous pair bonds">Shinglebacks are one of very few reptiles known to form long-term monogamous pair bonds. Partners return to each other year after year and have been documented together for over 20 years. If keeping a pair, they should stay together for life.</WarnBox>
        <SectionLabel mt={0}>Quick stats</SectionLabel>
        <StatGrid stats={[["📏","Adult size","30–45 cm"],["⏳","Lifespan","20–50+ yrs"],["🏠","Min. enclosure","120 × 60 cm"],["💧","Humidity","30–45%"]]} />
        <SectionLabel>Temperature requirements</SectionLabel>
        <TempBar label="Basking spot" value="35–40°C" width="84%" color="#e05a2b"/>
        <TempBar label="Warm side" value="26–30°C" width="58%" color="#e0922b"/>
        <TempBar label="Cool side" value="18–22°C" width="28%" color="#4a9e6b"/>
        <TempBar label="Overnight low" value="10–15°C" width="15%" color="#2b7ec0"/>
        <WarnBox type="blue" title="Brumation is natural and important">Shinglebacks naturally brumate in winter. This seasonal cycling is essential for their long-term health and reproductive success. Allow temperatures to cool and do not disturb during brumation periods.</WarnBox>
        <SectionLabel>Enclosure setup</SectionLabel>
        <div style={{background:C.cream,borderRadius:12,padding:"12px 14px",border:"0.5px solid #e8e8e4",fontSize:13,color:"#666",lineHeight:1.7}}>A 120×60cm enclosure minimum. Ground-dwelling — prioritise floor space. Sandy or rocky substrate to match their natural arid habitat. Multiple flat rock hides and bark pieces for shelter. Robust basking rock or branch directly under a heat lamp. UVB tube strongly recommended. A shallow water bowl — they drink regularly. Many keepers of Shinglebacks maintain outdoor enclosures in warmer months.</div>
        <ShopBtn>🛒 Shop lizard supplies</ShopBtn>
        <ShopBtn secondary>Ask a question ↗</ShopBtn>
      </>}
      {tab === "feeding" && <>
        <p style={{fontSize:13,color:"#666",lineHeight:1.6,marginBottom:12}}>Omnivores with a diet heavier in plant material than other blue-tongues. They naturally consume a wide variety of fruits, flowers, and vegetation alongside invertebrates. Variety is key.</p>
        <div style={{background:C.cream,borderRadius:12,border:"0.5px solid #e8e8e4",padding:"0 14px"}}>
          <FoodItem icon="🥬" name="Leafy greens & flowers" detail="Dandelion flowers, clover, leafy greens — they love flowers" freq="Daily"/>
          <FoodItem icon="🍓" name="Fruit" detail="Strawberries, apple, pear — more fruit than other blue-tongues" freq="Several× week"/>
          <FoodItem icon="🥕" name="Root vegetables" detail="Carrot, pumpkin, sweet potato" freq="Several× week"/>
          <FoodItem icon="🐌" name="Snails" detail="A natural favourite — shell provides calcium" freq="Weekly"/>
          <FoodItem icon="🍗" name="Lean chicken mince" detail="Small amounts of protein" freq="1–2× week"/>
          <FoodItem icon="🪱" name="Earthworms" detail="Natural prey — good calcium source" freq="Weekly"/>
        </div>
        <WarnBox type="gold" title="More plant-based than other blue-tongues">In the wild, Shinglebacks eat a diet that is predominantly plant material including flowers, fruits, and berries. Offer a wider variety of fruits and flowers than you would for Eastern or Northern Blue-tongues.</WarnBox>
        <WarnBox type="red" title="Avoid high-protein diets">Excessive animal protein causes kidney disease in Shinglebacks over time. Keep protein portions small and infrequent compared to their plant-based diet.</WarnBox>
        <ShopBtn>🛒 Shop supplements</ShopBtn>
      </>}
      {tab === "health & shedding" && <>
        <SectionLabel mt={0}>Common health issues</SectionLabel>
        <HealthItem title="Kidney disease" detail="Often caused by excessive dietary protein over many years. Feed a predominantly plant-based diet with small amounts of protein. Annual vet checks recommended for long-term health monitoring."/>
        <HealthItem title="Tick infestation" detail="Wild-caught Shinglebacks often carry ticks. Inspect any newly acquired animal thoroughly. Never collect from the wild."/>
        <HealthItem title="Respiratory infection" detail="From temperature extremes or sudden cold snaps. Maintain stable temperatures and allow gradual seasonal cooling."/>
        <HealthItem title="Metabolic Bone Disease" detail="From insufficient calcium or UVB. Dust food with calcium powder and provide UVB lighting."/>
        <HealthItem dot="#4a9e6b" title="Signs of good health" detail="Alert and active on warm days, regular feeding, complete sheds, clear bright eyes, firm body condition, active tongue-flicking, natural brumation in winter."/>
        <SectionLabel>Shedding</SectionLabel>
        <div style={{background:C.cream,borderRadius:12,padding:"12px 14px",border:"0.5px solid #e8e8e4",fontSize:13,color:"#666",lineHeight:1.7}}>Shinglebacks shed in large pieces rather than one complete shed like snakes. Their thick, rough scales mean shedding is less uniform. This is normal. Increase humidity slightly during shedding periods and provide rough surfaces to assist.</div>
      </>}
      {tab === "handling" && <>
        <div style={{background:C.greenPale,borderRadius:12,padding:"12px 14px",marginBottom:12,border:`0.5px solid ${C.green}22`}}>
          <div style={{fontSize:12,fontWeight:700,color:C.green,marginBottom:6}}>BITE RISK — LOW TO MEDIUM</div>
          <div style={{fontSize:13,color:"#555",lineHeight:1.6}}>Shinglebacks are generally calm but can be defensive when first encountered — they will open their vivid blue mouth wide and hiss as a threat display. This is bluffing behaviour. With regular gentle handling they become extremely tame and many develop genuine recognition of their keeper. Long-lived animals that build real bonds over time.</div>
        </div>
        <div style={{background:C.cream,borderRadius:12,padding:"12px 14px",border:"0.5px solid #e8e8e4",fontSize:13,color:"#666",lineHeight:1.7}}>Support the full body — their heavy build means they need full support. Their slow movement makes them easy to handle. Allow 2–3 weeks to settle before regular handling. Do not handle during brumation. Their blue tongue and gaping mouth display is impressive — enjoy it as part of their character.</div>
        <WarnBox type="gold" title="Long-term relationships">Shinglebacks kept for many years often become remarkably tame and will recognise their keeper. Their exceptional lifespan (20–50+ years) means a Shingleback you acquire today could be with you for the rest of your life.</WarnBox>
      </>}
      {tab === "licencing" && <LegalTab note="Shinglebacks require a standard keeper licence in most states. They are a WA native species and widely available in SA. Check availability carefully in your state before purchasing." states={[{ abbr: "NSW", cat: "Standard keeper licence", ok: true }, { abbr: "VIC", cat: "Basic wildlife licence", ok: true }, { abbr: "QLD", cat: "Standard keeper licence", ok: true }, { abbr: "SA", cat: "Basic permit", ok: true }, { abbr: "WA", cat: "Standard licence", ok: true }, { abbr: "TAS", cat: "TAS natives only", ok: false }, { abbr: "ACT", cat: "Standard licence", ok: true }, { abbr: "NT", cat: "Check with authority", ok: true }]} />}
    </>}
  />
);


// ─── Temperature & Heating page ───────────────────────────────────
const TempPage = ({ onBack }) => {
  const [tab, setTab] = useState("basics");
  const tabs = ["basics", "heat sources", "UVB", "night & winter"];
  return (
    <div style={{ flex: 1, overflowY: "auto" }}>
      <div style={{ background: C.green, padding: "calc(env(safe-area-inset-top, 0px) + 10px) 20px 0" }}>
        <button onClick={onBack} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.7)", fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, marginBottom: 16, fontFamily: "inherit" }}>‹ Back to care guides</button>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 14 }}>
          <div style={{ fontSize: 64, lineHeight: 1, marginBottom: -4 }}>🌡️</div>
          <div style={{ paddingBottom: 18 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.gold, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 4 }}>Care guide</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: "white", lineHeight: 1.2 }}>Temperature & Heating</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", marginTop: 3 }}>Basking zones, gradients & UVB</div>
          </div>
        </div>
        <div style={{ display: "flex", borderBottom: "0.5px solid rgba(255,255,255,0.2)", margin: "0 -20px", padding: "0 20px", gap: 4, overflowX: "auto", scrollbarWidth: "none" }}>
          {tabs.map(t => <button key={t} onClick={() => setTab(t)} style={{ background: "none", border: "none", borderBottom: tab === t ? "2px solid #fff" : "2px solid transparent", color: tab === t ? "white" : "rgba(255,255,255,0.55)", fontSize: 12, fontWeight: 700, padding: "8px 12px", cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap", marginBottom: -1, textTransform: "capitalize" }}>{t}</button>)}
        </div>
      </div>
      <div style={{ background: "white", padding: "16px 18px 40px" }}>
        {tab === "basics" && <>
          <p style={{ fontSize: 13, color: "#666", lineHeight: 1.6, marginBottom: 14 }}>Reptiles are ectothermic — they rely on external heat sources to regulate their body temperature. Getting temperatures right is the single most important factor in keeping reptiles healthy. Too cold and they cannot digest food, fight disease, or behave normally. Too hot and they suffer heat stress or death.</p>
          <SectionLabel mt={0}>The thermal gradient — essential concept</SectionLabel>
          <div style={{ background: C.cream, borderRadius: 12, padding: "12px 14px", border: "0.5px solid #e8e8e4", marginBottom: 12, fontSize: 13, color: "#666", lineHeight: 1.7 }}>Every reptile enclosure must have a temperature gradient — a warm end and a cool end. Your reptile moves between these zones to regulate its own body temperature naturally. Never heat the entire enclosure to one temperature — this removes the reptile's ability to thermoregulate and causes chronic stress.</div>
          <TempBar label="Hot spot / basking zone" value="35–45°C (species dependent)" width="90%" color="#e05a2b"/>
          <TempBar label="Warm side ambient" value="28–32°C" width="66%" color="#e0922b"/>
          <TempBar label="Cool side ambient" value="22–26°C" width="44%" color="#4a9e6b"/>
          <TempBar label="Overnight low" value="16–22°C (species dependent)" width="28%" color="#2b7ec0"/>
          <WarnBox type="red" title="Always use a thermostat">Any heat source — heat mat, heat lamp, ceramic emitter — must be connected to a thermostat. Uncontrolled heat sources are a leading cause of reptile deaths. This is non-negotiable.</WarnBox>
          <SectionLabel>How to measure temperature</SectionLabel>
          {[
            ["Digital thermometer with probe", "Most accurate. Place the probe at reptile body height at the basking spot and cool end. Essential."],
            ["Infrared temperature gun", "Excellent for quickly checking surface temperatures. Point and shoot at basking rocks, branches, substrate. Great for spot-checking."],
            ["Stick-on dial thermometers", "The least accurate option. Often misread and placed incorrectly. Avoid relying on these alone."],
          ].map(([name, desc]) => (
            <div key={name} style={{ background: C.cream, borderRadius: 10, padding: "10px 12px", marginBottom: 8, border: "0.5px solid #e8e8e4" }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 3 }}>{name}</div>
              <div style={{ fontSize: 12, color: "#666", lineHeight: 1.5 }}>{desc}</div>
            </div>
          ))}
        </>}
        {tab === "heat sources" && <>
          <p style={{ fontSize: 13, color: "#666", lineHeight: 1.6, marginBottom: 14 }}>Different heat sources suit different species and setups. Most keepers use a combination. Always connect to a thermostat.</p>
          {[
            ["☀️", "Basking lamp (incandescent/halogen)", "The most natural heat source — mimics sunlight. Creates a focused hot spot above a basking rock or branch. Best for diurnal species like bearded dragons, blue-tongues, and water dragons. Available in various wattages — choose based on enclosure size and required temperature.", "Best for: Lizards & dragons"],
            ["🔥", "Ceramic Heat Emitter (CHE)", "Produces heat without light — useful for supplemental overnight heat or species that don't need bright basking spots. Does not provide UVB. Often used with a dimmer thermostat.", "Best for: Nocturnal species, overnight heat"],
            ["🟫", "Under-tank heat mat (UTH)", "Provides belly heat — important for geckos and snakes that thermoregulate from below. Must be used with a thermostat. Never cover with thick substrate — insulation causes overheating. Place on one side only.", "Best for: Geckos, hatchling snakes"],
            ["💡", "Deep heat projector (DHP)", "A newer technology that penetrates deeper into tissue than standard heat lamps, more closely mimicking solar radiation. Excellent for larger pythons and monitors. Requires a dimmer thermostat.", "Best for: Large pythons, monitors"],
            ["🌿", "Radiant heat panel", "Mounts to the ceiling of the enclosure. Provides ambient warmth from above without a focused hot spot. Good for tropical species needing warm ambient temperatures.", "Best for: Tropical species, rainforest setups"],
          ].map(([icon, name, desc, best]) => (
            <div key={name} style={{ background: C.cream, borderRadius: 12, padding: "13px 14px", marginBottom: 10, border: "0.5px solid #e8e8e4" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                <span style={{ fontSize: 24 }}>{icon}</span>
                <div style={{ fontSize: 14, fontWeight: 700 }}>{name}</div>
              </div>
              <div style={{ fontSize: 12, color: "#666", lineHeight: 1.6, marginBottom: 6 }}>{desc}</div>
              <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 8, background: C.greenPale, color: C.green }}>{best}</span>
            </div>
          ))}
          <WarnBox type="red" title="Thermostat types matter">Use a ON/OFF thermostat for heat mats. Use a DIMMING thermostat for basking lamps and DHPs. Using the wrong type can damage equipment and create temperature spikes.</WarnBox>
        </>}
        {tab === "UVB" && <>
          <p style={{ fontSize: 13, color: "#666", lineHeight: 1.6, marginBottom: 14 }}>UVB radiation allows reptiles to synthesise Vitamin D3 in their skin, which is essential for calcium absorption. Without adequate UVB, diurnal reptiles develop Metabolic Bone Disease (MBD) — a serious, often fatal condition.</p>
          <SectionLabel mt={0}>Do all reptiles need UVB?</SectionLabel>
          {[
            ["Diurnal lizards & dragons", "YES — essential", "Bearded Dragons, Blue-tongues, Water Dragons, Frilled-neck Lizards. These species bask in direct sunlight in the wild. T5 HO 10.0 or 12% UVB tube required.", C.greenPale, C.green],
            ["Diurnal pythons", "STRONGLY RECOMMENDED", "Carpet Pythons, Green Tree Pythons, Womas bask in dappled sunlight. Low-level UVB (T5 HO 6.0) strongly benefits long-term health.", C.goldLight, "#7a5a1e"],
            ["Nocturnal geckos", "BENEFICIAL", "Despite being nocturnal, research shows geckos benefit from low-level UVB. A T5 HO 2.0 or 6.0 at the top of the enclosure is recommended.", C.goldLight, "#7a5a1e"],
            ["Turtles", "YES — essential", "Turtles require UVB over their basking platform. T5 HO 10.0 recommended.", C.greenPale, C.green],
          ].map(([species, req, detail, bg, col]) => (
            <div key={species} style={{ background: bg, borderRadius: 12, padding: "12px 14px", marginBottom: 10, border: `0.5px solid ${col}33` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{species}</div>
                <span style={{ fontSize: 10, fontWeight: 700, color: col }}>{req}</span>
              </div>
              <div style={{ fontSize: 12, color: "#555", lineHeight: 1.5 }}>{detail}</div>
            </div>
          ))}
          <WarnBox type="red" title="Replace UVB tubes every 12 months">UVB output degrades significantly before the tube stops producing visible light. Replace every 6–12 months even if it still glows. Mount inside the enclosure, not on top of mesh — glass and mesh filter UVB significantly.</WarnBox>
          <WarnBox type="gold" title="Ferguson zones">Different species need different UVB intensities based on their natural habitat. Reptiles from open desert environments need higher UVI than forest species. Always research the specific UVI requirements for your species.</WarnBox>
        </>}
        {tab === "night & winter" && <>
          <SectionLabel mt={0}>Overnight temperatures</SectionLabel>
          <div style={{ background: C.cream, borderRadius: 12, padding: "12px 14px", border: "0.5px solid #e8e8e4", fontSize: 13, color: "#666", lineHeight: 1.7, marginBottom: 12 }}>Most Australian reptiles tolerate and benefit from a natural temperature drop at night. Turn off basking lamps at night — a ceramic heat emitter or panel heater on a thermostat can maintain a minimum overnight temperature if your home gets cold. Tropical species need warmer nights than cool-climate species.</div>
          {[["Tropical species (northern Australia)", "Min 22–24°C overnight"], ["Temperate species (eastern Australia)", "Min 16–20°C overnight"], ["Cool-climate species (alpine/southern)", "Min 10–15°C overnight — natural cooling beneficial"]].map(([sp, temp]) => (
            <div key={sp} style={{ background: C.cream, borderRadius: 10, padding: "10px 12px", marginBottom: 8, border: "0.5px solid #e8e8e4", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontSize: 12, color: "#555", flex: 1 }}>{sp}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.green }}>{temp}</div>
            </div>
          ))}
          <SectionLabel>Winter & brumation</SectionLabel>
          <div style={{ background: C.cream, borderRadius: 12, padding: "12px 14px", border: "0.5px solid #e8e8e4", fontSize: 13, color: "#666", lineHeight: 1.7, marginBottom: 12 }}>Many Australian reptiles naturally brumate (a reptile form of hibernation) during winter. Reduced temperatures, shorter light cycles, and decreased feeding are all normal seasonal behaviours. Do not force-feed brumating reptiles. Allow them to follow their natural seasonal rhythm — this is important for long-term health and breeding success.</div>
          <WarnBox type="gold" title="Vet check before brumation">A health check before brumation is recommended — a sick or underweight reptile should not brumate. Ensure the animal has had a final bowel movement before temperatures drop significantly.</WarnBox>
        </>}
      </div>
    </div>
  );
};

// ─── Feeding & Nutrition page ─────────────────────────────────────
const FeedingNutritionPage = ({ onBack }) => {
  const [tab, setTab] = useState("basics");
  const tabs = ["basics", "by species", "supplements", "problems"];
  return (
    <div style={{ flex: 1, overflowY: "auto" }}>
      <div style={{ background: C.green, padding: "calc(env(safe-area-inset-top, 0px) + 10px) 20px 0" }}>
        <button onClick={onBack} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.7)", fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, marginBottom: 16, fontFamily: "inherit" }}>‹ Back to care guides</button>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 14 }}>
          <div style={{ fontSize: 64, lineHeight: 1, marginBottom: -4 }}>🦗</div>
          <div style={{ paddingBottom: 18 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.gold, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 4 }}>Care guide</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: "white", lineHeight: 1.2 }}>Feeding & Nutrition</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", marginTop: 3 }}>Diet, supplements & frequency</div>
          </div>
        </div>
        <div style={{ display: "flex", borderBottom: "0.5px solid rgba(255,255,255,0.2)", margin: "0 -20px", padding: "0 20px", gap: 4, overflowX: "auto", scrollbarWidth: "none" }}>
          {tabs.map(t => <button key={t} onClick={() => setTab(t)} style={{ background: "none", border: "none", borderBottom: tab === t ? "2px solid #fff" : "2px solid transparent", color: tab === t ? "white" : "rgba(255,255,255,0.55)", fontSize: 12, fontWeight: 700, padding: "8px 12px", cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap", marginBottom: -1, textTransform: "capitalize" }}>{t}</button>)}
        </div>
      </div>
      <div style={{ background: "white", padding: "16px 18px 40px" }}>
        {tab === "basics" && <>
          <p style={{ fontSize: 13, color: "#666", lineHeight: 1.6, marginBottom: 14 }}>Getting nutrition right is critical for long-term health. Australian reptiles fall into three broad dietary categories — insectivores, carnivores, and omnivores. Understanding which category your reptile belongs to and how that changes with age is fundamental to keeping them healthy.</p>
          {[
            ["🦗", "Insectivores", "Feed exclusively on insects. Geckos and most small lizards. Require a variety of live insects gut-loaded and dusted with supplements. Variety is key — no single feeder insect provides complete nutrition.", C.greenPale],
            ["🐭", "Carnivores", "Feed on vertebrate prey. All pythons and large snakes. Rodents form the basis of the captive diet. Always feed pre-killed or frozen/thawed — never live prey.", C.redPale],
            ["🥗", "Omnivores", "Eat both animal protein and plant matter. Blue-tongue skinks, bearded dragons, and many other lizards. Diet varies significantly with age — juveniles need more protein, adults more vegetables.", C.goldLight],
          ].map(([icon, name, desc, bg]) => (
            <div key={name} style={{ background: bg, borderRadius: 12, padding: "13px 14px", marginBottom: 10, border: "0.5px solid #e8e8e4" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                <span style={{ fontSize: 26 }}>{icon}</span>
                <div style={{ fontSize: 14, fontWeight: 700 }}>{name}</div>
              </div>
              <div style={{ fontSize: 12, color: "#555", lineHeight: 1.6 }}>{desc}</div>
            </div>
          ))}
          <SectionLabel>Feeding frequency by age</SectionLabel>
          {[
            ["Hatchlings (0–3 months)", "Daily or every second day"],
            ["Juveniles (3–12 months)", "Every 1–2 days"],
            ["Sub-adults (1–2 years)", "Every 2–3 days"],
            ["Adults (2+ years)", "Every 3–7 days depending on species"],
          ].map(([age, freq]) => (
            <div key={age} style={{ background: C.cream, borderRadius: 10, padding: "10px 12px", marginBottom: 8, border: "0.5px solid #e8e8e4", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontSize: 12, color: "#555" }}>{age}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.green }}>{freq}</div>
            </div>
          ))}
          <WarnBox type="gold" title="Never feed immediately after handling">Wait at least 24 hours after handling before feeding. Feeding stressed reptiles causes regurgitation. Similarly, do not handle for 48 hours after a feed.</WarnBox>
        </>}
        {tab === "by species" && <>
          {[
            ["🦎 Bearded Dragons / Blue-tongue Skinks", "Omnivores", [["Juveniles","70% insects, 30% vegetables — high protein for growth"], ["Adults","30% insects, 70% vegetables — more plant-based as they mature"], ["Avoid","Spinach, avocado, citrus, wild-caught insects, iceberg lettuce"]]],
            ["🐍 Pythons & large snakes", "Carnivores", [["Prey size","No wider than the widest point of the snake's body"], ["Prey type","Mice and rats — appropriately sized for the snake. See Feeder Guide for stage details"], ["Frequency","Every 5–14 days depending on species and age — less often for large adults"]]],
            ["🦎 Geckos", "Insectivores", [["Feeder variety","Wood roaches (Woodies), crickets, BSFL — rotate regularly for best nutrition"], ["Feeding time","Always at night when naturally active — never during daylight hours"], ["Prey size","No larger than the space between the gecko's eyes"]]],
            ["🐢 Turtles", "Carnivores / Omnivores", [["Feed in water","Turtles cannot swallow without water — always feed in the tank"], ["Diet","Whole feeder fish, prawns, earthworms, quality turtle pellets"], ["Remove uneaten food","Within 30 minutes — uneaten food degrades water quality rapidly"]]],
          ].map(([title, type, items]) => (
            <div key={title} style={{ background: C.cream, borderRadius: 12, padding: "13px 14px", marginBottom: 12, border: "0.5px solid #e8e8e4" }}>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{title}</div>
              <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 8, background: C.greenPale, color: C.green, marginBottom: 10, display: "inline-block" }}>{type}</span>
              {items.map(([label, detail]) => (
                <div key={label} style={{ marginTop: 8, paddingTop: 8, borderTop: "0.5px solid #eee" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: C.green, marginBottom: 2 }}>{label}</div>
                  <div style={{ fontSize: 12, color: "#666", lineHeight: 1.5 }}>{detail}</div>
                </div>
              ))}
            </div>
          ))}
        </>}
        {tab === "supplements" && <>
          <p style={{ fontSize: 13, color: "#666", lineHeight: 1.6, marginBottom: 14 }}>Feeder insects alone are nutritionally incomplete. Supplementation bridges the gap. See the Feeder Guide for full details — this is a quick reference summary.</p>
          {[
            ["Calcium + D3", "Critical", "Dust all insects before every feed for juveniles. Every other feed for adults. D3 aids calcium absorption. Essential for bone health and preventing MBD.", C.redPale, C.red],
            ["Calcium without D3", "For UVB keepers", "Use this if your reptile has strong UVB lighting — they synthesise D3 naturally from UV. Alternate with D3 version once or twice per month.", C.bluePale, C.blue],
            ["Multivitamin powder", "Weekly", "Provides vitamins A, E and other micronutrients. Use 1–2 times per week — not every feed. Over-supplementation of vitamins can be harmful.", C.goldLight, "#7a5a1e"],
            ["Gut loading feeders", "Always", "Feed feeder insects nutritious food 24–48 hours before feeding them to your reptile. See Feeder Guide for best gut-loading foods.", C.greenPale, C.green],
          ].map(([name, freq, desc, bg, col]) => (
            <div key={name} style={{ background: bg, borderRadius: 12, padding: "12px 14px", marginBottom: 10, border: `0.5px solid ${col}33` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{name}</div>
                <span style={{ fontSize: 10, fontWeight: 700, color: col }}>{freq}</span>
              </div>
              <div style={{ fontSize: 12, color: "#555", lineHeight: 1.5 }}>{desc}</div>
            </div>
          ))}
        </>}
        {tab === "problems" && <>
          <SectionLabel mt={0}>Common feeding problems</SectionLabel>
          {[
            ["Refusing food", "Most common cause is husbandry — check temperatures first. Also consider: shedding cycle, breeding season, illness, stress from handling or enclosure changes. A healthy reptile not eating for 1–2 weeks is usually not an emergency. A reptile losing weight while refusing food needs a vet."],
            ["Regurgitation", "Caused by handling too soon after feeding, temperatures too low, prey too large, or illness. Fast for 2–3 weeks before attempting to re-feed. Offer a smaller prey item at a warmer temperature."],
            ["Obesity", "Very common in captivity. Captive reptiles move less and are fed more than wild animals. Reduce feeding frequency and prey size. Ensure adequate enclosure size for movement. Obesity causes serious long-term health problems."],
            ["Prey too large", "The single most common husbandry mistake. Prey wider than the reptile's body causes regurgitation, impaction, and can be fatal. When in doubt, go smaller."],
            ["Only eating one food", "Common with snakes that fixate on one prey type. Offer variety from a young age. Scenting new prey with familiar prey can help transition fussy feeders."],
          ].map(([title, detail]) => (
            <HealthItem key={title} title={title} detail={detail} />
          ))}
        </>}
      </div>
    </div>
  );
};

// ─── Handling & Socialising page ──────────────────────────────────
const HandlingPage = ({ onBack }) => {
  const [tab, setTab] = useState("getting started");
  const tabs = ["getting started", "technique", "reading behaviour", "safety"];
  return (
    <div style={{ flex: 1, overflowY: "auto" }}>
      <div style={{ background: C.green, padding: "calc(env(safe-area-inset-top, 0px) + 10px) 20px 0" }}>
        <button onClick={onBack} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.7)", fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, marginBottom: 16, fontFamily: "inherit" }}>‹ Back to care guides</button>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 14 }}>
          <div style={{ fontSize: 64, lineHeight: 1, marginBottom: -4 }}>🤲</div>
          <div style={{ paddingBottom: 18 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.gold, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 4 }}>Care guide</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: "white", lineHeight: 1.2 }}>Handling & Socialising</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", marginTop: 3 }}>Building trust & safe interaction</div>
          </div>
        </div>
        <div style={{ display: "flex", borderBottom: "0.5px solid rgba(255,255,255,0.2)", margin: "0 -20px", padding: "0 20px", gap: 4, overflowX: "auto", scrollbarWidth: "none" }}>
          {tabs.map(t => <button key={t} onClick={() => setTab(t)} style={{ background: "none", border: "none", borderBottom: tab === t ? "2px solid #fff" : "2px solid transparent", color: tab === t ? "white" : "rgba(255,255,255,0.55)", fontSize: 12, fontWeight: 700, padding: "8px 12px", cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap", marginBottom: -1, textTransform: "capitalize" }}>{t}</button>)}
        </div>
      </div>
      <div style={{ background: "white", padding: "16px 18px 40px" }}>
        {tab === "getting started" && <>
          <p style={{ fontSize: 13, color: "#666", lineHeight: 1.6, marginBottom: 14 }}>Handling builds trust over time. Patience and consistency are far more effective than rushing the process. A reptile that is handled correctly from a young age will be calmer and more confident throughout its life.</p>
          <WarnBox type="red" title="Allow settling time first">Every new reptile needs time to adjust to its new home before handling begins. Give your reptile at least 1–2 weeks (longer for shy or wild-caught species) with no handling — just food, water, and peace.</WarnBox>
          <SectionLabel>Building up gradually</SectionLabel>
          {[
            ["Week 1–2", "No handling. Allow the reptile to adjust to sights, sounds, and smells of its new environment. Just observe."],
            ["Week 3–4", "Begin very short sessions — 2–5 minutes. Let the reptile walk onto your hand rather than being grabbed. End on a calm note."],
            ["Month 2", "Gradually extend sessions to 10–15 minutes. Handle in a calm environment away from other pets and loud noises."],
            ["Month 3+", "Regular daily or every-other-day handling. Sessions can extend to 20–30 minutes for most species. Always watch for stress signals."],
          ].map(([time, detail]) => (
            <div key={time} style={{ background: C.cream, borderRadius: 10, padding: "10px 12px", marginBottom: 8, border: "0.5px solid #e8e8e4" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.green, marginBottom: 3 }}>{time}</div>
              <div style={{ fontSize: 12, color: "#666", lineHeight: 1.5 }}>{detail}</div>
            </div>
          ))}
          <WarnBox type="gold" title="Never handle these times">Never handle within 48 hours of feeding. Never handle during shedding. Never handle a sick reptile. Never handle when the reptile is in threat display. Never handle when temperatures are too cold — reptiles are sluggish and unable to regulate stress responses.</WarnBox>
        </>}
        {tab === "technique" && <>
          <SectionLabel mt={0}>General technique</SectionLabel>
          <div style={{ background: C.cream, borderRadius: 12, padding: "12px 14px", border: "0.5px solid #e8e8e4", fontSize: 13, color: "#666", lineHeight: 1.7, marginBottom: 12 }}>Always approach slowly and from the side — never from directly above, which mimics a predator attack. Support the full body at all times. Let the reptile walk onto your hand rather than grabbing. Move slowly and deliberately. If the animal tries to escape, guide it gently — don't grip tightly.</div>
          {[
            ["🦎 Lizards & dragons", "Support the full body including the tail. Place one hand under the chest, the other supporting the hindquarters and tail. Never pick up by the tail — many species can drop their tail as a stress response."],
            ["🐍 Snakes", "Support multiple points along the body. Never restrain the head unless medically necessary. Let the snake move between your hands in a flowing figure-8 motion. Do not dangle from one point."],
            ["🐢 Turtles", "Hold at the sides of the shell — not the legs or neck. Be aware of the reach of the neck, especially Long-necked Turtles which can bite. Keep sessions brief and return to water promptly."],
            ["🦎 Geckos", "Handle at night when active. Support the full body — never grab. Handle close to a surface in case they jump. Very short sessions only for delicate species."],
          ].map(([title, detail]) => (
            <div key={title} style={{ background: C.cream, borderRadius: 12, padding: "12px 14px", marginBottom: 10, border: "0.5px solid #e8e8e4" }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>{title}</div>
              <div style={{ fontSize: 12, color: "#666", lineHeight: 1.6 }}>{detail}</div>
            </div>
          ))}
        </>}
        {tab === "reading behaviour" && <>
          <p style={{ fontSize: 13, color: "#666", lineHeight: 1.6, marginBottom: 14 }}>Learning to read your reptile's body language is one of the most important handling skills. Respecting stress signals prevents bites and builds trust faster.</p>
          <SectionLabel mt={0}>Signs of stress — end the session</SectionLabel>
          {[
            ["Trying to escape constantly", "The animal wants to return to its enclosure. End the session."],
            ["Hissing or puffing up", "Clear warning — the animal feels threatened."],
            ["Gaping mouth / open mouth breathing", "Defensive warning display — particularly in lizards and pythons."],
            ["Beard darkening (Bearded Dragons)", "Stress or irritability. Give the animal a break."],
            ["Musking (turtles, snakes)", "Releasing foul-smelling fluid — a stress response. Return to enclosure."],
            ["Tail wagging rapidly (lizards)", "An agitation or warning signal in many species."],
          ].map(([sign, detail]) => (
            <div key={sign} style={{ background: "#fce8e8", borderRadius: 10, padding: "10px 12px", marginBottom: 8, border: "0.5px solid #8b202033" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.red, marginBottom: 2 }}>{sign}</div>
              <div style={{ fontSize: 12, color: "#555" }}>{detail}</div>
            </div>
          ))}
          <SectionLabel>Signs of comfort — continue</SectionLabel>
          {[
            ["Resting calmly on hand", "Relaxed and comfortable."],
            ["Tongue flicking (lizards/snakes)", "Normal exploratory behaviour — they are curious, not stressed."],
            ["Eyes open, alert but not darting", "Calm and aware."],
            ["Moving slowly and deliberately", "Confident and relaxed movement."],
          ].map(([sign, detail]) => (
            <div key={sign} style={{ background: C.greenPale, borderRadius: 10, padding: "10px 12px", marginBottom: 8, border: `0.5px solid ${C.green}33` }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.green, marginBottom: 2 }}>{sign}</div>
              <div style={{ fontSize: 12, color: "#555" }}>{detail}</div>
            </div>
          ))}
        </>}
        {tab === "safety" && <>
          <SectionLabel mt={0}>Hygiene — always</SectionLabel>
          <div style={{ background: C.cream, borderRadius: 12, padding: "12px 14px", border: "0.5px solid #e8e8e4", fontSize: 13, color: "#666", lineHeight: 1.7, marginBottom: 12 }}>Always wash hands with soap and water before and after handling any reptile. All reptiles can carry Salmonella — this is manageable with good hygiene but should never be ignored. Supervise children carefully and ensure they wash hands immediately after handling.</div>
          <WarnBox type="red" title="If you are bitten">Most reptile bites are minor. Wash the wound thoroughly with soap and water. Apply antiseptic. Seek medical advice if the wound is deep, if you are bitten by a large python (bites from large pythons require proper wound care), or if any signs of infection develop. Do NOT jerk away when bitten — this causes more tissue damage. Stay calm and gently support the animal until it releases.</WarnBox>
          <SectionLabel>Children and reptiles</SectionLabel>
          <div style={{ background: C.cream, borderRadius: 12, padding: "12px 14px", border: "0.5px solid #e8e8e4", fontSize: 13, color: "#666", lineHeight: 1.7 }}>Children can have wonderful interactions with reptiles under proper adult supervision. Beginner species like Central Bearded Dragons, Eastern Blue-tongue Skinks, and Children's Pythons are ideal for families. Always supervise. Ensure hand washing after every interaction. Teach children to be calm and gentle — sudden movements stress reptiles and increase bite risk.</div>
        </>}
      </div>
    </div>
  );
};

// ─── Health & Illness page ────────────────────────────────────────
const HealthPage = ({ onBack }) => {
  const [tab, setTab] = useState("warning signs");
  const tabs = ["warning signs", "common illness", "finding a vet", "quarantine"];
  return (
    <div style={{ flex: 1, overflowY: "auto" }}>
      <div style={{ background: C.green, padding: "calc(env(safe-area-inset-top, 0px) + 10px) 20px 0" }}>
        <button onClick={onBack} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.7)", fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, marginBottom: 16, fontFamily: "inherit" }}>‹ Back to care guides</button>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 14 }}>
          <div style={{ fontSize: 64, lineHeight: 1, marginBottom: -4 }}>🩺</div>
          <div style={{ paddingBottom: 18 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.gold, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 4 }}>Care guide</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: "white", lineHeight: 1.2 }}>Health & Illness</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", marginTop: 3 }}>Warning signs & when to see a vet</div>
          </div>
        </div>
        <div style={{ display: "flex", borderBottom: "0.5px solid rgba(255,255,255,0.2)", margin: "0 -20px", padding: "0 20px", gap: 4, overflowX: "auto", scrollbarWidth: "none" }}>
          {tabs.map(t => <button key={t} onClick={() => setTab(t)} style={{ background: "none", border: "none", borderBottom: tab === t ? "2px solid #fff" : "2px solid transparent", color: tab === t ? "white" : "rgba(255,255,255,0.55)", fontSize: 12, fontWeight: 700, padding: "8px 12px", cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap", marginBottom: -1, textTransform: "capitalize" }}>{t}</button>)}
        </div>
      </div>
      <div style={{ background: "white", padding: "16px 18px 40px" }}>
        {tab === "warning signs" && <>
          <p style={{ fontSize: 13, color: "#666", lineHeight: 1.6, marginBottom: 14 }}>Reptiles are prey animals and instinctively hide illness. By the time signs are obvious, a reptile is often seriously ill. Daily observation is key — know what is normal for your animal so you notice changes early.</p>
          <SectionLabel mt={0}>Signs requiring immediate vet attention</SectionLabel>
          {[
            ["Open-mouth breathing / wheezing", "Indicates respiratory infection or serious distress. Urgent."],
            ["Rapid unexplained weight loss", "Many serious conditions cause weight loss. Weigh regularly and track."],
            ["Discharge from eyes, nose or mouth", "Bacterial infection — requires treatment."],
            ["Paralysis or inability to move normally", "Neurological issue — can indicate ADV, IBD, or other serious conditions."],
            ["Bloating or unusual lumps", "May indicate infection, abscess, retained eggs, or tumour."],
            ["Bleeding from any orifice", "Urgent — seek vet care immediately."],
            ["Prolapse (tissue protruding from vent)", "Urgent emergency — keep moist with clean damp cloth and get to vet immediately."],
          ].map(([sign, detail]) => (
            <div key={sign} style={{ background: "#fce8e8", borderRadius: 10, padding: "10px 12px", marginBottom: 8, border: "0.5px solid #8b202033" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.red, marginBottom: 2 }}>{sign}</div>
              <div style={{ fontSize: 12, color: "#555" }}>{detail}</div>
            </div>
          ))}
          <SectionLabel>Signs to monitor — vet consult recommended</SectionLabel>
          {[
            ["Refusing food for extended period", "Normal for 1–2 weeks. Concerning if accompanied by weight loss."],
            ["Abnormal shedding", "Retained shed or unusually frequent shedding."],
            ["Lethargy outside of brumation", "Reduced activity when temperatures are correct."],
            ["Soft or misshapen bones / jaw", "Classic MBD sign — dietary and lighting review needed urgently."],
          ].map(([sign, detail]) => (
            <div key={sign} style={{ background: C.goldLight, borderRadius: 10, padding: "10px 12px", marginBottom: 8, border: "0.5px solid #c8963c44" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#7a5a1e", marginBottom: 2 }}>{sign}</div>
              <div style={{ fontSize: 12, color: "#555" }}>{detail}</div>
            </div>
          ))}
        </>}
        {tab === "common illness" && <>
          {[
            ["Metabolic Bone Disease (MBD)", "The most common preventable reptile illness. Caused by insufficient calcium, D3, or UVB. Signs: soft bones, tremors, curved spine, swollen limbs. Treatment: corrected diet, D3 supplementation, proper UVB. Prevention is everything — correct setup from day one.", "orange"],
            ["Respiratory Infection (RI)", "Caused by incorrect temperatures, high humidity combined with poor ventilation, or bacterial infection. Signs: wheezing, open-mouth breathing, mucus, lethargy. Requires veterinary antibiotics. Correct husbandry prevents most cases.", "red"],
            ["Mouth Rot (Stomatitis)", "Bacterial infection of the mouth. Signs: redness, swelling, cheesy discharge from gums. Caused by trauma, stress, or poor immune function. Requires veterinary treatment including antibiotics and cleaning.", "red"],
            ["Parasites (internal)", "Common especially in wild-caught animals. Signs: weight loss, diarrhoea, lethargy, pot-belly appearance. Diagnosed via faecal test at a vet. Annual faecal tests recommended for all reptiles.", "orange"],
            ["Scale Rot", "Bacterial infection of the skin — usually caused by excessive moisture or abrasive substrate. Signs: discoloured, soft, or weeping scales. Correct husbandry and veterinary treatment required.", "red"],
            ["Dystocia (egg binding)", "Female unable to lay eggs. Signs: straining, restlessness, lethargy, visible eggs. Veterinary emergency. Provide a suitable nesting site to help prevent.", "red"],
          ].map(([name, desc, severity]) => (
            <div key={name} style={{ background: severity === "red" ? "#fce8e8" : C.goldLight, borderRadius: 12, padding: "12px 14px", marginBottom: 10, border: severity === "red" ? "0.5px solid #8b202033" : "0.5px solid #c8963c44" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: severity === "red" ? C.red : "#7a5a1e", marginBottom: 6 }}>{name}</div>
              <div style={{ fontSize: 12, color: "#555", lineHeight: 1.6 }}>{desc}</div>
            </div>
          ))}
        </>}
        {tab === "finding a vet" && <>
          <p style={{ fontSize: 13, color: "#666", lineHeight: 1.6, marginBottom: 14 }}>Not all vets have reptile experience. Finding a reptile-experienced vet before you need one is essential — do not wait until your animal is sick to search.</p>
          <WarnBox type="red" title="Find a reptile vet NOW — before you need one">Ask your local reptile community for recommendations. Call ahead to confirm the vet has reptile experience. A general small-animal vet without reptile experience can cause more harm than good.</WarnBox>
          <SectionLabel>What to look for in a reptile vet</SectionLabel>
          {[
            ["Exotic animal experience", "Ask specifically about reptile experience — not just 'exotic pets'."],
            ["Reptile-specific equipment", "Proper anaesthesia equipment, endoscopy, reptile blood panels."],
            ["Willingness to discuss husbandry", "A good reptile vet will review your setup, not just treat the animal."],
            ["Community reputation", "Ask local reptile keepers and breeders for personal recommendations."],
          ].map(([name, detail]) => (
            <div key={name} style={{ background: C.cream, borderRadius: 10, padding: "10px 12px", marginBottom: 8, border: "0.5px solid #e8e8e4" }}>
              <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 2 }}>{name}</div>
              <div style={{ fontSize: 12, color: "#666" }}>{detail}</div>
            </div>
          ))}
          <SectionLabel>Annual health checks</SectionLabel>
          <div style={{ background: C.cream, borderRadius: 12, padding: "12px 14px", border: "0.5px solid #e8e8e4", fontSize: 13, color: "#666", lineHeight: 1.7 }}>Annual vet checks are recommended for all reptiles, even those appearing healthy. Weight tracking, faecal parasite testing, and a physical examination can catch problems early. Long-lived species (turtles, large pythons) particularly benefit from regular checks.</div>
        </>}
        {tab === "quarantine" && <>
          <p style={{ fontSize: 13, color: "#666", lineHeight: 1.6, marginBottom: 14 }}>Quarantine is one of the most important practices in reptile keeping. Always quarantine new animals before introducing them to your existing collection.</p>
          <WarnBox type="red" title="Always quarantine new animals — minimum 90 days">Never introduce a new reptile directly to your existing collection. Many serious diseases (Cryptosporidiosis, Inclusion Body Disease, Adenovirus) show no signs for months before the animal becomes visibly sick. One infected animal can wipe out an entire collection.</WarnBox>
          <SectionLabel>Quarantine protocol</SectionLabel>
          {[
            ["Separate room ideally", "Quarantine animals in a completely separate room from your existing collection if possible."],
            ["Separate equipment", "Use completely separate feeding tongs, hides, water bowls, and tools. Never cross-contaminate."],
            ["Handle last", "Always handle quarantine animals last — after all your established animals."],
            ["Faecal test early", "Take a faecal sample to a reptile vet within the first few weeks to test for parasites."],
            ["Minimum 90 days", "3 months minimum. Some keepers quarantine for 6 months for high-value or delicate collections."],
            ["Observe closely", "Daily observation. Note feeding response, body condition, and behaviour. Any changes warrant vet attention."],
          ].map(([name, detail]) => (
            <div key={name} style={{ background: C.cream, borderRadius: 10, padding: "10px 12px", marginBottom: 8, border: "0.5px solid #e8e8e4" }}>
              <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 2 }}>{name}</div>
              <div style={{ fontSize: 12, color: "#666", lineHeight: 1.5 }}>{detail}</div>
            </div>
          ))}
        </>}
      </div>
    </div>
  );
};

// ─── Shedding & Skin Care page ────────────────────────────────────
const SheddingPage = ({ onBack }) => {
  const [tab, setTab] = useState("how shedding works");
  const tabs = ["how shedding works", "helping a shed", "problems", "skin care"];
  return (
    <div style={{ flex: 1, overflowY: "auto" }}>
      <div style={{ background: C.green, padding: "calc(env(safe-area-inset-top, 0px) + 10px) 20px 0" }}>
        <button onClick={onBack} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.7)", fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, marginBottom: 16, fontFamily: "inherit" }}>‹ Back to care guides</button>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 14 }}>
          <div style={{ fontSize: 64, lineHeight: 1, marginBottom: -4 }}>✨</div>
          <div style={{ paddingBottom: 18 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.gold, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 4 }}>Care guide</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: "white", lineHeight: 1.2 }}>Shedding & Skin Care</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", marginTop: 3 }}>Helping with a healthy shed</div>
          </div>
        </div>
        <div style={{ display: "flex", borderBottom: "0.5px solid rgba(255,255,255,0.2)", margin: "0 -20px", padding: "0 20px", gap: 4, overflowX: "auto", scrollbarWidth: "none" }}>
          {tabs.map(t => <button key={t} onClick={() => setTab(t)} style={{ background: "none", border: "none", borderBottom: tab === t ? "2px solid #fff" : "2px solid transparent", color: tab === t ? "white" : "rgba(255,255,255,0.55)", fontSize: 12, fontWeight: 700, padding: "8px 12px", cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap", marginBottom: -1, textTransform: "capitalize" }}>{t}</button>)}
        </div>
      </div>
      <div style={{ background: "white", padding: "16px 18px 40px" }}>
        {tab === "how shedding works" && <>
          <p style={{ fontSize: 13, color: "#666", lineHeight: 1.6, marginBottom: 14 }}>All reptiles shed their outer layer of skin (ecdysis) as they grow. It is a completely normal and essential process. Understanding the stages helps you provide the right support at the right time.</p>
          <SectionLabel mt={0}>The shedding cycle</SectionLabel>
          {[
            ["Normal phase", "Skin is clear and vibrant. Eyes clear. Normal feeding and behaviour."],
            ["Pre-shed (blue/dull phase)", "Skin becomes dull and milky. Eyes turn blue or opaque — a fluid layer separates the old skin from the new. The reptile may become less active, refuse food, and be more irritable. Lasts 5–14 days."],
            ["Clear phase", "Eyes clear again but skin still dull. Shedding is imminent — usually within 24–72 hours."],
            ["Shedding", "The reptile rubs against rough surfaces to break the old skin and crawls out. Do not disturb. Snakes shed in one piece; lizards typically shed in patches."],
            ["Post-shed", "Vibrant new colours and clear eyes. Resume normal feeding 24–48 hours after a complete shed."],
          ].map(([phase, detail], i) => (
            <div key={phase} style={{ background: i === 1 || i === 2 ? C.goldLight : i === 3 ? C.greenPale : C.cream, borderRadius: 10, padding: "10px 12px", marginBottom: 8, border: "0.5px solid #e8e8e4" }}>
              <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 2, color: i === 3 ? C.green : "#333" }}>{phase}</div>
              <div style={{ fontSize: 12, color: "#666", lineHeight: 1.5 }}>{detail}</div>
            </div>
          ))}
          <SectionLabel>Shedding frequency</SectionLabel>
          {[["Hatchlings & juveniles", "Every 3–4 weeks — growing rapidly"], ["Sub-adults", "Every 4–8 weeks"], ["Adults", "Every 6–12 weeks — slower growth"]].map(([age, freq]) => (
            <div key={age} style={{ background: C.cream, borderRadius: 10, padding: "10px 12px", marginBottom: 8, border: "0.5px solid #e8e8e4", display: "flex", justifyContent: "space-between" }}>
              <div style={{ fontSize: 12, color: "#555" }}>{age}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.green }}>{freq}</div>
            </div>
          ))}
        </>}
        {tab === "helping a shed" && <>
          <p style={{ fontSize: 13, color: "#666", lineHeight: 1.6, marginBottom: 14 }}>Most healthy reptiles in correct conditions shed without any help. Your job is to ensure the right conditions are in place. Intervene only when there is a problem.</p>
          <SectionLabel mt={0}>Optimal shedding conditions</SectionLabel>
          {[
            ["Correct humidity", "The most important factor. Increase humidity slightly during the pre-shed phase. A humid hide (a container with moist sphagnum moss) is essential for most species."],
            ["Rough surfaces", "Provide rocks, cork bark, branches — the reptile uses these to grip and pull the old skin off. Smooth enclosures make shedding harder."],
            ["Fresh water", "Always have clean water available. Many reptiles soak themselves before a shed. Shallow water dish they can fully submerge in."],
            ["Leave them alone", "Do not handle during the blue/pre-shed phase. They have reduced vision and are more stressed and irritable."],
          ].map(([name, detail]) => (
            <div key={name} style={{ background: C.cream, borderRadius: 12, padding: "12px 14px", marginBottom: 10, border: "0.5px solid #e8e8e4" }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>{name}</div>
              <div style={{ fontSize: 12, color: "#666", lineHeight: 1.6 }}>{detail}</div>
            </div>
          ))}
          <SectionLabel>Assisting a stuck shed</SectionLabel>
          <div style={{ background: C.cream, borderRadius: 12, padding: "12px 14px", border: "0.5px solid #e8e8e4", fontSize: 13, color: "#666", lineHeight: 1.7, marginBottom: 10 }}>If shed is retained 48+ hours after it began, assist gently. Soak the reptile in shallow warm water (28–30°C) for 20–30 minutes. The retained skin will soften. Use a damp cloth or your fingers to very gently roll the skin off. Never pull dried, stuck skin — soak first. Check toes, tail tip, and eye caps (spectacles) carefully — these areas retain shed most commonly.</div>
          <WarnBox type="red" title="Retained eye caps — see a vet">Retained spectacles (eye caps in snakes and some geckos) are delicate. Do not attempt to remove them yourself — you risk serious eye damage. Soak, then take to a reptile vet if they don't come off naturally.</WarnBox>
        </>}
        {tab === "problems" && <>
          <SectionLabel mt={0}>Common shedding problems</SectionLabel>
          {[
            ["Dysecdysis (incomplete / retained shed)", "Most common shedding problem. Usually caused by low humidity or dehydration. Retained shed on toes can cut off circulation and cause toe loss. Retained eye caps affect vision. Soak and gently remove if possible — vet if eye caps retained."],
            ["Too frequent shedding", "May indicate a skin irritation, mite infestation, or infection. Check for mites carefully and consult a vet."],
            ["Dull colouration after shed", "If colours do not return to full vibrancy within 48 hours of shedding, consider nutritional deficiency or underlying illness."],
            ["Blistering or weeping under shed", "Indicates scale rot or bacterial infection under the old skin. Vet attention required."],
            ["Refusing food during shed", "Normal — do not be alarmed. Resume feeding 24–48 hours after a complete shed."],
          ].map(([title, detail]) => (
            <HealthItem key={title} title={title} detail={detail} />
          ))}
        </>}
        {tab === "skin care" && <>
          <p style={{ fontSize: 13, color: "#666", lineHeight: 1.6, marginBottom: 14 }}>Between sheds, healthy reptile skin requires very little intervention. Correct husbandry does most of the work.</p>
          {[
            ["Regular health checks", "Inspect your reptile during handling. Look for mites (tiny moving dots, often seen around eyes and in skin folds), unusual lumps, cuts, or discolouration. Early detection makes treatment easier."],
            ["Mite prevention & treatment", "Mites are small but serious. Check new animals carefully. If found, treat the reptile (reptile-safe mite treatment) and thoroughly clean and treat the entire enclosure. Remove all hides and decor. Treat again in 7–10 days to break the life cycle."],
            ["Burns from heat sources", "Unregulated heat sources cause burns — always use thermostats. Burns appear as discoloured, blistered, or weeping scales. Veterinary treatment required. Prevent by always using properly controlled heat."],
            ["Wounds and abrasions", "Minor cuts from enclosure furniture or handling can occur. Clean gently with diluted betadine. Monitor closely — reptile wounds can become infected quickly. Any wound that does not heal within one shed cycle should be seen by a vet."],
            ["Cleaning the animal", "Reptiles generally keep themselves clean. A warm water soak for 20–30 minutes is beneficial occasionally — it aids hydration, can help loosen pre-shed skin, and allows you to inspect the animal closely. Never use soap or chemical cleaners on a reptile."],
          ].map(([name, detail]) => (
            <div key={name} style={{ background: C.cream, borderRadius: 12, padding: "12px 14px", marginBottom: 10, border: "0.5px solid #e8e8e4" }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>{name}</div>
              <div style={{ fontSize: 12, color: "#666", lineHeight: 1.6 }}>{detail}</div>
            </div>
          ))}
        </>}
      </div>
    </div>
  );
};


// ─── Green Tree Frog page ─────────────────────────────────────────
const GreenTreeFrogPage = ({ onBack }) => (
  <SpeciesPage onBack={onBack} name="Green Tree Frog" latin="Litoria caerulea" emoji="🐸"
    badges={[["Beginner friendly", C.greenPale, C.green], ["Australian native", C.bluePale, C.blue], ["Nocturnal", C.goldLight, "#7a5a1e"]]}
    tabs={["overview","feeding","health & shedding","handling","licencing"]}
    tabContent={(tab) => <>
      {tab === "overview" && <>
        <p style={{fontSize:13,color:"#666",lineHeight:1.6,marginBottom:14}}>Australia's most iconic frog and one of the most popular amphibian pets in the world. Found across northern and eastern Australia in tropical and subtropical regions. Their bright green colouration, large toe pads, and gentle temperament make them irresistible. Hardy, long-lived, and forgiving of beginner mistakes — an excellent first frog.</p>
        <SectionLabel mt={0}>Quick stats</SectionLabel>
        <StatGrid stats={[["📏","Adult size","6–11 cm"],["⏳","Lifespan","15–20+ yrs"],["🏠","Min. enclosure","45 × 45 × 60 cm"],["💧","Humidity","50–70%"]]} />
        <SectionLabel>Temperature requirements</SectionLabel>
        <TempBar label="Daytime ambient" value="24–28°C" width="52%" color="#e05a2b"/>
        <TempBar label="Nighttime low" value="18–22°C" width="30%" color="#2b7ec0"/>
        <WarnBox type="red" title="No chlorine or chloramine in water">Frogs absorb water through their skin. Tap water must be dechlorinated before use — either let it sit for 24 hours or use a reptile-safe dechlorinator. Never use tap water directly.</WarnBox>
        <SectionLabel>Enclosure setup</SectionLabel>
        <div style={{background:C.cream,borderRadius:12,padding:"12px 14px",border:"0.5px solid #e8e8e4",fontSize:13,color:"#666",lineHeight:1.7}}>A tall glass or PVC enclosure — height is important as they are semi-arboreal. Coconut coir or bioactive substrate. Live or artificial plants for cover and climbing. A large shallow water bowl they can fully submerge in. Cork bark and branches for perching. Mist one side of the enclosure every evening. Ventilation is critical — avoid stagnant air.</div>
        <ShopBtn>🛒 Shop frog supplies</ShopBtn>
        <ShopBtn secondary>Ask a question ↗</ShopBtn>
      </>}
      {tab === "feeding" && <>
        <p style={{fontSize:13,color:"#666",lineHeight:1.6,marginBottom:12}}>Insectivorous — enthusiastic and sometimes greedy feeders. Feed at night when naturally active. Obesity is a common problem — resist the urge to overfeed.</p>
        <div style={{background:C.cream,borderRadius:12,border:"0.5px solid #e8e8e4",padding:"0 14px"}}>
          <FoodItem icon="🦗" name="Crickets" detail="Staple feeder — gut load well" freq="Every 2–3 nights"/>
          <FoodItem icon="🦟" name="Wood Roaches (Woodies)" detail="Excellent Australian feeder" freq="Every 2–3 nights"/>
          <FoodItem icon="🐛" name="Silkworms" detail="High moisture — great for hydration" freq="Occasionally"/>
          <FoodItem icon="🪲" name="Mealworms" detail="Treat only — high fat" freq="Occasionally"/>
        </div>
        <WarnBox type="red" title="Obesity is very common">Green Tree Frogs will eat as much as offered. Adults should be fed 3–4 appropriately sized insects every 2–3 nights — not every night. An obese frog develops fat deposits over the eyes ("fat pads") and has a significantly reduced lifespan.</WarnBox>
        <WarnBox type="gold" title="Prey sizing">Prey should be no larger than the width of the frog's head. Large prey causes choking and regurgitation.</WarnBox>
        <ShopBtn>🛒 Shop feeders & supplements</ShopBtn>
      </>}
      {tab === "health & shedding" && <>
        <SectionLabel mt={0}>Common health issues</SectionLabel>
        <HealthItem title="Chytridiomycosis (Chytrid fungus)" detail="A devastating amphibian disease caused by the fungus Batrachochytrium dendrobatidis. Symptoms include lethargy, skin shedding, and loss of righting reflex. Strict hygiene between enclosures. Never release captive frogs into the wild."/>
        <HealthItem title="Red Leg Syndrome" detail="Bacterial infection causing reddening of the legs and abdomen. Usually caused by poor water quality or stress. Requires veterinary treatment with antibiotics."/>
        <HealthItem title="Obesity" detail="Extremely common. Fat deposits visible over the eyes indicate an obese frog. Reduce feeding frequency and prey size immediately."/>
        <HealthItem title="Toxic out syndrome" detail="Caused by contact with cleaning products, insecticides, or other chemicals. Frogs absorb through skin — keep all chemicals away from the enclosure and always wash hands before handling."/>
        <HealthItem dot="#4a9e6b" title="Signs of good health" detail="Bright green colouration, active at night, feeding well, moist skin, strong grip on surfaces, regular shedding."/>
        <SectionLabel>Shedding</SectionLabel>
        <div style={{background:C.cream,borderRadius:12,padding:"12px 14px",border:"0.5px solid #e8e8e4",fontSize:13,color:"#666",lineHeight:1.7}}>Green Tree Frogs shed their skin regularly — every 1–2 weeks. They typically eat the shed skin immediately, which is normal. A frog that appears dull or is rubbing against surfaces is likely about to shed. Ensure adequate humidity during shedding.</div>
      </>}
      {tab === "handling" && <>
        <div style={{background:C.goldLight,borderRadius:12,padding:"12px 14px",marginBottom:12,border:`0.5px solid #c8963c44`}}>
          <div style={{fontSize:12,fontWeight:700,color:"#7a5a1e",marginBottom:6}}>HANDLING — KEEP MINIMAL & HANDS CLEAN</div>
          <div style={{fontSize:13,color:"#555",lineHeight:1.6}}>Green Tree Frogs tolerate handling better than most frogs but handling should still be kept to a minimum. Their skin is permeable — chemicals, oils, and salt from hands can cause irritation or toxicity. Always wet hands with dechlorinated water before handling.</div>
        </div>
        <div style={{background:C.cream,borderRadius:12,padding:"12px 14px",border:"0.5px solid #e8e8e4",fontSize:13,color:"#666",lineHeight:1.7}}>Always wash hands thoroughly and rinse with dechlorinated water before handling. Never handle after using hand cream, insect repellent, or cleaning products. Keep sessions brief. Their large toe pads allow them to cling to surfaces — never pull them off forcefully.</div>
      </>}
      {tab === "licencing" && <LegalTab note="Green Tree Frogs require a standard keeper licence in most states. One of the most commonly kept frogs in Australia. Must be purchased from a licensed breeder — never collected from the wild." states={[{ abbr: "NSW", cat: "Standard licence", ok: true }, { abbr: "VIC", cat: "Standard licence", ok: true }, { abbr: "QLD", cat: "Standard licence", ok: true }, { abbr: "SA", cat: "Standard licence", ok: true }, { abbr: "WA", cat: "Standard licence", ok: true }, { abbr: "TAS", cat: "TAS natives only", ok: false }, { abbr: "ACT", cat: "Standard licence", ok: true }, { abbr: "NT", cat: "Check with authority", ok: true }]} />}
    </>}
  />
);

// ─── White-lipped Tree Frog page ──────────────────────────────────
const WhiteLippedFrogPage = ({ onBack }) => (
  <SpeciesPage onBack={onBack} name="White-lipped Tree Frog" latin="Litoria infrafrenata" emoji="🐸"
    badges={[["Intermediate", C.goldLight, "#7a5a1e"], ["Australian native", C.bluePale, C.blue], ["Large species", C.greenPale, C.green]]}
    tabs={["overview","feeding","health & shedding","handling","licencing"]}
    tabContent={(tab) => <>
      {tab === "overview" && <>
        <p style={{fontSize:13,color:"#666",lineHeight:1.6,marginBottom:14}}>The largest tree frog in Australia and one of the largest in the world. Found in tropical north Queensland and New Guinea. Distinguished from the Green Tree Frog by their white lower lip stripe and larger size. An impressive display animal — adults are truly spectacular. Requires a large enclosure and warm tropical conditions.</p>
        <SectionLabel mt={0}>Quick stats</SectionLabel>
        <StatGrid stats={[["📏","Adult size","10–14 cm"],["⏳","Lifespan","10–15 yrs"],["🏠","Min. enclosure","60 × 45 × 90 cm"],["💧","Humidity","60–80%"]]} />
        <SectionLabel>Temperature requirements</SectionLabel>
        <TempBar label="Daytime ambient" value="26–30°C" width="60%" color="#e05a2b"/>
        <TempBar label="Nighttime low" value="20–24°C" width="36%" color="#2b7ec0"/>
        <WarnBox type="blue" title="Tropical species — warmth essential">White-lipped Tree Frogs come from tropical north Queensland and require warmer temperatures than Green Tree Frogs. They do not tolerate cool conditions well.</WarnBox>
        <SectionLabel>Enclosure setup</SectionLabel>
        <div style={{background:C.cream,borderRadius:12,padding:"12px 14px",border:"0.5px solid #e8e8e4",fontSize:13,color:"#666",lineHeight:1.7}}>A large tall enclosure — adults are big frogs and need space. Height is important. Live plants strongly recommended for humidity and cover. Large shallow water bowl. Dense branching for perching and climbing. Mist heavily each evening. Excellent ventilation essential. Bioactive setups work very well for this species.</div>
        <ShopBtn>🛒 Shop frog supplies</ShopBtn>
        <ShopBtn secondary>Ask a question ↗</ShopBtn>
      </>}
      {tab === "feeding" && <>
        <p style={{fontSize:13,color:"#666",lineHeight:1.6,marginBottom:12}}>Voracious insectivores. Their large size means they can take larger prey than most frogs. Feed at night. Like Green Tree Frogs, obesity is a real risk.</p>
        <div style={{background:C.cream,borderRadius:12,border:"0.5px solid #e8e8e4",padding:"0 14px"}}>
          <FoodItem icon="🦗" name="Large crickets" detail="Staple feeder — gut load well" freq="Every 2–3 nights"/>
          <FoodItem icon="🦟" name="Wood Roaches (Woodies)" detail="Large adults — excellent feeder" freq="Every 2–3 nights"/>
          <FoodItem icon="🐛" name="Silkworms / hornworms" detail="High moisture feeders" freq="Occasionally"/>
          <FoodItem icon="🐭" name="Pinky mice (adults only)" detail="Occasional protein boost for very large adults" freq="Rarely"/>
        </div>
        <WarnBox type="red" title="Monitor weight carefully">White-lipped Tree Frogs grow very large and can become seriously obese. Monitor body condition — a healthy frog should have a firm, not rounded, body with no fat deposits over the eyes.</WarnBox>
        <ShopBtn>🛒 Shop feeders & supplements</ShopBtn>
      </>}
      {tab === "health & shedding" && <>
        <SectionLabel mt={0}>Common health issues</SectionLabel>
        <HealthItem title="Chytridiomycosis" detail="Same risk as all frogs. Strict hygiene essential. Never release captive frogs into the wild."/>
        <HealthItem title="Respiratory infection" detail="Caused by temperatures too low or excessive humidity without adequate ventilation. Signs include wheezing or lethargy. Veterinary attention required."/>
        <HealthItem title="Obesity" detail="Very common — these frogs are enthusiastic feeders. Reduce feeding frequency if fat pads develop over the eyes."/>
        <HealthItem dot="#4a9e6b" title="Signs of good health" detail="Vivid green colouration with clear white lip stripe, active and alert at night, feeding well, strong toe pad grip, regular shedding."/>
        <SnakeShedding animal="frog"/>
      </>}
      {tab === "handling" && <>
        <div style={{background:C.goldLight,borderRadius:12,padding:"12px 14px",marginBottom:12,border:`0.5px solid #c8963c44`}}>
          <div style={{fontSize:12,fontWeight:700,color:"#7a5a1e",marginBottom:6}}>HANDLING — MINIMAL, CLEAN HANDS ESSENTIAL</div>
          <div style={{fontSize:13,color:"#555",lineHeight:1.6}}>White-lipped Tree Frogs can be more flighty than Green Tree Frogs. Their large size makes them impressive to hold but they may jump unexpectedly. Always handle over a safe surface. Wet hands with dechlorinated water before every interaction.</div>
        </div>
        <div style={{background:C.cream,borderRadius:12,padding:"12px 14px",border:"0.5px solid #e8e8e4",fontSize:13,color:"#666",lineHeight:1.7}}>Wash and rinse hands with dechlorinated water before handling. Keep sessions brief. Their powerful legs mean they can jump considerable distances — be prepared. Never handle after using any chemical products on your hands.</div>
      </>}
      {tab === "licencing" && <LegalTab note="White-lipped Tree Frogs require a standard keeper licence in most states. Primarily available in QLD where they are native. Check availability in your state before purchasing." states={[{ abbr: "NSW", cat: "Standard licence", ok: true }, { abbr: "VIC", cat: "Check with authority", ok: true }, { abbr: "QLD", cat: "Standard licence", ok: true }, { abbr: "SA", cat: "Check with authority", ok: true }, { abbr: "WA", cat: "Check with authority", ok: true }, { abbr: "TAS", cat: "TAS natives only", ok: false }, { abbr: "ACT", cat: "Check with authority", ok: true }, { abbr: "NT", cat: "Check with authority", ok: true }]} />}
    </>}
  />
);

// ─── Striped Marsh Frog page ──────────────────────────────────────
const StripedMarshFrogPage = ({ onBack }) => (
  <SpeciesPage onBack={onBack} name="Striped Marsh Frog" latin="Limnodynastes peronii" emoji="🐸"
    badges={[["Beginner friendly", C.greenPale, C.green], ["Australian native", C.bluePale, C.blue], ["Ground dwelling", C.goldLight, "#7a5a1e"]]}
    tabs={["overview","feeding","health & shedding","handling","licencing"]}
    tabContent={(tab) => <>
      {tab === "overview" && <>
        <p style={{fontSize:13,color:"#666",lineHeight:1.6,marginBottom:14}}>One of Australia's most common and recognisable frogs — found in backyards and gardens across eastern Australia. Their distinctive brown striped pattern and loud "tok" call are familiar to anyone who lives near water. Unlike tree frogs, Striped Marsh Frogs are ground-dwelling and semi-aquatic. Hardy, adaptable, and easy to keep — a great beginner frog that is often overlooked in favour of tree frogs.</p>
        <SectionLabel mt={0}>Quick stats</SectionLabel>
        <StatGrid stats={[["📏","Adult size","4–7 cm"],["⏳","Lifespan","5–10 yrs"],["🏠","Min. enclosure","60 × 45 × 30 cm"],["💧","Humidity","60–80%"]]} />
        <SectionLabel>Temperature requirements</SectionLabel>
        <TempBar label="Daytime ambient" value="20–26°C" width="44%" color="#e05a2b"/>
        <TempBar label="Nighttime low" value="14–18°C" width="22%" color="#2b7ec0"/>
        <WarnBox type="blue" title="Cooler temperatures preferred">Striped Marsh Frogs are from temperate eastern Australia and prefer cooler conditions than tropical tree frogs. They tolerate a wide temperature range but do not thrive in warm tropical setups.</WarnBox>
        <SectionLabel>Enclosure setup</SectionLabel>
        <div style={{background:C.cream,borderRadius:12,padding:"12px 14px",border:"0.5px solid #e8e8e4",fontSize:13,color:"#666",lineHeight:1.7}}>A wider rather than taller enclosure — they are ground-dwelling, not climbers. Coconut coir substrate. A large water section is important — they are semi-aquatic and spend significant time in water. Cork bark and leaf litter hides. Low plants for cover. Mist regularly to maintain humidity. Good ventilation essential.</div>
        <ShopBtn>🛒 Shop frog supplies</ShopBtn>
        <ShopBtn secondary>Ask a question ↗</ShopBtn>
      </>}
      {tab === "feeding" && <>
        <p style={{fontSize:13,color:"#666",lineHeight:1.6,marginBottom:12}}>Insectivorous. Will feed both on land and at the water's edge. Active feeders that respond well to moving prey.</p>
        <div style={{background:C.cream,borderRadius:12,border:"0.5px solid #e8e8e4",padding:"0 14px"}}>
          <FoodItem icon="🦗" name="Crickets" detail="Staple feeder — appropriately sized" freq="Every 2–3 nights"/>
          <FoodItem icon="🦟" name="Wood Roaches (Woodies)" detail="Excellent Australian feeder" freq="Every 2–3 nights"/>
          <FoodItem icon="🪱" name="Earthworms" detail="Natural prey — eagerly taken" freq="Weekly"/>
          <FoodItem icon="🪲" name="Mealworms" detail="Treat only" freq="Occasionally"/>
        </div>
        <WarnBox type="gold" title="Feed near water">Striped Marsh Frogs often prefer to feed at the water's edge. Placing prey items near or at the water section can improve feeding response.</WarnBox>
        <ShopBtn>🛒 Shop feeders & supplements</ShopBtn>
      </>}
      {tab === "health & shedding" && <>
        <SectionLabel mt={0}>Common health issues</SectionLabel>
        <HealthItem title="Chytridiomycosis" detail="All frogs are susceptible. Strict hygiene and never releasing captive frogs into the wild is essential."/>
        <HealthItem title="Water quality" detail="As semi-aquatic frogs they are particularly sensitive to water quality. Change water frequently and dechlorinate all water used."/>
        <HealthItem title="Dehydration" detail="Despite tolerating cooler conditions, they still need adequate access to water. Ensure the water section is always clean and accessible."/>
        <HealthItem dot="#4a9e6b" title="Signs of good health" detail="Active at night, feeding well, using both land and water areas, clear eyes, moist skin, calling (males)."/>
        <SnakeShedding animal="frog"/>
      </>}
      {tab === "handling" && <>
        <div style={{background:C.goldLight,borderRadius:12,padding:"12px 14px",marginBottom:12,border:`0.5px solid #c8963c44`}}>
          <div style={{fontSize:12,fontWeight:700,color:"#7a5a1e",marginBottom:6}}>HANDLING — KEEP MINIMAL</div>
          <div style={{fontSize:13,color:"#555",lineHeight:1.6}}>Striped Marsh Frogs are more of an observation species than a handling species. They are fast-moving and jumpy when disturbed. Handling should be kept to a minimum and only for health checks. Always wet hands with dechlorinated water first.</div>
        </div>
        <WarnBox type="gold" title="Loud call">Males produce a loud repetitive "tok" call, particularly at night and before rain. This is a sign of a healthy, content frog — but worth considering if you are a light sleeper!</WarnBox>
      </>}
      {tab === "licencing" && <LegalTab note="Striped Marsh Frogs require a standard keeper licence across eastern Australia. Widely available from licensed breeders in NSW, VIC, and QLD." states={[{ abbr: "NSW", cat: "Standard licence", ok: true }, { abbr: "VIC", cat: "Standard licence", ok: true }, { abbr: "QLD", cat: "Standard licence", ok: true }, { abbr: "SA", cat: "Check with authority", ok: true }, { abbr: "WA", cat: "Not available", ok: false }, { abbr: "TAS", cat: "TAS natives only", ok: false }, { abbr: "ACT", cat: "Standard licence", ok: true }, { abbr: "NT", cat: "Not available", ok: false }]} />}
    </>}
  />
);

// ─── Eastern Dwarf Tree Frog page ─────────────────────────────────
const EasternDwarfFrogPage = ({ onBack }) => (
  <SpeciesPage onBack={onBack} name="Eastern Dwarf Tree Frog" latin="Litoria fallax" emoji="🐸"
    badges={[["Beginner friendly", C.greenPale, C.green], ["Australian native", C.bluePale, C.blue], ["Tiny species", C.goldLight, "#7a5a1e"]]}
    tabs={["overview","feeding","health & shedding","handling","licencing"]}
    tabContent={(tab) => <>
      {tab === "overview" && <>
        <p style={{fontSize:13,color:"#666",lineHeight:1.6,marginBottom:14}}>One of Australia's smallest and most charming frogs. Found in eastern Australia from Queensland to Victoria in vegetation near water. Their tiny size — adults reach just 2.5 cm — and bright green colouration make them a delightful species to keep. Best kept in groups and observed rather than handled. A popular choice for naturalistic bioactive enclosures.</p>
        <SectionLabel mt={0}>Quick stats</SectionLabel>
        <StatGrid stats={[["📏","Adult size","2–2.5 cm"],["⏳","Lifespan","3–5 yrs"],["🏠","Min. enclosure","45 × 45 × 45 cm"],["💧","Humidity","60–75%"]]} />
        <WarnBox type="red" title="Very small — escape risk">Eastern Dwarf Tree Frogs are tiny and can escape through very small gaps. Ensure the enclosure is completely escape-proof with fine mesh or sealed joins. They can fit through gaps smaller than you'd expect.</WarnBox>
        <SectionLabel>Temperature requirements</SectionLabel>
        <TempBar label="Daytime ambient" value="22–26°C" width="46%" color="#e05a2b"/>
        <TempBar label="Nighttime low" value="16–20°C" width="28%" color="#2b7ec0"/>
        <SectionLabel>Enclosure setup</SectionLabel>
        <div style={{background:C.cream,borderRadius:12,padding:"12px 14px",border:"0.5px solid #e8e8e4",fontSize:13,color:"#666",lineHeight:1.7}}>A bioactive enclosure with live plants works beautifully for this species. They love dense vegetation to hide in. A small water area. Fine-mesh ventilation — they can escape through large gaps. Keep in groups of 3+ as they are social. Cork bark and leaf litter on the substrate. Mist every evening.</div>
        <ShopBtn>🛒 Shop frog supplies</ShopBtn>
        <ShopBtn secondary>Ask a question ↗</ShopBtn>
      </>}
      {tab === "feeding" && <>
        <p style={{fontSize:13,color:"#666",lineHeight:1.6,marginBottom:12}}>Insectivorous. Their tiny size means prey must be very small — pinhead or small crickets only. Feeding can be tricky due to their size.</p>
        <div style={{background:C.cream,borderRadius:12,border:"0.5px solid #e8e8e4",padding:"0 14px"}}>
          <FoodItem icon="🦗" name="Pinhead / small crickets" detail="Only appropriately tiny prey" freq="Every 2 nights"/>
          <FoodItem icon="🦟" name="Woodies nymphs (baby roaches)" detail="Small nymphs only — excellent nutrition" freq="Every 2 nights"/>
          <FoodItem icon="🪲" name="Fruit flies (Drosophila)" detail="Good for very small juveniles" freq="Occasional supplement"/>
        </div>
        <WarnBox type="red" title="Prey size is critical">Prey must be no larger than the width of the frog's head — for Eastern Dwarf Tree Frogs that means very small insects. Oversized prey causes choking. Never offer adult crickets or large woodies to this species.</WarnBox>
        <ShopBtn>🛒 Shop feeders & supplements</ShopBtn>
      </>}
      {tab === "health & shedding" && <>
        <SectionLabel mt={0}>Common health issues</SectionLabel>
        <HealthItem title="Chytridiomycosis" detail="All frogs are susceptible. Strict hygiene essential."/>
        <HealthItem title="Escape and dehydration" detail="Escaped frogs dehydrate rapidly. Ensure the enclosure is escape-proof and check the enclosure thoroughly if you suspect an escape."/>
        <HealthItem title="Overfeeding" detail="Despite their small size they can overeat. Feed small amounts every 2 nights rather than large amounts infrequently."/>
        <HealthItem dot="#4a9e6b" title="Signs of good health" detail="Bright green colouration, active at night, calling (males), feeding well, using all levels of the enclosure."/>
        <SnakeShedding animal="frog"/>
      </>}
      {tab === "handling" && <>
        <div style={{background:C.redPale,borderRadius:12,padding:"12px 14px",marginBottom:12,border:`0.5px solid ${C.red}22`}}>
          <div style={{fontSize:12,fontWeight:700,color:C.red,marginBottom:6}}>HANDLING — NOT RECOMMENDED</div>
          <div style={{fontSize:13,color:"#555",lineHeight:1.6}}>Eastern Dwarf Tree Frogs are observation animals — their tiny size makes handling very difficult and stressful for the frog. They are fragile and fast-moving. Handling is not recommended except for essential health checks. Enjoy them through the glass.</div>
        </div>
      </>}
      {tab === "licencing" && <LegalTab note="Eastern Dwarf Tree Frogs require a standard keeper licence in eastern Australian states. Available from licensed breeders in NSW, VIC, and QLD." states={[{ abbr: "NSW", cat: "Standard licence", ok: true }, { abbr: "VIC", cat: "Standard licence", ok: true }, { abbr: "QLD", cat: "Standard licence", ok: true }, { abbr: "SA", cat: "Check with authority", ok: true }, { abbr: "WA", cat: "Not available", ok: false }, { abbr: "TAS", cat: "TAS natives only", ok: false }, { abbr: "ACT", cat: "Standard licence", ok: true }, { abbr: "NT", cat: "Not available", ok: false }]} />}
    </>}
  />
);

// ─── Peron's Tree Frog page ──────────────────────────────────────
const PeronsFrogPage = ({ onBack }) => (
  <SpeciesPage onBack={onBack} name="Peron's Tree Frog" latin="Litoria peronii" emoji="🐸"
    badges={[["Beginner friendly", C.greenPale, C.green], ["Australian native", C.bluePale, C.blue], ["Nocturnal", C.goldLight, "#7a5a1e"]]}
    tabs={["overview","feeding","health & shedding","handling","licencing"]}
    tabContent={(tab) => <>
      {tab === "overview" && <>
        <p style={{fontSize:13,color:"#666",lineHeight:1.6,marginBottom:14}}>A beautiful and distinctive tree frog found across south-eastern Australia. Their grey-brown cryptic colouration with bright yellow and black inner thighs — revealed as a flash of colour when they jump — makes them unmistakable. Known for their loud, distinctive cackling call. An active and engaging species that adapts well to captivity.</p>
        <SectionLabel mt={0}>Quick stats</SectionLabel>
        <StatGrid stats={[["📏","Adult size","4–6.5 cm"],["⏳","Lifespan","8–12 yrs"],["🏠","Min. enclosure","45 × 45 × 60 cm"],["💧","Humidity","50–70%"]]} />
        <SectionLabel>Temperature requirements</SectionLabel>
        <TempBar label="Daytime ambient" value="20–26°C" width="44%" color="#e05a2b"/>
        <TempBar label="Nighttime low" value="14–18°C" width="22%" color="#2b7ec0"/>
        <WarnBox type="blue" title="Cooler temperate species">Peron's Tree Frogs are from temperate south-eastern Australia. They prefer cooler conditions than tropical species and tolerate a wide seasonal temperature variation — this is natural and healthy.</WarnBox>
        <SectionLabel>Enclosure setup</SectionLabel>
        <div style={{background:C.cream,borderRadius:12,padding:"12px 14px",border:"0.5px solid #e8e8e4",fontSize:13,color:"#666",lineHeight:1.7}}>A tall enclosure with branches and plants for climbing and hiding. Cork bark and leaf litter at ground level. A shallow water bowl. Mist one side of the enclosure each evening. Good ventilation is essential. They are excellent climbers and will use all vertical space available.</div>
        <ShopBtn>🛒 Shop frog supplies</ShopBtn>
        <ShopBtn secondary>Ask a question ↗</ShopBtn>
      </>}
      {tab === "feeding" && <>
        <p style={{fontSize:13,color:"#666",lineHeight:1.6,marginBottom:12}}>Insectivorous. Active hunters that respond well to moving prey. Feed at night when naturally active.</p>
        <div style={{background:C.cream,borderRadius:12,border:"0.5px solid #e8e8e4",padding:"0 14px"}}>
          <FoodItem icon="🦗" name="Crickets" detail="Staple feeder — gut load well" freq="Every 2–3 nights"/>
          <FoodItem icon="🦟" name="Wood Roaches (Woodies)" detail="Excellent Australian feeder" freq="Every 2–3 nights"/>
          <FoodItem icon="🪲" name="Mealworms" detail="Treat only — high fat" freq="Occasionally"/>
          <FoodItem icon="🐛" name="Silkworms" detail="Good hydration source" freq="Occasionally"/>
        </div>
        <WarnBox type="gold" title="Flash colour display when feeding">When Peron's Tree Frogs jump or are startled, they reveal their vivid yellow and black inner thighs — a deimatic (startle) display to confuse predators. Completely normal and spectacular to observe!</WarnBox>
        <ShopBtn>🛒 Shop feeders & supplements</ShopBtn>
      </>}
      {tab === "health & shedding" && <>
        <SectionLabel mt={0}>Common health issues</SectionLabel>
        <HealthItem title="Chytridiomycosis" detail="All frogs are susceptible. Strict hygiene essential. Never release captive frogs into the wild."/>
        <HealthItem title="Dehydration" detail="Ensure fresh dechlorinated water is always available. Mist the enclosure every evening."/>
        <HealthItem title="Stress from overhandling" detail="Peron's Tree Frogs can be more stress-prone than Green Tree Frogs. Keep handling to a minimum."/>
        <HealthItem dot="#4a9e6b" title="Signs of good health" detail="Active at night, calling (males), feeding well, good body condition, moist skin, using climbing structures."/>
        <SnakeShedding animal="frog"/>
      </>}
      {tab === "handling" && <>
        <div style={{background:C.goldLight,borderRadius:12,padding:"12px 14px",marginBottom:12,border:`0.5px solid #c8963c44`}}>
          <div style={{fontSize:12,fontWeight:700,color:"#7a5a1e",marginBottom:6}}>HANDLING — MINIMAL, CLEAN HANDS</div>
          <div style={{fontSize:13,color:"#555",lineHeight:1.6}}>Peron's Tree Frogs tolerate brief handling but are best kept as observation animals. They are more flighty than Green Tree Frogs. Always wet hands with dechlorinated water before any contact. Keep sessions very brief.</div>
        </div>
        <div style={{background:C.cream,borderRadius:12,padding:"12px 14px",border:"0.5px solid #e8e8e4",fontSize:13,color:"#666",lineHeight:1.7}}>Their flash colour display when disturbed is a highlight of keeping this species — enjoy it during brief, calm handling sessions. Never handle after using any chemical products on hands.</div>
      </>}
      {tab === "licencing" && <LegalTab note="Peron's Tree Frogs require a standard keeper licence in south-eastern Australian states. Available from licensed breeders in NSW, VIC, and QLD." states={[{ abbr: "NSW", cat: "Standard licence", ok: true }, { abbr: "VIC", cat: "Standard licence", ok: true }, { abbr: "QLD", cat: "Standard licence", ok: true }, { abbr: "SA", cat: "Check with authority", ok: true }, { abbr: "WA", cat: "Not available", ok: false }, { abbr: "TAS", cat: "TAS natives only", ok: false }, { abbr: "ACT", cat: "Standard licence", ok: true }, { abbr: "NT", cat: "Not available", ok: false }]} />}
    </>}
  />
);

// ─── Magnificent Tree Frog page ───────────────────────────────────
const MagnificentFrogPage = ({ onBack }) => (
  <SpeciesPage onBack={onBack} name="Magnificent Tree Frog" latin="Litoria splendida" emoji="🐸"
    badges={[["Intermediate", C.goldLight, "#7a5a1e"], ["Australian native", C.bluePale, C.blue], ["WA/NT endemic", C.redPale, C.red]]}
    tabs={["overview","feeding","health & shedding","handling","licencing"]}
    tabContent={(tab) => <>
      {tab === "overview" && <>
        <p style={{fontSize:13,color:"#666",lineHeight:1.6,marginBottom:14}}>Arguably Australia's most stunning tree frog. Found only in the Kimberley region of Western Australia and adjacent Northern Territory. Similar in appearance to the Green Tree Frog but distinguished by large glands on the head and behind the eyes that give them a more dramatic appearance. Larger, rarer, and more challenging to source than Green Tree Frogs — but a truly spectacular species for experienced frog keepers.</p>
        <SectionLabel mt={0}>Quick stats</SectionLabel>
        <StatGrid stats={[["📏","Adult size","8–13 cm"],["⏳","Lifespan","15–20 yrs"],["🏠","Min. enclosure","60 × 45 × 90 cm"],["💧","Humidity","60–80%"]]} />
        <WarnBox type="red" title="Limited availability — WA/NT endemic">Magnificent Tree Frogs are endemic to the Kimberley and NT. They are less commonly available than Green Tree Frogs and command higher prices. Only available from specialist breeders. Confirm availability and licencing requirements carefully before purchasing.</WarnBox>
        <SectionLabel>Temperature requirements</SectionLabel>
        <TempBar label="Daytime ambient" value="26–30°C" width="60%" color="#e05a2b"/>
        <TempBar label="Nighttime low" value="20–24°C" width="36%" color="#2b7ec0"/>
        <SectionLabel>Enclosure setup</SectionLabel>
        <div style={{background:C.cream,borderRadius:12,padding:"12px 14px",border:"0.5px solid #e8e8e4",fontSize:13,color:"#666",lineHeight:1.7}}>A large tall enclosure with dense branching and live plants. Higher temperatures than Green Tree Frogs — they are from tropical north-western Australia. Large shallow water bowl. Heavy evening misting. Bioactive setups work excellently. The large parotoid glands on the head are a distinguishing feature — these are not a health concern.</div>
        <ShopBtn>🛒 Shop frog supplies</ShopBtn>
        <ShopBtn secondary>Ask a question ↗</ShopBtn>
      </>}
      {tab === "feeding" && <>
        <p style={{fontSize:13,color:"#666",lineHeight:1.6,marginBottom:12}}>Insectivorous with a strong feeding response. Similar feeding requirements to Green Tree Frogs but their larger size means bigger prey items are appropriate for adults.</p>
        <div style={{background:C.cream,borderRadius:12,border:"0.5px solid #e8e8e4",padding:"0 14px"}}>
          <FoodItem icon="🦗" name="Large crickets" detail="Staple feeder — gut load well" freq="Every 2–3 nights"/>
          <FoodItem icon="🦟" name="Wood Roaches (Woodies)" detail="Excellent Australian feeder" freq="Every 2–3 nights"/>
          <FoodItem icon="🐛" name="Silkworms / hornworms" detail="High moisture feeders" freq="Occasionally"/>
          <FoodItem icon="🐭" name="Pinky mice (large adults only)" detail="Very occasional protein boost" freq="Rarely"/>
        </div>
        <WarnBox type="red" title="Monitor weight carefully">Like all large tree frogs, obesity is a real risk. Fat deposits over the eyes indicate overfeeding. Feed 4–5 insects every 2–3 nights for adults — not every night.</WarnBox>
        <ShopBtn>🛒 Shop feeders & supplements</ShopBtn>
      </>}
      {tab === "health & shedding" && <>
        <SectionLabel mt={0}>Common health issues</SectionLabel>
        <HealthItem title="Chytridiomycosis" detail="All frogs are susceptible. Strict hygiene essential. Never release captive frogs into the wild."/>
        <HealthItem title="Obesity" detail="Common in all large tree frogs. Monitor body condition and reduce feeding if fat pads develop."/>
        <HealthItem title="Respiratory infection" detail="From temperatures too low or poor ventilation. Maintain warm tropical temperatures with excellent airflow."/>
        <HealthItem dot="#4a9e6b" title="Signs of good health" detail="Vivid green colouration, prominent head glands, active at night, feeding well, strong toe pad grip."/>
        <SnakeShedding animal="frog"/>
      </>}
      {tab === "handling" && <>
        <div style={{background:C.goldLight,borderRadius:12,padding:"12px 14px",marginBottom:12,border:`0.5px solid #c8963c44`}}>
          <div style={{fontSize:12,fontWeight:700,color:"#7a5a1e",marginBottom:6}}>HANDLING — MINIMAL, CLEAN HANDS ESSENTIAL</div>
          <div style={{fontSize:13,color:"#555",lineHeight:1.6}}>Magnificent Tree Frogs tolerate brief handling similarly to Green Tree Frogs. Their larger size makes them impressive to hold. Always wet hands with dechlorinated water before handling. Keep sessions brief and infrequent — these are primarily display animals.</div>
        </div>
        <div style={{background:C.cream,borderRadius:12,padding:"12px 14px",border:"0.5px solid #e8e8e4",fontSize:13,color:"#666",lineHeight:1.7}}>Wash and rinse hands with dechlorinated water before handling. Never handle after using any chemical products. Their large size and calm temperament make them one of the more handleable frog species — but handling should still be kept minimal.</div>
      </>}
      {tab === "licencing" && <LegalTab note="Magnificent Tree Frogs are primarily available in WA and NT where they are endemic. Check availability in your state carefully — they are less commonly available than other tree frogs." states={[{ abbr: "NSW", cat: "Check with authority", ok: true }, { abbr: "VIC", cat: "Check with authority", ok: true }, { abbr: "QLD", cat: "Check with authority", ok: true }, { abbr: "SA", cat: "Check with authority", ok: true }, { abbr: "WA", cat: "Standard licence", ok: true }, { abbr: "TAS", cat: "TAS natives only", ok: false }, { abbr: "ACT", cat: "Check with authority", ok: true }, { abbr: "NT", cat: "Standard licence", ok: true }]} />}
    </>}
  />
);


// ─── Ackie Monitor page ───────────────────────────────────────────
const AckieMonitorPage = ({ onBack }) => (
  <SpeciesPage onBack={onBack} name="Ackie Monitor" latin="Varanus acanthurus" emoji="🦎"
    badges={[["Intermediate", C.goldLight, "#7a5a1e"], ["Australian native", C.bluePale, C.blue], ["Beginner monitor", C.greenPale, C.green]]}
    tabs={["overview","feeding","health","handling","licencing"]}
    tabContent={(tab) => <>
      {tab === "overview" && <>
        <p style={{fontSize:13,color:"#666",lineHeight:1.6,marginBottom:14}}>Also known as the Spiny-tailed Monitor, the Ackie is widely considered the best beginner monitor lizard in the world. Native to arid and semi-arid north-western Australia. Their manageable size, bold personality, intelligence, and relative tolerance of handling set them apart from larger monitor species. Highly active and inquisitive — they are endlessly entertaining to observe and interact with.</p>
        <SectionLabel mt={0}>Quick stats</SectionLabel>
        <StatGrid stats={[["📏","Adult size","60–70 cm"],["⏳","Lifespan","15–20 yrs"],["🏠","Min. enclosure","120 × 60 × 60 cm"],["💧","Humidity","30–40%"]]} />
        <WarnBox type="red" title="Very hot basking spot essential">Ackie Monitors require an extremely hot basking spot — 50–60°C surface temperature is required for proper digestion and metabolic function. This is significantly hotter than most other reptiles. A high-wattage basking lamp with a thermostat is essential. Without adequate basking heat, Ackies decline rapidly.</WarnBox>
        <SectionLabel>Temperature requirements</SectionLabel>
        <TempBar label="Basking surface temp" value="50–60°C" width="100%" color="#cc2200"/>
        <TempBar label="Warm side ambient" value="32–36°C" width="74%" color="#e05a2b"/>
        <TempBar label="Cool side" value="26–28°C" width="52%" color="#4a9e6b"/>
        <TempBar label="Overnight low" value="20–22°C" width="30%" color="#2b7ec0"/>
        <SectionLabel>Enclosure setup</SectionLabel>
        <div style={{background:C.cream,borderRadius:12,padding:"12px 14px",border:"0.5px solid #e8e8e4",fontSize:13,color:"#666",lineHeight:1.7}}>A minimum 120×60×60cm enclosure for one adult — bigger is always better. Deep sandy substrate (20–30cm) for burrowing — this is important for thermoregulation and natural behaviour. A large flat rock or slate directly under the basking lamp as a basking platform. Multiple hides at both warm and cool ends. Cork bark and branches for enrichment. A damp sand box (one corner of the enclosure kept slightly moist) helps with shedding and egg laying.</div>
        <ShopBtn>🛒 Shop monitor supplies</ShopBtn>
        <ShopBtn secondary>Ask a question ↗</ShopBtn>
      </>}
      {tab === "feeding" && <>
        <p style={{fontSize:13,color:"#666",lineHeight:1.6,marginBottom:12}}>Carnivorous. A varied diet of insects, small vertebrates, and eggs is ideal. Their intelligence means they can be trained to eat from tongs and even target-trained for handling.</p>
        <div style={{background:C.cream,borderRadius:12,border:"0.5px solid #e8e8e4",padding:"0 14px"}}>
          <FoodItem icon="🦗" name="Large crickets / Wood Roaches" detail="Staple insect feeders — gut load well" freq="Every 2 days (juveniles), 3x week (adults)"/>
          <FoodItem icon="🥚" name="Quail eggs / small eggs" detail="Highly nutritious — eagerly taken" freq="Weekly"/>
          <FoodItem icon="🐭" name="Pinky / fuzzy mice" detail="Adults only — occasional protein boost" freq="Monthly"/>
          <FoodItem icon="🪲" name="Superworms / mealworms" detail="Good variety item" freq="Weekly"/>
          <FoodItem icon="🦎" name="Small lizards (skinks)" detail="Rare occasional treat for adults" freq="Rarely"/>
        </div>
        <WarnBox type="gold" title="Variety is essential">Ackies fed on a single prey type develop nutritional deficiencies. Rotate between at least 3–4 different feeders. Gut-load all insects 24 hours before feeding. Dust with calcium and multivitamin supplements.</WarnBox>
        <ShopBtn>🛒 Shop feeders & supplements</ShopBtn>
      </>}
      {tab === "health" && <>
        <SectionLabel mt={0}>Common health issues</SectionLabel>
        <HealthItem title="Metabolic Bone Disease (MBD)" detail="From insufficient basking heat, UVB, or calcium. Ackies need very hot basking spots AND high-output UVB. Calcium supplementation at every feed for juveniles."/>
        <HealthItem title="Dysecdysis (retained shed)" detail="Usually caused by low humidity. The damp sand box in the enclosure helps prevent this. Check between toes after shedding."/>
        <HealthItem title="Obesity" detail="Surprisingly common when fed too many fatty foods (superworms, mice). Keep diet varied and lean."/>
        <HealthItem title="Respiratory infection" detail="From temperatures that are too low. Ackies need consistently warm conditions — ensure heat is maintained overnight in winter."/>
        <HealthItem dot="#4a9e6b" title="Signs of good health" detail="Active and alert during the day, basking regularly, feeding enthusiastically, eyes clear and bright, good body condition, regularly shedding."/>
        <SnakeShedding animal="lizard"/>
      </>}
      {tab === "handling" && <>
        <div style={{background:C.goldLight,borderRadius:12,padding:"12px 14px",marginBottom:12,border:`0.5px solid #c8963c44`}}>
          <div style={{fontSize:12,fontWeight:700,color:"#7a5a1e",marginBottom:6}}>BITE RISK — MEDIUM (juveniles) / LOW (tame adults)</div>
          <div style={{fontSize:13,color:"#555",lineHeight:1.6}}>Juvenile Ackies can be nippy and fast. With consistent gentle handling from a young age they become remarkably tame — often described as having dog-like personalities. Target training (teaching them to touch a target stick for food rewards) significantly speeds up taming. Patient, consistent handling pays dividends with this species.</div>
        </div>
        <div style={{background:C.cream,borderRadius:12,padding:"12px 14px",border:"0.5px solid #e8e8e4",fontSize:13,color:"#666",lineHeight:1.7}}>Hook-train before every handling session — tap gently with a snake hook before picking up to signal handling rather than feeding time. Support the full body. Start with short sessions and build gradually. Well-socialised adults can be extremely tame and interactive — one of the most rewarding monitors to work with.</div>
      </>}
      {tab === "licencing" && <LegalTab note="Ackie Monitors require a standard keeper licence in most states. One of the most commonly kept monitors in Australia and widely available from licensed breeders." states={[{ abbr: "NSW", cat: "Standard licence", ok: true }, { abbr: "VIC", cat: "Advanced licence", ok: true }, { abbr: "QLD", cat: "Standard licence", ok: true }, { abbr: "SA", cat: "Standard licence", ok: true }, { abbr: "WA", cat: "Standard licence", ok: true }, { abbr: "TAS", cat: "TAS natives only", ok: false }, { abbr: "ACT", cat: "Standard licence", ok: true }, { abbr: "NT", cat: "Check with authority", ok: true }]} />}
    </>}
  />
);

// ─── Pygmy Mulga Monitor page ─────────────────────────────────────
const PygmyMulgaPage = ({ onBack }) => (
  <SpeciesPage onBack={onBack} name="Pygmy Mulga Monitor" latin="Varanus gilleni" emoji="🦎"
    badges={[["Intermediate", C.goldLight, "#7a5a1e"], ["Australian native", C.bluePale, C.blue], ["Small species", C.greenPale, C.green]]}
    tabs={["overview","feeding","health","handling","licencing"]}
    tabContent={(tab) => <>
      {tab === "overview" && <>
        <p style={{fontSize:13,color:"#666",lineHeight:1.6,marginBottom:14}}>The smallest commonly kept monitor in Australia — adults reach just 40cm. Found in the spinifex sandplains and mulga woodlands of central and north-western Australia. Arboreal with a semi-prehensile tail used for gripping branches. Hardy, active, and fascinating to observe. An excellent choice for keepers who want a monitor but have limited space.</p>
        <SectionLabel mt={0}>Quick stats</SectionLabel>
        <StatGrid stats={[["📏","Adult size","35–42 cm"],["⏳","Lifespan","10–15 yrs"],["🏠","Min. enclosure","60 × 45 × 60 cm"],["💧","Humidity","20–35%"]]} />
        <WarnBox type="red" title="Very hot basking spot essential">Like all monitors, Pygmy Mulgas require a very hot basking spot — at least 45–60°C surface temperature. This is non-negotiable for their health and digestion.</WarnBox>
        <SectionLabel>Temperature requirements</SectionLabel>
        <TempBar label="Basking surface temp" value="45–60°C" width="96%" color="#cc2200"/>
        <TempBar label="Warm side ambient" value="30–35°C" width="70%" color="#e05a2b"/>
        <TempBar label="Cool side" value="24–28°C" width="50%" color="#4a9e6b"/>
        <TempBar label="Overnight low" value="18–22°C" width="28%" color="#2b7ec0"/>
        <SectionLabel>Enclosure setup</SectionLabel>
        <div style={{background:C.cream,borderRadius:12,padding:"12px 14px",border:"0.5px solid #e8e8e4",fontSize:13,color:"#666",lineHeight:1.7}}>A taller enclosure than other arid monitors — they are arboreal and need vertical space with branches to climb. Cork bark tubes and flats for hiding. Sandy substrate. A flat rock under the basking lamp. Multiple climbing branches at varying heights. Despite being small, they are very active and appreciate enrichment. A bioactive setup with live plants works very well for this species.</div>
        <ShopBtn>🛒 Shop monitor supplies</ShopBtn>
        <ShopBtn secondary>Ask a question ↗</ShopBtn>
      </>}
      {tab === "feeding" && <>
        <p style={{fontSize:13,color:"#666",lineHeight:1.6,marginBottom:12}}>Insectivorous with some small vertebrate prey. Their small size means prey must be appropriately sized. Enthusiastic feeders.</p>
        <div style={{background:C.cream,borderRadius:12,border:"0.5px solid #e8e8e4",padding:"0 14px"}}>
          <FoodItem icon="🦗" name="Crickets / Wood Roaches" detail="Staple feeders — appropriately sized" freq="Every 2 days"/>
          <FoodItem icon="🥚" name="Small quail eggs" detail="Nutritious treat — occasionally" freq="Weekly"/>
          <FoodItem icon="🪲" name="Mealworms / small superworms" detail="Good variety item" freq="Weekly"/>
          <FoodItem icon="🐭" name="Pinky mice (adults)" detail="Very occasional — high fat" freq="Rarely"/>
        </div>
        <WarnBox type="gold" title="Small prey for small monitors">Prey must be appropriately sized — no wider than the monitor's head. Pygmy Mulgas are small animals and oversized prey is a real risk.</WarnBox>
        <ShopBtn>🛒 Shop feeders & supplements</ShopBtn>
      </>}
      {tab === "health" && <>
        <SectionLabel mt={0}>Common health issues</SectionLabel>
        <HealthItem title="Insufficient basking heat" detail="The most common husbandry mistake. Without a hot basking spot, Pygmy Mulgas cannot digest food properly and decline quickly. Always verify surface temperature with an infrared thermometer."/>
        <HealthItem title="Parasites" detail="Annual faecal tests recommended. Newly acquired animals should be tested before joining an existing collection."/>
        <HealthItem title="Dehydration" detail="Despite coming from arid environments they still need access to fresh water. A small shallow water bowl and occasional light misting."/>
        <HealthItem dot="#4a9e6b" title="Signs of good health" detail="Active climber, basking regularly, alert and curious, feeding well, regular shedding, good body condition."/>
        <SnakeShedding animal="lizard"/>
      </>}
      {tab === "handling" && <>
        <div style={{background:C.goldLight,borderRadius:12,padding:"12px 14px",marginBottom:12,border:`0.5px solid #c8963c44`}}>
          <div style={{fontSize:12,fontWeight:700,color:"#7a5a1e",marginBottom:6}}>BITE RISK — LOW TO MEDIUM</div>
          <div style={{fontSize:13,color:"#555",lineHeight:1.6}}>Pygmy Mulgas are generally calmer than Ackies or Black-headed Monitors. They can be flighty when young but tame down well with regular gentle handling. Their small size makes them easy to manage. Hook-train before every session.</div>
        </div>
        <div style={{background:C.cream,borderRadius:12,padding:"12px 14px",border:"0.5px solid #e8e8e4",fontSize:13,color:"#666",lineHeight:1.7}}>Support the full body. Handle at a comfortable temperature when the animal is warm and active. Short sessions initially, building gradually. Their prehensile tail will grip your hand and fingers — this is normal and not a sign of stress.</div>
      </>}
      {tab === "licencing" && <LegalTab note="Pygmy Mulga Monitors require a standard keeper licence in most states. The smallest commonly kept monitor — widely available from licensed breeders." states={[{ abbr: "NSW", cat: "Standard licence", ok: true }, { abbr: "VIC", cat: "Advanced licence", ok: true }, { abbr: "QLD", cat: "Standard licence", ok: true }, { abbr: "SA", cat: "Standard licence", ok: true }, { abbr: "WA", cat: "Standard licence", ok: true }, { abbr: "TAS", cat: "TAS natives only", ok: false }, { abbr: "ACT", cat: "Standard licence", ok: true }, { abbr: "NT", cat: "Check with authority", ok: true }]} />}
    </>}
  />
);

// ─── Sand Monitor page ────────────────────────────────────────────
const SandMonitorPage = ({ onBack }) => (
  <SpeciesPage onBack={onBack} name="Sand Monitor" latin="Varanus gouldii" emoji="🦎"
    badges={[["Advanced", C.redPale, C.red], ["Australian native", C.bluePale, C.blue], ["Large species", C.goldLight, "#7a5a1e"]]}
    tabs={["overview","feeding","health","handling","licencing"]}
    tabContent={(tab) => <>
      {tab === "overview" && <>
        <p style={{fontSize:13,color:"#666",lineHeight:1.6,marginBottom:14}}>Also known as Gould's Monitor or the Racehorse Goanna — named for their extraordinary speed. One of Australia's most widespread monitor lizards, found across most of the continent except the far north. A large, powerful, and highly intelligent species suited only to experienced keepers with the space and commitment required. Their bold personality and striking appearance make them impressive animals — but they demand respect and a serious commitment.</p>
        <SectionLabel mt={0}>Quick stats</SectionLabel>
        <StatGrid stats={[["📏","Adult size","100–160 cm"],["⏳","Lifespan","15–20 yrs"],["🏠","Min. enclosure","240 × 90 × 90 cm"],["💧","Humidity","30–50%"]]} />
        <WarnBox type="red" title="Large, powerful species — experienced keepers only">Sand Monitors are fast, strong, and can inflict serious bites and scratches. Adults require very large enclosures. This is not a beginner species. Significant experience with reptiles is required before keeping this species.</WarnBox>
        <SectionLabel>Temperature requirements</SectionLabel>
        <TempBar label="Basking surface temp" value="50–65°C" width="100%" color="#cc2200"/>
        <TempBar label="Warm side ambient" value="32–38°C" width="78%" color="#e05a2b"/>
        <TempBar label="Cool side" value="26–28°C" width="52%" color="#4a9e6b"/>
        <TempBar label="Overnight low" value="20–22°C" width="30%" color="#2b7ec0"/>
        <SectionLabel>Enclosure setup</SectionLabel>
        <div style={{background:C.cream,borderRadius:12,padding:"12px 14px",border:"0.5px solid #e8e8e4",fontSize:13,color:"#666",lineHeight:1.7}}>A very large custom enclosure — minimum 240×90×90cm for one adult. Many experienced keepers house adults in outdoor enclosures. Deep substrate (30+ cm) for burrowing — they spend significant time underground. Very large flat rock or slate basking platform. Robust hides. Heavy-duty construction — these are powerful animals that will test any weak points in an enclosure.</div>
        <ShopBtn>🛒 Shop monitor supplies</ShopBtn>
        <ShopBtn secondary>Ask a question ↗</ShopBtn>
      </>}
      {tab === "feeding" && <>
        <p style={{fontSize:13,color:"#666",lineHeight:1.6,marginBottom:12}}>Carnivorous. Active hunters that eat a wide variety of prey. Their large size means they can take substantial prey items as adults.</p>
        <div style={{background:C.cream,borderRadius:12,border:"0.5px solid #e8e8e4",padding:"0 14px"}}>
          <FoodItem icon="🐭" name="Rats / mice" detail="Staple prey for adults" freq="Weekly"/>
          <FoodItem icon="🥚" name="Eggs" detail="Quail, chicken — eagerly taken" freq="Weekly"/>
          <FoodItem icon="🦗" name="Large insects" detail="Good supplement and enrichment" freq="2–3x week"/>
          <FoodItem icon="🐟" name="Whole fish" detail="Good protein and calcium source" freq="Occasionally"/>
          <FoodItem icon="🐔" name="Lean chicken pieces" detail="On the bone for enrichment" freq="Occasionally"/>
        </div>
        <WarnBox type="gold" title="Always use feeding tongs">Sand Monitors have a strong feeding response and can bite hard. Always use long feeding tongs. Never hand-feed. Hook-train before every feeding session.</WarnBox>
        <ShopBtn>🛒 Shop feeders</ShopBtn>
      </>}
      {tab === "health" && <>
        <SectionLabel mt={0}>Common health issues</SectionLabel>
        <HealthItem title="Injuries from inadequate enclosure" detail="Sand Monitors are fast and powerful. Sharp enclosure edges, inadequate height, or insufficient burrowing depth cause injuries. Enclosure construction must be robust and well-finished."/>
        <HealthItem title="Obesity" detail="Common when fed too many rodents. Vary the diet and include insects and eggs alongside mammals."/>
        <HealthItem title="Parasites" detail="Annual faecal tests strongly recommended. These monitors have large home ranges in the wild and encounter many parasite sources."/>
        <HealthItem dot="#4a9e6b" title="Signs of good health" detail="Active and alert, strong muscular build, regular feeding, complete sheds, bright eyes, using full enclosure."/>
        <SnakeShedding animal="lizard"/>
      </>}
      {tab === "handling" && <>
        <div style={{background:C.redPale,borderRadius:12,padding:"12px 14px",marginBottom:12,border:`0.5px solid ${C.red}22`}}>
          <div style={{fontSize:12,fontWeight:700,color:C.red,marginBottom:6}}>BITE RISK — HIGH — EXPERIENCED KEEPERS ONLY</div>
          <div style={{fontSize:13,color:"#555",lineHeight:1.6}}>Sand Monitors can inflict serious bites and lacerations from their claws. Even well-tamed adults can bite hard if startled or in feeding mode. Hook-train before every interaction without exception. Wear thick gloves when working with unsettled animals. Two-person handling recommended for large adults.</div>
        </div>
        <div style={{background:C.cream,borderRadius:12,padding:"12px 14px",border:"0.5px solid #e8e8e4",fontSize:13,color:"#666",lineHeight:1.7}}>With significant patient work, Sand Monitors can become manageable — but they will never be as relaxed as an Ackie. Always hook-train. Support the full body. Respect their power and speed. Never rush handling sessions.</div>
        <WarnBox type="red" title="Seek medical attention for bites">Monitor bites carry a high bacterial load and risk of infection. Clean any bite wound thoroughly and seek medical advice. Monitor bites can be serious injuries.</WarnBox>
      </>}
      {tab === "licencing" && <LegalTab note="Sand Monitors require an advanced keeper licence in most states due to their large size. A significant commitment — outdoor or very large enclosures required for adults." states={[{ abbr: "NSW", cat: "Standard licence", ok: true }, { abbr: "VIC", cat: "Advanced licence", ok: true }, { abbr: "QLD", cat: "Advanced licence", ok: true }, { abbr: "SA", cat: "Advanced licence", ok: true }, { abbr: "WA", cat: "Advanced licence", ok: true }, { abbr: "TAS", cat: "TAS natives only", ok: false }, { abbr: "ACT", cat: "Advanced licence", ok: true }, { abbr: "NT", cat: "Check with authority", ok: true }]} />}
    </>}
  />
);

// ─── Lace Monitor page ────────────────────────────────────────────
const LaceMonitorPage = ({ onBack }) => (
  <SpeciesPage onBack={onBack} name="Lace Monitor" latin="Varanus varius" emoji="🦎"
    badges={[["Advanced", C.redPale, C.red], ["Australian native", C.bluePale, C.blue], ["Arboreal", C.goldLight, "#7a5a1e"]]}
    tabs={["overview","feeding","health","handling","licencing"]}
    tabContent={(tab) => <>
      {tab === "overview" && <>
        <p style={{fontSize:13,color:"#666",lineHeight:1.6,marginBottom:14}}>Australia's second largest lizard and arguably its most spectacular monitor. Found across eastern Australia from Cape York to Victoria in forests, woodlands, and suburban bushland. Their intricate lace-like pattern is unmistakable. Semi-arboreal — excellent climbers that spend significant time in trees. An impressive, intelligent, and long-lived species for serious, experienced keepers only.</p>
        <SectionLabel mt={0}>Quick stats</SectionLabel>
        <StatGrid stats={[["📏","Adult size","120–200 cm"],["⏳","Lifespan","20–30+ yrs"],["🏠","Min. enclosure","300 × 200 × 200 cm"],["💧","Humidity","50–70%"]]} />
        <WarnBox type="red" title="Requires very large outdoor or indoor-outdoor setup">Adult Lace Monitors require enormous enclosures — a minimum 3×2×2m for a single adult. Most experienced keepers use outdoor setups or dedicated reptile rooms. This is a serious commitment for advanced keepers only.</WarnBox>
        <SectionLabel>Temperature requirements</SectionLabel>
        <TempBar label="Basking surface temp" value="50–60°C" width="100%" color="#cc2200"/>
        <TempBar label="Warm side ambient" value="28–35°C" width="68%" color="#e05a2b"/>
        <TempBar label="Cool side" value="22–26°C" width="44%" color="#4a9e6b"/>
        <TempBar label="Overnight low" value="16–20°C" width="24%" color="#2b7ec0"/>
        <SectionLabel>Enclosure setup</SectionLabel>
        <div style={{background:C.cream,borderRadius:12,padding:"12px 14px",border:"0.5px solid #e8e8e4",fontSize:13,color:"#666",lineHeight:1.7}}>An outdoor or large indoor-outdoor enclosure is ideal. Robust construction — these are very strong animals. Large trees or substantial vertical climbing structures — they are arboreal and need to climb. Deep substrate for burrowing. Multiple large hides. A large water feature — they enjoy soaking and swimming. UVB lighting essential for indoor setups. Many keepers use a naturally planted outdoor enclosure in warmer months.</div>
        <ShopBtn>🛒 Shop monitor supplies</ShopBtn>
        <ShopBtn secondary>Ask a question ↗</ShopBtn>
      </>}
      {tab === "feeding" && <>
        <p style={{fontSize:13,color:"#666",lineHeight:1.6,marginBottom:12}}>Carnivorous opportunists — in the wild they eat anything they can catch including birds, mammals, reptiles, eggs, and carrion. In captivity a varied diet is important.</p>
        <div style={{background:C.cream,borderRadius:12,border:"0.5px solid #e8e8e4",padding:"0 14px"}}>
          <FoodItem icon="🐭" name="Rats / rabbits (adults)" detail="Staple prey for adults" freq="Weekly"/>
          <FoodItem icon="🥚" name="Eggs" detail="Quail, chicken — a natural favourite" freq="Weekly"/>
          <FoodItem icon="🐔" name="Whole chicken pieces" detail="On the bone for jaw exercise" freq="Occasionally"/>
          <FoodItem icon="🐟" name="Whole fish" detail="Good variety and calcium" freq="Occasionally"/>
          <FoodItem icon="🦗" name="Large insects" detail="Good supplement especially juveniles" freq="Several× week (juveniles)"/>
        </div>
        <WarnBox type="red" title="Always use long feeding tongs">Lace Monitors have an extremely powerful bite and strong feeding response. Long tongs are essential for every feed. Never hand-feed under any circumstances.</WarnBox>
        <ShopBtn>🛒 Shop feeders</ShopBtn>
      </>}
      {tab === "health" && <>
        <SectionLabel mt={0}>Common health issues</SectionLabel>
        <HealthItem title="Injuries from inadequate space" detail="Lace Monitors confined in undersized enclosures suffer chronic stress and physical injury. Enclosure size is the single most important factor in keeping this species successfully."/>
        <HealthItem title="Respiratory infection" detail="Common in cold, damp conditions without adequate heating. Ensure basking heat is always available."/>
        <HealthItem title="Bite wounds (from conspecifics)" detail="Males are highly territorial — never house two males together. Fights cause serious injuries."/>
        <HealthItem dot="#4a9e6b" title="Signs of good health" detail="Active and alert, regular basking, feeding well, using full enclosure including climbing structures, regular shedding, good body weight."/>
        <SnakeShedding animal="lizard"/>
      </>}
      {tab === "handling" && <>
        <div style={{background:C.redPale,borderRadius:12,padding:"12px 14px",marginBottom:12,border:`0.5px solid ${C.red}22`}}>
          <div style={{fontSize:12,fontWeight:700,color:C.red,marginBottom:6}}>BITE RISK — VERY HIGH — ADVANCED KEEPERS ONLY</div>
          <div style={{fontSize:13,color:"#555",lineHeight:1.6}}>Lace Monitors are powerful animals capable of inflicting serious injuries with their bite, claws, and tail. Even well-habituated animals can bite unexpectedly. Two-person handling is strongly recommended for large adults. Hook-train before every interaction without exception. Wear thick protective gloves.</div>
        </div>
        <WarnBox type="red" title="Lace Monitor bites are serious injuries">Their serrated teeth cause deep lacerations with high infection risk. Seek medical attention immediately after any bite. Lace Monitor mouths carry significant bacterial load.</WarnBox>
        <div style={{background:C.cream,borderRadius:12,padding:"12px 14px",border:"0.5px solid #e8e8e4",fontSize:13,color:"#666",lineHeight:1.7}}>With significant time and patient work from a young age, Lace Monitors can become manageable display and interaction animals. Many long-term keepers report very tame adults. But this takes years of consistent work and respect for the animal.</div>
      </>}
      {tab === "licencing" && <LegalTab note="Lace Monitors require an advanced keeper licence in most states due to their large size and advanced care requirements. One of the most demanding monitors to keep." states={[{ abbr: "NSW", cat: "Advanced licence", ok: true }, { abbr: "VIC", cat: "Advanced licence", ok: true }, { abbr: "QLD", cat: "Advanced licence", ok: true }, { abbr: "SA", cat: "Advanced licence", ok: true }, { abbr: "WA", cat: "Advanced licence", ok: true }, { abbr: "TAS", cat: "TAS natives only", ok: false }, { abbr: "ACT", cat: "Advanced licence", ok: true }, { abbr: "NT", cat: "Check with authority", ok: true }]} />}
    </>}
  />
);

// ─── Black-headed Monitor page ────────────────────────────────────
const BlackHeadedMonitorPage = ({ onBack }) => (
  <SpeciesPage onBack={onBack} name="Black-headed Monitor" latin="Varanus tristis" emoji="🦎"
    badges={[["Intermediate", C.goldLight, "#7a5a1e"], ["Australian native", C.bluePale, C.blue], ["Arboreal", C.greenPale, C.green]]}
    tabs={["overview","feeding","health","handling","licencing"]}
    tabContent={(tab) => <>
      {tab === "overview" && <>
        <p style={{fontSize:13,color:"#666",lineHeight:1.6,marginBottom:14}}>Also known as the Freckled Monitor. Found across most of Australia except the south-east and Tasmania. Their striking black head and neck contrasting with a pale spotted body makes them distinctive. Semi-arboreal and highly active. A popular monitor for intermediate keepers — more manageable than Lace or Sand Monitors but still requiring significant commitment and appropriate experience.</p>
        <SectionLabel mt={0}>Quick stats</SectionLabel>
        <StatGrid stats={[["📏","Adult size","60–100 cm"],["⏳","Lifespan","15–20 yrs"],["🏠","Min. enclosure","150 × 60 × 90 cm"],["💧","Humidity","30–50%"]]} />
        <SectionLabel>Temperature requirements</SectionLabel>
        <TempBar label="Basking surface temp" value="50–60°C" width="100%" color="#cc2200"/>
        <TempBar label="Warm side ambient" value="32–36°C" width="74%" color="#e05a2b"/>
        <TempBar label="Cool side" value="26–28°C" width="52%" color="#4a9e6b"/>
        <TempBar label="Overnight low" value="18–22°C" width="28%" color="#2b7ec0"/>
        <SectionLabel>Enclosure setup</SectionLabel>
        <div style={{background:C.cream,borderRadius:12,padding:"12px 14px",border:"0.5px solid #e8e8e4",fontSize:13,color:"#666",lineHeight:1.7}}>A tall enclosure with ample vertical space — they are semi-arboreal and need to climb. Minimum 150×60×90cm for one adult. Sandy substrate for burrowing. Large flat basking rock under the heat lamp. Multiple cork bark hides and climbing branches at varying heights. A shallow water bowl. UVB lighting essential.</div>
        <ShopBtn>🛒 Shop monitor supplies</ShopBtn>
        <ShopBtn secondary>Ask a question ↗</ShopBtn>
      </>}
      {tab === "feeding" && <>
        <p style={{fontSize:13,color:"#666",lineHeight:1.6,marginBottom:12}}>Carnivorous. In the wild they eat insects, small lizards, eggs, and small mammals. A varied diet is important in captivity.</p>
        <div style={{background:C.cream,borderRadius:12,border:"0.5px solid #e8e8e4",padding:"0 14px"}}>
          <FoodItem icon="🦗" name="Large crickets / Wood Roaches" detail="Excellent staple insect feeders" freq="Every 2 days (juveniles), 3x week (adults)"/>
          <FoodItem icon="🥚" name="Quail / small eggs" detail="Natural prey — eagerly taken" freq="Weekly"/>
          <FoodItem icon="🐭" name="Mice (adults)" detail="Occasional protein boost" freq="Monthly"/>
          <FoodItem icon="🪲" name="Superworms" detail="Good variety item" freq="Weekly"/>
        </div>
        <WarnBox type="gold" title="Feeding tongs always">Black-headed Monitors have a fast feeding strike. Always use tongs — never hand-feed. Hook-train before every feeding session.</WarnBox>
        <ShopBtn>🛒 Shop feeders & supplements</ShopBtn>
      </>}
      {tab === "health" && <>
        <SectionLabel mt={0}>Common health issues</SectionLabel>
        <HealthItem title="Insufficient basking temperature" detail="Like all monitors, an extremely hot basking spot is essential. Verify surface temperature with an infrared thermometer — not just air temperature."/>
        <HealthItem title="Respiratory infection" detail="From temperatures too cold or damp conditions without ventilation. Maintain warm arid conditions."/>
        <HealthItem title="Parasites" detail="Annual faecal tests recommended. Quarantine all new animals strictly."/>
        <HealthItem dot="#4a9e6b" title="Signs of good health" detail="Active and alert, climbing regularly, basking daily, feeding well, bright alert eyes, good body condition."/>
        <SnakeShedding animal="lizard"/>
      </>}
      {tab === "handling" && <>
        <div style={{background:C.goldLight,borderRadius:12,padding:"12px 14px",marginBottom:12,border:`0.5px solid #c8963c44`}}>
          <div style={{fontSize:12,fontWeight:700,color:"#7a5a1e",marginBottom:6}}>BITE RISK — MEDIUM TO HIGH</div>
          <div style={{fontSize:13,color:"#555",lineHeight:1.6}}>Black-headed Monitors are more flighty and defensive than Ackies. Juveniles in particular can be quite nippy and fast. With consistent patient handling from a young age they tame down reasonably well. Hook-train before every session. Respect their speed and agility.</div>
        </div>
        <div style={{background:C.cream,borderRadius:12,padding:"12px 14px",border:"0.5px solid #e8e8e4",fontSize:13,color:"#666",lineHeight:1.7}}>Always hook-train before picking up. Support the full body including the tail — their tail whip can sting. Wear long sleeves for new or unsettled animals. Short sessions initially, building gradually with patience.</div>
      </>}
      {tab === "licencing" && <LegalTab note="Black-headed Monitors require a standard to advanced keeper licence depending on the state. Widely available from licensed breeders across Australia." states={[{ abbr: "NSW", cat: "Standard licence", ok: true }, { abbr: "VIC", cat: "Advanced licence", ok: true }, { abbr: "QLD", cat: "Standard licence", ok: true }, { abbr: "SA", cat: "Standard licence", ok: true }, { abbr: "WA", cat: "Standard licence", ok: true }, { abbr: "TAS", cat: "TAS natives only", ok: false }, { abbr: "ACT", cat: "Standard licence", ok: true }, { abbr: "NT", cat: "Check with authority", ok: true }]} />}
    </>}
  />
);

// ─── Ridge-tailed Monitor page ────────────────────────────────────
const RidgeTailedMonitorPage = ({ onBack }) => (
  <SpeciesPage onBack={onBack} name="Ridge-tailed Monitor" latin="Varanus baritji" emoji="🦎"
    badges={[["Intermediate", C.goldLight, "#7a5a1e"], ["Australian native", C.bluePale, C.blue], ["NT/WA endemic", C.redPale, C.red]]}
    tabs={["overview","feeding","health","handling","licencing"]}
    tabContent={(tab) => <>
      {tab === "overview" && <>
        <p style={{fontSize:13,color:"#666",lineHeight:1.6,marginBottom:14}}>Similar in appearance to the Ackie Monitor but from a different part of Australia — found in the rocky outcrops and escarpments of the Northern Territory and north-western Western Australia. Their strongly keeled, spiny tail scales give them their name. Hardy and active, with care requirements almost identical to the Ackie Monitor. A less commonly available but equally impressive alternative to the Ackie.</p>
        <SectionLabel mt={0}>Quick stats</SectionLabel>
        <StatGrid stats={[["📏","Adult size","55–75 cm"],["⏳","Lifespan","15–20 yrs"],["🏠","Min. enclosure","120 × 60 × 60 cm"],["💧","Humidity","25–40%"]]} />
        <WarnBox type="red" title="Very hot basking spot essential">Like the Ackie Monitor, Ridge-tailed Monitors require a very hot basking spot — 50–60°C surface temperature. This is essential for digestion and health.</WarnBox>
        <SectionLabel>Temperature requirements</SectionLabel>
        <TempBar label="Basking surface temp" value="50–60°C" width="100%" color="#cc2200"/>
        <TempBar label="Warm side ambient" value="32–36°C" width="74%" color="#e05a2b"/>
        <TempBar label="Cool side" value="26–28°C" width="52%" color="#4a9e6b"/>
        <TempBar label="Overnight low" value="20–22°C" width="30%" color="#2b7ec0"/>
        <SectionLabel>Enclosure setup</SectionLabel>
        <div style={{background:C.cream,borderRadius:12,padding:"12px 14px",border:"0.5px solid #e8e8e4",fontSize:13,color:"#666",lineHeight:1.7}}>Almost identical to Ackie Monitor setup. 120×60×60cm minimum for one adult. Deep sandy substrate (20–30cm) for burrowing. Large flat rock under basking lamp. Multiple hides at both ends. Branches and cork bark for enrichment. A damp sand corner for shedding assistance. These monitors are from rocky escarpment habitat so rock piles and crevice hides are particularly appreciated.</div>
        <ShopBtn>🛒 Shop monitor supplies</ShopBtn>
        <ShopBtn secondary>Ask a question ↗</ShopBtn>
      </>}
      {tab === "feeding" && <>
        <p style={{fontSize:13,color:"#666",lineHeight:1.6,marginBottom:12}}>Carnivorous. Almost identical feeding requirements to the Ackie Monitor. A varied diet of insects and occasional small vertebrates.</p>
        <div style={{background:C.cream,borderRadius:12,border:"0.5px solid #e8e8e4",padding:"0 14px"}}>
          <FoodItem icon="🦗" name="Large crickets / Wood Roaches" detail="Staple feeders — gut load well" freq="Every 2 days (juveniles), 3x week (adults)"/>
          <FoodItem icon="🥚" name="Quail eggs" detail="Natural prey — nutritious treat" freq="Weekly"/>
          <FoodItem icon="🐭" name="Pinky / fuzzy mice (adults)" detail="Occasional protein boost" freq="Monthly"/>
          <FoodItem icon="🪲" name="Superworms" detail="Good variety item" freq="Weekly"/>
        </div>
        <WarnBox type="gold" title="Similar to Ackie Monitor">Feeding requirements and frequency are almost identical to the Ackie Monitor. Refer to general monitor feeding guidance — variety and gut-loading are key.</WarnBox>
        <ShopBtn>🛒 Shop feeders & supplements</ShopBtn>
      </>}
      {tab === "health" && <>
        <SectionLabel mt={0}>Common health issues</SectionLabel>
        <HealthItem title="Insufficient basking heat" detail="The most critical requirement. Without adequate basking heat (50–60°C surface), these monitors cannot thrive. Always verify with an infrared thermometer."/>
        <HealthItem title="Parasites" detail="Annual faecal tests recommended. Quarantine all new animals."/>
        <HealthItem title="MBD" detail="From insufficient UVB or calcium. High-output UVB and calcium supplementation at every feed for juveniles."/>
        <HealthItem dot="#4a9e6b" title="Signs of good health" detail="Active during the day, regular basking, feeding well, complete sheds, good body condition, bright alert eyes."/>
        <SnakeShedding animal="lizard"/>
      </>}
      {tab === "handling" && <>
        <div style={{background:C.goldLight,borderRadius:12,padding:"12px 14px",marginBottom:12,border:`0.5px solid #c8963c44`}}>
          <div style={{fontSize:12,fontWeight:700,color:"#7a5a1e",marginBottom:6}}>BITE RISK — MEDIUM</div>
          <div style={{fontSize:13,color:"#555",lineHeight:1.6}}>Ridge-tailed Monitors are generally considered more defensive than Ackies. They can be fast and nippy as juveniles. With patient consistent handling they tame down well. Hook-train before every session. Their spiny tail can scratch — be aware.</div>
        </div>
        <div style={{background:C.cream,borderRadius:12,padding:"12px 14px",border:"0.5px solid #e8e8e4",fontSize:13,color:"#666",lineHeight:1.7}}>Same approach as Ackie Monitors. Hook-train, support full body, start short and build gradually. Less commonly kept than Ackies so community experience is somewhat limited — connect with experienced Ridge-tail keepers for species-specific advice.</div>
      </>}
      {tab === "licencing" && <LegalTab note="Ridge-tailed Monitors are primarily available in NT and WA where they are endemic. Check availability in your state before purchasing — less commonly available than Ackie Monitors." states={[{ abbr: "NSW", cat: "Check with authority", ok: true }, { abbr: "VIC", cat: "Advanced licence", ok: true }, { abbr: "QLD", cat: "Check with authority", ok: true }, { abbr: "SA", cat: "Check with authority", ok: true }, { abbr: "WA", cat: "Standard licence", ok: true }, { abbr: "TAS", cat: "TAS natives only", ok: false }, { abbr: "ACT", cat: "Check with authority", ok: true }, { abbr: "NT", cat: "Standard licence", ok: true }]} />}
    </>}
  />
);


// ─── Page router map ──────────────────────────────────────────────
const PAGE_MAP = {
  bluetongue:  BlueTonguePage,
  beardie:     BeardiePage,
  childrens:   ChildrensPythonPage,
  stimsons:    StimsonsPythonPage,
  spotted:     SpottedPythonPage,
  carpet:      CarpetPythonPage,
  bredli:      BredliPage,
  diamond:     DiamondPythonPage,
  woma:        WomaPythonPage,
  blackheaded: BlackHeadedPythonPage,
  olive:       OlivePythonPage,
  pygmy:       PygmyPythonPage,
  jungle:      JungleCarpetPage,
  water:       WaterPythonPage,
  amethystine: AmethystinePage,
  roughscaled: RoughScaledPythonPage,
  knobtail:    KnobTailedGeckoPage,
  thicktail:   ThickTailedGeckoPage,
  marbled:     MarbledVelvetGeckoPage,
  eastbeardie: EasternBeardedDragonPage,
  rankins:     RankinsDragonPage,
  frilled:     FrilledLizardPage,
  waterdragon: WaterDragonPage,
  greentree:   GreenTreePythonPage,
  turtle:      EasternLongNeckPage,
  broadshell:  BroadShellTurtlePage,
  murray:      MurrayRiverTurtlePage,
  sawshell:    SawShellTurtlePage,
  leaftail:    LeafTailGeckoPage,
  spinytail:   SpinyTailGeckoPage,
  goldentail:  GoldenTailGeckoPage,
  northernbt:  NorthernBlueTonguePage,
  blotchedbt:  BlotchedBlueTonguePage,
  shingleback: ShinglebackPage,
  greentreefrog: GreenTreeFrogPage,
  whitelipped:  WhiteLippedFrogPage,
  stripedmarsh: StripedMarshFrogPage,
  dwarftree:    EasternDwarfFrogPage,
  perons:       PeronsFrogPage,
  magnificent:  MagnificentFrogPage,
  ackie:            AckieMonitorPage,
  pygmymulga:       PygmyMulgaPage,
  blackheadedmonitor: BlackHeadedMonitorPage,
  ridgetailed:      RidgeTailedMonitorPage,
  sandmonitor:      SandMonitorPage,
  lacemonitor:      LaceMonitorPage,
  enclosure:   EnclosurePage,
  temp:         TempPage,
  feedingnutrition: FeedingNutritionPage,
  handling:     HandlingPage,
  health:       HealthPage,
  shedding:     SheddingPage,
  feeders:     FeederGuidePage,
};

// ─── Root app ─────────────────────────────────────────────────────
export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [activeTab, setActiveTab] = useState("browse");
  const [page, setPage] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const tabs = [
    { id: "browse",    icon: "🔍", label: "Browse"    },
    { id: "care",      icon: "📖", label: "Care"      },
    { id: "licencing", icon: "⚖️", label: "Licencing" },
    { id: "identify",  icon: "📷", label: "ID Reptile"},
    { id: "glossary",  icon: "📚", label: "Glossary"  },
  ];

  const handleBack = () => setPage(null);
  const PageComponent = page ? PAGE_MAP[page] : null;

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", fontFamily: "'DM Sans', system-ui, sans-serif", minHeight: "100vh", background: C.cream }}>

        {!page && (
          <div style={{ background: C.green, padding: "calc(env(safe-area-inset-top, 0px) + 10px) 20px 0" }}>
            <div style={{ marginBottom: 14, display: "flex", alignItems: "center" }}>
              <img src="/AllThingsReptile_Logo.png" alt="All Things Reptile" onClick={() => { setActiveTab("browse"); setPage(null); setSearchQuery(""); }} style={{ width: "100%", objectFit: "contain", cursor: "pointer" }} />
            </div>
            <div style={{ background: "rgba(255,255,255,0.12)", border: "0.5px solid rgba(255,255,255,0.2)", borderRadius: 12, padding: "10px 14px", display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 14 }}>🔍</span>
              <input
                placeholder="Search species, care guides, glossary..."
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setActiveTab("browse"); setPage(null); }}
                style={{ background: "none", border: "none", outline: "none", color: "white", fontSize: 14, width: "100%", fontFamily: "inherit" }}
              />
              {searchQuery && <button onClick={() => setSearchQuery("")} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.6)", cursor: "pointer", fontSize: 18, fontFamily: "inherit", lineHeight: 1 }}>×</button>}
            </div>

          </div>
        )}

        <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", background: "white" }}>
          {PageComponent && <PageComponent onBack={handleBack} />}
          {!page && activeTab === "browse"   && (searchQuery.length >= 2 ? <SearchResults query={searchQuery} onNavigate={(p) => { setPage(p); setSearchQuery(""); }} /> : <BrowseScreen onSpecies={setPage} />)}
          {!page && activeTab === "care"     && <CareScreen     onGuide={setPage}   />}
          {!page && activeTab === "licencing" && <LegalScreen />}
          {!page && activeTab === "identify" && <IdentifyScreen />}
          {!page && activeTab === "glossary" && <GlossaryScreen />}
        </div>

        <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "white", borderTop: "0.5px solid #e8e8e4", display: "flex", flexDirection: "column", paddingTop: 8, zIndex: 100 }}>
          <div style={{ display: "flex", width: "100%" }}>
            {tabs.map(t => (
              <button key={t.id} onClick={() => { setActiveTab(t.id); setPage(null); }} style={{ flex: 1, background: "none", border: "none", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, cursor: "pointer", padding: "4px 0", fontFamily: "inherit" }}>
                <span style={{ fontSize: 20 }}>{t.icon}</span>
                <span style={{ fontSize: 10, color: activeTab === t.id ? C.green : "#aaa", fontWeight: activeTab === t.id ? 700 : 400 }}>{t.label}</span>
              </button>
            ))}
          </div>
          <div style={{ textAlign: "center", fontSize: 9, color: "#ccc", padding: "10px 0 calc(env(safe-area-inset-bottom, 0px) - 15px)" }}>© 2026 Amphibian Pty Ltd</div>
        </div>
        <div style={{ height: "calc(60px + env(safe-area-inset-bottom, 0px))" }} />
    </div>
  );
}
