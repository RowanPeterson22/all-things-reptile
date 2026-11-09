import { UI } from "../components/appUi";
import { Card } from "../components/SectionTiles";

// ─── Home: personal modules ───────────────────────────────────────
// The personal block at the top of Home: the keeper's own things, which will
// be what people use most once they have them. Each module belongs to a
// My Profile section and shows only when that section is visible to the
// visitor (status/audience in /admin → Sections, same as its tile).
//
//   key       stable id
//   section   the section key in src/constants/sections.json
//   title     heading on Home
//   isEmpty(ctx)  true when there's nothing of the visitor's to show
//   render(ctx)   the module's own content when not empty
//
// ctx: { item (the section's shell item), data (the module's data, when a
// store exists), open(path) }. Nothing stores animals, reminders or shopping
// lists yet, so every module is empty and Home shows one compact
// "Planning your first reptile?" card instead. To make one real: give it a
// data source on ctx.data, an isEmpty that checks it, and a render.

const ModuleCard = ({ title, children, onMore }) => (
  <Card style={{ padding: 14 }}>
    <div style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
      <div style={{ flex: 1, fontSize: 14, fontWeight: 700, color: UI.ink }}>{title}</div>
      {onMore && <button type="button" onClick={onMore} style={{ background: "none", border: "none", color: UI.accent, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", padding: "8px 0 8px 8px" }}>See all ›</button>}
    </div>
    {children}
  </Card>
);

const listModule = ({ key, section, title }) => ({
  key, section, title,
  isEmpty: (ctx) => !ctx.data || !Array.isArray(ctx.data.items) || ctx.data.items.length === 0,
  render: (ctx) => (
    <ModuleCard title={title} onMore={() => ctx.open(ctx.item.path)}>
      {ctx.data.items.slice(0, 3).map((it, i) => <div key={i} style={{ fontSize: 13, color: UI.body, padding: "4px 0" }}>{String(it.label || it)}</div>)}
    </ModuleCard>
  ),
});

export const HOME_MODULES = [
  listModule({ key: "animals", section: "collection", title: "My animals" }),
  listModule({ key: "reminders", section: "reminders", title: "Reminders" }),
  listModule({ key: "shopping", section: "shopping-lists", title: "Shopping list" }),
];

// The modules this visitor can see, with their ctx. dataFor(key) → data or undefined.
export const visibleModules = (shell, open, dataFor = () => undefined) =>
  HOME_MODULES
    .filter(m => shell.byKey[m.section])
    .map(m => ({ module: m, ctx: { item: shell.byKey[m.section], data: dataFor(m.key), open } }));
