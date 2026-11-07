#!/usr/bin/env node
// ─── Export AI ID beta feedback ───────────────────────────────────
// Usage:
//   SUPABASE_URL=… SUPABASE_SECRET_KEY=… node scripts/feedback-report.mjs            → markdown summary
//   node scripts/feedback-report.mjs --csv > feedback.csv                           → every row as CSV
//   node scripts/feedback-report.mjs --since 2027-01-01                             → either, from a date
//
// Summary: verdict counts, accuracy by AI top species, the most common
// corrections (AI said X → tester said Y) and trait corrections.

import { pathToFileURL } from "node:url";
import { config, rest } from "./lib/supabaseAdmin.mjs";

const COLUMNS = [
  "created_at", "tester_name", "tester_group", "model", "verdict",
  "ai_top_species_slug", "ai_traits", "correct_species_slug", "correct_species_other",
  "correct_traits", "notes", "photo_consent", "photo_path", "id",
];

export const csvCell = (v) => {
  if (v === null || v === undefined) return "";
  const s = Array.isArray(v) ? v.join("; ") : typeof v === "object" ? JSON.stringify(v) : String(v);
  // Quote everything that needs it; neutralise spreadsheet formulas.
  const safe = /^[=+\-@\t\r]/.test(s) ? `'${s}` : s;
  return /[",\n\r]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
};

export const flatten = (r) => ({
  ...r,
  tester_name: r.beta_testers ? r.beta_testers.name : "",
  tester_group: r.beta_testers ? r.beta_testers.group : "",
  ai_traits: Array.isArray(r.ai_traits) ? r.ai_traits.map(t => `${t.id}${t.confidence === "possible" ? "?" : ""}`) : [],
});

export const toCsv = (rows) =>
  [COLUMNS.join(","), ...rows.map(flatten).map(r => COLUMNS.map(c => csvCell(r[c])).join(","))].join("\n") + "\n";

const pct = (n, d) => (d ? `${Math.round((100 * n) / d)}%` : "–");
const answer = (r) => r.correct_species_slug === "not-one-of-our-species" && r.correct_species_other
  ? `other: ${r.correct_species_other}` : (r.correct_species_slug || "unknown");

export const summarise = (rows) => {
  const total = rows.length;
  const verdicts = { correct: 0, partly: 0, wrong: 0 };
  const bySpecies = {};
  const corrections = {};
  const traitFixes = {};
  let photos = 0;

  for (const r of rows) {
    verdicts[r.verdict] = (verdicts[r.verdict] || 0) + 1;
    if (r.photo_path) photos++;
    const ai = r.ai_top_species_slug || "(no suggestion)";
    const s = (bySpecies[ai] = bySpecies[ai] || { correct: 0, partly: 0, wrong: 0, total: 0 });
    s[r.verdict]++; s.total++;
    if (r.verdict === "wrong" || (r.verdict === "partly" && r.correct_species_slug && r.correct_species_slug !== r.ai_top_species_slug)) {
      const k = `${ai} → ${answer(r)}`;
      corrections[k] = (corrections[k] || 0) + 1;
    }
    const aiT = new Set((Array.isArray(r.ai_traits) ? r.ai_traits : []).map(t => t.id));
    const realT = new Set(r.correct_traits || []);
    if (r.verdict !== "correct" || aiT.size || realT.size) {
      for (const t of realT) if (!aiT.has(t)) traitFixes[`missed ${t}`] = (traitFixes[`missed ${t}`] || 0) + 1;
      for (const t of aiT) if (!realT.has(t)) traitFixes[`wrongly said ${t}`] = (traitFixes[`wrongly said ${t}`] || 0) + 1;
    }
  }

  const top = (obj, n = 15) => Object.entries(obj).sort((a, b) => b[1] - a[1]).slice(0, n);
  const lines = [
    "# AI ID beta feedback",
    "",
    `${total} response(s) · ${photos} with a consented photo`,
    "",
    "| Verdict | Count | Share |", "|---|---:|---:|",
    ...["correct", "partly", "wrong"].map(v => `| ${v} | ${verdicts[v] || 0} | ${pct(verdicts[v] || 0, total)} |`),
    "",
    "## By AI top suggestion",
    "",
    "| AI said | Responses | Correct | Partly | Wrong | Accuracy |", "|---|---:|---:|---:|---:|---:|",
    ...Object.entries(bySpecies).sort((a, b) => b[1].total - a[1].total)
      .map(([k, s]) => `| ${k} | ${s.total} | ${s.correct} | ${s.partly} | ${s.wrong} | ${pct(s.correct, s.total)} |`),
    "",
    "## Most common species corrections",
    "",
    ...(Object.keys(corrections).length ? top(corrections).map(([k, n]) => `- ${k} (${n})`) : ["- none yet"]),
    "",
    "## Trait corrections",
    "",
    ...(Object.keys(traitFixes).length ? top(traitFixes).map(([k, n]) => `- ${k} (${n})`) : ["- none yet"]),
    "",
  ];
  return lines.join("\n");
};

const fetchAll = async (cfg, since) => {
  const out = [];
  const pageSize = 1000;
  const filter = since ? `&created_at=gte.${encodeURIComponent(since)}` : "";
  for (let from = 0; ; from += pageSize) {
    const page = await rest(cfg, `id_feedback?select=*,beta_testers(name,group)&order=created_at.asc${filter}`, {
      headers: { Range: `${from}-${from + pageSize - 1}`, "Range-Unit": "items" },
    });
    out.push(...page);
    if (page.length < pageSize) return out;
  }
};

const main = async (argv) => {
  const csv = argv.includes("--csv");
  const i = argv.indexOf("--since");
  const since = i >= 0 ? argv[i + 1] : null;
  if (since && Number.isNaN(Date.parse(since))) throw new Error("--since needs a date, e.g. 2027-01-01");
  const rows = await fetchAll(config(), since);
  process.stdout.write(csv ? toCsv(rows) : summarise(rows));
};

if (import.meta.url === pathToFileURL(process.argv[1] || "").href) {
  main(process.argv.slice(2)).catch((e) => { console.error(e.message); process.exitCode = 1; });
}
