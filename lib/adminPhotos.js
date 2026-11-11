// ─── Admin: reference photo library ──────────────────────────────
// List a species' reference_photos with short-lived signed URLs, change a
// photo (status, best, traits, notes, species, credit settings, use on the
// species page), and upload a new one (including royalty-free stock).
// Bucket: private reference-photos (JPEG only, 2 MB cap). Files live at
// <species_slug>/<source>-<source_id>.jpg; storage_path is the part after the bucket.

const crypto = require("crypto");
const { assertKnownTraits } = require("./adminMorphs");
const { AdminError, fail, rest, storage, cleanText, cleanUrl, cleanTraits, requireUuid, jpegSize, isJpeg } = require("./admin");
const { SLUGS, BY_SLUG } = require("./adminSpecies");
const { LICENCES, attributionRequired, publicBlockReason, shortBlockReason, publicCredit } = require("./photoRules");
const { publishPhoto, unpublishPhoto, publicUrl } = require("./speciesPhotos");
const { SPEC, decode, toJpeg, longEdge } = require("./imageResize");
const { validateHeroCrop, imageSize } = require("./heroCrop");
const categories = require("./categoryImages");

const BUCKET = "reference-photos";
const MAX_BYTES = 2 * 1024 * 1024; // the bucket's file_size_limit
const STATUSES = ["active", "hidden", "rejected"];
const LICENCE_URLS = {
  "cc0": "https://creativecommons.org/publicdomain/zero/1.0/",
  "cc-by": "https://creativecommons.org/licenses/by/4.0/",
  "cc-by-sa": "https://creativecommons.org/licenses/by-sa/4.0/",
};
const COLUMNS = "id,species_slug,source,source_id,source_url,photographer,licence,licence_url,storage_path,width,height,observed_on,state,quality,traits,is_best,status,notes,added_by,created_at,stock_library,stock_asset_id,credit_required,show_credit,display_credit,credit_by_name,public_use,public_order,public_path,master_path,master_width,master_height,public_width,public_height,focal_x,focal_y,edited,replaced_at,replaced_by,is_hero,hero_crop";

const requireSpecies = (v, label = "species") => {
  if (typeof v !== "string" || !SLUGS.has(v)) fail(400, `Choose a ${label} from the index.`);
  return v;
};

// Adds the signed library URL plus what the admin needs to manage public use:
// the credit exactly as customers see it, why it can't go public (if so), and
// the public copy's URL.
const withUrls = async (cfg, rows) => {
  const urls = await storage.sign(cfg, BUCKET, rows.map(r => r.storage_path));
  return rows.map(r => {
    const sp = BY_SLUG[r.species_slug];
    const block = publicBlockReason(r) || (sp && sp.appSlug ? null : "This species has no page in the app.");
    return {
      ...r,
      url: urls[r.storage_path] || null,
      credit: publicCredit(r),
      attributionRequired: attributionRequired(r),
      publicBlock: r.public_use ? null : block,
      // The same, in a few words, for thumbnails (the Species editor's panel).
      publicBlockShort: r.public_use || !block ? null : (shortBlockReason(r) || "No page in the app."),
      publicUrl: r.public_use ? publicUrl(cfg, r.public_path) : null,
    };
  });
};

// GET ?download=<photo id>: a 2-minute signed URL for the best copy (the
// master if there is one, else the reference copy) that saves as
// <species slug>-<id>.jpg rather than opening.
const downloadPhoto = async ({ cfg, query }) => {
  const id = requireUuid(query.download, "photo id");
  const photo = await getPhoto(cfg, id);
  const path = photo.master_path || photo.storage_path;
  const urls = await storage.sign(cfg, BUCKET, [path], 120);
  if (!urls[path]) fail(502, "Couldn't make a download link. Try again.");
  const filename = `${photo.species_slug}-${photo.id}.jpg`;
  const url = `${urls[path]}${urls[path].includes("?") ? "&" : "?"}download=${encodeURIComponent(filename)}`;
  return { status: 200, body: { url, filename, copy: photo.master_path ? "master" : "reference", width: photo.master_path ? photo.master_width : photo.width, height: photo.master_path ? photo.master_height : photo.height } };
};

