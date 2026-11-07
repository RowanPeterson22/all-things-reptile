import { C } from "../constants/colours";
import { SPECIES } from "../data/species";
import { CARE_GUIDES } from "../data/careGuides";
import { GLOSSARY_TERMS } from "../data/glossary";

// ─── Search Results screen ────────────────────────────────────────
const SearchResults = ({ query, onNavigate }) => {
  const q = query.toLowerCase();

  const speciesResults = SPECIES.filter(s =>
    s.name.toLowerCase().includes(q) ||
    s.latin.toLowerCase().includes(q) ||
    s.type.toLowerCase().includes(q) ||
    s.level.toLowerCase().includes(q)
  );

  const careResults = CARE_GUIDES.filter(g =>
    g.title.toLowerCase().includes(q) ||
    g.sub.toLowerCase().includes(q)
  );

  const glossaryResults = GLOSSARY_TERMS.filter(t =>
    t.term.toLowerCase().includes(q) ||
    t.def.toLowerCase().includes(q)
  );

  const totalResults = speciesResults.length + careResults.length + glossaryResults.length;

  const levelColour = (level) => {
    if (level === "Beginner") return { bg: C.greenPale, color: C.green };
    if (level === "Intermediate") return { bg: C.goldLight, color: "#7a5a1e" };
    return { bg: C.redPale, color: C.red };
  };

  if (totalResults === 0) return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 40, color: "#aaa" }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
      <div style={{ fontSize: 16, fontWeight: 700, color: "#555", marginBottom: 8 }}>No results found</div>
      <div style={{ fontSize: 13, textAlign: "center", lineHeight: 1.6 }}>Try searching for a species name, type (e.g. "gecko"), or care topic</div>
    </div>
  );

  const SectionHead = ({ icon, title, count }) => (
    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "14px 16px 8px", borderBottom: "0.5px solid #f0f0ec" }}>
      <span style={{ fontSize: 16 }}>{icon}</span>
      <div style={{ fontSize: 11, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.07em" }}>{title}</div>
      <div style={{ marginLeft: "auto", fontSize: 10, fontWeight: 700, color: C.green, background: C.greenPale, padding: "2px 8px", borderRadius: 8 }}>{count}</div>
    </div>
  );

  return (
    <div style={{ flex: 1, overflowY: "auto", background: "white" }}>
      <div style={{ padding: "12px 16px 6px", fontSize: 12, color: "#999" }}>
        {totalResults} result{totalResults !== 1 ? "s" : ""} for <span style={{ fontWeight: 700, color: "#555" }}>"{query}"</span>
      </div>

      {speciesResults.length > 0 && <>
        <SectionHead icon="🦎" title="Species" count={speciesResults.length} />
        {speciesResults.map(s => {
          const lc = levelColour(s.level);
          return (
            <div key={s.id} onClick={() => onNavigate(s.page)}
              style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderBottom: "0.5px solid #f8f8f6", cursor: "pointer" }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>{s.emoji}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#111", marginBottom: 2 }}>{s.name}</div>
                <div style={{ fontSize: 11, color: "#999", fontStyle: "italic", marginBottom: 4 }}>{s.latin}</div>
                <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 8, background: lc.bg, color: lc.color }}>{s.level}</span>
              </div>
              <span style={{ color: "#ccc", fontSize: 16 }}>›</span>
            </div>
          );
        })}
      </>}

      {careResults.length > 0 && <>
        <SectionHead icon="📖" title="Care Guides" count={careResults.length} />
        {careResults.map(g => (
          <div key={g.id} onClick={() => g.page && onNavigate(g.page)}
            style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderBottom: "0.5px solid #f8f8f6", cursor: g.page ? "pointer" : "default", opacity: g.page ? 1 : 0.5 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: C.greenPale, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>{g.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#111", marginBottom: 2 }}>{g.title}</div>
              <div style={{ fontSize: 11, color: "#999" }}>{g.sub}</div>
            </div>
            <span style={{ color: "#ccc", fontSize: 16 }}>›</span>
          </div>
        ))}
      </>}

      {glossaryResults.length > 0 && <>
        <SectionHead icon="📚" title="Glossary" count={glossaryResults.length} />
        {glossaryResults.map(t => (
          <div key={t.term} style={{ padding: "12px 16px", borderBottom: "0.5px solid #f8f8f6" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#111" }}>{t.term}</div>
              <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 8, background: C.greenPale, color: C.green }}>{t.cat}</span>
            </div>
            <div style={{ fontSize: 12, color: "#666", lineHeight: 1.5 }}>{t.def}</div>
          </div>
        ))}
      </>}

      <div style={{ height: 20 }} />
    </div>
  );
};

export default SearchResults;
