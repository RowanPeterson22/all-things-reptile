#!/usr/bin/env node
// ─── Layout check (dark design pass) ──────────────────────────────
// Visits every public route of the production build at 320, 360, 375, 390 and
// 430 px and fails if anything overlaps, is clipped or scrolls sideways:
//   • document.scrollingElement.scrollWidth must not exceed innerWidth;
//   • no two visible text / interactive elements may intersect, except when
//     one contains the other (legitimate nesting);
//   • no text may be cut off by an overflow: hidden ancestor (line clamps and
//     ellipses are allowed: they're deliberate);
//   • scrolled to the end, nothing may sit under the floating tab bar.
// Excluded: the decorative photo layer ([data-layout-decor]: hero photos,
// their fades), ScrollRow's chevrons ([data-layout-overlay], which float over
// the faded edge of the row by design), the fixed tab bar (checked on its own),
// screen-reader-only text and anything invisible (opacity 0, hidden).
//
// Species pages and care guides are checked on every one of their tabs; the
// ID screen also with results and the feedback card open; Licencing with a
// state expanded; Search with a query; a category page; a Coming soon page.
//
// Not part of `npm test`. Run after `CI=true npm run build`:
//   node scripts/layout-check.mjs                 # check, exit 1 on offenders
//   node scripts/layout-check.mjs --widths 320,390
//   node scripts/layout-check.mjs --only ackie     # routes whose label matches
//   node scripts/layout-check.mjs --shots <dir>    # also the review screenshots
//   node scripts/layout-check.mjs --selftest       # proves the check catches a
//     planted overlap, a clipped label and sideways scroll (expects failures)
// Needs Playwright (preinstalled in the ATR cloud environment; not a project
// dependency). /api/* is mocked; the build is served for every other path,
// index.html for unknown ones. Set ATR_MOCK_PHOTOS="a.jpg,b.jpg" to use real
// photos; otherwise two gradient JPEGs are generated with jpeg-js.

import { createRequire } from "module";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const require = createRequire(import.meta.url);
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const BUILD = path.join(ROOT, "build");

const loadPlaywright = () => {
  const tries = ["playwright", "/opt/npm-tools/node_modules/playwright"];
  for (const t of tries) { try { return require(t); } catch (e) { /* next */ } }
  console.error("Playwright isn't available. It's preinstalled in the ATR cloud environment; elsewhere install it globally.");
  process.exit(2);
};
const { chromium } = loadPlaywright();

// ── Arguments ──
const args = process.argv.slice(2);
const arg = (name, dflt) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : dflt; };
const WIDTHS = arg("--widths", "320,360,375,390,430").split(",").map(Number);
const ONLY = arg("--only", null);
const SHOTS = arg("--shots", null);
const HEIGHT = { 320: 640, 360: 740, 375: 667, 390: 844, 430: 932 };

if (!fs.existsSync(path.join(BUILD, "index.html"))) { console.error("No build/. Run `CI=true npm run build` first."); process.exit(2); }

// ── Data: slugs straight from the source, so new pages are checked too ──
const read = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");
const SPECIES = [...read("src/data/species.js").matchAll(/name: "([^"]+)",[^\n]*?page: "([^"]+)", slug: "([^"]+)"/g)].map(m => ({ name: m[1], page: m[2], slug: m[3] }));
const GUIDES = [...read("src/data/careGuides.js").matchAll(/title: "([^"]+)",[^\n]*?page: "([^"]+)", slug: "([^"]+)"/g)].map(m => ({ title: m[1], slug: m[3] }));
if (SPECIES.length !== 46) { console.error(`Expected 46 species, read ${SPECIES.length}`); process.exit(2); }

// ── Mocks ──
const L = require(path.join(ROOT, "src/constants/appLayout.js"));
const BUILT = ["id", "species", "care", "licensing", "glossary", "search", "credits"];
const view = L.resolveView(L.buildConfig({ rows: [] }), { role: "tester", own: BUILT });
const BETA = { ok: true, name: "Layout check", traits: {}, sections: view.sections, app: view.app, isAdmin: false, gated: true };

