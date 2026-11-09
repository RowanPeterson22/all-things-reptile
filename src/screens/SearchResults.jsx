import { T } from "../constants/theme";
import Icon, { CARE_ICON } from "../components/Icon";
import { IconBadge } from "../components/SectionTiles";
import { SPECIES } from "../data/species";
import { CARE_GUIDES } from "../data/careGuides";
import { GLOSSARY_TERMS } from "../data/glossary";

// ─── Search Results screen ────────────────────────────────────────
// show: which result groups this visitor may open (per-tester sections).
const ALL_GROUPS = { species: true, care: true, glossary: true };
const SearchResults = ({ query, onNavigate, show = ALL_GROUPS }) => {
  const q = query.toLowerCase();

  const speciesResults = !show.species ? [] : SPECIES.filter(s =>
    s.name.toLowerCase().includes(q) ||
    s.latin.toLowerCase().includes(q) ||
    s.type.toLowerCase().includes(q) ||
    s.level.toLowerCase().includes(q)
  );

  const careResults = !show.care ? [] : CARE_GUIDES.filter(g =>
    g.title.toLowerCase().includes(q) ||
    g.sub.toLowerCase().includes(q)
  );

  const glossaryResults = !show.glossary ? [] : GLOSSARY_TERMS.filter(t =>
    t.term.toLowerCase().includes(q) ||
    t.def.toLowerCase().includes(q)
  );

  const totalResults = speciesResults.length + careResults.length + glossaryResults.length;

  const levelColour = (level) => {
    if (level === "Beginner") return { bg: T.okBg, color: T.ok };
    if (level === "Intermediate") return { bg: T.chipBg, color: T.chip };
    return { bg: T.noBg, color: T.no };
  };
  const row = (open) => ({ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", minHeight: 56, borderBottom: `1px solid ${T.rule}`, cursor: open ? "pointer" : "default" });
  const chev = <span aria-hidden="true" style={{ color: T.muted }}><Icon name="chevron" size={16} /></span>;

  if (totalResults === 0) return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 40, color: T.muted }}>
      <div style={{ marginBottom: 16, color: T.muted }}><Icon name="search" size={44} strokeWidth={1.6} /></div>
      <div style={{ fontSize: 17, fontWeight: 700, color: T.text, marginBottom: 8 }}>No results found</div>
      <div style={{ fontSize: 14, textAlign: "center", lineHeight: 1.6 }}>Try searching for a species name, type (e.g. "gecko"), or care topic</div>
    </div>
  );

  const SectionHead = ({ icon, title, count }) => (
    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "18px 0 6px" }}>
      <span aria-hidden="true" style={{ color: T.accentText }}><Icon name={icon} size={18} /></span>
      <h2 style={{ margin: 0, fontSize: 13, fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: "0.08em" }}>{title}</h2>
      <div style={{ marginLeft: "auto", fontSize: 12, fontWeight: 700, color: T.chip, background: T.chipBg, padding: "2px 9px", borderRadius: 999 }}>{count}</div>
    </div>
  );

  return (
    <div style={{ flex: 1, padding: "0 16px" }}>
      <div style={{ padding: "4px 0 0", fontSize: 14, color: T.muted }}>
        {totalResults} result{totalResults !== 1 ? "s" : ""} for <span style={{ fontWeight: 700, color: T.text }}>"{query}"</span>
      </div>

      {speciesResults.length > 0 && <>
        <SectionHead icon="lizard" title="Species" count={speciesResults.length} />
        {speciesResults.map(s => {
          const lc = levelColour(s.level);
          return (
            <div key={s.id} onClick={() => s.page && onNavigate(s.page)}
              style={{ ...row(s.page), opacity: s.page ? 1 : 0.8 }}>
              <div aria-hidden="true" style={{ width: 44, height: 44, borderRadius: 12, background: T.card, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>{s.emoji}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: T.text, marginBottom: 2 }}>{s.name}</div>
                <div style={{ fontSize: 13, color: T.muted, fontStyle: "italic", marginBottom: 5 }}>{s.latin}</div>
                <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 9px", borderRadius: 999, background: lc.bg, color: lc.color }}>{s.level}</span>
              </div>
              {chev}
            </div>
          );
        })}
      </>}

      {careResults.length > 0 && <>
        <SectionHead icon="care" title="Care Guides" count={careResults.length} />
        {careResults.map(g => (
          <div key={g.id} onClick={() => g.page && onNavigate(g.page)}
            style={{ ...row(g.page), opacity: g.page ? 1 : 0.5 }}>
            {CARE_ICON[g.icon] ? <IconBadge name={CARE_ICON[g.icon]} size={44} /> : <div aria-hidden="true" style={{ width: 44, height: 44, borderRadius: 12, background: T.chipBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>{g.icon}</div>}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: T.text, marginBottom: 2 }}>{g.title}</div>
              <div style={{ fontSize: 13, color: T.muted }}>{g.sub}</div>
            </div>
            {chev}
          </div>
        ))}
      </>}

      {glossaryResults.length > 0 && <>
        <SectionHead icon="glossary" title="Glossary" count={glossaryResults.length} />
        {glossaryResults.map(t => (
          <div key={t.term} style={{ padding: "12px 0", borderBottom: `1px solid ${T.rule}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: T.text }}>{t.term}</div>
              <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 9px", borderRadius: 999, background: T.chipBg, color: T.chip }}>{t.cat}</span>
            </div>
            <div style={{ fontSize: 14, color: T.body, lineHeight: 1.55 }}>{t.def}</div>
          </div>
        ))}
      </>}

      <div style={{ height: 20 }} />
    </div>
  );
};

export default SearchResults;
