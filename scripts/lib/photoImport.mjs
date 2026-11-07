// ─── Reference photo import: the logic behind scripts/import-photos.mjs ─────
// Node 18+ (global fetch). No dependencies. Everything that touches the network
// takes an injected fetch and sleep, so the Jest tests run it against mocks.
//
// Legal rules (non-negotiable, see scripts/README-photos.md):
//   - Only photos whose OWN licence is CC0, CC-BY or CC-BY-SA. Never NC/ND,
//     all-rights-reserved or unknown. The observation's licence is ignored.
//   - Store photographer, licence code + URL, source, original page link and
//     import date (created_at) for every photo.
//   - Official APIs only. Never scrape HTML.
//
// Photos are private reference material for the AI ID. Only the server key
// (service_role) touches the table and the private bucket.

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname } from "node:path";
import { config as baseConfig, EXPECTED_REF } from "./supabaseAdmin.mjs";

export { EXPECTED_REF };
export const INAT_API = "https://api.inaturalist.org/v1";
export const INAT_OBS_PAGE = "https://www.inaturalist.org/observations/";
export const AU_PLACE_ID = 6744; // iNaturalist place "Australia"
export const BUCKET = "reference-photos";
export const USER_AGENT = "ATR-reference-import/1.0 (+https://app.allthingsreptile.com.au)";
export const ADDED_BY = "scripts/import-photos.mjs";
export const MAX_BYTES = 2 * 1024 * 1024; // matches the bucket cap
export const MEDIA_HOSTS = ["inaturalist-open-data.s3.amazonaws.com", "static.inaturalist.org"];

export const ALLOWED_LICENCES = ["cc0", "cc-by", "cc-by-sa"];
// iNaturalist licenses photos under the 4.0 international versions.
export const LICENCE_URLS = {
  "cc0": "https://creativecommons.org/publicdomain/zero/1.0/",
  "cc-by": "https://creativecommons.org/licenses/by/4.0/",
  "cc-by-sa": "https://creativecommons.org/licenses/by-sa/4.0/",
};

export class BudgetExhausted extends Error {}

// ─── Supabase config with a strict project guard ────────────────────
// Unlike the beta admin scripts, there is no override: this script only ever
// writes to the atr project.
export const strictConfig = (env = process.env) => {
  const cfg = baseConfig({ ...env, ATR_ALLOW_OTHER_SUPABASE: "" });
  // A legacy service_role JWT carries its project ref; check it matches too.
  if (/^eyJ/.test(cfg.key)) {
    let ref = null;
    try { ref = JSON.parse(Buffer.from(cfg.key.split(".")[1], "base64url").toString("utf8")).ref; } catch (e) { /* not a JWT */ }
    if (ref && ref !== EXPECTED_REF) throw new Error(`SUPABASE_SECRET_KEY belongs to project ${ref}, not ${EXPECTED_REF}.`);
  }
  return cfg;
};

// ─── Licences ────────────────────────────────────────────────────────
export const normaliseLicence = (code) => {
  if (typeof code !== "string") return null;
  const c = code.trim().toLowerCase().replace(/_/g, "-");
  return c || null;
};
export const isAllowedLicence = (code) => ALLOWED_LICENCES.includes(normaliseLicence(code));

