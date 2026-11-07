// ─── Admin: reference photo library ──────────────────────────────
// List a species' reference_photos with short-lived signed URLs, change a
// photo (status, best, traits, notes, species, credit settings, use on the
// species page), and upload a new one (including royalty-free stock).
// Bucket: private reference-photos (JPEG only, 2 MB cap). Files live at
// <species_slug>/<source>-<source_id>.jpg; storage_path is the part after the bucket.

const crypto = require("crypto");
const { fail, rest, storage, cleanText, cleanUrl, cleanTraits, requireUuid, jpegSize, isJpeg } = require("./admin");
const { SLUGS, BY_SLUG } = require("./adminSpecies");
const { LICENCES, attributionRequired, publicBlockReason, publicCredit } = require("./photoRules");
const { publishPhoto, unpublishPhoto, publicUrl } = require("./speciesPhotos");

const BUCKET = "reference-photos";
const MAX_BYTES = 2 * 1024 * 1024; // the bucket's file_size_limit
const STATUSES = ["active", "hidden", "rejected"];
const LICENCE_URLS = {
  "cc0": "https://creativecommons.org/publicdomain/zero/1.0/",
  "cc-by": "https://creativecommons.org/licenses/by/4.0/",
  "cc-by-sa": "https://creativecommons.org/licenses/by-sa/4.0/",
};
const COLUMNS = "id,species_slug,source,source_id,source_url,photographer,licence,licence_url,storage_path,width,height,observed_on,state,quality,traits,is_best,status,notes,added_by,created_at,stock_library,stock_asset_id,credit_required,show_credit,display_credit,credit_by_name,public_use,public_order,public_path";

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
      publicUrl: r.public_use ? publicUrl(cfg, r.public_path) : null,
    };
  });
};

// GET ?species=<slug>[&all=1]. Default: active only; all=1 adds hidden and rejected.
const listPhotos = async ({ cfg, query }) => {
  const slug = requireSpecies(query.species);
  const all = query.all === "1" || query.all === "true";
  const filter = all ? "" : "&status=eq.active";
  const rows = await rest(cfg, `reference_photos?select=${COLUMNS}&species_slug=eq.${slug}${filter}&order=is_best.desc,created_at.desc&limit=500`, { method: "GET" }, "photo list");
  return { status: 200, body: { photos: await withUrls(cfg, rows || []) } };
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
  const allowed = ["status", "is_best", "traits", "notes", "species_slug", "public_use", "public_order", "show_credit", "display_credit", "credit_by_name"];
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
  return next;
};

// PATCH { id, changes }. Moving species also moves the file into the new
// species' folder; best is per species, so a moved photo loses it.
const updatePhoto = async ({ cfg, body }) => {
  const id = requireUuid(body.id, "photo id");
  const patch = validateChanges(body.changes);
  const current = await getPhoto(cfg, id);
  const next = checkAgainstCurrent(current, patch);

  // Hiding or rejecting a public photo takes it off the species page too.
  const unpublish = (patch.public_use === false && current.public_use) || (current.public_use && next.status !== "active");
  const publish = patch.public_use === true && !current.public_use;
  if (unpublish) {
    await unpublishPhoto(cfg, current);
    patch.public_use = false;
    patch.public_path = null;
  }
  let published = null;
  if (publish) {
    published = await publishPhoto(cfg, next);
    patch.public_path = published.public_path;
  }

  let moved = null;
  if (patch.species_slug) {
    if (current.species_slug === patch.species_slug) fail(400, "It's already filed under that species.");
    const file = current.storage_path.split("/").pop();
    const to = `${patch.species_slug}/${file}`;
    await storage.move(cfg, BUCKET, current.storage_path, to);
    moved = { from: current.storage_path, to };
    patch.storage_path = to;
    if (!("is_best" in patch)) patch.is_best = false;
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
    if (published) await unpublishPhoto(cfg, { public_path: published.public_path }).catch(() => console.error("admin: public copy rollback failed"));
    throw e;
  }
  const row = Array.isArray(rows) && rows[0];
  if (!row) fail(404, "That photo doesn't exist any more.");
  const [withUrl] = await withUrls(cfg, [row]);
  return { status: 200, body: { photo: withUrl, ...(published ? { publishedSize: published.size } : {}) } };
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
  return { fields: { species_slug, photographer, licence, licence_url, sourceUrl, traits, notes, stock_library, stock_asset_id, credit_required, show_credit, display_credit }, buf };
};

// POST { speciesSlug, photo, photographer, licence, sourceUrl?, permissionNote?, licenceUrl?, traits?, notes?,
//        stockLibrary?, stockAssetId?, creditRequired?, showCredit?, displayCredit? }
const uploadPhoto = async ({ cfg, admin, body }, { uuid = crypto.randomUUID } = {}) => {
  const { fields, buf } = validateUpload(body);
  const id = uuid();
  const storage_path = `${fields.species_slug}/admin_upload-${id}.jpg`;
  const { width, height } = jpegSize(buf);
  const row = {
    species_slug: fields.species_slug,
    source: "admin_upload",
    source_id: id,
    source_url: fields.sourceUrl || (fields.stock_library ? `atr:stock/${id}` : `atr:admin-upload/${id}`),
    photographer: fields.photographer,
    licence: fields.licence,
    licence_url: fields.licence_url,
    storage_path, width, height,
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
  await storage.put(cfg, BUCKET, storage_path, buf);
  let rows;
  try {
    rows = await rest(cfg, `reference_photos?select=${COLUMNS}`, { method: "POST", headers: { Prefer: "return=representation" }, body: JSON.stringify(row) }, "photo insert");
  } catch (e) {
    await storage.remove(cfg, BUCKET, storage_path).catch(() => console.error("admin: orphan photo cleanup failed"));
    throw e;
  }
  const [withUrl] = await withUrls(cfg, rows || [row]);
  return { status: 201, body: { photo: withUrl } };
};

module.exports = {
  listPhotos, updatePhoto, uploadPhoto, validateUpload, validateChanges, checkAgainstCurrent, decodeJpeg, withUrls,
  BUCKET, MAX_BYTES, LICENCES, STATUSES, LICENCE_URLS, COLUMNS,
};
