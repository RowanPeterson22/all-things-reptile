import { useState } from "react";
import { C } from "../constants/colours";
import { SPECIES } from "../data/species";
import { CATEGORIES } from "../data/categories";
import LevelBadge from "../components/LevelBadge";
import BackButton from "../components/BackButton";
import { usePublicPhotos } from "../components/SpeciesGallery";
import { CreditedImage } from "../components/PhotoCredit";

const BrowseScreen = ({ onSpecies }) => {
  const [category, setCategory] = useState(null);
  // Each species' first chosen photo replaces its emoji on the cards.
  const allPhotos = usePublicPhotos(null, { all: !!category }); // only once a category is open
  const firstPhoto = {};
  allPhotos.forEach(p => { if (p.species && !firstPhoto[p.species]) firstPhoto[p.species] = p; });

  if (category) {
    const catSpecies = SPECIES.filter(s => s.type === category);
    const cat = CATEGORIES.find(c => c.id === category);
    return (
      <div style={{ flex: 1, overflowY: "auto" }}>
        <div style={{ background: C.green, padding: "calc(env(safe-area-inset-top, 0px) + 8px) 18px 0" }}>
          <BackButton onClick={() => setCategory(null)} marginBottom={12}>‹ All categories</BackButton>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <div style={{ fontSize: 36 }}>{cat.emoji}</div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 700, color: "white" }}>{cat.label}</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.9)" }}>{catSpecies.length} species</div>
            </div>
          </div>
        </div>
        <div style={{ padding: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {catSpecies.map(sp => (
              <div key={sp.id} onClick={() => sp.page && onSpecies(sp.page)} style={{ background: "white", borderRadius: 14, border: "0.5px solid #e8e8e4", overflow: "hidden", cursor: sp.page ? "pointer" : "default", opacity: sp.page ? 1 : 0.8 }}>
                {firstPhoto[sp.slug] ? (
                  <CreditedImage src={firstPhoto[sp.slug].url} alt={sp.name} credit={firstPhoto[sp.slug].credit} focal={firstPhoto[sp.slug].focal}
                    style={{ height: 96, background: sp.bg }} />
                ) : (
                  <div style={{ height: 96, background: sp.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36 }}>{sp.emoji}</div>
                )}
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
      </div>
    );
  }

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>
      <div style={{ background: C.green, borderRadius: 14, padding: 16, marginBottom: 16, display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }} onClick={() => onSpecies("bluetongue")}>
        <div style={{ fontSize: 40 }}>🦎</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.85)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 4 }}>Featured species</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "white", marginBottom: 2 }}>Blue-tongue Skink</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.9)" }}>Great beginner reptile ↗</div>
        </div>
      </div>
      <div style={{ fontSize: 11, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 12 }}>Browse by category</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {CATEGORIES.map(cat => (
          <div key={cat.id} onClick={() => setCategory(cat.id)}
            style={{ background: "white", borderRadius: 14, border: "0.5px solid #e8e8e4", overflow: "hidden", cursor: "pointer" }}>
            <div style={{ height: 90, background: cat.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 42 }}>{cat.emoji}</div>
            <div style={{ padding: "10px 12px 12px" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#111", marginBottom: 4 }}>{cat.label}</div>
              <div style={{ fontSize: 11, color: "#777", lineHeight: 1.4, marginBottom: 5 }}>{cat.desc}</div>
              <div style={{ fontSize: 10, fontWeight: 700, color: C.green }}>{cat.count} species →</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BrowseScreen;
