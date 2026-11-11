// Per-tester sections in the app shell: only allowed tabs and routes, other
// paths redirect to the tester's first section, and an ID-only tester gets a
// single screen with no way out to care guides. Runs in jsdom, fetch mocked.
import { render, screen, act, fireEvent, within } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router-dom";
import { AppShell } from "../App";
import { STORAGE_KEY, takeHandoffCode } from "../beta/betaAccess";
import { accessFor, firstSectionPath, normaliseSections, PUBLIC_SECTIONS } from "../constants/sections";
import { buildConfig, resolveView, shellFor } from "../constants/appLayout";
import { visibleModules } from "../home/homeModules";
import IdSuggestionCard from "../components/IdSuggestionCard";
import { clearSession } from "../beta/idSession";

const CODE = "d".repeat(43);
const okRes = (body) => ({ ok: true, status: 200, json: async () => body });
const tester = (sections, extra = {}) => jest.fn(async () => okRes({ ok: true, name: "Jane", traits: {}, sections, isAdmin: false, gated: true, ...extra }));

let where = "";
const Where = () => { where = useLocation().pathname; return null; };

const renderAt = async (path) => {
  jest.useFakeTimers();
  const utils = render(<MemoryRouter initialEntries={[path]}><AppShell /><Where /></MemoryRouter>);
  await act(async () => { jest.advanceTimersByTime(5000); });
  jest.useRealTimers();
  await act(async () => { await Promise.resolve(); await Promise.resolve(); });
  return utils;
};

beforeEach(() => { window.localStorage.clear(); clearSession(); global.fetch = jest.fn(); where = ""; });
afterEach(() => { delete global.fetch; });

describe("section helpers", () => {
  test("normalise, first section and access checks", () => {
    expect(normaliseSections(["care", "nope", "id", "care"])).toEqual(["id", "care"]);
    expect(firstSectionPath(["glossary", "licensing"])).toBe("/licencing");
    expect(firstSectionPath([])).toBe("/");
    expect(PUBLIC_SECTIONS).not.toContain("id");
    const a = accessFor(["care"]);
    expect(a.speciesPages).toBe(true);
    expect(a.browse).toBe(false);
    expect(accessFor(["id"]).speciesPages).toBe(false);
  });
  test("the bootstrap hand-off cookie moves into the app and is deleted", () => {
    document.cookie = `atr_invite=${CODE}; Path=/`;
    expect(takeHandoffCode()).toBe(CODE);
    expect(document.cookie).not.toContain("atr_invite=d");
    expect(takeHandoffCode()).toBe("");
  });
});

// A tester as the server would answer: their sections and layout under the
// given app_sections rows (defaults if none).
const asServer = (own, { rows = [], layout = null, admin = false, isPublic = false } = {}) => {
  const view = resolveView(buildConfig({ rows, layout }), admin ? { role: "admin", isPublic } : { role: "tester", own, isPublic });
  return jest.fn(async (url) => okRes(String(url).includes("beta-check")
    ? { ok: true, name: "Jane", traits: {}, sections: view.sections, app: view.app, isAdmin: admin, gated: !isPublic }
    : { photos: [], categories: [] }));
};
const tabKeys = () => screen.queryAllByTestId(/^tab-(home|learn|id|community|profile)$/).map(b => b.getAttribute("data-testid").slice(4));

