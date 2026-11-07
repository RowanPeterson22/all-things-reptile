/**
 * @jest-environment node
 */
// Reference photo import (scripts/import-photos.mjs → scripts/lib/photoImport.mjs).
// iNaturalist and Supabase are a mocked fetch throughout; nothing touches the network.

import { mkdtempSync, writeFileSync, readFileSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import {
  extractCandidates, isAllowedLicence, resolveTaxon, pickTaxon, selectSpread, observationsUrl,
  strictConfig, storePhoto, run, parseArgs, jpegSize, stateFromPlaceGuess, photographerFrom,
  mediumUrl, createInatClient, photoStats, BudgetExhausted, filterSpecies,
} from "../../scripts/lib/photoImport.mjs";

const URL_ = "https://ledcvbyiqkygcdleucqo.supabase.co";
const ENV = { SUPABASE_URL: URL_, SUPABASE_SECRET_KEY: "sb_secret_test" };
const CFG = { url: URL_, key: "sb_secret_test" };

const res = (status, body, headers = {}) => ({
  ok: status >= 200 && status < 300,
  status,
  headers: { get: (k) => headers[k.toLowerCase()] ?? null },
  json: async () => body,
  text: async () => (typeof body === "string" ? body : JSON.stringify(body)),
  arrayBuffer: async () => {
    const b = Buffer.isBuffer(body) ? body : Buffer.from(String(body));
    return b.buffer.slice(b.byteOffset, b.byteOffset + b.length);
  },
});

// Minimal JPEG: SOI, APP0, SOF0 (height 375, width 500), padding.
const jpeg = (h = 375, w = 500) => Buffer.concat([
  Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10]), Buffer.alloc(14, 0),
  Buffer.from([0xff, 0xc0, 0x00, 0x11, 0x08, h >> 8, h & 255, w >> 8, w & 255, 0x03]), Buffer.alloc(200, 1),
]);

const photo = (id, license_code, extra = {}) => ({
  id, license_code, url: `https://inaturalist-open-data.s3.amazonaws.com/photos/${id}/square.jpg`,
  attribution: `(c) Person ${id}, some rights reserved (CC BY)`, ...extra,
});
const obs = (id, photos, user = { id: id * 10, login: `user${id}`, name: `User ${id}` }, extra = {}) => ({
  id, photos, user, observed_on: "2024-03-01", place_guess: "Cairns, QLD, Australia", quality_grade: "research", license_code: "cc-by", ...extra,
});

const noSleep = jest.fn(async () => {});
const quietLog = () => {};

