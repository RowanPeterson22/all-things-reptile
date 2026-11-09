import { UI } from "./appUi";
import ScrollRow from "./ScrollRow";

// ─── Learn sub-nav ───────────────────────────────────────────────
// The segmented row under the search bar on the Learn tab's screens (Species,
// Care guides, Licencing, Glossary): only the ones this visitor can see,
// titles from /admin → Sections. Scrolls sideways if the titles get long.

const LearnNav = ({ items, active, onGo }) => (
  <ScrollRow tone="dark" role="tablist" aria-label="Learn" data-testid="learn-nav" label="More topics"
    style={{ display: "flex", gap: 6, margin: "0 -20px", padding: "0 20px 12px" }}>
    {items.map(i => {
      const on = i.path === active;
      return (
        <button key={i.key} type="button" role="tab" aria-selected={on} onClick={() => onGo(i.path)}
          style={{ flexShrink: 0, border: "none", borderRadius: 999, padding: `0 ${UI.pill.padX}px`, minHeight: UI.pill.height, fontSize: UI.pill.size, fontWeight: on ? 700 : 500, fontFamily: "inherit", cursor: "pointer", whiteSpace: "nowrap",
            background: on ? UI.accent : UI.pill.bg, color: on ? UI.onAccent : UI.pill.fg }}>
          {i.title}
        </button>
      );
    })}
  </ScrollRow>
);

export default LearnNav;
