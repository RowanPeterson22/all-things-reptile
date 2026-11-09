// ─── App sections, server side ────────────────────────────────────
// Same definition as the app (src/constants/sections.json, through the shared
// rules in src/constants/appLayout.js). The server is the authority on which
// sections a tester gets: /api/beta-check returns the effective list (and the
// layout), the bootstrap redirect lands where the app will, and the admin
// Testers route validates edits against the per-tester keys.

const DEF = require("../src/constants/sections.json");
const layout = require("../src/constants/appLayout.js");

// Per-tester sections (beta_testers.sections), canonical order.
const SECTIONS = DEF.sections.filter(s => s.perTester);
const SECTION_KEYS = SECTIONS.map(s => s.key);
const DEFAULT_SECTIONS = DEF.defaultSections;
const PUBLIC_SECTIONS = layout.resolveView(layout.DEFAULT_CONFIG, { role: "public", isPublic: true }).sections;

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

// The viewer for the shared rules.
const viewerFor = (tester, { isPublic = false } = {}) => (
  !tester ? { role: "public", isPublic }
    : tester.isAdmin ? { role: "admin", isPublic }
      : { role: "tester", own: normaliseSections(tester.sections), isPublic }
);

// What a tester can open under a layout config (defaults if none): admins
// everything; testers their own list; after launch also the public sections.
// Hidden sections and built sections set to "soon" drop out for non-admins.
const effectiveSections = (tester, { isPublic = false, config } = {}) =>
  layout.resolveView(config || layout.DEFAULT_CONFIG, viewerFor(tester, { isPublic })).sections;

// Where a visitor lands: Home with the full shell, else their one screen.
const landingPath = (view) => layout.shellFor(view).landing || "/";

const firstSectionPath = (list) => {
  const first = normaliseSections(list)[0];
  const hit = SECTIONS.find(s => s.key === first);
  return hit ? hit.path : "/";
};

module.exports = { SECTIONS, SECTION_KEYS, DEFAULT_SECTIONS, PUBLIC_SECTIONS, normaliseSections, parseSections, effectiveSections, firstSectionPath, viewerFor, landingPath };