// ─── Polite HTTP client for iNaturalist ──────────────────────────────
// api:   ≥1.1 s between requests (≈1/s), counted against a daily budget that
//        persists across runs in budgetPath (UTC day).
// media: ≥0.3 s between downloads; not counted against the API budget.
// Backs off on 429 / 5xx / network errors, honouring Retry-After.
export const createInatClient = ({
  fetchImpl = globalThis.fetch,
  sleep = (ms) => new Promise((r) => setTimeout(r, ms)),
  now = () => Date.now(),
  apiIntervalMs = 1100,
  mediaIntervalMs = 300,
  maxRetries = 5,
  budget = { date: null, apiRequests: 0 },
  maxApiRequests = 9000,
  onBudgetChange = async () => {},
  warn = console.warn,
} = {}) => {
  const last = { api: 0, media: 0 };
  const interval = { api: apiIntervalMs, media: mediaIntervalMs };
  const today = () => new Date(now()).toISOString().slice(0, 10);

  const wait = async (kind) => {
    const gap = last[kind] + interval[kind] - now();
    if (gap > 0) await sleep(gap);
    last[kind] = now();
  };

  const get = async (url, kind = "api") => {
    for (let attempt = 0; ; attempt++) {
      if (kind === "api") {
        if (budget.date !== today()) { budget.date = today(); budget.apiRequests = 0; }
        if (budget.apiRequests >= maxApiRequests) throw new BudgetExhausted(`Daily iNaturalist API budget (${maxApiRequests}) used up. Re-run tomorrow with --resume.`);
        budget.apiRequests++;
        await onBudgetChange(budget);
      }
      await wait(kind);
      let res = null;
      let err = null;
      try {
        res = await fetchImpl(url, { headers: { "User-Agent": USER_AGENT, Accept: kind === "api" ? "application/json" : "image/jpeg" } });
      } catch (e) { err = e; }
      const retryable = err || res.status === 429 || res.status >= 500;
      if (!retryable) return res;
      if (attempt >= maxRetries) {
        if (err) throw new Error(`Network error fetching ${url}: ${err.message}`);
        return res;
      }
      const ra = res && res.headers && typeof res.headers.get === "function" ? Number(res.headers.get("retry-after")) : NaN;
      const backoff = Number.isFinite(ra) && ra > 0 ? ra * 1000 : Math.min(120000, 5000 * 2 ** attempt);
      warn(`  ${err ? "network error" : `HTTP ${res.status}`} from ${new URL(url).hostname}; waiting ${Math.round(backoff / 1000)} s`);
      await sleep(backoff);
    }
  };

  const getJson = async (url) => {
    const res = await get(url, "api");
    if (!res.ok) throw new Error(`iNaturalist ${new URL(url).pathname} returned ${res.status}`);
    return res.json();
  };

  return { get, getJson, budget };
};

// ─── Taxon resolution ────────────────────────────────────────────────
export const taxaUrl = (name) =>
  `${INAT_API}/taxa?${new URLSearchParams({ q: name, is_active: "true", per_page: "30" })}`;

const lc = (s) => String(s || "").trim().toLowerCase();
const OK_ICONIC = new Set(["Reptilia", "Amphibia"]);

// Picks the taxon whose name (or the term iNaturalist matched, which covers
// synonyms) is exactly this name, and that is a reptile or amphibian.
export const pickTaxon = (results, name) => {
  const want = lc(name);
  const ok = (r) => r && r.id && (!r.iconic_taxon_name || OK_ICONIC.has(r.iconic_taxon_name));
  return (results || []).find((r) => ok(r) && lc(r.name) === want)
    || (results || []).find((r) => ok(r) && lc(r.matched_term) === want)
    || null;
};

export const resolveTaxon = async (client, species, cache, { refresh = false } = {}) => {
  const hit = cache[species.slug];
  if (!refresh && hit && hit.scientific === species.scientific) return hit;
  const names = [species.scientific, ...(species.synonyms || [])].filter(Boolean);
  let entry = { scientific: species.scientific, taxonId: null, taxonName: null, rank: null, via: null, resolvedAt: new Date().toISOString().slice(0, 10) };
  for (const name of names) {
    const data = await client.getJson(taxaUrl(name));
    const t = pickTaxon(data && data.results, name);
    if (t) {
      entry = { ...entry, taxonId: t.id, taxonName: t.name, rank: t.rank || null, via: name === species.scientific ? "scientific" : `synonym:${name}` };
      break;
    }
  }
  cache[species.slug] = entry;
  return entry;
};