// GET ?species=<slug>[&all=1]. Default: active only; all=1 adds hidden and rejected.
// Also ?categories=1 (the category images) and ?category=<id> (its picker).
const listPhotos = async ({ cfg, query }) => {
  if (query.download !== undefined) return downloadPhoto({ cfg, query });
  if (query.categories !== undefined) return categories.listCategoriesAdmin({ cfg, query });
  if (query.category !== undefined) return categories.listCategoryPicker({ cfg, query });
  const slug = requireSpecies(query.species);
  if (query.filter !== undefined) return listPhotoPage(cfg, slug, query);
  const all = query.all === "1" || query.all === "true";
  const filter = all ? "" : "&status=eq.active";
  const rows = await rest(cfg, `reference_photos?select=${COLUMNS}&species_slug=eq.${slug}${filter}&order=is_best.desc,created_at.desc&limit=500`, { method: "GET" }, "photo list");
  const [photos, used] = await Promise.all([withUrls(cfg, rows || []), categories.categoriesByPhoto(cfg, (rows || []).map(r => r.id))]);
  // Which Browse categories use each photo, so the screen can say so.
  return { status: 200, body: { photos: photos.map(p => ({ ...p, categories: used[p.id] || [] })) } };
};

// ─── One page, for the Species editor's Photos panel ──────────────
// A species can have 2,000+ iNaturalist reference photos, so the panel asks
// for one filter at a time, a page at a time:
//   public     on the species page (active, public_use), in the app's order
//   reference  active, not on the species page, best first, newest first
//   hidden     hidden or rejected, newest first
// ?offset (0–100,000) and ?limit (1–100, default 24). One extra row is read
// to say whether there are more.
const PAGE_FILTERS = {
  public: { where: "&status=eq.active&public_use=is.true", order: "public_order.asc.nullslast,created_at.asc" },
  reference: { where: "&status=eq.active&public_use=is.false", order: "is_best.desc,created_at.desc" },
  hidden: { where: "&status=in.(hidden,rejected)", order: "created_at.desc" },
};
const PAGE_DEFAULT = 24;
const PAGE_MAX = 100;
const OFFSET_MAX = 100000;

const pageNumber = (v, { dflt, min, max, label }) => {
  if (v === undefined || v === "") return dflt;
  const n = typeof v === "number" ? v : /^\d{1,6}$/.test(String(v)) ? Number(v) : NaN;
  if (!Number.isInteger(n) || n < min || n > max) fail(400, `${label} must be a whole number from ${min} to ${max.toLocaleString("en-AU")}.`);
  return n;
};

const listPhotoPage = async (cfg, slug, query) => {
  const f = PAGE_FILTERS[query.filter];
  if (!f) fail(400, "Filter must be public, reference or hidden.");
  const offset = pageNumber(query.offset, { dflt: 0, min: 0, max: OFFSET_MAX, label: "Offset" });
  const limit = pageNumber(query.limit, { dflt: PAGE_DEFAULT, min: 1, max: PAGE_MAX, label: "Limit" });
  const rows = (await rest(cfg, `reference_photos?select=${COLUMNS}&species_slug=eq.${slug}${f.where}&order=${f.order}&offset=${offset}&limit=${limit + 1}`, { method: "GET" }, "photo page")) || [];
  const page = rows.slice(0, limit);
  const [photos, used] = await Promise.all([withUrls(cfg, page), categories.categoriesByPhoto(cfg, page.map(r => r.id))]);
  return { status: 200, body: { photos: photos.map(p => ({ ...p, categories: used[p.id] || [] })), filter: query.filter, offset, limit, hasMore: rows.length > limit } };
};

const getPhoto = async (cfg, id) => {
  const rows = await rest(cfg, `reference_photos?select=${COLUMNS}&id=eq.${id}&limit=1`, { method: "GET" }, "photo get");
  const row = Array.isArray(rows) && rows[0];
  if (!row) fail(404, "That photo doesn't exist any more.");
  return row;
};

