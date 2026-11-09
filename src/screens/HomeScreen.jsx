import { Fragment } from "react";
import { UI } from "../components/appUi";
import SearchField from "../components/SearchField";
import { SectionHeading, FeaturedCard, PlanningCard, TileGrid } from "../components/SectionTiles";
import { visibleModules } from "../home/homeModules";

// ─── Home (/) ─────────────────────────────────────────────────────
// An ordered set of blocks; the order is set in /admin → Sections
// (app_layout.home_blocks): search, personal, featured, explore.
//   search    the search bar (only with the search section). First in the
//             order, it sits in the black header like the old Browse search.
//   personal  the keeper's own modules (src/home/homeModules.jsx); while all
//             are empty, one compact "Planning your first reptile?" card.
//   featured  the section picked in /admin → Sections, if this visitor sees it
//   explore   every section this visitor can see, as two-column tiles
// A block with nothing to show is left out.

const HomeScreen = ({ shell, canSearch, query, onQuery, onClearQuery, onOpen, profileTab }) => {
  const open = (item) => onOpen(item.path);
  const modules = visibleModules(shell, onOpen);
  const blocks = shell.homeBlocks.filter(b => (
    b === "search" ? canSearch
      : b === "personal" ? modules.length > 0
        : b === "featured" ? Boolean(shell.featured)
          : b === "explore" ? shell.tiles.length > 0 : false));

  const search = (inHeader) => (
    <div data-testid="home-search" style={inHeader
      ? { background: UI.searchBand, padding: "0 20px" }
      : { background: UI.searchBand, borderRadius: UI.radius, padding: "12px 12px 0" }}>
      <SearchField placeholder="Search species, care guides, glossary..." value={query} onChange={onQuery} onClear={onClearQuery} marginBottom={inHeader ? 14 : 12} />
    </div>
  );

  const body = (b) => {
    if (b === "search") return search(false);
    if (b === "featured") return <FeaturedCard item={shell.featured} onOpen={open} />;
    if (b === "explore") return <section><SectionHeading>Explore</SectionHeading><TileGrid testId="explore-grid" items={shell.tiles} onOpen={open} /></section>;
    // personal
    const filled = modules.filter(m => !m.module.isEmpty(m.ctx));
    if (!filled.length) return <PlanningCard onOpen={() => onOpen(profileTab ? profileTab.path : "/profile")} profileLabel={profileTab ? profileTab.label : "My Profile"} />;
    return <div style={{ display: "flex", flexDirection: "column", gap: UI.gap }}>{filled.map(m => <Fragment key={m.module.key}>{m.module.render(m.ctx)}</Fragment>)}</div>;
  };

  const lead = blocks[0] === "search" ? search(true) : null;
  const rest = lead ? blocks.slice(1) : blocks;
  return (
    <div data-testid="home" style={{ flex: 1, overflowY: "auto" }}>
      {lead}
      <div style={{ padding: UI.pad, display: "flex", flexDirection: "column", gap: UI.blockGap }}>
        {rest.map(b => <div key={b} data-block={b}>{body(b)}</div>)}
      </div>
    </div>
  );
};

export default HomeScreen;
