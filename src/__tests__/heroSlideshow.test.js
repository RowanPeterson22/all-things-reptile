// The species-page hero and slideshow: the crop maths, the hero fallback
// order, the 2.4 : 1 banner rendered from the crop, the rolling slideshow
// (arrows, dots, swipe, auto-advance and pause, reduced motion, one photo),
// the Browse card using the hero, and the admin hero checkbox / crop editor.

import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import {
  HERO_ASPECT, fitCrop, defaultCrop, moveCrop, zoomCrop, heroImageStyle, heroCropFor, pickHero, othersThan, maxCropWidth, minCropWidth,
} from "../components/heroCrop";
import SpeciesHero from "../components/SpeciesHero";
import SpeciesSlideshow, { AUTO_MS, RESUME_MS, HeroSlideshow } from "../components/SpeciesSlideshow";
import SpeciesPage from "../components/SpeciesPage";
import BrowseScreen from "../screens/BrowseScreen";
import { clearPhotoCache } from "../components/SpeciesGallery";
import HeroCropEditor, { HeroPreview } from "../admin/HeroCropEditor";
import { PublicControls, heroFallbackId } from "../admin/SpeciesPhotosScreen";

// These tests cover the public (post-launch) behaviour of /api/species-photos;
// the pre-launch gate on it is tested in speciesContentApi.test.js.
beforeAll(() => { process.env.ATR_PUBLIC = "true"; });
afterAll(() => { delete process.env.ATR_PUBLIC; });

// jsdom has no PointerEvent, so fireEvent.pointer* would drop clientX/pointerId.
if (typeof window.PointerEvent !== "function") {
  class PointerEvent extends MouseEvent {
    constructor(type, init = {}) { super(type, init); this.pointerId = init.pointerId ?? 1; this.pointerType = init.pointerType ?? "mouse"; }
  }
  window.PointerEvent = PointerEvent;
}

const credit = (name) => ({ show: true, name, licence: "CC BY 4.0", licenceUrl: null, source: "iNaturalist", sourceUrl: null, edited: false });
const ph = (n, extra = {}) => ({ id: `p${n}`, species: "ackie-monitor", url: `https://img.test/${n}.jpg`, width: 1280, height: 960, focal: { x: 0.5, y: 0.5 }, alt: `Ackie ${n}`, credit: credit(`Person ${n}`), hero: false, heroCrop: null, ...extra });