// Body → the column patch. Throws on anything unknown or invalid.
const validateChanges = (changes) => {
  if (!changes || typeof changes !== "object" || Array.isArray(changes)) fail(400, "Send the changes to make.");
  const allowed = ["status", "is_best", "traits", "notes", "species_slug", "public_use", "public_order", "show_credit", "display_credit", "credit_by_name", "focal_x", "focal_y", "is_hero", "hero_crop"];
  const keys = Object.keys(changes);
  if (!keys.length) fail(400, "Nothing to change.");
  for (const k of keys) if (!allowed.includes(k)) fail(400, `${k} can't be changed here.`);
  const patch = {};
  if ("status" in changes) {
    if (!STATUSES.includes(changes.status)) fail(400, "Status must be active, hidden or rejected.");
    patch.status = changes.status;
  }
  if ("is_best" in changes) {
    if (typeof changes.is_best !== "boolean") fail(400, "Best must be true or false.");
    patch.is_best = changes.is_best;
  }
  if ("traits" in changes) patch.traits = cleanTraits(changes.traits);
  if ("notes" in changes) patch.notes = cleanText(changes.notes, 2000, "Notes");
  if ("species_slug" in changes) patch.species_slug = requireSpecies(changes.species_slug, "species to move it to");
  for (const k of ["public_use", "show_credit", "credit_by_name"]) {
    if (k in changes && typeof changes[k] !== "boolean") fail(400, `${k} must be true or false.`);
    if (k in changes) patch[k] = changes[k];
  }
  if ("public_order" in changes) {
    const v = changes.public_order;
    if (v !== null && (!Number.isInteger(v) || v < 0 || v > 9999)) fail(400, "Order must be a whole number from 0 to 9999.");
    patch.public_order = v;
  }
  if ("display_credit" in changes) patch.display_credit = cleanText(changes.display_credit, 300, "Credit");
  for (const k of ["focal_x", "focal_y"]) {
    if (!(k in changes)) continue;
    const v = changes[k];
    if (typeof v !== "number" || !Number.isFinite(v) || v < 0 || v > 1) fail(400, "The focus point must be between 0 and 1.");
    patch[k] = Math.round(v * 1000) / 1000;
  }
  if ("is_hero" in changes) {
    if (typeof changes.is_hero !== "boolean") fail(400, "Hero must be true or false.");
    patch.is_hero = changes.is_hero;
  }
  // Shape and aspect are checked against the photo's size in checkAgainstCurrent.
  if ("hero_crop" in changes) patch.hero_crop = changes.hero_crop;
  return patch;
};

// Rules that depend on the photo as it is now. → extra patch fields.
const checkAgainstCurrent = (current, patch) => {
  const next = { ...current, ...patch };
  if (patch.show_credit === false && attributionRequired(next)) {
    fail(400, next.licence === "royalty_free"
      ? "This stock licence requires a credit, so it's always shown."
      : `${next.licence === "cc-by" ? "CC BY" : "CC BY-SA"} requires attribution, so the credit is always shown.`);
  }
  if ("credit_by_name" in patch && next.licence !== "tester_consent") fail(400, "Credit by name only applies to tester photos.");
  if (patch.species_slug && current.public_use) fail(409, "Take it off the species page before moving it.");
  if (patch.public_use === true && !current.public_use) {
    const reason = publicBlockReason(next);
    if (reason) fail(400, reason);
  }
  // Only a photo that is (or is being made) public and active can be the hero.
  if (patch.is_hero === true && !(next.public_use && next.status === "active")) {
    fail(400, "Only a photo on the species page can be the hero. Turn on “Use on species page” first.");
  }
  if ("hero_crop" in patch) {
    patch.hero_crop = validateHeroCrop(patch.hero_crop, imageSize(current));
    next.hero_crop = patch.hero_crop;
  }
  return next;
};