const photoBytes = (() => {
  const env = process.env.ATR_MOCK_PHOTOS;
  if (env) return env.split(",").map(f => fs.readFileSync(f.trim()));
  const jpeg = require(path.join(ROOT, "node_modules/jpeg-js"));
  const make = (seed) => {
    const width = 640, height = 480, data = Buffer.alloc(width * height * 4);
    for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      data[i] = 60 + ((x * seed) % 120); data[i + 1] = 70 + (y % 90); data[i + 2] = 40 + ((x + y) % 60); data[i + 3] = 255;
    }
    return jpeg.encode({ data, width, height }, 80).data;
  };
  return [make(3), make(7)];
})();
const credit = { show: true, name: "A. Photographer", licence: "CC BY 4.0", licenceUrl: "https://creativecommons.org/licenses/by/4.0/", source: "iNaturalist", sourceUrl: "https://www.inaturalist.org/", edited: true };
const photo = (species, n, extra = {}) => ({ id: `${species}-${n}`, species, speciesName: species, url: `/__mock/photo${n}.jpg`, width: 1024, height: 700, focal: { x: 0.5, y: 0.5 }, hero: n === 1, heroCrop: null, alt: `${species} ${n}`, credit, ...extra });
const CATS = ["lizard", "snake", "gecko", "turtle", "frog", "monitor"].map((c, i) => ({ category: c, url: `/__mock/photo${(i % 2) + 1}.jpg`, width: 1024, height: 700, focal: { x: 0.5, y: 0.5 }, crop: null, bannerCrop: null, speciesName: "Mock", alt: c, credit }));
const ID_RESULT = {
  subject: "reptile", notNative: false, note: "A side-on photo of the head would help separate it from the Northern Blue-tongue.",
  suggestions: [
    { name: "Eastern Blue-tongue Skink", latin: "Tiliqua scincoides", confidence: "likely", matched: true, slug: "eastern-blue-tongue-skink", inApp: true, appSlug: "eastern-blue-tongue-skink", reason: "Broad dark bands across a silver-grey body, short limbs and a heavy triangular head.", traits: [{ id: "t1", name: "Normal", confidence: "likely" }, { id: "t2", name: "Hypomelanistic", confidence: "possible" }] },
    { name: "Eastern Brown Snake", latin: "Pseudonaja textilis", confidence: "unlikely", matched: true, slug: "eastern-brown-snake", inApp: false, dangerouslyVenomous: true, reason: "Very unlikely given the limbs; listed so you never mistake one." },
    { name: "Some lizard", latin: "", confidence: "possible", matched: false, outsideCoverage: true, reason: "Possibly an introduced species." },
  ],
};

const types = { ".js": "application/javascript", ".css": "text/css", ".png": "image/png", ".html": "text/html", ".json": "application/json", ".webp": "image/webp", ".svg": "image/svg+xml", ".ico": "image/x-icon", ".jpg": "image/jpeg" };
async function route(r) {
  const u = new URL(r.request().url());
  const json = (o) => r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(o) });
  if (u.hostname.includes("fonts.g")) return r.continue().catch(() => r.fulfill({ status: 200, body: "" }));
  if (u.hostname !== "atr.local") return r.fulfill({ status: 404, body: "" });
  const p = u.pathname;
  if (p.startsWith("/__mock/photo")) return r.fulfill({ status: 200, contentType: "image/jpeg", body: photoBytes[p.includes("photo2") ? 1 : 0] });
  if (p === "/api/beta-check") return json(BETA);
  if (p === "/api/species-photos") {
    if (u.searchParams.get("categories")) return json({ categories: CATS });
    const sp = u.searchParams.get("species");
    if (sp) return json({ photos: [photo(sp, 1), photo(sp, 2)] });
    return json({ photos: SPECIES.slice(0, 12).flatMap(s => [photo(s.slug, 1)]) });
  }
  if (p === "/api/identify") return json(ID_RESULT);
  if (p.startsWith("/api/")) return json({ ok: true });
  let f = path.join(BUILD, p);
  if (!f.startsWith(BUILD) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) f = path.join(BUILD, "index.html");
  return r.fulfill({ status: 200, contentType: types[path.extname(f)] || "application/octet-stream", body: fs.readFileSync(f) });
}

