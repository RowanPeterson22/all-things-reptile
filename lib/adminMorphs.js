// ─── Admin: morphs and their species ─────────────────────────────
// Served by api/admin-species (no new function: the project is near Vercel
// Hobby's cap). Every call has already passed adminRoute()'s is_admin check.
//
//   GET   ?only=morphs                     the catalogue
//   POST  { morph: { id?, name, cue, au_status?, notes? } }    add a morph
//   PATCH { id, changes: { name | cue | au_status | notes | deleted } }
//         deleted: true soft-deletes (deleted_at), false restores. The id never
//         changes: it's the trait id in feedback and photo tags.
//   PUT   { morphId, speciesSlug, assigned, cueOverride?, sort? }
//         assigned true adds or updates the species link, false removes it.
//
// Reads go straight to the database (admins see their edits at once); every
// write returns the whole catalogue and invalidates this instance's morph
// store. Other function instances pick the edit up within about a minute.
//
// Catalogue: [{ id, name, cue, au_status, notes, deleted_at, created_at,
// updated_at, species: [{ slug, cue_override, sort }] }], sorted by name.

const { fail, rest, cleanText, SLUG_RE } = require("./admin");
const { SupabaseError } = require("./supabase");
const { SLUGS } = require("./speciesIndex");
const { MORPH_COLUMNS, LINK_COLUMNS, invalidateMorphs } = require("./morphStore");
const { seedRows } = require("./morphs");

const AU_STATUSES = ["established", "check"];
const MAX_ID = 60;
const MAX_NAME = 80;
const MAX_CUE = 500;
const MAX_NOTES = 2000;