describe("licence filter", () => {
  test("keeps only CC0 / CC-BY / CC-BY-SA, by each photo's own licence", () => {
    const { candidates, rejected } = extractCandidates([
      obs(1, [photo(11, "cc-by"), photo(12, "cc-by-nc"), photo(13, "cc-by-nd"), photo(14, "cc-by-nc-sa")]),
      obs(2, [photo(21, "cc0"), photo(22, null), photo(23, undefined), photo(24, "CC-BY-SA")]),
      // Observation licence is NC but the photo is CC-BY: kept.
      obs(3, [photo(31, "cc-by")], undefined, { license_code: "cc-by-nc" }),
      // Observation licence is CC-BY but the photo is NC: rejected.
      obs(4, [photo(41, "cc-by-nc")], undefined, { license_code: "cc-by" }),
    ]);
    expect(candidates.map((c) => c.photoId).sort()).toEqual(["11", "21", "24", "31"]);
    expect(candidates.find((c) => c.photoId === "24").licence).toBe("cc-by-sa");
    expect(rejected).toEqual({ "licence-cc-by-nc": 2, "licence-cc-by-nd": 1, "licence-cc-by-nc-sa": 1, "licence-unknown": 2 });
  });

  test("skips non-JPEG photos (iNaturalist serves some as PNG) before they take a slot", () => {
    const png = photo(52, "cc-by", { url: "https://inaturalist-open-data.s3.amazonaws.com/photos/52/square.png" });
    const jpegExt = photo(53, "cc0", { url: "https://inaturalist-open-data.s3.amazonaws.com/photos/53/square.jpeg" });
    const { candidates, rejected } = extractCandidates([obs(5, [photo(51, "cc-by"), png, jpegExt])]);
    expect(candidates.map((c) => c.photoId)).toEqual(["51", "53"]);
    expect(candidates[1].url).toBe("https://inaturalist-open-data.s3.amazonaws.com/photos/53/medium.jpeg");
    expect(rejected).toEqual({ "not-jpeg": 1 });
  });

  test("isAllowedLicence rejects everything else", () => {
    for (const ok of ["cc0", "cc-by", "cc-by-sa", "CC-BY"]) expect(isAllowedLicence(ok)).toBe(true);
    for (const no of ["cc-by-nc", "cc-by-nd", "cc-by-nc-nd", "cc-by-nc-sa", "", null, undefined, "c", "all rights reserved", "pd"]) {
      expect(isAllowedLicence(no)).toBe(false);
    }
  });

  test("candidate carries attribution, licence URL, medium URL and the observation link", () => {
    const [c] = extractCandidates([obs(7, [photo(70, "cc-by")])]).candidates;
    expect(c).toMatchObject({
      photographer: "Person 70", licence: "cc-by", licenceUrl: "https://creativecommons.org/licenses/by/4.0/",
      url: "https://inaturalist-open-data.s3.amazonaws.com/photos/70/medium.jpg",
      sourceUrl: "https://www.inaturalist.org/observations/7", observedOn: "2024-03-01", state: "QLD", quality: "research",
    });
  });

  test("photographer falls back to the observer's name, then login", () => {
    expect(photographerFrom({ attribution: "(c) Jo Bloggs, no rights reserved (CC0)" }, {})).toBe("Jo Bloggs");
    expect(photographerFrom({}, { name: "Ann", login: "ann1" })).toBe("Ann");
    expect(photographerFrom({}, { login: "ann1" })).toBe("ann1");
  });

  test("helpers: medium URL, state from place guess, JPEG size", () => {
    expect(mediumUrl("https://static.inaturalist.org/photos/1/square.jpeg?123")).toBe("https://static.inaturalist.org/photos/1/medium.jpeg?123");
    expect(stateFromPlaceGuess("Victoria Park, Western Australia, Australia")).toBe("WA");
    expect(stateFromPlaceGuess("Sydney NSW 2000, Australia")).toBe("NSW");
    expect(stateFromPlaceGuess("Somewhere")).toBeNull();
    expect(jpegSize(jpeg(375, 500))).toEqual({ width: 500, height: 375 });
    expect(jpegSize(Buffer.from("not a jpeg"))).toBeNull();
  });
});

describe("observations query", () => {
  test("uses the agreed filters", () => {
    const u = new URL(observationsUrl(12345, { perPage: 120 }));
    expect(u.origin + u.pathname).toBe("https://api.inaturalist.org/v1/observations");
    expect(Object.fromEntries(u.searchParams)).toMatchObject({
      taxon_id: "12345", place_id: "6744", quality_grade: "research", photo_license: "cc0,cc-by,cc-by-sa",
      photos: "true", order_by: "votes", per_page: "120",
    });
  });
});

