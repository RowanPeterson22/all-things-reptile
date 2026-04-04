import { useState } from "react";

// ─── Brand tokens ─────────────────────────────────────────────────
const C = {
  green: "#1e3a2f", greenLight: "#2a5040", greenPale: "#e8f0ec",
  gold: "#c8963c", goldLight: "#f5e8d0", cream: "#faf8f4",
  red: "#8b2020", redPale: "#fce8e8", blue: "#1a3a5c", bluePale: "#e8eef8",
};

// ─── Species data ─────────────────────────────────────────────────
const SPECIES = [
  { id: "bluetongue",  name: "Blue-tongue Skink",          latin: "Tiliqua scincoides",       type: "lizard", emoji: "🦎", bg: "#f5f0e8", level: "Beginner",     page: "bluetongue" },
  { id: "beardie",     name: "Bearded Dragon",              latin: "Pogona vitticeps",          type: "lizard", emoji: "🦎", bg: "#f0ece0", level: "Beginner",     page: "beardie" },
  { id: "leopard",     name: "Leopard Gecko",               latin: "Eublepharis macularius",    type: "gecko",  emoji: "🦎", bg: "#fdf5e8", level: "Beginner",     page: null },
  { id: "turtle",      name: "Long-necked Turtle",          latin: "Chelodina longicollis",     type: "turtle", emoji: "🐢", bg: "#e8f0f5", level: "Intermediate", page: null },
  { id: "childrens",   name: "Children's Python",           latin: "Antaresia childreni",       type: "snake",  emoji: "🐍", bg: "#f0e8f5", level: "Beginner",     page: "childrens" },
  { id: "stimsons",    name: "Stimson's Python",            latin: "Antaresia stimsoni",        type: "snake",  emoji: "🐍", bg: "#ede8f5", level: "Beginner",     page: "stimsons" },
  { id: "spotted",     name: "Spotted Python",              latin: "Antaresia maculosa",        type: "snake",  emoji: "🐍", bg: "#f5edf0", level: "Beginner",     page: "spotted" },
  { id: "carpet",      name: "Carpet Python",               latin: "Morelia spilota",           type: "snake",  emoji: "🐍", bg: "#ece8f5", level: "Intermediate", page: "carpet" },
  { id: "bredli",      name: "Bredli Python",               latin: "Morelia bredli",            type: "snake",  emoji: "🐍", bg: "#e8ecf5", level: "Intermediate", page: "bredli" },
  { id: "diamond",     name: "Diamond Python",              latin: "Morelia spilota spilota",   type: "snake",  emoji: "🐍", bg: "#e8f5f0", level: "Intermediate", page: "diamond" },
  { id: "woma",        name: "Woma Python",                 latin: "Aspidites ramsayi",         type: "snake",  emoji: "🐍", bg: "#e8f5ec", level: "Intermediate", page: "woma" },
  { id: "blackheaded", name: "Black-headed Python",         latin: "Aspidites melanocephalus",  type: "snake",  emoji: "🐍", bg: "#e8eef0", level: "Intermediate", page: "blackheaded" },
  { id: "olive",       name: "Olive Python",                latin: "Liasis olivaceus",          type: "snake",  emoji: "🐍", bg: "#ecf0e8", level: "Advanced",     page: "olive" },
  { id: "greentree",   name: "Green Tree Python",           latin: "Morelia viridis",           type: "snake",  emoji: "🐍", bg: "#e8f5ee", level: "Advanced",     page: null },
];

const CARE_GUIDES = [
  { id: "enclosure", icon: "🏠", title: "Enclosure setup",        sub: "Size, substrate, hides & layout",    page: "enclosure" },
  { id: "temp",      icon: "🌡️", title: "Temperature & heating",  sub: "Basking zones, gradients & UVB",    page: null },
  { id: "feeding",   icon: "🦗", title: "Feeding & nutrition",    sub: "Diet, supplements & frequency",     page: null },
  { id: "handling",  icon: "🤲", title: "Handling & socialising", sub: "Building trust & safe interaction", page: null },
  { id: "health",    icon: "🩺", title: "Health & illness signs", sub: "Common issues & when to see a vet", page: null },
  { id: "shedding",  icon: "✨", title: "Shedding & skin care",   sub: "Helping with a healthy shed",       page: null },
];

const STATES = [
  { name: "Victoria (VIC)",          licence: "Wildlife Basic Licence",          badge: "Category 1",    easy: true  },
  { name: "New South Wales (NSW)",   licence: "Reptile Keeper Licence",          badge: "Class 1",       easy: true  },
  { name: "Queensland (QLD)",        licence: "Recreational Wildlife Licence",   badge: "Category 1",    easy: true  },
  { name: "South Australia (SA)",    licence: "Controlled Species Permit",       badge: "Basic permit",  easy: true  },
  { name: "Western Australia (WA)",  licence: "Wildlife Licence",                badge: "Basic keeper",  easy: false },
  { name: "Tasmania (TAS)",          licence: "Wildlife Keeper Licence",         badge: "Category 1",    easy: true  },
  { name: "ACT",                     licence: "Wildlife Licence",                badge: "Class A",       easy: false },
  { name: "Northern Territory (NT)", licence: "Wildlife Controller Licence",     badge: "Requires permit", easy: false },
];

// ─── Shared UI components ─────────────────────────────────────────
const LevelBadge = ({ level }) => {
  const s = { Beginner: { bg: C.greenPale, color: C.green }, Intermediate: { bg: C.goldLight, color: "#7a5a1e" }, Advanced: { bg: C.redPale, color: C.red } }[level] || { bg: C.greenPale, color: C.green };
  return <span style={{ background: s.bg, color: s.color, fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 10, display: "inline-block" }}>{level}</span>;
};

