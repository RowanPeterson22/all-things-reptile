// Category images in the app and in /admin → Categories: the Browse home cards
// use the chosen image (card crop, credit) or keep the emoji, the category page
// gets a 2.4 : 1 banner, /credits lists them, and the admin screen is gated,
// with a picker that disables ineligible photos and an in-page remove confirm.
import { render, screen, act, fireEvent, waitFor, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AppShell } from "../App";
import BrowseScreen from "../screens/BrowseScreen";
import CreditsScreen from "../screens/CreditsScreen";
import CategoriesScreen, { CardPreview } from "../admin/CategoriesScreen";
import { clearCategoryImageCache, fetchCategoryImages } from "../components/CategoryImage";
import { clearPhotoCache } from "../components/SpeciesGallery";
import { CARD_ASPECT, BANNER_ASPECT, CATEGORY_IDS, cardAspectAt } from "../constants/categoryFrames";
import { CATEGORIES } from "../data/categories";
import { STORAGE_KEY } from "../beta/betaAccess";
import { CATEGORY_IMAGES_URL } from "../testUtils/publicFetch";

const ok = (body) => ({ ok: true, status: 200, json: async () => body });
const credit = { show: true, name: "J. Smith", licence: "CC BY 4.0", licenceUrl: "https://creativecommons.org/licenses/by/4.0/", source: "iNaturalist", sourceUrl: "https://www.inaturalist.org", edited: false };
const LIZARD = { category: "lizard", url: "https://x.test/categories/lizard-a.jpg", width: 1280, height: 960, focal: { x: 0.5, y: 0.5 }, crop: { x: 0.1, y: 0.2, w: 0.6, h: 0.4324 }, bannerCrop: { x: 0, y: 0.2, w: 1, h: 0.5556 }, credit, alt: "Central Bearded Dragon, photo by J. Smith", speciesName: "Central Bearded Dragon" };

const publicFetch = (categories = [LIZARD]) => jest.fn(async (url) => {
  if (url === CATEGORY_IMAGES_URL) return ok({ categories });
  if (String(url).startsWith("/api/species-photos")) return ok({ photos: [] });
  throw new Error(`unexpected ${url}`);
});
const settle = () => act(async () => { await Promise.resolve(); await Promise.resolve(); await Promise.resolve(); });

beforeEach(() => { clearCategoryImageCache(); clearPhotoCache(); window.localStorage.clear(); });
afterEach(() => { delete global.fetch; });

describe("frames", () => {
  test("the card aspect is the 375 px card's (166.5 × 90), the banner 2.4 : 1, the ids the six categories", () => {
    expect(cardAspectAt(375)).toBe(CARD_ASPECT);
    expect(CARD_ASPECT).toBe(1.85);
    expect(BANNER_ASPECT).toBe(2.4);
    expect([...CATEGORY_IDS].sort()).toEqual(CATEGORIES.map(c => c.id).sort());
  });
  test("fetchCategoryImages keeps only usable entries and survives errors", async () => {
    expect(await fetchCategoryImages(async () => ok({ categories: [LIZARD, { category: "snake" }, null] }))).toEqual([LIZARD]);
    expect(await fetchCategoryImages(async () => { throw new Error("offline"); })).toEqual([]);
    expect(await fetchCategoryImages(async () => ({ ok: false, status: 502 }))).toEqual([]);
  });
});

describe("Browse home", () => {
  test("a category with an image shows it with the card crop and credit; the rest keep the emoji", async () => {
    global.fetch = publicFetch();
    render(<BrowseScreen onSpecies={() => {}} />);
    await settle();
    const imgs = screen.getAllByTestId("category-card-image");
    expect(imgs).toHaveLength(1);
    expect(screen.getAllByTestId("category-card-emoji")).toHaveLength(5);
    const img = imgs[0].querySelector("img");
    expect(img.getAttribute("src")).toBe(LIZARD.url);
    expect(img.getAttribute("alt")).toBe(LIZARD.alt);
    // The crop rect fills the block: 1 / 0.6 wide, offset by x / w.
    expect(img.style).toMatchObject({ position: "absolute", width: "166.67%", left: "-16.67%" });
    expect(imgs[0].style.aspectRatio).toBe("1.85 / 1");
    expect(within(imgs[0]).getByRole("button", { name: "Photo credit" })).toBeInTheDocument();
    // Exactly one request: the public, cached category images.
    expect(global.fetch.mock.calls.map(c => c[0])).toEqual([CATEGORY_IMAGES_URL]);
  });

  test("no images: every card keeps its emoji", async () => {
    global.fetch = publicFetch([]);
    render(<BrowseScreen onSpecies={() => {}} />);
    await settle();
    expect(screen.queryByTestId("category-card-image")).toBeNull();
    expect(screen.getAllByTestId("category-card-emoji")).toHaveLength(6);
  });

  test("an image that fails to load falls back to the emoji", async () => {
    global.fetch = publicFetch();
    render(<BrowseScreen onSpecies={() => {}} />);
    await settle();
    fireEvent.error(screen.getByTestId("category-card-image").querySelector("img"));
    expect(screen.queryByTestId("category-card-image")).toBeNull();
    expect(screen.getAllByTestId("category-card-emoji")).toHaveLength(6);
  });

  test("the request is made once per tab", async () => {
    global.fetch = publicFetch();
    const { unmount } = render(<BrowseScreen onSpecies={() => {}} />);
    await settle();
    unmount();
    render(<BrowseScreen onSpecies={() => {}} />);
    await settle();
    expect(global.fetch.mock.calls.filter(c => c[0] === CATEGORY_IMAGES_URL)).toHaveLength(1);
  });
});