// ─── Crop maths ───────────────────────────────────────────────────
describe("hero crop maths", () => {
  const A = 4 / 3;

  test("fitCrop enforces 2.4 : 1 in pixels and keeps the crop inside", () => {
    const c = fitCrop({ x: 0.9, y: 0.9, w: 0.5 }, A);
    expect(c.w).toBe(0.5);
    expect(c.h).toBeCloseTo((0.5 * A) / HERO_ASPECT, 4);
    expect((c.w * A) / c.h).toBeCloseTo(HERO_ASPECT, 2);
    expect(c.x + c.w).toBeLessThanOrEqual(1);
    expect(c.y + c.h).toBeLessThanOrEqual(1);
    expect(c).toMatchObject({ x: 0.5 });
  });

  test("width is clamped between 30% and the widest crop that fits", () => {
    expect(fitCrop({ x: 0, y: 0, w: 0.1 }, A).w).toBe(0.3);
    expect(fitCrop({ x: 0, y: 0, w: 2 }, A).w).toBe(1);
    expect(maxCropWidth(4)).toBeCloseTo(0.6);           // panorama: the full height limits it
    expect(fitCrop({ x: 0, y: 0, w: 1 }, 4)).toMatchObject({ w: 0.6, h: 1 });
    expect(minCropWidth(10)).toBeCloseTo(0.24);
  });

  test("defaultCrop is the widest crop centred on the focus point, clamped", () => {
    expect(defaultCrop(A, { x: 0.5, y: 0.5 })).toEqual({ x: 0, y: 0.2222, w: 1, h: 0.5556 });
    expect(defaultCrop(A, { x: 0.5, y: 0.1 })).toMatchObject({ y: 0 });
    expect(defaultCrop(A, { x: 0.5, y: 0.95 })).toMatchObject({ y: 0.4444 });
    expect(defaultCrop(A, null)).toEqual(defaultCrop(A, { x: 0.5, y: 0.5 }));
  });

  test("move and zoom stay valid", () => {
    const c = fitCrop({ x: 0.2, y: 0.2, w: 0.5 }, A);
    expect(moveCrop(c, 1, 1, A)).toMatchObject({ x: 0.5, y: 1 - c.h });
    expect(moveCrop(c, -1, -1, A)).toMatchObject({ x: 0, y: 0 });
    const z = zoomCrop(c, 0.3, A);
    expect(z.w).toBe(0.3);
    expect(z.x + z.w / 2).toBeCloseTo(c.x + c.w / 2, 3); // about the centre
    expect(zoomCrop(c, 0.05, A).w).toBe(0.3);
  });

  test("heroImageStyle scales and offsets the image so the crop rect fills the box", () => {
    expect(heroImageStyle({ x: 0.25, y: 0.1, w: 0.5, h: 0.25 })).toMatchObject({ position: "absolute", width: "200%", height: "400%", left: "-50%", top: "-40%" });
    expect(heroImageStyle({ x: 0, y: 0, w: 1, h: 1 })).toMatchObject({ width: "100%", height: "100%", left: "0%", top: "0%" });
  });

  test("heroCropFor: the stored crop, else the focus-point default, else null without a size", () => {
    expect(heroCropFor(ph(1, { heroCrop: { x: 0.1, y: 0.2, w: 0.6, h: 1 / 3 } }))).toEqual({ x: 0.1, y: 0.2, w: 0.6, h: 0.3333 });
    expect(heroCropFor(ph(1, { focal: { x: 0.5, y: 0 } }))).toEqual({ x: 0, y: 0, w: 1, h: 0.5556 });
    expect(heroCropFor(ph(1, { width: null }))).toBeNull();
  });
});

// ─── Hero fallback order ──────────────────────────────────────────
describe("which photo is the hero", () => {
  test("the ticked hero wins; else the first in public order", () => {
    const list = [ph(1), ph(2, { hero: true }), ph(3)];
    expect(pickHero(list).id).toBe("p2");
    expect(othersThan(list, pickHero(list)).map(p => p.id)).toEqual(["p1", "p3"]);
    expect(pickHero([ph(1), ph(2)]).id).toBe("p1");
    expect(pickHero([])).toBeNull();
  });

  test("admin: the fallback is the first public photo by public_order, then date", () => {
    const row = (id, o) => ({ id, public_use: true, status: "active", is_hero: false, created_at: "2026-11-07", ...o });
    expect(heroFallbackId([row("a", { public_order: 2 }), row("b", { public_order: 1 }), row("c", { public_order: null })])).toBe("b");
    expect(heroFallbackId([row("a", { public_order: null, created_at: "2026-11-08" }), row("b", { public_order: null, created_at: "2026-11-07" })])).toBe("b");
    expect(heroFallbackId([row("a", { public_order: 2 }), row("b", { public_order: 1, public_use: false })])).toBe("a");
    expect(heroFallbackId([row("a", {}), row("b", { is_hero: true })])).toBeNull();
    expect(heroFallbackId([row("a", { public_use: false })])).toBeNull();
  });
});

