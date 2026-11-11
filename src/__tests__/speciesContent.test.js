// Species content (D5): the bundled snapshot matches the species list and
// the content rules, the shape check refuses rule-breaking edits, and the
// data-driven page paints from the snapshot, then swaps in the published
// document from the server (and ignores a bad one).
import { render, screen, waitFor, within, fireEvent, act } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import SNAPSHOT from "../data/speciesContent.json";
import { SPECIES } from "../data/species";
import { validateDoc, licenceText, STATES, allBlocks, TAS_NATIVES } from "../data/speciesContentShape";
import { clearSpeciesContentCache } from "../data/speciesContent";
import { clearPhotoCache } from "../components/SpeciesGallery";
import { STORAGE_KEY } from "../beta/betaAccess";
import SpeciesScreen from "../screens/SpeciesScreen";

const clone = (o) => JSON.parse(JSON.stringify(o));
const bySlug = Object.fromEntries(SNAPSHOT.map(d => [d.slug, d]));
const blocksOf = (d) => d.tabs.flatMap(t => allBlocks(t.blocks));

describe("the snapshot", () => {
  test("46 species, in the species list's order, with the same identity", () => {
    expect(SNAPSHOT).toHaveLength(46);
    expect(SNAPSHOT.map(d => d.slug)).toEqual(SPECIES.map(s => s.slug));
    SNAPSHOT.forEach((d, i) => {
      const s = SPECIES[i];
      expect([d.id, d.name, d.latin, d.type, d.level, d.emoji, d.sortOrder]).toEqual([s.id, s.name, s.latin, s.type, s.level, s.emoji, i]);
    });
    const count = (t) => SNAPSHOT.filter(d => d.type === t).length;
    expect([count("snake"), count("lizard"), count("gecko"), count("monitor"), count("turtle"), count("frog")]).toEqual([15, 9, 6, 6, 4, 6]);
  });

  test("every document passes the shape and content rules", () => {
    for (const d of SNAPSHOT) expect([d.slug, validateDoc(d)]).toEqual([d.slug, []]);
  });

  test("Black-headed Monitor and Black-headed Python never collide", () => {
    expect(bySlug["black-headed-monitor"].id).toBe("blackheadedmonitor");
    expect(bySlug["black-headed-python"].id).toBe("blackheaded");
    expect(bySlug["black-headed-monitor"].type).toBe("monitor");
    expect(bySlug["black-headed-python"].type).toBe("snake");
  });

  test("licence cells: eight states, licence names only, TAS red for non-TAS natives", () => {
    for (const d of SNAPSHOT) {
      const lic = blocksOf(d).find(b => b.type === "licence");
      expect(lic.states.map(s => s.abbr)).toEqual(STATES);
      for (const s of lic.states) {
        expect(licenceText(s)).not.toMatch(/\bR\d\b|\bClass [123] (species|animal)|Schedule \d|Category [0-9A-Z]\b/);
      }
      const tas = lic.states.find(s => s.abbr === "TAS");
      if (!TAS_NATIVES.has(d.slug)) expect(tas.ok).toBe(false);
    }
  });

  test("monitors lead with the 50–60°C basking banner (D8: Pygmy Mulga 45–60, Sand 50–65)", () => {
    const want = { "pygmy-mulga-monitor": "45–60°C", "sand-monitor": "50–65°C" };
    for (const d of SNAPSHOT.filter(x => x.type === "monitor")) {
      const banner = d.tabs[0].blocks.find(b => b.type === "basking");
      expect(banner.range).toBe(want[d.slug] || "50–60°C");
    }
  });

  test("no Dubia roaches anywhere", () => {
    expect(JSON.stringify(SNAPSHOT)).not.toMatch(/dubia/i);
  });
});

describe("shedding text matches the animal", () => {
  const shed = (d) => blocksOf(d).find(b => b.type === "shedding");
  test("snakes keep the snake text", () => {
    for (const d of SNAPSHOT.filter(x => x.type === "snake" && shed(x))) expect(JSON.stringify(shed(d))).toMatch(/spectacles/);
  });
  test("lizards, monitors and frogs never get snake advice or a blanket 60–70%", () => {
    for (const d of SNAPSHOT.filter(x => ["lizard", "monitor", "gecko", "frog"].includes(x.type) && shed(x))) {
      const text = JSON.stringify(shed(d));
      expect([d.slug, /soak the snake|the snake seems stuck|60–70%/.test(text)]).toEqual([d.slug, false]);
    }
  });
  test("geckos (no eyelids) keep the eye-cap warning; lizards and monitors (eyelids) don't", () => {
    for (const d of SNAPSHOT.filter(x => shed(x))) {
      const text = JSON.stringify(shed(d));
      if (d.type === "gecko") expect(text).toMatch(/no eyelids/);
      if (d.type === "lizard" || d.type === "monitor") expect(text).not.toMatch(/eye cap|spectacle/);
    }
  });
  test("turtles have no shedding block", () => {
    for (const d of SNAPSHOT.filter(x => x.type === "turtle")) expect(shed(d)).toBeUndefined();
  });
});

