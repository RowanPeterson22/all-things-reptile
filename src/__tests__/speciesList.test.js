// The species list (src/data/species.js) now derives from the bundled content
// snapshot (D5 step 2), so names and categories are written once. These are
// the invariants the hand-written list used to carry.
import { SPECIES } from "../data/species";
import { CATEGORIES } from "../data/categories";
import SNAPSHOT from "../data/speciesContent.json";

const IDENTIFY = require("../../lib/identifySpecies");

describe("the 46", () => {
  test("46 Australian natives: 15 snakes, 9 lizards, 6 geckos, 6 monitors, 4 turtles, 6 frogs", () => {
    expect(SPECIES).toHaveLength(46);
    const by = (t) => SPECIES.filter(s => s.type === t).length;
    expect([by("snake"), by("lizard"), by("gecko"), by("monitor"), by("turtle"), by("frog")]).toEqual([15, 9, 6, 6, 4, 6]);
    expect(SPECIES.map(s => s.name)).not.toContain("Leopard Gecko");
  });

  test("slugs are unique and hyphenated (D4); ids and legacy page keys unique", () => {
    const slugs = SPECIES.map(s => s.slug);
    expect(new Set(slugs).size).toBe(46);
    slugs.forEach(s => expect(s).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/));
    expect(new Set(SPECIES.map(s => s.id)).size).toBe(46);
    SPECIES.forEach(s => expect(s.page).toBe(s.id));
  });

  test("Black-headed Monitor and Black-headed Python never collide", () => {
    const m = SPECIES.find(s => s.name === "Black-headed Monitor");
    const p = SPECIES.find(s => s.name === "Black-headed Python");
    expect(m.slug).not.toBe(p.slug);
    expect(m.id).not.toBe(p.id);
    expect([m.type, p.type]).toEqual(["monitor", "snake"]);
  });

  test("ordered by the documents' sortOrder, with every snapshot field carried", () => {
    expect(SPECIES.map(s => s.slug)).toEqual([...SNAPSHOT].sort((a, b) => a.sortOrder - b.sortOrder).map(d => d.slug));
    const doc = SNAPSHOT.find(d => d.slug === "ackie-monitor");
    expect(SPECIES.find(s => s.slug === "ackie-monitor")).toMatchObject({ name: doc.name, latin: doc.latin, level: doc.level, emoji: doc.emoji, type: "monitor" });
  });

  test("category counts follow the list", () => {
    for (const c of CATEGORIES) expect([c.id, c.count]).toEqual([c.id, SPECIES.filter(s => s.type === c.id).length]);
  });

  test("the server's list (AI ID, category images) is the same 46", () => {
    expect(IDENTIFY.map(s => s.slug)).toEqual(SPECIES.map(s => s.slug));
    expect(IDENTIFY.map(s => s.type)).toEqual(SPECIES.map(s => s.type));
  });
});
