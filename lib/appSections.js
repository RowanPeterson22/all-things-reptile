// ─── App layout store + admin edits (server only) ─────────────────
// The sections inside the five tabs, their status/audience/order/featured and
// title/blurb overrides live in app_sections; tab labels and the Home block
// order in app_layout (atr project). Defaults: src/constants/sections.json.
// The rules for who sees what are in src/constants/appLayout.js, shared with
// the app.
//
// getAppConfig(): cached CACHE_MS per function instance for /api/beta-check,
// so an /admin edit reaches everyone within about 30 s (immediately on the
// instance that made it). If Supabase can't be reached, the last good copy is
// kept; with none, the defaults stand in. Never throws.
//
// Admin (api/admin-testers?scope=sections, behind the admin gate):
//   GET    the editor's view: every section with its defaults and settings,
//          the tabs with default and override labels, the Home block order
//   PATCH  one of:
//          { section: { key, status?, audience?, title?, blurb? } }  (null title/blurb = default)
//          { featured: key | null }
//          { order: { tab, keys: [...] } }      the full order of one tab's sections
//          { tabs: { home?: label|null, ... } } (null = default label)
//          { homeBlocks: [...] }                the full Home block order
//          Every PATCH answers with the editor's view, fresh from the database.
// Lives outside api/ so Vercel doesn't deploy it as a function.

const layout = require("../src/constants/appLayout.js");
const { supabaseConfig } = require("./supabase");

const CACHE_MS = 30 * 1000;
const RETRY_MS = 15 * 1000;
const SECTION_COLUMNS = "key,status,audience,sort_order,featured,title,blurb,updated_at,updated_by";
const LAYOUT_COLUMNS = "tab_labels,home_blocks,updated_at,updated_by";

const fetchRaw = async (cfg, fetchImpl) => {
  const doFetch = fetchImpl || globalThis.fetch;
  const get = async (path) => {
    const res = await doFetch(`${cfg.url}/rest/v1/${path}`, {
      method: "GET",
      headers: { apikey: cfg.key, Authorization: `Bearer ${cfg.key}`, Accept: "application/json" },
    });
    if (!res || !res.ok) throw new Error(`appSections: ${res ? res.status : "no"} response`);
    const rows = await res.json();
    if (!Array.isArray(rows)) throw new Error("appSections: unexpected reply");
    return rows;
  };
  const [rows, layoutRows] = await Promise.all([
    get(`app_sections?select=${SECTION_COLUMNS}&order=sort_order,key`),
    get(`app_layout?select=${LAYOUT_COLUMNS}&id=is.true&limit=1`),
  ]);
  return { rows, layout: layoutRows[0] || null };
};

const createAppConfigStore = ({ cacheMs = CACHE_MS, retryMs = RETRY_MS, now = () => Date.now() } = {}) => {
  let snap = null;
  let lastGood = null;
  let expires = 0;
  let inflight = null;

  const get = async ({ cfg, env, fetchImpl } = {}) => {
    if (snap && now() < expires) return snap;
    if (inflight) return inflight;
    const conf = cfg || supabaseConfig(env);
    if (!conf) {
      snap = layout.DEFAULT_CONFIG;
      expires = now() + cacheMs;
      return snap;
    }
    inflight = (async () => {
      try {
        lastGood = layout.buildConfig(await fetchRaw(conf, fetchImpl));
        snap = lastGood;
        expires = now() + cacheMs;
      } catch (e) {
        console.error("appSections: couldn't load the layout, using the last good copy or the defaults");
        snap = lastGood || layout.DEFAULT_CONFIG;
        expires = now() + retryMs;
      } finally {
        inflight = null;
      }
      return snap;
    })();
    return inflight;
  };
  const invalidate = () => { expires = 0; };
  const clear = () => { snap = null; lastGood = null; expires = 0; inflight = null; };
  return { get, invalidate, clear };
};

const defaultStore = createAppConfigStore();

// ─── Admin ────────────────────────────────────────────────────────
// Required lazily: lib/admin pulls in the admin gate, which beta-check doesn't need.
const admin = () => require("./admin");

