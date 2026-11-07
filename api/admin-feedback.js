// ─── /api/admin-feedback ──────────────────────────────────────────
// Admin only. AI ID tester feedback inbox.
//   GET  [?offset=N]                       newest first, consented photos signed
//   POST { feedbackId, speciesSlug? }      add the consented photo to the library

const { adminRoute } = require("../lib/admin");
const { listFeedback, addToLibrary } = require("../lib/adminFeedback");

module.exports = adminRoute({ GET: listFeedback, POST: addToLibrary });