// ── The in-page check ──
// Returns { hscroll, overlaps: [...], clipped: [...], underNav: [...] }.
function inspect() {
  const vw = window.innerWidth;
  const out = { hscroll: null, overlaps: [], clipped: [], underNav: [] };
  const sw = document.scrollingElement.scrollWidth;
  if (sw > vw) out.hscroll = { scrollWidth: sw, innerWidth: vw };

  const nav = document.querySelector('nav[aria-label="Main"]');
  const excluded = (el) => el.closest("[data-layout-decor],[data-layout-overlay]") || (nav && nav.contains(el));
  const visible = (el) => {
    for (let e = el; e && e !== document.documentElement; e = e.parentElement) {
      const cs = getComputedStyle(e);
      if (cs.display === "none" || cs.visibility === "hidden" || Number(cs.opacity) === 0) return false;
      if (e.getAttribute("aria-hidden") === "true" && e.hasAttribute("inert")) return false;
    }
    return true;
  };
  // The visible part of a rect after every clipping ancestor; also says which
  // non-scrolling ancestor cut it, if any.
  const clipOf = (el, rect) => {
    let r = { left: rect.left, top: rect.top, right: rect.right, bottom: rect.bottom };
    let cutBy = null;
    for (let e = el.parentElement; e && e !== document.body; e = e.parentElement) {
      const cs = getComputedStyle(e);
      const ox = cs.overflowX, oy = cs.overflowY;
      if (ox === "visible" && oy === "visible" && cs.clipPath === "none") continue;
      const b = e.getBoundingClientRect();
      const scrolls = /(auto|scroll)/.test(ox + oy);
      const before = { ...r };
      if (ox !== "visible" || cs.clipPath !== "none") { r.left = Math.max(r.left, b.left); r.right = Math.min(r.right, b.right); }
      if (oy !== "visible" || cs.clipPath !== "none") { r.top = Math.max(r.top, b.top); r.bottom = Math.min(r.bottom, b.bottom); }
      const cut = r.left > before.left + 1 || r.right < before.right - 1 || r.top > before.top + 1 || r.bottom < before.bottom - 1;
      if (cut && !scrolls && !cutBy) cutBy = e;
    }
    return { r, cutBy };
  };
  const label = (el) => {
    const t = (el.getAttribute("aria-label") || el.textContent || "").trim().replace(/\s+/g, " ").slice(0, 50);
    const id = el.getAttribute("data-testid");
    return `<${el.tagName.toLowerCase()}${id ? ` testid=${id}` : ""}> "${t}"`;
  };

  // Candidates: interactive elements (their box) and elements with their own
  // text (the tight box of that text).
  const INTERACTIVE = "button, a[href], input:not([type=hidden]), select, textarea, [role=button], [role=link], [role=tab]";
  const items = [];
  const seen = new Set();
  for (const el of document.querySelectorAll(INTERACTIVE)) {
    if (excluded(el) || !visible(el)) continue;
    if (el.tagName === "INPUT" && el.type === "file") continue;
    const rect = el.getBoundingClientRect();
    if (rect.width <= 1 || rect.height <= 1) continue;
    items.push({ el, rect, kind: "ui" });
    seen.add(el);
  }
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const byEl = new Map();
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    if (!n.nodeValue.trim()) continue;
    const el = n.parentElement;
    if (!el || excluded(el) || ["SCRIPT", "STYLE", "NOSCRIPT"].includes(el.tagName)) continue;
    const range = document.createRange();
    range.selectNodeContents(n);
    const rs = [...range.getClientRects()].filter(r => r.width > 0.5 && r.height > 0.5);
    if (!rs.length) continue;
    const box = byEl.get(el) || { left: Infinity, top: Infinity, right: -Infinity, bottom: -Infinity };
    for (const r of rs) { box.left = Math.min(box.left, r.left); box.top = Math.min(box.top, r.top); box.right = Math.max(box.right, r.right); box.bottom = Math.max(box.bottom, r.bottom); }
    byEl.set(el, box);
  }
  for (const [el, box] of byEl) {
    if (!visible(el)) continue;
    const r = el.getBoundingClientRect();
    if (r.width <= 1 || r.height <= 1) continue; // screen-reader-only
    items.push({ el, rect: { ...box, width: box.right - box.left, height: box.bottom - box.top }, kind: "text" });
  }

  // Clip each to what's visible; flag text cut by a non-scrolling ancestor.
  const live = [];
  for (const it of items) {
    const { r, cutBy } = clipOf(it.el, it.rect);
    if (r.right - r.left <= 1 || r.bottom - r.top <= 1) continue; // scrolled out of a row
    if (it.kind === "text" && cutBy) {
      const cs = getComputedStyle(it.el);
      const deliberate = cs.webkitLineClamp !== "none" && cs.webkitLineClamp !== "" ? true
        : [it.el, cutBy].some(e => getComputedStyle(e).textOverflow === "ellipsis");
      if (!deliberate) out.clipped.push(`${label(it.el)} cut by ${label(cutBy)}`);
    }
    if (it.kind === "text" && (it.rect.right > vw + 0.5 || it.rect.left < -0.5) && !cutBy) {
      const { r: rr } = clipOf(it.el, it.rect);
      if (rr.right > vw + 0.5 || rr.left < -0.5) out.clipped.push(`${label(it.el)} runs off the screen (${Math.round(it.rect.left)}–${Math.round(it.rect.right)} of ${vw})`);
    }
    live.push({ ...it, r });
  }

  // Pairwise, swept by top edge.
  live.sort((a, b) => a.r.top - b.r.top);
  const pairs = new Set();
  for (let i = 0; i < live.length; i++) {
    const a = live[i];
    for (let j = i + 1; j < live.length; j++) {
      const b = live[j];
      if (b.r.top >= a.r.bottom - 1) break;
      if (a.el === b.el || a.el.contains(b.el) || b.el.contains(a.el)) continue;
      const w = Math.min(a.r.right, b.r.right) - Math.max(a.r.left, b.r.left);
      const h = Math.min(a.r.bottom, b.r.bottom) - Math.max(a.r.top, b.r.top);
      if (w > 1 && h > 1) {
        const k = `${label(a.el)} ✕ ${label(b.el)}`;
        if (!pairs.has(k)) { pairs.add(k); out.overlaps.push(`${k} (${Math.round(w)}×${Math.round(h)}px)`); }
      }
    }
  }

  // The floating bar, scrolled to the very end: nothing under it.
  if (nav) {
    const n = nav.getBoundingClientRect();
    for (const it of live) {
      const w = Math.min(it.r.right, n.right) - Math.max(it.r.left, n.left);
      const h = Math.min(it.r.bottom, n.bottom) - Math.max(it.r.top, n.top);
      if (w > 1 && h > 1) out.underNav.push(label(it.el));
    }
  }
  return out;
}

