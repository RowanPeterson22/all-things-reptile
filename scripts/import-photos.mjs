#!/usr/bin/env node
// ─── Import CC-licensed reference photos into the private library ──
// Usage (atr project only; see scripts/README-photos.md):
//   SUPABASE_URL=… SUPABASE_SECRET_KEY=… node scripts/import-photos.mjs --app-only --dry-run
//   node scripts/import-photos.mjs --app-only
//   node scripts/import-photos.mjs --resume
// Options:
//   --per-species N   photos per species in total (default 30)
//   --species a,b     only these slugs        --group frog[,gecko]   only these groups
//   --app-only        only species with an appSlug (the app's 46)
//   --dry-run         fetch metadata and write the report; no downloads or uploads
//   --resume          top up species that already have rows (skips any at N)
//   --limit N         stop after N species (to split a long run)
//   --max-requests N  iNaturalist API requests allowed today (default 9000, max 9500)
//   --refresh-taxa    re-resolve taxa even if cached
//   --source ala      not implemented yet (licence filtering unconfirmed)
//
// Writes scripts/cache/inat-taxa.json (commit it) and scripts/out/import-report.json (gitignored).

import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, join } from "node:path";
import { parseArgs, run } from "./lib/photoImport.mjs";

const here = dirname(fileURLToPath(import.meta.url));
export const PATHS = {
  speciesPath: join(here, "..", "src", "data", "australianSpecies.json"),
  cachePath: join(here, "cache", "inat-taxa.json"),
  reportPath: join(here, "out", "import-report.json"),
  budgetPath: join(here, "out", "inat-budget.json"),
};

const main = async (argv) => {
  const opts = parseArgs(argv);
  if (opts.help) {
    console.log("See the header of scripts/import-photos.mjs or scripts/README-photos.md.");
    return;
  }
  await run(opts, PATHS);
  console.log(`Report: ${PATHS.reportPath}`);
};

if (import.meta.url === pathToFileURL(process.argv[1] || "").href) {
  main(process.argv.slice(2)).catch((e) => { console.error(e.message); process.exitCode = 1; });
}