describe("the shape check refuses rule-breaking edits", () => {
  const ackie = bySlug["ackie-monitor"];
  test.each([
    ["a Dubia feeder", (d) => { d.tabs[1].blocks[1].items[0].name = "Dubia roaches"; }, /Dubia/],
    ["TAS opened for a mainland species", (d) => { d.tabs[4].blocks[0].states[5].ok = true; }, /TAS/],
    ["a monitor without its basking banner", (d) => { d.tabs[0].blocks = d.tabs[0].blocks.filter(b => b.type !== "basking"); }, /basking/],
    ["a state missing", (d) => { d.tabs[4].blocks[0].states.pop(); }, /states/],
    ["an unknown block", (d) => { d.tabs[0].blocks.push({ type: "html", html: "<b>x</b>" }); }, /unknown block/],
    ["a bar width that isn't a percentage", (d) => { d.tabs[0].blocks.find(b => b.type === "temps").bars[0].width = "999px"; }, /bars/],
    ["no licence block", (d) => { d.tabs = d.tabs.filter(t => t.key !== "licencing"); }, /licence/],
  ])("%s", (_, edit, msg) => {
    const d = clone(ackie);
    edit(d);
    expect(validateDoc(d).join("; ")).toMatch(msg);
  });
});

describe("the species page", () => {
  const saved = global.fetch;
  let served;
  beforeEach(() => {
    clearPhotoCache(); clearSpeciesContentCache(); window.localStorage.clear(); served = null;
    global.fetch = jest.fn(async (url) => {
      if (String(url).includes("content=")) return served ? { ok: true, json: async () => served } : { ok: false, status: 401, json: async () => ({}) };
      return { ok: true, json: async () => ({ photos: [] }) };
    });
  });
  afterEach(() => { global.fetch = saved; });
  const at = (slug) => render(<MemoryRouter initialEntries={[`/species/${slug}`]}><Routes><Route path="/species/:slug" element={<SpeciesScreen slug={slug} onBack={() => {}} />} /></Routes></MemoryRouter>);
  const contentCall = () => global.fetch.mock.calls.find(c => String(c[0]).includes("content="));

  test("paints from the bundled snapshot when the server says no (401 / offline)", async () => {
    at("carpet-python");
    expect(screen.getByRole("heading", { name: "Carpet Python" })).toBeInTheDocument();
    await waitFor(() => expect(contentCall()).toBeTruthy());
    expect(contentCall()[0]).toBe("/api/species-photos?content=carpet-python");
    expect(screen.getByText(/Australia's most widely kept python/)).toBeInTheDocument();
  });

  test("sends the tester code when there is one", async () => {
    window.localStorage.setItem(STORAGE_KEY, "k".repeat(43));
    at("carpet-python");
    await waitFor(() => expect(contentCall()).toBeTruthy());
    expect(contentCall()[1].headers["x-atr-beta"]).toBe("k".repeat(43));
  });

  test("swaps in the published document, with no rebuild", async () => {
    const fresh = clone(bySlug["carpet-python"]);
    fresh.tabs[0].blocks[0].text = "Edited in /admin.";
    served = { species: fresh };
    at("carpet-python");
    expect(await screen.findByText("Edited in /admin.")).toBeInTheDocument();
  });

  test("ignores a published document that fails the shape", async () => {
    const bad = clone(bySlug["carpet-python"]);
    bad.tabs[0].blocks[0].text = "Feed Dubia roaches.";
    served = { species: bad };
    at("carpet-python");
    await waitFor(() => expect(contentCall()).toBeTruthy());
    await act(async () => { await Promise.resolve(); });
    expect(screen.queryByText("Feed Dubia roaches.")).not.toBeInTheDocument();
    expect(screen.getByText(/Australia's most widely kept python/)).toBeInTheDocument();
  });

  test("tab sets still differ by species", () => {
    const labels = (slug) => { const v = at(slug); const t = within(screen.getByTestId("species-tabs")).getAllByRole("button").map(b => b.textContent); v.unmount(); return t; };
    expect(labels("ackie-monitor")).toEqual(["Overview", "Feeding", "Health", "Handling", "Licence"]);
    expect(labels("carpet-python")).toEqual(["Overview", "Feeding", "Health & shedding", "Handling & breeding", "Licence"]);
    expect(labels("eastern-long-necked-turtle")).toEqual(["Overview", "Feeding", "Health & setup", "Handling", "Licence"]);
    expect(labels("central-bearded-dragon")).toEqual(["Overview", "Feeding", "Health", "Licence"]);
  });

  test("the licence tab keeps the verify disclaimer and the authority's licence names", () => {
    at("ackie-monitor");
    fireEvent.click(screen.getByRole("button", { name: "Licence" }));
    expect(screen.getByText("Always verify before purchasing")).toBeInTheDocument();
    const rows = screen.getByTestId("licence-rows");
    expect(within(rows).getByText("Companion or Class 1 licence")).toBeInTheDocument();
    expect(within(rows).getByText("Keeper licence (case by case)")).toBeInTheDocument();
    expect(within(rows).getByText("Not permitted (TAS natives only)")).toBeInTheDocument();
  });

  test("the Bearded Dragon's age toggle switches and survives a tab change", () => {
    at("central-bearded-dragon");
    fireEvent.click(screen.getByRole("button", { name: "Feeding" }));
    expect(screen.getByText("70% protein / 30% greens")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Adult (12+ months)" }));
    expect(screen.getByText("70% greens / 30% protein")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Overview" }));
    fireEvent.click(screen.getByRole("button", { name: "Feeding" }));
    expect(screen.getByText("70% greens / 30% protein")).toBeInTheDocument();
  });

  test("opened from an ID result (care guide link), the page says Back to ID results", () => {
    render(<MemoryRouter initialEntries={[{ pathname: "/species/central-bearded-dragon", state: { tab: "id" } }]}><Routes><Route path="/species/:slug" element={<SpeciesScreen slug="central-bearded-dragon" onBack={() => {}} />} /></Routes></MemoryRouter>);
    expect(screen.getByRole("button", { name: "Back to ID results" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Central Bearded Dragon" })).toBeInTheDocument();
  });
});