// ── Driving the app ──
const wait = (p, ms) => p.waitForTimeout(ms);
const go = async (p, url) => {
  await p.evaluate(u => { history.pushState({}, "", u); dispatchEvent(new PopStateEvent("popstate")); }, url);
  await wait(p, 250);
};
const settle = async (p) => {
  await p.evaluate(() => Promise.all([...document.images].filter(i => !i.complete).map(i => new Promise(res => { i.onload = i.onerror = res; setTimeout(res, 1500); }))));
  await wait(p, 120);
};
// Top and bottom: the overlap check works on the whole page (rects are
// document-wide via scroll 0); the nav check needs the end of the page.
const check = async (p) => {
  await p.evaluate(() => window.scrollTo(0, 0));
  await wait(p, 60);
  const top = await p.evaluate(inspect);
  await p.evaluate(() => window.scrollTo(0, document.scrollingElement.scrollHeight));
  await wait(p, 80);
  const end = await p.evaluate(inspect);
  await p.evaluate(() => window.scrollTo(0, 0));
  return { hscroll: top.hscroll || end.hscroll, overlaps: [...new Set([...top.overlaps, ...end.overlaps])], clipped: [...new Set([...top.clipped, ...end.clipped])], underNav: end.underNav };
};
const tabsIn = (p, testId) => p.evaluate(id => [...document.querySelectorAll(`[data-testid="${id}"] button[aria-pressed]`)].map(b => b.textContent), testId);
const clickTab = (p, testId, i) => p.evaluate(([id, k]) => document.querySelectorAll(`[data-testid="${id}"] button[aria-pressed]`)[k].click(), [testId, i]);