const loadFresh = async (cfg) => {
  const { rest } = admin();
  const [rows, layoutRows] = await Promise.all([
    rest(cfg, `app_sections?select=${SECTION_COLUMNS}&order=sort_order,key`, { method: "GET" }, "app sections list"),
    rest(cfg, `app_layout?select=${LAYOUT_COLUMNS}&id=is.true&limit=1`, { method: "GET" }, "app layout get"),
  ]);
  return { rows: Array.isArray(rows) ? rows : [], layoutRow: Array.isArray(layoutRows) ? layoutRows[0] || null : null };
};

// The editor's view.
const editorView = ({ rows, layoutRow }) => {
  const config = layout.buildConfig({ rows, layout: layoutRow });
  const rowByKey = Object.fromEntries(rows.filter(r => r && layout.BY_KEY[r.key]).map(r => [r.key, r]));
  return {
    sections: layout.sortedKeys(config.sections).map(key => {
      const s = layout.BY_KEY[key];
      const c = config.sections[key];
      const row = rowByKey[key];
      return {
        key, tab: s.tab, icon: s.icon, path: s.path, built: s.built === true, tile: s.tile === true,
        perTester: s.perTester === true, neverPublic: s.neverPublic === true,
        defaultTitle: s.title, defaultBlurb: s.blurb,
        status: c.status, audience: c.audience, featured: c.featured, sort: c.sort,
        title: c.title, blurb: c.blurb,
        updatedAt: row ? row.updated_at || null : null, updatedBy: row ? row.updated_by || null : null,
      };
    }),
    tabs: layout.TABS.map(t => ({ key: t.key, icon: t.icon, defaultLabel: t.label, label: config.tabLabels[t.key] })),
    homeBlocks: config.homeBlocks,
    blockOptions: require("../src/constants/sections.json").homeBlocks,
    statuses: layout.STATUSES,
    audiences: layout.AUDIENCES,
    limits: { title: layout.TITLE_MAX, blurb: layout.BLURB_MAX, label: layout.LABEL_MAX },
  };
};

const getSectionsAdmin = async ({ cfg }) => ({ status: 200, body: editorView(await loadFresh(cfg)) });

const knownKey = (v) => {
  if (typeof v !== "string" || !layout.BY_KEY[v]) admin().fail(400, "Unknown section.");
  return v;
};

// Optional override text: undefined = leave, null/"" = back to default.
const overrideText = (v, max, label) => {
  if (v === null || v === "") return null;
  return admin().cleanText(v, max, label);
};

// Upsert full rows (current settings + patch), so a key with no row yet gets one.
const upsertRows = async (cfg, rows) => {
  const { rest } = admin();
  await rest(cfg, "app_sections?on_conflict=key", {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
    body: JSON.stringify(rows),
  }, "app sections upsert");
};

const rowFor = (config, key, patch, by) => {
  const c = config.sections[key];
  return {
    key, status: c.status, audience: c.audience, sort_order: c.sort, featured: c.featured,
    title: c.title, blurb: c.blurb, ...patch, updated_at: new Date().toISOString(), updated_by: by,
  };
};

const validateSection = (s, patch) => {
  const { fail } = admin();
  if ("status" in patch) {
    if (!layout.STATUSES.includes(patch.status)) fail(400, `Status must be one of ${layout.STATUSES.join(", ")}.`);
    if (patch.status === "live" && !s.built) fail(400, `${s.title} isn't built yet, so it can only be Coming soon or Hidden.`);
  }
  if ("audience" in patch) {
    if (!layout.AUDIENCES.includes(patch.audience)) fail(400, `Audience must be one of ${layout.AUDIENCES.join(", ")}.`);
    if (patch.audience === "everyone" && s.neverPublic) fail(400, `${s.title} stays beta-only (D9): its audience can't be Everyone.`);
  }
};

