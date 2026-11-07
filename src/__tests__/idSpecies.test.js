// AI ID beta, full-species upgrade: the slim picker index, type-ahead search,
// the suggestion card (care link, venomous, unmatched, not native) and the
// feedback card's species picker and slug. Jest-only; nothing here is bundled.
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { prepareIndex, searchSpecies, matchedAltName, normalise, loadSpeciesIndex } from "../beta/speciesSearch";
import IdSuggestionCard, { NotNativeNotice, NOT_NATIVE_TITLE, VENOMOUS_WARNING } from "../components/IdSuggestionCard";
import IdFeedbackCard from "../components/IdFeedbackCard";
import PICKER from "../data/speciesPicker.json";
import FULL from "../data/australianSpecies.json";

const { derivePickerIndex } = require("../../lib/speciesPicker");

const entries = prepareIndex(PICKER);
const slugs = (q, n) => searchSpecies(entries, q, n).map(e => e.slug);

describe("picker index", () => {
  test("is in sync with australianSpecies.json (run scripts/build-species-picker.mjs)", () => {
    expect(PICKER).toEqual(derivePickerIndex(FULL));
    expect(PICKER).toHaveLength(FULL.length);
  });
  test("carries app slugs for exactly the 46 app species and the venomous flag", () => {
    expect(PICKER.filter(r => r.p)).toHaveLength(46);
    expect(PICKER.find(r => r.s === "eastern-brown-snake").v).toBe(1);
    expect(PICKER.find(r => r.s === "jacky-dragon").p).toBeUndefined();
  });
});

describe("picker search", () => {
  test("finds by common name prefix, best match first", () => {
    expect(slugs("jacky")[0]).toBe("jacky-dragon");
    expect(slugs("Jacky Dragon")[0]).toBe("jacky-dragon");
  });
  test("finds by scientific name and word prefixes", () => {
    expect(slugs("amphibolurus muricatus")[0]).toBe("jacky-dragon");
    expect(slugs("amph mur")).toContain("jacky-dragon");
    expect(slugs("pseudonaja textilis")[0]).toBe("eastern-brown-snake");
  });
  test("finds by other common names and synonyms, and says which matched", () => {
    expect(slugs("jacky lizard")[0]).toBe("jacky-dragon");
    const hit = searchSpecies(entries, "Lophognathus burnsi")[0];
    expect(hit.slug).toBe("channel-dragon");
    expect(matchedAltName(hit, "Lophognathus burnsi")).toBe("Lophognathus burnsi");
    expect(matchedAltName(hit, "channel")).toBeNull();
  });
  test("is forgiving of case, accents and punctuation", () => {
    expect(normalise("  Children’s  PYTHON ")).toBe("childrens python");
    expect(slugs("childrens python")[0]).toBe("childrens-python");
  });
  test("searches all 1,363+ records, with no boost for app species", () => {
    // "water dragon": the app's Eastern Water Dragon doesn't jump the queue on a tie.
    const res = searchSpecies(entries, "dragon", 200);
    expect(res.length).toBeGreaterThan(50);
    const names = res.slice(0, 5).map(e => e.common);
    expect([...names].sort((a, b) => a.localeCompare(b, "en"))).toEqual(names);
  });
  test("empty or junk queries return nothing; results are capped", () => {
    expect(searchSpecies(entries, "")).toEqual([]);
    expect(searchSpecies(entries, "zzzzqqq")).toEqual([]);
    expect(searchSpecies(entries, "skink", 12)).toHaveLength(12);
  });
  test("loads the index lazily and caches it", async () => {
    const a = await loadSpeciesIndex();
    expect(a).toHaveLength(PICKER.length);
    expect(await loadSpeciesIndex()).toBe(a);
  });
});

const sug = (over) => ({ slug: null, appSlug: null, inApp: false, matched: true, name: "", latin: "", group: null, dangerouslyVenomous: false, confidence: "likely", reason: "", traits: [], ...over });
const JACKY = sug({ slug: "jacky-dragon", name: "Jacky Dragon", latin: "Amphibolurus muricatus", group: "dragon" });
const EWD = sug({ slug: "eastern-water-dragon", appSlug: "eastern-water-dragon", inApp: true, name: "Eastern Water Dragon", latin: "Intellagama lesueurii", confidence: "possible" });
const BROWN = sug({ slug: "eastern-brown-snake", name: "Eastern Brown Snake", latin: "Pseudonaja textilis", group: "elapid", dangerouslyVenomous: true });