describe("shell: tabs, Home and routes by section", () => {
  test("care + glossary: Home, Learn, Community and My Profile; nothing they lack", async () => {
    window.localStorage.setItem(STORAGE_KEY, CODE);
    global.fetch = tester(["care", "glossary"]);
    await renderAt("/licencing");
    expect(where).toBe("/");
    expect(tabKeys()).toEqual(["home", "learn", "community", "profile"]);
    expect(screen.getByTestId("tile-care")).toBeInTheDocument();
    expect(screen.getByTestId("tile-glossary")).toBeInTheDocument();
    for (const k of ["species", "licensing", "id"]) expect(screen.queryByTestId(`tile-${k}`)).toBeNull();
    // No search section → no search block or box.
    expect(screen.queryByPlaceholderText(/Search species/)).toBeNull();
    // Learn lands on its first section, with a sub-nav of just the two.
    await act(async () => { fireEvent.click(screen.getByTestId("tab-learn")); });
    expect(where).toBe("/care");
    expect(screen.getAllByRole("tab").map(t => t.textContent)).toEqual(["Care guides", "Glossary"]);
    await act(async () => { fireEvent.click(screen.getByRole("tab", { name: "Glossary" })); });
    expect(where).toBe("/glossary");
    expect(screen.getByTestId("tab-learn")).toHaveAttribute("aria-current", "page");
    // No credits section → no credits link on the glossary.
    expect(screen.queryByText("Photo credits")).toBeNull();
  });

  test("direct links to sections a tester lacks go to their home", async () => {
    window.localStorage.setItem(STORAGE_KEY, CODE);
    global.fetch = tester(["glossary"]);
    for (const p of ["/", "/species", "/care/enclosure", "/species/carpet-python", "/credits", "/id", "/community", "/profile/shortlist", "/nowhere"]) {
      await renderAt(p);
      expect(where).toBe("/glossary");
    }
  });

  test("a one-section tester gets that screen alone: no Home, no tabs, no coming-soon tiles", async () => {
    window.localStorage.setItem(STORAGE_KEY, CODE);
    global.fetch = tester(["glossary"]);
    await renderAt("/");
    expect(tabKeys()).toEqual([]);
    expect(screen.queryByTestId("learn-nav")).toBeNull();
    expect(screen.queryByText(/Coming soon/)).toBeNull();
  });

  test("search lists only the groups a tester can open; Home's search opens /search", async () => {
    window.localStorage.setItem(STORAGE_KEY, CODE);
    global.fetch = tester(["species", "care", "search"]);
    await renderAt("/");
    fireEvent.change(within(screen.getByTestId("home-search")).getByPlaceholderText(/Search species/), { target: { value: "python" } });
    expect(where).toBe("/search");
    expect(screen.getByText("Species")).toBeInTheDocument();
    expect(screen.queryByText("Glossary")).toBeNull();
    expect(screen.getByTestId("tab-learn")).toHaveAttribute("aria-current", "page");
  });

  test("no code (the public build after launch): the public sections, never ID or tester placeholders", async () => {
    await renderAt("/");
    expect(tabKeys()).toEqual(["home", "learn"]);
    for (const k of ["species", "care", "licensing", "glossary"]) expect(screen.getByTestId(`tile-${k}`)).toBeInTheDocument();
    for (const k of ["id", "sightings", "shortlist"]) expect(screen.queryByTestId(`tile-${k}`)).toBeNull();
    expect(screen.queryByTestId("planning-card")).toBeNull();
    await renderAt("/community/sightings");
    expect(where).toBe("/");
  });

  test("the public layout comes from GET /api/beta-check once the app is public", async () => {
    const view = resolveView(buildConfig({ rows: [{ key: "competitions", status: "soon", audience: "everyone", featured: true }, { key: "glossary", status: "hidden" }] }), { role: "public", isPublic: true });
    global.fetch = jest.fn(async () => okRes({ gated: false, ...view }));
    await renderAt("/");
    expect(global.fetch.mock.calls[0][0]).toBe("/api/beta-check");
    expect(screen.getByTestId("featured-card")).toHaveTextContent("Competitions");
    expect(screen.queryByTestId("tile-glossary")).toBeNull();
    expect(tabKeys()).toEqual(["home", "learn", "community"]);
  });

  test("a failed check with a code offers a retry instead of opening sections", async () => {
    window.localStorage.setItem(STORAGE_KEY, CODE);
    global.fetch = jest.fn(async () => ({ ok: false, status: 502 }));
    await renderAt("/");
    expect(screen.getByText("Couldn't check your access")).toBeInTheDocument();
    expect(screen.queryByTestId("home")).toBeNull();
    global.fetch = tester(["glossary"]);
    await act(async () => { fireEvent.click(screen.getByText("Try again")); await Promise.resolve(); await Promise.resolve(); });
    expect(await screen.findByText(/terms? in glossary/)).toBeInTheDocument();
  });

  test("a tester with no sections sees a plain notice", async () => {
    window.localStorage.setItem(STORAGE_KEY, CODE);
    global.fetch = tester([]);
    await renderAt("/");
    expect(screen.getByText("Nothing to see yet")).toBeInTheDocument();
  });

  test("an admin gets every tab", async () => {
    window.localStorage.setItem(STORAGE_KEY, CODE);
    global.fetch = asServer([], { admin: true });
    await renderAt("/");
    expect(tabKeys()).toEqual(["home", "learn", "id", "community", "profile"]);
  });
});

