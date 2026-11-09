import { T } from "../constants/theme";
import { UI } from "./appUi";
import ScrollRow from "./ScrollRow";

// ─── Learn sub-nav ───────────────────────────────────────────────
// The pill row under the Learn title (Species, Care guides, Licencing,
// Glossary): only the ones this visitor can see, titles from /admin →
// Sections. Active pill orange, the rest dark. Scrolls sideways if the
// titles get long.

const LearnNav = ({ items, active, onGo }) => (
  <ScrollRow tone="ink" role="tablist" aria-label="Learn" data-testid="learn-nav" label="More topics"
    style={{ display: "flex", gap: 8, margin: "0 -16px", padding: "0 16px 14px" }}>
    {items.map(i => {
      const on = i.path === active;
      return (
        <button key={i.key} type="button" role="tab" aria-selected={on} onClick={() => onGo(i.path)}
          style={{ flexShrink: 0, border: "none", borderRadius: 999, padding: `0 ${UI.pill.padX + 2}px`, minHeight: UI.pill.height, fontSize: 14, fontWeight: on ? 700 : 600, fontFamily: "inherit", cursor: "pointer", whiteSpace: "nowrap",
            background: on ? T.accent : T.card, color: on ? T.onAccent : T.muted }}>
          {i.title}
        </button>
      );
    })}
  </ScrollRow>
);

export default LearnNav;
