#!/usr/bin/env node
// ─── Reference photo library: counts per species and group, plus gaps ──
// Usage:
//   SUPABASE_URL=… SUPABASE_SECRET_KEY=… node scripts/photo-stats.mjs
//   node scripts/photo-stats.mjs --min 10        gap threshold (default 5 active photos)
//   node scripts/photo-stats.mjs --json          full stats as JSON
// Counts only status=active photos per species; totals show every status.

import { readFile } from "node:fs/promises";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, join } from "node:path";
import { strictConfig, loadAllRows, photoStats, FEW } from "./lib/photoImport.mjs";

const here = dirname(fileURLToPath(import.meta.url));

const list = (label, items, max = 80) =>
  `${label}: ${items.length}${items.length ? `\n  ${items.slice(0, max).join(", ")}${items.length > max ? ` … (+${items.length - max})` : ""}` : ""}`;

const main = async (argv) => {
  const i = argv.indexOf("--min");
  const min = i >= 0 ? Number(argv[i + 1]) : FEW;
  if (!Number.isInteger(min) || min < 1) throw new Error("--min needs a whole number ≥ 1");
  const cfg = strictConfig();
  const species = JSON.parse(await readFile(join(here, "..", "src", "data", "australianSpecies.json"), "utf8"));
  const s = photoStats(await loadAllRows(cfg), species, { min });
  if (argv.includes("--json")) { console.log(JSON.stringify(s, null, 2)); return; }

  console.log(`Reference photos: ${s.total} rows ${JSON.stringify(s.byStatus)} · sources ${JSON.stringify(s.bySource)} · ${s.best} marked best\n`);
  console.log("Group             Species  With photos  Photos  Under " + min);
  for (const [g, v] of Object.entries(s.groups).sort()) {
    console.log(`${g.padEnd(17)} ${String(v.species).padStart(7)}  ${String(v.withPhotos).padStart(11)}  ${String(v.photos).padStart(6)}  ${String(v.gaps).padStart(7)}`);
  }
  console.log("");
  console.log(list(`App species under ${min}`, s.appGaps));
  console.log(list("Species with no photos", s.zero));
  console.log(list(`Species with 1–${min - 1}`, s.few));
  if (s.orphanSlugs.length) console.log(list("Rows whose slug isn't in australianSpecies.json", s.orphanSlugs));
};

if (import.meta.url === pathToFileURL(process.argv[1] || "").href) {
  main(process.argv.slice(2)).catch((e) => { console.error(e.message); process.exitCode = 1; });
}
