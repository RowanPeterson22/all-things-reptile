// Admin → Morphs screens: the list (search, status chips, show deleted), add
// with validation, soft delete behind an in-page confirm (never confirm()),
// restore, species assignment, the photo library's "Morphs for this species"
// panel and photo trait tagging. The API is a jest.fn standing in for
// /api/admin-species, which re-checks admin access on the server.
import { useState } from "react";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import MorphsScreen from "../admin/MorphsScreen";
import { SpeciesMorphsPanel, TraitPicker } from "../admin/MorphParts";
import { morphsForSpecies, slugify, validateMorph, filterMorphs } from "../admin/morphs";
import { searchText } from "../admin/species";

const SPECIES = [
  { slug: "central-bearded-dragon", common: "Central Bearded Dragon", scientific: "Pogona vitticeps", group: "dragon", appSlug: "central-bearded-dragon", otherCommon: [] },
  { slug: "jacky-dragon", common: "Jacky Dragon", scientific: "Amphibolurus muricatus", group: "dragon", appSlug: null, otherCommon: [] },
  { slug: "carpet-python", common: "Carpet Python", scientific: "Morelia spilota", group: "python", appSlug: "carpet-python", otherCommon: [] },
].map(r => ({ ...r, _q: searchText(r) }));
const BY_SLUG = Object.fromEntries(SPECIES.map(r => [r.slug, r]));

const CAT = () => [
  { id: "albino", name: "Albino", cue: "No black pigment.", au_status: "established", notes: null, deleted_at: null, updated_at: "t1", species: [{ slug: "carpet-python", cue_override: null, sort: 10 }] },
  { id: "leatherback", name: "Leatherback", cue: "Smooth back.", au_status: "established", notes: null, deleted_at: null, updated_at: "t1", species: [{ slug: "central-bearded-dragon", cue_override: null, sort: 30 }] },
  { id: "translucent", name: "Translucent", cue: "See-through scales.", au_status: "check", notes: null, deleted_at: null, updated_at: "t1", species: [{ slug: "central-bearded-dragon", cue_override: "Dark eyes.", sort: 20 }] },
  { id: "zero", name: "Zero", cue: "No pattern.", au_status: "check", notes: null, deleted_at: "2026-11-08T00:00:00Z", updated_at: "t1", species: [{ slug: "central-bearded-dragon", cue_override: null, sort: 50 }] },
];

// Stateful harness: the api mock's replies feed back into the catalogue, as AdminApp does.
const Harness = ({ api, path, readOnly = false }) => {
  const [catalogue, setMorphs] = useState(CAT());
  const props = { api, species: SPECIES, bySlug: BY_SLUG, catalogue, setMorphs, readOnly };
  return (
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/admin/morphs" element={<MorphsScreen {...props} />} />
        <Route path="/admin/morphs/new" element={<MorphsScreen {...props} creating />} />
        <Route path="/admin/morphs/:id" element={<MorphsScreen {...props} />} />
        <Route path="/admin/species/:slug" element={<SpeciesMorphsPanel api={api} catalogue={catalogue} setMorphs={setMorphs} speciesSlug="central-bearded-dragon" />} />
      </Routes>
    </MemoryRouter>
  );
};

// A fake server: applies the write to a copy of the catalogue and returns it.
const makeApi = () => {
  let cat = CAT();
  return jest.fn(async (route, { method = "GET", body } = {}) => {
    expect(route).toBe("admin-species");
    if (method === "POST") cat = [...cat, { ...body.morph, notes: body.morph.notes || null, deleted_at: null, updated_at: "t2", species: [] }];
    if (method === "PATCH") {
      cat = cat.map(m => {
        if (m.id !== body.id) return m;
        const { deleted, ...rest } = body.changes;
        return { ...m, ...rest, ...(deleted !== undefined ? { deleted_at: deleted ? "2026-11-08T09:00:00Z" : null } : {}), updated_at: "t3" };
      });
    }
    if (method === "PUT") {
      cat = cat.map(m => {
        if (m.id !== body.morphId) return m;
        const others = m.species.filter(s => s.slug !== body.speciesSlug);
        return { ...m, species: body.assigned ? [...others, { slug: body.speciesSlug, cue_override: body.cueOverride || null, sort: 99 }] : others };
      });
    }
    return { morphs: cat, morphSource: "db" };
  });
};

let confirmSpy;
beforeEach(() => { confirmSpy = jest.spyOn(window, "confirm").mockImplementation(() => true); });
afterEach(() => confirmSpy.mockRestore());

