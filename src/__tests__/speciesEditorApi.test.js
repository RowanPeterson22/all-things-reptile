/**
 * @jest-environment node
 */
// /admin → Species (D5 step 2), server side: /api/admin-species?scope=content.
// The admin gate on every route, the content rules on save (shape, class
// codes, a monitor's basking banner, Dubia, TAS), publish / discard / revert
// with the revision log, and the optimistic concurrency check. Also the
// app's species list (GET /api/species-photos?contentList=1). Supabase is the
// in-memory double in src/testUtils/fakeSpeciesDb.js: no test data ever goes
// near the real species_content.

const host = require("vm").runInThisContext("({ crypto, TextEncoder, TextDecoder })");
for (const k of ["crypto", "TextEncoder", "TextDecoder"]) if (!globalThis[k]) globalThis[k] = host[k];

const handler = require("../../api/admin-species");
const photosHandler = require("../../api/species-photos");
const { clearTesterCache } = require("../../lib/beta");
const { clearContentCache } = require("../../lib/speciesContent");
const { createFakeSpeciesDb } = require("../testUtils/fakeSpeciesDb");
const SNAPSHOT = require("../data/speciesContent.json");

const ADMIN = "A".repeat(43);
const TESTER = "T".repeat(43);
const TESTERS = [
  { id: "aaaaaaaa-0000-4000-8000-000000000001", name: "Rowan Peterson", active: true, is_admin: true, invite_code: ADMIN, sections: ["id"] },
  { id: "bbbbbbbb-0000-4000-8000-000000000002", name: "Jane Citizen", active: true, is_admin: false, invite_code: TESTER, sections: ["species"] },
];
const clone = (v) => JSON.parse(JSON.stringify(v));

let db;
const mockRes = () => {
  const r = { headers: {}, statusCode: 200, body: undefined };
  r.setHeader = (k, v) => { r.headers[k.toLowerCase()] = v; };
  r.status = (c) => { r.statusCode = c; return r; };
  r.json = (b) => { r.body = b; return r; };
  return r;
};
const call = async (method, { code = ADMIN, query = {}, body } = {}) => {
  const r = mockRes();
  const headers = { "content-type": "application/json", ...(code ? { "x-atr-beta": code } : {}) };
  await handler({ method, headers, query: { scope: "content", ...query }, body }, r);
  return r;
};
const one = async (slug) => (await call("GET", { query: { slug } })).body.species;
const act = (body, code) => call("POST", { body, code });
const save = async (slug, edit, { expected } = {}) => {
  const cur = await one(slug);
  const draft = clone(cur.draft);
  edit(draft);
  return act({ action: "save", slug, draft, expectedUpdatedAt: expected || cur.updatedAt });
};
const contentCalls = () => db.calls.filter(c => c.table.startsWith("species_content"));

