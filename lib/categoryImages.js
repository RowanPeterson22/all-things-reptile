// ─── Category images ─────────────────────────────────────────────
// The photo Rowan chooses for each Browse category card and category page
// header (/admin → Categories). One row per category in category_images
// (supabase/migrations/*_category_images.sql), pointing at a library photo.
//
// Rules, all checked here on the server:
//  * the photo is of one of the app's 46 species, and that species' type
//    (src/data/species.js, mirrored in lib/identifySpecies.js) is the category;
//  * it's eligible for public use (lib/photoRules.js: licence, active, stock
//    proof, at least 800 px);
//  * choosing it makes the category's own public copy in species-photos
//    (categories/<id>-<version>.jpg, 1,280 px, same pipeline as species
//    copies, iNaturalist large size included). It never touches the species'
//    gallery, slideshow or hero;
//  * hiding, rejecting, moving it out of the category, or a replacement that
//    makes it ineligible clears the category image (row and copy); a
//    replacement or rotation that stays eligible remakes the copy and clears
//    the crops. Deleting the photo cascades in the database; callers that
//    delete photos remove the copy first (clearForPhoto).
// The credit is the photo's own, computed at read time, so credit edits apply.
// Server only.

const { fail, rest, storage, requireUuid, AdminError } = require("./admin");
const { BY_SLUG, INDEX } = require("./adminSpecies");
const APP_SPECIES = require("./identifySpecies");
const FRAMES = require("../src/constants/categoryFrames.json");
const { publicBlockReason, shortBlockReason, publicCredit } = require("./photoRules");
const { makePublicCopy, publicUrl, cleanCrop, unit, PUBLIC_BUCKET } = require("./speciesPhotos");
const { validateCrop, HERO_ASPECT } = require("./heroCrop");

const CATEGORY_IDS = FRAMES.ids;
const CARD_ASPECT = FRAMES.cardAspect;
const BANNER_ASPECT = FRAMES.bannerAspect;
const LABELS = { lizard: "lizard", snake: "snake", gecko: "gecko", turtle: "turtle", frog: "frog", monitor: "monitor" };
const LIBRARY_BUCKET = "reference-photos";

// app slug (D4) → type, from the 46.
const TYPE_BY_APP = Object.fromEntries(APP_SPECIES.map(s => [s.slug, s.type]));
const NAME_BY_APP = Object.fromEntries(APP_SPECIES.map(s => [s.slug, s.name]));

// Index slug → its category, or null (not one of the app's species).
const categoryOf = (indexSlug) => {
  const r = BY_SLUG[indexSlug];
  return (r && r.appSlug && TYPE_BY_APP[r.appSlug]) || null;
};

// The category's app species and every index record filed under each.
const speciesInCategory = (category) => {
  const out = {};
  for (const r of INDEX) {
    if (!r.appSlug || TYPE_BY_APP[r.appSlug] !== category) continue;
    (out[r.appSlug] = out[r.appSlug] || { appSlug: r.appSlug, name: NAME_BY_APP[r.appSlug] || r.common, slugs: [] }).slugs.push(r.slug);
  }
  return Object.values(out).sort((a, b) => a.name.localeCompare(b.name));
};

const requireCategory = (v) => {
  if (typeof v !== "string" || !CATEGORY_IDS.includes(v)) fail(400, "Choose one of the six categories.");
  return v;
};

// null when the photo can be this category's image, else why not (short).
const categoryBlockReason = (photo, category) => {
  if (!photo) return "That photo doesn't exist any more.";
  if (categoryOf(photo.species_slug) !== category) return `Not one of the app's ${LABELS[category] || category} species.`;
  return shortBlockReason(photo);
};

// Columns of the photo needed to check it, copy it and credit it.
const PHOTO_COLUMNS = "id,species_slug,source,source_id,source_url,photographer,licence,licence_url,storage_path,width,height,status,stock_library,stock_asset_id,credit_required,show_credit,display_credit,credit_by_name,master_path,master_width,master_height,public_width,public_height,focal_x,focal_y,edited,replaced_at,is_best,public_use,created_at";
const ROW_COLUMNS = "category_id,photo_id,crop,banner_crop,public_path,public_width,public_height,updated_at,updated_by";
const WITH_PHOTO = `${ROW_COLUMNS},photo:reference_photos(${PHOTO_COLUMNS})`;

