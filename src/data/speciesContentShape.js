// ─── Species content: the document shape (shared) ─────────────────
// One JSON document per species, mastered in the atr Supabase project
// (species_content.draft / .published, D5) and bundled as a snapshot in
// src/data/speciesContent.json. CommonJS on purpose: used by the app (to
// accept or reject fresh data), the server (never serve a malformed
// document), the one-time extraction script and the tests. Pure functions only.
//
// Document:
//   { v, slug, id, name, latin, aka, type, level, emoji, sortOrder,
//     badges: [label],                    hero pills, first one orange
//     tabs: [{ key, blocks: [block] }] }  in order; key is also the label
//                                          ("health & shedding" → "Health & shedding")
// Blocks render top to bottom (src/components/SpeciesBlocks.jsx):
//   text      { text, mb? }               paragraph (mb: bottom gap, default 14)
//   label     { text, mt? }               small section heading (mt default 16)
//   stats     { items: [{ label, value }] }            2 × 2 quick stats
//   basking   { range, title, text }      monitor basking-surface banner
//   temps     { bars: [{ label, value, width, hot }] } temperature card; width "0–100%"
//   card      { text }                    text on a card
//   warn      { tone: gold|green|red|blue, title, text }
//   bite      { tone: red|orange|accent, heading, text }  bite risk / handling box
//   food      { items: [{ name, detail, freq }] }
//   health    { items: [{ title, detail, good }] }
//   mistakes  { items: [{ title, detail }] }            numbered list
//   shedding  { label, signs: {title,text}, good: {title,text}, problems: [{title,text}], warn: {title,text} }
//   snakeHandling { risk: low|medium|high, notes, tipsLabel, tipsTitle, tips: [text], warn: {title,text} }
//   breeding  { label, stats: [{ label, value }], notes, warn: {title,text} }
//   button    { label, secondary?, target }  target: null for now (store link later)
//   licence   { note, states: [{ abbr, licence, note, ok, confirm }] } × 8, NSW…NT;
//             shown as "licence (note) · confirm with authority"; the verify
//             disclaimer is fixed in the component, never data.
//   toggle    { options: [{ key, label, blocks }] }   segmented switch (≤ 1 level)
//
// Content rules enforced here (CLAUDE.md): eight states in order, TAS never
// open to a non-TAS species (its row is fixed: "Not permitted (TAS natives
// only)"), a monitor's Overview leads with the basking banner, no species
// class codes on the licence tab (NSW R-codes, "Class 1 species", schedule
// numbers, WA categories; licence names like "Class 1 licence" are fine), and
// no mention of Dubia roaches anywhere. /admin → Species (step 2) saves only
// documents that pass, and shows the same checks as you type.

const SHAPE_VERSION = 1;

const TYPES = ["snake", "lizard", "gecko", "monitor", "turtle", "frog"];
const LEVELS = ["Beginner", "Intermediate", "Advanced"];
const STATES = ["NSW", "VIC", "QLD", "SA", "WA", "TAS", "ACT", "NT"];
const WARN_TONES = ["gold", "green", "red", "blue"];
const BITE_TONES = ["red", "orange", "accent"];
const RISKS = ["low", "medium", "high"];
const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const WIDTH_RE = /^(100|[1-9]?[0-9])%$/;
// Species native to Tasmania: the only ones TAS may show as available (CLAUDE.md:
// TAS is always red for non-TAS natives). Of the 46, the Blotched Blue-tongue.
const TAS_NATIVES = new Set(["blotched-blue-tongue-skink"]);

// The TAS row every non-TAS species shows; /admin locks it.
const TAS_LOCKED = Object.freeze({ abbr: "TAS", licence: "Not permitted", note: "TAS natives only", ok: false, confirm: false });