// ─── Observations → candidate photos ─────────────────────────────────
export const observationsUrl = (taxonId, { perPage = 100, page = 1 } = {}) =>
  `${INAT_API}/observations?${new URLSearchParams({
    taxon_id: String(taxonId),
    place_id: String(AU_PLACE_ID),
    quality_grade: "research",
    photo_license: ALLOWED_LICENCES.join(","),
    photos: "true",
    order_by: "votes",
    order: "desc",
    per_page: String(perPage),
    page: String(page),
  })}`;

const STATES = {
  NSW: ["new south wales", "nsw"], VIC: ["victoria", "vic"], QLD: ["queensland", "qld"], SA: ["south australia", "sa"],
  WA: ["western australia", "wa"], TAS: ["tasmania", "tas"], NT: ["northern territory", "nt"], ACT: ["australian capital territory", "act"],
};
// Best effort, from the observation's place_guess ("Cairns, QLD, Australia").
export const stateFromPlaceGuess = (guess) => {
  if (typeof guess !== "string") return null;
  const segs = guess.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean).reverse();
  for (const seg of segs) {
    for (const [code, names] of Object.entries(STATES)) {
      if (names.includes(seg)) return code;
      const m = seg.match(/\b(nsw|vic|qld|sa|wa|tas|nt|act)\s+\d{4}$/);
      if (m && m[1] === code.toLowerCase()) return code;
    }
  }
  return null;
};

// "(c) Jane Doe, some rights reserved (CC BY)" → "Jane Doe"
export const photographerFrom = (photo, user) => {
  const a = typeof photo.attribution === "string" ? photo.attribution.trim() : "";
  const m = a.match(/^\(c\)\s*(.+?),\s*(?:some|all|no) rights reserved/i);
  if (m && m[1].trim()) return m[1].trim().slice(0, 300);
  const u = user || {};
  return String(u.name || u.login || a || "").trim().slice(0, 300) || null;
};

export const mediumUrl = (url) => (typeof url === "string" ? url.replace(/\/(square|thumb|small|medium|large|original)\.(jpe?g|png|gif)(\?.*)?$/i, "/medium.$2$3") : null);

// Flattens observations into photo candidates, applying the licence rule to
// each photo's OWN licence. Returns { candidates, rejected } where rejected
// counts photos dropped by reason.
export const extractCandidates = (observations) => {
  const candidates = [];
  const rejected = {};
  const reject = (why) => { rejected[why] = (rejected[why] || 0) + 1; };
  for (const obs of observations || []) {
    if (!obs || !obs.id) continue;
    const user = obs.user || {};
    const observer = String(user.id || user.login || "unknown");
    const photos = Array.isArray(obs.photos) ? obs.photos : (obs.observation_photos || []).map((op) => op.photo).filter(Boolean);
    photos.forEach((p, idx) => {
      if (!p || !p.id) return reject("no-photo-id");
      const licence = normaliseLicence(p.license_code);
      if (!licence) return reject("licence-unknown");
      if (!ALLOWED_LICENCES.includes(licence)) return reject(`licence-${licence}`);
      const url = mediumUrl(p.url);
      if (!url) return reject("no-url");
      // The bucket is JPEG only. iNaturalist also serves some photos as PNG
      // (".../square.png"); drop them here so another photo takes the slot.
      if (!/\.jpe?g(\?.*)?$/i.test(url)) return reject("not-jpeg");
      const photographer = photographerFrom(p, user);
      if (!photographer) return reject("no-photographer");
      candidates.push({
        photoId: String(p.id),
        obsId: String(obs.id),
        observer,
        photoIndex: idx,
        licence,
        licenceUrl: LICENCE_URLS[licence],
        url,
        photographer,
        attribution: typeof p.attribution === "string" ? p.attribution.slice(0, 2000) : null,
        observedOn: /^\d{4}-\d{2}-\d{2}$/.test(obs.observed_on || "") ? obs.observed_on : null,
        state: stateFromPlaceGuess(obs.place_guess),
        quality: obs.quality_grade || null,
        sourceUrl: `${INAT_OBS_PAGE}${obs.id}`,
      });
    });
  }
  return { candidates, rejected };
};

