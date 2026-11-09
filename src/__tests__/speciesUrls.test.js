// Species and care-guide URLs: old IDs redirect to today's hyphenated slugs
// (D4), every page sets a tab title, and licensing contacts are tappable.
import { render, screen, act } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router-dom";
import { AppShell, titleFor } from "../App";
import { STORAGE_KEY } from "../beta/betaAccess";
import { clearSession } from "../beta/idSession";
import LegalScreen, { telHref } from "../screens/LegalScreen";
import { SPECIES } from "../data/species";

const CODE = "e".repeat(43);
const ALL = ["id", "species", "care", "licensing", "glossary", "search", "credits"];
let where = "";
const Where = () => { where = useLocation().pathname; return null; };
const renderAt = async (path) => {
  jest.useFakeTimers();
  render(<MemoryRouter initialEntries={[path]}><AppShell /><Where /></MemoryRouter>);
  await act(async () => { jest.advanceTimersByTime(5000); });
  jest.useRealTimers();
  await act(async () => { await Promise.resolve(); await Promise.resolve(); });
};

beforeEach(() => {
  window.localStorage.clear(); clearSession(); where = "";
  window.localStorage.setItem(STORAGE_KEY, CODE);
  global.fetch = jest.fn(async (url) => ({ ok: true, status: 200, json: async () => (
    String(url).includes("beta-check") ? { ok: true, name: "R", traits: {}, sections: ALL, isAdmin: false, gated: true } : { photos: [], categories: [] }) }));
});
afterEach(() => { delete global.fetch; });

describe("legacy species and guide links", () => {
  test.each([
    ["/species/blackheadedmonitor", "/species/black-headed-monitor"],
    ["/species/bluetongue", "/species/eastern-blue-tongue-skink"],
    ["/care/enclosure", "/care/enclosure-setup"],
    ["/care/feedingnutrition", "/care/feeding-nutrition"],
  ])("%s redirects to %s", async (from, to) => {
    await renderAt(from);
    expect(where).toBe(to);
  });

  test("current slugs stay put", async () => {
    await renderAt("/species/black-headed-monitor");
    expect(where).toBe("/species/black-headed-monitor");
  });

  test("unknown slugs go to the tester's home (Home, with the full shell)", async () => {
    await renderAt("/species/leopard-gecko");
    expect(where).toBe("/");
  });

  test("Black-headed Monitor and Black-headed Python never share a slug or old ID", () => {
    const m = SPECIES.find(s => s.name === "Black-headed Monitor");
    const p = SPECIES.find(s => s.name === "Black-headed Python");
    expect(m && p).toBeTruthy();
    expect(new Set([m.id, m.slug, m.page]).size + new Set([p.id, p.slug, p.page]).size)
      .toBe(new Set([m.id, m.slug, m.page, p.id, p.slug, p.page]).size);
  });

  test("slugs are unique and hyphenated", () => {
    const slugs = SPECIES.map(s => s.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const s of slugs) expect(s).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
  });
});

describe("page titles", () => {
  test("species, guides, tabs and home", () => {
    expect(titleFor("/species/black-headed-monitor")).toBe("Black-headed Monitor · All Things Reptile");
    expect(titleFor("/care/enclosure-setup")).toBe("Enclosure setup · All Things Reptile");
    expect(titleFor("/licencing")).toBe("Licencing · All Things Reptile");
    expect(titleFor("/")).toBe("All Things Reptile");
    expect(titleFor("/species")).toBe("Species · All Things Reptile");
    expect(titleFor("/community/sightings")).toBe("Sightings · All Things Reptile");
    expect(titleFor("/profile")).toBe("My Profile · All Things Reptile");
    expect(titleFor("/species/nope")).toBe("All Things Reptile");
  });

  test("the shell sets document.title on navigation", async () => {
    await renderAt("/care/enclosure-setup");
    expect(document.title).toBe("Enclosure setup · All Things Reptile");
  });
});

describe("licensing contacts", () => {
  test("phone numbers dial without spaces or menu options", () => {
    expect(telHref("1300 130 372 (option 4)")).toBe("tel:1300130372");
    expect(telHref("(08) 8124 4972")).toBe("tel:0881244972");
    expect(telHref("13 22 81")).toBe("tel:132281");
  });

  test("each state's contacts are links once opened", () => {
    render(<MemoryRouter><LegalScreen /></MemoryRouter>);
    const vic = screen.getAllByText(/Victoria|VIC/)[0];
    act(() => { vic.click(); });
    const call = screen.getAllByRole("link", { name: /^Call / })[0];
    expect(call.getAttribute("href")).toMatch(/^tel:\d+$/);
    const mail = screen.getAllByRole("link", { name: /^Email / })[0];
    expect(mail.getAttribute("href")).toMatch(/^mailto:/);
    const web = screen.getAllByRole("link", { name: /^Open / })[0];
    expect(web.getAttribute("href")).toMatch(/^https:\/\//);
    expect(web.getAttribute("rel")).toContain("noopener");
  });
});
