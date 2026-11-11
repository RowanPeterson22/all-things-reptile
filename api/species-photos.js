// ─── GET /api/species-photos ──────────────────────────────────────
// Public and read-only. The photos Rowan chose for the species pages, with
// their credits. reference_photos stays closed to clients: this route reads it
// with the secret key and returns only public rows and display fields.
//   GET ?species=<app slug, D4>   one species page's gallery
//   GET                           every public photo (the /credits page)
//   GET ?categories=1             the Browse category images (cards and
//                                 category headers), with their credits
//   GET ?content=<app slug>       the species page's published content
//                                 document (D5), { species: doc }. Before
//                                 launch only for a valid atr_gate cookie or
//                                 tester code (x-atr-beta), else 401: /api/*
//                                 bypasses the pre-launch gate. Private cache
//                                 while gated; edge-cached once public.
// Photos are cached at Vercel's edge for 5 minutes, so page views don't reach Supabase.

const { supabaseConfig, SupabaseError } = require("../lib/supabase");
const { listPublicPhotos } = require("../lib/speciesPhotos");
const { listPublicCategoryImages } = require("../lib/categoryImages");
const { APP_TO_INDEX } = require("../lib/adminSpecies");
const { contentAccess, getPublished, ContentError } = require("../lib/speciesContent");

const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

// GET ?content=<slug>
const content = async (req, res) => {
  const slug = typeof req.query.content === "string" ? req.query.content : "";
  const access = await contentAccess(req);
  if (!access.ok) {
    res.setHeader("Cache-Control", "no-store");
    return res.status(access.status).json({ error: access.error || "Not available." });
  }
  // Gated: per-visitor, never in a shared cache. Public: the same for everyone.
  const cache = access.via === "public" ? "public, max-age=60, s-maxage=300, stale-while-revalidate=600" : "private, max-age=60";
  if (slug.length > 100 || !SLUG_RE.test(slug)) {
    res.setHeader("Cache-Control", cache);
    return res.status(404).json({ error: "No such species." });
  }
  const cfg = supabaseConfig();
  if (!cfg) {
    res.setHeader("Cache-Control", "no-store");
    return res.status(503).json({ error: "Species content isn't set up yet." });
  }
  try {
    const doc = await getPublished(cfg, slug);
    res.setHeader("Cache-Control", cache);
    if (!doc) return res.status(404).json({ error: "No such species." });
    return res.status(200).json({ species: doc });
  } catch (e) {
    res.setHeader("Cache-Control", "no-store");
    if (e instanceof ContentError) return res.status(e.status).json({ error: e.message });
    console.error("species content: unexpected error");
    return res.status(500).json({ error: "Something went wrong." });
  }
};

module.exports = async (req, res) => {
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.setHeader("Allow", "GET");
    res.setHeader("Cache-Control", "no-store");
    return res.status(405).json({ error: "Use GET." });
  }
  if (req.query && req.query.content !== undefined) return content(req, res);
  const raw = req.query && req.query.species;
  const species = typeof raw === "string" && raw !== "" ? raw : undefined;
  if (species !== undefined && (species.length > 100 || !SLUG_RE.test(species) || !APP_TO_INDEX[species])) {
    res.setHeader("Cache-Control", "public, max-age=300, s-maxage=3600");
    return res.status(404).json({ error: "No such species.", photos: [] });
  }
  const cfg = supabaseConfig();
  if (!cfg) {
    res.setHeader("Cache-Control", "no-store");
    return res.status(503).json({ error: "Photos aren't set up yet.", photos: [], categories: [] });
  }
  const wantCategories = req.query && (req.query.categories === "1" || req.query.categories === "true");
  try {
    if (wantCategories && species === undefined) {
      const categories = await listPublicCategoryImages(cfg);
      res.setHeader("Cache-Control", "public, max-age=60, s-maxage=300, stale-while-revalidate=600");
      return res.status(200).json({ categories });
    }
    const photos = await listPublicPhotos(cfg, species);
    res.setHeader("Cache-Control", "public, max-age=60, s-maxage=300, stale-while-revalidate=600");
    return res.status(200).json({ photos });
  } catch (e) {
    res.setHeader("Cache-Control", "no-store");
    if (e instanceof SupabaseError) return res.status(502).json({ error: "Photos are unavailable right now.", photos: [], categories: [] });
    console.error("species photos: unexpected error");
    return res.status(500).json({ error: "Something went wrong.", photos: [], categories: [] });
  }
};
