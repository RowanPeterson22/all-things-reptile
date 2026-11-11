// ─── /api/admin-species ───────────────────────────────────────────
// Admin only. The species index (1,363 natives), reference photo counts per
// species, and the morph catalogue with its editing (Admin → Morphs).
//   GET   [?only=counts|morphs]       index, counts and morph catalogue
//   POST  { morph }                   add a morph
//   PATCH { id, changes }             edit, soft-delete or restore a morph
//   PUT   { morphId, speciesSlug, assigned, cueOverride?, sort? }
//                                     assign a morph to a species, or remove it
//   ?scope=content                    species page content (Admin → Species, D5):
//     GET [&slug=]  the list, or one species with its revisions
//     POST { action: save|publish|discard|revert, slug, expectedUpdatedAt, … }
//     (lib/adminSpeciesContent.js)
// Morph and content writes live here rather than in new functions (Vercel Hobby cap).

const { adminRoute } = require("../lib/admin");
const { getSpecies } = require("../lib/adminSpecies");
const { createMorph, updateMorph, setAssignment } = require("../lib/adminMorphs");
const { getContent, contentAction } = require("../lib/adminSpeciesContent");

const isContent = (ctx) => ctx.query && ctx.query.scope === "content";
const notHere = async () => ({ status: 405, body: { error: "Method not allowed." } });

module.exports = adminRoute({
  GET: (ctx) => (isContent(ctx) ? getContent(ctx) : getSpecies(ctx)),
  POST: (ctx) => (isContent(ctx) ? contentAction(ctx) : createMorph(ctx)),
  PATCH: (ctx) => (isContent(ctx) ? notHere() : updateMorph(ctx)),
  PUT: (ctx) => (isContent(ctx) ? notHere() : setAssignment(ctx)),
});
