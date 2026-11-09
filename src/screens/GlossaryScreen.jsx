import { useState } from "react";
import { Link } from "react-router-dom";
import { T } from "../constants/theme";
import { GLOSSARY_TERMS } from "../data/glossary";
import ScrollRow from "../components/ScrollRow";
import SearchField from "../components/SearchField";

// ─── Glossary screen ─────────────────────────────────────────────
const GlossaryScreen = ({ showCredits = true }) => {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const categories = ["All", "Behaviour", "Biology", "Breeding", "Health", "Husbandry", "Legal", "Nutrition"];
  const CAT_COLOURS = {
    Behaviour: { bg: T.okBg,   color: T.ok },
    Biology:   { bg: T.infoBg, color: T.info },
    Breeding:  { bg: T.chipBg, color: T.chip },
    Health:    { bg: T.noBg,   color: T.no },
    Husbandry: { bg: T.track,  color: T.body },
    Legal:     { bg: T.infoBg, color: T.info },
    Nutrition: { bg: T.chipBg, color: T.chip },
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
    <div style={{ flex: 1 }}>
      <div style={{ padding: "0 16px" }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Reference</div>
        <h2 style={{ margin: "0 0 14px", fontSize: 26, fontWeight: 700, color: T.text, lineHeight: 1.15 }}>Reptile Glossary</h2>
        <SearchField value={search} onChange={e => setSearch(e.target.value)} onClear={() => setSearch("")} placeholder="Search terms..." label="Search terms" marginBottom={4} />
        {/* Each chip is a 44px-tall tap target; the visible pill sits inside it. */}
        <ScrollRow tone="ink" label="Categories" style={{ display: "flex", gap: 6, margin: "0 -16px", padding: "0 16px 4px" }}>
          {categories.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)} aria-pressed={activeCategory === cat} style={{
              padding: "6px 0", minHeight: 44, background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", flexShrink: 0,
            }}>
              <span style={{
                display: "block", padding: "6px 14px", borderRadius: 999, fontSize: 13, fontWeight: 700, whiteSpace: "nowrap",
                background: activeCategory === cat ? T.accent : T.card,
                color: activeCategory === cat ? T.onAccent : T.muted,
              }}>{cat}</span>
            </button>
          ))}
        </ScrollRow>
      </div>

      <div style={{ padding: "8px 0 8px" }}>
        {filtered.length === 0 ? (
          <div style={{ padding: "32px 18px", textAlign: "center", color: T.muted, fontSize: 15 }}>
            No terms found for "{search}"
          </div>
        ) : (
          Object.keys(grouped).sort().map(letter => (
            <div key={letter}>
              <div style={{ padding: "16px 16px 6px", fontSize: 13, fontWeight: 700, color: T.accentText }}>{letter}</div>
              <div style={{ margin: "0 16px", background: T.card, borderRadius: 16, padding: "0 16px" }}>
              {grouped[letter].map((t, i) => {
                const cs = CAT_COLOURS[t.cat] || { bg: T.chipBg, color: T.chip };
                return (
                  <div key={t.term} style={{ padding: "14px 0", borderBottom: i === grouped[letter].length - 1 ? "none" : `1px solid ${T.rule}` }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, marginBottom: 5, flexWrap: "wrap" }}>
                      <div style={{ fontSize: 15, fontWeight: 700, color: T.text, minWidth: 0, flex: "1 1 auto" }}>{t.term}</div>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 999, background: cs.bg, color: cs.color, whiteSpace: "nowrap" }}>{t.cat}</span>
                    </div>
                    <div style={{ fontSize: 14, color: T.body, lineHeight: 1.6 }}>{t.def}</div>
                  </div>
                );
              })}
              </div>
            </div>
          ))
        )}
        <div style={{ padding: "18px 16px", fontSize: 13, color: T.muted, textAlign: "center" }}>
          {filtered.length} term{filtered.length !== 1 ? "s" : ""} {activeCategory !== "All" ? `in ${activeCategory}` : "in glossary"}
        </div>
        {showCredits && <div style={{ padding: "0 16px 5px", fontSize: 13, textAlign: "center", marginTop: -13 }}>
          <Link to="/credits" style={{ color: T.muted, textDecoration: "underline", textUnderlineOffset: 2, display: "inline-block", padding: "12px 12px", minHeight: 44, boxSizing: "border-box" }}>Photo credits</Link>
        </div>}
      </div>
    </div>
  );
};

export default GlossaryScreen;
