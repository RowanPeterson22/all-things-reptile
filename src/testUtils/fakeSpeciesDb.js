// ─── In-memory Supabase double for species_content (tests only) ───
// PostgREST over fetch, just enough for lib/adminSpeciesContent.js,
// lib/speciesContent.js and the admin gate: beta_testers lookups,
// species_content reads and conditional PATCHes (eq filters on slug and
// updated_at, Prefer: return=representation), species_content_revisions
// reads, and the two triggers from the migration (updated_at moves only when
// the draft changes; every newly published document is logged). Never talks
// to the real database. CommonJS so node tests and scripts can share it.

const clone = (v) => JSON.parse(JSON.stringify(v));

const createFakeSpeciesDb = ({ docs, testers = [], start = Date.parse("2026-11-11T09:00:00Z") } = {}) => {
  let clock = start;
  const tick = () => { clock += 1000; return new Date(clock).toISOString().replace("Z", "+00:00"); };
  const stamp = tick();
  const db = {
    rows: docs.map(d => ({
      slug: d.slug, sort_order: d.sortOrder, draft: clone(d), published: clone(d), published_at: stamp, published_by: "migration",
      created_at: stamp, updated_at: stamp, updated_by: "migration:extract-species-content",
    })),
    revisions: [],
    testers,
    calls: [],
    down: false,
  };
  let nextRev = 1;
  db.rows.forEach(r => db.revisions.push({ id: nextRev++, slug: r.slug, doc: clone(r.published), published_at: r.published_at, published_by: r.published_by }));

  const json = (status, body) => ({
    ok: status >= 200 && status < 300, status,
    json: async () => clone(body), text: async () => (body === undefined || body === null ? "" : JSON.stringify(body)),
  });
  const eq = (q, k) => { const v = q.get(k); return v && v.startsWith("eq.") ? v.slice(3) : null; };
  const pick = (row, select) => {
    if (!select || select === "*") return clone(row);
    return Object.fromEntries(select.split(",").map(k => [k, clone(row[k] === undefined ? null : row[k])]));
  };
  const sameJson = (a, b) => JSON.stringify(a) === JSON.stringify(b);

  const fetch = async (url, init = {}) => {
    const u = new URL(url);
    const method = init.method || "GET";
    const q = u.searchParams;
    const table = u.pathname.replace(/^\/rest\/v1\//, "");
    db.calls.push({ method, table, query: u.search });
    if (db.down) throw new Error("network down");

    if (table === "beta_testers") {
      let rows = db.testers.filter(t => t.invite_code === eq(q, "invite_code") && t.active);
      if (q.get("is_admin") === "is.true") rows = rows.filter(t => t.is_admin);
      return json(200, rows.map(t => ({ id: t.id, name: t.name, sections: t.sections || ["id"], is_admin: t.is_admin })));
    }
    if (table === "species_content") {
      const slug = eq(q, "slug");
      const at = eq(q, "updated_at");
      let rows = db.rows.filter(r => (slug === null || r.slug === slug) && (at === null || r.updated_at === at));
      if (method === "GET") {
        rows = [...rows].sort((a, b) => a.sort_order - b.sort_order || a.slug.localeCompare(b.slug));
        const limit = Number(q.get("limit")) || rows.length;
        return json(200, rows.slice(0, limit).map(r => pick(r, q.get("select"))));
      }
      if (method === "PATCH") {
        const body = JSON.parse(init.body);
        for (const r of rows) {
          const before = clone(r);
          Object.assign(r, clone(body));
          if (!sameJson(before.draft, r.draft)) r.updated_at = tick();      // species_content_touch
          if (r.published && !sameJson(before.published, r.published)) {   // species_content_log_publish
            db.revisions.push({ id: nextRev++, slug: r.slug, doc: clone(r.published), published_at: r.published_at, published_by: r.published_by });
          }
        }
        return json(200, rows.map(r => pick(r, q.get("select"))));
      }
    }
    if (table === "species_content_revisions" && method === "GET") {
      const slug = eq(q, "slug");
      const id = eq(q, "id");
      let rows = db.revisions.filter(r => (slug === null || r.slug === slug) && (id === null || String(r.id) === id));
      rows = [...rows].sort((a, b) => b.published_at.localeCompare(a.published_at) || b.id - a.id);
      return json(200, rows.slice(0, Number(q.get("limit")) || rows.length).map(r => pick(r, q.get("select"))));
    }
    return json(404, null);
  };

  db.fetch = fetch;
  db.row = (slug) => db.rows.find(r => r.slug === slug);
  return db;
};

module.exports = { createFakeSpeciesDb };
