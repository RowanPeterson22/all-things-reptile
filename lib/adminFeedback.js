// ─── Admin: AI ID feedback inbox ─────────────────────────────────
// Lists id_feedback newest first with the tester, the AI's top pick, the
// correction and the consented photo (signed URL from the private id-photos
// bucket), and files a consented photo into the reference library.

const { fail, rest, storage, requireUuid, isJpeg, SLUG_RE } = require("./admin");
const { SLUGS, indexSlugForApp } = require("./adminSpecies");
const { BUCKET: LIBRARY_BUCKET, COLUMNS, withUrls, libraryCopies } = require("./adminPhotos");
const { BUCKET: ID_BUCKET } = require("./supabase");

const PAGE = 50;
const FEEDBACK_COLUMNS = "id,created_at,model,verdict,ai_top_species_slug,ai_traits,ai_raw,correct_species_slug,correct_species_other,correct_traits,notes,photo_path,photo_consent,tester:beta_testers(id,name,group)";

// The suggestions the tester saw, trimmed to what the inbox shows.
const summariseAi = (raw) => {
  const list = raw && Array.isArray(raw.suggestions) ? raw.suggestions : [];
  return list.slice(0, 3).filter(s => s && typeof s === "object").map(s => ({
    slug: typeof s.slug === "string" ? s.slug : null,
    name: typeof s.name === "string" ? s.name : null,
    latin: typeof s.latin === "string" ? s.latin : null,
    confidence: typeof s.confidence === "string" ? s.confidence : null,
  }));
};

const hasConsentedPhoto = (row) => Boolean(row && row.photo_consent === true && row.photo_path);

// GET [?offset=N]
const listFeedback = async ({ cfg, query }) => {
  const offset = Math.max(0, Math.min(100000, parseInt(query.offset, 10) || 0));
  const rows = (await rest(cfg, `id_feedback?select=${FEEDBACK_COLUMNS}&order=created_at.desc&limit=${PAGE}&offset=${offset}`, { method: "GET" }, "feedback list")) || [];

  const ids = rows.map(r => r.id);
  const filed = {};
  if (ids.length) {
    const lib = await rest(cfg, `reference_photos?select=source_id,species_slug,status&source=eq.tester&source_id=in.(${ids.join(",")})`, { method: "GET" }, "feedback filed");
    for (const p of lib || []) filed[p.source_id] = { speciesSlug: p.species_slug, status: p.status };
  }
  const urls = await storage.sign(cfg, ID_BUCKET, rows.filter(hasConsentedPhoto).map(r => r.photo_path));

  const items = rows.map(r => ({
    id: r.id,
    createdAt: r.created_at,
    model: r.model,
    tester: r.tester ? { id: r.tester.id, name: r.tester.name, group: r.tester.group } : null,
    verdict: r.verdict,
    aiTopSlug: r.ai_top_species_slug,
    aiTraits: Array.isArray(r.ai_traits) ? r.ai_traits : [],
    aiSuggestions: summariseAi(r.ai_raw),
    correctSlug: r.correct_species_slug,
    correctOther: r.correct_species_other,
    correctIndexSlug: indexSlugForApp(r.correct_species_slug),
    correctTraits: r.correct_traits || [],
    notes: r.notes,
    photoConsent: r.photo_consent === true,
    photoUrl: hasConsentedPhoto(r) ? urls[r.photo_path] || null : null,
    canAddToLibrary: hasConsentedPhoto(r),
    inLibrary: filed[r.id] || null,
  }));
  return { status: 200, body: { items, nextOffset: rows.length === PAGE ? offset + PAGE : null } };
};

// POST { feedbackId, speciesSlug? }. Files the consented photo under the
// corrected species (or speciesSlug, an index slug, when given).
const addToLibrary = async ({ cfg, admin, body }) => {
  const id = requireUuid(body.feedbackId, "feedback id");
  const rows = await rest(cfg, `id_feedback?select=${FEEDBACK_COLUMNS}&id=eq.${id}&limit=1`, { method: "GET" }, "feedback get");
  const fb = Array.isArray(rows) && rows[0];
  if (!fb) fail(404, "That feedback doesn't exist.");
  if (!hasConsentedPhoto(fb)) fail(409, "Only feedback with a consented photo can go in the library.");

  let slug = null;
  if (body.speciesSlug !== undefined && body.speciesSlug !== null && body.speciesSlug !== "") {
    if (typeof body.speciesSlug !== "string" || !SLUGS.has(body.speciesSlug)) fail(400, "Choose a species from the index.");
    slug = body.speciesSlug;
  } else {
    slug = indexSlugForApp(fb.correct_species_slug);
  }
  if (!slug) fail(400, "This feedback has no corrected species in the index. Choose the species to file it under.");

  const existing = await rest(cfg, `reference_photos?select=id&source=eq.tester&source_id=eq.${id}&limit=1`, { method: "GET" }, "feedback filed check");
  if (Array.isArray(existing) && existing.length) fail(409, "That photo is already in the library.");

  const buf = await storage.get(cfg, ID_BUCKET, fb.photo_path);
  if (!isJpeg(buf)) fail(415, "The tester's photo isn't a JPEG.");
  // Same sizes as every other library photo, resized here in pure JS:
  // a 500 px reference copy and a master up to 1,600 px, EXIF stripped.
  const { reference, master } = libraryCopies(buf);
  const { width, height } = reference;

  const storage_path = `${slug}/tester-${id}.jpg`;
  const master_path = master ? `${slug}/tester-${id}.master.jpg` : null;
  const testerName = (fb.tester && fb.tester.name) || "ATR beta tester";
  const row = {
    species_slug: slug,
    source: "tester",
    source_id: id,
    source_url: `atr:id_feedback/${id}`,
    photographer: testerName,
    licence: "tester_consent",
    licence_url: null,
    storage_path, width, height,
    master_path,
    master_width: master ? master.width : null,
    master_height: master ? master.height : null,
    traits: (fb.correct_traits || []).filter(t => typeof t === "string" && SLUG_RE.test(t)).slice(0, 30),
    notes: `From AI ID beta feedback (${fb.verdict}), ${String(fb.created_at || "").slice(0, 10)}. The tester consented to saving this photo.`,
    added_by: admin.name,
    status: "active",
  };
  // The path is fixed per feedback row and we checked no row uses it, so a
  // leftover file from a failed earlier attempt can be overwritten.
  await storage.put(cfg, LIBRARY_BUCKET, storage_path, reference.buf, { upsert: true });
  if (master) await storage.put(cfg, LIBRARY_BUCKET, master_path, master.buf, { upsert: true });
  let inserted;
  try {
    inserted = await rest(cfg, `reference_photos?select=${COLUMNS}`, { method: "POST", headers: { Prefer: "return=representation" }, body: JSON.stringify(row) }, "feedback file");
  } catch (e) {
    if (e.status === 409) fail(409, "That photo is already in the library.");
    await storage.remove(cfg, LIBRARY_BUCKET, storage_path).catch(() => console.error("admin: orphan photo cleanup failed"));
    if (master) await storage.remove(cfg, LIBRARY_BUCKET, master_path).catch(() => console.error("admin: orphan master cleanup failed"));
    throw e;
  }
  const [photo] = await withUrls(cfg, inserted || [row]);
  return { status: 201, body: { photo } };
};

module.exports = { listFeedback, addToLibrary, summariseAi, hasConsentedPhoto };