// PATCH { id, changes }. is_hero: true makes it the species' one hero; the
// previous hero is unticked by the reference_photos_hero_guard trigger in the
// same UPDATE, so the swap is atomic. Moving species also moves the file into the new
// species' folder; best is per species, so a moved photo loses it.
const updatePhoto = async ({ cfg, body }) => {
  const id = requireUuid(body.id, "photo id");
  const patch = validateChanges(body.changes);
  const current = await getPhoto(cfg, id);
  if (patch.traits) await assertKnownTraits(cfg, patch.traits, current.traits);
  const next = checkAgainstCurrent(current, patch);
  // Category images that use this photo, when the change could make it unfit.
  const catRows = ("status" in patch || "species_slug" in patch) ? await categories.rowsForPhoto(cfg, id) : [];

  // Hiding or rejecting a public photo takes it off the species page too.
  const unpublish = (patch.public_use === false && current.public_use) || (current.public_use && next.status !== "active");
  const publish = patch.public_use === true && !current.public_use;
  if (unpublish) {
    await unpublishPhoto(cfg, current);
    // Off the species page means not the hero either (the DB trigger agrees).
    Object.assign(patch, { public_use: false, public_path: null, public_width: null, public_height: null, is_hero: false });
  }
  let published = null;
  if (publish) {
    // An iNaturalist photo whose large size turns out too small is remembered,
    // so the library says so without fetching it again.
    const record = (fields) => rest(cfg, `reference_photos?id=eq.${id}`, { method: "PATCH", headers: { Prefer: "return=minimal" }, body: JSON.stringify(fields) }, "photo size record");
    published = await publishPhoto(cfg, next, { record });
    Object.assign(patch, { public_path: published.public_path, public_width: published.width, public_height: published.height }, published.found || {});
  }

  let moved = null;
  if (patch.species_slug) {
    if (current.species_slug === patch.species_slug) fail(400, "It's already filed under that species.");
    const file = current.storage_path.split("/").pop();
    const to = `${patch.species_slug}/${file}`;
    await storage.move(cfg, BUCKET, current.storage_path, to);
    moved = { from: current.storage_path, to };
    patch.storage_path = to;
    if (current.master_path) {
      const masterTo = `${patch.species_slug}/${current.master_path.split("/").pop()}`;
      try { await storage.move(cfg, BUCKET, current.master_path, masterTo); } catch (e) {
        await storage.move(cfg, BUCKET, to, current.storage_path).catch(() => console.error("admin: photo move rollback failed"));
        throw e;
      }
      moved.master = { from: current.master_path, to: masterTo };
      patch.master_path = masterTo;
    }
    if (!("is_best" in patch)) patch.is_best = false;
    patch.is_hero = false; // the hero is per species
  }

  let rows;
  try {
    rows = await rest(cfg, `reference_photos?id=eq.${id}&select=${COLUMNS}`, {
      method: "PATCH",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify(patch),
    }, "photo update");
  } catch (e) {
    if (moved) await storage.move(cfg, BUCKET, moved.to, moved.from).catch(() => console.error("admin: photo move rollback failed"));
    if (moved && moved.master) await storage.move(cfg, BUCKET, moved.master.to, moved.master.from).catch(() => console.error("admin: master move rollback failed"));
    if (published) await unpublishPhoto(cfg, { public_path: published.public_path }).catch(() => console.error("admin: public copy rollback failed"));
    throw e;
  }
  const row = Array.isArray(rows) && rows[0];
  if (!row) fail(404, "That photo doesn't exist any more.");
  // Hidden, rejected or moved out of its category: clear those category images.
  const categoriesCleared = catRows.length ? await categories.afterPhotoUpdate(cfg, catRows, row) : [];
  const [withUrl] = await withUrls(cfg, [row]);
  return { status: 200, body: { photo: withUrl, ...(published ? { publishedSize: published.size } : {}), ...(categoriesCleared.length ? { categoriesCleared } : {}) } };
};