// Greedy spread: each pick is the candidate whose observation, then observer,
// has been used least so far; ties keep iNaturalist's vote order.
export const selectSpread = (candidates, n, exclude = new Set()) => {
  const pool = candidates.filter((c) => !exclude.has(c.photoId));
  const seen = new Set();
  const uniq = pool.filter((c) => (seen.has(c.photoId) ? false : seen.add(c.photoId)));
  const byObs = {}, byUser = {}, picked = [];
  const used = new Array(uniq.length).fill(false);
  while (picked.length < n) {
    let best = -1;
    for (let i = 0; i < uniq.length; i++) {
      if (used[i]) continue;
      if (best < 0) { best = i; continue; }
      const a = uniq[i], b = uniq[best];
      const ka = [byObs[a.obsId] || 0, byUser[a.observer] || 0], kb = [byObs[b.obsId] || 0, byUser[b.observer] || 0];
      if (ka[0] < kb[0] || (ka[0] === kb[0] && ka[1] < kb[1])) best = i;
    }
    if (best < 0) break;
    used[best] = true;
    const c = uniq[best];
    byObs[c.obsId] = (byObs[c.obsId] || 0) + 1;
    byUser[c.observer] = (byUser[c.observer] || 0) + 1;
    picked.push(c);
  }
  return picked;
};

// ─── JPEG checks ─────────────────────────────────────────────────────
export const isJpeg = (buf) => buf && buf.length > 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff;
// Width/height from the first SOFn marker, or null.
export const jpegSize = (buf) => {
  if (!isJpeg(buf)) return null;
  let i = 2;
  while (i + 9 < buf.length) {
    if (buf[i] !== 0xff) { i++; continue; }
    const marker = buf[i + 1];
    if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) { i += 2; continue; }
    const len = buf.readUInt16BE(i + 2);
    if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
      return { height: buf.readUInt16BE(i + 5), width: buf.readUInt16BE(i + 7) };
    }
    i += 2 + len;
  }
  return null;
};

// ─── Supabase (PostgREST + Storage) ──────────────────────────────────
const sbHeaders = (cfg, extra = {}) => ({ apikey: cfg.key, Authorization: `Bearer ${cfg.key}`, ...extra });

const sbFail = async (res, what) => {
  const text = await res.text().catch(() => "");
  const e = new Error(`Supabase ${what} failed: ${res.status} ${text.slice(0, 200)}`);
  e.status = res.status;
  return e;
};

// Every existing row's (species_slug, source, source_id), paged.
export const loadExisting = async (cfg, fetchImpl = globalThis.fetch) => {
  const rows = [];
  const pageSize = 1000;
  for (let from = 0; ; from += pageSize) {
    const res = await fetchImpl(`${cfg.url}/rest/v1/reference_photos?select=species_slug,source,source_id&order=id.asc`, {
      headers: sbHeaders(cfg, { Accept: "application/json", Range: `${from}-${from + pageSize - 1}`, "Range-Unit": "items" }),
    });
    if (!res.ok) throw await sbFail(res, "existing rows lookup");
    const page = await res.json();
    rows.push(...page);
    if (page.length < pageSize) break;
  }
  const keys = new Set(rows.map((r) => `${r.source}:${r.source_id}`));
  const perSpecies = {};
  for (const r of rows) perSpecies[r.species_slug] = (perSpecies[r.species_slug] || 0) + 1;
  return { keys, perSpecies };
};

export const storagePathFor = (slug, source, sourceId) => `${slug}/${source}-${sourceId}.jpg`;

export const uploadObject = async (cfg, path, buf, fetchImpl = globalThis.fetch) => {
  // x-upsert: only reached for (source, source_id) pairs with no row, so any
  // file already at this path is an orphan from an interrupted run.
  const res = await fetchImpl(`${cfg.url}/storage/v1/object/${BUCKET}/${path}`, {
    method: "POST",
    headers: sbHeaders(cfg, { "Content-Type": "image/jpeg", "x-upsert": "true", "Cache-Control": "no-store" }),
    body: buf,
  });
  if (!res.ok) throw await sbFail(res, "photo upload");
};

