// ─── /admin → Species: the editor's pure helpers ──────────────────
// Block templates, what may be added, moved or deleted where, tab rules,
// immutable updates and the revision text-diff summary. The content rules
// themselves live in src/data/speciesContentShape.js (shared with the server,
// which refuses anything that breaks them); these helpers just keep the UI
// from offering an edit the shape would refuse.
import { STATES, TAS_NATIVES, TAS_LOCKED, LIMITS, tabLabel, classCodeIn } from "../../data/speciesContentShape";

export const BLOCK_LABELS = {
  text: "Paragraph", label: "Section heading", stats: "Quick stats", basking: "Basking banner", temps: "Temperatures",
  card: "Card", warn: "Warning box", bite: "Bite / handling box", food: "Food list", health: "Health list",
  mistakes: "Common mistakes", shedding: "Shedding", snakeHandling: "Snake handling", breeding: "Breeding",
  button: "Button", licence: "Licence grid", toggle: "Toggle (two or more views)",
};

const titled = () => ({ title: "", text: "" });

// A new block of each type: the right structure with empty text to fill in.
export const newBlock = (type) => {
  switch (type) {
    case "text": return { type, text: "" };
    case "label": return { type, text: "" };
    case "stats": return { type, items: [{ label: "", value: "" }] };
    case "basking": return { type, range: "50–60°C", title: "", text: "" };
    case "temps": return { type, bars: [{ label: "Basking surface", value: "", width: "90%", hot: true }] };
    case "card": return { type, text: "" };
    case "warn": return { type, tone: "gold", title: "", text: "" };
    case "bite": return { type, tone: "orange", heading: "", text: "" };
    case "food": return { type, items: [{ name: "", detail: null, freq: null }] };
    case "health": return { type, items: [{ title: "", detail: "", good: false }] };
    case "mistakes": return { type, items: [{ title: "", detail: "" }] };
    case "shedding": return { type, label: "Shedding", signs: titled(), good: titled(), problems: [], warn: titled() };
    case "snakeHandling": return { type, risk: "low", notes: "", tipsLabel: "Handling tips", tipsTitle: "", tips: [""], warn: titled() };
    case "breeding": return { type, label: "Breeding", stats: [{ label: "", value: "" }], notes: "", warn: titled() };
    case "button": return { type, label: "", secondary: false, target: null };
    case "toggle": return { type, options: [{ key: "a", label: "", blocks: [] }, { key: "b", label: "", blocks: [] }] };
    case "licence": return {
      type, note: "",
      states: STATES.map(abbr => (abbr === "TAS" ? { ...TAS_LOCKED } : { abbr, licence: "", note: null, ok: false, confirm: false })),
    };
    default: throw new Error(`unknown block type ${type}`);
  }
};

// The types the picker offers here. Never a second licence grid; the basking
// banner only on monitors; toggles don't nest.
export const addableTypes = (doc, { nested = false } = {}) => Object.keys(BLOCK_LABELS)
  .filter(t => t !== "licence")
  .filter(t => t !== "basking" || doc.type === "monitor")
  .filter(t => t !== "toggle" || !nested);

// ─── Immutable updates by path (["tabs", 0, "blocks", 2, …]) ───────
export const getIn = (obj, path) => path.reduce((o, k) => (o == null ? o : o[k]), obj);
export const setIn = (obj, path, value) => {
  if (!path.length) return value;
  const [k, ...rest] = path;
  const copy = Array.isArray(obj) ? [...obj] : { ...obj };
  copy[k] = setIn(obj == null ? undefined : obj[k], rest, value);
  return copy;
};
export const updateIn = (obj, path, fn) => setIn(obj, path, fn(getIn(obj, path)));

export const moveItem = (list, i, dir) => {
  const j = i + dir;
  if (j < 0 || j >= list.length) return list;
  const out = [...list];
  [out[i], out[j]] = [out[j], out[i]];
  return out;
};
export const removeAt = (list, i) => list.filter((_, k) => k !== i);

// Temperature bars: the first is the hot one (the shape requires it), so it
// follows the order.
export const fixHot = (bars) => bars.map((b, i) => ({ ...b, hot: i === 0 }));