describe("taxon resolution", () => {
  const species = { slug: "northern-tree-snake", scientific: "Dendrelaphis calligaster", synonyms: ["Dendrelaphis calligastra"] };

  test("falls back to a synonym and caches the result", async () => {
    const fetchImpl = jest.fn(async (url) => {
      const q = new URL(url).searchParams.get("q");
      if (q === "Dendrelaphis calligaster") return res(200, { results: [{ id: 9, name: "Dendrelaphis punctulatus", iconic_taxon_name: "Reptilia" }] });
      return res(200, { results: [{ id: 555, name: "Dendrelaphis calligaster", matched_term: "Dendrelaphis calligastra", rank: "species", iconic_taxon_name: "Reptilia" }] });
    });
    const client = createInatClient({ fetchImpl, sleep: noSleep });
    const cache = {};
    const t = await resolveTaxon(client, species, cache);
    expect(t).toMatchObject({ taxonId: 555, via: "synonym:Dendrelaphis calligastra", scientific: "Dendrelaphis calligaster" });
    expect(fetchImpl).toHaveBeenCalledTimes(2);
    expect(fetchImpl.mock.calls[0][1].headers["User-Agent"]).toMatch(/^ATR-reference-import\/1\.0/);
    expect(fetchImpl.mock.calls[0][1].headers["User-Agent"]).not.toMatch(/@/);
    await resolveTaxon(client, species, cache);
    expect(fetchImpl).toHaveBeenCalledTimes(2); // cached
    await resolveTaxon(client, { ...species, scientific: "Changed name" }, cache);
    expect(fetchImpl).toHaveBeenCalledTimes(4); // name changed → re-resolved
  });

  test("ignores a same-named non-reptile and partial matches", () => {
    expect(pickTaxon([{ id: 1, name: "Morelia spilota", iconic_taxon_name: "Plantae" }], "Morelia spilota")).toBeNull();
    expect(pickTaxon([{ id: 2, name: "Morelia spilota variegata", iconic_taxon_name: "Reptilia" }], "Morelia spilota")).toBeNull();
    expect(pickTaxon([{ id: 3, name: "Morelia Spilota", iconic_taxon_name: "Reptilia" }], "morelia spilota").id).toBe(3);
  });

  test("records an unresolved species without throwing", async () => {
    const client = createInatClient({ fetchImpl: async () => res(200, { results: [] }), sleep: noSleep });
    const cache = {};
    expect((await resolveTaxon(client, species, cache)).taxonId).toBeNull();
    expect(cache["northern-tree-snake"].taxonId).toBeNull();
  });
});

describe("spreading and de-duplication", () => {
  test("spreads across observations and observers before doubling up", () => {
    const sameUser = { id: 1, login: "prolific" };
    const { candidates } = extractCandidates([
      obs(1, [photo(1, "cc-by"), photo(2, "cc-by"), photo(3, "cc-by")], sameUser),
      obs(2, [photo(4, "cc-by"), photo(5, "cc-by")], sameUser),
      obs(3, [photo(6, "cc-by")]),
      obs(4, [photo(7, "cc-by")]),
    ]);
    const picks = selectSpread(candidates, 4);
    expect(new Set(picks.map((p) => p.obsId)).size).toBe(4);
    expect(picks.map((p) => p.photoId)).toEqual(["1", "6", "7", "4"]);
  });

  test("skips excluded and repeated photo ids", () => {
    const { candidates } = extractCandidates([obs(1, [photo(1, "cc-by"), photo(2, "cc-by")]), obs(2, [photo(1, "cc-by")])]);
    expect(selectSpread(candidates, 10, new Set(["2"])).map((p) => p.photoId)).toEqual(["1"]);
  });
});

describe("project guard", () => {
  test("refuses any other Supabase project, with no override", () => {
    expect(() => strictConfig({ ...ENV, SUPABASE_URL: "https://otherprojectref1234.supabase.co" })).toThrow(/atr project/);
    expect(() => strictConfig({ ...ENV, SUPABASE_URL: "https://otherprojectref1234.supabase.co", ATR_ALLOW_OTHER_SUPABASE: "1" })).toThrow(/atr project/);
    expect(() => strictConfig({ ...ENV, SUPABASE_URL: "https://ledcvbyiqkygcdleucqo.supabase.co.evil.com" })).toThrow(/atr project/);
    expect(() => strictConfig({ SUPABASE_URL: URL_ })).toThrow(/SUPABASE_SECRET_KEY/);
    expect(strictConfig(ENV)).toEqual(CFG);
  });

  test("refuses a legacy JWT key from another project", () => {
    const jwt = (ref) => `eyJhbGciOiJIUzI1NiJ9.${Buffer.from(JSON.stringify({ ref, role: "service_role" })).toString("base64url")}.sig`;
    expect(() => strictConfig({ ...ENV, SUPABASE_SECRET_KEY: jwt("someotherproject") })).toThrow(/belongs to project someotherproject/);
    expect(strictConfig({ ...ENV, SUPABASE_SECRET_KEY: jwt("ledcvbyiqkygcdleucqo") }).url).toBe(URL_);
  });

  test("run() makes no request at all when the guard fails", async () => {
    const fetchImpl = jest.fn();
    await expect(run(parseArgs(["--app-only"]), { env: { ...ENV, SUPABASE_URL: "https://otherprojectref1234.supabase.co" }, fetchImpl, log: quietLog }))
      .rejects.toThrow(/atr project/);
    expect(fetchImpl).not.toHaveBeenCalled();
  });
});