export const deleteObject = async (cfg, path, fetchImpl = globalThis.fetch) => {
  const res = await fetchImpl(`${cfg.url}/storage/v1/object/${BUCKET}`, {
    method: "DELETE",
    headers: sbHeaders(cfg, { "Content-Type": "application/json" }),
    body: JSON.stringify({ prefixes: [path] }),
  });
  if (!res.ok) throw await sbFail(res, "photo delete");
};

export const insertRow = async (cfg, row, fetchImpl = globalThis.fetch) => {
  const res = await fetchImpl(`${cfg.url}/rest/v1/reference_photos`, {
    method: "POST",
    headers: sbHeaders(cfg, { "Content-Type": "application/json", Prefer: "return=minimal" }),
    body: JSON.stringify(row),
  });
  if (!res.ok) throw await sbFail(res, "row insert");
};

const rowReferencesPath = async (cfg, path, fetchImpl) => {
  const res = await fetchImpl(`${cfg.url}/rest/v1/reference_photos?select=id&storage_path=eq.${encodeURIComponent(path)}&limit=1`, {
    headers: sbHeaders(cfg, { Accept: "application/json" }),
  });
  if (!res.ok) return true; // can't tell: leave the file rather than risk orphaning a row
  const rows = await res.json().catch(() => []);
  return Array.isArray(rows) && rows.length > 0;
};

// Upload, then insert; if the insert fails, remove the upload (unless another
// row already points at that exact file).
export const storePhoto = async (cfg, row, buf, fetchImpl = globalThis.fetch) => {
  await uploadObject(cfg, row.storage_path, buf, fetchImpl);
  try {
    await insertRow(cfg, row, fetchImpl);
  } catch (e) {
    let cleaned = false;
    const keep = e.status === 409 && (await rowReferencesPath(cfg, row.storage_path, fetchImpl));
    if (!keep) {
      try { await deleteObject(cfg, row.storage_path, fetchImpl); cleaned = true; } catch (d) { e.message += ` (and cleanup failed: ${d.message})`; }
    }
    e.cleanedUp = cleaned;
    throw e;
  }
};

