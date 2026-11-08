import { useState } from "react";
import { Link } from "react-router-dom";
import { C } from "../constants/colours";
import { GLOSSARY_TERMS } from "../data/glossary";
import ScrollRow from "../components/ScrollRow";
import SearchField from "../components/SearchField";

// ─── Glossary screen ─────────────────────────────────────────────
const GlossaryScreen = ({ showCredits = true }) => {
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
      <div style={{ background: C.green, padding: "calc(env(safe-area-inset-top, 0px) + 16px) 18px 0" }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.85)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 4 }}>Reference</div>
        <div style={{ fontSize: 20, fontWeight: 700, color: "white", marginBottom: 14, lineHeight: 1.2 }}>Reptile Glossary</div>
        <SearchField value={search} onChange={e => setSearch(e.target.value)} onClear={() => setSearch("")} placeholder="Search terms..." label="Search terms"
          size={13} radius={10} padX={12} padY={11} marginBottom={3} clearSize={16} clearAlpha={0.5} />
        {/* Each chip is a 40px-tall tap target; the visible pill sits inside it. */}
        <ScrollRow tone="dark" style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 3, scrollbarWidth: "none" }}>
          {categories.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)} aria-pressed={activeCategory === cat} style={{
              padding: "9px 0", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", flexShrink: 0,
            }}>
              <span style={{
                display: "block", padding: "4px 12px", borderRadius: 20, fontSize: 11, fontWeight: 700, whiteSpace: "nowrap",
                background: activeCategory === cat ? "white" : "rgba(255,255,255,0.15)",
                color: activeCategory === cat ? C.green : "rgba(255,255,255,0.9)",
              }}>{cat}</span>
            </button>
          ))}
        </ScrollRow>
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
        {showCredits && <div style={{ padding: "0 18px 5px", fontSize: 11, textAlign: "center", marginTop: -13 }}>
          <Link to="/credits" style={{ color: C.muted, textDecoration: "underline", textUnderlineOffset: 2, display: "inline-block", padding: "13px 12px" }}>Photo credits</Link>
        </div>}
      </div>
    </div>
  );
};

export default GlossaryScreen;