// Each route: a label, a URL and optional steps; `tabs` checks every segment.
const ROUTES = [
  { label: "Home", url: "/" },
  { label: "Learn (species)", url: "/species" },
  { label: "Category: Monitors", url: "/species", after: async (p) => { await p.evaluate(() => [...document.querySelectorAll("div")].find(d => d.textContent === "Monitors").click()); await wait(p, 300); } },
  { label: "Category: Pythons & Snakes", url: "/species", after: async (p) => { await p.evaluate(() => [...document.querySelectorAll("div")].find(d => d.textContent === "Pythons & Snakes").click()); await wait(p, 300); } },
  ...SPECIES.map(s => ({ label: `Species: ${s.name}`, url: `/species/${s.slug}`, tabs: "species-tabs" })),
  { label: "Care guides", url: "/care" },
  ...GUIDES.map(g => ({ label: `Care: ${g.title}`, url: `/care/${g.slug}`, tabs: "guide-tabs" })),
  { label: "Licencing", url: "/licencing" },
  { label: "Licencing: NSW open", url: "/licencing", after: async (p) => { await p.evaluate(() => [...document.querySelectorAll("button[aria-expanded]")][0].click()); await wait(p, 150); } },
  { label: "Licencing: TAS open", url: "/licencing", after: async (p) => { await p.evaluate(() => [...document.querySelectorAll("button[aria-expanded]")].find(b => b.textContent.includes("TAS")).click()); await wait(p, 150); } },
  { label: "Glossary", url: "/glossary" },
  { label: "Search: python", url: "/search", after: async (p) => { await p.fill('input[aria-label="Search"]', "python"); await wait(p, 200); } },
  { label: "Search: no results", url: "/search", after: async (p) => { await p.fill('input[aria-label="Search"]', "zzqx"); await wait(p, 200); } },
  { label: "Credits", url: "/credits" },
  { label: "ID", url: "/id" },
  { label: "ID: results + feedback", url: "/id", after: async (p) => {
    await p.setInputFiles('input[type="file"]', { name: "x.jpg", mimeType: "image/jpeg", buffer: photoBytes[0] });
    await p.waitForSelector("text=Identify", { timeout: 5000 });
    await p.evaluate(() => [...document.querySelectorAll("button")].find(b => /^Identify/.test(b.textContent)).click());
    await p.waitForSelector('[data-testid="id-suggestion"]', { timeout: 5000 });
    await p.evaluate(() => [...document.querySelectorAll("button")].find(b => b.textContent === "Partly").click());
    await wait(p, 300);
  } },
  { label: "Community", url: "/community" },
  { label: "My Profile", url: "/profile" },
  { label: "Coming soon: Sightings", url: "/community/sightings" },
  { label: "Coming soon: Which reptile suits me?", url: "/profile/which-reptile" },
];