// ─── Hero banner ──────────────────────────────────────────────────
describe("hero banner", () => {
  test("is a 2.4 : 1 banner capped at 240 px, placing the image from the crop", () => {
    render(<SpeciesHero photo={ph(1, { heroCrop: { x: 0.25, y: 0.1, w: 0.5, h: 0.2778 } })} name="Ackie Monitor"><button>Back</button></SpeciesHero>);
    const hero = screen.getByTestId("species-hero");
    expect(hero.style.aspectRatio).toBe("2.4 / 1");
    expect(hero.style.maxHeight).toBe("240px");
    const img = screen.getByAltText("Ackie 1");
    expect(img.style).toMatchObject({ position: "absolute", width: "200%", left: "-50%" });
    expect(screen.getByRole("button", { name: "Back" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Photo credit" })).toBeInTheDocument();
  });

  test("without a size it falls back to cover on the focus point", () => {
    render(<SpeciesHero photo={ph(1, { width: null, height: null, focal: { x: 0.2, y: 0.8 } })} name="Ackie" />);
    expect(screen.getByAltText("Ackie 1").style).toMatchObject({ objectFit: "cover", objectPosition: "20% 80%" });
  });
});

// ─── Slideshow ────────────────────────────────────────────────────
const active = () => screen.getAllByRole("group").find(g => g.dataset.active === "true");
const activeAlt = () => within(active()).getByRole("img").getAttribute("alt");

describe("slideshow", () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => { jest.useRealTimers(); delete window.matchMedia; });

  test("renders nothing with no photos; one photo alone with no arrows or dots", () => {
    const { container, rerender } = render(<SpeciesSlideshow photos={[]} />);
    expect(container).toBeEmptyDOMElement();
    rerender(<SpeciesSlideshow photos={[ph(1)]} />);
    expect(screen.getByAltText("Ackie 1")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Next photo" })).toBeNull();
    expect(screen.queryByRole("button", { name: /Photo 1 of/ })).toBeNull();
    expect(screen.getByRole("button", { name: "Photo credit" })).toBeInTheDocument();
  });

  test("arrows step and wrap; 40 px, labelled", () => {
    render(<SpeciesSlideshow photos={[ph(1), ph(2), ph(3)]} />);
    const next = screen.getByRole("button", { name: "Next photo" });
    const prev = screen.getByRole("button", { name: "Previous photo" });
    expect(next.style).toMatchObject({ width: "40px", height: "40px" });
    expect(activeAlt()).toBe("Ackie 1");
    fireEvent.click(prev);
    expect(activeAlt()).toBe("Ackie 3"); // wraps backwards
    fireEvent.click(next);
    expect(activeAlt()).toBe("Ackie 1"); // wraps forwards
    fireEvent.click(next);
    expect(activeAlt()).toBe("Ackie 2");
  });

  test("dots say Photo n of N, mark the current one and jump to it", () => {
    render(<SpeciesSlideshow photos={[ph(1), ph(2), ph(3)]} />);
    const dots = [1, 2, 3].map(n => screen.getByRole("button", { name: `Photo ${n} of 3` }));
    expect(dots[0]).toHaveAttribute("aria-current", "true");
    fireEvent.click(dots[2]);
    expect(activeAlt()).toBe("Ackie 3");
    expect(dots[2]).toHaveAttribute("aria-current", "true");
    expect(dots[0]).not.toHaveAttribute("aria-current");
  });

  test("hidden slides are inert; each slide keeps its credit icon", () => {
    render(<SpeciesSlideshow photos={[ph(1), ph(2)]} />);
    const groups = screen.getAllByRole("group", { hidden: true });
    expect(groups).toHaveLength(2);
    expect(groups[1]).toHaveAttribute("aria-hidden", "true");
    expect(groups[1].hasAttribute("inert")).toBe(true);
    groups.forEach(g => expect(within(g).getByRole("button", { name: "Photo credit", hidden: true })).toBeInTheDocument());
  });

  test("auto-advances every ~5 s and loops, with the live region off", () => {
    render(<SpeciesSlideshow photos={[ph(1), ph(2)]} />);
    expect(screen.getByTestId("slideshow-status")).toHaveAttribute("aria-live", "off");
    act(() => { jest.advanceTimersByTime(AUTO_MS - 10); });
    expect(activeAlt()).toBe("Ackie 1");
    act(() => { jest.advanceTimersByTime(20); });
    expect(activeAlt()).toBe("Ackie 2");
    act(() => { jest.advanceTimersByTime(AUTO_MS); });
    expect(activeAlt()).toBe("Ackie 1");
    expect(screen.getByTestId("slideshow-status")).toHaveAttribute("aria-live", "off");
  });

  test("a user step turns announcements on and pauses auto-advance for ~10 s", () => {
    render(<SpeciesSlideshow photos={[ph(1), ph(2), ph(3)]} />);
    fireEvent.click(screen.getByRole("button", { name: "Next photo" }));
    expect(activeAlt()).toBe("Ackie 2");
    expect(screen.getByTestId("slideshow-status")).toHaveAttribute("aria-live", "polite");
    expect(screen.getByTestId("slideshow-status")).toHaveTextContent("Photo 2 of 3");
    act(() => { jest.advanceTimersByTime(RESUME_MS - 100); });
    expect(activeAlt()).toBe("Ackie 2");
    act(() => { jest.advanceTimersByTime(200); });
    expect(activeAlt()).toBe("Ackie 3");
    expect(screen.getByTestId("slideshow-status")).toHaveAttribute("aria-live", "off");
  });

  test("holding a finger on it pauses; letting go waits ~10 s", () => {
    render(<SpeciesSlideshow photos={[ph(1), ph(2)]} />);
    const frame = active().parentElement;
    fireEvent.pointerDown(frame, { clientX: 100, clientY: 50, pointerId: 1, pointerType: "touch" });
    act(() => { jest.advanceTimersByTime(AUTO_MS * 4); });
    expect(activeAlt()).toBe("Ackie 1");
    fireEvent.pointerUp(frame, { clientX: 102, clientY: 50, pointerId: 1, pointerType: "touch" });
    act(() => { jest.advanceTimersByTime(RESUME_MS - 100); });
    expect(activeAlt()).toBe("Ackie 1");
    act(() => { jest.advanceTimersByTime(200); });
    expect(activeAlt()).toBe("Ackie 2");
  });

  test("swipe left goes forward, swipe right back; a vertical drag doesn't", () => {
    render(<SpeciesSlideshow photos={[ph(1), ph(2), ph(3)]} />);
    const frame = active().parentElement;
    const swipe = (dx, dy = 0) => {
      fireEvent.pointerDown(frame, { clientX: 200, clientY: 100, pointerId: 1, pointerType: "touch" });
      fireEvent.pointerUp(frame, { clientX: 200 + dx, clientY: 100 + dy, pointerId: 1, pointerType: "touch" });
    };
    swipe(-80);
    expect(activeAlt()).toBe("Ackie 2");
    swipe(80);
    expect(activeAlt()).toBe("Ackie 1");
    swipe(-30, 90);
    expect(activeAlt()).toBe("Ackie 1");
  });

  test("stops while the tab is hidden", () => {
    render(<SpeciesSlideshow photos={[ph(1), ph(2)]} />);
    const vis = jest.spyOn(document, "visibilityState", "get").mockReturnValue("hidden");
    act(() => { document.dispatchEvent(new Event("visibilitychange")); });
    act(() => { jest.advanceTimersByTime(AUTO_MS * 3); });
    expect(activeAlt()).toBe("Ackie 1");
    vis.mockReturnValue("visible");
    act(() => { document.dispatchEvent(new Event("visibilitychange")); });
    act(() => { jest.advanceTimersByTime(AUTO_MS + 10); });
    expect(activeAlt()).toBe("Ackie 2");
    vis.mockRestore();
  });

  test("prefers-reduced-motion: still advances (plain fade), arrows work", () => {
    const saved = window.matchMedia;
    window.matchMedia = jest.fn().mockImplementation((q) => ({ matches: /reduce/.test(q), media: q, addEventListener: jest.fn(), removeEventListener: jest.fn() }));
    render(<SpeciesSlideshow photos={[ph(1), ph(2)]} />);
    act(() => { jest.advanceTimersByTime(AUTO_MS + 10); });
    expect(activeAlt()).toBe("Ackie 2");
    fireEvent.click(screen.getByRole("button", { name: "Next photo" }));
    expect(activeAlt()).toBe("Ackie 1");
    window.matchMedia = saved;
  });

  test("mouse hover does not pause auto-advance", () => {
    render(<SpeciesSlideshow photos={[ph(1), ph(2)]} />);
    const frame = screen.getByTestId("species-slideshow").firstChild;
    fireEvent.pointerEnter(frame, { pointerType: "mouse" });
    act(() => { jest.advanceTimersByTime(AUTO_MS + 10); });
    expect(activeAlt()).toBe("Ackie 2");
  });
});

// ─── The hero as the slideshow ────────────────────────────────────
describe("hero slideshow", () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => { jest.useRealTimers(); delete window.matchMedia; });
  const hero = (n = 3) => render(<HeroSlideshow photos={[ph(1), ph(2), ph(3)].slice(0, n)} name="Ackie Monitor" overlay={<h1>Ackie Monitor</h1>}><button>Back</button></HeroSlideshow>);
  const frame = () => active().parentElement;

  test("auto-advances and wraps; the dots sit with the name, over the photo", () => {
    hero();
    expect(activeAlt()).toBe("Ackie 1");
    for (const next of ["Ackie 2", "Ackie 3", "Ackie 1"]) { // wraps 3 → 1
      act(() => { jest.advanceTimersByTime(AUTO_MS + 10); });
      expect(activeAlt()).toBe(next);
    }
    const dots = screen.getByTestId("slideshow-dots");
    expect(dots.parentElement.parentElement).toContainElement(screen.getByRole("heading", { name: "Ackie Monitor" }));
    expect(screen.queryByRole("button", { name: "Next photo" })).toBeNull();
  });

  test("one ⓘ, always the current photo's credit", () => {
    hero();
    const openCredit = () => fireEvent.click(screen.getByRole("button", { name: "Photo credit" }));
    openCredit();
    expect(screen.getByRole("dialog", { name: "Photo credit" })).toHaveTextContent("Person 1");
    fireEvent.click(screen.getByRole("button", { name: "Photo 3 of 3" }));
    expect(screen.getAllByRole("button", { name: "Photo credit" })).toHaveLength(1);
    expect(screen.queryByRole("dialog")).toBeNull(); // a new photo starts closed
    openCredit();
    expect(screen.getByRole("dialog", { name: "Photo credit" })).toHaveTextContent("Person 3");
  });

  test("holding a finger pauses; letting go waits ~10 s; a swipe steps back with wrap", () => {
    hero();
    fireEvent.pointerDown(frame(), { clientX: 100, clientY: 50, pointerId: 1, pointerType: "touch" });
    act(() => { jest.advanceTimersByTime(AUTO_MS * 4); });
    expect(activeAlt()).toBe("Ackie 1");
    fireEvent.pointerUp(frame(), { clientX: 102, clientY: 50, pointerId: 1, pointerType: "touch" });
    act(() => { jest.advanceTimersByTime(RESUME_MS - 100); });
    expect(activeAlt()).toBe("Ackie 1");
    fireEvent.pointerDown(frame(), { clientX: 100, clientY: 50, pointerId: 1, pointerType: "touch" });
    fireEvent.pointerUp(frame(), { clientX: 200, clientY: 52, pointerId: 1, pointerType: "touch" });
    expect(activeAlt()).toBe("Ackie 3");
  });

  test("prefers-reduced-motion: still advances, as a plain fade", () => {
    window.matchMedia = jest.fn().mockImplementation((q) => ({ matches: /reduce/.test(q), media: q, addEventListener: jest.fn(), removeEventListener: jest.fn() }));
    hero(2);
    expect(active().style.transition).toBe("opacity 1.2s linear");
    act(() => { jest.advanceTimersByTime(AUTO_MS + 10); });
    expect(activeAlt()).toBe("Ackie 2");
  });
});