const getRows = (cfg, filter = "") => rest(cfg, `category_images?select=${WITH_PHOTO}${filter}&order=category_id.asc`, { method: "GET" }, "category images").then(r => r || []);
const getRow = async (cfg, category) => (await getRows(cfg, `&category_id=eq.${category}`))[0] || null;

const getPhoto = async (cfg, id) => {
  const rows = await rest(cfg, `reference_photos?select=${PHOTO_COLUMNS}&id=eq.${id}&limit=1`, { method: "GET" }, "photo get");
  const row = Array.isArray(rows) && rows[0];
  if (!row) fail(404, "That photo doesn't exist any more.");
  return row;
};

// A new path for every copy, so browsers and the CDN (which keep public
// copies for a day) never show the previous image.
const copyPathFor = (category, now = Date.now()) => `categories/${category}-${now.toString(36)}.jpg`;

const removeCopy = (cfg, path) => (path
  ? storage.remove(cfg, PUBLIC_BUCKET, path).catch(() => console.error("category images: copy cleanup failed"))
  : Promise.resolve());

// ─── Views ────────────────────────────────────────────────────────
const isLive = (row) => Boolean(row && row.photo && row.public_path && row.photo.status === "active"
  && categoryOf(row.photo.species_slug) === row.category_id && !publicBlockReason(row.photo));

const toPublic = (cfg, row) => {
  const p = row.photo;
  const credit = publicCredit(p);
  const sp = BY_SLUG[p.species_slug] || {};
  return {
    category: row.category_id,
    url: publicUrl(cfg, row.public_path),
    width: row.public_width,
    height: row.public_height,
    focal: { x: unit(p.focal_x), y: unit(p.focal_y) },
    crop: cleanCrop(row.crop),
    bannerCrop: cleanCrop(row.banner_crop),
    speciesName: sp.common || null,
    alt: `${sp.common || "Reptile"}${credit.show && credit.name ? `, photo by ${credit.name}` : ""}`,
    credit,
  };
};

// GET /api/species-photos?categories=1: only rows whose photo is still fine.
const listPublicCategoryImages = async (cfg) => (await getRows(cfg)).filter(isLive).map(r => toPublic(cfg, r));

const toAdmin = (cfg, row) => ({
  ...toPublic(cfg, row),
  photoId: row.photo_id,
  speciesSlug: row.photo.species_slug,
  updatedAt: row.updated_at,
  updatedBy: row.updated_by,
  live: isLive(row),
});

// ─── Admin reads ──────────────────────────────────────────────────
// GET /api/admin-photos?categories=1 → { categories: [...] } (live or not, so
// the admin sees a broken one).
const listCategoriesAdmin = async ({ cfg }) => {
  const rows = await getRows(cfg);
  return { status: 200, body: { categories: rows.filter(r => r.photo).map(r => toAdmin(cfg, r)), cardAspect: CARD_ASPECT, bannerAspect: BANNER_ASPECT } };
};

// GET /api/admin-photos?category=<id> → the picker: the category's species and
// their active library photos, each with why it can't be used (if so).
const listCategoryPicker = async ({ cfg, query }) => {
  const category = requireCategory(query.category);
  const species = speciesInCategory(category);
  const slugs = species.flatMap(s => s.slugs);
  const [rows, current] = await Promise.all([
    slugs.length ? rest(cfg, `reference_photos?select=${PHOTO_COLUMNS}&species_slug=in.(${slugs.join(",")})&status=eq.active&order=is_best.desc,public_use.desc,created_at.desc&limit=2000`, { method: "GET" }, "category picker") : [],
    getRow(cfg, category),
  ]);
  const photos = rows || [];
  const urls = await storage.sign(cfg, LIBRARY_BUCKET, photos.map(p => p.storage_path));
  const appOf = (slug) => (BY_SLUG[slug] || {}).appSlug || null;
  return {
    status: 200,
    body: {
      category,
      species: species.map(({ appSlug, name }) => ({ appSlug, name })),
      currentPhotoId: current ? current.photo_id : null,
      photos: photos.map(p => ({
        id: p.id,
        species: appOf(p.species_slug),
        speciesSlug: p.species_slug,
        speciesName: (BY_SLUG[p.species_slug] || {}).common || p.species_slug,
        url: urls[p.storage_path] || null,
        width: p.width, height: p.height,
        licence: p.licence,
        isBest: Boolean(p.is_best),
        credit: publicCredit(p),
        block: categoryBlockReason(p, category),
      })),
    },
  };
};

