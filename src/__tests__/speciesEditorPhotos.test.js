// /admin → Species → Photos: the species' photos inside the Species editor.
// The admin routes are the real handlers (api/admin-species, api/admin-photos)
// over in-memory Supabase doubles (src/testUtils), never the real tables or
// buckets. Covers the paged list and its admin gate, the panel (one hero,
// licence blocks, order, filters and paging, upload), the tall hero crop and
// the editor's preview following the panel.
import { render, screen, fireEvent, waitFor, within, act } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { SpeciesContentEditor } from "../admin/SpeciesContentScreen";
import LibraryScreen from "../admin/LibraryScreen";
import { makeApi } from "../admin/api";
import { reorder, previewPhotos, toPreviewPhoto } from "../admin/speciesEditor/PhotosPanel";
import { tallImageStyle, tallCropFor, coverRegion, heroImageStyle, TALL_ASPECT } from "../components/heroCrop";
import { objectPosition } from "../components/focal";
import { clearPhotoCache } from "../components/SpeciesGallery";
import { clearSpeciesContentCache } from "../data/speciesContent";
import { clearCategoryImageCache } from "../components/CategoryImage";
import { toLibraryJpegs } from "../admin/image";

jest.mock("../admin/image", () => ({ ...jest.requireActual("../admin/image"), toLibraryJpegs: jest.fn() }));

const speciesHandler = require("../../api/admin-species");
const photosHandler = require("../../api/admin-photos");
const { createFakeSpeciesDb } = require("../testUtils/fakeSpeciesDb");
const { createFakePhotoDb } = require("../testUtils/fakePhotoDb");
const { clearTesterCache } = require("../../lib/beta");
const { INDEX } = require("../../lib/adminSpecies");
const { CC_BY_SA_REASON } = require("../../lib/photoRules");
const SNAPSHOT = require("../data/speciesContent.json");
const jpegJs = require("jpeg-js");

const ADMIN = "A".repeat(43);
const NOT_ADMIN = "N".repeat(43);
const SUPABASE = "https://fake-atr.supabase.co";
const SP = "ackie-monitor"; // app slug = index slug
const TESTERS = [
  { id: "aaaaaaaa-0000-4000-8000-000000000001", name: "Rowan", active: true, is_admin: true, invite_code: ADMIN },
  { id: "aaaaaaaa-0000-4000-8000-000000000002", name: "Tess", active: true, is_admin: false, invite_code: NOT_ADMIN },
];

const jpeg = (w, h) => Buffer.from(jpegJs.encode({ data: Buffer.alloc(w * h * 4, 120), width: w, height: h }, 70).data);
const MEDIUM = jpeg(500, 375);
const MASTER = jpeg(900, 675);
const dataUrl = (buf) => `data:image/jpeg;base64,${buf.toString("base64")}`;

const pid = (n) => `dddddddd-0000-4000-8000-${String(n).padStart(12, "0")}`;
const P1 = pid(1), P2 = pid(2), P3 = pid(3), SA = pid(4), SMALL = pid(5), HID = pid(6), REJ = pid(7);
const base = { species_slug: SP, traits: [], is_best: false, status: "active", notes: null, stock_library: null, stock_asset_id: null, credit_required: false, show_credit: true, display_credit: null, credit_by_name: false, public_use: false, public_order: null, public_path: null, public_width: null, public_height: null, is_hero: false, hero_crop: null, focal_x: 0.5, focal_y: 0.5, master_path: null, master_width: null, master_height: null, edited: false, replaced_at: null };
const upload = (id, o) => ({ ...base, id, source: "admin_upload", source_id: id, source_url: `https://example.org/${id}`, photographer: `Keeper ${id.slice(-2)}`, licence: "permission", licence_url: null, storage_path: `${SP}/admin_upload-${id}.jpg`, width: 500, height: 375, master_path: `${SP}/admin_upload-${id}.master.jpg`, master_width: 900, master_height: 675, created_at: `2026-11-0${(Number(id.slice(-1)) % 9) + 1}T00:00:00Z`, ...o });
const pub = (id, order, o) => upload(id, { public_use: true, public_order: order, public_path: `${SP}/${id}.jpg`, public_width: 900, public_height: 675, ...o });
const inat = (n) => ({ ...base, id: pid(100 + n), source: "inaturalist", source_id: String(9000 + n), source_url: `https://www.inaturalist.org/observations/${9000 + n}`, photographer: `Observer ${n}`, licence: "cc-by", licence_url: "https://creativecommons.org/licenses/by/4.0/", storage_path: `${SP}/inaturalist-${9000 + n}.jpg`, width: 500, height: 375, created_at: new Date(Date.parse("2026-10-01T00:00:00Z") + n * 60000).toISOString() });