const SectionLabel = ({ children, mt = 16 }) => (
  <div style={{ fontSize: 11, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.07em", marginTop: mt, marginBottom: 10 }}>{children}</div>
);

const WarnBox = ({ type = "gold", title, children }) => {
  const s = {
    gold:  { bg: C.goldLight, border: "rgba(200,150,60,0.3)",  title: "#7a5a1e", body: "#7a5a1e" },
    green: { bg: C.greenPale, border: "rgba(30,58,47,0.15)",   title: C.green,   body: "#2a5040" },
    red:   { bg: C.redPale,   border: "rgba(139,32,32,0.15)",  title: C.red,     body: C.red     },
    blue:  { bg: C.bluePale,  border: "rgba(26,58,92,0.15)",   title: C.blue,    body: C.blue    },
  }[type];
  return (
    <div style={{ background: s.bg, border: `0.5px solid ${s.border}`, borderRadius: 12, padding: "12px 14px", marginBottom: 10 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: s.title, marginBottom: 3 }}>{title}</div>
      <div style={{ fontSize: 12, color: s.body, lineHeight: 1.6 }}>{children}</div>
    </div>
  );
};

const ShopBtn = ({ children, secondary = false, onClick }) => (
  <button onClick={onClick} style={{ width: "100%", border: secondary ? `0.5px solid ${C.green}` : "none", background: secondary ? "transparent" : C.green, color: secondary ? C.green : "white", borderRadius: 12, padding: "13px 14px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", marginTop: secondary ? 0 : 16, marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
    {children}
  </button>
);

const TempBar = ({ label, value, width, color }) => (
  <div style={{ background: C.cream, borderRadius: 12, padding: "10px 14px", border: "0.5px solid #e0e0dc", marginBottom: 8 }}>
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
      <span style={{ fontSize: 13, color: "#666" }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 700 }}>{value}</span>
    </div>
    <div style={{ height: 6, borderRadius: 3, background: "#e8e8e4", overflow: "hidden" }}>
      <div style={{ height: "100%", width, background: color, borderRadius: 3 }} />
    </div>
  </div>
);

const FoodItem = ({ icon, name, detail, freq }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: "0.5px solid #f0f0ea" }}>
    <div style={{ width: 36, height: 36, borderRadius: 10, background: C.greenPale, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{icon}</div>
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 1 }}>{name}</div>
      <div style={{ fontSize: 12, color: "#888" }}>{detail}</div>
    </div>
    <div style={{ fontSize: 11, padding: "3px 8px", borderRadius: 8, background: C.greenPale, color: C.green, fontWeight: 700, whiteSpace: "nowrap" }}>{freq}</div>
  </div>
);

const HealthItem = ({ dot = "#e05a2b", title, detail }) => (
  <div style={{ background: C.cream, borderRadius: 12, padding: "12px 14px", border: "0.5px solid #e8e8e4", marginBottom: 8, display: "flex", gap: 10 }}>
    <div style={{ width: 8, height: 8, borderRadius: "50%", background: dot, marginTop: 5, flexShrink: 0 }} />
    <div>
      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{title}</div>
      <div style={{ fontSize: 12, color: "#777", lineHeight: 1.6 }}>{detail}</div>
    </div>
  </div>
);

const StatGrid = ({ stats }) => (
  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 4 }}>
    {stats.map(([icon, label, val]) => (
      <div key={label} style={{ background: C.cream, borderRadius: 12, padding: "10px 12px", border: "0.5px solid #e8e8e4" }}>
        <div style={{ fontSize: 14, marginBottom: 4 }}>{icon}</div>
        <div style={{ fontSize: 10, color: "#888", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 3 }}>{label}</div>
        <div style={{ fontSize: 15, fontWeight: 700 }}>{val}</div>
      </div>
    ))}
  </div>
);