// --selftest: plant three faults on Home; the run must report all three.
const SELFTEST = args.includes("--selftest");
if (SELFTEST) ROUTES.unshift({ label: "SELFTEST (must fail)", url: "/", after: async (p) => {
  await p.evaluate(() => {
    const h = document.querySelector("header");
    const over = document.createElement("div"); over.textContent = "PLANTED OVERLAP";
    Object.assign(over.style, { position: "absolute", top: "20px", right: "10px", color: "#fff" }); h.style.position = "relative"; h.appendChild(over);
    const box = document.createElement("div"); Object.assign(box.style, { width: "60px", height: "14px", overflow: "hidden" });
    box.innerHTML = "<span>PLANTED CLIPPED LABEL TEXT</span>"; document.querySelector("main").prepend(box);
    const wide = document.createElement("div"); Object.assign(wide.style, { width: "150vw", height: "2px" }); document.querySelector("main").appendChild(wide);
  });
} });

const selected = SELFTEST ? ROUTES.slice(0, 1) : ONLY ? ROUTES.filter(r => r.label.toLowerCase().includes(ONLY.toLowerCase())) : ROUTES;

async function newPage(browser, width, dpr = 1) {
  const ctx = await browser.newContext({ viewport: { width, height: HEIGHT[width] || 844 }, deviceScaleFactor: dpr, hasTouch: true });
  // Not isMobile: mobile emulation widens the layout viewport to fit wide
  // content, which would hide exactly the sideways scroll we're looking for.
  await ctx.addInitScript(() => { try { localStorage.setItem("atr-ai-id-invite", "x".repeat(43)); } catch (e) { /* private mode */ } });
  const p = await ctx.newPage();
  p.on("pageerror", e => console.log(`  pageerror @${width}: ${e.message}`));
  await p.route("**/*", route);
  await p.goto("http://atr.local/");
  await wait(p, 3400); // splash
  return { ctx, p };
}

async function visit(p, r) {
  await go(p, "/");            // reset screen state (e.g. an open category)
  await go(p, r.url);
  await settle(p);
  if (r.after) { await r.after(p); await settle(p); }
}

async function runChecks(browser) {
  const problems = [];
  let checks = 0;
  for (const width of WIDTHS) {
    const { ctx, p } = await newPage(browser, width);
    for (const r of selected) {
      await visit(p, r);
      const record = async (where) => {
        checks++;
        const res = await check(p);
        const list = [
          ...(res.hscroll ? [`horizontal scroll: ${res.hscroll.scrollWidth} > ${res.hscroll.innerWidth}`] : []),
          ...res.overlaps.map(o => `overlap: ${o}`),
          ...res.clipped.map(o => `clipped: ${o}`),
          ...res.underNav.map(o => `under the tab bar: ${o}`),
        ];
        if (list.length) problems.push({ width, where, list });
      };
      if (r.tabs) {
        const tabs = await tabsIn(p, r.tabs);
        if (!tabs.length) problems.push({ width, where: r.label, list: [`no tabs found in [data-testid="${r.tabs}"]: is the build current?`] });
        for (let i = 0; i < tabs.length; i++) {
          await clickTab(p, r.tabs, i);
          await settle(p);
          await record(`${r.label} › ${tabs[i]}`);
        }
      } else await record(r.label);
    }
    await ctx.close();
    console.log(`  ${width}px done`);
  }
  return { problems, checks };
}

