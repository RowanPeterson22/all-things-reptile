#!/usr/bin/env node
// ─── One-time move: species pages (JSX) → species content (JSON) ──
// D5 (revised 11 Nov 2026): species content is mastered in the atr Supabase
// project and edited in /admin. This script did the one-time move from the 46
// JSX pages in src/pages/species/** plus src/data/species.js to one JSON
// document per species, in the shape checked by src/data/speciesContentShape.js.
//
// Extraction is deterministic: every page is loaded with Babel and called
// with stub components (scripts/lib/pageCapture.cjs), and the element tree is
// mapped to typed blocks. Every element must match a known pattern exactly
// (component + props, or tag + style); anything else stops the script, so no
// content is guessed or retyped.
//
//   node scripts/extract-species-content.mjs                 # write src/data/speciesContent.json
//   node scripts/extract-species-content.mjs --check         # exit 1 if the snapshot differs
//   node scripts/extract-species-content.mjs --sql <file>    # also write an upsert for the
//                                                              # Supabase MCP (execute_sql)
//   node scripts/extract-species-content.mjs --load          # upsert over REST
//                                                              # (SUPABASE_URL + SUPABASE_SECRET_KEY)
//
// The JSX pages were removed once the app read the content (feature/species-
// content); run this from a checkout that still has them (origin/main before
// that merge). After the move, src/data/speciesContent.json is the reviewable
// snapshot of what was loaded, and /admin is where content changes.
//
// --load and --sql write `draft` and `published` (the same document) and
// never overwrite a row whose draft has been edited since (updated_by isn't
// the migration), unless --force.

import { createRequire } from "module";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const require = createRequire(import.meta.url);
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "src/data/speciesContent.json");
const PAGES = path.join(ROOT, "src/pages/species");
const MIGRATION_BY = "migration:extract-species-content";

process.env.BROWSERSLIST_IGNORE_OLD_DATA = "1";
const { capturePage, captureComponent, FOOD_CARD, Fragment } = require("./lib/pageCapture.cjs");
const { validateDoc, SHAPE_VERSION } = require("../src/data/speciesContentShape.js");

const args = process.argv.slice(2);
const arg = (name) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : null; };

// ── species.js identity (ESM; read with a tiny transform, no retyping) ──
const loadSpeciesList = () => {
  const babel = require("@babel/core");
  const code = babel.transformSync(fs.readFileSync(path.join(ROOT, "src/data/species.js"), "utf8"), {
    babelrc: false, configFile: false, plugins: [require.resolve("@babel/plugin-transform-modules-commonjs")],
  }).code;
  const m = { exports: {} };
  new Function("module", "exports", code)(m, m.exports);
  return m.exports.SPECIES;
};

// ── Tree helpers ──
const fail = (where, msg) => { throw new Error(`${where}: ${msg}`); };
const flat = (c) => (Array.isArray(c) ? c.flatMap(flat) : c === false || c === null || c === undefined || c === true ? [] : [c]);
const kids = (el) => flat(el.props.children).flatMap(c => (c && c.type === Fragment ? kids(c) : [c]));
const nameOf = (el) => (typeof el.type === "string" ? el.type : el.type && el.type.stubName);
const textOf = (where, nodes) => {
  const list = flat(nodes);
  if (!list.every(x => typeof x === "string" || typeof x === "number")) fail(where, "expected plain text");
  return list.join("");
};
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const only = (where, props, allowed) => {
  const extra = Object.keys(props).filter(k => !allowed.includes(k));
  if (extra.length) fail(where, `unexpected props ${extra.join(", ")}`);
};

// ── Known shapes (symbolic theme tokens, from the pages as they were) ──
const P_STYLE = (mb) => ({ fontSize: 15, color: "T.body", lineHeight: 1.6, marginBottom: mb });
const CARD_STYLE = { background: "T.card", borderRadius: 14, padding: "12px 14px", border: "none", fontSize: 15, color: "T.body", lineHeight: 1.7 };
const BITE_BOX = (bg) => ({ background: bg, borderRadius: 14, padding: "12px 14px", marginBottom: 12, border: "none" });
const BITE_HEAD = (c) => ({ fontSize: 12, fontWeight: 700, color: c, marginBottom: 6 });
const BITE_TEXT = { fontSize: 15, color: "T.body", lineHeight: 1.6 };
const BITE_TONES = { red: ["T.noBg", "T.no"], orange: ["T.chipBg", "T.chip"], accent: ["T.chipBg", "T.accentText"] };
const TOGGLE_STYLE = { display: "flex", background: "T.card", borderRadius: 14, padding: 3, border: "none", marginBottom: 14 };
const MISTAKE_ROW = { background: "T.card", borderRadius: 14, border: "none", padding: "12px 14px", marginBottom: 8, display: "flex", gap: 10 };
const GOOD_DOTS = new Set(["#4a9e6b", "#2a7e4a", "#2e8b57"]);

