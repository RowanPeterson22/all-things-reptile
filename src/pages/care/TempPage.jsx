import { T } from "../../constants/theme";
import { useState } from "react";
import SectionLabel from "../../components/SectionLabel";
import WarnBox from "../../components/WarnBox";
import TempBar, { TempCard } from "../../components/TempBar";
import CareGuideHeader from "../../components/CareGuideHeader";

// ─── Temperature & Heating page ───────────────────────────────────
const TempPage = ({ onBack }) => {
  const [tab, setTab] = useState("basics");
  const tabs = ["basics", "heat sources", "UVB", "night & winter"];
  return (
    <div style={{ flex: 1, overflowY: "auto" }}>
      <CareGuideHeader onBack={onBack} emoji="🌡️" title="Temperature & Heating" subtitle="Basking zones, gradients & UVB" tabs={tabs} tab={tab} onTab={setTab} />
      <div style={{ background: "transparent", padding: "16px 16px 40px" }}>
        {tab === "basics" && <>
          <p style={{ fontSize: 15, color: T.body, lineHeight: 1.6, marginBottom: 14 }}>Reptiles are ectothermic — they rely on external heat sources to regulate their body temperature. Getting temperatures right is the single most important factor in keeping reptiles healthy. Too cold and they cannot digest food, fight disease, or behave normally. Too hot and they suffer heat stress or death.</p>
          <SectionLabel mt={0}>The thermal gradient — essential concept</SectionLabel>
          <div style={{ background: T.card, borderRadius: 14, padding: "12px 14px", border: "none", marginBottom: 12, fontSize: 15, color: T.body, lineHeight: 1.7 }}>Every reptile enclosure must have a temperature gradient — a warm end and a cool end. Your reptile moves between these zones to regulate its own body temperature naturally. Never heat the entire enclosure to one temperature — this removes the reptile's ability to thermoregulate and causes chronic stress.</div>
          <TempCard>
            <TempBar label="Hot spot / basking zone" value="35–45°C (species dependent)" width="90%" color="#e05a2b"/>
            <TempBar label="Warm side ambient" value="28–32°C" width="66%" color="#e0922b"/>
            <TempBar label="Cool side ambient" value="22–26°C" width="44%" color="#4a9e6b"/>
            <TempBar label="Overnight low" value="16–22°C (species dependent)" width="28%" color="#2b7ec0"/>
          </TempCard>
          <WarnBox type="red" title="Always use a thermostat">Any heat source — heat mat, heat lamp, ceramic emitter — must be connected to a thermostat. Uncontrolled heat sources are a leading cause of reptile deaths. This is non-negotiable.</WarnBox>
          <SectionLabel>How to measure temperature</SectionLabel>
          {[
            ["Digital thermometer with probe", "Most accurate. Place the probe at reptile body height at the basking spot and cool end. Essential."],
            ["Infrared temperature gun", "Excellent for quickly checking surface temperatures. Point and shoot at basking rocks, branches, substrate. Great for spot-checking."],
            ["Stick-on dial thermometers", "The least accurate option. Often misread and placed incorrectly. Avoid relying on these alone."],
          ].map(([name, desc]) => (
            <div key={name} style={{ background: T.card, borderRadius: 14, padding: "10px 12px", marginBottom: 8, border: "none" }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 3 }}>{name}</div>
              <div style={{ fontSize: 14, color: T.body, lineHeight: 1.5 }}>{desc}</div>
            </div>
          ))}
        </>}
        {tab === "heat sources" && <>
          <p style={{ fontSize: 15, color: T.body, lineHeight: 1.6, marginBottom: 14 }}>Different heat sources suit different species and setups. Most keepers use a combination. Always connect to a thermostat.</p>
          {[
            ["☀️", "Basking lamp (incandescent/halogen)", "The most natural heat source — mimics sunlight. Creates a focused hot spot above a basking rock or branch. Best for diurnal species like bearded dragons, blue-tongues, and water dragons. Available in various wattages — choose based on enclosure size and required temperature.", "Best for: Lizards & dragons"],
            ["🔥", "Ceramic Heat Emitter (CHE)", "Produces heat without light — useful for supplemental overnight heat or species that don't need bright basking spots. Does not provide UVB. Often used with a dimmer thermostat.", "Best for: Nocturnal species, overnight heat"],
            ["🟫", "Under-tank heat mat (UTH)", "Provides belly heat — important for geckos and snakes that thermoregulate from below. Must be used with a thermostat. Never cover with thick substrate — insulation causes overheating. Place on one side only.", "Best for: Geckos, hatchling snakes"],
            ["💡", "Deep heat projector (DHP)", "A newer technology that penetrates deeper into tissue than standard heat lamps, more closely mimicking solar radiation. Excellent for larger pythons and monitors. Requires a dimmer thermostat.", "Best for: Large pythons, monitors"],
            ["🌿", "Radiant heat panel", "Mounts to the ceiling of the enclosure. Provides ambient warmth from above without a focused hot spot. Good for tropical species needing warm ambient temperatures.", "Best for: Tropical species, rainforest setups"],
          ].map(([icon, name, desc, best]) => (
            <div key={name} style={{ background: T.card, borderRadius: 14, padding: "13px 14px", marginBottom: 10, border: "none" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                <span style={{ fontSize: 24 }}>{icon}</span>
                <div style={{ fontSize: 14, fontWeight: 700 }}>{name}</div>
              </div>
              <div style={{ fontSize: 14, color: T.body, lineHeight: 1.6, marginBottom: 6 }}>{desc}</div>
              <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 8, background: T.chipBg, color: T.accentText }}>{best}</span>
            </div>
          ))}
          <WarnBox type="red" title="Thermostat types matter">Use a ON/OFF thermostat for heat mats. Use a DIMMING thermostat for basking lamps and DHPs. Using the wrong type can damage equipment and create temperature spikes.</WarnBox>
        </>}
        {tab === "UVB" && <>
          <p style={{ fontSize: 15, color: T.body, lineHeight: 1.6, marginBottom: 14 }}>UVB radiation allows reptiles to synthesise Vitamin D3 in their skin, which is essential for calcium absorption. Without adequate UVB, diurnal reptiles develop Metabolic Bone Disease (MBD) — a serious, often fatal condition.</p>
          <SectionLabel mt={0}>Do all reptiles need UVB?</SectionLabel>
          {[
            ["Diurnal lizards & dragons", "YES — essential", "Bearded Dragons, Blue-tongues, Water Dragons, Frilled-neck Lizards. These species bask in direct sunlight in the wild. T5 HO 10.0 or 12% UVB tube required.", T.chipBg, T.accentText],
            ["Diurnal pythons", "STRONGLY RECOMMENDED", "Carpet Pythons, Green Tree Pythons, Womas bask in dappled sunlight. Low-level UVB (T5 HO 6.0) strongly benefits long-term health.", T.chipBg, T.chip],
            ["Nocturnal geckos", "BENEFICIAL", "Despite being nocturnal, research shows geckos benefit from low-level UVB. A T5 HO 2.0 or 6.0 at the top of the enclosure is recommended.", T.chipBg, T.chip],
            ["Turtles", "YES — essential", "Turtles require UVB over their basking platform. T5 HO 10.0 recommended.", T.chipBg, T.accentText],
          ].map(([species, req, detail, bg, col]) => (
            <div key={species} style={{ background: bg, borderRadius: 12, padding: "12px 14px", marginBottom: 10, border: "none" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{species}</div>
                <span style={{ fontSize: 11, fontWeight: 700, color: col }}>{req}</span>
              </div>
              <div style={{ fontSize: 14, color: T.body, lineHeight: 1.5 }}>{detail}</div>
            </div>
          ))}
          <WarnBox type="red" title="Replace UVB tubes every 12 months">UVB output degrades significantly before the tube stops producing visible light. Replace every 6–12 months even if it still glows. Mount inside the enclosure, not on top of mesh — glass and mesh filter UVB significantly.</WarnBox>
          <WarnBox type="gold" title="Ferguson zones">Different species need different UVB intensities based on their natural habitat. Reptiles from open desert environments need higher UVI than forest species. Always research the specific UVI requirements for your species.</WarnBox>
        </>}
        {tab === "night & winter" && <>
          <SectionLabel mt={0}>Overnight temperatures</SectionLabel>
          <div style={{ background: T.card, borderRadius: 14, padding: "12px 14px", border: "none", fontSize: 15, color: T.body, lineHeight: 1.7, marginBottom: 12 }}>Most Australian reptiles tolerate and benefit from a natural temperature drop at night. Turn off basking lamps at night — a ceramic heat emitter or panel heater on a thermostat can maintain a minimum overnight temperature if your home gets cold. Tropical species need warmer nights than cool-climate species.</div>
          {[["Tropical species (northern Australia)", "Min 22–24°C overnight"], ["Temperate species (eastern Australia)", "Min 16–20°C overnight"], ["Cool-climate species (alpine/southern)", "Min 10–15°C overnight — natural cooling beneficial"]].map(([sp, temp]) => (
            <div key={sp} style={{ background: T.card, borderRadius: 14, padding: "10px 12px", marginBottom: 8, border: "none", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontSize: 14, color: T.body, flex: 1 }}>{sp}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: T.accentText }}>{temp}</div>
            </div>
          ))}
          <SectionLabel>Winter & brumation</SectionLabel>
          <div style={{ background: T.card, borderRadius: 14, padding: "12px 14px", border: "none", fontSize: 15, color: T.body, lineHeight: 1.7, marginBottom: 12 }}>Many Australian reptiles naturally brumate (a reptile form of hibernation) during winter. Reduced temperatures, shorter light cycles, and decreased feeding are all normal seasonal behaviours. Do not force-feed brumating reptiles. Allow them to follow their natural seasonal rhythm — this is important for long-term health and breeding success.</div>
          <WarnBox type="gold" title="Vet check before brumation">A health check before brumation is recommended — a sick or underweight reptile should not brumate. Ensure the animal has had a final bowel movement before temperatures drop significantly.</WarnBox>
        </>}
      </div>
    </div>
  );
};

export default TempPage;