const PHOTOS = () => [
  pub(P1, 0, { photographer: "First Keeper" }),
  pub(P2, 1, { licence: "cc0", photographer: "Second Keeper" }),
  upload(P3, { licence: "cc-by", licence_url: "https://creativecommons.org/licenses/by/4.0/", created_at: "2026-11-10T00:00:00Z" }),
  upload(SA, { licence: "cc-by-sa", licence_url: "https://creativecommons.org/licenses/by-sa/4.0/", created_at: "2026-11-10T01:00:00Z" }),
  upload(SMALL, { licence: "cc0", master_path: null, master_width: null, master_height: null, created_at: "2026-11-10T02:00:00Z" }),
  upload(HID, { status: "hidden" }),
  upload(REJ, { status: "rejected" }),
  ...Array.from({ length: 30 }, (_, i) => inat(i)),
];

let speciesDb;
let photoDb;
const toPhotos = (path) => /^\/rest\/v1\/(reference_photos|category_images)/.test(path) || path.startsWith("/storage/");
const supabaseFetch = (url, init) => (toPhotos(new URL(url).pathname) ? photoDb.fetch(url, init) : speciesDb.fetch(url, init));

const callHandler = async (handler, url, init = {}) => {
  const u = new URL(url, "http://localhost");
  const r = { headers: {}, statusCode: 200, body: null };
  r.setHeader = (k, v) => { r.headers[k] = v; };
  r.status = (c) => { r.statusCode = c; return r; };
  r.json = (b) => { r.body = b; return r; };
  const headers = Object.fromEntries(Object.entries(init.headers || {}).map(([k, v]) => [k.toLowerCase(), v]));
  await handler({ method: init.method || "GET", headers, query: Object.fromEntries(u.searchParams), body: init.body ? JSON.parse(init.body) : undefined }, r);
  return { ok: r.statusCode < 300, status: r.statusCode, json: async () => JSON.parse(JSON.stringify(r.body)), body: r.body };
};
const route = async (url, init) => {
  const s = String(url);
  if (s.startsWith(SUPABASE)) return supabaseFetch(s, init);
  if (s.startsWith("/api/admin-species")) return callHandler(speciesHandler, s, init);
  if (s.startsWith("/api/admin-photos")) return callHandler(photosHandler, s, init);
  if (s.startsWith("/api/species-photos")) return { ok: true, status: 200, json: async () => ({ photos: [], categories: [] }) };
  throw new Error(`unexpected ${url}`);
};
let router;