// ─── Admin writes ─────────────────────────────────────────────────
// PATCH /api/admin-photos { category, photoId }   choose (crops reset)
//                         { category, crop?, bannerCrop? }  set or clear (null) the crops
const updateCategory = async ({ cfg, admin, body }, { now = Date.now } = {}) => {
  const category = requireCategory(body.category);
  const allowed = ["category", "photoId", "crop", "bannerCrop"];
  for (const k of Object.keys(body)) if (!allowed.includes(k)) fail(400, `${k} can't be changed here.`);
  const stamp = { updated_at: new Date(now()).toISOString(), updated_by: admin.name };

  if ("photoId" in body) {
    if ("crop" in body || "bannerCrop" in body) fail(400, "Choose the photo first, then set the crops.");
    const id = requireUuid(body.photoId, "photo id");
    const photo = await getPhoto(cfg, id);
    const reason = categoryBlockReason(photo, category);
    if (reason) fail(400, reason);
    const before = await getRow(cfg, category);
    const path = copyPathFor(category, now());
    const copy = await makePublicCopy(cfg, photo, path);
    const fields = { category_id: category, photo_id: id, crop: null, banner_crop: null, public_path: path, public_width: copy.width, public_height: copy.height, ...stamp };
    let saved;
    try {
      saved = await rest(cfg, `category_images?on_conflict=category_id&select=${ROW_COLUMNS}`, {
        method: "POST",
        headers: { Prefer: "resolution=merge-duplicates,return=representation" },
        body: JSON.stringify(fields),
      }, "category image save");
    } catch (e) {
      await removeCopy(cfg, path);
      throw e;
    }
    if (before && before.public_path && before.public_path !== path) await removeCopy(cfg, before.public_path);
    if (copy.found && copy.size === "large") {
      // Remember the iNaturalist large size, as species publishing does.
      await rest(cfg, `reference_photos?id=eq.${id}`, { method: "PATCH", headers: { Prefer: "return=minimal" }, body: JSON.stringify(copy.found) }, "photo size record").catch(() => {});
    }
    const row = (Array.isArray(saved) && saved[0]) || fields;
    return { status: 200, body: { category: toAdmin(cfg, { ...row, photo }) } };
  }

  if (!("crop" in body) && !("bannerCrop" in body)) fail(400, "Send a photo or a crop.");
  const current = await getRow(cfg, category);
  if (!current) fail(404, "This category has no image yet. Choose a photo first.");
  const size = { width: current.public_width, height: current.public_height };
  const patch = { ...stamp };
  if ("crop" in body) patch.crop = validateCrop(body.crop, size, { aspect: CARD_ASPECT, label: "The card crop" });
  if ("bannerCrop" in body) patch.banner_crop = validateCrop(body.bannerCrop, size, { aspect: BANNER_ASPECT, label: "The banner crop" });
  const rows = await rest(cfg, `category_images?category_id=eq.${category}&photo_id=eq.${current.photo_id}&select=${ROW_COLUMNS}`, {
    method: "PATCH", headers: { Prefer: "return=representation" }, body: JSON.stringify(patch),
  }, "category crop");
  const row = Array.isArray(rows) && rows[0];
  if (!row) fail(409, "The category image changed meanwhile. Reload and try again.");
  return { status: 200, body: { category: toAdmin(cfg, { ...row, photo: current.photo }) } };
};

