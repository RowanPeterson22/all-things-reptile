import DEF from "./sections.json";

// ─── App sections (pre-launch gate, per-tester access) ────────────
// Defined once in sections.json; lib/sections.js reads the same file on the
// server. The server decides who gets which sections (/api/beta-check); this
// module only turns that list into tabs, routes and links.

export const SECTIONS = DEF.sections;
export const SECTION_KEYS = SECTIONS.map(s => s.key);
export const DEFAULT_SECTIONS = DEF.defaultSections;
// What the public sees once ATR_PUBLIC=true. AI ID stays beta-only (D9).
export const PUBLIC_SECTIONS = SECTIONS.filter(s => s.public).map(s => s.key);

// Known keys only, no duplicates, in the canonical order.
export const normaliseSections = (list) => {
  const want = new Set(Array.isArray(list) ? list : []);
  return SECTION_KEYS.filter(k => want.has(k));
};

export const firstSectionPath = (list) => {
  const first = normaliseSections(list)[0];
  const hit = SECTIONS.find(s => s.key === first);
  return hit ? hit.path : "/";
};

// The checks the shell and screens use. Species pages are care pages too:
// "View care guide" on an ID result opens one, so `care` alone can open them.
export const accessFor = (list) => {
  const set = new Set(normaliseSections(list));
  const has = (k) => set.has(k);
  return {
    sections: [...set],
    has,
    browse: has("species"),
    speciesPages: has("species") || has("care"),
    careGuides: has("care"),
    licensing: has("licensing"),
    glossary: has("glossary"),
    search: has("search"),
    credits: has("credits"),
    id: has("id"),
    home: firstSectionPath([...set]),
  };
};
