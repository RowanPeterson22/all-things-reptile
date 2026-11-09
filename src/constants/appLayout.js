// ─── App layout: tabs, sections, Home blocks (shared) ─────────────
// One implementation, used by the app (src/constants/sections.js, App.jsx) and
// the server (lib/sections.js, lib/appSections.js, /api/beta-check). CommonJS
// on purpose so the Vercel functions can require() it; the app imports it
// through webpack's interop. Pure functions only: no fetch, no React.
//
// config = buildConfig({ rows, layout }): the defaults in sections.json with
//   the app_sections rows and the app_layout row (tab labels, Home block
//   order) laid over them. Bad or unknown values fall back to the default.
// view = resolveView(config, viewer): what one visitor gets.
//   viewer.role "admin": every section, hidden ones included (with their status).
//   viewer.role "tester": built sections only when the tester has them
//     (beta_testers.sections; after launch also every built section whose
//     audience is everyone), placeholders by audience alone (everyone/testers).
//   viewer.role "public": audience everyone, never AI ID (D9), nothing while gated.
//   status hidden: nobody but admins. A built section set to "soon" shows its
//   Coming soon page instead of its content (admins still see the content).
// shell = shellFor(view): which tabs show and where the visitor lands. The full
//   shell (Home and tabs) needs at least two built sections the visitor can
//   open; with one, that screen alone and no tab bar (e.g. ID-only testers),
//   and coming-soon tiles aren't shown at all.

const DEF = require("./sections.json");

const TABS = DEF.tabs;
const TAB_KEYS = TABS.map(t => t.key);
const SECTIONS = DEF.sections;
const ALL_KEYS = SECTIONS.map(s => s.key);
const BY_KEY = Object.fromEntries(SECTIONS.map(s => [s.key, s]));
const TESTER_KEYS = SECTIONS.filter(s => s.perTester).map(s => s.key);
const HOME_BLOCKS = DEF.homeBlocks.map(b => b.key);
const DEFAULT_HOME_BLOCKS = DEF.defaultHomeBlocks;
const STATUSES = ["live", "soon", "hidden"];
const AUDIENCES = ["everyone", "testers", "admin"];
const TITLE_MAX = 40;
const BLURB_MAX = 90;
const LABEL_MAX = 16;

const tabOrder = (key) => TAB_KEYS.indexOf(key);

// One section's settings, checked. Anything the rules don't allow → the default.
const cleanSetting = (s, raw, index) => {
  const r = raw && typeof raw === "object" ? raw : {};
  let status = STATUSES.includes(r.status) ? r.status : s.status;
  if (status === "live" && !s.built) status = s.status; // placeholders can't be live
  let audience = AUDIENCES.includes(r.audience) ? r.audience : s.audience;
  if (audience === "everyone" && s.neverPublic) audience = s.audience; // AI ID stays beta-only (D9)
  const text = (v, max) => (typeof v === "string" && v.trim() && v.trim().length <= max ? v.trim() : null);
  const sort = Number.isInteger(r.sort_order) ? r.sort_order : index * 10;
  return {
    key: s.key, status, audience, sort,
    featured: r.featured === true && s.tile === true,
    title: text(r.title, TITLE_MAX), blurb: text(r.blurb, BLURB_MAX),
  };
};

const cleanHomeBlocks = (list) => {
  const seen = new Set();
  const out = [];
  for (const k of Array.isArray(list) ? list : []) if (HOME_BLOCKS.includes(k) && !seen.has(k)) { seen.add(k); out.push(k); }
  if (!out.length) return [...DEFAULT_HOME_BLOCKS];
  for (const k of DEFAULT_HOME_BLOCKS) if (!seen.has(k)) out.push(k);
  return out;
};

const cleanTabLabels = (obj) => {
  const out = {};
  const o = obj && typeof obj === "object" && !Array.isArray(obj) ? obj : {};
  for (const k of TAB_KEYS) {
    const v = o[k];
    out[k] = typeof v === "string" && v.trim() && v.trim().length <= LABEL_MAX ? v.trim() : null;
  }
  return out;
};

// rows: app_sections rows (unknown keys ignored); layout: the app_layout row or null.
const buildConfig = ({ rows = [], layout = null } = {}) => {
  const byKey = {};
  for (const r of Array.isArray(rows) ? rows : []) if (r && typeof r.key === "string" && BY_KEY[r.key]) byKey[r.key] = r;
  const sections = {};
  SECTIONS.forEach((s, i) => { sections[s.key] = cleanSetting(s, byKey[s.key], i); });
  // At most one featured (the database enforces it too): the first in order wins.
  let featuredSeen = false;
  for (const k of sortedKeys(sections)) {
    if (sections[k].featured && featuredSeen) sections[k].featured = false;
    if (sections[k].featured) featuredSeen = true;
  }
  const l = layout && typeof layout === "object" ? layout : {};
  return { sections, tabLabels: cleanTabLabels(l.tab_labels), homeBlocks: cleanHomeBlocks(l.home_blocks) };
};

