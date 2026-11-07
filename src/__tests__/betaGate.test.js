// Front-end beta gate: the ID tab and /id route only appear for a verified
// invite code. Runs in jsdom with a mocked fetch.
import { render, screen, act, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AppShell } from "../App";
import { checkCode, inviteFromSearch, readCode, STORAGE_KEY } from "../beta/betaAccess";
import IdFeedbackCard, { CONSENT_LABEL, CONSENT_TEXT } from "../components/IdFeedbackCard";

const CODE = "b".repeat(43);
const okRes = (body) => ({ ok: true, status: 200, json: async () => body });
const TRAITS = { "central-bearded-dragon": [{ id: "translucent", name: "Translucent" }, { id: "leatherback", name: "Leatherback" }] };

// The splash screen runs for 4.4 s before the shell renders.
const renderAt = async (path) => {
  jest.useFakeTimers();
  const utils = render(<MemoryRouter initialEntries={[path]}><AppShell /></MemoryRouter>);
  await act(async () => { jest.advanceTimersByTime(5000); });
  jest.useRealTimers();
  await act(async () => { await Promise.resolve(); });
  return utils;
};

beforeEach(() => { window.localStorage.clear(); global.fetch = jest.fn(); });
afterEach(() => { delete global.fetch; });

describe("betaAccess helpers", () => {
  test("only well-formed invite codes are taken from the URL or storage", () => {
    expect(inviteFromSearch(`?invite=${CODE}`)).toBe(CODE);
    expect(inviteFromSearch("?invite=short")).toBe("");
    expect(inviteFromSearch("")).toBe("");
    window.localStorage.setItem(STORAGE_KEY, "junk");
    expect(readCode()).toBe("");
  });
  test("storage that throws is treated as no code", () => {
    const spy = jest.spyOn(Storage.prototype, "getItem").mockImplementation(() => { throw new Error("blocked"); });
    expect(readCode()).toBe("");
    spy.mockRestore();
  });
  test("checkCode sends the header and separates revoked from transient", async () => {
    const f = jest.fn(async () => okRes({ ok: true, name: "Jane", traits: TRAITS }));
    expect(await checkCode(CODE, f)).toEqual({ ok: true, name: "Jane", traits: TRAITS });
    expect(f.mock.calls[0][1].headers).toEqual({ "x-atr-beta": CODE });
    expect(await checkCode(CODE, async () => ({ ok: false, status: 403 }))).toEqual({ ok: false, revoked: true });
    expect(await checkCode(CODE, async () => ({ ok: false, status: 503 }))).toEqual({ ok: false, revoked: false });
    expect(await checkCode(CODE, async () => { throw new Error("offline"); })).toEqual({ ok: false, revoked: false });
    const never = jest.fn();
    expect(await checkCode("bad", never)).toEqual({ ok: false, revoked: false });
    expect(never).not.toHaveBeenCalled();
  });
});

describe("App shell gate", () => {
  test("public: no ID tab, /id sends you home, no beta request is made", async () => {
    await renderAt("/id");
    expect(screen.queryByText("ID Reptile")).toBeNull();
    expect(screen.queryByText(/Identify a reptile or frog/)).toBeNull();
    expect(screen.getByText("Browse")).toBeInTheDocument();
    expect(global.fetch).not.toHaveBeenCalled();
  });
  test("a valid invite link stores the code and shows the ID tab and screen", async () => {
    global.fetch = jest.fn(async () => okRes({ ok: true, name: "Jane", traits: TRAITS }));
    await renderAt(`/id?invite=${CODE}`);
    expect(window.localStorage.getItem(STORAGE_KEY)).toBe(CODE);
    expect(global.fetch).toHaveBeenCalledWith("/api/beta-check", expect.objectContaining({ headers: { "x-atr-beta": CODE } }));
    expect(await screen.findByText("ID Reptile")).toBeInTheDocument();
    expect(await screen.findByText(/Identify a reptile or frog/)).toBeInTheDocument();
  });
  test("a rejected code is cleared and the feature stays hidden", async () => {
    window.localStorage.setItem(STORAGE_KEY, CODE);
    global.fetch = jest.fn(async () => ({ ok: false, status: 403 }));
    await renderAt("/id");
    expect(screen.queryByText("ID Reptile")).toBeNull();
    expect(screen.queryByText(/Identify a reptile or frog/)).toBeNull();
    expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull();
  });
});

describe("IdFeedbackCard", () => {
  const result = { subject: "reptile", note: "", model: "m", suggestions: [{ slug: "central-bearded-dragon", inApp: true, name: "Central Bearded Dragon", latin: "", confidence: "likely", reason: "", traits: [{ id: "translucent", name: "Translucent", confidence: "likely" }] }] };
  const setup = (photo = "data:image/jpeg;base64,AAAA") => render(<IdFeedbackCard result={result} photo={photo} inviteCode={CODE} traitsBySpecies={TRAITS} />);

  test("consent is off by default and the photo is only sent when ticked", async () => {
    global.fetch = jest.fn(async () => ({ ok: true, status: 201, json: async () => ({ ok: true }) }));
    setup();
    fireEvent.click(screen.getByText("Partly"));
    expect(screen.getByText(CONSENT_LABEL)).toBeInTheDocument();
    expect(screen.getByText(CONSENT_TEXT)).toBeInTheDocument();
    expect(screen.getByRole("checkbox")).not.toBeChecked();
    fireEvent.click(screen.getByText("Leatherback"));
    await act(async () => { fireEvent.click(screen.getByText("Send feedback")); });
    const [url, init] = global.fetch.mock.calls[0];
    expect(url).toBe("/api/feedback");
    expect(init.headers["x-atr-beta"]).toBe(CODE);
    const body = JSON.parse(init.body);
    expect(body).toMatchObject({ verdict: "partly", correctSpeciesSlug: "central-bearded-dragon", correctTraits: ["translucent", "leatherback"], photoConsent: false });
    expect(body.photo).toBeUndefined();
    expect(await screen.findByText(/Thanks — feedback sent/)).toBeInTheDocument();
  });
  test("ticking consent sends the photo", async () => {
    global.fetch = jest.fn(async () => ({ ok: true, status: 201, json: async () => ({ ok: true }) }));
    setup();
    fireEvent.click(screen.getByText("Correct"));
    fireEvent.click(screen.getByRole("checkbox"));
    await act(async () => { fireEvent.click(screen.getByText("Send feedback")); });
    const body = JSON.parse(global.fetch.mock.calls[0][1].body);
    expect(body.photoConsent).toBe(true);
    expect(body.photo).toBe("data:image/jpeg;base64,AAAA");
  });
  test("'Wrong' needs a species or note before it can be sent", () => {
    setup();
    fireEvent.click(screen.getByText("Wrong"));
    fireEvent.change(screen.getByLabelText("What is it actually?"), { target: { value: "" } });
    expect(screen.getByText("Send feedback").closest("button")).toBeDisabled();
    fireEvent.change(screen.getByLabelText("Notes"), { target: { value: "Juvenile Eastern Beardie" } });
    expect(screen.getByText("Send feedback").closest("button")).not.toBeDisabled();
  });
});