// JPEG data URL or raw base64 → Buffer, within the bucket cap.
const decodeJpeg = (photo) => {
  if (typeof photo !== "string" || !photo) fail(400, "Choose a photo.");
  let data = photo;
  const m = /^data:([^;,]+);base64,/.exec(data);
  if (m) {
    if (m[1] !== "image/jpeg") fail(415, "Only JPEG photos can be saved.");
    data = data.slice(m[0].length);
  }
  if (data.length > Math.ceil(MAX_BYTES / 3) * 4 + 4) fail(413, "That photo is over the 2 MB limit.");
  if (data.length < 100 || !/^[A-Za-z0-9+/]+={0,2}$/.test(data)) fail(400, "The photo couldn't be read.");
  const buf = Buffer.from(data, "base64");
  if (buf.length > MAX_BYTES) fail(413, "That photo is over the 2 MB limit.");
  if (!isJpeg(buf)) fail(415, "Only JPEG photos can be saved.");
  return buf;
};

// The licence rules for an admin upload. Everything required is checked
// before any upload happens. → the row fields (without id/paths) + buffer.
const validateUpload = (body) => {
  if (!body || typeof body !== "object") fail(400, "Send the photo details.");
  const species_slug = requireSpecies(body.speciesSlug);
  if (!body.licence) fail(400, "Choose a licence.");
  if (!LICENCES.includes(body.licence)) fail(400, `Licence must be one of ${LICENCES.join(", ")}.`);
  const licence = body.licence;
  const isStock = licence === "royalty_free";
  if (body.creditRequired !== undefined && typeof body.creditRequired !== "boolean") fail(400, "Credit required must be true or false.");
  if (body.showCredit !== undefined && typeof body.showCredit !== "boolean") fail(400, "Show credit must be true or false.");
  const credit_required = isStock ? Boolean(body.creditRequired) : false;
  // Stock: the library and asset ID are the proof of licence; the photographer
  // is only needed when the licence requires a credit.
  const stock_library = isStock ? cleanText(body.stockLibrary, 100, "Stock library", { required: true }) : null;
  const stock_asset_id = isStock ? cleanText(body.stockAssetId, 200, "Stock asset ID", { required: true }) : null;
  const photographer = cleanText(body.photographer, 300, "Photographer", { required: !isStock || credit_required });
  const display_credit = cleanText(body.displayCredit, 300, "Credit");
  const show_credit = body.showCredit === undefined ? true : body.showCredit;
  if (!show_credit && attributionRequired({ licence, credit_required })) fail(400, "This licence requires a credit, so it's always shown.");
  const sourceUrl = cleanUrl(body.sourceUrl, "Source URL");
  const permissionNote = cleanText(body.permissionNote, 1000, "Permission note");
  if (!isStock && !sourceUrl && !permissionNote) fail(400, "Add the source URL or a note on the permission.");
  if (licence === "permission" && !permissionNote) fail(400, "Note who gave permission, and how.");
  const licence_url = cleanUrl(body.licenceUrl, "Licence URL") || LICENCE_URLS[licence] || null;
  const traits = cleanTraits(body.traits);
  const extra = cleanText(body.notes, 2000, "Notes");
  const notes = [permissionNote && `Permission: ${permissionNote}`, extra].filter(Boolean).join("\n\n") || null;
  if (notes && notes.length > 2000) fail(400, "Notes are too long (max 2000 characters with the permission note).");
  const buf = decodeJpeg(body.photo);
  const master = body.master === undefined || body.master === null || body.master === "" ? null : decodeJpeg(body.master);
  return { fields: { species_slug, photographer, licence, licence_url, sourceUrl, traits, notes, stock_library, stock_asset_id, credit_required, show_credit, display_credit }, buf, master };
};

