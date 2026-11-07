// ─── Admin: beta testers ─────────────────────────────────────────
// List testers, create an invite, deactivate/reactivate, grant or remove admin.
// The invite code is a bearer secret: it is generated here, returned once in
// the create response, and never listed, logged or sent back again.

const { randomBytes } = require("crypto");
const { fail, rest, cleanText, requireUuid } = require("./admin");

const APP_URL = "https://app.allthingsreptile.com.au";
const GROUPS = ["VHS", "breeder", "other"];
const COLUMNS = "id,name,group,active,is_admin,created_at"; // never invite_code

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
  return { status: 200, body: { testers: rows || [], groups: GROUPS } };
};

// POST { name, group } → { tester, inviteLink } (the only time the code leaves the server).
const createTester = async ({ cfg, body }, { makeCode = newInviteCode } = {}) => {
  const name = cleanText(body.name, 200, "Name", { required: true });
  const group = normaliseGroup(body.group);
  const code = makeCode();
  const rows = await rest(cfg, `beta_testers?select=${COLUMNS}`, {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({ name, group, invite_code: code, active: true, is_admin: false }),
  }, "tester create");
  const tester = Array.isArray(rows) && rows[0];
  if (!tester) fail(502, "The tester wasn't created. Try again.");
  return { status: 201, body: { tester, inviteLink: inviteLink(code) } };
};

// PATCH { id, active?, is_admin? }. An admin can't lock themselves out.
const updateTester = async ({ cfg, admin, body }) => {
  const id = requireUuid(body.id, "tester id");
  const patch = {};
  for (const k of ["active", "is_admin"]) {
    if (k in body) {
      if (typeof body[k] !== "boolean") fail(400, `${k} must be true or false.`);
      patch[k] = body[k];
    }
  }
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

module.exports = { listTesters, createTester, updateTester, newInviteCode, inviteLink, normaliseGroup, APP_URL, GROUPS, COLUMNS };
