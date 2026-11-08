import { useState } from "react";
import { C } from "../../constants/colours";
import SectionLabel from "../../components/SectionLabel";
import WarnBox from "../../components/WarnBox";
import ScrollRow from "../../components/ScrollRow";

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
        <ScrollRow tone="dark" style={{ display: "flex", borderBottom: "0.5px solid rgba(255,255,255,0.2)", margin: "0 -20px", padding: "0 20px", gap: 4, overflowX: "auto", scrollbarWidth: "none" }}>
          {tabs.map(t => <button key={t} onClick={() => setTab(t)} style={{ background: "none", border: "none", borderBottom: tab === t ? "2px solid #fff" : "2px solid transparent", color: tab === t ? "white" : "rgba(255,255,255,0.55)", fontSize: 12, fontWeight: 700, padding: "8px 12px", cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap", marginBottom: -1, textTransform: "capitalize" }}>{t}</button>)}
        </ScrollRow>
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

export default HealthPage;