// Species class codes the licence grid must never show (CLAUDE.md). Licence
// names may carry a class ("Companion or Class 1 licence"); species classes may not.
const CLASS_CODES = [
  [/\bR\s?-?\d{1,2}\b/i, "NSW R-codes"],
  [/\bclass\s*[0-9]+[a-z]?\b(?!\s*(or\s+[a-z]+\s+)?licen[cs]e)/i, "species classes (\"Class 1/2 species\")"],
  [/\b(schedule|sch\.?)\s*[0-9]/i, "schedule numbers"],
  [/\b(category|cat\.?)\s*[0-9]/i, "WA categories"],
];
// → { match, kind } for the first class code in a string, or null.
const classCodeIn = (s) => {
  if (typeof s !== "string") return null;
  for (const [re, kind] of CLASS_CODES) { const m = s.match(re); if (m) return { match: m[0].trim(), kind }; }
  return null;
};

// Field limits the shape checks, shared with the /admin editor's inline errors.
const LIMITS = { name: 120, latin: 120, aka: 200, badge: 40, badges: 6, tabs: 8, tabKey: 40, text: 4000, short: 60, title: 200, label: 120, range: 20, button: 80, value: 40, licence: 120 };

const CONFIRM = " · confirm with authority";
const licenceText = (s) => `${s.licence}${s.note ? ` (${s.note})` : ""}${s.confirm ? CONFIRM : ""}`;

const isStr = (v, { empty = false, max = 4000 } = {}) => typeof v === "string" && (empty || v.trim() !== "") && v.length <= max;
const isObj = (v) => v !== null && typeof v === "object" && !Array.isArray(v);

const titled = (v) => isObj(v) && isStr(v.title, { max: 200 }) && isStr(v.text);

// Field checks per block type: → error string or null.
const CHECKS = {
  text: (b) => (!isStr(b.text) ? "text" : b.mb !== undefined && !(Number.isInteger(b.mb) && b.mb >= 0 && b.mb <= 40) ? "mb" : null),
  label: (b) => (!isStr(b.text, { max: 120 }) ? "text" : b.mt !== undefined && !(Number.isInteger(b.mt) && b.mt >= 0 && b.mt <= 40) ? "mt" : null),
  stats: (b) => (Array.isArray(b.items) && b.items.length >= 1 && b.items.length <= 8 && b.items.every(i => isObj(i) && isStr(i.label, { max: 60 }) && isStr(i.value, { max: 60 })) ? null : "items"),
  basking: (b) => (isStr(b.range, { max: 20 }) && isStr(b.title, { max: 200 }) && isStr(b.text) ? null : "fields"),
  temps: (b) => (Array.isArray(b.bars) && b.bars.length >= 1 && b.bars.length <= 8
    && b.bars.every((r, i) => isObj(r) && isStr(r.label, { max: 80 }) && isStr(r.value, { max: 40 }) && WIDTH_RE.test(r.width || "") && typeof r.hot === "boolean" && r.hot === (i === 0))
    ? null : "bars"),
  card: (b) => (isStr(b.text) ? null : "text"),
  warn: (b) => (WARN_TONES.includes(b.tone) && isStr(b.title, { max: 200 }) && isStr(b.text) ? null : "fields"),
  bite: (b) => (BITE_TONES.includes(b.tone) && isStr(b.heading, { max: 200 }) && isStr(b.text) ? null : "fields"),
  food: (b) => (Array.isArray(b.items) && b.items.length >= 1 && b.items.every(i => isObj(i) && isStr(i.name, { max: 120 })
    && (i.detail === undefined || i.detail === null || isStr(i.detail, { max: 300 })) && (i.freq === undefined || i.freq === null || isStr(i.freq, { max: 120 }))) ? null : "items"),
  health: (b) => (Array.isArray(b.items) && b.items.length >= 1 && b.items.every(i => isObj(i) && isStr(i.title, { max: 200 }) && isStr(i.detail) && typeof i.good === "boolean") ? null : "items"),
  mistakes: (b) => (Array.isArray(b.items) && b.items.length >= 1 && b.items.length <= 20 && b.items.every(i => isObj(i) && isStr(i.title, { max: 300 }) && isStr(i.detail)) ? null : "items"),
  shedding: (b) => (isStr(b.label, { max: 120 }) && titled(b.signs) && titled(b.good) && Array.isArray(b.problems) && b.problems.every(titled) && titled(b.warn) ? null : "fields"),
  snakeHandling: (b) => (RISKS.includes(b.risk) && isStr(b.notes) && isStr(b.tipsLabel, { max: 120 }) && isStr(b.tipsTitle, { max: 200 })
    && Array.isArray(b.tips) && b.tips.every(t => isStr(t)) && titled(b.warn) ? null : "fields"),
  breeding: (b) => (isStr(b.label, { max: 120 }) && Array.isArray(b.stats) && b.stats.length >= 1 && b.stats.length <= 8
    && b.stats.every(i => isObj(i) && isStr(i.label, { max: 60 }) && isStr(i.value, { max: 60 })) && isStr(b.notes) && titled(b.warn) ? null : "fields"),
  button: (b) => (isStr(b.label, { max: 80 }) && (b.secondary === undefined || typeof b.secondary === "boolean") && (b.target === null || isStr(b.target, { max: 300 })) ? null : "fields"),
  licence: (b) => {
    if (!isStr(b.note)) return "note";
    if (!Array.isArray(b.states) || b.states.map(s => s && s.abbr).join() !== STATES.join()) return "states must be NSW, VIC, QLD, SA, WA, TAS, ACT, NT";
    const bad = b.states.find(s => !(isStr(s.licence, { max: 120 }) && (s.note === null || isStr(s.note, { max: 120 })) && typeof s.ok === "boolean" && typeof s.confirm === "boolean"));
    return bad ? `state ${bad.abbr}` : null;
  },
  toggle: (b, depth) => (depth > 0 ? "toggles can't nest"
    : Array.isArray(b.options) && b.options.length >= 2 && b.options.length <= 4
      && b.options.every(o => isObj(o) && isStr(o.key, { max: 40 }) && isStr(o.label, { max: 60 }) && Array.isArray(o.blocks))
      && new Set(b.options.map(o => o.key)).size === b.options.length ? null : "options"),
};
const BLOCK_TYPES = Object.keys(CHECKS);