describe("storePhoto cleanup", () => {
  const row = { species_slug: "lace-monitor", source: "inaturalist", source_id: "1", storage_path: "lace-monitor/inaturalist-1.jpg" };

  test("deletes the upload when the insert fails", async () => {
    const calls = [];
    const fetchImpl = jest.fn(async (url, init) => {
      calls.push(`${init.method || "GET"} ${url.replace(URL_, "")}`);
      if (url.includes("/storage/v1/object/reference-photos/") && init.method === "POST") return res(200, {});
      if (url.endsWith("/rest/v1/reference_photos") && init.method === "POST") return res(400, { message: "check constraint" });
      if (url.endsWith("/storage/v1/object/reference-photos") && init.method === "DELETE") return res(200, []);
      return res(500, "unexpected");
    });
    await expect(storePhoto(CFG, row, jpeg(), fetchImpl)).rejects.toMatchObject({ status: 400, cleanedUp: true });
    expect(calls).toEqual([
      "POST /storage/v1/object/reference-photos/lace-monitor/inaturalist-1.jpg",
      "POST /rest/v1/reference_photos",
      "DELETE /storage/v1/object/reference-photos",
    ]);
    expect(JSON.parse(fetchImpl.mock.calls[2][1].body)).toEqual({ prefixes: ["lace-monitor/inaturalist-1.jpg"] });
    expect(fetchImpl.mock.calls[0][1].headers["Content-Type"]).toBe("image/jpeg");
  });

  test("keeps the file on a 409 when an existing row already points at it", async () => {
    const fetchImpl = jest.fn(async (url, init) => {
      if (init.method === "POST" && url.includes("/storage/")) return res(200, {});
      if (init.method === "POST") return res(409, { code: "23505" });
      if (url.includes("storage_path=eq.")) return res(200, [{ id: "x" }]);
      return res(500, "unexpected");
    });
    await expect(storePhoto(CFG, row, jpeg(), fetchImpl)).rejects.toMatchObject({ status: 409, cleanedUp: false });
    expect(fetchImpl.mock.calls.some(([, i]) => i.method === "DELETE")).toBe(false);
  });
});

describe("polite client", () => {
  test("backs off on 429 (Retry-After) and 5xx, then succeeds", async () => {
    const seq = [res(429, {}, { "retry-after": "7" }), res(503, {}), res(200, { results: [] })];
    const fetchImpl = jest.fn(async () => seq.shift());
    const sleep = jest.fn(async () => {});
    const client = createInatClient({ fetchImpl, sleep, warn: quietLog });
    await client.getJson("https://api.inaturalist.org/v1/taxa?q=x");
    expect(fetchImpl).toHaveBeenCalledTimes(3);
    expect(sleep).toHaveBeenCalledWith(7000);
    expect(sleep).toHaveBeenCalledWith(10000);
  });

  test("spaces API requests at least 1.1 s apart", async () => {
    let t = 0;
    const sleep = jest.fn(async (ms) => { t += ms; });
    const client = createInatClient({ fetchImpl: async () => res(200, {}), sleep, now: () => t });
    await client.getJson("https://api.inaturalist.org/v1/a");
    await client.getJson("https://api.inaturalist.org/v1/b");
    expect(sleep).toHaveBeenCalledWith(1100);
  });

  test("stops at the daily budget", async () => {
    const budget = { date: null, apiRequests: 0 };
    const client = createInatClient({ fetchImpl: async () => res(200, {}), sleep: noSleep, budget, maxApiRequests: 2 });
    await client.getJson("https://api.inaturalist.org/v1/a");
    await client.getJson("https://api.inaturalist.org/v1/b");
    await expect(client.getJson("https://api.inaturalist.org/v1/c")).rejects.toBeInstanceOf(BudgetExhausted);
  });
});

