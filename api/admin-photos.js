// ─── /api/admin-photos ────────────────────────────────────────────
// Admin only. Reference photo library (private reference-photos bucket).
//   GET   ?species=<index slug>[&all=1]   photos with 10-minute signed URLs
//   GET   ?download=<photo id>            2-minute signed URL that saves <slug>-<id>.jpg (master, else reference)
//   POST  { speciesSlug, photo, master?, photographer, licence, sourceUrl | permissionNote, … }
//   PUT   { id, photo, master? }          replace the image (also Rotate 90°); keeps credit/licence/source
//   PATCH { id, changes: { status | is_best | traits | notes | species_slug |
//           public_use | public_order | show_credit | display_credit | credit_by_name |
//           focal_x | focal_y | is_hero | hero_crop } }
//         is_hero true makes it the species' only hero (the old one is unticked atomically);
//         hero_crop { x, y, w, h } (0–1, 2.4 : 1, w ≥ 0.3) or null.
//         public_use true copies the photo into the public species-photos bucket
//         (iNaturalist at the large size where it can); false removes that copy.
// Category images (Browse cards and category headers, lib/categoryImages.js):
//   GET    ?categories=1                  every category image
//   GET    ?category=<id>                 the picker: the category's species and library photos
//   PATCH  { category, photoId }          choose (makes categories/<id>-<v>.jpg; crops reset)
//   PATCH  { category, crop?, bannerCrop? }  card crop (1.85 : 1) / banner crop (2.4 : 1), null clears
//   DELETE { category }                   back to the emoji

const { adminRoute } = require("../lib/admin");
const { listPhotos, uploadPhoto, patchRoute, replacePhoto, removeCategory } = require("../lib/adminPhotos");

module.exports = adminRoute({ GET: listPhotos, POST: (ctx) => uploadPhoto(ctx), PATCH: patchRoute, PUT: replacePhoto, DELETE: removeCategory });
