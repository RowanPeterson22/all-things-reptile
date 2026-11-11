// ─── Species list (the 46) ────────────────────────────────────────
// Derived from the bundled species content snapshot (speciesContent.json, D5),
// so names, latin, category, level, emoji and order are written once, in the
// species documents mastered in Supabase and edited in /admin → Species. This
// is the build-time list (routes, legacy redirects, category counts); screens
// that show names use useSpeciesList() (./speciesContent), which swaps in the
// published values. `page` is the legacy page key (= id), kept for old links.
// Invariants (46 species, 15/9/6/6/4/6 by category, unique hyphenated slugs)
// are tested in src/__tests__/speciesList.test.js.
import { BUNDLED_SPECIES } from "./speciesContent";

export const SPECIES = BUNDLED_SPECIES;
