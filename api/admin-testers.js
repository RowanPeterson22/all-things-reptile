// ─── /api/admin-testers ───────────────────────────────────────────
// Admin only. Beta testers. Invite codes are never listed or logged.
//   GET                                     list
//   POST  { name, group }                   create; the invite link is in this response only
//   PATCH { id, active?, is_admin? }        (de)activate, grant/remove admin

const { adminRoute } = require("../lib/admin");
const { listTesters, createTester, updateTester } = require("../lib/adminTesters");

module.exports = adminRoute({ GET: listTesters, POST: (ctx) => createTester(ctx), PATCH: updateTester });
