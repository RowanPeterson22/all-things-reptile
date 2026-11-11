// Front end of the admin section: /admin only opens for a verified admin code,
// shows no tab, and the add-photo form enforces the licence rules.
import { render, screen, act, fireEvent, waitFor, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AppShell } from "../App";
import { clearCategoryImageCache } from "../components/CategoryImage";
import { expectOnlyPublicRequests } from "../testUtils/publicFetch";
import { STORAGE_KEY } from "../beta/betaAccess";
import { checkAdmin } from "../beta/adminAccess";
import { validateAddForm } from "../admin/AddPhotoScreen";
import { filterSpecies, searchText } from "../admin/species";
import { makeApi } from "../admin/api";

const CODE = "c".repeat(43);
const ok = (body) => ({ ok: true, status: 200, json: async () => body });
const SPECIES = [
  { slug: "central-bearded-dragon", common: "Central Bearded Dragon", scientific: "Pogona vitticeps", group: "dragon", family: "Agamidae", appSlug: "central-bearded-dragon", otherCommon: [], keepable: {}, keepableConfidence: {} },
  { slug: "garden-skink", common: "Garden Skink", scientific: "Lampropholis guichenoti", group: "skink", family: "Scincidae", appSlug: null, otherCommon: ["Grass Skink"], keepable: {}, keepableConfidence: {} },
  { slug: "carpet-python", common: "Carpet Python", scientific: "Morelia spilota", group: "python", family: "Pythonidae", appSlug: "carpet-python", otherCommon: [], synonyms: ["Python spilota"], keepable: {}, keepableConfidence: {} },
];

// Routes the app's API calls: beta-check (tester ok), admin-check (as given), admin-species.
const api = ({ admin }) => jest.fn(async (url) => {
  if (url === "/api/beta-check") return ok({ ok: true, name: "Rowan Peterson", traits: {}, sections: ["id", "species", "care", "licensing", "glossary", "search", "credits"], isAdmin: Boolean(admin) });
  if (url === "/api/admin-check") return admin ? ok({ ok: true, id: "id-1", name: "Rowan Peterson" }) : { ok: false, status: 403, json: async () => ({ error: "nope" }) };
  if (url.startsWith("/api/admin-species")) return ok({ species: SPECIES, counts: { "carpet-python": { active: 12, hidden: 1, rejected: 0, best: 1 } }, morphs: [], morphSource: "db" });
  throw new Error(`unexpected ${url}`);
});

const renderAt = async (path) => {
  jest.useFakeTimers();
  const utils = render(<MemoryRouter initialEntries={[path]}><AppShell /></MemoryRouter>);
  await act(async () => { jest.advanceTimersByTime(5000); });
  jest.useRealTimers();
  await act(async () => { await Promise.resolve(); });
  return utils;
};
const urls = () => global.fetch.mock.calls.map(c => c[0]);

beforeEach(() => { clearCategoryImageCache(); window.localStorage.clear(); global.fetch = jest.fn(); });
afterEach(() => { delete global.fetch; });

