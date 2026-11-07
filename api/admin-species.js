// ─── GET /api/admin-species ───────────────────────────────────────
// Admin only. The species index (1,363 natives), reference photo counts per
// species and the draft morph list per app species. Read-only for now.

const { adminRoute } = require("../lib/admin");
const { getSpecies } = require("../lib/adminSpecies");

module.exports = adminRoute({ GET: getSpecies });
