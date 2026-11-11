#!/usr/bin/env node
// ─── Species pages: before/after proof ────────────────────────────
// Captures every species × every tab (and the Bearded Dragon's adult feeding
// toggle) from a production build at 390 px: a full-length screenshot and the
// rendered text (innerText) of the page and of the tab's content. Then
// compares two captures pixel for pixel (in Chromium, no extra packages) and
// text for text.
//
//   node scripts/species-diff.mjs capture <outDir> [--build <dir>] [--content snapshot|none]
//   node scripts/species-diff.mjs compare <beforeDir> <afterDir> [--report <file>]
//
// /api/* is mocked like scripts/layout-check.mjs: one hero photo per species
// (a single photo doesn't auto-advance, so shots are deterministic), and
// /api/species-photos?content=<slug> answers from src/data/speciesContent.json
// (--content snapshot, the default) or 404s (--content none, i.e. the app's
// bundled fallback). Needs Playwright, like layout-check.

import { createRequire } from "module";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const require = createRequire(import.meta.url);
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const loadPlaywright = () => {
  for (const t of ["playwright", "/opt/npm-tools/node_modules/playwright"]) { try { return require(t); } catch (e) { /* next */ } }
  console.error("Playwright isn't available."); process.exit(2);
};
const { chromium } = loadPlaywright();

const args = process.argv.slice(2);
const arg = (name, dflt) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : dflt; };
const [mode, a, b] = args;
const WIDTH = 390, HEIGHT = 844;

const read = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");
// The 46 come from the bundled content snapshot (src/data/species.js derives from it, D5 step 2).
const SPECIES = JSON.parse(read("src/data/speciesContent.json")).sort((x, y) => x.sortOrder - y.sortOrder).map(d => ({ name: d.name, slug: d.slug }));
const CONTENT = JSON.parse(read("src/data/speciesContent.json"));

const L = require(path.join(ROOT, "src/constants/appLayout.js"));
const BUILT = ["id", "species", "care", "licensing", "glossary", "search", "credits"];
const view = L.resolveView(L.buildConfig({ rows: [] }), { role: "tester", own: BUILT });
const BETA = { ok: true, name: "Species diff", traits: {}, sections: view.sections, app: view.app, isAdmin: false, gated: true };

const jpeg = require(path.join(ROOT, "node_modules/jpeg-js"));
const PHOTO = (() => {
  const width = 640, height = 480, data = Buffer.alloc(width * height * 4);
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    const i = (y * width + x) * 4;
    data[i] = 60 + ((x * 3) % 120); data[i + 1] = 70 + (y % 90); data[i + 2] = 40 + ((x + y) % 60); data[i + 3] = 255;
  }
  return jpeg.encode({ data, width, height }, 80).data;
})();
const credit = { show: true, name: "A. Photographer", licence: "CC BY 4.0", licenceUrl: "https://creativecommons.org/licenses/by/4.0/", source: "iNaturalist", sourceUrl: "https://www.inaturalist.org/", edited: false };
const photo = (sp) => ({ id: `${sp}-1`, species: sp, speciesName: sp, url: "/__mock/photo.jpg", width: 1024, height: 700, focal: { x: 0.5, y: 0.5 }, hero: true, heroCrop: null, alt: sp, credit });

const types = { ".js": "application/javascript", ".css": "text/css", ".png": "image/png", ".html": "text/html", ".json": "application/json", ".webp": "image/webp", ".svg": "image/svg+xml", ".ico": "image/x-icon", ".jpg": "image/jpeg" };
const router = (BUILD, contentMode, log) => async (r) => {
  const u = new URL(r.request().url());
  const json = (o, status = 200) => r.fulfill({ status, contentType: "application/json", body: JSON.stringify(o) });
  if (u.hostname.includes("fonts.g")) return r.continue().catch(() => r.fulfill({ status: 200, body: "" }));
  if (u.hostname !== "atr.local") return r.fulfill({ status: 404, body: "" });
  const p = u.pathname;
  if (p === "/__mock/photo.jpg") return r.fulfill({ status: 200, contentType: "image/jpeg", body: PHOTO });
  if (p === "/api/beta-check") return json(BETA);
  if (p === "/api/species-photos") {
    const c = u.searchParams.get("content");
    if (c) {
      log.push(c);
      const doc = contentMode === "snapshot" && CONTENT.find(d => d.slug === c);
      return doc ? json({ species: doc }) : json({ error: "No such species." }, 404);
    }
    if (u.searchParams.get("categories")) return json({ categories: [] });
    const sp = u.searchParams.get("species");
    return json({ photos: sp ? [photo(sp)] : [] });
  }
  if (p.startsWith("/api/")) return json({ ok: true });
  let f = path.join(BUILD, p);
  if (!f.startsWith(BUILD) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) f = path.join(BUILD, "index.html");
  return r.fulfill({ status: 200, contentType: types[path.extname(f)] || "application/octet-stream", body: fs.readFileSync(f) });
};