// ─── Species page and Browse card ─────────────────────────────────
const mockPhotos = (photos) => {
  global.fetch = jest.fn(async () => ({ ok: true, json: async () => ({ photos }) }));
};

describe("species page and Browse card use the hero", () => {
  const saved = global.fetch;
  beforeEach(() => clearPhotoCache());
  afterEach(() => { global.fetch = saved; });

  const page = () => render(
    <MemoryRouter initialEntries={["/species/ackie-monitor"]}>
      <Routes><Route path="/species/:slug" element={<SpeciesPage onBack={() => {}} name="Ackie Monitor" latin="Varanus acanthurus" emoji="🦎" tabs={["overview"]} tabContent={() => <div>Body</div>} />} /></Routes>
    </MemoryRouter>,
  );

  test("the hero is the slideshow: it starts on the ticked photo, then the rest; no card below, no emoji", async () => {
    mockPhotos([ph(1), ph(2, { hero: true }), ph(3)]);
    page();
    const hero = await screen.findByTestId("species-hero");
    const slides = within(hero).getAllByRole("group", { hidden: true });
    expect(slides.map(g => within(g).getByRole("img", { hidden: true }).getAttribute("alt"))).toEqual(["Ackie 2", "Ackie 1", "Ackie 3"]);
    expect(slides[0]).toHaveAttribute("data-active", "true");
    expect(within(hero).getAllByRole("button", { name: /^Photo \d of 3$/ })).toHaveLength(3);
    expect(within(hero).getAllByRole("button", { name: "Photo credit" })).toHaveLength(1);
    expect(screen.queryByTestId("species-slideshow")).toBeNull();
    expect(screen.queryByText("🦎")).toBeNull();
  });

  test("no hero ticked: it starts on the first photo; one photo shows alone with no dots", async () => {
    mockPhotos([ph(1), ph(2)]);
    const { unmount } = page();
    const hero = await screen.findByTestId("species-hero");
    expect(within(within(hero).getAllByRole("group").find(g => g.dataset.active === "true")).getByRole("img").getAttribute("alt")).toBe("Ackie 1");
    unmount();
    clearPhotoCache();
    mockPhotos([ph(1)]);
    page();
    const single = await screen.findByTestId("species-hero");
    expect(within(single).getByAltText("Ackie 1")).toBeInTheDocument();
    expect(within(single).queryByRole("button", { name: /^Photo 1 of/ })).toBeNull();
    expect(within(single).queryByTestId("slideshow-dots")).toBeNull();
    expect(within(single).getByRole("button", { name: "Photo credit" })).toBeInTheDocument();
  });

  test("no public photos: the emoji header, no slideshow", async () => {
    mockPhotos([]);
    page();
    await waitFor(() => expect(global.fetch).toHaveBeenCalled());
    expect(screen.getByText("🦎")).toBeInTheDocument();
    expect(screen.queryByTestId("species-hero")).toBeNull();
    expect(screen.queryByTestId("species-slideshow")).toBeNull();
  });

  test("the Browse card shows the hero, not the first photo", async () => {
    mockPhotos([ph(1), ph(2, { hero: true })]);
    render(<BrowseScreen onSpecies={() => {}} />);
    fireEvent.click(screen.getByText("Monitors"));
    const img = await screen.findByAltText("Ackie Monitor");
    expect(img).toHaveAttribute("src", "https://img.test/2.jpg");
  });

  test("the Browse card falls back to the first photo", async () => {
    mockPhotos([ph(1), ph(2)]);
    render(<BrowseScreen onSpecies={() => {}} />);
    fireEvent.click(screen.getByText("Monitors"));
    expect(await screen.findByAltText("Ackie Monitor")).toHaveAttribute("src", "https://img.test/1.jpg");
  });
});