const warnOf = (where, el) => {
  only(where, el.props, ["type", "title", "children"]);
  return { title: el.props.title, text: textOf(where, el.props.children) };
};
const healthOf = (where, el) => {
  only(where, el.props, ["title", "detail", "dot"]);
  return { title: el.props.title, detail: el.props.detail, good: Boolean(el.props.dot && GOOD_DOTS.has(String(el.props.dot).toLowerCase())) };
};

// Snake shedding / handling / breeding: the shared components' own content,
// captured with the props the page passed, so it becomes per-species data.
const sheddingOf = (where, props) => {
  const list = flat(captureComponent("SnakeShedding", props)).flatMap(c => (c.type === Fragment ? kids(c) : [c]));
  const [label, signs, good, ...rest] = list;
  const warn = rest.pop();
  if (nameOf(label) !== "SectionLabel" || label.props.mt !== 0 || nameOf(signs) !== "WarnBox" || signs.props.type !== "blue"
    || nameOf(good) !== "HealthItem" || nameOf(warn) !== "WarnBox" || warn.props.type !== "green" || !rest.every(e => nameOf(e) === "HealthItem")) {
    fail(where, "SnakeShedding doesn't have the expected shape");
  }
  const g = healthOf(where, good);
  if (!g.good || rest.some(e => healthOf(where, e).good)) fail(where, "SnakeShedding: unexpected good/bad dots");
  return {
    type: "shedding",
    label: textOf(where, label.props.children),
    signs: warnOf(where, signs),
    good: { title: g.title, text: g.detail },
    problems: rest.map(e => { const h = healthOf(where, e); return { title: h.title, text: h.detail }; }),
    warn: warnOf(where, warn),
  };
};

const handlingOf = (where, props) => {
  only(where, props, ["biteRisk", "notes"]);
  if (!["low", "medium", "high"].includes(props.biteRisk)) fail(where, `bite risk ${props.biteRisk}`);
  const list = flat(captureComponent("SnakeHandling", props)).flatMap(c => (c.type === Fragment ? kids(c) : [c]));
  const [card, label, tipsCard, warn] = list;
  if (list.length !== 4 || nameOf(card) !== "div" || nameOf(label) !== "SectionLabel" || nameOf(tipsCard) !== "div" || nameOf(warn) !== "WarnBox" || warn.props.type !== "gold") {
    fail(where, "SnakeHandling doesn't have the expected shape");
  }
  const notesEl = kids(card)[1];
  if (nameOf(notesEl) !== "p" || textOf(where, notesEl.props.children) !== props.notes) fail(where, "SnakeHandling notes");
  const [title, ...tips] = kids(tipsCard);
  return {
    type: "snakeHandling",
    risk: props.biteRisk,
    notes: props.notes,
    tipsLabel: textOf(where, label.props.children),
    tipsTitle: textOf(where, title.props.children),
    tips: tips.map(t => textOf(where, t.props.children)),
    warn: warnOf(where, warn),
  };
};

const breedingOf = (where, props) => {
  only(where, props, ["clutchSize", "incubationTemp", "incubationDays", "maturityAge", "notes"]);
  const list = flat(captureComponent("SnakeBreeding", props)).flatMap(c => (c.type === Fragment ? kids(c) : [c]));
  const [label, grid, notes, warn] = list;
  if (list.length !== 4 || nameOf(label) !== "SectionLabel" || label.props.mt !== undefined || nameOf(grid) !== "StatGrid" || nameOf(notes) !== "div" || nameOf(warn) !== "WarnBox" || warn.props.type !== "gold") {
    fail(where, "SnakeBreeding doesn't have the expected shape");
  }
  return {
    type: "breeding",
    label: textOf(where, label.props.children),
    stats: grid.props.stats.map(([, l, v]) => ({ label: l, value: v })),
    notes: textOf(where, notes.props.children),
    warn: warnOf(where, warn),
  };
};