describe("suggestion card", () => {
  test("a non-app species shows its name with 'No care guide yet' and no link", () => {
    const onOpen = jest.fn();
    render(<IdSuggestionCard suggestion={JACKY} onOpen={onOpen} />);
    expect(screen.getByText("Jacky Dragon")).toBeInTheDocument();
    expect(screen.getByText("No care guide yet")).toBeInTheDocument();
    expect(screen.queryByText(/View care guide/)).toBeNull();
    expect(screen.queryByText(/Not one of our species/)).toBeNull();
    fireEvent.click(screen.getByTestId("id-suggestion"));
    expect(onOpen).not.toHaveBeenCalled();
  });
  test("an app species links to its care guide by app slug", () => {
    const onOpen = jest.fn();
    render(<IdSuggestionCard suggestion={EWD} onOpen={onOpen} />);
    expect(screen.getByText(/View care guide/)).toBeInTheDocument();
    fireEvent.click(screen.getByTestId("id-suggestion"));
    expect(onOpen).toHaveBeenCalledWith("eastern-water-dragon");
  });
  test("a dangerously venomous species gets its own red warning; others don't", () => {
    const { unmount } = render(<IdSuggestionCard suggestion={BROWN} />);
    expect(screen.getByRole("alert")).toHaveTextContent("Dangerously venomous");
    expect(screen.getByRole("alert")).toHaveTextContent(VENOMOUS_WARNING);
    unmount();
    render(<IdSuggestionCard suggestion={JACKY} />);
    expect(screen.queryByRole("alert")).toBeNull();
  });
  test("a made-up name is marked unmatched, with no care-guide line", () => {
    render(<IdSuggestionCard suggestion={sug({ matched: false, name: "Rainbow Dragon", latin: "Pogona imaginaria" })} />);
    expect(screen.getByText(/Unmatched: not in our Australian species list/)).toBeInTheDocument();
    expect(screen.queryByText("No care guide yet")).toBeNull();
    expect(screen.queryByText(/View care guide/)).toBeNull();
  });
  test("a non-native animal: plain notice, and the guess is labelled outside coverage", () => {
    render(<><NotNativeNotice /><IdSuggestionCard suggestion={sug({ matched: false, outsideCoverage: true, name: "Cane Toad", latin: "Rhinella marina" })} /></>);
    expect(screen.getByText(NOT_NATIVE_TITLE)).toBeInTheDocument();
    expect(NOT_NATIVE_TITLE).toBe("This doesn't look like an Australian native species.");
    expect(screen.getByText(/outside ATR's coverage/)).toBeInTheDocument();
    expect(screen.getByText(/Suggestion only/)).toBeInTheDocument();
    expect(screen.queryByText(/View care guide/)).toBeNull();
  });
});

describe("feedback card", () => {
  let run = 1000;
  const TRAITS = { "central-bearded-dragon": [{ id: "translucent", name: "Translucent" }, { id: "hypomelanistic", name: "Hypomelanistic" }] };
  const setup = (suggestions) => {
    const fetchMock = jest.fn(async () => ({ ok: true, status: 201, json: async () => ({ ok: true }) }));
    global.fetch = fetchMock;
    const result = { subject: "reptile", notNative: false, note: "", suggestions, model: "claude-sonnet-5-5" };
    render(<IdFeedbackCard result={result} photo={null} inviteCode="code" traitsBySpecies={TRAITS} runId={run++} />);
    const sent = () => JSON.parse(fetchMock.mock.calls[0][1].body);
    return { fetchMock, sent };
  };
  const savedFetch = global.fetch;
  afterEach(() => { global.fetch = savedFetch; });

  test("'Correct' on a non-app top pick sends its index slug", async () => {
    const { sent } = setup([JACKY, EWD]);
    fireEvent.click(screen.getByRole("button", { name: "Correct" }));
    fireEvent.click(screen.getByRole("button", { name: "Send feedback" }));
    await waitFor(() => expect(screen.getByText(/feedback sent/)).toBeInTheDocument());
    expect(sent().correctSpeciesSlug).toBe("jacky-dragon");
    expect(sent().correctSpeciesOther).toBeUndefined();
  });
  test("tapping an AI suggestion picks it by slug (Rowan's correction to Jacky Dragon)", async () => {
    const { sent } = setup([EWD, JACKY]);
    fireEvent.click(screen.getByRole("button", { name: "Wrong" }));
    fireEvent.click(screen.getByRole("button", { name: "Change" }));
    fireEvent.click(screen.getByRole("button", { name: /Jacky Dragon/ }));
    fireEvent.click(screen.getByRole("button", { name: "Send feedback" }));
    await waitFor(() => expect(screen.getByText(/feedback sent/)).toBeInTheDocument());
    expect(sent().correctSpeciesSlug).toBe("jacky-dragon");
  });
  test("search picks any native species and sends its slug", async () => {
    const { sent } = setup([EWD]);
    fireEvent.click(screen.getByRole("button", { name: "Wrong" }));
    fireEvent.click(screen.getByRole("button", { name: "Change" }));
    const input = await screen.findByPlaceholderText("Common or scientific name");
    await waitFor(() => expect(input).not.toBeDisabled());
    fireEvent.change(input, { target: { value: "pseudonaja text" } });
    const option = await screen.findByRole("option", { name: /Eastern Brown Snake/ });
    expect(option).toHaveTextContent("Venomous");
    fireEvent.click(option);
    expect(screen.getByText("Eastern Brown Snake")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Send feedback" }));
    await waitFor(() => expect(screen.getByText(/feedback sent/)).toBeInTheDocument());
    expect(sent().correctSpeciesSlug).toBe("eastern-brown-snake");
  });
  test("an unmatched suggestion fills Other with its name; Other sends free text", async () => {
    const { sent } = setup([sug({ matched: false, name: "Rainbow Dragon", latin: "Pogona imaginaria" })]);
    fireEvent.click(screen.getByRole("button", { name: "Wrong" }));
    expect(screen.getByRole("button", { name: /Rainbow Dragon/ })).toHaveTextContent("Unmatched");
    fireEvent.click(screen.getByRole("button", { name: /Rainbow Dragon/ }));
    expect(screen.getByLabelText("Species name")).toHaveValue("Rainbow Dragon (Pogona imaginaria)");
    fireEvent.click(screen.getByRole("button", { name: "Send feedback" }));
    await waitFor(() => expect(screen.getByText(/feedback sent/)).toBeInTheDocument());
    expect(sent()).toMatchObject({ correctSpeciesSlug: "other", correctSpeciesOther: "Rainbow Dragon (Pogona imaginaria)" });
  });
  test("'Not sure' sends no species", async () => {
    const { sent } = setup([JACKY]);
    fireEvent.click(screen.getByRole("button", { name: "Partly" }));
    fireEvent.click(screen.getByRole("button", { name: "Change" }));
    fireEvent.click(screen.getByRole("button", { name: "Not sure" }));
    fireEvent.click(screen.getByRole("button", { name: "Send feedback" }));
    await waitFor(() => expect(screen.getByText(/feedback sent/)).toBeInTheDocument());
    expect(sent().correctSpeciesSlug).toBeNull();
  });
  test("morph chips show for app species with morphs (keyed by app slug) and clear for others", async () => {
    const beardie = sug({ slug: "central-bearded-dragon", appSlug: "central-bearded-dragon", inApp: true, name: "Central Bearded Dragon", latin: "Pogona vitticeps", traits: [{ id: "translucent", name: "Translucent", confidence: "likely" }] });
    const { sent } = setup([beardie, JACKY]);
    fireEvent.click(screen.getByRole("button", { name: "Partly" }));
    expect(screen.getByRole("button", { name: "Translucent" })).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(screen.getByRole("button", { name: "Hypomelanistic" }));
    fireEvent.click(screen.getByRole("button", { name: "Send feedback" }));
    await waitFor(() => expect(screen.getByText(/feedback sent/)).toBeInTheDocument());
    expect(sent()).toMatchObject({ correctSpeciesSlug: "central-bearded-dragon", correctTraits: ["translucent", "hypomelanistic"] });
  });
  test("switching to a species without morphs hides and clears the chips", async () => {
    const beardie = sug({ slug: "central-bearded-dragon", appSlug: "central-bearded-dragon", inApp: true, name: "Central Bearded Dragon", latin: "Pogona vitticeps", traits: [{ id: "translucent", name: "Translucent", confidence: "likely" }] });
    const { sent } = setup([beardie, JACKY]);
    fireEvent.click(screen.getByRole("button", { name: "Partly" }));
    fireEvent.click(screen.getByRole("button", { name: "Change" }));
    fireEvent.click(screen.getByRole("button", { name: /Jacky Dragon/ }));
    expect(screen.queryByRole("button", { name: "Translucent" })).toBeNull();
    await act(async () => { fireEvent.click(screen.getByRole("button", { name: "Send feedback" })); });
    expect(sent()).toMatchObject({ correctSpeciesSlug: "jacky-dragon", correctTraits: [] });
  });
});