// The library's copies of a photo, at the shared sizes (lib/imageResize.js):
// reference 500 px (q 0.80), master up to 1,600 px (q 0.85). The browser
// already makes both for admin uploads; anything over size (an older client,
// or a tester photo) is resized here. Never upscales.
// → { reference: { buf, width, height }, master: { buf, width, height } | null }
const libraryCopies = (photoBuf, masterBuf = null) => {
  const fit = (buf, spec) => {
    const { width, height } = jpegSize(buf);
    if (width && height && longEdge(width, height) <= spec.edge) return { buf, width, height };
    let decoded;
    try { decoded = decode(buf); } catch (e) { fail(400, "The photo couldn't be read."); }
    try { return toJpeg(null, spec, decoded, { maxBytes: MAX_BYTES }); } catch (e) { fail(413, "That photo is over the 2 MB limit."); }
    return null;
  };
  const source = masterBuf || photoBuf;
  const srcSize = jpegSize(source);
  const reference = fit(photoBuf, SPEC.reference);
  // A master is only worth keeping when it's bigger than the reference copy.
  const master = srcSize.width && longEdge(srcSize.width, srcSize.height) > longEdge(reference.width, reference.height) ? fit(source, SPEC.master) : null;
  return { reference, master };
};

// POST { speciesSlug, photo, photographer, licence, sourceUrl?, permissionNote?, licenceUrl?, traits?, notes?,
//        stockLibrary?, stockAssetId?, creditRequired?, showCredit?, displayCredit?, master? }
// photo is the 500 px reference copy; master the up-to-1,600 px copy (both JPEG data URLs).
const uploadPhoto = async ({ cfg, admin, body }, { uuid = crypto.randomUUID } = {}) => {
  const { fields, buf, master: masterIn } = validateUpload(body);
  await assertKnownTraits(cfg, fields.traits);
  const { reference, master } = libraryCopies(buf, masterIn);
  const id = uuid();
  const storage_path = `${fields.species_slug}/admin_upload-${id}.jpg`;
  const master_path = master ? `${fields.species_slug}/admin_upload-${id}.master.jpg` : null;
  const { width, height } = reference;
  const row = {
    species_slug: fields.species_slug,
    source: "admin_upload",
    source_id: id,
    source_url: fields.sourceUrl || (fields.stock_library ? `atr:stock/${id}` : `atr:admin-upload/${id}`),
    photographer: fields.photographer,
    licence: fields.licence,
    licence_url: fields.licence_url,
    storage_path, width, height,
    master_path,
    master_width: master ? master.width : null,
    master_height: master ? master.height : null,
    traits: fields.traits,
    notes: fields.notes,
    stock_library: fields.stock_library,
    stock_asset_id: fields.stock_asset_id,
    credit_required: fields.credit_required,
    show_credit: fields.show_credit,
    display_credit: fields.display_credit,
    added_by: admin.name,
    status: "active",
  };
  await storage.put(cfg, BUCKET, storage_path, reference.buf);
  let rows;
  try {
    if (master) await storage.put(cfg, BUCKET, master_path, master.buf);
    rows = await rest(cfg, `reference_photos?select=${COLUMNS}`, { method: "POST", headers: { Prefer: "return=representation" }, body: JSON.stringify(row) }, "photo insert");
  } catch (e) {
    await storage.remove(cfg, BUCKET, storage_path).catch(() => console.error("admin: orphan photo cleanup failed"));
    if (master) await storage.remove(cfg, BUCKET, master_path).catch(() => console.error("admin: orphan master cleanup failed"));
    throw e;
  }
  const [withUrl] = await withUrls(cfg, rows || [row]);
  return { status: 201, body: { photo: withUrl } };
};