const LegalTab = ({ note }) => (
  <>
    <p style={{ fontSize: 13, color: "#666", lineHeight: 1.6, marginBottom: 12 }}>
      {note || "A keeper licence is required in all Australian states. Must be purchased from a licensed breeder — wild collection is illegal."}
    </p>
    <SectionLabel mt={0}>Licence by state</SectionLabel>
    {[["Victoria (VIC)", "Wildlife Basic Licence", "Category 1"], ["New South Wales (NSW)", "Reptile Keeper Licence", "Class 1"], ["Queensland (QLD)", "Recreational Wildlife Licence", "Category 1"], ["South Australia (SA)", "Controlled Species Permit", "Basic permit"], ["Western Australia (WA)", "Wildlife Licence", "Basic keeper"], ["Tasmania (TAS)", "Wildlife Keeper Licence", "Category 1"]].map(([state, lic, cat]) => (
      <div key={state} style={{ background: C.cream, borderRadius: 12, padding: "12px 14px", border: "0.5px solid #e8e8e4", marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div><div style={{ fontSize: 14, fontWeight: 600 }}>{state}</div><div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>{lic}</div></div>
        <div style={{ fontSize: 11, padding: "3px 9px", borderRadius: 10, background: C.greenPale, color: C.green, fontWeight: 700 }}>{cat}</div>
      </div>
    ))}
    <WarnBox type="gold" title="Always verify with your local authority">Licence categories and rules can change. Check with your state's wildlife authority before purchasing.</WarnBox>
    <ShopBtn secondary>How to apply for a licence ↗</ShopBtn>
  </>
);

const SnakeShedding = () => (
  <>
    <SectionLabel mt={0}>Shedding basics</SectionLabel>
    <WarnBox type="blue" title="Signs a shed is coming">Eyes turn blue/milky, skin looks dull, behaviour changes (hiding more, reduced appetite, sometimes irritable). This pre-shed phase lasts 5–10 days.</WarnBox>
    <HealthItem dot="#4a9e6b" title="Good shed conditions" detail="Humidity at 60–70% during shed. Add a humid hide packed with damp sphagnum moss. A soak in shallow warm water helps if the snake seems stuck." />
    <HealthItem title="Stuck shed (dysecdysis)" detail="Stuck shed around eyes (spectacles) or tail tip is the most common issue. Soak the snake in shallow warm water for 20–30 mins, then gently roll the shed off with a damp cloth. Never pull forcefully." />
    <HealthItem title="Retained eye caps" detail="If spectacles don't come off with the shed, do not attempt to remove them yourself — see a reptile vet. Retained eye caps can cause permanent eye damage." />
    <WarnBox type="green" title="Never handle during a shed">Leave your snake alone while it's in shed. They're vulnerable, often irritable, and have reduced vision. Wait until 2–3 days after the shed is complete.</WarnBox>
  </>
);

const SnakeHandling = ({ biteRisk = "low", notes }) => (
  <>
    <SectionLabel mt={0}>Handling tips</SectionLabel>
    <div style={{ background: C.cream, borderRadius: 12, border: "0.5px solid #e8e8e4", padding: "12px 14px", marginBottom: 8 }}>
      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Building trust with your snake</div>
      {["Wait 5–7 days after feeding before handling — handling too soon causes regurgitation.", "Keep early sessions short (5–10 mins). Build up gradually as the snake settles.", "Support the snake's full body weight — never let it dangle unsupported.", "Move calmly and slowly. Sudden movements trigger a defensive response.", "Always wash hands before handling — food smells on hands can trigger a feeding response."].map((tip, i) => (
        <div key={i} style={{ fontSize: 12, color: "#666", lineHeight: 1.6, paddingLeft: 12, borderLeft: `2px solid ${C.greenPale}`, marginBottom: 6 }}>{tip}</div>
      ))}
    </div>
    <div style={{ background: biteRisk === "low" ? C.greenPale : biteRisk === "medium" ? C.goldLight : C.redPale, borderRadius: 12, padding: "12px 14px", border: `0.5px solid ${biteRisk === "low" ? "rgba(30,58,47,0.15)" : biteRisk === "medium" ? "rgba(200,150,60,0.3)" : "rgba(139,32,32,0.15)"}`, marginBottom: 10 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: biteRisk === "low" ? C.green : biteRisk === "medium" ? "#7a5a1e" : C.red, marginBottom: 3 }}>Bite risk: {biteRisk === "low" ? "Low" : biteRisk === "medium" ? "Medium" : "Higher"}</div>
      <div style={{ fontSize: 12, color: biteRisk === "low" ? "#2a5040" : biteRisk === "medium" ? "#7a5a1e" : C.red, lineHeight: 1.6 }}>{notes}</div>
    </div>
    <WarnBox type="gold" title="Feeding response bites">Even calm snakes can strike if they smell food. Always hook-train your snake (use a snake hook to touch the snake before picking up, signalling it's not feeding time). Wash hands thoroughly before any interaction.</WarnBox>
  </>
);

const SnakeBreeding = ({ clutchSize, incubationTemp, incubationDays, maturityAge, notes }) => (
  <>
    <SectionLabel mt={0}>Breeding basics</SectionLabel>
    <StatGrid stats={[["🥚", "Clutch size", clutchSize], ["🌡️", "Incubation temp", incubationTemp], ["📅", "Incubation", incubationDays], ["🎂", "Sexual maturity", maturityAge]]} />
    <div style={{ background: C.cream, borderRadius: 12, border: "0.5px solid #e8e8e4", padding: "12px 14px", marginBottom: 8, marginTop: 8, fontSize: 13, color: "#666", lineHeight: 1.7 }}>
      {notes}
    </div>
    <WarnBox type="gold" title="Licence requirements for breeding">Breeding native reptiles requires a separate breeder licence in most states. Check with your local wildlife authority before attempting to breed.</WarnBox>
  </>
);

// ─── Species page shell ───────────────────────────────────────────
const SpeciesPage = ({ onBack, name, latin, emoji, badges = [], tabs, tabContent }) => {
  const [tab, setTab] = useState(tabs[0]);
  return (
    <div style={{ flex: 1, overflowY: "auto" }}>
      <div style={{ background: C.green, padding: "20px 20px 0" }}>
        <button onClick={onBack} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.7)", fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, marginBottom: 16, fontFamily: "inherit" }}>‹ Back to browse</button>
        <div style={{ textAlign: "center", fontSize: 90, lineHeight: 1, marginBottom: -8 }}>{emoji}</div>
        <div style={{ background: "white", borderRadius: "20px 20px 0 0", padding: "18px 18px 0" }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: "#111", marginBottom: 2 }}>{name}</div>
          <div style={{ fontSize: 12, color: "#888", fontStyle: "italic", marginBottom: 10 }}>{latin}</div>
          <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
            {badges.map(([label, bg, color]) => (
              <span key={label} style={{ background: bg, color, fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 10 }}>{label}</span>
            ))}
          </div>
          <div style={{ display: "flex", borderBottom: "0.5px solid #eee", margin: "0 -18px", padding: "0 18px", gap: 4, overflowX: "auto", scrollbarWidth: "none" }}>
            {tabs.map(t => (
              <button key={t} onClick={() => setTab(t)} style={{ background: "none", border: "none", borderBottom: tab === t ? `2px solid ${C.green}` : "2px solid transparent", color: tab === t ? C.green : "#888", fontSize: 12, fontWeight: 700, padding: "8px 11px", cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap", marginBottom: -1, textTransform: "capitalize" }}>{t}</button>
            ))}
          </div>
        </div>
      </div>
      <div style={{ background: "white", padding: "16px 18px 28px" }}>
        {tabContent(tab)}
      </div>
    </div>
  );
};

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
      {tab === "licencing" && <LegalTab note="Children's Pythons are Category 1 / Class 1 in most Australian states — one of the easiest snakes to keep legally. A basic keeper licence is required." />}
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
      {tab === "licencing" && <LegalTab note="Stimson's Pythons are Category 1 / Class 1 in most Australian states. Basic keeper licence required." />}
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
      {tab === "licencing" && <LegalTab note="Spotted Pythons are Category 1 / Class 1 in most Australian states. A basic keeper licence is required." />}
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
      {tab === "licencing" && <LegalTab note="Carpet Pythons are listed in Category 2 / Class 2 in most states due to their larger size. A keeper licence at the appropriate level is required." />}
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
      {tab === "licencing" && <LegalTab note="Bredli Pythons require a Category 2 / Class 2 keeper licence in most states due to their size." />}
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
      {tab === "licencing" && <LegalTab note="Diamond Pythons require a Category 2 / Class 2 licence in most states. In Victoria and NSW where they are native, check for any additional local requirements." />}
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
      {tab === "licencing" && <LegalTab note="Woma Pythons are listed in higher licence categories in some states due to conservation status. Check current requirements carefully before purchase." />}
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
      {tab === "licencing" && <LegalTab note="Black-headed Pythons may require a higher keeper licence category in some states. Check your state's current requirements carefully — categories vary and can change." />}
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
      {tab === "licencing" && <LegalTab note="Olive Pythons require a higher-level keeper licence (Category 2 or 3 depending on state) due to their size. A licence upgrade from a basic keeper licence is required in most states." />}
    </>}
  />
);

// ─── Blue-tongue Skink page (unchanged) ──────────────────────────
const BlueTonguePage = ({ onBack }) => {
  const [tab, setTab] = useState("overview"); // eslint-disable-line no-unused-vars
  const tabs = ["overview", "feeding", "health", "licencing"];
  return (
    <SpeciesPage onBack={onBack} name="Blue-tongue Skink" latin="Tiliqua scincoides" emoji="🦎"
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
            <FoodItem icon="🐌" name="Snails / insects" detail="Dubia roaches, crickets, snails" freq="Occasional" />
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
        {tab === "licencing" && <LegalTab note="Blue-tongue Skinks are native wildlife. A keeper licence is required in all Australian states. They must be purchased from a licensed breeder — wild collection is illegal." />}
      </>}
    />
  );
};

