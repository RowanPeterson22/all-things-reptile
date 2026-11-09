// ─── /api/admin-testers ───────────────────────────────────────────
// Admin only. Beta testers. Invite codes are never listed or logged.
//   GET                                     list, plus section options and defaultSections
//   POST  { name, group, sections? }        create; the invite link is in this response only
//   PATCH { id, active?, is_admin?, sections? }   (de)activate, grant/remove admin, set sections
//   PATCH { defaultSections }               the sections new invites get
//   ?scope=sections                         the app layout (/admin → Sections):
//     GET  the editor's view; PATCH one change (lib/appSections.js). Shares this
//     function because the project is near Vercel Hobby's function cap.

const { adminRoute } = require("../lib/admin");
const { listTesters, createTester, updateTester } = require("../lib/adminTesters");
const { getSectionsAdmin, updateSectionsAdmin } = require("../lib/appSections");

const isLayout = (ctx) => ctx.query && ctx.query.scope === "sections";

module.exports = adminRoute({
  GET: (ctx) => (isLayout(ctx) ? getSectionsAdmin(ctx) : listTesters(ctx)),
  POST: (ctx) => createTester(ctx),
  PATCH: (ctx) => (isLayout(ctx) ? updateSectionsAdmin(ctx) : updateTester(ctx)),
});
