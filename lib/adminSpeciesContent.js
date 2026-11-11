// ─── Admin: species content editor (D5 step 2, /admin → Species) ──
// Reads and writes species_content (atr project) for the editor. Every write
// is checked against the shared shape and content rules
// (src/data/speciesContentShape.js: eight states, TAS fixed for non-TAS
// species, monitor basking banner, no class codes, no Dubia) and against the
// stored identity (slug, id, category and emoji never change; the list stays
// the 46). Served by /api/admin-species?scope=content behind adminRoute().
//
//   GET                       the list: name, category, draft/published state, who changed it
//   GET  &slug=<slug>         one species: draft, published, the last 30 revisions
//   POST { action: "save",    slug, draft,      expectedUpdatedAt }
//   POST { action: "publish", slug,             expectedUpdatedAt }   draft → published (logs a revision)
//   POST { action: "discard", slug,             expectedUpdatedAt }   draft ← published
//   POST { action: "revert",  slug, revisionId, expectedUpdatedAt }   draft ← that revision (not published)
//
// Concurrency: each write names the updated_at it was based on and only
// applies if the row still has it (a conditional PATCH), so two admin tabs
// can't silently overwrite each other; a stale tab gets 409 and reloads.
// updated_at moves only when the draft changes (trigger), so publishing the
// draft you're looking at is always safe.

const { rest, fail, SLUG_RE } = require("./admin");
const { validateDoc, identityErrors } = require("../src/data/speciesContentShape.js");

const COLS = "slug,sort_order,draft,published,published_at,published_by,updated_at,updated_by";
const REVISIONS = 30;
const MAX_DOC_CHARS = 200000;

// jsonb doesn't keep key order, so compare with sorted keys.
const stable = (v) => (Array.isArray(v) ? `[${v.map(stable).join(",")}]`
  : v && typeof v === "object" ? `{${Object.keys(v).sort().map(k => `${JSON.stringify(k)}:${stable(v[k])}`).join(",")}}`
    : JSON.stringify(v));
const same = (a, b) => stable(a) === stable(b);

const statusOf = (row) => (!row.published ? "unpublished" : same(row.draft, row.published) ? "published" : "changes");

const who = (admin) => String((admin && (admin.name || admin.id)) || "admin").slice(0, 120);

const requireSlug = (v) => {
  if (typeof v !== "string" || v.length > 100 || !SLUG_RE.test(v)) fail(400, "Send a valid species slug.");
  return v;
};
const requireStamp = (v) => {
  if (typeof v !== "string" || !v || v.length > 60 || Number.isNaN(Date.parse(v))) fail(400, "Send expectedUpdatedAt (the version you edited). Reload the species and try again.");
  return v;
};

const readRow = async (cfg, slug) => {
  const rows = await rest(cfg, `species_content?select=${COLS}&slug=eq.${encodeURIComponent(slug)}&limit=1`, { method: "GET" }, "species content read");
  const row = Array.isArray(rows) && rows[0];
  if (!row) fail(404, "No such species.");
  return row;
};

const summary = (row) => {
  const d = row.draft || {};
  return {
    slug: row.slug, name: d.name, latin: d.latin, type: d.type, level: d.level, sortOrder: row.sort_order,
    status: statusOf(row), problems: validateDoc(d).length,
    updatedAt: row.updated_at, updatedBy: row.updated_by, publishedAt: row.published_at, publishedBy: row.published_by,
  };
};

const detail = async (cfg, slug) => {
  const row = await readRow(cfg, slug);
  const revs = await rest(cfg, `species_content_revisions?select=id,doc,published_at,published_by&slug=eq.${encodeURIComponent(slug)}&order=published_at.desc,id.desc&limit=${REVISIONS}`, { method: "GET" }, "species revisions read");
  return {
    ...summary(row), draft: row.draft, published: row.published,
    revisions: (revs || []).map(r => ({ id: r.id, publishedAt: r.published_at, publishedBy: r.published_by, doc: r.doc, current: Boolean(row.published) && same(r.doc, row.published) })),
  };
};

const conflict = async (cfg, slug) => ({
  status: 409,
  body: { error: "This species changed since you opened it (another tab or admin). Reload to see the latest, then make your change again.", conflict: true, current: summary(await readRow(cfg, slug)) },
});

// The conditional write: applies only while updated_at is still `expected`.
// → the updated row, or null when someone got there first.
const patchIf = async (cfg, slug, expected, changes) => {
  const rows = await rest(cfg, `species_content?slug=eq.${encodeURIComponent(slug)}&updated_at=eq.${encodeURIComponent(expected)}&select=${COLS}`, {
    method: "PATCH", headers: { Prefer: "return=representation" }, body: JSON.stringify(changes),
  }, "species content write");
  return Array.isArray(rows) && rows[0] ? rows[0] : null;
};