// ─── Admin: hero checkbox and crop editor ─────────────────────────
const adminRow = (o = {}) => ({ id: "r1", url: "https://signed.test/r1.jpg", width: 500, height: 375, public_width: 1280, public_height: 960, focal_x: 0.5, focal_y: 0.5, licence: "cc0", status: "active", public_use: true, public_order: 1, is_hero: false, hero_crop: null, show_credit: true, credit: credit("A"), ...o });

describe("admin hero checkbox", () => {
  test("on a public photo, ticking sends is_hero", () => {
    const change = jest.fn();
    render(<PublicControls photo={adminRow()} busy={false} change={change} />);
    fireEvent.click(screen.getByRole("checkbox", { name: "Hero (main image)" }));
    expect(change).toHaveBeenCalledWith({ is_hero: true });
  });

  test("on a photo being made public, ticking publishes it too", () => {
    const change = jest.fn();
    render(<PublicControls photo={adminRow({ public_use: false, publicBlock: null })} busy={false} change={change} />);
    expect(screen.getByText("Ticking this also puts it on the species page.")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("checkbox", { name: "Hero (main image)" }));
    expect(change).toHaveBeenCalledWith({ public_use: true, is_hero: true });
  });

  test("disabled when the photo can't go public; unticking sends false", () => {
    const change = jest.fn();
    const { rerender } = render(<PublicControls photo={adminRow({ public_use: false, publicBlock: "Too small." })} busy={false} change={change} />);
    expect(screen.getByRole("checkbox", { name: "Hero (main image)" })).toBeDisabled();
    rerender(<PublicControls photo={adminRow({ is_hero: true })} busy={false} change={change} />);
    fireEvent.click(screen.getByRole("checkbox", { name: "Hero (main image)" }));
    expect(change).toHaveBeenCalledWith({ is_hero: false });
  });

  test("the fallback photo says it's used for now", () => {
    render(<PublicControls photo={adminRow()} busy={false} change={() => {}} fallbackHero />);
    expect(screen.getByText("No hero chosen: this first photo is used for now.")).toBeInTheDocument();
  });
});

