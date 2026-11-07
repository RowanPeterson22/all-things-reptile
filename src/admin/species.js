// ─── Species index helpers for the admin screens ──────────────────
// The index itself is fetched from /api/admin-species, never bundled.

export const GROUP_CHIPS = [
  { id: "all",      label: "All" },
  { id: "snakes",   label: "Snakes",   groups: ["python", "elapid", "colubrid", "blind-snake", "sea-snake", "file-snake"] },
  { id: "lizards",  label: "Lizards",  groups: ["skink", "dragon", "legless-lizard"] },
  { id: "geckos",   label: "Geckos",   groups: ["gecko"] },
  { id: "monitors", label: "Monitors", groups: ["monitor"] },
  { id: "turtles",  label: "Turtles",  groups: ["turtle", "sea-turtle"] },
  { id: "frogs",    label: "Frogs",    groups: ["frog"] },
  { id: "crocs",    label: "Crocodiles", groups: ["crocodile"] },
];

export const PHOTO_FILTERS = [
  { id: "any",  label: "Any count" },
  { id: "none", label: "No photos" },
  { id: "few",  label: "Under 10" },
];
export const FEW = 10;

const norm = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9 ]+/g, " ").replace(/\s+/g, " ").trim();

// Pre-computed search text per record: common, other common names, scientific, synonyms, slug.
export const searchText = (r) => norm([r.common, ...(r.otherCommon || []), r.scientific, ...(r.synonyms || []), r.slug.replace(/-/g, " ")].join(" "));

export const activeCount = (counts, slug) => (counts && counts[slug] ? counts[slug].active : 0);

// species: index records (each with ._q from searchText). → filtered list.
export const filterSpecies = (species, { q = "", group = "all", photos = "any", appOnly = false, counts = {} } = {}) => {
  const terms = norm(q).split(" ").filter(Boolean);
  const chip = GROUP_CHIPS.find(c => c.id === group);
  const groups = chip && chip.groups ? new Set(chip.groups) : null;
  const out = species.filter(r => {
    if (groups && !groups.has(r.group)) return false;
    if (appOnly && !r.appSlug) return false;
    const n = activeCount(counts, r.slug);
    if (photos === "none" && n > 0) return false;
    if (photos === "few" && n >= FEW) return false;
    const text = r._q || searchText(r);
    return terms.every(t => text.includes(t));
  });
  // With a search, closest name matches first; otherwise app species first, then A–Z.
  const key = (r) => {
    if (!terms.length) return `${r.appSlug ? 0 : 1}${r.common}`;
    const c = norm(r.common);
    const s = norm(r.scientific);
    const whole = terms.join(" ");
    return `${c === whole || s === whole ? 0 : c.startsWith(whole) || s.startsWith(whole) ? 1 : 2}${r.common}`;
  };
  return out.sort((a, b) => (photos === "few" ? activeCount(counts, a.slug) - activeCount(counts, b.slug) : 0) || key(a).localeCompare(key(b)));
};