const wait = (p, ms) => p.waitForTimeout(ms);
const go = async (p, url) => { await p.evaluate(u => { history.pushState({}, "", u); dispatchEvent(new PopStateEvent("popstate")); }, url); await wait(p, 300); };
const settle = async (p) => {
  await p.evaluate(() => Promise.all([...document.images].filter(i => !i.complete).map(i => new Promise(res => { i.onload = i.onerror = res; setTimeout(res, 1500); }))));
  await p.evaluate(() => document.fonts && document.fonts.ready);
  await wait(p, 200);
};
const tabsIn = (p) => p.evaluate(() => [...document.querySelectorAll('[data-testid="species-tabs"] button[aria-pressed]')].map(t => t.textContent));
const clickTab = (p, i) => p.evaluate(k => document.querySelectorAll('[data-testid="species-tabs"] button[aria-pressed]')[k].click(), i);
const take = async (p, file) => {
  await p.evaluate(() => window.scrollTo(0, 0)); await wait(p, 120);
  const h = await p.evaluate(() => document.scrollingElement.scrollHeight);
  await p.setViewportSize({ width: WIDTH, height: Math.max(HEIGHT, h) }); await wait(p, 250);
  await p.screenshot({ path: file });
  await p.setViewportSize({ width: WIDTH, height: HEIGHT }); await wait(p, 80);
};
const texts = (p) => p.evaluate(() => ({
  pageText: document.body.innerText,
  tabText: (document.querySelector('[data-testid="species-tab-content"]') || {}).innerText || "",
  title: document.title,
}));

async function capture(out) {
  const BUILD = path.resolve(arg("--build", path.join(ROOT, "build")));
  const contentMode = arg("--content", "snapshot");
  if (!fs.existsSync(path.join(BUILD, "index.html"))) { console.error(`No build at ${BUILD}`); process.exit(2); }
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: WIDTH, height: HEIGHT }, deviceScaleFactor: 1, hasTouch: true });
  await ctx.addInitScript(() => { try { localStorage.setItem("atr-ai-id-invite", "x".repeat(43)); } catch (e) { /* private */ } });
  const p = await ctx.newPage();
  const errors = [];
  const log = [];
  p.on("pageerror", e => errors.push(e.message));
  p.on("console", m => { if (m.type() === "error" || m.type() === "warning") errors.push(`${m.type()}: ${m.text()}`); });
  await p.route("**/*", router(BUILD, contentMode, log));
  await p.goto("http://atr.local/");
  await wait(p, 3400); // splash
  const index = [];
  for (const s of SPECIES) {
    await go(p, "/");
    await go(p, `/species/${s.slug}`);
    await settle(p);
    const tabs = await tabsIn(p);
    for (let i = 0; i < tabs.length; i++) {
      await clickTab(p, i);
      await settle(p);
      const key = `${s.slug}__${i}-${tabs[i].replace(/[^a-z0-9]+/gi, "-").toLowerCase()}`;
      await take(p, path.join(out, `${key}.png`));
      index.push({ key, slug: s.slug, tab: tabs[i], ...(await texts(p)) });
      // The Bearded Dragon's feeding tab has an age toggle: capture the other state too.
      const toggles = await p.evaluate(() => [...document.querySelectorAll('[data-testid="species-tab-content"] button')].filter(btn => /months\)$/.test(btn.textContent)).map(btn => btn.textContent));
      for (let t = 1; t < toggles.length; t++) {
        await p.evaluate(label => [...document.querySelectorAll('[data-testid="species-tab-content"] button')].find(btn => btn.textContent === label).click(), toggles[t]);
        await settle(p);
        const k2 = `${key}__toggle${t}`;
        await take(p, path.join(out, `${k2}.png`));
        index.push({ key: k2, slug: s.slug, tab: `${tabs[i]} / ${toggles[t]}`, ...(await texts(p)) });
        await p.evaluate(label => [...document.querySelectorAll('[data-testid="species-tab-content"] button')].find(btn => btn.textContent === label).click(), toggles[0]);
        await settle(p);
      }
    }
  }
  await browser.close();
  fs.writeFileSync(path.join(out, "index.json"), JSON.stringify({ contentMode, contentRequests: log.length, errors, shots: index }, null, 1));
  console.log(`Captured ${index.length} screens (${SPECIES.length} species) → ${out}; content requests: ${log.length}; page errors/warnings: ${errors.length}`);
  if (errors.length) console.log(errors.slice(0, 10).join("\n"));
}