describe("category page header", () => {
  test("with an image: a 2.4 : 1 banner with the banner crop, back button and the name on the sheet", async () => {
    global.fetch = publicFetch();
    render(<BrowseScreen onSpecies={() => {}} />);
    await settle();
    fireEvent.click(screen.getByText("Lizards & Dragons"));
    await settle();
    const banner = screen.getByTestId("category-banner");
    expect(banner.style.aspectRatio).toBe("2.4 / 1");
    const frameImg = within(screen.getByTestId("hero-frame")).getByRole("img");
    expect(frameImg.getAttribute("src")).toBe(LIZARD.url);
    expect(frameImg.style).toMatchObject({ width: "100%", top: "-36%" }); // y / h = 0.2 / 0.5556
    expect(within(banner).getByRole("button", { name: "‹ All categories" })).toBeInTheDocument();
    expect(within(banner).getByRole("button", { name: "Photo credit" })).toBeInTheDocument();
    expect(screen.getByText("Lizards & Dragons")).toBeInTheDocument();
    expect(screen.getByText("9 species")).toBeInTheDocument();
    fireEvent.click(within(banner).getByRole("button", { name: "‹ All categories" }));
    expect(screen.getByText("Browse by category")).toBeInTheDocument();
  });

  test("without an image: the emoji header as before", async () => {
    global.fetch = publicFetch();
    render(<BrowseScreen onSpecies={() => {}} />);
    await settle();
    fireEvent.click(screen.getByText("Pythons & Snakes"));
    await settle();
    expect(screen.queryByTestId("category-banner")).toBeNull();
    const header = screen.getByRole("button", { name: "‹ All categories" }).parentElement;
    expect(within(header).getByText("🐍")).toBeInTheDocument();
    expect(within(header).getByText("Pythons & Snakes")).toBeInTheDocument();
    expect(screen.getByText("15 species")).toBeInTheDocument();
  });
});

describe("/credits", () => {
  test("lists category images with their credit", async () => {
    const fetchImpl = publicFetch();
    render(<CreditsScreen fetchImpl={fetchImpl} />);
    await settle();
    const section = screen.getByTestId("category-credits");
    expect(within(section).getByText("Lizards & Dragons (Central Bearded Dragon)")).toBeInTheDocument();
    expect(within(section).getByText("J. Smith")).toBeInTheDocument();
  });
});

// ─── Admin ────────────────────────────────────────────────────────
const CODE = "e".repeat(43);
const renderAt = async (path) => {
  jest.useFakeTimers();
  const utils = render(<MemoryRouter initialEntries={[path]}><AppShell /></MemoryRouter>);
  await act(async () => { jest.advanceTimersByTime(5000); });
  jest.useRealTimers();
  await act(async () => { await Promise.resolve(); });
  return utils;
};
const shellFetch = ({ admin }) => jest.fn(async (url) => {
  if (url === "/api/beta-check") return ok({ ok: true, name: "Rowan", traits: {}, sections: ["id", "species", "care", "licensing", "glossary", "search", "credits"], isAdmin: Boolean(admin) });
  if (url === "/api/admin-check") return admin ? ok({ ok: true, id: "a", name: "Rowan" }) : { ok: false, status: 403, json: async () => ({}) };
  if (url.startsWith("/api/admin-species")) return ok({ species: [], counts: {}, morphs: [], morphSource: "db" });
  if (url.startsWith("/api/admin-photos?categories=1")) return ok({ categories: [{ ...LIZARD, photoId: "p1", speciesSlug: "central-bearded-dragon", live: true }] });
  if (url === CATEGORY_IMAGES_URL) return ok({ categories: [] });
  throw new Error(`unexpected ${url}`);
});