describe("Home", () => {
  beforeEach(() => window.localStorage.setItem(STORAGE_KEY, CODE));

  test("blocks in the default order: search, planning card, explore tiles with Coming soon badges", async () => {
    global.fetch = asServer(["id", "species", "care", "search"]);
    await renderAt("/");
    const blocks = [...screen.getByTestId("home").querySelectorAll("[data-block]")].map(b => b.getAttribute("data-block"));
    // Search leads, in the header; then personal and explore (nothing featured by default).
    expect(screen.getByTestId("home").firstChild).toBe(screen.getByTestId("home-search"));
    expect(blocks).toEqual(["personal", "explore"]);
    expect(screen.getByTestId("planning-card")).toHaveTextContent("Planning your first reptile?");
    expect(screen.getByText("Explore")).toBeInTheDocument();
    expect(within(screen.getByTestId("tile-sightings")).getByText("Coming soon")).toBeInTheDocument();
    expect(within(screen.getByTestId("tile-species")).queryByText("Coming soon")).toBeNull();
    // Two columns.
    expect(screen.getByTestId("explore-grid").style.gridTemplateColumns).toBe("1fr 1fr");
    await act(async () => { fireEvent.click(screen.getByTestId("planning-card")); });
    expect(where).toBe("/profile");
  });

  test("admin's block order, featured card, titles and tab labels apply", async () => {
    global.fetch = asServer(["id", "species", "search"], {
      rows: [{ key: "competitions", status: "soon", audience: "testers", featured: true, title: "Calendar comp", blurb: "Enter the 2027 ATR calendar" }],
      layout: { tab_labels: { profile: "Me" }, home_blocks: ["featured", "explore", "search", "personal"] },
    });
    await renderAt("/");
    const blocks = [...screen.getByTestId("home").querySelectorAll("[data-block]")].map(b => b.getAttribute("data-block"));
    expect(blocks).toEqual(["featured", "explore", "search", "personal"]);
    expect(screen.getByTestId("featured-card")).toHaveTextContent("Calendar comp");
    expect(screen.getByTestId("featured-card")).toHaveTextContent("Coming soon");
    expect(screen.getByTestId("tab-profile")).toHaveTextContent("Me");
    await act(async () => { fireEvent.click(screen.getByTestId("featured-card")); });
    expect(where).toBe("/community/competitions");
    expect(screen.getByTestId("coming-soon")).toHaveTextContent("Calendar comp");
    expect(screen.getByTestId("tab-community")).toHaveAttribute("aria-current", "page");
  });

  test("status and audience: hidden and admin-only sections drop out; a tab with nothing left is hidden", async () => {
    const rows = ["sightings", "ladders", "competitions", "venues", "expos", "breeders"].map((key, i) => ({ key, status: i < 2 ? "hidden" : "soon", audience: i < 2 ? "testers" : "admin" }));
    global.fetch = asServer(["id", "species"], { rows });
    await renderAt("/");
    expect(tabKeys()).toEqual(["home", "learn", "id", "profile"]);
    expect(screen.queryByTestId("tile-sightings")).toBeNull();
    await renderAt("/community/venues");
    expect(where).toBe("/");
  });

  test("an admin sees hidden sections with a Hidden badge", async () => {
    global.fetch = asServer([], { admin: true, rows: [{ key: "venues", status: "hidden", audience: "testers" }] });
    await renderAt("/");
    expect(within(screen.getByTestId("tile-venues")).getByText("Hidden")).toBeInTheDocument();
  });

  test("a built section set to Coming soon shows its placeholder page, not its content", async () => {
    global.fetch = asServer(["species", "licensing", "glossary"], { rows: [{ key: "licensing", status: "soon", audience: "everyone" }] });
    await renderAt("/licencing");
    expect(screen.getByTestId("coming-soon")).toHaveTextContent("Licencing");
    expect(screen.queryByText("Reptile Licencing")).toBeNull();
  });

  test("the personal block renders a module once it has data (registry)", () => {
    const shell = shellFor(resolveView(buildConfig(), { role: "tester", own: ["species", "care"] }));
    const mods = visibleModules(shell, () => {}, (k) => (k === "reminders" ? { items: ["Feed Ziggy"] } : undefined));
    expect(mods.map(m => m.module.section)).toEqual(["collection", "reminders", "shopping-lists"]);
    const filled = mods.filter(m => !m.module.isEmpty(m.ctx));
    expect(filled.map(m => m.module.key)).toEqual(["reminders"]);
    render(filled[0].module.render(filled[0].ctx));
    expect(screen.getByText("Feed Ziggy")).toBeInTheDocument();
  });
});

