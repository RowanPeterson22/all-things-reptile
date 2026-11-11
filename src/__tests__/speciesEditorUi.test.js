// /admin → Species (D5 step 2), the editor UI: add, move and delete blocks
// (in-page confirmation), tab rules, the licence rows (TAS lock, class codes),
// a monitor's basking banner, the live preview fed the unsaved draft, saving
// and the conflict banner. The admin API is the real handler
// (api/admin-species) over the in-memory Supabase double, never the real
// database. Also Browse and Search reading the published names.
import { render, screen, fireEvent, waitFor, within, act } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { SpeciesContentEditor, SpeciesContentList } from "../admin/SpeciesContentScreen";
import { makeApi } from "../admin/api";
import BrowseScreen from "../screens/BrowseScreen";
import SearchResults from "../screens/SearchResults";
import { clearSpeciesContentCache, mergeSpeciesList, BUNDLED_SPECIES } from "../data/speciesContent";
import { clearPhotoCache } from "../components/SpeciesGallery";
import { clearCategoryImageCache } from "../components/CategoryImage";
import { STORAGE_KEY } from "../beta/betaAccess";

const handler = require("../../api/admin-species");
const { createFakeSpeciesDb } = require("../testUtils/fakeSpeciesDb");
const { clearTesterCache } = require("../../lib/beta");
const SNAPSHOT = require("../data/speciesContent.json");

const ADMIN = "A".repeat(43);
const SUPABASE = "https://fake-atr.supabase.co";
let db;

// The browser's fetch: admin routes run the real handler; Supabase calls go
// to the double; photo requests get none.
const callHandler = async (url, init = {}) => {
  const u = new URL(url, "http://localhost");
  const r = { headers: {}, statusCode: 200, body: null };
  r.setHeader = (k, v) => { r.headers[k] = v; };
  r.status = (c) => { r.statusCode = c; return r; };
  r.json = (b) => { r.body = b; return r; };
  const headers = Object.fromEntries(Object.entries(init.headers || {}).map(([k, v]) => [k.toLowerCase(), v]));
  await handler({ method: init.method || "GET", headers, query: Object.fromEntries(u.searchParams), body: init.body ? JSON.parse(init.body) : undefined }, r);
  return { ok: r.statusCode < 300, status: r.statusCode, json: async () => JSON.parse(JSON.stringify(r.body)) };
};
const route = async (url, init) => {
  if (String(url).startsWith(SUPABASE)) return db.fetch(url, init);
  if (String(url).startsWith("/api/admin-species")) return callHandler(url, init);
  if (String(url).startsWith("/api/species-photos")) return { ok: true, status: 200, json: async () => ({ photos: [], categories: [] }) };
  throw new Error(`unexpected ${url}`);
};
let router; // a fresh jest.fn per test (CRA resets mock implementations)

