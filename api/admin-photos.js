// ─── /api/admin-photos ────────────────────────────────────────────
// Admin only. Reference photo library (private reference-photos bucket).
//   GET   ?species=<index slug>[&all=1]   photos with 10-minute signed URLs
//   GET   ?download=<photo id>            2-minute signed URL that saves <slug>-<id>.jpg (master, else reference)
//   POST  { speciesSlug, photo, master?, photographer, licence, sourceUrl | permissionNote, … }
//   PUT   { id, photo, master? }          replace the image (also Rotate 90°); keeps credit/licence/source
//   PATCH { id, changes: { status | is_best | traits | notes | species_slug |
//           public_use | public_order | show_credit | display_credit | credit_by_name } }
//         public_use true copies the photo into the public species-photos bucket
//         (iNaturalist at the large size where it can); false removes that copy.

const { adminRoute } = require("../lib/admin");
const { listPhotos, uploadPhoto, updatePhoto, replacePhoto } = require("../lib/adminPhotos");

module.exports = adminRoute({ GET: listPhotos, POST: (ctx) => uploadPhoto(ctx), PATCH: updatePhoto, PUT: replacePhoto });