const savedEnv = { ...process.env };
const savedWidth = window.innerWidth;
beforeEach(() => {
  speciesDb = createFakeSpeciesDb({ docs: SNAPSHOT, testers: TESTERS });
  photoDb = createFakePhotoDb({ url: SUPABASE, photos: PHOTOS(), testers: TESTERS });
  for (const p of photoDb.photos) {
    photoDb.objects["reference-photos"][p.storage_path] = MEDIUM;
    if (p.master_path) photoDb.objects["reference-photos"][p.master_path] = MASTER;
    if (p.public_path) photoDb.objects["species-photos"][p.public_path] = MASTER;
  }
  clearTesterCache(); clearPhotoCache(); clearSpeciesContentCache(); clearCategoryImageCache();
  Object.assign(process.env, { SUPABASE_URL: SUPABASE, SUPABASE_SECRET_KEY: "sb_secret_test" });
  router = jest.fn(route);
  global.fetch = router;
  window.innerWidth = 1400; // the wide layout: form and preview side by side
  jest.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => { process.env = { ...savedEnv }; window.innerWidth = savedWidth; delete global.fetch; console.error.mockRestore(); });

const get = (query, code = ADMIN) => callHandler(photosHandler, `/api/admin-photos?${new URLSearchParams(query)}`, { headers: code ? { "x-atr-beta": code } : {} });

// ─── The paged list (GET /api/admin-photos ?filter) ───────────────
describe("GET /api/admin-photos with a filter", () => {
  test("public: the species-page photos in the app's order", async () => {
    const r = await get({ species: SP, filter: "public" });
    expect(r.status).toBe(200);
    expect(r.body.photos.map(p => p.id)).toEqual([P1, P2]);
    expect(r.body).toMatchObject({ filter: "public", offset: 0, limit: 24, hasMore: false });
    expect(r.body.photos[0].url).toMatch(/token=t/); // signed library URL
    expect(r.body.photos[0].publicUrl).toBe(`${SUPABASE}/storage/v1/object/public/species-photos/${SP}/${P1}.jpg`);
  });

  test("reference: active, not public, newest first, a page at a time", async () => {
    const first = await get({ species: SP, filter: "reference", limit: "10" });
    expect(first.body.photos).toHaveLength(10);
    expect(first.body.hasMore).toBe(true);
    expect(first.body.photos.slice(0, 3).map(p => p.id)).toEqual([SMALL, SA, P3]);
    expect(first.body.photos.every(p => p.status === "active" && !p.public_use)).toBe(true);
    const all = [];
    for (let offset = 0; ; offset += 10) {
      const page = await get({ species: SP, filter: "reference", limit: "10", offset: String(offset) });
      all.push(...page.body.photos.map(p => p.id));
      if (!page.body.hasMore) break;
    }
    expect(all).toHaveLength(33);
    expect(new Set(all).size).toBe(33);
  });

  test("hidden: hidden and rejected", async () => {
    const r = await get({ species: SP, filter: "hidden" });
    expect(r.body.photos.map(p => p.id).sort()).toEqual([HID, REJ].sort());
  });

  test("short and long reasons for photos that can't go public", async () => {
    const r = await get({ species: SP, filter: "reference", limit: "3" });
    const by = Object.fromEntries(r.body.photos.map(p => [p.id, p]));
    expect(by[SA].publicBlock).toBe(CC_BY_SA_REASON);
    expect(by[SA].publicBlockShort).toBe("CC BY-SA can't be used publicly.");
    expect(by[SMALL].publicBlockShort).toBe("Too small for public use (500 px; needs 800 px).");
    expect(by[P3].publicBlockShort).toBeNull();
  });

  test.each([
    [{ filter: "everything" }, /Filter must be/],
    [{ filter: "public", limit: "0" }, /Limit/],
    [{ filter: "public", limit: "101" }, /Limit/],
    [{ filter: "public", limit: "ten" }, /Limit/],
    [{ filter: "public", offset: "-1" }, /Offset/],
    [{ filter: "public", offset: "100001" }, /Offset/],
  ])("refuses %j", async (q, msg) => {
    const r = await get({ species: SP, ...q });
    expect(r.status).toBe(400);
    expect(r.body.error).toMatch(msg);
  });

  test("an unknown species is refused", async () => {
    expect((await get({ species: "not-a-species", filter: "public" })).status).toBe(400);
  });

  test("admin gate: the new params need an admin, and nothing is read without one", async () => {
    for (const code of [NOT_ADMIN, null, "short"]) {
      photoDb.calls.length = 0;
      const r = await get({ species: SP, filter: "reference", offset: "0", limit: "24" }, code);
      expect(r.status).toBe(403);
      expect(photoDb.calls.filter(c => c.table === "reference_photos" || c.path.startsWith("/storage/"))).toEqual([]);
    }
  });
});

// ─── Pure helpers ─────────────────────────────────────────────────
const row = (o) => ({ id: "x", status: "active", public_use: true, public_order: null, created_at: "2026-11-01", publicUrl: "https://p.test/x.jpg", public_width: 1024, public_height: 768, width: 500, height: 375, focal_x: 0.3, focal_y: 0.6, is_hero: false, hero_crop: null, credit: { show: true, name: "A" }, ...o });

describe("panel helpers", () => {
  test("reorder swaps neighbours and renumbers only what changes", () => {
    const list = [row({ id: "a", public_order: 0 }), row({ id: "b", public_order: 1 }), row({ id: "c", public_order: null })];
    // c had no number: it gets one, so the order is unambiguous from now on.
    expect(reorder(list, "b", -1)).toEqual([{ id: "b", public_order: 0 }, { id: "a", public_order: 1 }, { id: "c", public_order: 2 }]);
    expect(reorder(list, "c", -1)).toEqual([{ id: "c", public_order: 1 }, { id: "b", public_order: 2 }]);
    expect(reorder(list, "a", -1)).toEqual([]);
    expect(reorder(list, "c", 1)).toEqual([]);
  });

  test("previewPhotos: public and active only, in order, in the app's shape, with a live crop", () => {
    const list = [row({ id: "b", public_order: 1 }), row({ id: "a", public_order: 0, is_hero: true, replaced_at: "2026-11-10T00:00:00Z" }), row({ id: "off", public_use: false }), row({ id: "hid", status: "hidden" })];
    const out = previewPhotos(list, "Ackie Monitor", { id: "b", crop: { x: 0.1, y: 0, w: 0.7, h: 0.96 } });
    expect(out.map(p => p.id)).toEqual(["a", "b"]);
    expect(out[0]).toMatchObject({ hero: true, width: 1024, height: 768, focal: { x: 0.3, y: 0.6 }, heroCrop: null, alt: "Ackie Monitor, photo by A" });
    expect(out[0].url).toBe("https://p.test/x.jpg?v=2026-11-10T00%3A00%3A00Z");
    expect(out[1].heroCrop).toEqual({ x: 0.1, y: 0, w: 0.7, h: 0.96 });
    expect(toPreviewPhoto(row({ hero_crop: { x: 0, y: 0, w: 0.5, h: 0.6867 } }), "N").heroCrop).toEqual({ x: 0, y: 0, w: 0.5, h: 0.6867 });
  });
});

describe("the tall hero in the app", () => {
  const photo = (heroCrop) => ({ url: "u", width: 1024, height: 768, focal: { x: 0.3, y: 0.6 }, heroCrop });
  const tall = { x: 0.2, y: 0.1, w: 0.5, h: 0.6867 };
  const legacy = { x: 0, y: 0.2, w: 1, h: 0.5556 };

  test("a 100 : 103 crop fills the phone frame exactly", () => {
    expect(tallCropFor(photo(tall))).toEqual(tall);
    expect(tallImageStyle(photo(tall))).toEqual(heroImageStyle(tall));
    expect(tallImageStyle(photo(tall), TALL_ASPECT)).toMatchObject({ width: "200%", left: "-40%" });
  });

  test("an old 2.4 : 1 crop keeps today's framing: cover, on the crop's centre", () => {
    expect(tallCropFor(photo(legacy))).toBeNull();
    expect(tallImageStyle(photo(legacy))).toMatchObject({ objectFit: "cover", objectPosition: objectPosition({ x: 0.5, y: 0.4778 }) });
    expect(tallImageStyle(photo(null))).toMatchObject({ objectFit: "cover", objectPosition: "30% 60%" });
  });

  test("a wider frame (a tablet) shows the whole crop plus more photo either side, undistorted", () => {
    const r = coverRegion(tall, 4 / 3, 1.5);
    expect(r.h).toBeCloseTo(tall.h, 4);
    expect((r.w * (4 / 3)) / r.h).toBeCloseTo(1.5, 3);
    expect(r.x).toBeLessThanOrEqual(tall.x);
    expect(r.x + r.w).toBeGreaterThanOrEqual(tall.x + tall.w - 1e-9);
    // Wider than the photo allows: full width, trimmed top and bottom, still 2 : 1.
    const wide = coverRegion(tall, 4 / 3, 3);
    expect(wide.w).toBe(1);
    expect((wide.w * (4 / 3)) / wide.h).toBeCloseTo(3, 3);
  });
});

// ─── The panel in the editor ──────────────────────────────────────
const SPECIES = INDEX.filter(r => r.appSlug).map(r => ({ ...r }));
const BY_SLUG = Object.fromEntries(SPECIES.map(r => [r.slug, r]));
const COUNTS = { [SP]: { active: 35, hidden: 1, rejected: 1, best: 0 } };

const api = () => makeApi(ADMIN, () => {}, (...a) => router(...a));
const openEditor = async (refreshCounts = jest.fn()) => {
  render(<MemoryRouter initialEntries={[`/admin/content/${SP}`]}><Routes>
    <Route path="/admin/content/:slug" element={<SpeciesContentEditor api={api()} species={SPECIES} bySlug={BY_SLUG} counts={COUNTS} catalogue={[]} refreshCounts={refreshCounts} />} />
    <Route path="/admin/species/:slug" element={<div>LIBRARY</div>} />
  </Routes></MemoryRouter>);
  await screen.findByTestId("identity-form");
  await waitFor(() => expect(within(screen.getByTestId("public-photos")).getAllByTestId(/^public-photo-/)).toHaveLength(2));
  await waitFor(() => expect(within(screen.getByTestId("library-photos")).getAllByRole("button").length).toBeGreaterThan(0));
};
const panel = () => within(screen.getByTestId("photos-panel"));
const previewHero = () => within(screen.getByTestId("species-preview")).getByTestId("species-hero");
const previewSlides = () => [...previewHero().querySelectorAll("img")];
const publicIds = () => within(screen.getByTestId("public-photos")).getAllByTestId(/^public-photo-/).map(el => el.getAttribute("data-testid").replace("public-photo-", ""));

describe("Photos panel", () => {
  test("sits with the identity fields, says changes go live at once, and links to the library", async () => {
    await openEditor();
    expect(panel().getByTestId("photos-live-note")).toHaveTextContent("Photo changes go live straight away");
    expect(panel().getByTestId("photo-counts")).toHaveTextContent("2 on the species page · 33 reference · 2 hidden or rejected");
    expect(panel().getByRole("link", { name: "Photo library" })).toHaveAttribute("href", `/admin/species/${SP}`);
    // Identity first, then Photos, then the tabs.
    const labels = screen.getAllByText(/^(Identity|Photos|Tabs and blocks)$/).map(e => e.textContent);
    expect(labels).toEqual(["Identity", "Photos", "Tabs and blocks"]);
  });

  test("the preview shows the panel's photos: no hero ticked → the first in order", async () => {
    await openEditor();
    await waitFor(() => expect(previewSlides()).toHaveLength(2));
    expect(previewSlides()[0].getAttribute("src")).toContain(`${P1}.jpg`);
    expect(screen.getByTestId("hero-status")).toHaveTextContent("No hero chosen");
    // The preview never asked the public endpoint (edge-cached, so stale): it's fed from the panel.
    expect(router.mock.calls.some(([u]) => String(u).startsWith("/api/species-photos?species="))).toBe(false);
  });

  test("one hero per species: ticking another moves it, in the database, the panel and the preview", async () => {
    await openEditor();
    const heroBox = (id) => within(screen.getByTestId(`public-photo-${id}`)).getByRole("checkbox", { name: "Hero (main image)" });
    fireEvent.click(heroBox(P1));
    await waitFor(() => expect(photoDb.photo(P1).is_hero).toBe(true));
    await waitFor(() => expect(heroBox(P1)).toBeChecked());
    fireEvent.click(heroBox(P2));
    await waitFor(() => expect(heroBox(P2)).toBeChecked());
    expect(heroBox(P1)).not.toBeChecked();
    expect(photoDb.photos.filter(p => p.is_hero).map(p => p.id)).toEqual([P2]);
    expect(within(screen.getByTestId(`public-photo-${P2}`)).getByText("Hero")).toBeInTheDocument();
    expect(within(screen.getByTestId(`public-photo-${P1}`)).queryByText("Hero")).toBeNull();
    await waitFor(() => expect(previewSlides()[0].getAttribute("src")).toContain(`${P2}.jpg`));
  });

  test("order: up and down renumber the page's photos, and the preview follows", async () => {
    await openEditor();
    expect(publicIds()).toEqual([P1, P2]);
    expect(panel().getByRole("button", { name: "Move photo 1 up" })).toBeDisabled();
    fireEvent.click(panel().getByRole("button", { name: "Move photo 2 up" }));
    await waitFor(() => expect(publicIds()).toEqual([P2, P1]));
    await waitFor(() => expect(photoDb.photo(P1).public_order).toBe(1));
    expect(photoDb.photo(P2).public_order).toBe(0);
    await waitFor(() => expect(previewSlides()[0].getAttribute("src")).toContain(`${P2}.jpg`));
  });

  test("CC BY-SA and too-small photos can't go public, with the short and full reasons", async () => {
    await openEditor();
    const sa = panel().getByTestId(`library-photo-${SA}`);
    expect(within(sa).getByTestId("block-reason")).toHaveTextContent("CC BY-SA can't be used publicly.");
    expect(within(panel().getByTestId(`library-photo-${SMALL}`)).getByTestId("block-reason")).toHaveTextContent("Too small for public use");
    expect(within(panel().getByTestId(`library-photo-${P3}`)).queryByTestId("block-reason")).toBeNull();
    fireEvent.click(sa);
    expect(await panel().findByText(CC_BY_SA_REASON)).toBeInTheDocument();
    const card = within(panel().getByTestId(`photo-card-${SA}`));
    expect(card.getByRole("switch", { name: "Use on species page" })).toBeDisabled();
    expect(card.getByRole("checkbox", { name: "Hero (main image)" })).toBeDisabled();
    expect(photoDb.photo(SA).public_use).toBe(false);
  });

  test("making a reference photo public moves it to the species page list and the preview", async () => {
    await openEditor();
    fireEvent.click(panel().getByTestId(`library-photo-${P3}`));
    fireEvent.click(await panel().findByRole("switch", { name: "Use on species page" }));
    await waitFor(() => expect(publicIds()).toEqual([P1, P2, P3]));
    expect(photoDb.photo(P3).public_use).toBe(true);
    expect(photoDb.objects["species-photos"][`${SP}/${P3}.jpg`]).toBeDefined();
    await waitFor(() => expect(previewSlides()).toHaveLength(3));
  });

  test("filters and paging: reference first, then more; hidden on its own", async () => {
    await openEditor();
    const lib = () => within(screen.getByTestId("library-photos"));
    expect(lib().getAllByTestId(/^library-photo-/)).toHaveLength(24);
    fireEvent.click(panel().getByRole("button", { name: "Show more" }));
    await waitFor(() => expect(lib().getAllByTestId(/^library-photo-/)).toHaveLength(33));
    expect(panel().queryByRole("button", { name: "Show more" })).toBeNull();
    fireEvent.click(panel().getByRole("button", { name: "Hidden" }));
    await waitFor(() => expect(lib().getAllByTestId(/^library-photo-/).map(b => b.getAttribute("data-testid"))).toEqual(expect.arrayContaining([`library-photo-${HID}`, `library-photo-${REJ}`])));
    expect(lib().getAllByTestId(/^library-photo-/)).toHaveLength(2);
    fireEvent.click(panel().getByRole("button", { name: "Public" }));
    await waitFor(() => expect(lib().getAllByTestId(/^library-photo-/)).toHaveLength(2));
    expect(panel().getByRole("button", { name: "Public" })).toHaveAttribute("aria-pressed", "true");
  });

  test("upload: resized in the browser, credit captured, filed under this species, opened in the panel", async () => {
    toLibraryJpegs.mockResolvedValue({
      reference: { dataUrl: dataUrl(MEDIUM), width: 500, height: 375, bytes: MEDIUM.length },
      master: { dataUrl: dataUrl(MASTER), width: 900, height: 675, bytes: MASTER.length },
    });
    const refreshCounts = jest.fn();
    await openEditor(refreshCounts);
    fireEvent.click(panel().getByRole("button", { name: "+ Upload photo" }));
    const form = within(screen.getByTestId("add-photo-form"));
    expect(form.queryByText("Species")).toBeNull(); // filed under this species, no picker
    // Required credit fields first.
    fireEvent.click(form.getByRole("button", { name: "Upload" }));
    expect(await form.findByText("Choose a photo.")).toBeInTheDocument();
    expect(form.getByText("Photographer is required.")).toBeInTheDocument();
    const file = new File([MEDIUM], "ackie.jpg", { type: "image/jpeg" });
    await act(async () => { fireEvent.change(form.getByLabelText("Photo file"), { target: { files: [file] } }); });
    expect(toLibraryJpegs).toHaveBeenCalledWith(file);
    expect(await form.findByText(/larger copy 900×675/)).toBeInTheDocument();
    fireEvent.change(form.getByLabelText(/Photographer/), { target: { value: "Jo Keeper" } });
    fireEvent.click(form.getByRole("button", { name: "CC BY" }));
    fireEvent.change(form.getByLabelText("Source URL"), { target: { value: "https://example.org/ackie" } });
    const before = photoDb.photos.length;
    fireEvent.click(form.getByRole("button", { name: "Upload" }));
    await waitFor(() => expect(photoDb.photos.length).toBe(before + 1));
    const added = photoDb.photos[photoDb.photos.length - 1];
    expect(added).toMatchObject({ species_slug: SP, source: "admin_upload", photographer: "Jo Keeper", licence: "cc-by", source_url: "https://example.org/ackie", master_width: 900, public_use: false, added_by: "Rowan" });
    expect(photoDb.objects["reference-photos"][added.storage_path]).toBeDefined();
    expect(await panel().findByText(/Uploaded to the library as a reference photo/)).toBeInTheDocument();
    expect(screen.queryByTestId("add-photo-form")).toBeNull();
    expect(panel().getByTestId(`library-photo-${added.id}`)).toHaveAttribute("aria-expanded", "true");
    expect(refreshCounts).toHaveBeenCalled();
  });

  test("hero crop at the tall aspect: the preview follows the box before saving; the server takes it", async () => {
    await openEditor();
    await waitFor(() => expect(previewSlides()).toHaveLength(2));
    fireEvent.click(within(screen.getByTestId(`public-photo-${P1}`)).getByRole("button", { name: "Edit" }));
    fireEvent.click(await panel().findByRole("button", { name: "Hero crop" }));
    const box = panel().getByTestId("hero-crop-box");
    // 4:3 photo: the widest 100 : 103 crop is 72.82% wide, centred.
    expect(box.style).toMatchObject({ width: "72.82%", left: "13.59%", height: "100%" });
    expect(previewSlides()[0].style.objectFit).toBe("");
    expect(previewSlides()[0].style.width).toBe("137.32%"); // the crop fills the 100 : 103 frame (1 / 0.7282)
    fireEvent.change(panel().getByRole("slider", { name: "Zoom" }), { target: { value: "1" } }); // 30% wide
    fireEvent.keyDown(box, { key: "ArrowLeft" });
    await waitFor(() => expect(previewSlides()[0].style.width).toBe("333.33%"));
    const left = previewSlides()[0].style.left;
    expect(left).not.toBe("");
    fireEvent.click(panel().getByRole("button", { name: "Save hero crop" }));
    await waitFor(() => expect(photoDb.photo(P1).hero_crop).not.toBeNull());
    const saved = photoDb.photo(P1).hero_crop;
    expect(saved.w).toBe(0.3);
    expect((saved.w * (900 / 675)) / saved.h).toBeCloseTo(100 / 103, 2);
    // Saved and closed: the preview keeps the saved crop.
    await waitFor(() => expect(panel().queryByTestId("hero-crop-box")).toBeNull());
    expect(previewSlides()[0].style.width).toBe("333.33%");
    expect(previewSlides()[0].style.left).toBe(left);
  });

  test("cancelling a crop puts the preview back", async () => {
    await openEditor();
    await waitFor(() => expect(previewSlides()).toHaveLength(2));
    expect(previewSlides()[0].style).toMatchObject({ objectFit: "cover", width: "100%" });
    fireEvent.click(within(screen.getByTestId(`public-photo-${P1}`)).getByRole("button", { name: "Edit" }));
    fireEvent.click(await panel().findByRole("button", { name: "Hero crop" }));
    fireEvent.change(panel().getByRole("slider", { name: "Zoom" }), { target: { value: "1" } });
    await waitFor(() => expect(previewSlides()[0].style.width).toBe("333.33%"));
    fireEvent.click(within(panel().getByTestId("hero-crop-editor")).getByRole("button", { name: "Cancel" }));
    await waitFor(() => expect(previewSlides()[0].style).toMatchObject({ objectFit: "cover", width: "100%" }));
    expect(photoDb.photo(P1).hero_crop).toBeNull();
  });
});

  test("the crop box shades where the pills and name sit, and the preview draws this species' real pills and name at 320 or 390", async () => {
    await openEditor();
    await waitFor(() => expect(previewSlides()).toHaveLength(2));
    fireEvent.click(within(screen.getByTestId(`public-photo-${P1}`)).getByRole("button", { name: "Edit" }));
    fireEvent.click(await panel().findByRole("button", { name: "Hero crop" }));
    const band = panel().getByTestId("hero-crop-text-band");
    expect(within(panel().getByTestId("hero-crop-box")).getByTestId("hero-crop-text-band")).toBe(band);
    expect(parseFloat(band.style.height)).toBeGreaterThan(20); // a share of the hero, from the bottom
    const editor = within(panel().getByTestId("hero-crop-editor"));
    const preview = editor.getByTestId("tall-hero-preview");
    expect(preview.style.maxWidth).toBe("320px"); // smallest phone first
    expect(within(preview).getByRole("heading", { name: "Ackie Monitor" })).toBeInTheDocument();
    expect(within(preview).getByTestId("species-badges")).toHaveTextContent(/Intermediate/i);
    expect(within(preview).getByText("Varanus acanthurus")).toBeInTheDocument();
    fireEvent.click(editor.getByTestId("hero-crop-preview-390"));
    expect(editor.getByTestId("tall-hero-preview").style.maxWidth).toBe("390px");
  });

// ─── The photo library links to the editor ────────────────────────
describe("photo library", () => {
  test("each app species' row links to Edit in Species editor; others don't", () => {
    const species = [
      { slug: "ackie-monitor", common: "Ackie Monitor", scientific: "Varanus acanthurus", group: "monitor", appSlug: "ackie-monitor", otherCommon: [] },
      { slug: "garden-skink", common: "Garden Skink", scientific: "Lampropholis guichenoti", group: "skink", appSlug: null, otherCommon: [] },
    ];
    render(<MemoryRouter><LibraryScreen species={species} counts={{}} /></MemoryRouter>);
    expect(screen.getByRole("link", { name: "Edit Ackie Monitor in the Species editor" })).toHaveAttribute("href", "/admin/content/ackie-monitor");
    expect(screen.queryByTestId("edit-in-editor-garden-skink")).toBeNull();
    expect(screen.getByRole("button", { name: /Garden Skink/ })).toBeInTheDocument();
  });
});