// ─── Per-species import ──────────────────────────────────────────────
export const importSpecies = async (ctx, species) => {
  const { client, cfg, fetchImpl, existing, taxaCache, opts } = ctx;
  const have = existing.perSpecies[species.slug] || 0;
  // Never more than N per species in total, and never a duplicate pair.
  const target = Math.max(0, opts.perSpecies - have);
  const rep = { slug: species.slug, group: species.group, appSlug: species.appSlug || null, scientific: species.scientific,
    taxonId: null, resolvedVia: null, existing: have, observations: 0, found: 0, rejected: {}, selected: 0, imported: 0, failed: 0, errors: [] };

  if (target === 0) { rep.skipped = `already has ${have}`; return rep; }

  const taxon = await resolveTaxon(client, species, taxaCache, { refresh: opts.refreshTaxa });
  rep.taxonId = taxon.taxonId;
  rep.resolvedVia = taxon.via;
  if (!taxon.taxonId) { rep.errors.push("no iNaturalist taxon for scientific name or synonyms"); return rep; }

  const perPage = Math.min(200, Math.max(50, target * 4));
  let candidates = [];
  let picks = [];
  for (let page = 1; page <= (opts.maxPages || 3); page++) {
    const data = await client.getJson(observationsUrl(taxon.taxonId, { perPage, page }));
    const results = (data && data.results) || [];
    rep.observations += results.length;
    const { candidates: c, rejected } = extractCandidates(results);
    for (const [k, v] of Object.entries(rejected)) rep.rejected[k] = (rep.rejected[k] || 0) + v;
    candidates = candidates.concat(c);
    picks = selectSpread(candidates, target, { has: (id) => existing.keys.has(`inaturalist:${id}`) });
    const total = Number(data && data.total_results) || 0;
    if (picks.length >= target || page * perPage >= total || results.length < perPage) break;
  }
  rep.found = candidates.length;
  rep.selected = picks.length;
  if (opts.dryRun) { rep.wouldImport = picks.length; return rep; }

  for (const c of picks) {
    const key = `inaturalist:${c.photoId}`;
    if (existing.keys.has(key)) continue;
    try {
      const host = new URL(c.url).hostname;
      if (!MEDIA_HOSTS.includes(host)) throw new Error(`unexpected media host ${host}`);
      const res = await client.get(c.url, "media");
      if (!res.ok) throw new Error(`download returned ${res.status}`);
      const buf = Buffer.from(await res.arrayBuffer());
      if (!isJpeg(buf)) throw new Error("not a JPEG");
      if (buf.length > MAX_BYTES) throw new Error("over 2 MB");
      const size = jpegSize(buf) || {};
      const row = {
        species_slug: species.slug,
        source: "inaturalist",
        source_id: c.photoId,
        source_url: c.sourceUrl,
        photographer: c.photographer,
        licence: c.licence,
        licence_url: c.licenceUrl,
        storage_path: storagePathFor(species.slug, "inaturalist", c.photoId),
        width: size.width || null,
        height: size.height || null,
        observed_on: c.observedOn,
        state: c.state,
        quality: c.quality,
        notes: c.attribution,
        added_by: ADDED_BY,
      };
      await storePhoto(cfg, row, buf, fetchImpl);
      existing.keys.add(key);
      existing.perSpecies[species.slug] = (existing.perSpecies[species.slug] || 0) + 1;
      rep.imported++;
    } catch (e) {
      if (e instanceof BudgetExhausted) throw e;
      rep.failed++;
      rep.errors.push(`photo ${c.photoId}: ${e.message}`.slice(0, 300));
    }
  }
  return rep;
};

// ─── Species selection and args ──────────────────────────────────────
export const filterSpecies = (all, { species, groups, appOnly, limit } = {}) => {
  let list = all;
  if (species && species.length) {
    const want = new Set(species);
    const unknown = species.filter((s) => !all.some((r) => r.slug === s));
    if (unknown.length) throw new Error(`Unknown species slug(s): ${unknown.join(", ")}`);
    list = list.filter((r) => want.has(r.slug));
  }
  if (groups && groups.length) list = list.filter((r) => groups.includes(r.group));
  if (appOnly) list = list.filter((r) => r.appSlug);
  if (limit) list = list.slice(0, limit);
  return list;
};

export const parseArgs = (argv) => {
  const o = { perSpecies: 30, species: [], groups: [], appOnly: false, dryRun: false, resume: false, source: "inaturalist",
    refreshTaxa: false, maxRequests: 9000, limit: 0, help: false };
  const num = (v, flag) => { const n = Number(v); if (!Number.isInteger(n) || n < 1) throw new Error(`${flag} needs a whole number ≥ 1`); return n; };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const next = () => { if (i + 1 >= argv.length) throw new Error(`${a} needs a value`); return argv[++i]; };
    if (a === "--per-species") o.perSpecies = num(next(), a);
    else if (a === "--species") o.species = next().split(",").map((s) => s.trim()).filter(Boolean);
    else if (a === "--group") o.groups = next().split(",").map((s) => s.trim()).filter(Boolean);
    else if (a === "--app-only") o.appOnly = true;
    else if (a === "--dry-run") o.dryRun = true;
    else if (a === "--resume") o.resume = true;
    else if (a === "--source") o.source = next();
    else if (a === "--refresh-taxa") o.refreshTaxa = true;
    else if (a === "--max-requests") o.maxRequests = Math.min(9500, num(next(), a));
    else if (a === "--limit") o.limit = num(next(), a);
    else if (a === "--help" || a === "-h") o.help = true;
    else throw new Error(`Unknown option ${a}`);
  }
  if (!["inaturalist", "ala"].includes(o.source)) throw new Error("--source must be inaturalist or ala");
  return o;
};

