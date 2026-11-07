// ─── GET /api/species-photos ──────────────────────────────────────
// Public and read-only. The photos Rowan chose for the species pages, with
// their credits. reference_photos stays closed to clients: this route reads it
// with the secret key and returns only public rows and display fields.
//   GET ?species=<app slug, D4>   one species page's gallery
//   GET                           every public photo (the /credits page)
// Cached at Vercel's edge for 5 minutes, so page views don't reach Supabase.

const { supabaseConfig, SupabaseError } = require("../lib/supabase");
const { listPublicPhotos } = require("../lib/speciesPhotos");
const { APP_TO_INDEX } = require("../lib/adminSpecies");

const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

module.exports = async (req, res) => {
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.setHeader("Allow", "GET");
    res.setHeader("Cache-Control", "no-store");
    return res.status(405).json({ error: "Use GET." });
  }
  const raw = req.query && req.query.species;
  const species = typeof raw === "string" && raw !== "" ? raw : undefined;
  if (species !== undefined && (species.length > 100 || !SLUG_RE.test(species) || !APP_TO_INDEX[species])) {
    res.setHeader("Cache-Control", "public, max-age=300, s-maxage=3600");
    return res.status(404).json({ error: "No such species.", photos: [] });
  }
  const cfg = supabaseConfig();
  if (!cfg) {
    res.setHeader("Cache-Control", "no-store");
    return res.status(503).json({ error: "Photos aren't set up yet.", photos: [] });
  }
  try {
    const photos = await listPublicPhotos(cfg, species);
    res.setHeader("Cache-Control", "public, max-age=60, s-maxage=300, stale-while-revalidate=600");
    return res.status(200).json({ photos });
  } catch (e) {
    res.setHeader("Cache-Control", "no-store");
    if (e instanceof SupabaseError) return res.status(502).json({ error: "Photos are unavailable right now.", photos: [] });
    console.error("species photos: unexpected error");
    return res.status(500).json({ error: "Something went wrong.", photos: [] });
  }
};
