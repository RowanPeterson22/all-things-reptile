// The app's 46 species (slug, name, latin, category) for the server: the AI ID
// function's exports and the category-image picker (lib/categoryImages.js).
// Read from the bundled content snapshot (src/data/speciesContent.json, D5),
// the same source as the app's src/data/species.js, so nothing is retyped.
// Slugs and categories never change in /admin; names here label admin picks.
// (The AI ID prompt itself lists all 1,363 natives from lib/speciesIndex.js.)
// Lives outside api/ so Vercel doesn't deploy it as a function.
const SNAPSHOT = require("../src/data/speciesContent.json");

module.exports = [...SNAPSHOT]
  .sort((a, b) => a.sortOrder - b.sortOrder)
  .map(d => ({ slug: d.slug, name: d.name, latin: d.latin, type: d.type }));
