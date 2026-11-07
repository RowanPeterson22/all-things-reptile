import { useState } from "react";
import { C } from "../../constants/colours";
import InsectCard from "../../components/InsectCard";
import WarnBox from "../../components/WarnBox";

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

          <WarnBox type="red" title="Dubia roaches are illegal in Australia">Dubia roaches (Blaptica dubia) aren't on the federal Live Import List, so keeping, breeding or selling them is illegal in every state and territory. Federal authorities seized over 100,000 exotic cockroaches from a NSW breeder in June 2026 and warned keepers to switch to legal feeders. Use Wood Roaches instead — they fill the same role.</WarnBox>

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
            name="Cockroach Nymphs (Baby Woodies)"
            protein="High"
            fat="Low"
            calcium="Poor — dust every feed"
            availability="⭐⭐⭐⭐ From roach colony keepers"
            best="Hatchling and juvenile reptiles. Small geckos and frogs."
            notes="Baby roaches (nymphs) are one of the best feeders for hatchling reptiles — small, soft-bodied, nutritious, and very active. If you keep a Woody colony you will have a constant supply of nymphs. Far superior to pinhead crickets for very small animals."
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

export default FeederGuidePage;
