import { T } from "../constants/theme";
import { CARE_GUIDES } from "../data/careGuides";
import { IconBadge } from "../components/SectionTiles";
import Icon, { CARE_ICON } from "../components/Icon";

// ─── Care guides (Learn → Care guides) ───────────────────────────
// One dark row per guide: a line-icon badge (the guide's emoji mapped to a
// line icon), title, line about it, chevron.
const CareScreen = ({ onGuide }) => (
  <div style={{ flex: 1, padding: "4px 16px 16px" }}>
    <h2 style={{ margin: "0 0 12px", fontSize: 13, fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: "0.08em" }}>Care guide topics</h2>
    {CARE_GUIDES.map(g => (
      <div key={g.id} role={g.page ? "link" : undefined} tabIndex={g.page ? 0 : undefined} onClick={() => g.page && onGuide(g.page)}
        onKeyDown={(e) => { if (g.page && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); onGuide(g.page); } }}
        style={{ background: T.card, borderRadius: 16, padding: 14, marginBottom: 10, display: "flex", alignItems: "center", gap: 14, cursor: g.page ? "pointer" : "default", opacity: g.page ? 1 : 0.8, minHeight: 72, boxSizing: "border-box" }}>
        {CARE_ICON[g.icon]
          ? <IconBadge name={CARE_ICON[g.icon]} size={44} />
          : <div aria-hidden="true" style={{ width: 44, height: 44, borderRadius: 12, background: T.chipBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>{g.icon}</div>}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: T.text, marginBottom: 2 }}>{g.title}</div>
          <div style={{ fontSize: 13, color: T.muted, lineHeight: 1.4 }}>{g.sub}</div>
          {!g.page && <div style={{ fontSize: 11, color: T.muted, marginTop: 3 }}>Coming soon</div>}
        </div>
        <span aria-hidden="true" style={{ color: T.muted }}><Icon name="chevron" size={18} /></span>
      </div>
    ))}
  </div>
);

export default CareScreen;