// ─── End to end with a fake iNaturalist + Supabase ────────────────────
const SPECIES = [
  { slug: "lace-monitor", common: "Lace Monitor", scientific: "Varanus varius", group: "monitor", appSlug: "lace-monitor" },
  { slug: "green-tree-frog", common: "Green Tree Frog", scientific: "Ranoidea caerulea", synonyms: ["Litoria caerulea"], group: "frog", appSlug: "green-tree-frog" },
  { slug: "obscure-skink", common: "Obscure Skink", scientific: "Lerista obscura", group: "skink", appSlug: null },
];

const makeWorld = ({ existingRows = [], failInsertFor = new Set() } = {}) => {
  const dir = mkdtempSync(join(tmpdir(), "atr-photos-"));
  const paths = {
    speciesPath: join(dir, "species.json"), cachePath: join(dir, "cache", "inat-taxa.json"),
    reportPath: join(dir, "out", "import-report.json"), budgetPath: join(dir, "out", "inat-budget.json"),
  };
  writeFileSync(paths.speciesPath, JSON.stringify(SPECIES));
  const rows = [...existingRows];
  const objects = new Set(existingRows.map((r) => r.storage_path).filter(Boolean));
  const log = [];
  const taxa = { "Varanus varius": 1001, "Litoria caerulea": 2002 };
  const observations = {
    1001: [obs(1, [photo(101, "cc-by"), photo(102, "cc-by-nc")]), obs(2, [photo(201, "cc0")]), obs(3, [photo(301, "cc-by-sa"), photo(302, "cc-by")])],
    2002: [obs(4, [photo(401, "cc-by")]), obs(5, [photo(501, "cc-by-nd")])],
  };
  const fetchImpl = jest.fn(async (url, init = {}) => {
    const method = init.method || "GET";
    const u = new URL(url);
    log.push(`${method} ${u.hostname}${u.pathname}`);
    if (u.hostname === "api.inaturalist.org" && u.pathname === "/v1/taxa") {
      const q = u.searchParams.get("q");
      const id = taxa[q];
      return res(200, { results: id ? [{ id, name: q === "Litoria caerulea" ? "Ranoidea caerulea" : q, matched_term: q, rank: "species", iconic_taxon_name: q.startsWith("Varanus") ? "Reptilia" : "Amphibia" }] : [] });
    }
    if (u.hostname === "api.inaturalist.org" && u.pathname === "/v1/observations") {
      const list = observations[u.searchParams.get("taxon_id")] || [];
      return res(200, { total_results: list.length, results: list });
    }
    if (u.hostname === "inaturalist-open-data.s3.amazonaws.com") return res(200, jpeg());
    if (u.origin === URL_ && u.pathname === "/rest/v1/reference_photos" && method === "GET") {
      if (u.searchParams.get("storage_path")) return res(200, []);
      return res(200, rows.map((r) => ({ species_slug: r.species_slug, source: r.source, source_id: r.source_id })));
    }
    if (u.origin === URL_ && u.pathname.startsWith("/storage/v1/object/reference-photos/") && method === "POST") {
      objects.add(u.pathname.replace("/storage/v1/object/reference-photos/", ""));
      return res(200, {});
    }
    if (u.origin === URL_ && u.pathname === "/storage/v1/object/reference-photos" && method === "DELETE") {
      for (const p of JSON.parse(init.body).prefixes) objects.delete(p);
      return res(200, []);
    }
    if (u.origin === URL_ && u.pathname === "/rest/v1/reference_photos" && method === "POST") {
      const row = JSON.parse(init.body);
      if (failInsertFor.has(row.source_id)) return res(500, { message: "boom" });
      if (rows.some((r) => r.source === row.source && r.source_id === row.source_id)) return res(409, { code: "23505" });
      rows.push(row);
      return res(201, "");
    }
    return res(404, `no mock for ${method} ${url}`);
  });
  return { paths, rows, objects, log, fetchImpl, deps: { ...paths, env: ENV, fetchImpl, sleep: noSleep, log: quietLog } };
};

