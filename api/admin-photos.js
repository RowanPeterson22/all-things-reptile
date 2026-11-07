// ─── /api/admin-photos ────────────────────────────────────────────
// Admin only. Reference photo library (private reference-photos bucket).
//   GET   ?species=<index slug>[&all=1]   photos with 10-minute signed URLs
//   POST  { speciesSlug, photo, photographer, licence, sourceUrl | permissionNote, … }
//   PATCH { id, changes: { status | is_best | traits | notes | species_slug |
//           public_use | public_order | show_credit | display_credit | credit_by_name } }
//         public_use true copies the photo into the public species-photos bucket
//         (iNaturalist at the large size where it can); false removes that copy.

const { adminRoute } = require("../lib/admin");
const { listPhotos, uploadPhoto, updatePhoto } = require("../lib/adminPhotos");

module.exports = adminRoute({ GET: listPhotos, POST: (ctx) => uploadPhoto(ctx), PATCH: updatePhoto });