// ── Review screenshots (390 px @2x, plus 320 px Ackie and Home) ──
async function shots(browser, dir) {
  fs.mkdirSync(dir, { recursive: true });
  // Full length, with the floating bar where a phone shows it at the end of
  // the page (a fullPage capture would paint the fixed bar mid-page): grow the
  // viewport to the page's height, shoot, put it back.
  const take = async (p, file) => {
    await p.evaluate(() => window.scrollTo(0, 0)); await wait(p, 150);
    const size = p.viewportSize();
    const h = await p.evaluate(() => document.scrollingElement.scrollHeight);
    await p.setViewportSize({ width: size.width, height: Math.max(size.height, h) }); await wait(p, 250);
    await p.screenshot({ path: path.join(dir, file) });
    await p.setViewportSize(size); await wait(p, 100);
  };
  const at = async (width, list) => {
    const { ctx, p } = await newPage(browser, width, 2);
    for (const [routeLabel, file, extra] of list) {
      const r = ROUTES.find(x => x.label === routeLabel);
      await visit(p, r);
      if (extra) { await extra(p); await settle(p); }
      await take(p, file);
    }
    await ctx.close();
  };
  const tab = (k) => async (p) => { await clickTab(p, "species-tabs", k); };
  const ackie = "Species: Ackie Monitor";
  await at(390, [
    ["Home", "01-home.png"],
    ["Learn (species)", "02-learn.png"],
    ["Category: Monitors", "03-category-monitors.png"],
    [ackie, "04-ackie-overview.png"],
    [ackie, "05-ackie-feeding.png", tab(1)],
    [ackie, "06-ackie-health.png", tab(2)],
    [ackie, "07-ackie-handling.png", tab(3)],
    [ackie, "08-ackie-licence.png", tab(4)],
    ["Species: Carpet Python", "09-snake-carpet-python.png"],
    ["Species: Green Tree Frog", "10-frog-green-tree-frog.png"],
    ["Care: Temperature & heating", "11-care-temperature.png"],
    ["Care: Feeder guide", "12-feeder-guide.png"],
    ["Licencing", "13-licencing.png"],
    ["Licencing: NSW open", "13b-licencing-nsw-open.png"],
    ["Glossary", "14-glossary.png"],
    ["ID", "15-id.png"],
    ["ID: results + feedback", "15b-id-results.png"],
    ["My Profile", "16-my-profile.png"],
    ["Coming soon: Sightings", "17-coming-soon.png"],
    ["Search: python", "18-search.png"],
    ["Community", "19-community.png"],
  ]);
  await at(320, [[ackie, "20-ackie-overview-320.png"], ["Home", "21-home-320.png"]]);
  // The viewport only (not full page) at 390, to show the floating bar over content.
  const { ctx, p } = await newPage(browser, 390, 2);
  await visit(p, ROUTES.find(x => x.label === ackie));
  await p.screenshot({ path: path.join(dir, "22-ackie-viewport.png") });
  await ctx.close();
}

const browser = await chromium.launch();
const started = Date.now();
console.log(`Layout check: ${selected.length} routes × ${WIDTHS.join("/")} px`);
const { problems, checks } = await runChecks(browser);
if (SHOTS) { await shots(browser, SHOTS); console.log(`Screenshots → ${SHOTS}`); }
await browser.close();

const secs = Math.round((Date.now() - started) / 1000);
if (!problems.length) {
  console.log(`\nCLEAN: ${checks} screens checked (${selected.length} routes, tabs included, at ${WIDTHS.join(", ")} px) in ${secs}s. No overlaps, clipping, sideways scroll or content under the tab bar.`);
  process.exit(0);
}
console.log(`\n${problems.length} screen(s) with problems (of ${checks} checked, ${secs}s):`);
for (const pr of problems) {
  console.log(`\n[${pr.width}px] ${pr.where}`);
  for (const l of pr.list.slice(0, 12)) console.log(`  - ${l}`);
  if (pr.list.length > 12) console.log(`  … and ${pr.list.length - 12} more`);
}
process.exit(1);