describe("run() end to end (mocked)", () => {
  test("dry run fetches metadata, writes a report and uploads nothing", async () => {
    const w = makeWorld();
    const report = await run(parseArgs(["--app-only", "--dry-run"]), w.deps);
    expect(report.species.map((s) => [s.slug, s.wouldImport])).toEqual([["lace-monitor", 4], ["green-tree-frog", 1]]);
    expect(w.log.some((l) => l.includes("storage") || l.startsWith("POST"))).toBe(false);
    expect(w.log.some((l) => l.includes("s3.amazonaws.com"))).toBe(false);
    const saved = JSON.parse(readFileSync(w.paths.reportPath, "utf8"));
    expect(saved.dryRun).toBe(true);
    expect(saved.summary.few).toEqual(["lace-monitor (4)", "green-tree-frog (1)"]);
    const cache = JSON.parse(readFileSync(w.paths.cachePath, "utf8"));
    expect(cache["green-tree-frog"]).toMatchObject({ taxonId: 2002, via: "synonym:Litoria caerulea" });
  });

  test("imports allowed photos with full credit, and cleans up a failed insert", async () => {
    const w = makeWorld({ failInsertFor: new Set(["301"]) });
    const report = await run(parseArgs(["--per-species", "30"]), w.deps);
    expect(w.rows.map((r) => r.source_id).sort()).toEqual(["101", "201", "302", "401"]);
    expect(w.objects.has("lace-monitor/inaturalist-301.jpg")).toBe(false);
    expect([...w.objects].sort()).toEqual(["green-tree-frog/inaturalist-401.jpg", "lace-monitor/inaturalist-101.jpg", "lace-monitor/inaturalist-201.jpg", "lace-monitor/inaturalist-302.jpg"]);
    for (const r of w.rows) {
      expect(["cc0", "cc-by", "cc-by-sa"]).toContain(r.licence);
      expect(r).toMatchObject({ source: "inaturalist", width: 500, height: 375, added_by: "scripts/import-photos.mjs" });
      expect(r.photographer).toBeTruthy();
      expect(r.licence_url).toMatch(/^https:\/\/creativecommons\.org\//);
      expect(r.source_url).toMatch(/^https:\/\/www\.inaturalist\.org\/observations\/\d+$/);
      expect(r.storage_path).toBe(`${r.species_slug}/inaturalist-${r.source_id}.jpg`);
    }
    const lace = report.species.find((s) => s.slug === "lace-monitor");
    expect(lace).toMatchObject({ imported: 3, failed: 1 });
    expect(report.summary.zero).toEqual(["obscure-skink"]);
    expect(report.summary.unresolved).toEqual(["obscure-skink"]);
  });

  test("refuses to re-import over existing rows without --resume", async () => {
    const w = makeWorld({ existingRows: [{ species_slug: "lace-monitor", source: "inaturalist", source_id: "101" }] });
    await expect(run(parseArgs(["--app-only"]), w.deps)).rejects.toThrow(/--resume/);
    expect(w.log.some((l) => l.includes("inaturalist.org"))).toBe(false);
  });

  test("--resume tops up to N, never duplicates a pair, and skips full species without calling iNaturalist", async () => {
    const w = makeWorld({
      existingRows: [
        { species_slug: "lace-monitor", source: "inaturalist", source_id: "101", storage_path: "lace-monitor/inaturalist-101.jpg" },
        { species_slug: "green-tree-frog", source: "inaturalist", source_id: "900" },
        { species_slug: "green-tree-frog", source: "inaturalist", source_id: "901" },
      ],
    });
    const report = await run(parseArgs(["--app-only", "--resume", "--per-species", "2"]), w.deps);
    const lace = report.species.find((s) => s.slug === "lace-monitor");
    const frog = report.species.find((s) => s.slug === "green-tree-frog");
    expect(frog.skipped).toBe("already has 2");
    expect(lace.imported).toBe(1);
    expect(w.rows.filter((r) => r.species_slug === "lace-monitor").map((r) => r.source_id)).toEqual(["101", "201"]);
    // Frog was full: no taxon or observation lookup for it.
    expect(w.fetchImpl.mock.calls.some(([u]) => u.includes("Litoria") || u.includes("taxon_id=2002"))).toBe(false);
    const ids = w.rows.map((r) => `${r.source}:${r.source_id}`);
    expect(new Set(ids).size).toBe(ids.length);
  });

  test("the same photo listed under two species is only imported once", async () => {
    const w = makeWorld();
    const twin = { slug: "lace-monitor-twin", common: "Twin", scientific: "Varanus varius", group: "monitor", appSlug: null };
    writeFileSync(w.paths.speciesPath, JSON.stringify([SPECIES[0], twin]));
    await run(parseArgs([]), w.deps);
    const ids = w.rows.map((r) => r.source_id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(w.rows.filter((r) => r.species_slug === "lace-monitor-twin")).toHaveLength(0);
  });

  test("--source ala is refused with a clear message", async () => {
    const w = makeWorld();
    await expect(run(parseArgs(["--source", "ala"]), w.deps)).rejects.toThrow(/isn't implemented/);
  });
});

describe("args, filters and stats", () => {
  test("parseArgs", () => {
    expect(parseArgs([])).toMatchObject({ perSpecies: 30, appOnly: false, dryRun: false, resume: false, source: "inaturalist", maxRequests: 9000 });
    expect(parseArgs(["--per-species", "10", "--species", "a,b", "--group", "frog", "--app-only", "--dry-run", "--resume", "--max-requests", "99999"]))
      .toMatchObject({ perSpecies: 10, species: ["a", "b"], groups: ["frog"], appOnly: true, dryRun: true, resume: true, maxRequests: 9500 });
    expect(() => parseArgs(["--per-species", "0"])).toThrow();
    expect(() => parseArgs(["--nope"])).toThrow(/Unknown option/);
    expect(() => parseArgs(["--source", "flickr"])).toThrow();
  });

  test("filterSpecies", () => {
    expect(filterSpecies(SPECIES, { appOnly: true }).map((s) => s.slug)).toEqual(["lace-monitor", "green-tree-frog"]);
    expect(filterSpecies(SPECIES, { groups: ["frog"] }).map((s) => s.slug)).toEqual(["green-tree-frog"]);
    expect(() => filterSpecies(SPECIES, { species: ["not-a-slug"] })).toThrow(/Unknown species/);
  });

  test("photoStats counts active photos per species and group, and lists gaps", () => {
    const rows = [
      ...Array.from({ length: 6 }, () => ({ species_slug: "lace-monitor", source: "inaturalist", status: "active", is_best: false })),
      { species_slug: "green-tree-frog", source: "inaturalist", status: "active", is_best: true },
      { species_slug: "green-tree-frog", source: "inaturalist", status: "rejected", is_best: false },
    ];
    const s = photoStats(rows, SPECIES, { min: 5 });
    expect(s.total).toBe(8);
    expect(s.byStatus).toEqual({ active: 7, rejected: 1 });
    expect(s.groups.monitor).toEqual({ species: 1, withPhotos: 1, photos: 6, gaps: 0 });
    expect(s.zero).toEqual(["obscure-skink"]);
    expect(s.few).toEqual(["green-tree-frog (1)"]);
    expect(s.appGaps).toEqual(["green-tree-frog (1)"]);
    expect(s.best).toBe(1);
  });
});
