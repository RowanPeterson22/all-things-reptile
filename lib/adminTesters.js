// ─── Admin: beta testers ─────────────────────────────────────────
// List testers, create an invite, deactivate/reactivate, grant or remove admin,
// set each tester's app sections (pre-launch gate) and the default sections
// new invites get (beta_settings).
// The invite code is a bearer secret: it is generated here, returned once in
// the create response, and never listed, logged or sent back again.

const { randomBytes } = require("crypto");
const { fail, rest, cleanText, requireUuid } = require("./admin");
const { SECTIONS, DEFAULT_SECTIONS, parseSections } = require("./sections");

const APP_URL = "https://app.allthingsreptile.com.au";
const GROUPS = ["VHS", "breeder", "other"];
const COLUMNS = "id,name,group,active,is_admin,sections,created_at"; // never invite_code
const SECTION_OPTIONS = SECTIONS.map(({ key, label }) => ({ key, label }));

const sectionsOrFail = (v) => {
  const list = parseSections(v);
  if (!list) fail(400, `Sections must be a list of: ${SECTIONS.map(x => x.key).join(", ")}.`);
  return list;
};

// The sections new invites get. Falls back to the built-in default (ID only).
const getDefaultSections = async (cfg) => {
  const rows = await rest(cfg, "beta_settings?select=default_sections&id=is.true&limit=1", { method: "GET" }, "settings get");
  const v = Array.isArray(rows) && rows[0] ? parseSections(rows[0].default_sections) : null;
  return v || [...DEFAULT_SECTIONS];
};

// Same as scripts/beta-invite.mjs: 32 random bytes → 43-char base64url.
const newInviteCode = () => randomBytes(32).toString("base64url");
const inviteLink = (code, base = APP_URL) => `${base}/id?invite=${encodeURIComponent(code)}`;

const normaliseGroup = (g) => {
  if (g === undefined || g === null || g === "") return "other";
  const hit = GROUPS.find(x => x.toLowerCase() === String(g).toLowerCase());
  if (!hit) fail(400, `Group must be one of ${GROUPS.join(", ")}.`);
  return hit;
};

const listTesters = async ({ cfg }) => {
  const rows = await rest(cfg, `beta_testers?select=${COLUMNS}&order=created_at.asc`, { method: "GET" }, "tester list");
  const defaultSections = await getDefaultSections(cfg);
  return { status: 200, body: { testers: rows || [], groups: GROUPS, sections: SECTION_OPTIONS, defaultSections } };
};

// POST { name, group, sections? } → { tester, inviteLink } (the only time the
// code leaves the server). Without sections, the default-sections setting applies.
const createTester = async ({ cfg, body }, { makeCode = newInviteCode } = {}) => {
  const name = cleanText(body.name, 200, "Name", { required: true });
  const group = normaliseGroup(body.group);
  const sections = body.sections === undefined || body.sections === null ? await getDefaultSections(cfg) : sectionsOrFail(body.sections);
  const code = makeCode();
  const rows = await rest(cfg, `beta_testers?select=${COLUMNS}`, {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({ name, group, sections, invite_code: code, active: true, is_admin: false }),
  }, "tester create");
  const tester = Array.isArray(rows) && rows[0];
  if (!tester) fail(502, "The tester wasn't created. Try again.");
  return { status: 201, body: { tester, inviteLink: inviteLink(code) } };
};

// PATCH { defaultSections } → the setting for new invites.
const updateDefaults = async ({ cfg, body }) => {
  const list = sectionsOrFail(body.defaultSections);
  const rows = await rest(cfg, "beta_settings?id=is.true&select=default_sections", {
    method: "PATCH",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({ default_sections: list, updated_at: new Date().toISOString() }),
  }, "settings update");
  if (!Array.isArray(rows) || !rows[0]) fail(502, "The setting wasn't saved. Try again.");
  return { status: 200, body: { defaultSections: parseSections(rows[0].default_sections) || list } };
};

// PATCH { id, active?, is_admin?, sections? }. An admin can't lock themselves out.
const updateTester = async (ctx) => {
  const { cfg, admin, body } = ctx;
  if ("defaultSections" in body && !("id" in body)) return updateDefaults(ctx);
  const id = requireUuid(body.id, "tester id");
  const patch = {};
  for (const k of ["active", "is_admin"]) {
    if (k in body) {
      if (typeof body[k] !== "boolean") fail(400, `${k} must be true or false.`);
      patch[k] = body[k];
    }
  }
  if ("sections" in body) patch.sections = sectionsOrFail(body.sections);
  if (!Object.keys(patch).length) fail(400, "Nothing to change.");
  if (id === String(admin.id).toLowerCase()) {
    if (patch.is_admin === false) fail(400, "You can't remove your own admin access.");
    if (patch.active === false) fail(400, "You can't deactivate yourself.");
  }
  const rows = await rest(cfg, `beta_testers?id=eq.${id}&select=${COLUMNS}`, {
    method: "PATCH",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify(patch),
  }, "tester update");
  const tester = Array.isArray(rows) && rows[0];
  if (!tester) fail(404, "That tester doesn't exist.");
  return { status: 200, body: { tester } };
};

module.exports = { listTesters, createTester, updateTester, updateDefaults, getDefaultSections, SECTION_OPTIONS, newInviteCode, inviteLink, normaliseGroup, APP_URL, GROUPS, COLUMNS };