// "Basic permit (one animal permit-free) · confirm with authority" →
// { licence: "Basic permit", note: "one animal permit-free", confirm: true }
const CONFIRM = " · confirm with authority";
const stateOf = (where, s) => {
  only(where, s, ["abbr", "cat", "ok"]);
  let rest = s.cat;
  const confirm = rest.endsWith(CONFIRM);
  if (confirm) rest = rest.slice(0, -CONFIRM.length);
  const m = rest.match(/^(.*?) \(([^()]+)\)$/);
  const out = { abbr: s.abbr, licence: m ? m[1] : rest, note: m ? m[2] : null, ok: s.ok === true, confirm };
  if (licenceText(out) !== s.cat) fail(where, `licence cell doesn't round-trip: ${s.cat}`);
  return out;
};
const { licenceText } = require("../src/data/speciesContentShape.js");

// One tab's elements → blocks. `toggleFill` is set when re-capturing a state.
const blocksOf = (where, nodes, ctx) => {
  const out = [];
  // Fragments are expanded, except the one right after an age toggle: that's
  // the chosen option's content.
  const list = [];
  const expand = (n) => flat(n).forEach(c => {
    const prev = list[list.length - 1];
    if (c && c.type === Fragment && !(prev && nameOf(prev) === "div" && same(prev.props.style, TOGGLE_STYLE))) expand(c.props.children);
    else list.push(c);
  });
  expand(nodes);
  for (let i = 0; i < list.length; i++) {
    const el = list[i];
    const at = `${where}#${i}`;
    if (typeof el === "string") fail(at, `loose text "${el.slice(0, 40)}"`);
    const name = nameOf(el);
    const p = el.props;
    const style = p.style;
    if (name === "p") {
      only(at, p, ["style", "children"]);
      const mb = style && style.marginBottom;
      if (!same(style, P_STYLE(mb))) fail(at, "unknown <p> style");
      out.push(mb === 14 ? { type: "text", text: textOf(at, p.children) } : { type: "text", text: textOf(at, p.children), mb });
    } else if (name === "SectionLabel") {
      only(at, p, ["mt", "children"]);
      out.push(p.mt === undefined ? { type: "label", text: textOf(at, p.children) } : { type: "label", text: textOf(at, p.children), mt: p.mt });
    } else if (name === "StatGrid") {
      only(at, p, ["stats"]);
      out.push({ type: "stats", items: p.stats.map(([, label, value]) => ({ label, value })) });
    } else if (name === "BaskingBanner") {
      only(at, p, ["range", "title", "children"]);
      out.push({ type: "basking", range: p.range, title: p.title, text: textOf(at, p.children) });
    } else if (name === "TempCard") {
      only(at, p, ["children"]);
      const bars = kids(el).map((b, j) => {
        if (nameOf(b) !== "TempBar") fail(at, "TempCard child isn't a TempBar");
        only(at, b.props, ["label", "value", "width", "color"]);
        return { label: b.props.label, value: b.props.value, width: b.props.width, hot: j === 0 };
      });
      out.push({ type: "temps", bars });
    } else if (name === "WarnBox") {
      if (!["gold", "green", "red", "blue"].includes(p.type)) fail(at, `warn type ${p.type}`);
      out.push({ type: "warn", tone: p.type, ...warnOf(at, el) });
    } else if (name === "HealthItem") {
      const item = healthOf(at, el);
      const prev = out[out.length - 1];
      if (prev && prev.type === "health" && list[i - 1] && nameOf(list[i - 1]) === "HealthItem") prev.items.push(item);
      else out.push({ type: "health", items: [item] });
    } else if (name === "ShopBtn") {
      only(at, p, ["children", "secondary"]);
      out.push(p.secondary ? { type: "button", label: textOf(at, p.children), secondary: true, target: null } : { type: "button", label: textOf(at, p.children), target: null });
    } else if (name === "LegalTab") {
      only(at, p, ["note", "states"]);
      out.push({ type: "licence", note: p.note, states: p.states.map(s => stateOf(at, s)) });
    } else if (name === "SnakeShedding") {
      only(at, p, ["animal"]);
      out.push(sheddingOf(at, p));
    } else if (name === "SnakeHandling") {
      out.push(handlingOf(at, p));
    } else if (name === "SnakeBreeding") {
      out.push(breedingOf(at, p));
    } else if (name === "div" && style === FOOD_CARD) {
      const items = kids(el).map(f => {
        if (nameOf(f) !== "FoodItem") fail(at, "food card child isn't a FoodItem");
        only(at, f.props, ["icon", "name", "detail", "freq"]);
        return { name: f.props.name, detail: f.props.detail, freq: f.props.freq };
      });
      out.push({ type: "food", items });
    } else if (name === "div" && same(style, CARD_STYLE)) {
      out.push({ type: "card", text: textOf(at, p.children) });
    } else if (name === "div" && style && Object.entries(BITE_TONES).some(([, [bg]]) => same(style, BITE_BOX(bg)))) {
      const [head, body] = kids(el);
      const tone = Object.keys(BITE_TONES).find(t => same(style, BITE_BOX(BITE_TONES[t][0])) && same(head.props.style, BITE_HEAD(BITE_TONES[t][1])));
      if (!tone || kids(el).length !== 2 || !same(body.props.style, BITE_TEXT)) fail(at, "unknown bite box");
      out.push({ type: "bite", tone, heading: textOf(at, head.props.children), text: textOf(at, body.props.children) });
    } else if (name === "div" && same(style, MISTAKE_ROW)) {
      const [num, inner] = kids(el);
      const [title, detail] = kids(inner);
      const item = { title: textOf(at, title.props.children), detail: textOf(at, detail.props.children) };
      const prev = out[out.length - 1];
      const n = prev && prev.type === "mistakes" ? prev.items.length + 1 : 1;
      if (textOf(at, num.props.children) !== String(n)) fail(at, "mistake numbering");
      if (n > 1) prev.items.push(item); else out.push({ type: "mistakes", items: [item] });
    } else if (name === "div" && same(style, TOGGLE_STYLE)) {
      // Age toggle: buttons, then the chosen option's content (a fragment).
      const options = kids(el).map(b => ({ key: b.key, label: textOf(at, b.props.children), on: b.props.style.background === "T.segOn" }));
      const current = options.find(o => o.on);
      const content = list[i + 1];
      if (!current || !content || content.type !== Fragment) fail(at, "toggle without content");
      i += 1;
      const block = { type: "toggle", options: options.map(o => ({ key: o.key, label: o.label, blocks: null })) };
      block.options.find(o => o.key === current.key).blocks = blocksOf(`${at}/${current.key}`, content.props.children, ctx);
      ctx.toggles.push({ block, initial: options[0].key, tab: ctx.tab });
      out.push(block);
    } else {
      fail(at, `unknown element <${name}> ${JSON.stringify(style || {})}`);
    }
  }
  return out;
};

