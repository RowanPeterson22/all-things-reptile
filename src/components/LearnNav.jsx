import ScrollRow from "./ScrollRow";
import { SEG } from "./Segmented";

// ─── Learn sub-nav ───────────────────────────────────────────────
// The row under the Learn title (Species, Care guides, Licencing, Glossary):
// only the ones this visitor can see, titles from /admin → Sections. Drawn as
// the Segmented track (Rowan, 11 Nov 2026: one look for every sub-menu), the
// active one raised. Scrolls sideways if the titles get long.

const LearnNav = ({ items, active, onGo }) => (
  <div style={{ paddingBottom: 14 }}>
    <ScrollRow tone="ink" role="tablist" aria-label="Learn" data-testid="learn-nav" label="More topics" style={SEG.track}>
      {items.map(i => {
        const on = i.path === active;
        return (
          <button key={i.key} type="button" role="tab" aria-selected={on} onClick={() => onGo(i.path)} style={SEG.item(on, 10)}>
            {i.title}
          </button>
        );
      })}
    </ScrollRow>
  </div>
);

export default LearnNav;