const updateSectionsAdmin = async ({ cfg, admin: who, body }) => {
  const { fail, rest } = admin();
  const by = who && who.name ? String(who.name).slice(0, 200) : null;
  const current = await loadFresh(cfg);
  const config = layout.buildConfig({ rows: current.rows, layout: current.layoutRow });
  const actions = ["section", "featured", "order", "tabs", "homeBlocks"].filter(k => k in body);
  if (actions.length !== 1) fail(400, "Send one change at a time.");

  if (actions[0] === "section") {
    const p = body.section;
    if (!p || typeof p !== "object" || Array.isArray(p)) fail(400, "Send the section's changes.");
    const key = knownKey(p.key);
    const s = layout.BY_KEY[key];
    const patch = {};
    for (const k of ["status", "audience"]) if (k in p) patch[k] = p[k];
    if ("title" in p) patch.title = overrideText(p.title, layout.TITLE_MAX, "Title");
    if ("blurb" in p) patch.blurb = overrideText(p.blurb, layout.BLURB_MAX, "Blurb");
    if (!Object.keys(patch).length) fail(400, "Nothing to change.");
    validateSection(s, patch);
    // An override identical to the default is stored as "no override".
    if (patch.title && patch.title === s.title) patch.title = null;
    if (patch.blurb && patch.blurb === s.blurb) patch.blurb = null;
    await upsertRows(cfg, [rowFor(config, key, patch, by)]);
  } else if (actions[0] === "featured") {
    const key = body.featured === null ? null : knownKey(body.featured);
    if (key && !layout.BY_KEY[key].tile) fail(400, "Only sections with a tile can be featured.");
    if (key) await upsertRows(cfg, [rowFor(config, key, {}, by)]); // make sure the row exists
    await rest(cfg, "rpc/app_sections_set_featured", {
      method: "POST", headers: { Prefer: "return=minimal" },
      body: JSON.stringify({ p_key: key, p_by: by }),
    }, "app sections featured");
  } else if (actions[0] === "order") {
    const o = body.order;
    const tab = o && typeof o === "object" ? o.tab : null;
    if (!layout.TAB_KEYS.includes(tab)) fail(400, "Unknown tab.");
    const want = layout.SECTIONS.filter(s => s.tab === tab).map(s => s.key).sort();
    const keys = Array.isArray(o.keys) ? o.keys : [];
    if (keys.length !== want.length || [...keys].sort().join() !== want.join()) fail(400, "Send every section in that tab, once each.");
    // Keep the tab's existing block of sort numbers, so tabs never interleave.
    const base = Math.min(...want.map(k => config.sections[k].sort));
    await upsertRows(cfg, keys.map((k, i) => rowFor(config, k, { sort_order: base + i * 10 }, by)));
  } else if (actions[0] === "tabs") {
    const t = body.tabs;
    if (!t || typeof t !== "object" || Array.isArray(t)) fail(400, "Send the tab labels.");
    const labels = { ...config.tabLabels };
    for (const [k, v] of Object.entries(t)) {
      if (!layout.TAB_KEYS.includes(k)) fail(400, "Unknown tab.");
      labels[k] = v === null || v === "" ? null : admin().cleanText(v, layout.LABEL_MAX, "Tab label");
      const def = layout.TABS.find(x => x.key === k).label;
      if (labels[k] === def) labels[k] = null;
    }
    const stored = Object.fromEntries(Object.entries(labels).filter(([, v]) => v));
    await rest(cfg, "app_layout?on_conflict=id", {
      method: "POST", headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
      body: JSON.stringify({ id: true, tab_labels: stored, home_blocks: config.homeBlocks, updated_at: new Date().toISOString(), updated_by: by }),
    }, "app layout tabs");
  } else {
    const list = body.homeBlocks;
    if (!Array.isArray(list) || list.length !== layout.HOME_BLOCKS.length || [...new Set(list)].length !== list.length
      || !list.every(k => layout.HOME_BLOCKS.includes(k))) fail(400, `Send every Home block once: ${layout.HOME_BLOCKS.join(", ")}.`);
    const stored = Object.fromEntries(Object.entries(config.tabLabels).filter(([, v]) => v));
    await rest(cfg, "app_layout?on_conflict=id", {
      method: "POST", headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
      body: JSON.stringify({ id: true, tab_labels: stored, home_blocks: list, updated_at: new Date().toISOString(), updated_by: by }),
    }, "app layout blocks");
  }
  defaultStore.invalidate();
  return { status: 200, body: editorView(await loadFresh(cfg)) };
};

module.exports = {
  createAppConfigStore, fetchRaw, editorView, getSectionsAdmin, updateSectionsAdmin,
  getAppConfig: defaultStore.get, invalidateAppConfig: defaultStore.invalidate, clearAppConfigCache: defaultStore.clear,
  CACHE_MS, SECTION_COLUMNS, LAYOUT_COLUMNS,
};