describe("Learn, Community and My Profile", () => {
  beforeEach(() => window.localStorage.setItem(STORAGE_KEY, CODE));

  test("Learn: Browse moved to /species, sub-nav on each index, old URLs still route", async () => {
    global.fetch = asServer(["id", "species", "care", "licensing", "glossary", "search", "credits"]);
    const first = await renderAt("/species");
    expect(screen.getAllByRole("tab").map(t => t.textContent)).toEqual(["Species", "Care guides", "Licencing", "Glossary"]);
    expect(screen.getByText("Browse by category")).toBeInTheDocument();
    first.unmount();
    for (const p of ["/care", "/licencing", "/glossary", "/credits", "/search", "/species/carpet-python", "/care/enclosure-setup"]) {
      const { unmount } = await renderAt(p);
      expect(where).toBe(p);
      expect(screen.getByTestId("tab-learn")).toHaveAttribute("aria-current", "page");
      unmount();
    }
    await renderAt("/species/blackheadedmonitor");
    expect(where).toBe("/species/black-headed-monitor");
  });

  test("Community and My Profile tab pages list their placeholders; My Profile leads with the planning intro", async () => {
    global.fetch = asServer(["id", "species"]);
    await renderAt("/community");
    expect(within(screen.getByTestId("tab-grid-community")).getAllByRole("button").map(b => b.getAttribute("data-testid")))
      .toEqual(["tile-sightings", "tile-ladders", "tile-competitions", "tile-venues", "tile-expos", "tile-breeders"]);
    await renderAt("/profile");
    expect(screen.getByTestId("planning-intro")).toHaveTextContent("Planning your first reptile?");
    expect(within(screen.getByTestId("tab-grid-profile")).getAllByRole("button")).toHaveLength(7);
    await act(async () => { fireEvent.click(screen.getByTestId("tile-suits-me")); });
    expect(where).toBe("/profile/which-reptile");
    expect(screen.getByTestId("coming-soon")).toHaveTextContent("Which reptile suits me?");
    expect(screen.getByTestId("coming-soon")).toHaveTextContent("Coming soon");
    await act(async () => { fireEvent.click(screen.getByText("‹ My Profile")); });
    expect(where).toBe("/profile");
  });
});

describe("layout rules (shared with the server)", () => {
  test("placeholders can't be live; AI ID can't be public; one featured at most", () => {
    const cfg = buildConfig({ rows: [
      { key: "sightings", status: "live", audience: "everyone", featured: true },
      { key: "id", status: "live", audience: "everyone" },
      { key: "venues", featured: true },
      { key: "search", featured: true },
      { key: "made-up", status: "live" },
    ] });
    expect(cfg.sections.sightings.status).toBe("soon");
    expect(cfg.sections.id.audience).toBe("testers");
    expect(Object.values(cfg.sections).filter(s => s.featured).map(s => s.key)).toEqual(["sightings"]);
    expect(cfg.sections["made-up"]).toBeUndefined();
    const pub = resolveView(cfg, { role: "public", isPublic: true });
    expect(pub.sections).not.toContain("id");
    expect(pub.app.items.map(i => i.key)).toContain("sightings");
    expect(resolveView(cfg, { role: "public", isPublic: false }).app.items).toEqual([]);
  });

  test("placeholders need no per-tester grant; built sections still do", () => {
    const v = resolveView(buildConfig(), { role: "tester", own: ["care", "glossary"] });
    expect(v.sections).toEqual(["care", "glossary"]);
    expect(v.app.items.map(i => i.key)).toEqual(expect.arrayContaining(["sightings", "account", "reminders"]));
    expect(v.app.items.map(i => i.key)).not.toContain("species");
  });

  test("ID-only: one screen at /id even though placeholders are visible to testers", () => {
    const shell = shellFor(resolveView(buildConfig(), { role: "tester", own: ["id"] }));
    expect(shell).toMatchObject({ full: false, landing: "/id", tabs: [] });
    expect(shell.items.map(i => i.key)).toEqual(["id"]);
  });
});