// ─── Bearded Dragon page (unchanged) ─────────────────────────────
const BeardiePage = ({ onBack }) => {
  const [ageTab, setAgeTab] = useState("juv");
  const tabs = ["overview", "feeding", "health", "licencing"];
  return (
    <SpeciesPage onBack={onBack} name="Bearded Dragon" latin="Pogona vitticeps" emoji="🦎"
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
              <FoodItem icon="🪲" name="Dubia roaches" detail="Excellent nutrition" freq="Daily" />
              <FoodItem icon="🥬" name="Collard / mustard greens" detail="Always available alongside insects" freq="Daily" />
            </div>
            <WarnBox type="red" title="Avoid for juveniles">No spinach, avocado, citrus, or fireflies. No wild-caught insects.</WarnBox>
          </> : <>
            <WarnBox type="green" title="70% greens / 30% protein">Adult beardies need far fewer insects. Shift the balance to leafy greens as the main meal.</WarnBox>
            <div style={{ background: C.cream, borderRadius: 12, border: "0.5px solid #e8e8e4", padding: "0 14px" }}>
              <FoodItem icon="🥬" name="Collard / mustard greens" detail="Main daily staple" freq="Daily" />
              <FoodItem icon="🥕" name="Butternut squash / pumpkin" detail="Great vitamins" freq="Several× week" />
              <FoodItem icon="🦗" name="Dubia roaches / crickets" detail="Occasional protein top-up" freq="2–3× week" />
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
        {t === "licencing" && <LegalTab note="Bearded Dragons are listed in the lowest keeper category in most Australian states — one of the easiest native reptiles to keep legally. A basic keeper licence is required." />}
      </>}
    />
  );
};