// "Pink / highland blotched" → "pink-highland-blotched"
const slugify = (v) => String(v || "")
  .normalize("NFD").replace(/[̀-ͯ]/g, "")
  .toLowerCase()
  .replace(/[’']/g, "")
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-+|-+$/g, "")
  .slice(0, MAX_ID)
  .replace(/-+$/g, "");

// One line, single spaces: names and cues go into the AI prompt.
const oneLine = (v, max, label, required) => {
  const t = cleanText(typeof v === "string" ? v.replace(/\s+/g, " ") : v, max, label, { required });
  return t;
};

const cleanAu = (v) => {
  if (v === undefined || v === null || v === "") return "check";
  if (!AU_STATUSES.includes(v)) fail(400, "Status must be established or check.");
  return v;
};

const requireMorphId = (v, label = "morph") => {
  if (typeof v !== "string" || !v || v.length > MAX_ID || !SLUG_RE.test(v)) fail(400, `Send a valid ${label} id.`);
  return v;
};

const requireSpecies = (v) => {
  if (typeof v !== "string" || !SLUGS.has(v)) fail(400, "Unknown species.");
  return v;
};

const enc = encodeURIComponent;

// ─── Catalogue ────────────────────────────────────────────────────
const toCatalogue = ({ morphs, links }) => {
  const bySpecies = {};
  for (const l of links) (bySpecies[l.morph_id] = bySpecies[l.morph_id] || []).push({ slug: l.species_slug, cue_override: l.cue_override || null, sort: Number(l.sort) || 0 });
  return morphs
    .map(m => ({
      id: m.id, name: m.name, cue: m.cue, au_status: m.au_status, notes: m.notes || null,
      deleted_at: m.deleted_at || null, created_at: m.created_at || null, updated_at: m.updated_at || null,
      species: (bySpecies[m.id] || []).sort((a, b) => a.slug.localeCompare(b.slug)),
    }))
    .sort((a, b) => a.name.localeCompare(b.name, "en") || a.id.localeCompare(b.id));
};

const readCatalogue = async (cfg) => {
  const [morphs, links] = await Promise.all([
    rest(cfg, `morphs?select=${MORPH_COLUMNS}&order=id`, { method: "GET" }, "morphs read"),
    rest(cfg, `species_morphs?select=${LINK_COLUMNS}&order=species_slug,sort,morph_id`, { method: "GET" }, "species morphs read"),
  ]);
  return toCatalogue({ morphs: morphs || [], links: links || [] });
};

// For GET /api/admin-species: the catalogue, or the seed (read-only) if the
// database can't be reached, so the photo screens still load.
const catalogueOrSeed = async (cfg) => {
  try {
    return { morphs: await readCatalogue(cfg), morphSource: "db" };
  } catch (e) {
    if (!(e instanceof SupabaseError)) throw e;
    return { morphs: toCatalogue(seedRows()), morphSource: "fallback" };
  }
};

const done = async (cfg, status = 200) => {
  invalidateMorphs();
  return { status, body: { morphs: await readCatalogue(cfg), morphSource: "db" } };
};

const findMorph = async (cfg, id) => {
  const rows = await rest(cfg, `morphs?select=id,deleted_at&id=eq.${enc(id)}&limit=1`, { method: "GET" }, "morph lookup");
  return (Array.isArray(rows) && rows[0]) || null;
};

// ─── Writes ───────────────────────────────────────────────────────
// POST { morph }
const createMorph = async ({ cfg, body }) => {
  const m = body.morph;
  if (!m || typeof m !== "object" || Array.isArray(m)) fail(400, "Send the morph.");
  const name = oneLine(m.name, MAX_NAME, "Name", true);
  const cue = oneLine(m.cue, MAX_CUE, "Visual cue", true);
  const id = requireMorphId(m.id === undefined || m.id === null || m.id === "" ? slugify(name) : m.id);
  const au_status = cleanAu(m.au_status);
  const notes = cleanText(m.notes, MAX_NOTES, "Notes");

  const existing = await findMorph(cfg, id);
  if (existing) fail(409, existing.deleted_at ? `“${id}” is already used by a deleted morph. Restore it instead.` : `A morph with the id “${id}” already exists.`);
  await rest(cfg, "morphs", {
    method: "POST",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify({ id, name, cue, au_status, notes }),
  }, "morph insert");
  return done(cfg, 201);
};

// PATCH { id, changes }
const updateMorph = async ({ cfg, body }) => {
  const id = requireMorphId(body.id);
  const changes = body.changes;
  if (!changes || typeof changes !== "object" || Array.isArray(changes)) fail(400, "Send the changes.");
  const allowed = ["name", "cue", "au_status", "notes", "deleted"];
  const keys = Object.keys(changes);
  if (!keys.length) fail(400, "Nothing to change.");
  for (const k of keys) if (!allowed.includes(k)) fail(400, k === "id" ? "A morph's id can't be changed." : `Can't change ${k}.`);

  const patch = {};
  if ("name" in changes) patch.name = oneLine(changes.name, MAX_NAME, "Name", true);
  if ("cue" in changes) patch.cue = oneLine(changes.cue, MAX_CUE, "Visual cue", true);
  if ("au_status" in changes) patch.au_status = cleanAu(changes.au_status);
  if ("notes" in changes) patch.notes = cleanText(changes.notes, MAX_NOTES, "Notes");
  if ("deleted" in changes) {
    if (typeof changes.deleted !== "boolean") fail(400, "deleted must be true or false.");
    patch.deleted_at = changes.deleted ? new Date().toISOString() : null;
  }
  const rows = await rest(cfg, `morphs?id=eq.${enc(id)}&select=id`, {
    method: "PATCH",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify(patch),
  }, "morph update");
  if (!Array.isArray(rows) || !rows.length) fail(404, "That morph doesn't exist.");
  return done(cfg);
};

// PUT { morphId, speciesSlug, assigned, cueOverride?, sort? }
const setAssignment = async ({ cfg, body }) => {
  const morphId = requireMorphId(body.morphId);
  const speciesSlug = requireSpecies(body.speciesSlug);
  if (typeof body.assigned !== "boolean") fail(400, "assigned must be true or false.");

  if (!body.assigned) {
    await rest(cfg, `species_morphs?species_slug=eq.${enc(speciesSlug)}&morph_id=eq.${enc(morphId)}`, { method: "DELETE" }, "species morph delete");
    return done(cfg);
  }

  const morph = await findMorph(cfg, morphId);
  if (!morph) fail(404, "That morph doesn't exist.");
  if (morph.deleted_at) fail(400, "That morph is deleted. Restore it before assigning it.");
  const cue_override = oneLine(body.cueOverride, MAX_CUE, "Species cue", false);
  let sort = body.sort;
  if (sort === undefined || sort === null) {
    // New links go to the end of the species' list; an existing link keeps its place.
    const rows = await rest(cfg, `species_morphs?select=morph_id,sort&species_slug=eq.${enc(speciesSlug)}`, { method: "GET" }, "species morph sort");
    const list = Array.isArray(rows) ? rows : [];
    const mine = list.find(r => r.morph_id === morphId);
    sort = mine ? Number(mine.sort) || 0 : list.reduce((mx, r) => Math.max(mx, Number(r.sort) || 0), 0) + 10;
  } else if (!Number.isInteger(sort) || sort < 0 || sort > 100000) fail(400, "Sort must be a whole number.");

  await rest(cfg, "species_morphs?on_conflict=species_slug,morph_id", {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
    body: JSON.stringify({ species_slug: speciesSlug, morph_id: morphId, cue_override, sort }),
  }, "species morph upsert");
  return done(cfg);
};

// Photo trait tags (lib/adminPhotos.js): every new id must be a morph in the
// database that isn't deleted, read straight from it so a morph added a moment
// ago counts. Ids in keep (the photo's current tags) pass as they are, so a
// photo keeps a tag whose morph was deleted later.
const assertKnownTraits = async (cfg, traits, keep = []) => {
  const kept = new Set(keep || []);
  const check = (traits || []).filter(t => !kept.has(t));
  if (!check.length) return;
  const rows = await rest(cfg, `morphs?select=id,deleted_at&id=in.(${check.map(enc).join(",")})`, { method: "GET" }, "trait check");
  const active = new Set((rows || []).filter(r => !r.deleted_at).map(r => r.id));
  const missing = check.filter(t => !active.has(t));
  if (missing.length) fail(400, `Unknown or deleted trait: ${missing.join(", ")}. Check it in Admin → Morphs.`);
};

module.exports = {
  readCatalogue, catalogueOrSeed, toCatalogue, createMorph, updateMorph, setAssignment, assertKnownTraits,
  slugify, AU_STATUSES, MAX_NAME, MAX_CUE, MAX_NOTES,
};