describe("helpers", () => {
  test("slugify, validation and filtering", () => {
    expect(slugify("Pink / highland blotched")).toBe("pink-highland-blotched");
    expect(slugify("Hypo  Trans")).toBe("hypo-trans");
    expect(validateMorph({ id: "albino", name: "A", cue: "c" }, { catalogue: CAT(), creating: true }).id).toMatch(/already used by Albino/);
    expect(validateMorph({ id: "zero", name: "A", cue: "c" }, { catalogue: CAT(), creating: true }).id).toMatch(/deleted morph/);
    expect(validateMorph({ id: "Bad id", name: "", cue: " " }, { catalogue: CAT(), creating: true })).toEqual(expect.objectContaining({ id: expect.any(String), name: expect.any(String), cue: expect.any(String) }));
    expect(validateMorph({ name: "A", cue: "c" }, { catalogue: CAT() })).toEqual({});
    expect(filterMorphs(CAT()).map(m => m.id)).toEqual(["albino", "leatherback", "translucent"]);
    expect(filterMorphs(CAT(), { showDeleted: true })).toHaveLength(4);
    expect(filterMorphs(CAT(), { status: "check" }).map(m => m.id)).toEqual(["translucent"]);
    expect(filterMorphs(CAT(), { q: "see through" }).map(m => m.id)).toEqual(["translucent"]);
  });
  test("morphsForSpecies: active only, in sort order, species cue wins", () => {
    expect(morphsForSpecies(CAT(), "central-bearded-dragon")).toEqual([
      { id: "translucent", name: "Translucent", cue: "Dark eyes.", au_status: "check", cueOverride: "Dark eyes." },
      { id: "leatherback", name: "Leatherback", cue: "Smooth back.", au_status: "established", cueOverride: null },
    ]);
  });
});

describe("Admin → Morphs list", () => {
  test("search, status chips, species counts and show deleted", () => {
    render(<Harness api={makeApi()} path="/admin/morphs" />);
    expect(screen.getAllByTestId("morph-row")).toHaveLength(3);
    expect(screen.getByText("3 morphs and traits · 1 deleted")).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText("Show deleted"));
    expect(screen.getAllByTestId("morph-row")).toHaveLength(4);
    expect(screen.getByText("Deleted")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Established" }));
    expect(screen.getAllByTestId("morph-row").map(r => r.textContent)).toEqual([expect.stringContaining("Albino"), expect.stringContaining("Leatherback")]);
    fireEvent.change(screen.getByLabelText("Search morphs"), { target: { value: "albino" } });
    const row = screen.getByTestId("morph-row");
    expect(row).toHaveTextContent("1 species");
    expect(row).toHaveTextContent("Carpet Python");
  });
  test("read-only (database unreachable): no add button and a notice", () => {
    render(<Harness api={makeApi()} path="/admin/morphs" readOnly />);
    expect(screen.queryByRole("button", { name: "+ Add morph" })).toBeNull();
    expect(screen.getByRole("status")).toHaveTextContent(/built-in list/);
  });
});

describe("Add a morph", () => {
  test("id follows the name, validation blocks a bad save, then it saves and opens", async () => {
    const api = makeApi();
    render(<Harness api={api} path="/admin/morphs/new" />);
    fireEvent.click(screen.getByRole("button", { name: "Add morph" }));
    expect(screen.getByText("Add a name.")).toBeInTheDocument();
    expect(screen.getByText("Add the visual cue the AI looks for.")).toBeInTheDocument();
    expect(api).not.toHaveBeenCalled();

    fireEvent.change(screen.getByLabelText("Name *"), { target: { value: "Albino" } });
    expect(screen.getByLabelText("Id *")).toHaveValue("albino");
    fireEvent.change(screen.getByLabelText("Visual cue *"), { target: { value: "Pale." } });
    fireEvent.click(screen.getByRole("button", { name: "Add morph" }));
    expect(screen.getByText(/already used by Albino/)).toBeInTheDocument();
    expect(api).not.toHaveBeenCalled();

    fireEvent.change(screen.getByLabelText("Name *"), { target: { value: "Hypo Translucent" } });
    fireEvent.click(screen.getByRole("button", { name: "Established in AU" }));
    fireEvent.click(screen.getByRole("button", { name: "Add morph" }));
    await waitFor(() => expect(api).toHaveBeenCalledWith("admin-species", { method: "POST", body: { morph: { id: "hypo-translucent", name: "Hypo Translucent", cue: "Pale.", au_status: "established", notes: "" } } }));
    // Opens the new morph's page, where the id is fixed.
    await waitFor(() => expect(screen.getByText("hypo-translucent")).toBeInTheDocument());
    expect(screen.queryByLabelText("Id *")).toBeNull();
  });
});