const PAGE_FILES = fs.existsSync(PAGES)
  ? fs.readdirSync(PAGES).flatMap(g => fs.readdirSync(path.join(PAGES, g)).map(f => path.join(PAGES, g, f)))
  : [];

const extract = () => {
  if (PAGE_FILES.length !== 46) throw new Error(`Expected 46 species pages in src/pages/species, found ${PAGE_FILES.length}. Run from a checkout that still has them.`);
  const SPECIES = loadSpeciesList();
  // Which file is which species: the App's PAGE_MAP (page key → component import).
  const app = fs.readFileSync(path.join(ROOT, "src/App.jsx"), "utf8");
  const importOf = Object.fromEntries([...app.matchAll(/import (\w+) from "\.\/pages\/species\/(\w+)\/(\w+)";/g)].map(m => [m[1], path.join(PAGES, m[2], `${m[3]}.jsx`)]));
  const fileOfPage = Object.fromEntries([...app.matchAll(/^\s+(\w+):\s+(\w+),$/gm)].filter(m => importOf[m[2]]).map(m => [m[1], importOf[m[2]]]));

  const docs = SPECIES.map((s, sortOrder) => {
    const file = fileOfPage[s.page];
    if (!file) throw new Error(`${s.slug}: no page file`);
    const where = `${s.slug} (${path.relative(ROOT, file)})`;
    const cap = capturePage(file);
    const { props } = cap;
    if (props.name !== s.name || props.latin !== s.latin || props.emoji !== s.emoji) fail(where, "page identity differs from species.js");
    if (props.aka !== undefined) fail(where, "aka isn't handled");
    const ctx = { toggles: [] };
    const tabs = cap.tabs.map(({ key, tree }) => { ctx.tab = key; return { key, blocks: blocksOf(`${where}:${key}`, tree, ctx) }; });
    // Fill each toggle's other options by re-capturing with the state set.
    for (const t of ctx.toggles) {
      for (const opt of t.block.options.filter(o => o.blocks === null)) {
        const again = capturePage(file, new Map([[t.initial, opt.key]]));
        const tree = again.tabs.find(x => x.key === t.tab).tree;
        const sub = { toggles: [], tab: t.tab };
        const blocks = blocksOf(`${where}:${t.tab}`, tree, sub);
        const twin = blocks.find(b => b.type === "toggle");
        opt.blocks = twin.options.find(o => o.key === opt.key).blocks;
      }
    }
    const doc = {
      v: SHAPE_VERSION,
      slug: s.slug,
      id: s.id,
      name: s.name,
      latin: s.latin,
      aka: null,
      type: s.type,
      level: s.level,
      emoji: s.emoji,
      sortOrder,
      badges: props.badges.map(([label]) => label),
      tabs,
    };
    const errors = validateDoc(doc);
    if (errors.length) fail(where, `invalid document: ${errors.join("; ")}`);
    return doc;
  });
  return docs;
};

