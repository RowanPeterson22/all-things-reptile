// The dark design pass: tokens meet contrast, monitor pages lead with the
// basking banner (D8 ranges kept), temperatures rank hottest-first, and the
// species page uses the tall hero with a labelled round back button.
import { render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { THEMES, T } from "../constants/theme";
import TempBar, { TempCard } from "../components/TempBar";
import { clearPhotoCache } from "../components/SpeciesGallery";
import AckieMonitorPage from "../pages/species/monitors/AckieMonitorPage";
import PygmyMulgaPage from "../pages/species/monitors/PygmyMulgaPage";
import SandMonitorPage from "../pages/species/monitors/SandMonitorPage";
import LaceMonitorPage from "../pages/species/monitors/LaceMonitorPage";
import BlackHeadedMonitorPage from "../pages/species/monitors/BlackHeadedMonitorPage";
import RidgeTailedMonitorPage from "../pages/species/monitors/RidgeTailedMonitorPage";

const lum = (hex) => {
  const [r, g, b] = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255).map(c => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };

describe("dark tokens", () => {
  test("text colours are at least 4.5:1 on the page and on cards", () => {
    const d = THEMES.dark;
    for (const fg of [d.text, d.body, d.muted, d.accentText, d.placeholder]) {
      for (const bg of [d.bg, d.card, d.cardHi, d.field]) expect(ratio(fg, bg)).toBeGreaterThanOrEqual(4.5);
    }
    for (const [fg, bg] of [[d.ok, d.okBg], [d.no, d.noBg], [d.info, d.infoBg], [d.chip, d.chipBg]]) expect(ratio(fg, bg)).toBeGreaterThanOrEqual(4.5);
  });
  test("ships dark, with the brand values", () => {
    expect(T).toBe(THEMES.dark);
    expect(T).toMatchObject({ bg: "#000000", card: "#161616", accent: "#D25815", accentText: "#F07A36", muted: "#A8A8A8" });
  });
});

describe("temperatures", () => {
  test("the first bar is the hottest (orange), then greys step down", () => {
    render(<TempCard><TempBar label="Basking" value="50–60°C" width="100%" /><TempBar label="Warm" value="32°C" width="70%" /><TempBar label="Cool" value="26°C" width="50%" /></TempCard>);
    const fills = ["Basking", "Warm", "Cool"].map(l => screen.getByText(l).parentElement.nextSibling.firstChild.style.background);
    expect(fills).toEqual(["rgb(210, 88, 21)", "rgb(168, 168, 168)", "rgb(107, 107, 107)"]);
    expect(screen.getByText("Basking").style.fontWeight).toBe("700");
  });
});

describe("monitor pages", () => {
  const saved = global.fetch;
  beforeEach(() => { clearPhotoCache(); global.fetch = jest.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve({ photos: [] }) })); });
  afterEach(() => { global.fetch = saved; });
  const at = (Page, slug) => render(<MemoryRouter initialEntries={[`/species/${slug}`]}><Routes><Route path="/species/:slug" element={<Page onBack={() => {}} />} /></Routes></MemoryRouter>);

  test.each([
    [AckieMonitorPage, "ackie-monitor", "50–60°C"],
    [BlackHeadedMonitorPage, "black-headed-monitor", "50–60°C"],
    [LaceMonitorPage, "lace-monitor", "50–60°C"],
    [RidgeTailedMonitorPage, "black-spotted-ridge-tailed-monitor", "50–60°C"],
    [PygmyMulgaPage, "pygmy-mulga-monitor", "45–60°C"],   // D8, as recorded
    [SandMonitorPage, "sand-monitor", "50–65°C"],         // D8, as recorded
  ])("%#: the Overview leads with the basking banner", async (Page, slug, range) => {
    at(Page, slug);
    await waitFor(() => expect(global.fetch).toHaveBeenCalled());
    const banner = screen.getByTestId("basking-banner");
    expect(within(banner).getByText(range)).toBeInTheDocument();
    expect(banner).toHaveTextContent("Very hot basking spot essential");
    expect(screen.getByRole("button", { name: "Back to browse" })).toBeInTheDocument();
  });
});