// ─── Report ──────────────────────────────────────────────────────────
export const FEW = 5;
export const summarise = (report) => {
  const s = report.species;
  const count = (r) => (report.dryRun ? r.wouldImport || 0 : r.imported) + (r.existing || 0);
  return {
    species: s.length,
    imported: s.reduce((n, r) => n + (r.imported || 0), 0),
    wouldImport: report.dryRun ? s.reduce((n, r) => n + (r.wouldImport || 0), 0) : undefined,
    failed: s.reduce((n, r) => n + (r.failed || 0), 0),
    unresolved: s.filter((r) => r.errors.some((e) => e.startsWith("no iNaturalist taxon"))).map((r) => r.slug),
    zero: s.filter((r) => !r.skipped && count(r) === 0).map((r) => r.slug),
    few: s.filter((r) => !r.skipped && count(r) > 0 && count(r) < FEW).map((r) => `${r.slug} (${count(r)})`),
  };
};

const readJson = async (path, fallback) => {
  try { return JSON.parse(await readFile(path, "utf8")); } catch (e) { return fallback; }
};
const writeJson = async (path, data) => {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, `${JSON.stringify(data, null, 2)}\n`);
};

// ─── Top level ───────────────────────────────────────────────────────
export const run = async (opts, {
  env = process.env, fetchImpl = globalThis.fetch, sleep, now, log = console.log,
  speciesPath, cachePath, reportPath, budgetPath,
} = {}) => {
  // Guard first: nothing is fetched unless the target is the atr project.
  const cfg = strictConfig(env);
  if (opts.source === "ala") {
    // TODO(ALA): biocache-ws /occurrences/search takes fq filters, but we
    // couldn't confirm from ALA's API docs that it can filter on the IMAGE's
    // own licence (as opposed to the record's). Until that's confirmed and
    // each image's licence can be checked individually, ALA import stays off.
    throw new Error("--source ala isn't implemented yet: ALA image-licence filtering is unconfirmed (see TODO in scripts/lib/photoImport.mjs).");
  }

  const all = JSON.parse(await readFile(speciesPath, "utf8"));
  const list = filterSpecies(all, opts);
  const taxaCache = await readJson(cachePath, {});
  const budget = await readJson(budgetPath, { date: null, apiRequests: 0 });
  const client = createInatClient({ fetchImpl, sleep, now, budget, maxApiRequests: opts.maxRequests, warn: log,
    onBudgetChange: async (b) => writeJson(budgetPath, b) });
  const existing = await loadExisting(cfg, fetchImpl);
  const already = list.filter((sp) => existing.perSpecies[sp.slug]);
  if (already.length && !opts.resume && !opts.dryRun) {
    throw new Error(`${already.length} of the selected species already have photos (e.g. ${already.slice(0, 3).map((s) => s.slug).join(", ")}). Re-run with --resume to top them up to ${opts.perSpecies}.`);
  }

  const report = { startedAt: new Date().toISOString(), dryRun: !!opts.dryRun, options: opts, stoppedEarly: null, species: [] };
  const ctx = { client, cfg, fetchImpl, existing, taxaCache, opts };
  log(`${opts.dryRun ? "Dry run: " : ""}${list.length} species, up to ${opts.perSpecies} photos each.`);

  for (const [i, sp] of list.entries()) {
    try {
      const rep = await importSpecies(ctx, sp);
      report.species.push(rep);
      const got = opts.dryRun ? `${rep.wouldImport || 0} would import` : `${rep.imported} imported`;
      log(`[${i + 1}/${list.length}] ${sp.slug}: ${rep.skipped ? rep.skipped : `${rep.found} usable, ${got}${rep.failed ? `, ${rep.failed} failed` : ""}${rep.errors.length && !rep.found ? ` (${rep.errors[0]})` : ""}`}`);
    } catch (e) {
      if (e instanceof BudgetExhausted) { report.stoppedEarly = e.message; log(e.message); break; }
      report.species.push({ slug: sp.slug, group: sp.group, appSlug: sp.appSlug || null, existing: existing.perSpecies[sp.slug] || 0,
        found: 0, imported: 0, failed: 0, errors: [e.message.slice(0, 300)] });
      log(`[${i + 1}/${list.length}] ${sp.slug}: error ${e.message}`);
    } finally {
      await writeJson(cachePath, taxaCache);
      report.finishedAt = new Date().toISOString();
      report.apiRequestsToday = budget.apiRequests;
      report.summary = summarise(report);
      await writeJson(reportPath, report);
    }
  }

  const sum = summarise(report);
  log("");
  log(`Species processed: ${sum.species}${report.stoppedEarly ? " (stopped early: budget)" : ""}`);
  log(opts.dryRun ? `Would import: ${sum.wouldImport}` : `Imported: ${sum.imported}, failed: ${sum.failed}`);
  log(`No iNaturalist taxon: ${sum.unresolved.length}${sum.unresolved.length ? ` — ${sum.unresolved.join(", ")}` : ""}`);
  log(`Zero photos: ${sum.zero.length}${sum.zero.length ? ` — ${sum.zero.slice(0, 50).join(", ")}${sum.zero.length > 50 ? " …" : ""}` : ""}`);
  log(`Fewer than ${FEW}: ${sum.few.length}${sum.few.length ? ` — ${sum.few.slice(0, 50).join(", ")}${sum.few.length > 50 ? " …" : ""}` : ""}`);
  log(`iNaturalist API requests today: ${budget.apiRequests}/${opts.maxRequests}`);
  return report;
};

