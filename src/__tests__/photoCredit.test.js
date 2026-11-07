// Customer-facing photos in the app: the credit icon and popover for every
// licence, the species gallery (nothing shown without public photos), the
// focus-point mapping, the browser resize maths and the admin form/controls.

import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { PhotoCredit, CreditedImage, creditLines } from "../components/PhotoCredit";
import SpeciesGallery from "../components/SpeciesGallery";
import { focalFromTap, objectPosition, containRect } from "../components/focal";
import { fitLongEdge, rotatedSize, SPEC } from "../admin/image";
import { validateAddForm } from "../admin/AddPhotoScreen";
import { PublicControls } from "../admin/SpeciesPhotosScreen";

const { publicCredit, CC_BY_SA_REASON } = require("../../lib/photoRules");

const base = { source: "inaturalist", source_url: "https://www.inaturalist.org/observations/42", photographer: "A. Person", status: "active", show_credit: true, credit_required: false };
const ROWS = {
  "cc0": { ...base, licence: "cc0", licence_url: "https://creativecommons.org/publicdomain/zero/1.0/" },
  "cc-by": { ...base, licence: "cc-by", licence_url: "https://creativecommons.org/licenses/by/4.0/" },
  "cc-by-sa": { ...base, licence: "cc-by-sa", licence_url: "https://creativecommons.org/licenses/by-sa/4.0/" },
  "permission": { ...base, source: "admin_upload", source_url: "https://www.flickr.com/photos/x/1", licence: "permission", licence_url: null, photographer: "B. Keeper" },
  "tester_consent": { ...base, source: "tester", source_url: "atr:id_feedback/1", licence: "tester_consent", licence_url: null, photographer: "Jane Citizen" },
  "royalty_free": { ...base, source: "admin_upload", source_url: "atr:stock/1", licence: "royalty_free", licence_url: null, photographer: "J. Smith", stock_library: "Adobe Stock", stock_asset_id: "123" },
};

const openCredit = (credit) => {
  render(<div style={{ position: "relative" }}><PhotoCredit credit={credit} /></div>);
  fireEvent.click(screen.getByRole("button", { name: "Photo credit" }));
  return screen.getByRole("dialog", { name: "Photo credit" });
};

describe("credit popover text for each licence", () => {
  test.each([
    ["cc0", "Photo: A. Person", "Licence: CC0 1.0", "Source: iNaturalist ↗", "https://creativecommons.org/publicdomain/zero/1.0/", "https://www.inaturalist.org/observations/42"],
    ["cc-by", "Photo: A. Person", "Licence: CC BY 4.0", "Source: iNaturalist ↗", "https://creativecommons.org/licenses/by/4.0/", "https://www.inaturalist.org/observations/42"],
    ["cc-by-sa", "Photo: A. Person", "Licence: CC BY-SA 4.0", "Source: iNaturalist ↗", "https://creativecommons.org/licenses/by-sa/4.0/", "https://www.inaturalist.org/observations/42"],
    ["permission", "Photo: B. Keeper", "Licence: Used with permission", "Source: flickr.com ↗", null, "https://www.flickr.com/photos/x/1"],
    ["tester_consent", "Photo: ATR community", "Licence: Shared with permission", "Source: ATR community", null, null],
    ["royalty_free", "Photo: Adobe Stock / J. Smith", "Licence: Royalty-free licence", "Source: Adobe Stock", null, null],
  ])("%s", (licence, photo, lic, source, licenceHref, sourceHref) => {
    const dialog = openCredit(publicCredit(ROWS[licence]));
    const lines = Array.from(dialog.firstChild.children).map(d => d.textContent);
    expect(lines).toEqual([photo, lic, source]);
    const links = within(dialog).queryAllByRole("link");
    const byText = (t) => links.find(a => a.textContent.startsWith(t));
    const licLink = byText(lic.replace("Licence: ", ""));
    expect(licLink ? licLink.getAttribute("href") : null).toBe(licenceHref);
    const srcLink = byText(source.replace("Source: ", "").replace(" ↗", ""));
    expect(srcLink ? srcLink.getAttribute("href") : null).toBe(sourceHref);
    links.forEach(a => { expect(a.getAttribute("target")).toBe("_blank"); expect(a.getAttribute("rel")).toBe("noopener noreferrer"); });
  });

  test("a tester who opted in is credited by name", () => {
    expect(publicCredit({ ...ROWS.tester_consent, credit_by_name: true }).name).toBe("Jane Citizen");
  });

  test("display_credit overrides the name; stock without a photographer is just the library", () => {
    expect(publicCredit({ ...ROWS["cc-by"], display_credit: "A. Person / VHS" }).name).toBe("A. Person / VHS");
    expect(publicCredit({ ...ROWS.royalty_free, photographer: null }).name).toBe("Adobe Stock");
  });

  test("an edited CC BY photo says it was modified", () => {
    const credit = publicCredit({ ...ROWS["cc-by"], edited: true });
    expect(creditLines(credit).map(l => `${l.label}: ${l.text}`)).toContain("Changes: Modified from the original");
    expect(openCredit(credit).textContent).toMatch(/Modified from the original/);
  });
});