// Tab order, then sort_order, then the order in sections.json.
function sortedKeys(sections) {
  return [...ALL_KEYS].sort((a, b) =>
    tabOrder(BY_KEY[a].tab) - tabOrder(BY_KEY[b].tab)
    || sections[a].sort - sections[b].sort
    || ALL_KEYS.indexOf(a) - ALL_KEYS.indexOf(b));
}

const DEFAULT_CONFIG = buildConfig();

const tabLabelsFor = (config) => Object.fromEntries(TABS.map(t => [t.key, config.tabLabels[t.key] || t.label]));

// → { sections: [built keys this visitor can open, canonical order],
//     app: { tabs: {key: label}, homeBlocks, items: [{ key, status, title, blurb, featured }] } }
const resolveView = (config, { role = "public", own = [], isPublic = false } = {}) => {
  const cfg = config || DEFAULT_CONFIG;
  const items = [];
  const open = new Set();
  const ownSet = new Set(Array.isArray(own) ? own : []);
  for (const key of sortedKeys(cfg.sections)) {
    const s = BY_KEY[key];
    const c = cfg.sections[key];
    let show;
    if (role === "admin") show = true;
    else if (c.status === "hidden" || c.audience === "admin") show = false;
    else if (role === "tester") show = s.built ? (ownSet.has(key) || (isPublic && c.audience === "everyone" && !s.neverPublic)) : true;
    else show = isPublic && c.audience === "everyone" && !s.neverPublic;
    if (!show) continue;
    if (s.built && (role === "admin" || c.status === "live")) open.add(key);
    items.push({ key, status: c.status, title: c.title || s.title, blurb: c.blurb || s.blurb, featured: c.featured });
  }
  return {
    sections: TESTER_KEYS.filter(k => open.has(k)),
    app: { tabs: tabLabelsFor(cfg), homeBlocks: [...cfg.homeBlocks], items },
  };
};

// The app's own copy of the rules, for a reply without `app` (an older server,
// or no API under `npm start`): defaults, with the server's section list.
const fallbackApp = (sections, role) => resolveView(DEFAULT_CONFIG, {
  role, own: Array.isArray(sections) ? sections : [], isPublic: role === "public",
}).app;

// Server reply → items with their static fields; unknown keys dropped.
const cleanApp = (app) => {
  if (!app || typeof app !== "object" || !Array.isArray(app.items)) return null;
  const items = app.items
    .filter(i => i && typeof i.key === "string" && BY_KEY[i.key])
    .map(i => ({
      key: i.key,
      status: STATUSES.includes(i.status) ? i.status : BY_KEY[i.key].status,
      title: typeof i.title === "string" && i.title ? i.title : BY_KEY[i.key].title,
      blurb: typeof i.blurb === "string" ? i.blurb : BY_KEY[i.key].blurb,
      featured: i.featured === true,
    }));
  const tabs = tabLabelsFor({ tabLabels: cleanTabLabels(app.tabs) });
  return { tabs, homeBlocks: cleanHomeBlocks(app.homeBlocks), items };
};

// view { sections, app } → the shell: full or single screen, tabs, landing path.
const shellFor = ({ sections = [], app } = {}) => {
  const a = app || { tabs: tabLabelsFor({ tabLabels: {} }), homeBlocks: [...DEFAULT_HOME_BLOCKS], items: [] };
  const canOpen = new Set(sections);
  const all = a.items.map(i => ({ ...BY_KEY[i.key], ...i, label: BY_KEY[i.key].label, open: canOpen.has(i.key) }));
  const openTiles = all.filter(i => i.tile && i.built && i.open);
  const full = openTiles.length >= 2;
  // Single screen: only what they can open, no coming-soon tiles.
  const items = full ? all : all.filter(i => i.open);
  const tiles = items.filter(i => i.tile);
  const learnNav = tiles.filter(i => i.tab === "learn");
  const pathOf = (t) => (t.key === "learn" ? (learnNav[0] ? learnNav[0].path : null) : t.path);
  const tabs = !full ? [] : TABS
    .filter(t => t.key === "home" || tiles.some(i => i.tab === t.key))
    .map(t => ({ ...t, label: a.tabs[t.key] || t.label, path: pathOf(t) }))
    .filter(t => t.path);
  const landing = full ? "/" : openTiles.length === 1 ? openTiles[0].path : canOpen.has("search") ? "/search" : null;
  const featured = full ? tiles.find(i => i.featured) || null : null;
  return { full, items, tiles, learnNav, tabs, landing, featured, homeBlocks: a.homeBlocks, byKey: Object.fromEntries(items.map(i => [i.key, i])) };
};

module.exports = {
  TABS, TAB_KEYS, SECTIONS, ALL_KEYS, BY_KEY, TESTER_KEYS, HOME_BLOCKS, DEFAULT_HOME_BLOCKS,
  STATUSES, AUDIENCES, TITLE_MAX, BLURB_MAX, LABEL_MAX,
  buildConfig, resolveView, shellFor, cleanApp, fallbackApp, cleanHomeBlocks, cleanTabLabels, sortedKeys, DEFAULT_CONFIG,
};