describe("admin hero crop editor (the tall hero, 100 : 103)", () => {
  const stage = () => screen.getByTestId("hero-crop-stage");
  const box = () => screen.getByTestId("hero-crop-box");
  const stub = () => { stage().getBoundingClientRect = () => ({ left: 0, top: 0, width: 400, height: 300, right: 400, bottom: 300 }); };
  const TALL = 100 / 103;

  test("starts from the widest tall crop on the focus point and saves a dragged one", () => {
    const onSave = jest.fn();
    render(<HeroCropEditor photo={adminRow()} busy={false} onSave={onSave} onCancel={() => {}} />);
    stub();
    // 4:3 photo: the widest 100 : 103 crop is 0.7282 of its width, full height.
    expect(box().style).toMatchObject({ left: "13.59%", width: "72.82%", top: "0%", height: "100%" });
    fireEvent.change(screen.getByRole("slider", { name: "Zoom" }), { target: { value: "1" } });
    expect(box().style.width).toBe("30%");
    const start = { x: Number(box().style.left.replace("%", "")) / 100, y: Number(box().style.top.replace("%", "")) / 100 };
    fireEvent.pointerDown(box(), { pointerId: 1, clientX: 100, clientY: 100 });
    fireEvent.pointerMove(stage(), { pointerId: 1, clientX: 140, clientY: 130 });
    fireEvent.pointerUp(stage(), { pointerId: 1, clientX: 140, clientY: 130 });
    fireEvent.click(screen.getByRole("button", { name: "Save hero crop" }));
    const saved = onSave.mock.calls[0][0];
    expect(saved.w).toBe(0.3);
    expect(saved.x).toBeCloseTo(start.x + 0.1, 3);
    expect(saved.y).toBeCloseTo(start.y + 0.1, 3);
    expect((saved.w * (4 / 3)) / saved.h).toBeCloseTo(TALL, 2);
  });

  test("pinch zooms in; never below 30% wide", () => {
    render(<HeroCropEditor photo={adminRow()} busy={false} onSave={() => {}} onCancel={() => {}} />);
    stub();
    fireEvent.pointerDown(box(), { pointerId: 1, clientX: 150, clientY: 150 });
    fireEvent.pointerDown(box(), { pointerId: 2, clientX: 250, clientY: 150 });
    fireEvent.pointerMove(stage(), { pointerId: 2, clientX: 350, clientY: 150 }); // fingers twice as far apart
    expect(box().style.width).toBe("36.41%");
    fireEvent.pointerMove(stage(), { pointerId: 2, clientX: 2000, clientY: 150 });
    expect(box().style.width).toBe("30%");
  });

  test("arrow keys move it; the preview is the app's own tall hero, framed exactly; Clear sends null", () => {
    const onSave = jest.fn();
    const onChange = jest.fn();
    render(<HeroCropEditor photo={adminRow({ hero_crop: { x: 0.2, y: 0.1, w: 0.5, h: 0.6867 } })} busy={false} onSave={onSave} onChange={onChange} onCancel={() => {}} />);
    expect(screen.queryByTestId("hero-crop-legacy")).toBeNull();
    fireEvent.keyDown(box(), { key: "ArrowRight" });
    expect(box().style.left).toBe("21%");
    expect(onChange).toHaveBeenLastCalledWith({ x: 0.21, y: 0.1, w: 0.5, h: 0.6867 });
    const preview = screen.getByTestId("tall-hero-preview");
    expect(preview.style.maxWidth).toBe("390px");
    const hero = within(preview).getByTestId("species-hero");
    expect(hero.getAttribute("data-variant")).toBe("tall");
    expect(hero.getAttribute("data-frame-height")).toBe("min(103cqw, 440px)"); // from its own width, not the window
    // The crop fills the 100 : 103 frame: the image is 1/w wide, shifted by x/w.
    expect(hero.querySelector("img").style).toMatchObject({ width: "200%", left: "-42%", height: "145.62%", top: "-14.56%" });
    fireEvent.click(screen.getByRole("button", { name: "Clear crop" }));
    expect(onSave).toHaveBeenCalledWith(null);
  });

  test("an old 2.4 : 1 crop starts on its centre, as the app frames it, and says so", () => {
    const onSave = jest.fn();
    render(<HeroCropEditor photo={adminRow({ hero_crop: { x: 0, y: 0.2, w: 1, h: 0.5556 } })} busy={false} onSave={onSave} onCancel={() => {}} />);
    expect(screen.getByTestId("hero-crop-legacy")).toHaveTextContent(/old wide banner/);
    // Centre (0.5, 0.4778): the widest tall crop is full height, so y clamps to 0.
    expect(box().style).toMatchObject({ left: "13.59%", width: "72.82%", top: "0%" });
    fireEvent.click(screen.getByRole("button", { name: "Save hero crop" }));
    const saved = onSave.mock.calls[0][0];
    expect((saved.w * (4 / 3)) / saved.h).toBeCloseTo(TALL, 2);
  });

  test("HeroPreview is still the 2.4 : 1 banner (category headers)", () => {
    render(<HeroPreview url="https://x.test/a.jpg" crop={{ x: 0, y: 0, w: 1, h: 0.5556 }} />);
    expect(screen.getByRole("img", { name: /Preview/ }).style.aspectRatio).toBe("2.4 / 1");
  });
});
