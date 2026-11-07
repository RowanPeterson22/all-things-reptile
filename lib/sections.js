// ─── App sections, server side ────────────────────────────────────
// Same definition as the app (src/constants/sections.json). The server is the
// authority on which sections a tester gets: /api/beta-check returns the
// effective list, the bootstrap redirect lands on the first one, and the admin
// Testers route validates edits against these keys.

const DEF = require("../src/constants/sections.json");

const SECTIONS = DEF.sections;
const SECTION_KEYS = SECTIONS.map(s => s.key);
const DEFAULT_SECTIONS = DEF.defaultSections;
const PUBLIC_SECTIONS = SECTIONS.filter(s => s.public).map(s => s.key);

const normaliseSections = (list) => {
  const want = new Set(Array.isArray(list) ? list : []);
  return SECTION_KEYS.filter(k => want.has(k));
};

// Strict: for admin edits. Returns the normalised list or null if invalid.
const parseSections = (v) => {
  if (!Array.isArray(v) || v.length > SECTION_KEYS.length * 2) return null;
  if (!v.every(k => typeof k === "string" && SECTION_KEYS.includes(k))) return null;
  return normaliseSections(v);
};

// What a tester can open: admins everything; testers their own list; once the
// app is public (ATR_PUBLIC=true) everyone also gets the public sections.
const effectiveSections = (tester, { isPublic = false } = {}) => {
  if (tester && tester.isAdmin) return [...SECTION_KEYS];
  const own = normaliseSections(tester ? tester.sections : []);
  return isPublic ? normaliseSections([...own, ...PUBLIC_SECTIONS]) : own;
};

const firstSectionPath = (list) => {
  const first = normaliseSections(list)[0];
  const hit = SECTIONS.find(s => s.key === first);
  return hit ? hit.path : "/";
};

module.exports = { SECTIONS, SECTION_KEYS, DEFAULT_SECTIONS, PUBLIC_SECTIONS, normaliseSections, parseSections, effectiveSections, firstSectionPath };
