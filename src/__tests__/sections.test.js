// Per-tester sections in the app shell: only allowed tabs and routes, other
// paths redirect to the tester's first section, and an ID-only tester gets a
// single screen with no way out to care guides. Runs in jsdom, fetch mocked.
import { render, screen, act, fireEvent } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router-dom";
import { AppShell } from "../App";
import { STORAGE_KEY, takeHandoffCode } from "../beta/betaAccess";
import { accessFor, firstSectionPath, normaliseSections, PUBLIC_SECTIONS, SECTION_KEYS } from "../constants/sections";
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

describe("shell filters tabs and routes by section", () => {
  test("a tester with care and glossary sees only those tabs; others redirect to their first section", async () => {
    window.localStorage.setItem(STORAGE_KEY, CODE);
    global.fetch = tester(["care", "glossary"]);
    await renderAt("/licencing");
    expect(where).toBe("/care");
    expect(screen.getByText("Care")).toBeInTheDocument();
    expect(screen.getByText("Glossary")).toBeInTheDocument();
    for (const t of ["Browse", "Licencing", "ID Reptile"]) expect(screen.queryByText(t)).toBeNull();
    // No search section → no search box.
    expect(screen.queryByPlaceholderText(/Search species/)).toBeNull();
    // No credits section → no credits link on the glossary.
    await act(async () => { fireEvent.click(screen.getByText("Glossary")); });
    expect(where).toBe("/glossary");
    expect(screen.queryByText("Photo credits")).toBeNull();
  });

  test("direct links to sections a tester lacks go to their first section", async () => {
    window.localStorage.setItem(STORAGE_KEY, CODE);
    global.fetch = tester(["glossary"]);
    for (const p of ["/", "/care/enclosure", "/species/carpet-python", "/credits", "/id", "/nowhere"]) {
      await renderAt(p);
      expect(where).toBe("/glossary");
    }
  });

  test("search lists only the groups a tester can open", async () => {
    window.localStorage.setItem(STORAGE_KEY, CODE);
    global.fetch = tester(["species", "search"]);
    await renderAt("/");
    fireEvent.change(screen.getByPlaceholderText(/Search species/), { target: { value: "python" } });
    expect(screen.getByText("Species")).toBeInTheDocument();
    expect(screen.queryByText("Care Guides")).toBeNull();
    expect(screen.queryByText("Glossary")).toBeNull();
  });

  test("no code (the public build after launch): the public sections, never ID", async () => {
    await renderAt("/");
    for (const t of ["Browse", "Care", "Licencing", "Glossary"]) expect(screen.getByText(t)).toBeInTheDocument();
    expect(screen.queryByText("ID Reptile")).toBeNull();
  });

  test("a failed check with a code offers a retry instead of opening sections", async () => {
    window.localStorage.setItem(STORAGE_KEY, CODE);
    global.fetch = jest.fn(async () => ({ ok: false, status: 502 }));
    await renderAt("/");
    expect(screen.getByText("Couldn't check your access")).toBeInTheDocument();
    expect(screen.queryByText("Browse")).toBeNull();
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
    global.fetch = tester(SECTION_KEYS, { isAdmin: true });
    await renderAt("/");
    for (const t of ["Browse", "Care", "Licencing", "ID Reptile", "Glossary"]) expect(screen.getByText(t)).toBeInTheDocument();
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
    for (const t of ["Browse", "Care", "Licencing", "Glossary", "ID Reptile"]) expect(screen.queryByText(t)).toBeNull();
    expect(screen.queryByPlaceholderText(/Search species/)).toBeNull();
    await renderAt("/species/carpet-python");
    expect(where).toBe("/id");
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