// ─── Block rules ──────────────────────────────────────────────────
// blocksPath: the list the block sits in; i its index.
// → { canDelete, canMove, why } — why: shown instead of the delete button.
export const blockPolicy = (doc, blocksPath, i) => {
  const blocks = getIn(doc, blocksPath) || [];
  const b = blocks[i];
  if (!b) return { canDelete: false, canMove: false, why: "" };
  if (b.type === "licence") return { canDelete: false, canMove: true, why: "Every species has one licence grid." };
  const topOfFirstTab = blocksPath.length === 3 && blocksPath[0] === "tabs" && blocksPath[1] === 0;
  if (b.type === "basking" && doc.type === "monitor" && topOfFirstTab && blocks.filter(x => x.type === "basking").length === 1) {
    return { canDelete: false, canMove: true, why: "Monitors need the basking banner on their first tab." };
  }
  return { canDelete: true, canMove: true, why: "" };
};

// ─── Tab rules ────────────────────────────────────────────────────
const hasLicence = (tab) => tab.blocks.some(b => b.type === "licence");
const hasBasking = (tab) => tab.blocks.some(b => b.type === "basking");

export const tabPolicy = (doc, ti) => {
  const tab = doc.tabs[ti];
  const n = doc.tabs.length;
  const monitorFirst = doc.type === "monitor" && ti === 0 && hasBasking(tab);
  const licence = hasLicence(tab);
  const canMoveTo = (j) => j >= 0 && j < n && !(doc.type === "monitor" && (ti === 0 || j === 0));
  return {
    canRename: !licence,
    canDelete: n > 1 && !licence && !monitorFirst,
    canLeft: canMoveTo(ti - 1),
    canRight: canMoveTo(ti + 1),
    why: licence ? "The licence tab keeps its name and can't be deleted."
      : monitorFirst ? "A monitor's first tab holds the basking banner, so it stays first."
        : n <= 1 ? "A species needs at least one tab." : "",
  };
};
export const canAddTab = (doc) => doc.tabs.length < LIMITS.tabs;

// Tab keys are the labels in lower case ("Health & setup" → "health & setup");
// the app capitalises the first letter (tabLabel).
export const tabKeyFor = (label) => String(label || "").trim().replace(/\s+/g, " ").toLowerCase();
export const tabKeyProblem = (doc, ti, key) => {
  if (!key) return "A tab needs a name.";
  if (key.length > LIMITS.tabKey) return `Too long (max ${LIMITS.tabKey} characters).`;
  if (doc.tabs.some((t, j) => j !== ti && t.key === key)) return "Another tab already has that name.";
  if (key === "licencing" && !hasLicence(doc.tabs[ti])) return "That name is kept for the licence tab.";
  return null;
};
export const newTabKey = (doc) => {
  let n = 1;
  const taken = new Set(doc.tabs.map(t => t.key));
  while (taken.has(n === 1 ? "new tab" : `new tab ${n}`)) n += 1;
  return n === 1 ? "new tab" : `new tab ${n}`;
};
// New tabs go before the licence tab, which stays last by convention.
export const addTab = (doc) => {
  const at = doc.tabs.findIndex(hasLicence);
  const tab = { key: newTabKey(doc), blocks: [] };
  const tabs = [...doc.tabs];
  tabs.splice(at < 0 ? tabs.length : at, 0, tab);
  return { ...doc, tabs };
};

// ─── Licence rows ─────────────────────────────────────────────────
export const tasLocked = (doc) => !TAS_NATIVES.has(doc.slug);
export const licenceNameProblem = (v) => {
  if (!v || !v.trim()) return "Required: the authority's licence name.";
  if (v.length > LIMITS.licence) return `Too long (max ${LIMITS.licence} characters).`;
  const hit = classCodeIn(v);
  return hit ? `"${hit.match}" looks like a species class code (${hit.kind}). Use the authority's own licence name.` : null;
};
export const licenceNoteProblem = (v) => {
  if (v === null || v === undefined || v === "") return null;
  if (!v.trim()) return "Leave it empty or write a note.";
  if (v.length > LIMITS.licence) return `Too long (max ${LIMITS.licence} characters).`;
  const hit = classCodeIn(v);
  return hit ? `"${hit.match}" looks like a species class code (${hit.kind}).` : null;
};

