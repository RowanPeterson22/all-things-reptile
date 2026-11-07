// Front end of the admin section: /admin only opens for a verified admin code,
// shows no tab, and the add-photo form enforces the licence rules.
import { render, screen, act, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AppShell } from "../App";
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
  if (url === "/api/beta-check") return ok({ ok: true, name: "Rowan Peterson", traits: {} });
  if (url === "/api/admin-check") return admin ? ok({ ok: true, id: "id-1", name: "Rowan Peterson" }) : { ok: false, status: 403, json: async () => ({ error: "nope" }) };
  if (url.startsWith("/api/admin-species")) return ok({ species: SPECIES, counts: { "carpet-python": { active: 12, hidden: 1, rejected: 0, best: 1 } }, morphs: {} });
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

beforeEach(() => { window.localStorage.clear(); global.fetch = jest.fn(); });
afterEach(() => { delete global.fetch; });

describe("/admin gate", () => {
  test("no code: /admin goes home without asking the server", async () => {
    await renderAt("/admin");
    expect(screen.queryByText("ATR Admin")).toBeNull();
    expect(screen.getByText("Browse")).toBeInTheDocument();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test("a tester who isn't an admin is sent home", async () => {
    window.localStorage.setItem(STORAGE_KEY, CODE);
    global.fetch = api({ admin: false });
    await renderAt("/admin");
    await waitFor(() => expect(urls()).toContain("/api/admin-check"));
    expect(await screen.findByText("Browse")).toBeInTheDocument();
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
    expect(await screen.findByText("ID Reptile")).toBeInTheDocument();
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
    expect(await checkAdmin(CODE, async () => ok({ ok: true, id: "x", name: "R" }))).toEqual({ ok: true, id: "x", name: "R" });
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
