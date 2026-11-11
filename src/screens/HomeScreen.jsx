import { Fragment } from "react";
import { UI } from "../components/appUi";
import { SectionHeading, FeaturedCard, PlanningCard, TileGrid } from "../components/SectionTiles";
import { visibleModules } from "../home/homeModules";

// ─── Home (/) ─────────────────────────────────────────────────────
// An ordered set of blocks; the order is set in /admin → Sections
// (app_layout.home_blocks): personal, featured, explore. (Search is the round
// button in the header on every screen; the old Home search bar is gone, and a
// stored "search" block is ignored.)
//   personal  the keeper's own modules (src/home/homeModules.jsx); while all
//             are empty, one compact "Planning your first reptile?" card.
//   featured  the section picked in /admin → Sections, if this visitor sees it
//   explore   every section this visitor can see, as two-column tiles
// A block with nothing to show is left out.

const HomeScreen = ({ shell, tiles = shell.tiles, onEdit, onOpen, profileTab }) => {
  const open = (item) => onOpen(item.path);
  const modules = visibleModules(shell, onOpen);
  const blocks = shell.homeBlocks.filter(b => (
    b === "personal" ? modules.length > 0
        : b === "featured" ? Boolean(shell.featured)
          : b === "explore" ? shell.tiles.length > 0 : false));

  const body = (b) => {
    if (b === "featured") return <FeaturedCard item={shell.featured} onOpen={open} />;
    if (b === "explore") return (
      <section>
        {/* The Edit button is a 44 px target; the negative margins keep the
            heading where it was. */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, margin: onEdit ? "-15px 0 0" : 0 }}>
          <SectionHeading style={onEdit ? { margin: 0 } : undefined}>Explore</SectionHeading>
          {onEdit && <button type="button" data-testid="home-edit-link" onClick={onEdit} aria-label="Edit Home tiles"
            style={{ marginRight: -8, minHeight: 44, padding: "0 8px", border: "none", background: "none", color: UI.accentText, fontSize: 13, fontWeight: 700, fontFamily: UI.font, cursor: "pointer" }}>Edit</button>}
        </div>
        {tiles.length
          ? <TileGrid testId="explore-grid" items={tiles} onOpen={open} />
          : <p data-testid="explore-empty" style={{ margin: 0, fontSize: 14, color: UI.muted, lineHeight: 1.55 }}>You've hidden every tile. Tap Edit to bring some back; everything is still in the menu.</p>}
      </section>
    );
    // personal
    const filled = modules.filter(m => !m.module.isEmpty(m.ctx));
    if (!filled.length) return <PlanningCard onOpen={() => onOpen(profileTab ? profileTab.path : "/profile")} profileLabel={profileTab ? profileTab.label : "My Profile"} />;
    return <div style={{ display: "flex", flexDirection: "column", gap: UI.gap }}>{filled.map(m => <Fragment key={m.module.key}>{m.module.render(m.ctx)}</Fragment>)}</div>;
  };

  return (
    <div data-testid="home" style={{ flex: 1 }}>
      <div style={{ padding: `8px ${UI.pad}px ${UI.pad}px`, display: "flex", flexDirection: "column", gap: UI.blockGap }}>
        {blocks.map(b => <div key={b} data-block={b}>{body(b)}</div>)}
      </div>
    </div>
  );
};

export default HomeScreen;