// ─── Plain fields ─────────────────────────────────────────────────
// The same test as the shape's: text, not blank, within the limit.
export const textProblem = (v, max = LIMITS.text, { optional = false } = {}) => {
  if (v === null || v === undefined || v === "") return optional ? null : "Required.";
  if (typeof v !== "string") return "Must be text.";
  if (!v.trim()) return optional ? "Leave it empty or write something." : "Required.";
  if (v.length > max) return `Too long (${v.length} of ${max} characters).`;
  if (/dubia/i.test(v)) return "Dubia roaches are illegal in Australia; never mention them as a feeder.";
  return null;
};

// ─── Revisions: what text differs from the draft ──────────────────
// Every string in the document with where it sits ("Feeding › Food list"),
// compared as a multiset so reordering alone isn't a change.
const BLOCK_TEXT_SKIP = new Set(["type", "tone", "risk", "abbr", "width", "key", "target", "v", "slug", "id", "emoji"]);
const located = (doc) => {
  const out = [];
  const walk = (v, where, key) => {
    if (BLOCK_TEXT_SKIP.has(key)) return;
    if (typeof v === "string") { out.push({ text: v, where }); return; }
    if (Array.isArray(v)) { v.forEach(x => walk(x, where)); return; }
    if (v && typeof v === "object") {
      const here = v.type && BLOCK_LABELS[v.type] ? `${where} › ${BLOCK_LABELS[v.type]}` : where;
      Object.entries(v).forEach(([k, x]) => walk(x, here, k));
    }
  };
  if (!doc) return out;
  ["name", "latin", "aka", "level"].forEach(k => { if (typeof doc[k] === "string") out.push({ text: doc[k], where: k === "aka" ? "Also known as" : k[0].toUpperCase() + k.slice(1) }); });
  (doc.badges || []).forEach(b => out.push({ text: b, where: "Badges" }));
  (doc.tabs || []).forEach(t => walk(t.blocks, tabLabel(t.key)));
  (doc.tabs || []).forEach(t => out.push({ text: tabLabel(t.key), where: "Tab names" }));
  return out;
};

// → { added: [{text, where}], removed: [...], same: boolean } : `added` is in
// `to` but not `from`. Numbers (sort order) count too.
export const textDiff = (from, to) => {
  const a = located(from), b = located(to);
  const count = (list) => list.reduce((m, x) => m.set(x.text, (m.get(x.text) || 0) + 1), new Map());
  const ca = count(a), cb = count(b);
  const pick = (list, other) => {
    const left = new Map(other);
    return list.filter(x => { const n = left.get(x.text) || 0; if (n > 0) { left.set(x.text, n - 1); return false; } return true; });
  };
  const added = pick(b, ca), removed = pick(a, cb);
  const same = stable(from) === stable(to);
  // Ticks, tones, order of blocks, sort order: changed without new text.
  const otherChanges = !same && !added.length && !removed.length;
  return { added, removed, otherChanges, same };
};

// JSON with sorted keys (the database doesn't keep key order).
export const stable = (v) => (Array.isArray(v) ? `[${v.map(stable).join(",")}]`
  : v && typeof v === "object" ? `{${Object.keys(v).sort().map(k => `${JSON.stringify(k)}:${stable(v[k])}`).join(",")}}`
    : JSON.stringify(v === undefined ? null : v));
export const sameDoc = (a, b) => stable(a) === stable(b);

export const clip = (s, n = 70) => (s.length > n ? `${s.slice(0, n - 1)}…` : s);

// A changed passage, shown from just before where it differs from its
// counterpart in the same place (else from the start).
export const around = (text, other, n = 70) => {
  if (!other) return clip(text, n);
  let i = 0;
  while (i < text.length && i < other.length && text[i] === other[i]) i += 1;
  const from = Math.max(0, i - 20);
  return `${from > 0 ? "…" : ""}${clip(text.slice(from), n)}`;
};
// Pairs each passage with the one it most likely replaced (same place).
export const counterpart = (x, others) => (others.find(o => o.where === x.where) || null);

// "3 days ago" (Australian English, coarse on purpose).
export const ago = (iso, now = Date.now()) => {
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return "";
  const s = Math.max(0, Math.round((now - t) / 1000));
  if (s < 45) return "just now";
  const m = Math.round(s / 60);
  if (m < 60) return `${m} minute${m === 1 ? "" : "s"} ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} hour${h === 1 ? "" : "s"} ago`;
  const d = Math.round(h / 24);
  if (d < 30) return `${d} day${d === 1 ? "" : "s"} ago`;
  return new Date(t).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" });
};
