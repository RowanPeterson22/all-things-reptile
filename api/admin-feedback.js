// ─── /api/admin-feedback ──────────────────────────────────────────
// Admin only. AI ID tester feedback inbox.
//   GET  [?offset=N]                       newest first, consented photos signed
//   POST { feedbackId, speciesSlug? }      add the consented photo to the library
//   DELETE { feedbackId, removeLibraryCopy? }   delete the row and its id-photos file;
//                                          409 until the admin chooses for a filed library copy

const { adminRoute } = require("../lib/admin");
const { listFeedback, addToLibrary, deleteFeedback } = require("../lib/adminFeedback");

module.exports = adminRoute({ GET: listFeedback, POST: addToLibrary, DELETE: deleteFeedback });
