// ─── Morph catalogue helpers for the admin screens ────────────────
// The catalogue comes from /api/admin-species (lib/adminMorphs.js):
// [{ id, name, cue, au_status, notes, deleted_at, species: [{ slug, cue_override, sort }] }].
// It's never bundled: the public app gets trait names from /api/beta-check.

const norm = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9 ]+/g, " ").replace(/\s+/g, " ").trim();

export const MORPH_ID_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;
export const MAX_ID = 60;
export const MAX_NAME = 80;
export const MAX_CUE = 500;
export const MAX_NOTES = 2000;

export const AU_LABEL = { established: "Established in AU", check: "Check AU" };
export const AU_TONE = { established: "orange", check: "gold" };

// Same rule as the server (lib/adminMorphs.js slugify).
export const slugify = (v) => String(v || "")
  .normalize("NFD").replace(/[̀-ͯ]/g, "")
  .toLowerCase()
  .replace(/[’']/g, "")
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-+|-+$/g, "")
  .slice(0, MAX_ID)
  .replace(/-+$/g, "");

export const byId = (catalogue) => Object.fromEntries((catalogue || []).map(m => [m.id, m]));

// Active morphs assigned to a species, in its sort order, with the cue the AI
// sees for it (the species' own cue where one is set).
export const morphsForSpecies = (catalogue, slug) => (catalogue || [])
  .filter(m => !m.deleted_at)
  .map(m => ({ m, link: m.species.find(s => s.slug === slug) }))
  .filter(x => x.link)
  .sort((a, b) => a.link.sort - b.link.sort || a.m.id.localeCompare(b.m.id))
  .map(({ m, link }) => ({ id: m.id, name: m.name, cue: link.cue_override || m.cue, au_status: m.au_status, cueOverride: link.cue_override || null }));

// Search by name, id, cue or notes. status: "all" | "established" | "check".
export const filterMorphs = (catalogue, { q = "", status = "all", showDeleted = false } = {}) => {
  const terms = norm(q).split(" ").filter(Boolean);
  return (catalogue || []).filter(m => {
    if (!showDeleted && m.deleted_at) return false;
    if (status !== "all" && m.au_status !== status) return false;
    const text = norm([m.name, m.id.replace(/-/g, " "), m.cue, m.notes].join(" "));
    return terms.every(t => text.includes(t));
  });
};

// Client-side checks before a save; the server checks again.
// → { [field]: message }
export const validateMorph = ({ id, name, cue, notes }, { catalogue = [], creating = false } = {}) => {
  const errors = {};
  if (!String(name || "").trim()) errors.name = "Add a name.";
  else if (name.trim().length > MAX_NAME) errors.name = `Keep the name under ${MAX_NAME} characters.`;
  if (!String(cue || "").trim()) errors.cue = "Add the visual cue the AI looks for.";
  else if (cue.trim().length > MAX_CUE) errors.cue = `Keep the cue under ${MAX_CUE} characters.`;
  if (notes && notes.length > MAX_NOTES) errors.notes = `Keep notes under ${MAX_NOTES} characters.`;
  if (creating) {
    if (!id) errors.id = "Add an id (lower case, hyphenated).";
    else if (id.length > MAX_ID || !MORPH_ID_RE.test(id)) errors.id = "Lower-case letters, numbers and single hyphens only.";
    else {
      const clash = catalogue.find(m => m.id === id);
      if (clash) errors.id = clash.deleted_at ? `“${id}” belongs to a deleted morph (${clash.name}). Restore that instead.` : `“${id}” is already used by ${clash.name}.`;
    }
  }
  return errors;
};