describe("Edit, delete and restore", () => {
  test("delete is an in-page confirm (never window.confirm), soft, and offers restore", async () => {
    const api = makeApi();
    render(<Harness api={api} path="/admin/morphs/leatherback" />);
    fireEvent.click(screen.getByRole("button", { name: "Delete morph…" }));
    const dialog = screen.getByRole("alertdialog", { name: "Confirm delete" });
    expect(dialog).toHaveTextContent(/Old feedback and photo tags keep its name/);
    fireEvent.click(within(dialog).getByRole("button", { name: "Cancel" }));
    expect(screen.queryByRole("alertdialog")).toBeNull();
    expect(api).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Delete morph…" }));
    fireEvent.click(screen.getByRole("button", { name: "Yes, delete" }));
    await waitFor(() => expect(api).toHaveBeenCalledWith("admin-species", { method: "PATCH", body: { id: "leatherback", changes: { deleted: true } } }));
    expect(confirmSpy).not.toHaveBeenCalled();
    await waitFor(() => expect(screen.getByRole("button", { name: "Restore morph" })).toBeInTheDocument());
    expect(screen.getByText(/Restore this morph to assign it/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Restore morph" }));
    await waitFor(() => expect(api).toHaveBeenLastCalledWith("admin-species", { method: "PATCH", body: { id: "leatherback", changes: { deleted: false } } }));
    await waitFor(() => expect(screen.getByRole("button", { name: "Delete morph…" })).toBeInTheDocument());
  });

  test("edits save through PATCH; the id isn't editable", async () => {
    const api = makeApi();
    render(<Harness api={api} path="/admin/morphs/albino" />);
    expect(screen.queryByLabelText("Id *")).toBeNull();
    fireEvent.change(screen.getByLabelText("Visual cue *"), { target: { value: "  White with pink eyes. " } });
    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));
    await waitFor(() => expect(api).toHaveBeenCalledWith("admin-species", { method: "PATCH", body: { id: "albino", changes: { name: "Albino", cue: "White with pink eyes.", au_status: "established", notes: "" } } }));
    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent(/within a minute/));
  });

  test("assign a species from the index search, set its cue, and remove it", async () => {
    const api = makeApi();
    render(<Harness api={api} path="/admin/morphs/albino" />);
    fireEvent.change(screen.getByLabelText("Search species"), { target: { value: "jacky" } });
    fireEvent.click(screen.getByRole("button", { name: /Jacky Dragon/ }));
    await waitFor(() => expect(api).toHaveBeenCalledWith("admin-species", { method: "PUT", body: { morphId: "albino", speciesSlug: "jacky-dragon", assigned: true } }));
    const cue = await screen.findByLabelText("Cue for Jacky Dragon");
    fireEvent.change(cue, { target: { value: "Pale with red eyes." } });
    fireEvent.click(screen.getByRole("button", { name: "Save cue" }));
    await waitFor(() => expect(api).toHaveBeenLastCalledWith("admin-species", { method: "PUT", body: { morphId: "albino", speciesSlug: "jacky-dragon", assigned: true, cueOverride: "Pale with red eyes." } }));
    const removes = screen.getAllByRole("button", { name: "Remove" });
    fireEvent.click(removes[removes.length - 1]);
    await waitFor(() => expect(api).toHaveBeenLastCalledWith("admin-species", { method: "PUT", body: { morphId: "albino", speciesSlug: "jacky-dragon", assigned: false } }));
    await waitFor(() => expect(screen.queryByLabelText("Cue for Jacky Dragon")).toBeNull());
  });
});

describe("Photo library", () => {
  test("Morphs for this species: lists active ones, adds and removes", async () => {
    const api = makeApi();
    render(<Harness api={api} path="/admin/species/central-bearded-dragon" />);
    const panel = screen.getByTestId("species-morphs");
    expect(within(panel).getAllByRole("link").map(a => a.textContent)).toEqual(["Translucent", "Leatherback"]);
    fireEvent.click(within(panel).getByRole("button", { name: "Remove Translucent" }));
    await waitFor(() => expect(api).toHaveBeenCalledWith("admin-species", { method: "PUT", body: { morphId: "translucent", speciesSlug: "central-bearded-dragon", assigned: false } }));
    fireEvent.click(within(panel).getByRole("button", { name: "+ Add morph" }));
    fireEvent.change(within(panel).getByLabelText("Search morphs to add"), { target: { value: "alb" } });
    fireEvent.click(within(panel).getByRole("button", { name: /Albino/ }));
    await waitFor(() => expect(api).toHaveBeenLastCalledWith("admin-species", { method: "PUT", body: { morphId: "albino", speciesSlug: "central-bearded-dragon", assigned: true } }));
    await waitFor(() => expect(within(panel).getAllByRole("link").map(a => a.textContent)).toContain("Albino"));
  });

  test("photo trait tagging: the species' morphs, old tags by name, and a search for any other", () => {
    const onToggle = jest.fn();
    render(<MemoryRouter><TraitPicker catalogue={CAT()} speciesSlug="central-bearded-dragon" selected={["leatherback", "zero", "albino"]} onToggle={onToggle} /></MemoryRouter>);
    expect(screen.getByRole("button", { name: "Translucent" })).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByRole("button", { name: "Leatherback" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Zero (deleted) ×" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Albino ×" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Translucent" }));
    expect(onToggle).toHaveBeenLastCalledWith("translucent");
    fireEvent.click(screen.getByRole("button", { name: "+ Other morph" }));
    fireEvent.change(screen.getByLabelText("Search other morphs"), { target: { value: "a" } });
    // Already-shown and deleted morphs aren't offered.
    expect(screen.getByText(/No other morphs match/)).toBeInTheDocument();
  });
});