describe("admin Categories screen gate", () => {
  test("no code: /admin/categories goes home and asks no admin route", async () => {
    global.fetch = publicFetch([]);
    await renderAt("/admin/categories");
    expect(screen.queryByText("Category images")).toBeNull();
    expect(global.fetch.mock.calls.some(c => String(c[0]).includes("admin"))).toBe(false);
  });
  test("a tester who isn't an admin is sent home without loading category data", async () => {
    window.localStorage.setItem(STORAGE_KEY, CODE);
    global.fetch = shellFetch({ admin: false });
    await renderAt("/admin/categories");
    await waitFor(() => expect(global.fetch.mock.calls.map(c => c[0])).toContain("/api/admin-check"));
    expect(screen.queryByText("Category images")).toBeNull();
    expect(global.fetch.mock.calls.some(c => String(c[0]).startsWith("/api/admin-photos"))).toBe(false);
  });
  test("an admin gets the Categories tab and screen, every call carrying the code", async () => {
    window.localStorage.setItem(STORAGE_KEY, CODE);
    global.fetch = shellFetch({ admin: true });
    await renderAt("/admin/categories");
    expect(await screen.findByText("Category images")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Categories" })).toBeInTheDocument();
    await screen.findByText(/Central Bearded Dragon · J. Smith/);
    const call = global.fetch.mock.calls.find(c => String(c[0]).startsWith("/api/admin-photos"));
    expect(call[1].headers["x-atr-beta"]).toBe(CODE);
  });
});

const PICKER = {
  category: "lizard",
  species: [{ appSlug: "central-bearded-dragon", name: "Central Bearded Dragon" }, { appSlug: "shingleback-lizard", name: "Shingleback Lizard" }],
  currentPhotoId: null,
  photos: [
    { id: "p1", species: "central-bearded-dragon", speciesName: "Central Bearded Dragon", url: "https://x.test/r1.jpg", width: 500, height: 375, licence: "cc-by", credit: { ...credit, name: "J. Smith" }, block: null },
    { id: "p2", species: "central-bearded-dragon", speciesName: "Central Bearded Dragon", url: "https://x.test/r2.jpg", width: 500, height: 375, licence: "cc-by-sa", credit: { ...credit, name: "S. Share" }, block: "CC BY-SA can't be used publicly." },
    { id: "p3", species: "shingleback-lizard", speciesName: "Shingleback Lizard", url: "https://x.test/r3.jpg", width: 500, height: 375, licence: "cc0", credit: { ...credit, name: "T. Tiny" }, block: "Too small for public use (500 px; needs 800 px)." },
  ],
};

const adminApi = (initial = {}) => {
  let images = { ...initial };
  const fn = jest.fn(async (route, { method = "GET", body, query } = {}) => {
    if (method === "GET" && query && query.categories) return { categories: Object.values(images) };
    if (method === "GET" && query && query.category) return PICKER;
    if (method === "PATCH" && body.photoId) {
      images[body.category] = { ...LIZARD, category: body.category, crop: null, bannerCrop: null, photoId: body.photoId, live: true };
      return { category: images[body.category] };
    }
    if (method === "PATCH") {
      images[body.category] = { ...images[body.category], ...("crop" in body ? { crop: body.crop } : {}), ...("bannerCrop" in body ? { bannerCrop: body.bannerCrop } : {}) };
      return { category: images[body.category] };
    }
    if (method === "DELETE") { delete images[body.category]; return { removed: true }; }
    throw new Error(`unexpected ${method} ${route}`);
  });
  return fn;
};

describe("admin Categories screen", () => {
  test("one card per category: image or emoji", async () => {
    render(<CategoriesScreen api={adminApi({ lizard: { ...LIZARD, photoId: "p1", live: true } })} />);
    await settle();
    for (const c of CATEGORIES) expect(screen.getByTestId(`category-${c.id}`)).toBeInTheDocument();
    const lizard = screen.getByTestId("category-lizard");
    expect(within(lizard).getByRole("img", { name: "Lizards & Dragons card" }).querySelector("img").getAttribute("src")).toBe(LIZARD.url);
    expect(within(lizard).getByRole("button", { name: "Change photo" })).toBeInTheDocument();
    const snake = screen.getByTestId("category-snake");
    expect(within(snake).getByText("No photo: the card and header show 🐍")).toBeInTheDocument();
    expect(within(snake).queryByRole("button", { name: "Remove" })).toBeNull();
  });

  test("the picker shows ineligible photos disabled with the reason, searches, and chooses", async () => {
    const api = adminApi();
    render(<CategoriesScreen api={api} />);
    await settle();
    const snakeCard = screen.getByTestId("category-lizard");
    fireEvent.click(within(snakeCard).getByRole("button", { name: "Choose photo" }));
    await settle();
    const picker = screen.getByTestId("category-picker");
    expect(api).toHaveBeenCalledWith("admin-photos", { query: { category: "lizard" } });
    const sa = within(picker).getByRole("button", { name: /S\. Share: can't be used\. CC BY-SA can't be used publicly\./ });
    expect(sa).toBeDisabled();
    expect(within(picker).getByText("CC BY-SA can't be used publicly.")).toBeInTheDocument();
    expect(within(picker).getByRole("button", { name: /T\. Tiny: can't be used\. Too small for public use/ })).toBeDisabled();
    // Search narrows to one species.
    fireEvent.change(within(picker).getByRole("searchbox", { name: "Search photos" }), { target: { value: "shingle" } });
    expect(within(picker).queryByText("S. Share")).toBeNull();
    expect(within(picker).getByText("T. Tiny")).toBeInTheDocument();
    fireEvent.change(within(picker).getByRole("searchbox", { name: "Search photos" }), { target: { value: "" } });
    fireEvent.click(within(picker).getByRole("button", { name: "Use this photo: Central Bearded Dragon, J. Smith" }));
    await settle();
    expect(api).toHaveBeenCalledWith("admin-photos", { method: "PATCH", body: { category: "lizard", photoId: "p1" } });
    expect(screen.queryByTestId("category-picker")).toBeNull();
    expect(screen.getByText("Now using Central Bearded Dragon by J. Smith. Check the crops.")).toBeInTheDocument();
  });

  test("card crop: the editor works at the card's aspect, with a live card preview", async () => {
    const api = adminApi({ lizard: { ...LIZARD, crop: null, photoId: "p1", live: true } });
    render(<CategoriesScreen api={api} />);
    await settle();
    fireEvent.click(within(screen.getByTestId("category-lizard")).getByRole("button", { name: "Card crop" }));
    const editor = screen.getByTestId("card-crop-editor");
    expect(within(editor).getByRole("img", { name: "Preview of the Browse card" })).toBeInTheDocument();
    fireEvent.change(within(editor).getByRole("slider", { name: "Zoom" }), { target: { value: "1" } });
    fireEvent.click(within(editor).getByRole("button", { name: "Save card crop" }));
    await settle();
    const [, { body }] = api.mock.calls.find(([, o]) => o && o.method === "PATCH");
    expect(body.category).toBe("lizard");
    expect((body.crop.w * (1280 / 960)) / body.crop.h).toBeCloseTo(1.85, 2);
    expect(body.crop.w).toBeCloseTo(0.3, 3);
  });

  test("banner crop: 2.4 : 1 with the category header preview", async () => {
    const api = adminApi({ lizard: { ...LIZARD, bannerCrop: null, photoId: "p1", live: true } });
    render(<CategoriesScreen api={api} />);
    await settle();
    fireEvent.click(within(screen.getByTestId("category-lizard")).getByRole("button", { name: "Banner crop" }));
    const editor = screen.getByTestId("banner-crop-editor");
    expect(within(editor).getByRole("img", { name: "Preview of the category header" }).style.aspectRatio).toBe("2.4 / 1");
    fireEvent.click(within(editor).getByRole("button", { name: "Save banner crop" }));
    await settle();
    const [, { body }] = api.mock.calls.find(([, o]) => o && o.method === "PATCH");
    expect((body.bannerCrop.w * (1280 / 960)) / body.bannerCrop.h).toBeCloseTo(2.4, 2);
  });

  test("remove asks in the page, never with confirm(), then goes back to the emoji", async () => {
    const confirmSpy = jest.spyOn(window, "confirm").mockImplementation(() => true);
    const api = adminApi({ lizard: { ...LIZARD, photoId: "p1", live: true } });
    render(<CategoriesScreen api={api} />);
    await settle();
    const card = screen.getByTestId("category-lizard");
    fireEvent.click(within(card).getByRole("button", { name: "Remove" }));
    const dialog = within(card).getByRole("alertdialog", { name: "Remove the Lizards & Dragons image?" });
    fireEvent.click(within(dialog).getByRole("button", { name: "Keep it" }));
    expect(api.mock.calls.some(([, o]) => o && o.method === "DELETE")).toBe(false);
    fireEvent.click(within(card).getByRole("button", { name: "Remove" }));
    fireEvent.click(within(card).getByRole("button", { name: "Yes, remove" }));
    await settle();
    expect(api).toHaveBeenCalledWith("admin-photos", { method: "DELETE", body: { category: "lizard" } });
    expect(within(card).getByText("No photo: the card and header show 🦎")).toBeInTheDocument();
    expect(confirmSpy).not.toHaveBeenCalled();
    confirmSpy.mockRestore();
  });

  test("CardPreview without an image shows the emoji", () => {
    render(<CardPreview cat={CATEGORIES[0]} image={null} />);
    expect(screen.getByRole("img", { name: "Preview of the Browse card" })).toHaveTextContent(CATEGORIES[0].emoji);
  });
});
