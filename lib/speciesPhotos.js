// ─── Customer-facing species photos ──────────────────────────────
// Publishing: copy a library photo into the public species-photos bucket
// (iNaturalist photos at the larger ~1,024 px size when we can fetch it) and
// unpublishing: remove that copy. Called from PATCH /api/admin-photos.
//
// Reading: the public, read-only list behind GET /api/species-photos. It reads
// reference_photos with the secret key (the table stays closed to clients) and
// returns only public rows, with only the fields a page needs to show them.

const { fail, rest, storage, isJpeg, jpegSize } = require("./admin");
const { publicBlockReason, publicCredit } = require("./photoRules");
const { BY_SLUG, APP_TO_INDEX } = require("./adminSpecies");

const PUBLIC_BUCKET = "species-photos";
const LIBRARY_BUCKET = "reference-photos";
const PUBLIC_MAX_BYTES = 3 * 1024 * 1024; // the bucket's file_size_limit
const FETCH_TIMEOUT_MS = 6000;
// The public copy never changes under the same path (it's keyed by photo id),
// so browsers and the CDN can keep it for a day.
const PUBLIC_CACHE = "public, max-age=86400";

// Where iNaturalist keeps the larger size of a photo. CC-licensed photos are in
// the open-data bucket; static.inaturalist.org is the fallback host.
const inatLargeUrls = (photoId) => [
  `https://inaturalist-open-data.s3.amazonaws.com/photos/${photoId}/large.jpg`,
  `https://inaturalist-open-data.s3.amazonaws.com/photos/${photoId}/large.jpeg`,
  `https://static.inaturalist.org/photos/${photoId}/large.jpg`,
];

const fetchWithTimeout = async (url, ms) => {
  const ctrl = typeof AbortController === "function" ? new AbortController() : null;
  const timer = ctrl ? setTimeout(() => ctrl.abort(), ms) : null;
  try {
    return await globalThis.fetch(url, { method: "GET", signal: ctrl ? ctrl.signal : undefined, headers: { "User-Agent": "AllThingsReptile/1.0 (app.allthingsreptile.com.au)" } });
  } finally {
    if (timer) clearTimeout(timer);
  }
};

// The large iNaturalist image, or null if it can't be had (then the caller
// uses the stored medium copy). Never throws.
const fetchInatLarge = async (photo) => {
  if (photo.source !== "inaturalist" || !/^\d{1,15}$/.test(String(photo.source_id || ""))) return null;
  for (const url of inatLargeUrls(photo.source_id)) {
    try {
      const res = await fetchWithTimeout(url, FETCH_TIMEOUT_MS);
      if (!res || !res.ok) continue;
      const buf = Buffer.from(await res.arrayBuffer());
      if (isJpeg(buf) && buf.length <= PUBLIC_MAX_BYTES) return buf;
    } catch (e) {
      // network error or timeout: try the next URL
    }
  }
  console.error("species photos: large iNaturalist image unavailable, using the stored copy");
  return null;
};

const publicPathFor = (photo) => `${photo.species_slug}/${photo.id}.jpg`;

// → { public_path, size: "large" | "stored", width, height }. Throws AdminError on a rule.
const publishPhoto = async (cfg, photo) => {
  const reason = publicBlockReason(photo);
  if (reason) fail(400, reason);
  const sp = BY_SLUG[photo.species_slug];
  if (!sp || !sp.appSlug) fail(400, "This species has no page in the app, so its photos can't be shown there.");

  let buf = await fetchInatLarge(photo);
  let size = "large";
  if (!buf) {
    buf = await storage.get(cfg, LIBRARY_BUCKET, photo.storage_path);
    size = "stored";
  }
  if (!isJpeg(buf)) fail(415, "That photo isn't a JPEG.");
  if (buf.length > PUBLIC_MAX_BYTES) fail(413, "That photo is over the 3 MB limit for species pages.");
  const public_path = publicPathFor(photo);
  await storage.put(cfg, PUBLIC_BUCKET, public_path, buf, { upsert: true, cacheControl: PUBLIC_CACHE });
  return { public_path, size, ...jpegSize(buf) };
};

const unpublishPhoto = async (cfg, photo) => {
  if (photo.public_path) await storage.remove(cfg, PUBLIC_BUCKET, photo.public_path);
};

const encPath = (p) => String(p).split("/").map(encodeURIComponent).join("/");
const publicUrl = (cfg, path) => (path ? `${cfg.url}/storage/v1/object/public/${PUBLIC_BUCKET}/${encPath(path)}` : null);

// ─── Public read ──────────────────────────────────────────────────
// Only what's needed to show and credit the photo. No notes, storage paths,
// stock asset IDs, tester details or anything else internal.
const PUBLIC_COLUMNS = "id,species_slug,source,source_url,photographer,licence,licence_url,width,height,status,public_use,public_order,public_path,show_credit,credit_required,display_credit,credit_by_name,stock_library,created_at";

const isPublic = (r) => Boolean(r && r.public_use === true && r.status === "active" && r.public_path && !publicBlockReason(r));

const toPublic = (cfg, r) => {
  const sp = BY_SLUG[r.species_slug] || {};
  const credit = publicCredit(r);
  return {
    id: r.id,
    species: sp.appSlug || null,
    speciesName: sp.common || null,
    scientific: sp.scientific || null,
    url: publicUrl(cfg, r.public_path),
    width: r.width || null,
    height: r.height || null,
    alt: `${sp.common || "Reptile"}${credit.show && credit.name ? `, photo by ${credit.name}` : ""}`,
    credit,
  };
};

const byOrder = (a, b) => {
  const ao = a.public_order === null || a.public_order === undefined ? Infinity : a.public_order;
  const bo = b.public_order === null || b.public_order === undefined ? Infinity : b.public_order;
  return ao - bo || String(a.created_at || "").localeCompare(String(b.created_at || ""));
};

// appSlug: one app species (D4 slug), or undefined for every public photo
// (the credits page). Unknown species → [] (the caller decides 404).
const listPublicPhotos = async (cfg, appSlug) => {
  let filter = "";
  if (appSlug !== undefined) {
    const indexSlug = APP_TO_INDEX[appSlug];
    if (!indexSlug) return [];
    filter = `&species_slug=eq.${encodeURIComponent(indexSlug)}`;
  }
  const rows = await rest(cfg, `reference_photos?select=${PUBLIC_COLUMNS}&public_use=is.true&status=eq.active${filter}&order=species_slug.asc,public_order.asc.nullslast,created_at.asc&limit=2000`, { method: "GET" }, "public photos");
  // Belt and braces: re-check every rule here too, so a bad row never leaks.
  return (rows || []).filter(isPublic).filter(r => BY_SLUG[r.species_slug] && BY_SLUG[r.species_slug].appSlug)
    .sort((a, b) => String(a.species_slug).localeCompare(String(b.species_slug)) || byOrder(a, b))
    .map(r => toPublic(cfg, r));
};

module.exports = {
  publishPhoto, unpublishPhoto, fetchInatLarge, inatLargeUrls, listPublicPhotos, publicUrl, publicPathFor, isPublic,
  PUBLIC_BUCKET, PUBLIC_MAX_BYTES, PUBLIC_COLUMNS, PUBLIC_CACHE,
};