// DELETE /api/admin-photos { category }: back to the emoji. Row first, then the
// copy, so the app never points at a missing file.
const removeCategory = async ({ cfg, body }) => {
  const category = requireCategory(body && body.category);
  const current = await getRow(cfg, category);
  if (!current) return { status: 200, body: { removed: false } };
  await rest(cfg, `category_images?category_id=eq.${category}`, { method: "DELETE", headers: { Prefer: "return=minimal" } }, "category image delete");
  await removeCopy(cfg, current.public_path);
  return { status: 200, body: { removed: true } };
};

// ─── Cascades from photo changes ──────────────────────────────────
const rowsForPhoto = (cfg, photoId) => rest(cfg, `category_images?select=${ROW_COLUMNS}&photo_id=eq.${photoId}`, { method: "GET" }, "category images for photo").then(r => r || []);

const clearRows = async (cfg, rows) => {
  for (const r of rows) {
    await rest(cfg, `category_images?category_id=eq.${r.category_id}&photo_id=eq.${r.photo_id}`, { method: "DELETE", headers: { Prefer: "return=minimal" } }, "category image clear");
    await removeCopy(cfg, r.public_path);
  }
  return rows.map(r => r.category_id);
};

// Before a photo row is deleted (the FK cascade would leave the copy behind).
const clearForPhoto = async (cfg, photoId) => clearRows(cfg, await rowsForPhoto(cfg, photoId));

// After PATCH changed status or species: clear the categories it no longer fits.
// → cleared category ids.
const afterPhotoUpdate = async (cfg, rows, next) => clearRows(cfg, rows.filter(r => categoryBlockReason(next, r.category_id)));

// After PUT (replace or rotate): remake each copy from the new image and clear
// the crops; clear the category instead if the new image isn't eligible.
// → { regenerated: [ids], cleared: [ids] }
const afterPhotoReplace = async (cfg, rows, next, admin, { now = Date.now } = {}) => {
  const out = { regenerated: [], cleared: [] };
  for (const r of rows) {
    if (categoryBlockReason(next, r.category_id)) { out.cleared.push(...await clearRows(cfg, [r])); continue; }
    const path = copyPathFor(r.category_id, now());
    let copy;
    try {
      copy = await makePublicCopy(cfg, next, path);
    } catch (e) {
      if (!(e instanceof AdminError)) throw e;
      out.cleared.push(...await clearRows(cfg, [r]));
      continue;
    }
    try {
      await rest(cfg, `category_images?category_id=eq.${r.category_id}&photo_id=eq.${r.photo_id}`, {
        method: "PATCH", headers: { Prefer: "return=minimal" },
        body: JSON.stringify({ public_path: path, public_width: copy.width, public_height: copy.height, crop: null, banner_crop: null, updated_at: new Date(now()).toISOString(), updated_by: admin ? admin.name : null }),
      }, "category image regenerate");
    } catch (e) {
      await removeCopy(cfg, path);
      throw e;
    }
    await removeCopy(cfg, r.public_path);
    out.regenerated.push(r.category_id);
  }
  return out;
};

// For the admin library: which categories use each photo. → { [photoId]: [ids] }
const categoriesByPhoto = async (cfg, photoIds) => {
  if (!photoIds.length) return {};
  const rows = (await rest(cfg, `category_images?select=category_id,photo_id`, { method: "GET" }, "category use")) || [];
  const want = new Set(photoIds);
  const out = {};
  for (const r of rows) if (want.has(r.photo_id)) (out[r.photo_id] = out[r.photo_id] || []).push(r.category_id);
  return out;
};

module.exports = {
  CATEGORY_IDS, CARD_ASPECT, BANNER_ASPECT, HERO_ASPECT,
  categoryOf, speciesInCategory, categoryBlockReason, copyPathFor,
  listPublicCategoryImages, listCategoriesAdmin, listCategoryPicker, updateCategory, removeCategory,
  rowsForPhoto, clearForPhoto, afterPhotoUpdate, afterPhotoReplace, categoriesByPhoto,
};