describe("/admin gate", () => {
  test("no code: /admin goes home without asking the server", async () => {
    await renderAt("/admin");
    expect(screen.queryByText("ATR Admin")).toBeNull();
    expect(screen.getByTestId("home")).toBeInTheDocument();
    // Only the public layout (a plain GET); no admin-check, no invite header.
    expectOnlyPublicRequests();
  });

  test("a tester who isn't an admin is sent home", async () => {
    window.localStorage.setItem(STORAGE_KEY, CODE);
    global.fetch = api({ admin: false });
    await renderAt("/admin");
    await waitFor(() => expect(urls()).toContain("/api/admin-check"));
    expect(await screen.findByTestId("home")).toBeInTheDocument();
    expect(screen.queryByText("ATR Admin")).toBeNull();
    expect(urls().some(u => u.startsWith("/api/admin-species"))).toBe(false);
  });

  test("an admin code opens the admin library, with no tab for it anywhere", async () => {
    window.localStorage.setItem(STORAGE_KEY, CODE);
    global.fetch = api({ admin: true });
    await renderAt("/admin");
    expect(await screen.findByText("ATR Admin")).toBeInTheDocument();
    expect(await screen.findByText("Carpet Python")).toBeInTheDocument();
    const [, init] = global.fetch.mock.calls.find(c => c[0] === "/api/admin-check");
    expect(init.headers["x-atr-beta"]).toBe(CODE);
    // No public tab bar inside admin.
    expect(screen.queryByText("Licencing")).toBeNull();
  });

  test("the public app never shows an admin tab, even for an admin", async () => {
    window.localStorage.setItem(STORAGE_KEY, CODE);
    global.fetch = api({ admin: true });
    await renderAt("/");
    expect(await screen.findByTestId("tab-id")).toBeInTheDocument();
    expect(screen.queryByText(/admin/i)).toBeNull();
    expect(urls()).not.toContain("/api/admin-check");
  });

  test("the library filters by search, group and photo count", async () => {
    window.localStorage.setItem(STORAGE_KEY, CODE);
    global.fetch = api({ admin: true });
    await renderAt("/admin");
    await screen.findByText("Carpet Python");
    fireEvent.click(screen.getByText("No photos"));
    expect(screen.queryByText("Carpet Python")).toBeNull();
    expect(screen.getByText("Garden Skink")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Snakes"));
    expect(screen.getByText("No species match those filters.")).toBeInTheDocument();
  });

  test("checkAdmin only says yes for a 200 with ok: true", async () => {
    expect(await checkAdmin(CODE, async () => ok({ ok: true, id: "x", name: "R" }))).toEqual({ ok: true, id: "x", name: "R", gate: null });
    expect((await checkAdmin(CODE, async () => ok({ ok: true, id: "x", name: "R", gate: { public: false, gated: true, secretSet: true } }))).gate).toEqual({ public: false, gated: true, secretSet: true });
    expect(await checkAdmin(CODE, async () => ({ ok: false, status: 403 }))).toEqual({ ok: false });
    expect(await checkAdmin(CODE, async () => { throw new Error("offline"); })).toEqual({ ok: false });
    const never = jest.fn();
    expect(await checkAdmin("bad", never)).toEqual({ ok: false });
    expect(never).not.toHaveBeenCalled();
  });

  test("a 403 from any admin route calls onForbidden", async () => {
    const onForbidden = jest.fn();
    const call = makeApi(CODE, onForbidden, async () => ({ ok: false, status: 403, json: async () => ({}) }));
    await expect(call("admin-testers")).rejects.toMatchObject({ status: 403 });
    expect(onForbidden).toHaveBeenCalled();
  });
});

describe("add photo form: licence rules", () => {
  const good = { speciesSlug: "carpet-python", photo: "data:image/jpeg;base64,xx", photographer: "R. Peterson", licence: "cc-by", sourceUrl: "https://example.org/1", permissionNote: "" };
  test("a complete form is valid", () => expect(validateAddForm(good)).toEqual({}));
  test.each([
    ["photographer", { photographer: " " }],
    ["licence", { licence: "" }],
    ["licence", { licence: "cc-by-nc" }],
    ["source", { sourceUrl: "" }],
    ["sourceUrl", { sourceUrl: "example.org" }],
    ["permissionNote", { licence: "permission" }],
    ["photo", { photo: null }],
    ["speciesSlug", { speciesSlug: null }],
  ])("flags %s", (field, over) => {
    expect(validateAddForm({ ...good, ...over })).toHaveProperty(field);
  });
  test("a permission note can replace the source URL", () => {
    expect(validateAddForm({ ...good, sourceUrl: "", licence: "permission", permissionNote: "Email from J. Smith" })).toEqual({});
  });
});

describe("species search", () => {
  const list = SPECIES.map(s => ({ ...s, _q: searchText(s) }));
  test("matches common, other common, scientific names and synonyms", () => {
    expect(filterSpecies(list, { q: "pogona" }).map(s => s.slug)).toEqual(["central-bearded-dragon"]);
    expect(filterSpecies(list, { q: "grass skink" }).map(s => s.slug)).toEqual(["garden-skink"]);
    expect(filterSpecies(list, { q: "python spilota" }).map(s => s.slug)).toEqual(["carpet-python"]);
  });
  test("few-photo filter sorts the emptiest first", () => {
    const counts = { "carpet-python": { active: 3 }, "central-bearded-dragon": { active: 40 } };
    expect(filterSpecies(list, { photos: "few", counts }).map(s => s.slug)).toEqual(["garden-skink", "carpet-python"]);
  });
});

describe("gate banner in /admin", () => {
  const { GateBanner } = require("../admin/AdminApp");
  test("says gated, public, or gated without a secret, as the server reports", () => {
    const { rerender } = render(<GateBanner gate={{ public: false, gated: true, secretSet: true }} />);
    expect(screen.getByTestId("gate-banner").textContent).toMatch(/^Site is GATED: only invited testers/);
    rerender(<GateBanner gate={{ public: true, gated: false, secretSet: true }} />);
    expect(screen.getByTestId("gate-banner").textContent).toMatch(/^Site is PUBLIC/);
    rerender(<GateBanner gate={{ public: false, gated: true, secretSet: false }} />);
    expect(screen.getByTestId("gate-banner").textContent).toMatch(/ATR_GATE_SECRET isn't set/);
    rerender(<GateBanner gate={null} />);
    expect(screen.getByTestId("gate-banner").textContent).toMatch(/Couldn't read/);
  });
});

describe("feedback inbox: delete with an in-page confirm", () => {
  const FeedbackScreen = require("../admin/FeedbackScreen").default;
  const item = (over) => ({ id: "f1", createdAt: "2026-11-08T00:00:00Z", tester: { id: "t", name: "Jane", group: "VHS" }, verdict: "wrong", aiSuggestions: [], correctSlug: null, correctOther: "Garden Skink", correctIndexSlug: null, correctTraits: [], notes: null, photoConsent: true, photoUrl: null, canAddToLibrary: false, inLibrary: null, ...over });
  const setup = async (items) => {
    const calls = [];
    const api = jest.fn(async (route, opts = {}) => {
      calls.push([route, opts]);
      if (!opts.method) return { items, nextOffset: null };
      return { deleted: true, libraryRemoved: opts.body.removeLibraryCopy ? 1 : 0 };
    });
    const refreshCounts = jest.fn();
    const bySlug = { "garden-skink": SPECIES[1] };
    render(<MemoryRouter><FeedbackScreen api={api} species={SPECIES} bySlug={bySlug} refreshCounts={refreshCounts} /></MemoryRouter>);
    await act(async () => { await Promise.resolve(); });
    return { calls, refreshCounts };
  };

  test("Delete asks in the page, Cancel backs out, Yes deletes; no browser confirm()", async () => {
    const confirmSpy = jest.spyOn(window, "confirm").mockImplementation(() => true);
    const { calls } = await setup([item()]);
    fireEvent.click(screen.getByText("Delete"));
    expect(screen.getByText(/Delete this feedback and the tester's photo\? This can't be undone\./)).toBeInTheDocument();
    fireEvent.click(screen.getByText("Cancel"));
    expect(calls.some(([, o]) => o.method === "DELETE")).toBe(false);
    fireEvent.click(screen.getByText("Delete"));
    await act(async () => { fireEvent.click(screen.getByText("Yes, delete")); });
    expect(calls.find(([, o]) => o.method === "DELETE")).toEqual(["admin-feedback", { method: "DELETE", body: { feedbackId: "f1" } }]);
    expect(await screen.findByText("No feedback yet.")).toBeInTheDocument();
    expect(confirmSpy).not.toHaveBeenCalled();
    confirmSpy.mockRestore();
  });

  test("a photo in the library: choose to remove or keep that copy", async () => {
    const { calls, refreshCounts } = await setup([item({ inLibrary: { speciesSlug: "garden-skink", status: "active" } })]);
    fireEvent.click(screen.getByText("Delete"));
    expect(screen.getByText(/also in the reference library under Garden Skink/)).toBeInTheDocument();
    await act(async () => { fireEvent.click(screen.getByText("Delete, and remove the library copy")); });
    expect(calls.find(([, o]) => o.method === "DELETE")[1].body).toEqual({ feedbackId: "f1", removeLibraryCopy: true });
    expect(refreshCounts).toHaveBeenCalled();
  });

  test("an empty inbox", async () => {
    await setup([]);
    expect(await screen.findByText("No feedback yet.")).toBeInTheDocument();
  });
});

describe("/admin → Sections", () => {
  const view = () => {
    const { editorView } = require("../../lib/appSections");
    return editorView({ rows: [], layoutRow: null });
  };
  const sectionsApi = ({ admin }) => {
    const patches = [];
    const f = jest.fn(async (url, init = {}) => {
      if (String(url).startsWith("/api/admin-testers?scope=sections")) {
        if ((init.method || "GET") === "PATCH") {
          const body = JSON.parse(init.body);
          patches.push(body);
          const v = view();
          if (body.section) Object.assign(v.sections.find(s => s.key === body.section.key), body.section);
          return ok(v);
        }
        return ok(view());
      }
      return api({ admin })(url);
    });
    f.patches = patches;
    return f;
  };

  test("a tester who isn't an admin can't open it", async () => {
    window.localStorage.setItem(STORAGE_KEY, CODE);
    global.fetch = sectionsApi({ admin: false });
    await renderAt("/admin/sections");
    await waitFor(() => expect(urls()).toContain("/api/admin-check"));
    expect(screen.queryByText("Tab labels")).toBeNull();
    expect(urls().some(u => u.startsWith("/api/admin-testers"))).toBe(false);
  });

  test("lists sections by tab; live is off for placeholders; hiding asks in the page first", async () => {
    window.localStorage.setItem(STORAGE_KEY, CODE);
    global.fetch = sectionsApi({ admin: true });
    const confirmSpy = jest.spyOn(window, "confirm").mockImplementation(() => true);
    await renderAt("/admin/sections");
    expect(await screen.findByText("Tab labels")).toBeInTheDocument();
    for (const t of ["learn", "id", "community", "profile"]) expect(screen.getByTestId(`sections-tab-${t}`)).toBeInTheDocument();
    const status = screen.getByLabelText("Status", { selector: "#sec-sightings-status" });
    expect(status.querySelector('option[value="live"]').disabled).toBe(true);
    expect(screen.getByLabelText("Audience", { selector: "#sec-id-aud" }).querySelector('option[value="everyone"]').disabled).toBe(true);

    fireEvent.change(status, { target: { value: "hidden" } });
    expect(global.fetch.patches).toHaveLength(0);
    expect(screen.getByRole("alertdialog")).toHaveTextContent("Hide Sightings?");
    await act(async () => { fireEvent.click(screen.getByText("Hide it")); });
    expect(global.fetch.patches).toEqual([{ section: { key: "sightings", status: "hidden" } }]);
    expect(await screen.findByText(/Saved: Sightings/)).toBeInTheDocument();
    expect(confirmSpy).not.toHaveBeenCalled();
    confirmSpy.mockRestore();
  });

  test("move, feature, Home order and tab labels send one change each", async () => {
    window.localStorage.setItem(STORAGE_KEY, CODE);
    global.fetch = sectionsApi({ admin: true });
    await renderAt("/admin/sections");
    await screen.findByText("Tab labels");
    await act(async () => { fireEvent.click(screen.getByLabelText("Move Zoos & Sanctuaries up")); });
    expect(global.fetch.patches.pop()).toEqual({ order: { tab: "community", keys: ["sightings", "ladders", "venues", "competitions", "expos", "breeders", "snake-catchers", "societies"] } });
    const row = screen.getByTestId("section-row-competitions");
    await act(async () => { fireEvent.click(within(row).getByLabelText("Featured on Home")); });
    expect(global.fetch.patches.pop()).toEqual({ featured: "competitions" });
    await act(async () => { fireEvent.click(screen.getByLabelText("Move Personal (my animals, reminders, shopping list) down")); });
    expect(global.fetch.patches.pop()).toEqual({ homeBlocks: ["featured", "personal", "explore"] });
    fireEvent.change(screen.getByLabelText("My Profile tab label"), { target: { value: "Me" } });
    await act(async () => { fireEvent.click(screen.getByText("Save tab labels")); });
    expect(global.fetch.patches.pop()).toEqual({ tabs: { home: null, learn: null, id: null, community: null, profile: "Me" } });
  });
});