// ─── Enclosure Guide page ─────────────────────────────────────────
const EnclosurePage = ({ onBack }) => {
  const [tab, setTab] = useState("types");
  const tabs = ["types", "sizing", "substrate", "setup"];
  const tabLabels = { types: "Enclosure types", sizing: "Sizing", substrate: "Substrate", setup: "Setup tips" };
  const sizes = [["Bearded Dragon", "Min: 120 × 60 × 60 cm", "150 × 60 × 60 cm"], ["Blue-tongue Skink", "Min: 120 × 60 × 45 cm", "150 × 60 × 60 cm"], ["Carpet Python (adult)", "Min: 180 × 60 × 60 cm", "210 × 60 × 90 cm"], ["Leopard Gecko", "Min: 90 × 45 × 45 cm", "120 × 60 × 45 cm"], ["Woma Python (adult)", "Min: 150 × 60 × 60 cm", "180 × 60 × 60 cm"], ["Children's Python", "Min: 90 × 45 × 45 cm", "120 × 60 × 45 cm"], ["Olive Python (adult)", "Min: 240 × 90 × 90 cm", "300 × 90 × 90 cm"], ["Long-necked Turtle", "Min: 150 × 60 cm aquatic", "Pond setup"]];
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
      <div style={{ background: C.green, padding: "20px 20px 0" }}>
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

// ─── Browse, Care, Legal, Identify screens ────────────────────────
const BrowseScreen = ({ onSpecies }) => {
  const [filter, setFilter] = useState("all");
  const filters = ["all", "lizard", "snake", "gecko", "turtle"];
  const filtered = filter === "all" ? SPECIES : SPECIES.filter(s => s.type === filter);
  return (
    <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>
      <div style={{ background: C.green, borderRadius: 14, padding: 16, marginBottom: 16, display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }} onClick={() => onSpecies("bluetongue")}>
        <div style={{ fontSize: 40 }}>🦎</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: C.gold, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 4 }}>Featured species</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "white", marginBottom: 2 }}>Blue-tongue Skink</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }}>Great beginner reptile ↗</div>
        </div>
      </div>
      <div style={{ fontSize: 11, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 10 }}>Filter by type</div>
      <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 4, marginBottom: 16, scrollbarWidth: "none" }}>
        {filters.map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{ padding: "5px 14px", borderRadius: 20, fontSize: 12, fontWeight: 700, whiteSpace: "nowrap", cursor: "pointer", border: "0.5px solid", borderColor: filter === f ? C.green : "#e0e0dc", background: filter === f ? C.green : "white", color: filter === f ? "white" : "#666", fontFamily: "inherit" }}>
            {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1) + "s"}
          </button>
        ))}
      </div>
      <div style={{ fontSize: 11, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 10 }}>Australian species</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {filtered.map(sp => (
          <div key={sp.id} onClick={() => sp.page && onSpecies(sp.page)} style={{ background: "white", borderRadius: 14, border: "0.5px solid #e8e8e4", overflow: "hidden", cursor: sp.page ? "pointer" : "default", opacity: sp.page ? 1 : 0.8 }}>
            <div style={{ height: 80, background: sp.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36 }}>{sp.emoji}</div>
            <div style={{ padding: "8px 10px 10px" }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 2 }}>{sp.name}</div>
              <div style={{ fontSize: 11, color: "#888", marginBottom: 6, textTransform: "capitalize" }}>{sp.type}</div>
              <LevelBadge level={sp.level} />
              {!sp.page && <div style={{ fontSize: 10, color: "#bbb", marginTop: 4 }}>Coming soon</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const CareScreen = ({ onGuide }) => (
  <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>
    <div style={{ fontSize: 11, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 14 }}>Care guide topics</div>
    {CARE_GUIDES.map(g => (
      <div key={g.id} onClick={() => g.page && onGuide(g.page)} style={{ background: "white", borderRadius: 14, border: "0.5px solid #e8e8e4", padding: 14, marginBottom: 10, display: "flex", alignItems: "center", gap: 12, cursor: g.page ? "pointer" : "default", opacity: g.page ? 1 : 0.8 }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: C.greenPale, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>{g.icon}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 2 }}>{g.title}</div>
          <div style={{ fontSize: 12, color: "#888" }}>{g.sub}</div>
          {!g.page && <div style={{ fontSize: 10, color: "#bbb", marginTop: 3 }}>Coming soon</div>}
        </div>
        <div style={{ fontSize: 18, color: "#ccc" }}>›</div>
      </div>
    ))}
  </div>
);

const LegalScreen = () => (
  <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>
    <WarnBox type="gold" title="Important note">Reptile licence categories vary by state. Always verify with your local wildlife authority before purchasing.</WarnBox>
    <div style={{ fontSize: 11, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 10 }}>Licence info by state</div>
    {STATES.map(s => (
      <div key={s.name} style={{ background: "white", borderRadius: 14, border: "0.5px solid #e8e8e4", padding: 14, marginBottom: 8 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
          <div style={{ fontSize: 14, fontWeight: 700 }}>{s.name}</div>
          <div style={{ fontSize: 11, padding: "3px 8px", borderRadius: 10, fontWeight: 700, background: s.easy ? C.greenPale : C.goldLight, color: s.easy ? C.green : "#7a5a1e" }}>{s.badge}</div>
        </div>
        <div style={{ fontSize: 12, color: "#777" }}>{s.licence}</div>
      </div>
    ))}
  </div>
);

const IdentifyScreen = () => {
  const [desc, setDesc] = useState("");
  return (
    <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>
      <div style={{ background: "white", border: "1.5px dashed #e0e0dc", borderRadius: 14, padding: "32px 16px", textAlign: "center", marginBottom: 16 }}>
        <div style={{ fontSize: 36, marginBottom: 10 }}>📷</div>
        <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>Identify a reptile</div>
        <div style={{ fontSize: 13, color: "#888" }}>Upload a photo and our AI will identify the species for you</div>
        <button style={{ marginTop: 14, background: C.green, color: "white", border: "none", borderRadius: 10, padding: "10px 24px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Upload a photo ↗</button>
      </div>
      <div style={{ fontSize: 11, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 10 }}>Or describe what you saw</div>
      <div style={{ background: "white", borderRadius: 14, border: "0.5px solid #e8e8e4", padding: 14 }}>
        <input value={desc} onChange={e => setDesc(e.target.value)} placeholder="e.g. brown striped snake, found near creek in QLD..." style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "0.5px solid #e8e8e4", fontSize: 13, fontFamily: "inherit", background: C.cream, color: "#111", outline: "none" }} />
        <div style={{ fontSize: 11, color: "#aaa", marginTop: 6 }}>Press enter to search</div>
      </div>
      <WarnBox type="green" title="Coming soon">AI-powered species identification from photos is coming soon.</WarnBox>
    </div>
  );
};


// ─── Glossary screen ─────────────────────────────────────────────
const GlossaryScreen = () => {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const categories = ["All", "Behaviour", "Biology", "Breeding", "Health", "Husbandry", "Legal", "Nutrition"];
  const CAT_COLOURS = {
    Behaviour: { bg: C.greenPale,  color: C.green },
    Biology:   { bg: C.bluePale,   color: C.blue  },
    Breeding:  { bg: C.goldLight,  color: "#7a5a1e" },
    Health:    { bg: C.redPale,    color: C.red   },
    Husbandry: { bg: "#f0e8f8",    color: "#4a1a6b" },
    Legal:     { bg: "#e8f0f8",    color: "#1a3a6b" },
    Nutrition: { bg: "#fff3e0",    color: "#8b5e00" },
  };

  const filtered = GLOSSARY_TERMS.filter(t => {
    const matchSearch = t.term.toLowerCase().includes(search.toLowerCase()) ||
                        t.def.toLowerCase().includes(search.toLowerCase());
    const matchCat = activeCategory === "All" || t.cat === activeCategory;
    return matchSearch && matchCat;
  });

  const grouped = filtered.reduce((acc, t) => {
    const letter = t.term[0].toUpperCase();
    acc[letter] = acc[letter] || [];
    acc[letter].push(t);
    return acc;
  }, {});

  return (
    <div style={{ flex: 1, overflowY: "auto" }}>
      <div style={{ background: C.green, padding: "16px 18px 0" }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: C.gold, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 4 }}>Reference</div>
        <div style={{ fontSize: 20, fontWeight: 700, color: "white", marginBottom: 14, lineHeight: 1.2 }}>Reptile Glossary</div>
        <div style={{ background: "rgba(255,255,255,0.12)", border: "0.5px solid rgba(255,255,255,0.2)", borderRadius: 10, padding: "9px 12px", display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 14 }}>🔍</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search terms..."
            style={{ background: "none", border: "none", outline: "none", color: "white", fontSize: 13, width: "100%", fontFamily: "inherit" }}
          />
          {search && <button onClick={() => setSearch("")} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.5)", cursor: "pointer", fontSize: 16, fontFamily: "inherit" }}>×</button>}
        </div>
        <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 12, scrollbarWidth: "none" }}>
          {categories.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)} style={{
              padding: "4px 12px", borderRadius: 20, fontSize: 11, fontWeight: 700, whiteSpace: "nowrap",
              cursor: "pointer", fontFamily: "inherit", border: "none",
              background: activeCategory === cat ? C.gold : "rgba(255,255,255,0.15)",
              color: activeCategory === cat ? C.green : "rgba(255,255,255,0.7)",
            }}>{cat}</button>
          ))}
        </div>
      </div>

      <div style={{ background: "white", padding: "8px 0 24px" }}>
        {filtered.length === 0 ? (
          <div style={{ padding: "32px 18px", textAlign: "center", color: "#aaa", fontSize: 14 }}>
            No terms found for "{search}"
          </div>
        ) : (
          Object.keys(grouped).sort().map(letter => (
            <div key={letter}>
              <div style={{ padding: "10px 18px 4px", fontSize: 12, fontWeight: 700, color: C.gold, background: C.cream, borderBottom: `0.5px solid #eee` }}>{letter}</div>
              {grouped[letter].map((t, i) => {
                const cs = CAT_COLOURS[t.cat] || { bg: C.greenPale, color: C.green };
                return (
                  <div key={t.term} style={{ padding: "12px 18px", borderBottom: "0.5px solid #f5f5f0", background: i % 2 === 0 ? "white" : C.cream }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 5 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: C.green }}>{t.term}</div>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 8, background: cs.bg, color: cs.color, whiteSpace: "nowrap" }}>{t.cat}</span>
                    </div>
                    <div style={{ fontSize: 13, color: "#555", lineHeight: 1.6 }}>{t.def}</div>
                  </div>
                );
              })}
            </div>
          ))
        )}
        <div style={{ padding: "16px 18px", fontSize: 12, color: "#aaa", textAlign: "center" }}>
          {filtered.length} term{filtered.length !== 1 ? "s" : ""} {activeCategory !== "All" ? `in ${activeCategory}` : "in glossary"}
        </div>
      </div>
    </div>
  );
};

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
  enclosure:   EnclosurePage,
};

