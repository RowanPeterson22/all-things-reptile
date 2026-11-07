// ─── /api/admin-species ───────────────────────────────────────────
// Admin only. The species index (1,363 natives), reference photo counts per
// species, and the morph catalogue with its editing (Admin → Morphs).
//   GET   [?only=counts|morphs]       index, counts and morph catalogue
//   POST  { morph }                   add a morph
//   PATCH { id, changes }             edit, soft-delete or restore a morph
//   PUT   { morphId, speciesSlug, assigned, cueOverride?, sort? }
//                                     assign a morph to a species, or remove it
// Morph writes live here rather than in a new function (Vercel Hobby cap).

const { adminRoute } = require("../lib/admin");
const { getSpecies } = require("../lib/adminSpecies");
const { createMorph, updateMorph, setAssignment } = require("../lib/adminMorphs");

module.exports = adminRoute({ GET: getSpecies, POST: createMorph, PATCH: updateMorph, PUT: setAssignment });