// Pixel diff in Chromium: decode both PNGs on a canvas, count pixels whose
// channels differ by more than `tol`.
async function compare(beforeDir, afterDir) {
  const A = JSON.parse(fs.readFileSync(path.join(beforeDir, "index.json"), "utf8"));
  const B = JSON.parse(fs.readFileSync(path.join(afterDir, "index.json"), "utf8"));
  const byKey = Object.fromEntries(B.shots.map(s => [s.key, s]));
  const browser = await chromium.launch();
  const p = await browser.newPage();
  await p.setContent("<html><body></body></html>");
  const results = [];
  for (const s of A.shots) {
    const t = byKey[s.key];
    if (!t) { results.push({ key: s.key, missing: true }); continue; }
    const pa = fs.readFileSync(path.join(beforeDir, `${s.key}.png`)).toString("base64");
    const pb = fs.readFileSync(path.join(afterDir, `${s.key}.png`)).toString("base64");
    const px = pa === pb ? { same: true, w: 0, h: 0, diff: 0, maxDelta: 0, box: null } : await p.evaluate(async ([x, y]) => {
      const load = (b64) => new Promise((res, rej) => { const im = new Image(); im.onload = () => res(im); im.onerror = rej; im.src = `data:image/png;base64,${b64}`; });
      const [ia, ib] = await Promise.all([load(x), load(y)]);
      const w = Math.max(ia.width, ib.width), h = Math.max(ia.height, ib.height);
      const get = (im) => { const c = document.createElement("canvas"); c.width = w; c.height = h; const g = c.getContext("2d"); g.drawImage(im, 0, 0); return g.getImageData(0, 0, w, h).data; };
      const da = get(ia), db = get(ib);
      let diff = 0, maxDelta = 0, x0 = w, y0 = h, x1 = -1, y1 = -1;
      for (let i = 0; i < da.length; i += 4) {
        const d = Math.max(Math.abs(da[i] - db[i]), Math.abs(da[i + 1] - db[i + 1]), Math.abs(da[i + 2] - db[i + 2]), Math.abs(da[i + 3] - db[i + 3]));
        if (d > maxDelta) maxDelta = d;
        if (d > 24) { diff++; const px = (i / 4) % w, py = Math.floor(i / 4 / w); if (px < x0) x0 = px; if (px > x1) x1 = px; if (py < y0) y0 = py; if (py > y1) y1 = py; }
      }
      return { same: false, sizeA: [ia.width, ia.height], sizeB: [ib.width, ib.height], diff, maxDelta, box: x1 >= 0 ? [x0, y0, x1, y1] : null };
    }, [pa, pb]);
    results.push({ key: s.key, tab: s.tab, ...px, textSame: s.tab === t.tab && s.title === t.title && s.pageText === t.pageText && s.tabText === t.tabText });
  }
  await browser.close();
  return { A, B, results };
}

if (mode === "capture") {
  await capture(path.resolve(a));
} else if (mode === "compare") {
  const { A, B, results } = await compare(path.resolve(a), path.resolve(b));
  const bBy = Object.fromEntries(B.shots.map(s => [s.key, s]));
  const aKeys = new Set(A.shots.map(s => s.key));
  const pix = results.filter(r => !r.missing && !r.same && (r.diff > 0 || String(r.sizeA) !== String(r.sizeB)));
  const noise = results.filter(r => !r.missing && !r.same && r.diff === 0 && String(r.sizeA) === String(r.sizeB));
  const textDiffs = results.filter(r => !r.missing && !r.textSame).map(r => {
    const x = A.shots.find(s => s.key === r.key), y = bBy[r.key];
    const lines = (t) => t.split("\n");
    const la = lines(x.tabText), lb = lines(y.tabText);
    return { key: r.key, title: x.title === y.title, page: x.pageText === y.pageText, tab: x.tabText === y.tabText,
      removed: la.filter(l => !lb.includes(l)), added: lb.filter(l => !la.includes(l)) };
  });
  const report = {
    screens: results.length, identicalFiles: results.filter(r => r.same).length, noiseOnly: noise.length,
    noise: noise.map(r => ({ key: r.key, maxDelta: r.maxDelta })),
    pixelDiffs: pix.map(r => ({ key: r.key, diffPixels: r.diff, maxDelta: r.maxDelta, box: r.box, sizeA: r.sizeA, sizeB: r.sizeB })),
    textDiffs,
    missing: results.filter(r => r.missing).map(r => r.key),
    extra: B.shots.map(s => s.key).filter(k => !aKeys.has(k)),
    before: { contentMode: A.contentMode, contentRequests: A.contentRequests, errors: A.errors },
    after: { contentMode: B.contentMode, contentRequests: B.contentRequests, errors: B.errors },
  };
  const out = arg("--report", null);
  if (out) fs.writeFileSync(out, JSON.stringify(report, null, 1));
  console.log(`${report.screens} screens: ${report.identicalFiles} byte-identical, ${noise.length} anti-aliasing noise only (every channel within 24/255), ${pix.length} with pixel differences, ${textDiffs.length} with text differences; missing ${report.missing.length}, extra ${report.extra.length}.`);
  for (const r of report.pixelDiffs) console.log(`  pixels: ${r.key}: ${r.diffPixels}px, max Δ${r.maxDelta}, box ${JSON.stringify(r.box)}${String(r.sizeA) !== String(r.sizeB) ? `, size ${r.sizeA} → ${r.sizeB}` : ""}`);
  for (const d of textDiffs) console.log(`  text: ${d.key} (title ${d.title ? "same" : "DIFFERS"}, page ${d.page ? "same" : "differs"}, tab ${d.tab ? "same" : "differs"})`);
} else {
  console.error("Usage: species-diff.mjs capture <dir> [--build dir] [--content snapshot|none] | compare <before> <after> [--report file]");
  process.exit(2);
}