// ─── Root app ─────────────────────────────────────────────────────
export default function App() {
  const [activeTab, setActiveTab] = useState("browse");
  const [page, setPage] = useState(null);

  const tabs = [
    { id: "browse",    icon: "🔍", label: "Browse"    },
    { id: "care",      icon: "📖", label: "Care"      },
    { id: "licencing", icon: "⚖️", label: "Licencing" },
    { id: "identify",  icon: "📷", label: "ID Reptile"},
    { id: "glossary",  icon: "📚", label: "Glossary"  },
  ];

  const handleBack = () => setPage(null);
  const PageComponent = page ? PAGE_MAP[page] : null;

  return (
    <div style={{ display: "flex", justifyContent: "center", padding: "1rem 0", fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <div style={{ width: 390, background: C.cream, minHeight: 700, borderRadius: 24, overflow: "hidden", border: "0.5px solid #e0e0dc", display: "flex", flexDirection: "column", boxShadow: "0 8px 40px rgba(0,0,0,0.12)" }}>

        {!page && (
          <div style={{ background: C.green, padding: "20px 20px 0" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <div style={{ width: 32, height: 32, background: C.gold, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🦎</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "white", lineHeight: 1.2 }}>All Things Reptile</div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.6)" }}>An Amphibian Pty Ltd Company</div>
              </div>
            </div>
            <div style={{ background: "rgba(255,255,255,0.12)", border: "0.5px solid rgba(255,255,255,0.2)", borderRadius: 12, padding: "10px 14px", display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 14 }}>🔍</span>
              <input placeholder="Search species, care guides..." style={{ background: "none", border: "none", outline: "none", color: "white", fontSize: 14, width: "100%", fontFamily: "inherit" }} />
            </div>
            <div style={{ display: "flex", marginTop: 12, borderBottom: "2px solid rgba(255,255,255,0.1)", gap: 4 }}>
              {tabs.map(t => (
                <button key={t.id} onClick={() => setActiveTab(t.id)} style={{ flex: 1, background: "none", border: "none", borderBottom: activeTab === t.id ? `2px solid ${C.gold}` : "2px solid transparent", color: activeTab === t.id ? C.gold : "rgba(255,255,255,0.55)", fontSize: 11, fontWeight: 700, padding: "10px 4px", cursor: "pointer", fontFamily: "inherit", marginBottom: -2, whiteSpace: "nowrap" }}>{t.label}</button>
              ))}
            </div>
          </div>
        )}

        <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", background: "white" }}>
          {PageComponent && <PageComponent onBack={handleBack} />}
          {!page && activeTab === "browse"   && <BrowseScreen   onSpecies={setPage} />}
          {!page && activeTab === "care"     && <CareScreen     onGuide={setPage}   />}
          {!page && activeTab === "licencing" && <LegalScreen />}
          {!page && activeTab === "identify" && <IdentifyScreen />}
          {!page && activeTab === "glossary" && <GlossaryScreen />}
        </div>

        {!page && (
          <div style={{ background: "white", borderTop: "0.5px solid #e8e8e4", display: "flex", padding: "10px 0 4px" }}>
            {tabs.map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)} style={{ flex: 1, background: "none", border: "none", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, cursor: "pointer", padding: "4px 0", fontFamily: "inherit" }}>
                <span style={{ fontSize: 20 }}>{t.icon}</span>
                <span style={{ fontSize: 10, color: activeTab === t.id ? C.green : "#aaa", fontWeight: activeTab === t.id ? 700 : 400 }}>{t.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Glossary data ────────────────────────────────────────────────
const GLOSSARY_TERMS = [
  { term: "Aestivation", def: "A period of dormancy triggered by heat and drought. Some reptiles and frogs slow down during very hot or dry periods to conserve energy and water.", cat: "Behaviour" },
  { term: "Ambient temperature", def: "The general air temperature in an area of the enclosure, as opposed to the basking spot. Reptiles need a range of ambient temperatures to thermoregulate.", cat: "Husbandry" },
  { term: "Arboreal", def: "Describes an animal that lives primarily in trees or climbs regularly. Arboreal reptiles need tall enclosures with branches and vertical space.", cat: "Biology" },
  { term: "Autotomy", def: "The ability of some lizards to voluntarily shed their tail as a defence mechanism. The tail regrows over time, though it may look different to the original.", cat: "Biology" },
  { term: "Basking", def: "The behaviour where reptiles position themselves under a heat source to warm their body. Reptiles are ectothermic and rely on external heat to regulate body temperature.", cat: "Behaviour" },
  { term: "Basking spot", def: "The warmest area in an enclosure, usually directly under a heat lamp. The basking spot allows reptiles to reach their preferred body temperature quickly.", cat: "Husbandry" },
  { term: "Bioactive enclosure", def: "An enclosure using live plants, natural substrate, and a cleanup crew of invertebrates like isopods and springtails to break down waste naturally.", cat: "Husbandry" },
  { term: "Brumation", def: "A period of reduced activity in reptiles during cooler months, similar to hibernation in mammals. Reptiles may sleep for extended periods and refuse food. Completely normal — not a sign of illness.", cat: "Behaviour" },
  { term: "Calcium supplementation", def: "Adding calcium powder to a reptile's food to support healthy bone development. Insufficient calcium can lead to Metabolic Bone Disease (MBD).", cat: "Nutrition" },
  { term: "CITES", def: "Convention on International Trade in Endangered Species. An international agreement regulating trade in wild animals. Many reptile species are protected under CITES.", cat: "Legal" },
  { term: "Cloaca", def: "The single posterior opening in reptiles used for both excretion and reproduction. A healthy cloaca should be clean and free of swelling or discharge.", cat: "Biology" },
  { term: "Clutch", def: "A group of eggs laid at one time by a female reptile. Clutch sizes vary — from 2 eggs in small pythons to 30+ in larger species.", cat: "Breeding" },
  { term: "Constriction", def: "The method used by pythons to subdue prey by coiling around it and applying pressure. All Australian pythons are non-venomous and rely on constriction.", cat: "Biology" },
  { term: "Crepuscular", def: "Describes animals most active at dawn and dusk. Some reptiles and frogs are crepuscular rather than strictly diurnal or nocturnal.", cat: "Behaviour" },
  { term: "Cryptosporidiosis", def: "A serious parasitic infection affecting reptiles, particularly pythons. Symptoms include chronic regurgitation and weight loss. No reliable cure — strict quarantine of new animals is essential.", cat: "Health" },
  { term: "Diurnal", def: "Describes animals active during the day and sleeping at night. Bearded Dragons and Blue-tongue Skinks are diurnal and typically require UVB lighting to synthesise Vitamin D3.", cat: "Behaviour" },
  { term: "Dysecdysis", def: "Incomplete or abnormal shedding, also called a stuck shed. Can occur due to low humidity or dehydration. Retained shed around toes or eye caps can cause serious problems.", cat: "Health" },
  { term: "Ecdysis", def: "The scientific term for shedding skin. Reptiles shed as they grow — younger animals more frequently than adults. A healthy shed should come off in one complete piece.", cat: "Biology" },
  { term: "Ectotherm", def: "An animal that relies on external heat to regulate body temperature, commonly called cold-blooded. All reptiles and amphibians are ectotherms — this is why heating and thermal gradients are so important.", cat: "Biology" },
  { term: "Enclosure", def: "The housing unit for a captive reptile or amphibian. Also called a vivarium, terrarium, or tank depending on the style.", cat: "Husbandry" },
  { term: "Feeding response", def: "The instinctive reaction of a snake or lizard to the presence of food or food smells. A strong feeding response means accidental bites can occur if hands smell like prey.", cat: "Behaviour" },
  { term: "Fossorial", def: "Describes animals that burrow or live underground. Woma Pythons and some skinks are fossorial and need deep substrate for natural burrowing behaviour.", cat: "Biology" },
  { term: "Gravid", def: "The reptile equivalent of pregnant. A gravid female is carrying eggs or developing young. Gravid females may refuse food and require a suitable egg-laying site.", cat: "Breeding" },
  { term: "Gut loading", def: "Feeding nutritious food to feeder insects before offering them to a reptile. Gut-loaded insects pass on more nutrients to the animal eating them.", cat: "Nutrition" },
  { term: "Hook training", def: "Using a snake hook to touch a snake before picking it up, signalling handling rather than feeding time. Essential for reducing feeding response bites in pythons.", cat: "Husbandry" },
  { term: "Humidity", def: "The amount of moisture in the air. Different species require different humidity levels. Too low causes shedding problems; too high causes respiratory infections.", cat: "Husbandry" },
  { term: "IBD", def: "Inclusion Body Disease. A serious fatal viral disease affecting pythons. Symptoms include regurgitation, loss of coordination, and stargazing. No treatment — strict quarantine is critical.", cat: "Health" },
  { term: "Impaction", def: "A potentially fatal condition where a reptile cannot pass material through its digestive system. Often caused by ingesting substrate or oversized prey. Symptoms include lethargy and a swollen abdomen.", cat: "Health" },
  { term: "Incubation", def: "Keeping reptile eggs at the correct temperature and humidity to ensure successful hatching. Most Australian python eggs are incubated at 30–32°C for 55–65 days.", cat: "Breeding" },
  { term: "Licence", def: "A legal permit required to keep native Australian reptiles and amphibians in captivity. Categories vary by species and state. All reptiles must be purchased from a licensed breeder.", cat: "Legal" },
  { term: "Live food", def: "Prey items that are alive when offered. Generally not recommended — live prey can injure the reptile. Pre-killed or frozen/thawed prey is safer for both animal and owner.", cat: "Nutrition" },
  { term: "MBD", def: "Metabolic Bone Disease. A serious preventable condition caused by insufficient calcium and/or Vitamin D3 (often from inadequate UVB). Symptoms include soft bones, tremors, and difficulty moving.", cat: "Health" },
  { term: "Mites", def: "Tiny external parasites appearing as moving dots on a reptile's skin. Require treatment of both the animal and complete disinfection of the enclosure.", cat: "Health" },
  { term: "Morph", def: "A genetic variation resulting in different colouration or pattern from the wild type. Common in Bearded Dragons and Leopard Geckos. Morphs are selectively bred in captivity.", cat: "Breeding" },
  { term: "Nocturnal", def: "Describes animals active at night and sleeping during the day. Children's Pythons, geckos, and many frogs are nocturnal and generally don't require strong UVB lighting.", cat: "Behaviour" },
  { term: "Oviparous", def: "Describes species that reproduce by laying eggs. Most Australian pythons and many lizards are oviparous.", cat: "Breeding" },
  { term: "Ovoviviparous", def: "Describes species where eggs develop and hatch inside the mother's body and young are born live. Some skinks and lizards are ovoviviparous.", cat: "Breeding" },
  { term: "Palpation", def: "Gently feeling a reptile's body to check for eggs, health issues, or abnormalities. Should only be done by experienced keepers or vets.", cat: "Health" },
  { term: "Pre-killed prey", def: "Prey humanely killed before being offered to a reptile. Safer than live prey as it cannot injure the snake. Frozen/thawed is the most convenient and safest option.", cat: "Nutrition" },
  { term: "Quarantine", def: "Keeping a newly acquired reptile separate from existing animals for 60–90 days to monitor for illness and prevent disease transmission. Essential for all collections.", cat: "Health" },
  { term: "Regurgitation", def: "When a reptile brings up recently eaten food. Common causes include handling too soon after feeding, low temperatures, or prey too large. Fast for 2 weeks after regurgitation before feeding again.", cat: "Health" },
  { term: "Semi-aquatic", def: "Describes animals living both in and out of water. Eastern Long-necked Turtles and Water Dragons are semi-aquatic and require water access in their enclosures.", cat: "Biology" },
  { term: "Shed", def: "The process of a reptile shedding its outer skin as it grows. Also called ecdysis. Blue eyes and dull skin signal a shed is coming. A healthy shed comes off in one piece.", cat: "Biology" },
  { term: "Spectacles", def: "The transparent scale covering a snake's eyes, shed with the skin during ecdysis. Retained spectacles (eye caps) are a common shedding problem requiring careful attention.", cat: "Biology" },
  { term: "Stomatitis", def: "Inflammation or infection of the mouth, commonly called mouth rot. Signs include redness, swelling, and cheesy discharge around the gums. Requires veterinary treatment.", cat: "Health" },
  { term: "Substrate", def: "The material lining the floor of a reptile's enclosure. Common substrates include coconut coir, topsoil, cypress mulch, and paper. The right choice depends on the species' humidity requirements.", cat: "Husbandry" },
  { term: "Terrestrial", def: "Describes animals living primarily on the ground. Blue-tongue Skinks and Woma Pythons are terrestrial — they need floor space rather than height in their enclosures.", cat: "Biology" },
  { term: "Thermal gradient", def: "The range of temperatures across an enclosure from the warm basking end to the cool end. Allows reptiles to move between temperatures to regulate their body heat naturally.", cat: "Husbandry" },
  { term: "Thermoregulation", def: "How reptiles regulate body temperature by moving between warmer and cooler areas. Unlike mammals, reptiles cannot generate their own heat and rely entirely on external sources.", cat: "Biology" },
  { term: "Thermostat", def: "A device controlling heat sources to maintain correct temperature. Never run heat lamps without a thermostat — it is a fire hazard and can fatally overheat an animal.", cat: "Husbandry" },
  { term: "UVA", def: "Ultraviolet A light. Affects reptile behaviour, appetite, and activity levels. Present in natural sunlight and full-spectrum reptile bulbs.", cat: "Husbandry" },
  { term: "UVB", def: "Ultraviolet B light. Essential for diurnal reptiles to synthesise Vitamin D3, enabling calcium absorption. Without UVB, reptiles develop MBD. Use a T5 HO tube rated for reptiles.", cat: "Husbandry" },
  { term: "UVI", def: "UV Index. A measure of ultraviolet radiation intensity. Different species require different UVI levels — Bearded Dragons need a higher UVI than shade-dwelling species.", cat: "Husbandry" },
  { term: "Ventral", def: "Relating to the underside or belly of an animal. Ventral scales in snakes are the large scales on the underside used for movement.", cat: "Biology" },
  { term: "Viviparous", def: "Describes species that give birth to live young rather than laying eggs. Some skinks and lizards are viviparous.", cat: "Breeding" },
  { term: "Vivarium", def: "Another term for a reptile enclosure or terrarium. Can refer to any enclosed habitat for keeping reptiles or amphibians.", cat: "Husbandry" },
  { term: "Wild type", def: "The natural colouration and pattern of a species as it appears in the wild, before selective breeding for different morphs or colour variations.", cat: "Breeding" },
];