const sqlString = (s) => `'${String(s).replace(/'/g, "''")}'`;
const upsertSql = (docs, { force = false } = {}) => {
  const rows = docs.map(d => `(${sqlString(d.slug)}, ${d.sortOrder}, ${sqlString(JSON.stringify(d))}::jsonb)`).join(",\n");
  return `-- Generated by scripts/extract-species-content.mjs. Loads the snapshot as draft and published.
insert into public.species_content as sc (slug, sort_order, draft, published, published_at, published_by, updated_by)
select v.slug, v.sort_order, v.doc, v.doc, now(), '${MIGRATION_BY}', '${MIGRATION_BY}'
from (values
${rows}
) as v(slug, sort_order, doc)
on conflict (slug) do update set
  sort_order = excluded.sort_order, draft = excluded.draft, published = excluded.published,
  published_at = excluded.published_at, published_by = excluded.published_by, updated_by = excluded.updated_by, updated_at = now()
${force ? "" : `where sc.updated_by = '${MIGRATION_BY}'`};
`;
};

const main = async () => {
  const docs = extract();
  const json = `${JSON.stringify(docs, null, 1)}\n`;
  if (args.includes("--check")) {
    const now = fs.existsSync(OUT) ? fs.readFileSync(OUT, "utf8") : "";
    if (now !== json) { console.error("src/data/speciesContent.json differs from the pages."); process.exit(1); }
    console.log("Snapshot matches the pages.");
    return;
  }
  fs.writeFileSync(OUT, json);
  console.log(`Wrote ${docs.length} species to ${path.relative(ROOT, OUT)} (${(json.length / 1024).toFixed(0)} KB).`);
  const sqlFile = arg("--sql");
  if (sqlFile) { fs.writeFileSync(sqlFile, upsertSql(docs, { force: args.includes("--force") })); console.log(`Wrote ${sqlFile}.`); }
  if (args.includes("--load")) {
    const { config, rest } = await import("./lib/supabaseAdmin.mjs");
    const cfg = config();
    const existing = await rest(cfg, "species_content?select=slug,updated_by");
    const edited = new Set(existing.filter(r => r.updated_by !== MIGRATION_BY).map(r => r.slug));
    const now = new Date().toISOString();
    const rows = docs.filter(d => args.includes("--force") || !edited.has(d.slug)).map(d => ({
      slug: d.slug, sort_order: d.sortOrder, draft: d, published: d, published_at: now, published_by: MIGRATION_BY, updated_by: MIGRATION_BY,
    }));
    await rest(cfg, "species_content?on_conflict=slug", { method: "POST", headers: { "Content-Type": "application/json", Prefer: "resolution=merge-duplicates,return=minimal" }, body: JSON.stringify(rows) });
    console.log(`Loaded ${rows.length} species${edited.size && !args.includes("--force") ? ` (skipped ${edited.size} edited in /admin)` : ""}.`);
  }
};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch(e => { console.error(e.message); process.exit(1); });
}

export { extract, upsertSql };