const savedEnv = { ...process.env };
beforeEach(() => {
  db = createFakeSpeciesDb({ docs: SNAPSHOT, testers: [{ id: "aaaaaaaa-0000-4000-8000-000000000001", name: "Rowan", active: true, is_admin: true, invite_code: ADMIN }] });
  clearTesterCache(); clearPhotoCache(); clearSpeciesContentCache(); clearCategoryImageCache();
  window.localStorage.clear();
  Object.assign(process.env, { SUPABASE_URL: SUPABASE, SUPABASE_SECRET_KEY: "sb_secret_test" });
  router = jest.fn(route);
  global.fetch = router;
  jest.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => { process.env = { ...savedEnv }; delete global.fetch; console.error.mockRestore(); });

const api = () => makeApi(ADMIN, () => {}, (...a) => router(...a));
const openEditor = async (slug) => {
  render(<MemoryRouter initialEntries={[`/admin/content/${slug}`]}><Routes>
    <Route path="/admin/content/:slug" element={<SpeciesContentEditor api={api()} />} />
    <Route path="/admin/content" element={<div>LIST</div>} />
  </Routes></MemoryRouter>);
  await screen.findByTestId("identity-form");
};
const blockTypes = () => within(screen.getByTestId("block-list")).getAllByTestId("block").filter(b => !b.parentElement.closest('[data-testid="nested-blocks"]')).map(b => b.getAttribute("data-type"));
const tab = (name) => fireEvent.click(screen.getByRole("tab", { name }));
const bar = () => within(screen.getByTestId("save-bar"));

describe("the species list", () => {
  test("shows every species with its state, and filters by search and category", async () => {
    render(<MemoryRouter><SpeciesContentList api={api()} /></MemoryRouter>);
    const list = await screen.findByTestId("species-content-list");
    expect(within(list).getAllByRole("link")).toHaveLength(46);
    expect(within(screen.getByTestId("species-row-carpet-python")).getByText("Published")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Monitors" }));
    expect(within(list).getAllByRole("link")).toHaveLength(6);
    fireEvent.change(screen.getByRole("searchbox", { name: "Search species" }), { target: { value: "varanus varius" } });
    expect(within(list).getAllByRole("link").map(a => a.textContent)).toEqual([expect.stringContaining("Lace Monitor")]);
  });
});

describe("blocks", () => {
  test("add a block of a chosen type; it shows in the preview as you type", async () => {
    await openEditor("carpet-python");
    const before = blockTypes().length;
    fireEvent.change(screen.getByLabelText("Add a block"), { target: { value: "label" } });
    fireEvent.click(screen.getByRole("button", { name: "Add" }));
    expect(blockTypes()).toHaveLength(before + 1);
    expect(blockTypes()[before]).toBe("label");
    // An empty heading is a problem, flagged next to the field and in the bar.
    expect(screen.getAllByText("Required.").length).toBeGreaterThan(0);
    expect(bar().getByRole("button", { name: "Save draft" })).toBeDisabled();
    const headings = screen.getAllByLabelText("Heading");
    fireEvent.change(headings[headings.length - 1], { target: { value: "Fresh heading from admin" } });
    fireEvent.click(bar().getByRole("button", { name: "Preview" }));
    expect(within(screen.getByTestId("species-preview")).getByText("Fresh heading from admin")).toBeInTheDocument();
    expect(bar().getByRole("button", { name: "Save draft" })).toBeEnabled();
  });

  test("move a block up and down", async () => {
    await openEditor("carpet-python");
    const start = blockTypes();
    fireEvent.click(screen.getByRole("button", { name: `Move Quick stats ${start.indexOf("stats") + 1} up` }));
    const moved = blockTypes();
    const i = start.indexOf("stats");
    expect(moved[i - 1]).toBe("stats");
    expect(moved[i]).toBe(start[i - 1]);
    fireEvent.click(screen.getByRole("button", { name: `Move Quick stats ${i} down` }));
    expect(blockTypes()).toEqual(start);
  });

  test("delete asks in the page first (never confirm()), and Cancel keeps the block", async () => {
    const confirmSpy = jest.spyOn(window, "confirm").mockImplementation(() => true);
    await openEditor("carpet-python");
    const start = blockTypes();
    fireEvent.click(screen.getAllByRole("button", { name: /^Delete Paragraph/ })[0]);
    const dialog = screen.getByRole("alertdialog");
    fireEvent.click(within(dialog).getByRole("button", { name: "Cancel" }));
    expect(blockTypes()).toEqual(start);
    fireEvent.click(screen.getAllByRole("button", { name: /^Delete Paragraph/ })[0]);
    fireEvent.click(within(screen.getByRole("alertdialog")).getByRole("button", { name: "Delete block" }));
    expect(blockTypes()).toHaveLength(start.length - 1);
    expect(confirmSpy).not.toHaveBeenCalled();
    confirmSpy.mockRestore();
    expect(screen.getByTestId("editor-state")).toHaveTextContent("Unsaved changes");
  });

  test("a monitor's basking banner can't be deleted; non-monitors can't add one", async () => {
    await openEditor("ackie-monitor");
    const basking = screen.getAllByTestId("block").find(b => b.getAttribute("data-type") === "basking");
    expect(within(basking).queryByRole("button", { name: /^Delete/ })).toBeNull();
    expect(within(basking).getByText(/Monitors need the basking banner/)).toBeInTheDocument();
    expect(within(screen.getByLabelText("Add a block")).getByRole("option", { name: "Basking banner" })).toBeInTheDocument();
    expect(within(screen.getByLabelText("Add a block")).queryByRole("option", { name: "Licence grid" })).toBeNull();
  });

  test("non-monitors get no basking banner in the picker", async () => {
    await openEditor("carpet-python");
    expect(within(screen.getByLabelText("Add a block")).queryByRole("option", { name: "Basking banner" })).toBeNull();
  });
});

describe("tabs", () => {
  test("the licence tab can't be renamed or deleted; a monitor's first tab stays first", async () => {
    await openEditor("ackie-monitor");
    expect(screen.getByRole("button", { name: "Move tab left" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Move tab right" })).toBeDisabled();
    expect(screen.queryByRole("button", { name: "Delete tab" })).toBeNull();
    tab("Licence");
    expect(screen.queryByRole("button", { name: "Rename" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Delete tab" })).toBeNull();
    expect(screen.queryByRole("button", { name: /^Delete Licence grid/ })).toBeNull();
  });

  test("add, rename and move a tab; the preview follows", async () => {
    await openEditor("carpet-python");
    fireEvent.click(screen.getByRole("button", { name: "+ Add tab" }));
    expect(screen.getByRole("tab", { name: "New tab", selected: true })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Rename" }));
    fireEvent.change(screen.getByLabelText("Tab name"), { target: { value: "Feeding" } });
    expect(screen.getByText("Another tab already has that name.")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Tab name"), { target: { value: "Enclosure Setup" } });
    fireEvent.click(screen.getAllByRole("button", { name: "Rename" }).pop());
    expect(screen.getByRole("tab", { name: "Enclosure setup" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Move tab left" }));
    const names = screen.getAllByRole("tab").map(t => t.textContent);
    expect(names.indexOf("Enclosure setup")).toBe(names.indexOf("Licence") - 2);
    fireEvent.click(bar().getByRole("button", { name: "Preview" }));
    const preview = within(screen.getByTestId("species-tabs"));
    expect(preview.getByRole("button", { name: "Enclosure setup" })).toHaveAttribute("aria-pressed", "true");
  });
});

describe("the licence block", () => {
  test("eight rows in order; TAS locked red for a mainland species; class codes flagged and unsaveable", async () => {
    await openEditor("carpet-python");
    tab("Licence");
    const form = screen.getByTestId("licence-form");
    expect(within(form).getByText(/Never species class codes/)).toBeInTheDocument();
    expect(within(form).getAllByTestId(/^licence-row-/).map(r => r.getAttribute("data-testid").slice(12))).toEqual(["NSW", "VIC", "QLD", "SA", "WA", "TAS", "ACT", "NT"]);
    const tas = screen.getByTestId("licence-row-TAS");
    expect(within(tas).getByTestId("tas-locked")).toBeInTheDocument();
    expect(within(tas).getByText("Not permitted")).toBeInTheDocument();
    expect(screen.queryByTestId("licence-name-TAS")).toBeNull();
    expect(screen.queryByTestId("licence-ok-TAS")).toBeNull();

    fireEvent.change(screen.getByTestId("licence-name-NSW"), { target: { value: "R2 licence" } });
    expect(within(screen.getByTestId("licence-row-NSW")).getByRole("alert")).toHaveTextContent(/looks like a species class code/);
    expect(bar().getByRole("button", { name: "Save draft" })).toBeDisabled();
    expect(bar().getByRole("button", { name: "Publish" })).toBeDisabled();
    fireEvent.change(screen.getByTestId("licence-name-NSW"), { target: { value: "Companion or Class 1 licence" } });
    expect(within(screen.getByTestId("licence-row-NSW")).queryByRole("alert")).toBeNull();

    fireEvent.click(screen.getByTestId("licence-confirm-QLD"));
    expect(within(screen.getByTestId("licence-row-QLD")).getByText(/Shows as: Standard licence · confirm with authority/)).toBeInTheDocument();
  });

  test("the Blotched Blue-tongue (a TAS native) can edit its TAS row", async () => {
    await openEditor("blotched-blue-tongue-skink");
    tab("Licence");
    expect(screen.getByTestId("licence-name-TAS")).toHaveValue("Herpetofauna permit");
    expect(screen.getByTestId("licence-ok-TAS")).toBeChecked();
  });
});

describe("the live preview", () => {
  test("renders the real species page with the unsaved draft, and follows the tab", async () => {
    await openEditor("carpet-python");
    fireEvent.change(screen.getByTestId("name-field"), { target: { value: "Carpet Python (draft name)" } });
    fireEvent.click(bar().getByRole("button", { name: "Preview" }));
    const preview = within(screen.getByTestId("species-preview"));
    expect(preview.getByRole("heading", { name: "Carpet Python (draft name)" })).toBeInTheDocument();
    // Its own tabs switch, as on the phone.
    fireEvent.click(preview.getByRole("button", { name: "Licence" }));
    expect(preview.getByText("Always verify before purchasing")).toBeInTheDocument();
    // Never asks the server for the published document: it shows the draft.
    expect(router.mock.calls.some(c => String(c[0]).includes("content="))).toBe(false);
  });
});

describe("saving", () => {
  test("Save draft sends the draft with the version it was based on; the app's copy is unchanged", async () => {
    await openEditor("carpet-python");
    const opened = db.row("carpet-python").updated_at;
    fireEvent.change(screen.getByTestId("name-field"), { target: { value: "Carpet Python (saved)" } });
    fireEvent.click(bar().getByRole("button", { name: "Save draft" }));
    await waitFor(() => expect(db.row("carpet-python").draft.name).toBe("Carpet Python (saved)"));
    const post = router.mock.calls.find(c => String(c[0]).startsWith("/api/admin-species") && c[1] && c[1].method === "POST");
    expect(JSON.parse(post[1].body)).toMatchObject({ action: "save", slug: "carpet-python", expectedUpdatedAt: opened });
    expect(post[1].headers["x-atr-beta"]).toBe(ADMIN);
    expect(db.row("carpet-python").published.name).toBe("Carpet Python");
    expect(await screen.findByTestId("editor-state")).toHaveTextContent("Unpublished changes");
    expect(db.row("carpet-python").updated_by).toBe("Rowan");
  });

  test("Publish confirms in the page, then the app's copy changes", async () => {
    await openEditor("carpet-python");
    fireEvent.change(screen.getByTestId("name-field"), { target: { value: "Carpet Python (live)" } });
    fireEvent.click(bar().getByRole("button", { name: "Publish" }));
    fireEvent.click(within(screen.getByRole("alertdialog")).getByRole("button", { name: "Publish now" }));
    await waitFor(() => expect(db.row("carpet-python").published.name).toBe("Carpet Python (live)"));
    expect(await screen.findByText(/Published\. The app shows it within about a minute/)).toBeInTheDocument();
    expect(screen.getByTestId("publish-line")).toHaveTextContent(/Published just now by Rowan/);
  });

  test("a change made elsewhere meanwhile: refused, with a reload banner", async () => {
    await openEditor("carpet-python");
    // Another tab saves first.
    db.row("carpet-python").draft.latin = "Changed elsewhere";
    db.row("carpet-python").updated_at = "2026-11-11T11:11:11+00:00";
    fireEvent.change(screen.getByTestId("name-field"), { target: { value: "Mine" } });
    fireEvent.click(bar().getByRole("button", { name: "Save draft" }));
    expect(await screen.findByText(/Someone changed this species in another tab/)).toBeInTheDocument();
    expect(db.row("carpet-python").draft.name).toBe("Carpet Python");
    fireEvent.click(screen.getByRole("button", { name: /Reload the latest/ }));
    await waitFor(() => expect(screen.getByLabelText("Latin name")).toHaveValue("Changed elsewhere"));
  });

  test("revisions list who and when, summarise the text differences, and load into the draft", async () => {
    // A second published version, then open the editor.
    const row = db.row("carpet-python");
    row.draft = { ...row.draft, tabs: row.draft.tabs.map((t, i) => (i === 0 ? { ...t, blocks: t.blocks.map((b, j) => (j === 0 ? { ...b, text: "Newer intro." } : b)) } : t)) };
    row.updated_at = "2026-11-11T09:30:00+00:00";
    row.published = row.draft; row.published_at = "2026-11-11T09:31:00+00:00"; row.published_by = "Rowan";
    db.revisions.push({ id: 500, slug: "carpet-python", doc: row.draft, published_at: row.published_at, published_by: "Rowan" });
    await openEditor("carpet-python");
    const revs = screen.getByTestId("revisions");
    const old = within(revs).getAllByTestId(/^revision-\d+$/).find(r => r.getAttribute("data-testid") !== "revision-500");
    expect(within(screen.getByTestId("revision-500")).getByText("Live now")).toBeInTheDocument();
    expect(within(screen.getByTestId("revision-500")).getByText("Same as your draft.")).toBeInTheDocument();
    expect(within(old).getByTestId("revision-summary")).toHaveTextContent(/1 passage only in this version, 1 only in your draft/);
    expect(within(old).getByTestId("revision-summary")).toHaveTextContent(/Overview › Paragraph/);
    fireEvent.click(within(old).getByRole("button", { name: "Load into draft" }));
    fireEvent.click(within(within(old).getByRole("alertdialog")).getByRole("button", { name: "Load into draft" }));
    await waitFor(() => expect(db.row("carpet-python").draft.tabs[0].blocks[0].text).toMatch(/Australia's most widely kept python/));
    expect(db.row("carpet-python").published.tabs[0].blocks[0].text).toBe("Newer intro.");
  });
});

describe("Browse and Search read the published names (D5)", () => {
  const listFetch = (rename) => jest.fn(async (url) => {
    if (String(url) === "/api/species-photos?contentList=1") {
      const species = SNAPSHOT.map(d => ({ slug: d.slug, id: d.id, name: d.slug === "carpet-python" ? rename : d.name, latin: d.latin, aka: d.aka, type: d.type, level: d.level, emoji: d.emoji, sortOrder: d.sortOrder }));
      return { ok: true, status: 200, json: async () => ({ species }) };
    }
    return { ok: true, status: 200, json: async () => ({ photos: [], categories: [] }) };
  });

  test("Browse shows the published name once it arrives", async () => {
    window.localStorage.setItem(STORAGE_KEY, "k".repeat(43));
    global.fetch = listFetch("Carpet Python (published name)");
    render(<MemoryRouter><BrowseScreen onSpecies={() => {}} live /></MemoryRouter>);
    fireEvent.click(screen.getByText("Pythons & Snakes"));
    expect(await screen.findByText("Carpet Python (published name)")).toBeInTheDocument();
    const call = global.fetch.mock.calls.find(c => c[0] === "/api/species-photos?contentList=1");
    expect(call[1].headers["x-atr-beta"]).toBe("k".repeat(43));
  });

  test("Search finds a species by its published name", async () => {
    global.fetch = listFetch("Morelia Showcase Python");
    render(<MemoryRouter><SearchResults query="showcase" onNavigate={() => {}} live /></MemoryRouter>);
    expect(await screen.findByText("Morelia Showcase Python")).toBeInTheDocument();
  });

  test("not live (a gated visitor with no pass): the snapshot, and no request", async () => {
    global.fetch = listFetch("Should not appear");
    render(<MemoryRouter><SearchResults query="carpet" onNavigate={() => {}} /></MemoryRouter>);
    await act(async () => { await Promise.resolve(); });
    expect(screen.getAllByText("Carpet Python").length).toBeGreaterThan(0);
    expect(global.fetch.mock.calls.some(c => String(c[0]).includes("contentList"))).toBe(false);
  });

  test("the merge never adds species or moves a category", () => {
    const merged = mergeSpeciesList([
      { slug: "carpet-python", name: "Renamed", latin: "X", level: "Advanced", type: "lizard", sortOrder: 0 },
      { slug: "leopard-gecko", name: "Leopard Gecko", latin: "Eublepharis macularius", level: "Beginner", type: "gecko", sortOrder: 1 },
    ]);
    expect(merged).toHaveLength(46);
    expect(merged.map(s => s.slug)).not.toContain("leopard-gecko");
    const carpet = merged.find(s => s.slug === "carpet-python");
    expect(carpet).toMatchObject({ name: "Renamed", level: "Advanced", type: "snake" });
    expect(merged.slice(0, 2).map(s => s.slug)).toEqual(["eastern-blue-tongue-skink", "carpet-python"]);
    expect(mergeSpeciesList(null)).toEqual(BUNDLED_SPECIES);
  });
});