const saved = { env: { ...process.env }, fetch: global.fetch };
let errSpy;
beforeEach(() => {
  db = createFakeSpeciesDb({ docs: SNAPSHOT, testers: TESTERS });
  global.fetch = jest.fn(db.fetch);
  clearTesterCache();
  clearContentCache();
  Object.assign(process.env, { SUPABASE_URL: "https://ledcvbyiqkygcdleucqo.supabase.co", SUPABASE_SECRET_KEY: "sb_secret_test", ATR_GATE_SECRET: "s".repeat(48), VERCEL_ENV: "production" });
  delete process.env.ATR_PUBLIC;
  errSpy = jest.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => { process.env = { ...saved.env }; global.fetch = saved.fetch; errSpy.mockRestore(); });

describe("the admin gate covers every species-content route", () => {
  const routes = [
    ["GET list", "GET", {}],
    ["GET one", "GET", { query: { slug: "ackie-monitor" } }],
    ...["save", "publish", "discard", "revert"].map(a => [`POST ${a}`, "POST", { body: { action: a, slug: "ackie-monitor", expectedUpdatedAt: "2026-11-11T09:00:00+00:00", draft: SNAPSHOT[0], revisionId: 1 } }]),
  ];
  test.each(routes)("%s: no code → 403, nothing read", async (_, method, opts) => {
    const r = await call(method, { ...opts, code: null });
    expect(r.statusCode).toBe(403);
    expect(r.headers["cache-control"]).toBe("no-store");
    expect(contentCalls()).toEqual([]);
  });
  test.each(routes)("%s: a tester who isn't an admin → 403, nothing read or written", async (_, method, opts) => {
    const r = await call(method, { ...opts, code: TESTER });
    expect(r.statusCode).toBe(403);
    expect(contentCalls()).toEqual([]);
  });
  test("PATCH and PUT aren't content routes", async () => {
    expect((await call("PATCH", { body: {} })).statusCode).toBe(405);
    expect((await call("PUT", { body: {} })).statusCode).toBe(405);
  });
});

describe("reading", () => {
  test("the list: 46 species in order, with state and who changed each", async () => {
    const r = await call("GET");
    expect(r.statusCode).toBe(200);
    const list = r.body.species;
    expect(list).toHaveLength(46);
    expect(list.map(s => s.slug)).toEqual([...SNAPSHOT].sort((a, b) => a.sortOrder - b.sortOrder).map(d => d.slug));
    expect(list[0]).toMatchObject({ name: "Eastern Blue-tongue Skink", type: "lizard", status: "published", problems: 0, updatedBy: "migration:extract-species-content" });
    expect(list[0].draft).toBeUndefined(); // the list stays slim
  });

  test("one species: draft, published and its revisions", async () => {
    const s = await one("ackie-monitor");
    expect(s.draft).toEqual(SNAPSHOT.find(d => d.slug === "ackie-monitor"));
    expect(s.published).toEqual(s.draft);
    expect(s.revisions).toHaveLength(1);
    expect(s.revisions[0]).toMatchObject({ current: true, publishedBy: "migration" });
  });

  test("an unknown or malformed slug", async () => {
    expect((await call("GET", { query: { slug: "no-such-species" } })).statusCode).toBe(404);
    expect((await call("GET", { query: { slug: "../x" } })).statusCode).toBe(400);
  });
});

describe("save refuses rule-breaking drafts (and changes nothing)", () => {
  const cases = [
    ["a broken shape (a stat with no value)", "ackie-monitor", (d) => { d.tabs[0].blocks.find(b => b.type === "stats").items[0].value = ""; }, /stats/],
    ["an unknown block type", "ackie-monitor", (d) => { d.tabs[0].blocks.push({ type: "html", html: "<b>x</b>" }); }, /unknown block/],
    ["an NSW R-code", "ackie-monitor", (d) => { d.tabs[4].blocks[0].states[0].licence = "R2 licence"; }, /"R2" looks like a species class code/],
    ["a QLD 'Class 2 species'", "ackie-monitor", (d) => { d.tabs[4].blocks[0].states[2].note = "Class 2 species"; }, /class code/],
    ["a VIC schedule number", "ackie-monitor", (d) => { d.tabs[4].blocks[0].note = "Listed in Schedule 4."; }, /schedule numbers/],
    ["a WA category", "ackie-monitor", (d) => { d.tabs[4].blocks[0].states[4].licence = "Category 5"; }, /WA categories/],
    ["removing a monitor's basking banner", "ackie-monitor", (d) => { d.tabs[0].blocks = d.tabs[0].blocks.filter(b => b.type !== "basking"); }, /basking/],
    ["moving the basking banner off the first tab", "lace-monitor", (d) => { const b = d.tabs[0].blocks.find(x => x.type === "basking"); d.tabs[0].blocks = d.tabs[0].blocks.filter(x => x !== b); d.tabs[1].blocks.push(b); }, /basking/],
    ["a Dubia mention", "carpet-python", (d) => { d.tabs[1].blocks.find(b => b.type === "food").items[0].name = "Dubia roaches"; }, /Dubia/],
    ["opening TAS for a mainland species", "carpet-python", (d) => { d.tabs.find(t => t.key === "licencing").blocks[0].states[5].ok = true; }, /TAS/],
    ["rewording the locked TAS row", "carpet-python", (d) => { d.tabs.find(t => t.key === "licencing").blocks[0].states[5].licence = "Check locally"; }, /TAS row is fixed/],
    ["a second licence grid", "carpet-python", (d) => { d.tabs[0].blocks.push(clone(d.tabs.find(t => t.key === "licencing").blocks[0])); }, /exactly one licence/],
    ["a duplicate tab name", "carpet-python", (d) => { d.tabs[1].key = d.tabs[0].key; }, /unique/],
  ];
  test.each(cases)("%s", async (_, slug, edit, msg) => {
    const before = clone(db.row(slug));
    const r = await save(slug, edit);
    expect(r.statusCode).toBe(400);
    expect(r.body.problems.join("; ")).toMatch(msg);
    expect(db.row(slug)).toEqual(before);
  });

  test.each([
    ["the slug (D4)", (d) => { d.slug = "ackie"; }],
    ["the category", (d) => { d.type = "lizard"; }],
    ["the id", (d) => { d.id = "other"; }],
  ])("changing %s", async (_, edit) => {
    const before = clone(db.row("ackie-monitor"));
    const r = await save("ackie-monitor", edit);
    expect(r.statusCode).toBe(400);
    expect(r.body.problems.join("; ")).toMatch(/can't be changed/);
    expect(db.row("ackie-monitor")).toEqual(before);
  });

  test("the Blotched Blue-tongue (a TAS native) keeps its TAS permit", async () => {
    const r = await save("blotched-blue-tongue-skink", (d) => { d.tabs.find(t => t.key === "licencing").blocks[0].states[5].note = "from a licensed breeder"; });
    expect(r.statusCode).toBe(200);
  });

  test("D8's two exceptions are fine as values", async () => {
    const r = await save("sand-monitor", (d) => { d.tabs[0].blocks.find(b => b.type === "basking").range = "50–65°C"; d.tabs[0].blocks.find(b => b.type === "basking").title = "Hot basking"; });
    expect(r.statusCode).toBe(200);
  });

  test("not JSON, or no draft", async () => {
    const cur = await one("ackie-monitor");
    expect((await act({ action: "save", slug: "ackie-monitor", expectedUpdatedAt: cur.updatedAt })).statusCode).toBe(400);
    expect((await act({ action: "rename", slug: "ackie-monitor", expectedUpdatedAt: cur.updatedAt })).statusCode).toBe(400);
    expect((await act({ action: "save", slug: "ackie-monitor", draft: cur.draft })).statusCode).toBe(400); // no expectedUpdatedAt
  });
});

describe("save, publish, discard, revert", () => {
  test("save keeps the app unchanged and records who", async () => {
    const r = await save("carpet-python", (d) => { d.name = "Carpet Python (all forms)"; d.sortOrder = 99; });
    expect(r.statusCode).toBe(200);
    const s = r.body.species;
    expect(s).toMatchObject({ status: "changes", updatedBy: "Rowan Peterson", name: "Carpet Python (all forms)" });
    expect(s.published.name).toBe("Carpet Python");
    expect(db.row("carpet-python").sort_order).toBe(99);
    expect(db.row("carpet-python").updated_at).not.toBe(db.row("ackie-monitor").updated_at);
  });

  test("publish copies the draft and logs a revision; publishing again is refused", async () => {
    await save("carpet-python", (d) => { d.tabs[0].blocks[0].text = "Edited in /admin."; });
    const before = db.revisions.length;
    const cur = await one("carpet-python");
    const r = await act({ action: "publish", slug: "carpet-python", expectedUpdatedAt: cur.updatedAt });
    expect(r.statusCode).toBe(200);
    expect(r.body.species).toMatchObject({ status: "published", publishedBy: "Rowan Peterson" });
    expect(db.row("carpet-python").published.tabs[0].blocks[0].text).toBe("Edited in /admin.");
    expect(db.revisions.length).toBe(before + 1);
    expect(r.body.species.revisions[0]).toMatchObject({ current: true, publishedBy: "Rowan Peterson" });
    expect(r.body.species.revisions).toHaveLength(2);
    const again = await act({ action: "publish", slug: "carpet-python", expectedUpdatedAt: r.body.species.updatedAt });
    expect(again.statusCode).toBe(409);
    expect(db.revisions.length).toBe(before + 1);
  });

  test("discard puts the published version back in the draft", async () => {
    const saved1 = (await save("carpet-python", (d) => { d.latin = "Morelia spilota (edited)"; })).body.species;
    const r = await act({ action: "discard", slug: "carpet-python", expectedUpdatedAt: saved1.updatedAt });
    expect(r.statusCode).toBe(200);
    expect(r.body.species.status).toBe("published");
    expect(db.row("carpet-python").draft).toEqual(db.row("carpet-python").published);
    expect(r.body.species.updatedBy).toBe("Rowan Peterson");
  });

  test("revert loads a revision into the draft without publishing it", async () => {
    // v2 published, then revert to v1 (the migration's).
    let s = (await save("carpet-python", (d) => { d.tabs[0].blocks[0].text = "Version two."; })).body.species;
    s = (await act({ action: "publish", slug: "carpet-python", expectedUpdatedAt: s.updatedAt })).body.species;
    const v1 = s.revisions.find(r => !r.current);
    const r = await act({ action: "revert", slug: "carpet-python", revisionId: v1.id, expectedUpdatedAt: s.updatedAt });
    expect(r.statusCode).toBe(200);
    expect(r.body.species.status).toBe("changes");
    expect(db.row("carpet-python").draft).toEqual(SNAPSHOT.find(d => d.slug === "carpet-python"));
    expect(db.row("carpet-python").published.tabs[0].blocks[0].text).toBe("Version two.");
  });

  test("revert refuses a revision that breaks today's rules, or another species' revision", async () => {
    const s = await one("carpet-python");
    const bad = clone(s.draft);
    bad.tabs[0].blocks[0].text = "Feed Dubia roaches.";
    db.revisions.push({ id: 999, slug: "carpet-python", doc: bad, published_at: "2026-01-01T00:00:00+00:00", published_by: "old" });
    const r = await act({ action: "revert", slug: "carpet-python", revisionId: 999, expectedUpdatedAt: s.updatedAt });
    expect(r.statusCode).toBe(400);
    expect(r.body.problems.join(" ")).toMatch(/Dubia/);
    const other = db.revisions.find(x => x.slug === "ackie-monitor");
    expect((await act({ action: "revert", slug: "carpet-python", revisionId: other.id, expectedUpdatedAt: s.updatedAt })).statusCode).toBe(404);
  });
});

describe("concurrency: two tabs can't silently overwrite each other", () => {
  test("the second save from the same version is refused with the current state", async () => {
    const opened = await one("carpet-python");
    const a = clone(opened.draft); a.name = "From tab A";
    const b = clone(opened.draft); b.name = "From tab B";
    expect((await act({ action: "save", slug: "carpet-python", draft: a, expectedUpdatedAt: opened.updatedAt })).statusCode).toBe(200);
    const r = await act({ action: "save", slug: "carpet-python", draft: b, expectedUpdatedAt: opened.updatedAt });
    expect(r.statusCode).toBe(409);
    expect(r.body.conflict).toBe(true);
    expect(r.body.current.name).toBe("From tab A");
    expect(db.row("carpet-python").draft.name).toBe("From tab A");
  });

  test("publishing, discarding or reverting from a stale tab is refused", async () => {
    const opened = await one("carpet-python");
    await save("carpet-python", (d) => { d.name = "Newer"; });
    for (const action of ["publish", "discard", "revert"]) {
      const r = await act({ action, slug: "carpet-python", revisionId: opened.revisions[0].id, expectedUpdatedAt: opened.updatedAt });
      expect([action, r.statusCode]).toEqual([action, 409]);
    }
    expect(db.row("carpet-python").published.name).toBe("Carpet Python");
  });

  test("a write that loses the race at the database is refused too", async () => {
    const opened = await one("carpet-python");
    const realFetch = global.fetch;
    // Another admin's save lands between our read and our conditional PATCH.
    global.fetch = jest.fn(async (url, init = {}) => {
      if ((init.method || "GET") === "PATCH") { db.row("carpet-python").updated_at = "2026-11-11T10:00:00+00:00"; global.fetch = realFetch; }
      return db.fetch(url, init);
    });
    const d = clone(opened.draft); d.name = "Too late";
    const r = await act({ action: "save", slug: "carpet-python", draft: d, expectedUpdatedAt: opened.updatedAt });
    expect(r.statusCode).toBe(409);
    expect(db.row("carpet-python").draft.name).toBe("Carpet Python");
  });
});

describe("the app's species list (GET /api/species-photos?contentList=1)", () => {
  const get = async (headers = {}) => {
    const r = mockRes();
    await photosHandler({ method: "GET", headers, query: { contentList: "1" } }, r);
    return r;
  };

  test("gated: no pass → 401 and Supabase never asked", async () => {
    const r = await get();
    expect(r.statusCode).toBe(401);
    expect(contentCalls()).toEqual([]);
  });

  test("a tester gets published names and order, cached 15 s privately", async () => {
    await save("carpet-python", (d) => { d.name = "Carpet Python (edited)"; });
    let s = await one("carpet-python");
    await act({ action: "publish", slug: "carpet-python", expectedUpdatedAt: s.updatedAt });
    const r = await get({ "x-atr-beta": TESTER });
    expect(r.statusCode).toBe(200);
    expect(r.headers["cache-control"]).toBe("private, max-age=15");
    expect(r.body.species).toHaveLength(46);
    expect(r.body.species.find(x => x.slug === "carpet-python")).toEqual({ slug: "carpet-python", id: "carpet", name: "Carpet Python (edited)", latin: "Morelia spilota", aka: null, type: "snake", level: "Intermediate", emoji: "🐍", sortOrder: 28 });
    // Only the slim identity fields, never the page bodies.
    expect(Object.keys(r.body.species[0]).sort()).toEqual(["aka", "emoji", "id", "latin", "level", "name", "slug", "sortOrder", "type"]);
  });

  test("public: edge-cached 15 s; a published document that fails the shape is left out", async () => {
    process.env.ATR_PUBLIC = "true";
    db.row("ackie-monitor").published.tabs[0].blocks[0].text = "Dubia roaches";
    const r = await get();
    expect(r.statusCode).toBe(200);
    expect(r.headers["cache-control"]).toBe("public, max-age=15, s-maxage=15, stale-while-revalidate=15");
    expect(r.body.species.map(x => x.slug)).not.toContain("ackie-monitor");
    expect(r.body.species).toHaveLength(45);
  });
});
