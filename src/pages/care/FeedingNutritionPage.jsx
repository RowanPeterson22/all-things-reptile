import { T } from "../../constants/theme";
import { useState } from "react";
import SectionLabel from "../../components/SectionLabel";
import WarnBox from "../../components/WarnBox";
import HealthItem from "../../components/HealthItem";
import CareGuideHeader from "../../components/CareGuideHeader";

// ─── Feeding & Nutrition page ─────────────────────────────────────
const FeedingNutritionPage = ({ onBack }) => {
  const [tab, setTab] = useState("basics");
  const tabs = ["basics", "by species", "supplements", "problems"];
  return (
    <div style={{ flex: 1, overflowY: "auto" }}>
      <CareGuideHeader onBack={onBack} emoji="🦗" title="Feeding & Nutrition" subtitle="Diet, supplements & frequency" tabs={tabs} tab={tab} onTab={setTab} />
      <div style={{ background: "transparent", padding: "16px 16px 40px" }}>
        {tab === "basics" && <>
          <p style={{ fontSize: 15, color: T.body, lineHeight: 1.6, marginBottom: 14 }}>Getting nutrition right is critical for long-term health. Australian reptiles fall into three broad dietary categories — insectivores, carnivores, and omnivores. Understanding which category your reptile belongs to and how that changes with age is fundamental to keeping them healthy.</p>
          {[
            ["🦗", "Insectivores", "Feed exclusively on insects. Geckos and most small lizards. Require a variety of live insects gut-loaded and dusted with supplements. Variety is key — no single feeder insect provides complete nutrition.", T.chipBg],
            ["🐭", "Carnivores", "Feed on vertebrate prey. All pythons and large snakes. Rodents form the basis of the captive diet. Always feed pre-killed or frozen/thawed — never live prey.", T.noBg],
            ["🥗", "Omnivores", "Eat both animal protein and plant matter. Blue-tongue skinks, bearded dragons, and many other lizards. Diet varies significantly with age — juveniles need more protein, adults more vegetables.", T.chipBg],
          ].map(([icon, name, desc, bg]) => (
            <div key={name} style={{ background: bg, borderRadius: 12, padding: "13px 14px", marginBottom: 10, border: "none" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                <span style={{ fontSize: 26 }}>{icon}</span>
                <div style={{ fontSize: 14, fontWeight: 700 }}>{name}</div>
              </div>
              <div style={{ fontSize: 14, color: T.body, lineHeight: 1.6 }}>{desc}</div>
            </div>
          ))}
          <SectionLabel>Feeding frequency by age</SectionLabel>
          {[
            ["Hatchlings (0–3 months)", "Daily or every second day"],
            ["Juveniles (3–12 months)", "Every 1–2 days"],
            ["Sub-adults (1–2 years)", "Every 2–3 days"],
            ["Adults (2+ years)", "Every 3–7 days depending on species"],
          ].map(([age, freq]) => (
            <div key={age} style={{ background: T.card, borderRadius: 14, padding: "10px 12px", marginBottom: 8, border: "none", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontSize: 14, color: T.body }}>{age}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: T.accentText }}>{freq}</div>
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
            <div key={title} style={{ background: T.card, borderRadius: 14, padding: "13px 14px", marginBottom: 12, border: "none" }}>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{title}</div>
              <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 8, background: T.chipBg, color: T.accentText, marginBottom: 10, display: "inline-block" }}>{type}</span>
              {items.map(([label, detail]) => (
                <div key={label} style={{ marginTop: 8, paddingTop: 8, borderTop: `1px solid ${T.rule}` }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: T.accentText, marginBottom: 2 }}>{label}</div>
                  <div style={{ fontSize: 14, color: T.body, lineHeight: 1.5 }}>{detail}</div>
                </div>
              ))}
            </div>
          ))}
        </>}
        {tab === "supplements" && <>
          <p style={{ fontSize: 15, color: T.body, lineHeight: 1.6, marginBottom: 14 }}>Feeder insects alone are nutritionally incomplete. Supplementation bridges the gap. See the Feeder Guide for full details — this is a quick reference summary.</p>
          {[
            ["Calcium + D3", "Critical", "Dust all insects before every feed for juveniles. Every other feed for adults. D3 aids calcium absorption. Essential for bone health and preventing MBD.", T.noBg, T.no],
            ["Calcium without D3", "For UVB keepers", "Use this if your reptile has strong UVB lighting — they synthesise D3 naturally from UV. Alternate with D3 version once or twice per month.", T.infoBg, T.info],
            ["Multivitamin powder", "Weekly", "Provides vitamins A, E and other micronutrients. Use 1–2 times per week — not every feed. Over-supplementation of vitamins can be harmful.", T.chipBg, T.chip],
            ["Gut loading feeders", "Always", "Feed feeder insects nutritious food 24–48 hours before feeding them to your reptile. See Feeder Guide for best gut-loading foods.", T.chipBg, T.accentText],
          ].map(([name, freq, desc, bg, col]) => (
            <div key={name} style={{ background: bg, borderRadius: 12, padding: "12px 14px", marginBottom: 10, border: "none" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{name}</div>
                <span style={{ fontSize: 11, fontWeight: 700, color: col }}>{freq}</span>
              </div>
              <div style={{ fontSize: 14, color: T.body, lineHeight: 1.5 }}>{desc}</div>
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

export default FeedingNutritionPage;