// ─── Stats (scripts/photo-stats.mjs) ─────────────────────────────────
export const loadAllRows = async (cfg, fetchImpl = globalThis.fetch) => {
  const rows = [];
  for (let from = 0; ; from += 1000) {
    const res = await fetchImpl(`${cfg.url}/rest/v1/reference_photos?select=species_slug,source,status,is_best,licence&order=id.asc`, {
      headers: sbHeaders(cfg, { Accept: "application/json", Range: `${from}-${from + 999}`, "Range-Unit": "items" }),
    });
    if (!res.ok) throw await sbFail(res, "stats lookup");
    const page = await res.json();
    rows.push(...page);
    if (page.length < 1000) return rows;
  }
};

export const photoStats = (rows, species, { min = FEW } = {}) => {
  const active = rows.filter((r) => r.status === "active");
  const per = {};
  for (const r of active) per[r.species_slug] = (per[r.species_slug] || 0) + 1;
  const groups = {};
  for (const sp of species) {
    const g = (groups[sp.group] = groups[sp.group] || { species: 0, withPhotos: 0, photos: 0, gaps: 0 });
    const n = per[sp.slug] || 0;
    g.species++; g.photos += n;
    if (n > 0) g.withPhotos++;
    if (n < min) g.gaps++;
  }
  const known = new Set(species.map((s) => s.slug));
  return {
    total: rows.length,
    byStatus: rows.reduce((o, r) => ({ ...o, [r.status]: (o[r.status] || 0) + 1 }), {}),
    bySource: rows.reduce((o, r) => ({ ...o, [r.source]: (o[r.source] || 0) + 1 }), {}),
    best: rows.filter((r) => r.is_best && r.status === "active").length,
    perSpecies: species.map((s) => ({ slug: s.slug, group: s.group, appSlug: s.appSlug || null, photos: per[s.slug] || 0 })),
    groups,
    zero: species.filter((s) => !per[s.slug]).map((s) => s.slug),
    few: species.filter((s) => per[s.slug] && per[s.slug] < min).map((s) => `${s.slug} (${per[s.slug]})`),
    appGaps: species.filter((s) => s.appSlug && (per[s.slug] || 0) < min).map((s) => `${s.slug} (${per[s.slug] || 0})`),
    orphanSlugs: Object.keys(per).filter((k) => !known.has(k)),
  };
};