// One block on its own (the editor flags the block in place): → problem or null.
const checkBlock = (b, depth = 0) => (!isObj(b) || !CHECKS[b.type] ? `unknown block type ${b && b.type}` : CHECKS[b.type](b, depth));

// Every string in a value, for the content-rule scans.
const strings = (v) => (typeof v === "string" ? [v] : Array.isArray(v) ? v.flatMap(strings) : isObj(v) ? Object.values(v).flatMap(strings) : []);

const blockErrors = (blocks, where, depth = 0) => {
  if (!Array.isArray(blocks)) return [`${where}: blocks must be a list`];
  return blocks.flatMap((b, i) => {
    const at = `${where} block ${i + 1}`;
    if (!isObj(b) || !CHECKS[b.type]) return [`${at}: unknown block type ${b && b.type}`];
    const err = CHECKS[b.type](b, depth);
    if (err) return [`${at} (${b.type}): ${err}`];
    return b.type === "toggle" ? b.options.flatMap(o => blockErrors(o.blocks, `${at} ${o.key}`, depth + 1)) : [];
  });
};

const allBlocks = (blocks) => blocks.flatMap(b => (b.type === "toggle" ? [b, ...b.options.flatMap(o => allBlocks(o.blocks))] : [b]));

// → [] when the document is good, else a list of problems.
const validateDoc = (doc) => {
  if (!isObj(doc)) return ["not an object"];
  const errs = [];
  if (doc.v !== SHAPE_VERSION) errs.push(`v must be ${SHAPE_VERSION}`);
  if (!isStr(doc.slug, { max: 100 }) || !SLUG_RE.test(doc.slug)) errs.push("slug");
  if (!isStr(doc.id, { max: 60 })) errs.push("id");
  if (!isStr(doc.name, { max: 120 })) errs.push("name");
  if (!isStr(doc.latin, { max: 120 })) errs.push("latin");
  if (!(doc.aka === null || isStr(doc.aka, { max: 200 }))) errs.push("aka");
  if (!TYPES.includes(doc.type)) errs.push("type");
  if (!LEVELS.includes(doc.level)) errs.push("level");
  if (!isStr(doc.emoji, { max: 16 })) errs.push("emoji");
  if (!Number.isInteger(doc.sortOrder)) errs.push("sortOrder");
  if (!Array.isArray(doc.badges) || doc.badges.length > 6 || !doc.badges.every(b => isStr(b, { max: 40 }))) errs.push("badges");
  if (!Array.isArray(doc.tabs) || doc.tabs.length < 1 || doc.tabs.length > 8) return [...errs, "tabs"];
  const keys = doc.tabs.map(t => t && t.key);
  if (!keys.every(k => isStr(k, { max: 40 })) || new Set(keys).size !== keys.length) errs.push("tab keys must be unique text");
  doc.tabs.forEach((t, i) => errs.push(...blockErrors(t && t.blocks, `tab ${i + 1} (${t && t.key})`)));
  if (errs.length) return errs;

  // Content rules.
  const blocks = doc.tabs.flatMap(t => allBlocks(t.blocks));
  const licences = blocks.filter(b => b.type === "licence");
  if (licences.length !== 1) errs.push("exactly one licence block");
  for (const l of licences) {
    const tas = l.states.find(s => s.abbr === "TAS");
    if (tas.ok && !TAS_NATIVES.has(doc.slug)) errs.push("TAS must be not permitted for a non-TAS species");
  }
  if (doc.type === "monitor") {
    const overview = doc.tabs[0];
    if (!overview.blocks.some(b => b.type === "basking")) errs.push("a monitor's first tab needs the basking banner");
  }
  for (const l of licences) {
    const tas = l.states.find(s => s.abbr === "TAS");
    if (!TAS_NATIVES.has(doc.slug) && !(tas.licence === TAS_LOCKED.licence && tas.note === TAS_LOCKED.note && tas.confirm === false)) {
      errs.push(`the TAS row is fixed for a non-TAS species: "${TAS_LOCKED.licence} (${TAS_LOCKED.note})"`);
    }
  }
  const licenceTab = doc.tabs.find(t => t.blocks.some(b => b.type === "licence"));
  if (licenceTab) {
    const hit = strings(licenceTab).map(classCodeIn).find(Boolean);
    if (hit) errs.push(`licence tab: "${hit.match}" looks like a species class code (${hit.kind}); use the authority's own licence name`);
  }
  if (strings(doc).some(s => /dubia/i.test(s))) errs.push("Dubia roaches are illegal in Australia; never mention them as a feeder");
  return errs;
};

// What /admin may never change on a species (D4 slugs, the fixed list of 46
// and their categories): → [] or problems, comparing an edit to the stored copy.
const identityErrors = (next, current) => {
  if (!isObj(next) || !isObj(current)) return ["not an object"];
  return ["slug", "id", "type", "emoji", "v"].filter(k => next[k] !== current[k]).map(k => `${k} can't be changed (it was ${JSON.stringify(current[k])})`);
};

// The tab label for a tab key (the design calls the licence tab "Licence").
const tabLabel = (key) => (key === "licencing" ? "Licence" : key ? key[0].toUpperCase() + key.slice(1) : key);

module.exports = {
  SHAPE_VERSION, TYPES, LEVELS, STATES, BLOCK_TYPES, WARN_TONES, BITE_TONES, RISKS, TAS_NATIVES, TAS_LOCKED, LIMITS,
  validateDoc, checkBlock, classCodeIn, identityErrors, licenceText, tabLabel, allBlocks, strings,
};