describe("credit visibility", () => {
  test("cc-by credit can't be hidden, even if show_credit is false", () => {
    const credit = publicCredit({ ...ROWS["cc-by"], show_credit: false });
    expect(credit.show).toBe(true);
    render(<PhotoCredit credit={credit} />);
    expect(screen.getByRole("button", { name: "Photo credit" })).toBeInTheDocument();
  });

  test("nor cc-by-sa, nor stock that requires credit", () => {
    expect(publicCredit({ ...ROWS["cc-by-sa"], show_credit: false }).show).toBe(true);
    expect(publicCredit({ ...ROWS.royalty_free, credit_required: true, show_credit: false }).show).toBe(true);
  });

  test("cc0 or stock without required credit can hide the icon", () => {
    const { container } = render(<PhotoCredit credit={publicCredit({ ...ROWS.cc0, show_credit: false })} />);
    expect(container.firstChild).toBeNull();
    expect(publicCredit({ ...ROWS.royalty_free, show_credit: false }).show).toBe(false);
  });
});

describe("credit icon behaviour", () => {
  const credit = publicCredit(ROWS["cc-by"]);

  test("is a 44 px button with an accessible name and aria-expanded", () => {
    render(<PhotoCredit credit={credit} />);
    const btn = screen.getByRole("button", { name: "Photo credit" });
    expect(btn).toHaveAttribute("type", "button");
    expect(btn).toHaveAttribute("aria-expanded", "false");
    expect(btn.style.width).toBe("44px");
    expect(btn.style.height).toBe("44px");
    fireEvent.click(btn);
    expect(btn).toHaveAttribute("aria-expanded", "true");
    expect(btn.getAttribute("aria-controls")).toBe(screen.getByRole("dialog").id);
  });

  test("Escape closes it and returns focus to the icon", () => {
    render(<PhotoCredit credit={credit} />);
    const btn = screen.getByRole("button", { name: "Photo credit" });
    fireEvent.click(btn);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(document.activeElement).toBe(btn);
  });

  test("a tap outside closes it; a tap inside doesn't", () => {
    render(<div><p>Elsewhere</p><div style={{ position: "relative" }}><PhotoCredit credit={credit} /></div></div>);
    fireEvent.click(screen.getByRole("button", { name: "Photo credit" }));
    fireEvent.pointerDown(screen.getByRole("dialog"));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    fireEvent.pointerDown(screen.getByText("Elsewhere"));
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  test("shows a focus ring for keyboard focus", () => {
    render(<PhotoCredit credit={credit} />);
    const btn = screen.getByRole("button", { name: "Photo credit" });
    act(() => { btn.focus(); });
    expect(btn.style.outline).toMatch(/3px solid/);
    act(() => { btn.blur(); });
    expect(btn.style.outline).toBe("none");
  });

  test("CreditedImage lazy-loads, uses the focus point and hides if the image fails", () => {
    const { container } = render(<CreditedImage src="https://x.test/p.jpg" alt="Lace Monitor" credit={credit} focal={{ x: 0.2, y: 0.9 }} />);
    const img = screen.getByAltText("Lace Monitor");
    expect(img).toHaveAttribute("loading", "lazy");
    expect(img.style.objectPosition).toBe("20% 90%");
    fireEvent.error(img);
    expect(container.firstChild).toBeNull();
  });
});

describe("species gallery", () => {
  const ok = (photos) => jest.fn(async () => ({ ok: true, json: async () => ({ photos }) }));

  test("shows nothing when the species has no public photos", async () => {
    const fetchImpl = ok([]);
    const { container } = render(<SpeciesGallery species="lace-monitor" fetchImpl={fetchImpl} />);
    await waitFor(() => expect(fetchImpl).toHaveBeenCalledWith("/api/species-photos?species=lace-monitor", expect.anything()));
    expect(container.firstChild).toBeNull();
  });

  test("shows nothing when the endpoint fails or isn't there (e.g. npm start)", async () => {
    const down = jest.fn(async () => { throw new TypeError("Failed to fetch"); });
    const r1 = render(<SpeciesGallery species="lace-monitor" fetchImpl={down} />);
    await waitFor(() => expect(down).toHaveBeenCalled());
    expect(r1.container.firstChild).toBeNull();
    const notFound = jest.fn(async () => ({ ok: false, status: 404, json: async () => ({}) }));
    const r2 = render(<SpeciesGallery species="lace-monitor" fetchImpl={notFound} />);
    await waitFor(() => expect(notFound).toHaveBeenCalled());
    expect(r2.container.firstChild).toBeNull();
  });

  test("shows nothing without a species slug", () => {
    const fetchImpl = ok([]);
    const { container } = render(<SpeciesGallery fetchImpl={fetchImpl} />);
    expect(container.firstChild).toBeNull();
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  test("shows public photos in 4:3 frames with their credits, lazy-loaded", async () => {
    const credit = publicCredit(ROWS["cc-by"]);
    const fetchImpl = ok([
      { id: "a", url: "https://x.test/a.jpg", alt: "Lace Monitor, photo by A. Person", width: 1280, height: 960, focal: { x: 0.5, y: 0.3 }, credit },
      { id: "b", url: "https://x.test/b.jpg", alt: "Lace Monitor", width: 1280, height: 960, focal: { x: 0.5, y: 0.5 }, credit: { ...credit, show: false } },
    ]);
    render(<SpeciesGallery species="lace-monitor" fetchImpl={fetchImpl} />);
    const gallery = await screen.findByTestId("species-gallery");
    const imgs = within(gallery).getAllByRole("img");
    expect(imgs).toHaveLength(2);
    imgs.forEach(i => expect(i).toHaveAttribute("loading", "lazy"));
    expect(imgs[0].style.objectFit).toBe("cover");
    expect(imgs[0].style.objectPosition).toBe("50% 30%");
    expect(imgs[0].parentElement.style.aspectRatio).toBe("4 / 3");
    expect(within(gallery).getAllByRole("button", { name: "Photo credit" })).toHaveLength(1);
  });
});

describe("focus point mapping", () => {
  const box = { left: 100, top: 50, width: 400, height: 300 }; // a 4:3 box

  test("centre by default, as object-position", () => {
    expect(objectPosition(undefined)).toBe("50% 50%");
    expect(objectPosition({ x: 0.25, y: 0.755 })).toBe("25% 75.5%");
    expect(objectPosition({ x: 3, y: -1 })).toBe("100% 0%");
  });

  test("a wide (letterboxed) image maps taps inside the picture", () => {
    // 16:9 in 4:3 → 400 × 225, starting 37.5 px down.
    expect(containRect(400, 300, 1600, 900)).toEqual({ left: 0, top: 37.5, width: 400, height: 225 });
    expect(focalFromTap(100 + 100, 50 + 37.5 + 45, box, 1600, 900)).toEqual({ x: 0.25, y: 0.2 });
  });

  test("a portrait (pillarboxed) image", () => {
    // 3:4 in 4:3 → 225 × 300, starting 87.5 px in.
    expect(focalFromTap(100 + 87.5 + 225, 50 + 150, box, 900, 1200)).toEqual({ x: 1, y: 0.5 });
    expect(focalFromTap(100 + 87.5 + 45, 50 + 0, box, 900, 1200)).toEqual({ x: 0.2, y: 0 });
  });

  test("taps on the bars clamp to the picture's edge", () => {
    expect(focalFromTap(100 + 10, 50 + 10, box, 900, 1200)).toEqual({ x: 0, y: 0.033 });
    expect(focalFromTap(100 + 200, 50 + 5, box, 1600, 900)).toEqual({ x: 0.5, y: 0 });
  });
});

describe("browser resize maths (same spec as the server)", () => {
  test("500 px reference, landscape and portrait", () => {
    expect(SPEC.reference).toEqual({ edge: 500, quality: 0.8 });
    expect(fitLongEdge(4032, 3024, 500)).toEqual({ width: 500, height: 375 });
    expect(fitLongEdge(3024, 4032, 500)).toEqual({ width: 375, height: 500 });
  });
  test("1,600 px master; never upscales", () => {
    expect(SPEC.master).toEqual({ edge: 1600, quality: 0.85 });
    expect(fitLongEdge(4032, 3024, 1600)).toEqual({ width: 1600, height: 1200 });
    expect(fitLongEdge(1200, 900, 1600)).toEqual({ width: 1200, height: 900 });
    expect(fitLongEdge(300, 200, 500)).toEqual({ width: 300, height: 200 });
  });
  test("matches the server's maths", () => {
    const server = require("../../lib/imageResize");
    for (const [w, h, e] of [[4032, 3024, 500], [3024, 4032, 1600], [333, 777, 500], [1999, 1001, 1280], [10, 10, 500]]) {
      expect(fitLongEdge(w, h, e)).toEqual(server.fitLongEdge(w, h, e));
    }
  });
  test("a quarter turn swaps the sides", () => {
    expect(rotatedSize(1600, 1200)).toEqual({ width: 1200, height: 1600 });
    expect(rotatedSize(1600, 1200, 2)).toEqual({ width: 1600, height: 1200 });
  });
});

describe("admin: add-photo form and public controls", () => {
  const stock = { speciesSlug: "lace-monitor", photo: "data:image/jpeg;base64,x", licence: "royalty_free", stockLibrary: "Adobe Stock", stockAssetId: "123" };

  test("stock needs the library and asset ID; photographer optional unless credit is required", () => {
    expect(validateAddForm(stock)).toEqual({});
    expect(validateAddForm({ ...stock, stockLibrary: "" })).toHaveProperty("stockLibrary");
    expect(validateAddForm({ ...stock, stockAssetId: " " })).toHaveProperty("stockAssetId");
    expect(validateAddForm({ ...stock, creditRequired: true })).toHaveProperty("photographer");
    expect(validateAddForm({ ...stock, licence: "cc-by" })).toHaveProperty("photographer");
  });

  const photo = (o) => ({ id: "p1", licence: "cc-by", status: "active", show_credit: true, public_use: false, publicBlock: null, attributionRequired: true, credit: { name: "A. Person" }, ...o });

  test("cc-by-sa: the switch is disabled and the share-alike reason is shown", () => {
    const change = jest.fn();
    render(<PublicControls photo={photo({ licence: "cc-by-sa", publicBlock: CC_BY_SA_REASON })} busy={false} change={change} />);
    const sw = screen.getByRole("switch", { name: "Use on species page" });
    expect(sw).toBeDisabled();
    expect(screen.getByText(/Share-alike.*AI reference only/)).toBeInTheDocument();
    fireEvent.click(sw);
    expect(change).not.toHaveBeenCalled();
  });

  test("too small: disabled with the minimum-size reason", () => {
    render(<PublicControls photo={photo({ licence: "cc0", attributionRequired: false, publicBlock: "This photo is only 500 px on its long edge; species pages need at least 800 px. It stays an AI reference photo only." })} busy={false} change={jest.fn()} />);
    expect(screen.getByRole("switch", { name: "Use on species page" })).toBeDisabled();
    expect(screen.getByText(/at least 800 px/)).toBeInTheDocument();
  });

  test("cc-by: the credit switch is locked on", () => {
    const change = jest.fn();
    render(<PublicControls photo={photo()} busy={false} change={change} />);
    const sw = screen.getByRole("switch", { name: "Show credit icon" });
    expect(sw).toHaveAttribute("aria-checked", "true");
    expect(sw).toBeDisabled();
    fireEvent.click(screen.getByRole("switch", { name: "Use on species page" }));
    expect(change).toHaveBeenCalledWith({ public_use: true });
  });
});