// PUT { id, photo, master? }: a new image for the same record (Rowan cropped,
// rotated or corrected it). Same pipeline as an upload; credit, licence and
// source are kept. CC BY needs changes indicated, so the record is marked
// edited and the credit says so. A public photo gets its public copy remade
// (or comes off the species page if the new image is under the minimum).
// Old files are overwritten or removed: no orphans.
const replacePhoto = async ({ cfg, admin, body }) => {
  const id = requireUuid(body.id, "photo id");
  const buf = decodeJpeg(body.photo);
  const masterIn = body.master === undefined || body.master === null || body.master === "" ? null : decodeJpeg(body.master);
  const current = await getPhoto(cfg, id);
  const { reference, master } = libraryCopies(buf, masterIn);

  const dir = current.storage_path.split("/").slice(0, -1).join("/");
  const base = current.storage_path.split("/").pop().replace(/\.jpe?g$/i, "");
  const masterPath = master ? (current.master_path || `${dir}/${base}.master.jpg`) : null;
  const newMasterFile = Boolean(master && !current.master_path);

  const patch = {
    width: reference.width, height: reference.height,
    master_path: masterPath,
    master_width: master ? master.width : null,
    master_height: master ? master.height : null,
    edited: true,
    // A new image (rotated, cropped) makes the old hero crop meaningless.
    hero_crop: null,
    replaced_at: new Date().toISOString(),
    replaced_by: admin.name,
  };

  // New files first (same paths are overwritten), then the record, then
  // anything the record no longer points at.
  await storage.put(cfg, BUCKET, current.storage_path, reference.buf, { upsert: true });
  if (master) await storage.put(cfg, BUCKET, masterPath, master.buf, { upsert: true });

  let republished = null;
  let unpublished = null;
  let rows;
  try {
    if (current.public_use) {
      const next = { ...current, ...patch };
      try {
        republished = await publishPhoto(cfg, next);
        Object.assign(patch, { public_path: republished.public_path, public_width: republished.width, public_height: republished.height });
      } catch (e) {
        if (!(e instanceof AdminError)) throw e;
        // The new image can't be shown (e.g. too small): take it off the page.
        await unpublishPhoto(cfg, current);
        Object.assign(patch, { public_use: false, public_path: null, public_width: null, public_height: null, is_hero: false });
        unpublished = e.message;
      }
    }
    rows = await rest(cfg, `reference_photos?id=eq.${id}&select=${COLUMNS}`, { method: "PATCH", headers: { Prefer: "return=representation" }, body: JSON.stringify(patch) }, "photo replace");
  } catch (e) {
    if (newMasterFile) await storage.remove(cfg, BUCKET, masterPath).catch(() => console.error("admin: orphan master cleanup failed"));
    throw e;
  }
  if (current.master_path && !master) await storage.remove(cfg, BUCKET, current.master_path).catch(() => console.error("admin: old master cleanup failed"));
  const row = Array.isArray(rows) && rows[0];
  if (!row) fail(404, "That photo doesn't exist any more.");
  // Category images from this photo: remade from the new image (crops reset),
  // or cleared if it's no longer eligible.
  const catRows = await categories.rowsForPhoto(cfg, id);
  const cat = catRows.length ? await categories.afterPhotoReplace(cfg, catRows, row, admin) : { regenerated: [], cleared: [] };
  const [withUrl] = await withUrls(cfg, [row]);
  const warning = current.licence === "royalty_free" ? "Edits to stock photos must stay within the stock licence's terms." : null;
  return { status: 200, body: { photo: withUrl, ...(republished ? { republished: true } : {}), ...(unpublished ? { unpublished } : {}), ...(warning ? { warning } : {}),
    ...(cat.regenerated.length ? { categoriesRegenerated: cat.regenerated } : {}), ...(cat.cleared.length ? { categoriesCleared: cat.cleared } : {}) } };
};

// PATCH with a category → the category image; otherwise a photo change.
const patchRoute = (ctx) => (ctx.body && "category" in ctx.body ? categories.updateCategory(ctx) : updatePhoto(ctx));

module.exports = {
  patchRoute, removeCategory: categories.removeCategory,
  replacePhoto, downloadPhoto,
  listPhotos, updatePhoto, uploadPhoto, validateUpload, validateChanges, checkAgainstCurrent, decodeJpeg, withUrls, libraryCopies,
  listPhotoPage, PAGE_FILTERS, PAGE_DEFAULT, PAGE_MAX,
  BUCKET, MAX_BYTES, LICENCES, STATUSES, LICENCE_URLS, COLUMNS,
};