describe("ID-only tester", () => {
  const venomousResult = { name: "Central Bearded Dragon", latin: "Pogona vitticeps", slug: "central-bearded-dragon", appSlug: "central-bearded-dragon", inApp: true, matched: true, confidence: "likely", traits: [] };

  test("a single screen: the ID screen, no tab bar, no search, no other routes", async () => {
    window.localStorage.setItem(STORAGE_KEY, CODE);
    global.fetch = tester(["id"]);
    await renderAt("/");
    expect(where).toBe("/id");
    expect(await screen.findByText(/Identify a reptile or frog/)).toBeInTheDocument();
    expect(screen.queryAllByTestId(/^tab-/)).toHaveLength(0);
    expect(screen.queryByPlaceholderText(/Search species/)).toBeNull();
    await renderAt("/species/carpet-python");
    expect(where).toBe("/id");
    // Same with the server's layout, whose placeholders testers can see.
    global.fetch = asServer(["id"]);
    for (const p of ["/", "/community", "/profile/shortlist"]) {
      await renderAt(p);
      expect(where).toBe("/id");
      expect(screen.queryAllByTestId(/^tab-/)).toHaveLength(0);
    }
  });

  test("results name the species with no care link (and no 'No care guide yet')", () => {
    const { container } = render(<IdSuggestionCard suggestion={venomousResult} onOpen={null} />);
    expect(screen.getByText("Central Bearded Dragon")).toBeInTheDocument();
    expect(screen.queryByText(/View care guide/)).toBeNull();
    expect(screen.queryByText(/No care guide yet/)).toBeNull();
    expect(container.firstChild.style.cursor).toBe("default");
  });

  test("with species or care the link is back", () => {
    render(<IdSuggestionCard suggestion={venomousResult} onOpen={() => {}} />);
    expect(screen.getByText(/View care guide/)).toBeInTheDocument();
  });

  test("an ID-only tester's ID results carry no care links end to end", async () => {
    const result = { suggestions: [venomousResult], note: "" };
    window.localStorage.setItem(STORAGE_KEY, CODE);
    global.fetch = jest.fn(async (url) => (String(url).includes("identify") ? okRes(result) : okRes({ ok: true, name: "Jane", traits: {}, sections: ["id"], gated: true })));
    const { container } = await renderAt("/id");
    const OrigImage = global.Image;
    global.Image = class { set src(_) { this.naturalWidth = 10; this.naturalHeight = 10; setTimeout(() => this.onload(), 0); } };
    global.URL.createObjectURL = () => "blob:x"; global.URL.revokeObjectURL = () => {};
    HTMLCanvasElement.prototype.getContext = () => ({ drawImage: () => {} });
    HTMLCanvasElement.prototype.toDataURL = () => "data:image/jpeg;base64,AAAA";
    const input = container.querySelector('input[type="file"]');
    await act(async () => { fireEvent.change(input, { target: { files: [new File(["x"], "d.jpg", { type: "image/jpeg" })] } }); await new Promise(r => setTimeout(r, 5)); });
    global.Image = OrigImage;
    await act(async () => { fireEvent.click(screen.getByText(/^Identify/)); await Promise.resolve(); await Promise.resolve(); });
    expect(screen.getAllByText("Central Bearded Dragon").length).toBeGreaterThan(0);
    expect(screen.queryByText(/View care guide/)).toBeNull();
    await act(async () => { fireEvent.click(screen.getAllByTestId("id-suggestion")[0]); });
    expect(where).toBe("/id");
  });
});