const refused = (error, problems) => ({ status: 400, body: { error, problems } });

// ─── Reads ────────────────────────────────────────────────────────
const getContent = async ({ cfg, query = {} }) => {
  if (query.slug !== undefined) return { status: 200, body: { species: await detail(cfg, requireSlug(query.slug)) } };
  const rows = await rest(cfg, `species_content?select=${COLS}&order=sort_order.asc,slug.asc`, { method: "GET" }, "species content list");
  return { status: 200, body: { species: (rows || []).map(summary) } };
};

// ─── Writes ───────────────────────────────────────────────────────
const save = async (cfg, admin, slug, body, expected) => {
  const draft = body.draft;
  if (!draft || typeof draft !== "object" || Array.isArray(draft)) fail(400, "Send the draft document.");
  if (JSON.stringify(draft).length > MAX_DOC_CHARS) fail(413, "That document is too big.");
  const row = await readRow(cfg, slug);
  if (row.updated_at !== expected) return conflict(cfg, slug);
  const fixed = identityErrors(draft, row.draft);
  if (fixed.length) return refused("Those fields can't be changed here.", fixed);
  const problems = validateDoc(draft);
  if (problems.length) return refused(`Not saved: ${problems.length === 1 ? "one problem" : `${problems.length} problems`} to fix first.`, problems);
  const out = await patchIf(cfg, slug, expected, { draft, sort_order: draft.sortOrder, updated_by: who(admin) });
  return out ? null : conflict(cfg, slug);
};

const publish = async (cfg, admin, slug, expected) => {
  const row = await readRow(cfg, slug);
  if (row.updated_at !== expected) return conflict(cfg, slug);
  if (row.published && same(row.draft, row.published)) return { status: 409, body: { error: "Nothing to publish: the draft is already live." } };
  const problems = validateDoc(row.draft);
  if (problems.length) return refused("The saved draft breaks the content rules; fix it and save before publishing.", problems);
  const out = await patchIf(cfg, slug, expected, { published: row.draft, published_at: new Date().toISOString(), published_by: who(admin) });
  return out ? null : conflict(cfg, slug);
};

const discard = async (cfg, admin, slug, expected) => {
  const row = await readRow(cfg, slug);
  if (row.updated_at !== expected) return conflict(cfg, slug);
  if (!row.published) fail(400, "This species has never been published, so there's nothing to go back to.");
  if (same(row.draft, row.published)) return null;
  const out = await patchIf(cfg, slug, expected, { draft: row.published, sort_order: row.published.sortOrder, updated_by: who(admin) });
  return out ? null : conflict(cfg, slug);
};

const revert = async (cfg, admin, slug, body, expected) => {
  const id = body.revisionId;
  if (!Number.isInteger(id) || id < 1) fail(400, "Send a valid revisionId.");
  const row = await readRow(cfg, slug);
  if (row.updated_at !== expected) return conflict(cfg, slug);
  const revs = await rest(cfg, `species_content_revisions?select=id,doc&id=eq.${id}&slug=eq.${encodeURIComponent(slug)}&limit=1`, { method: "GET" }, "species revision read");
  const rev = Array.isArray(revs) && revs[0];
  if (!rev) fail(404, "No such revision for this species.");
  const fixed = identityErrors(rev.doc, row.draft);
  const problems = [...fixed, ...validateDoc(rev.doc)];
  if (problems.length) return refused("That revision breaks today's content rules, so it can't be loaded.", problems);
  if (same(rev.doc, row.draft)) return null;
  const out = await patchIf(cfg, slug, expected, { draft: rev.doc, sort_order: rev.doc.sortOrder, updated_by: who(admin) });
  return out ? null : conflict(cfg, slug);
};

const ACTIONS = { save, publish, discard, revert };

const contentAction = async ({ admin, cfg, body }) => {
  const action = body.action;
  if (!Object.prototype.hasOwnProperty.call(ACTIONS, action)) fail(400, "Unknown action (save, publish, discard or revert).");
  const slug = requireSlug(body.slug);
  const expected = requireStamp(body.expectedUpdatedAt);
  const run = action === "save" ? save(cfg, admin, slug, body, expected)
    : action === "revert" ? revert(cfg, admin, slug, body, expected)
      : ACTIONS[action](cfg, admin, slug, expected);
  const early = await run;
  if (early) return early;
  return { status: 200, body: { species: await detail(cfg, slug) } };
};

module.exports = { getContent, contentAction, statusOf, same, stable, REVISIONS };
