#!/usr/bin/env node
// ─── Create an AI ID beta tester and print their invite link ─────
// Usage:
//   SUPABASE_URL=… SUPABASE_SECRET_KEY=… node scripts/beta-invite.mjs "Jane Citizen" VHS
//   node scripts/beta-invite.mjs --list
//   node scripts/beta-invite.mjs --deactivate <tester-id>
//   node scripts/beta-invite.mjs --self-test      (create + delete a throwaway tester)
// group: VHS | breeder | other (default other)
//
// The invite link is a bearer secret: send it only to that tester. To cut a
// tester off, --deactivate them (their feedback stays; the link stops working
// within a minute).

import { randomBytes } from "node:crypto";
import { pathToFileURL } from "node:url";
import { config, rest } from "./lib/supabaseAdmin.mjs";

export const APP_URL = "https://app.allthingsreptile.com.au";
export const GROUPS = ["VHS", "breeder", "other"];

// 32 random bytes → 43-char base64url: unguessable and URL-safe.
export const newInviteCode = () => randomBytes(32).toString("base64url");
export const inviteLink = (code, base = APP_URL) => `${base}/id?invite=${encodeURIComponent(code)}`;

export const normaliseGroup = (g) => {
  if (!g) return "other";
  const hit = GROUPS.find(x => x.toLowerCase() === String(g).toLowerCase());
  if (!hit) throw new Error(`group must be one of ${GROUPS.join(", ")}`);
  return hit;
};

// The sections new invites get (admin → Testers → "Sections for new invites").
export const defaultSections = async (cfg, fetchImpl) => {
  const rows = await rest(cfg, "beta_settings?select=default_sections&id=is.true&limit=1", {}, fetchImpl).catch(() => null);
  const v = Array.isArray(rows) && rows[0] && Array.isArray(rows[0].default_sections) ? rows[0].default_sections : null;
  return v || ["id"];
};

export const createTester = async (cfg, name, group, fetchImpl) => {
  const clean = String(name || "").trim();
  if (!clean || clean.length > 200) throw new Error("Give the tester's name (1–200 characters).");
  const sections = await defaultSections(cfg, fetchImpl);
  const rows = await rest(cfg, "beta_testers", {
    method: "POST",
    headers: { "Content-Type": "application/json", Prefer: "return=representation" },
    body: JSON.stringify({ name: clean, group: normaliseGroup(group), sections, invite_code: newInviteCode(), active: true }),
  }, fetchImpl);
  return rows[0];
};

const main = async (argv) => {
  const cfg = config();
  const [cmd, ...rest_] = argv;

  if (cmd === "--list") {
    const rows = await rest(cfg, "beta_testers?select=id,name,group,active,is_admin,sections,created_at&order=created_at.asc");
    for (const r of rows) console.log(`${r.active ? "active  " : "inactive"}  ${r.group.padEnd(7)}  ${r.id}  ${r.name}  [${r.is_admin ? "admin: all" : (r.sections || []).join(", ")}]`);
    console.log(`${rows.length} tester(s).`);
    return;
  }
  if (cmd === "--deactivate") {
    const id = rest_[0];
    if (!/^[0-9a-f-]{36}$/i.test(id || "")) throw new Error("Pass the tester id (uuid) from --list.");
    await rest(cfg, `beta_testers?id=eq.${id}`, { method: "PATCH", headers: { "Content-Type": "application/json", Prefer: "return=minimal" }, body: JSON.stringify({ active: false }) });
    console.log(`Deactivated ${id}.`);
    return;
  }
  if (cmd === "--self-test") {
    const t = await createTester(cfg, "ATR self-test (delete me)", "other");
    console.log(`Created ${t.id}; invite code ${t.invite_code.length} chars.`);
    await rest(cfg, `beta_testers?id=eq.${t.id}`, { method: "DELETE", headers: { Prefer: "return=minimal" } });
    const left = await rest(cfg, `beta_testers?select=id&id=eq.${t.id}`);
    if (left.length) throw new Error("Self-test row wasn't deleted.");
    console.log("Deleted it again. Self-test passed.");
    return;
  }
  if (!cmd || cmd.startsWith("--")) {
    console.error('Usage: node scripts/beta-invite.mjs "Tester name" [VHS|breeder|other]');
    process.exitCode = 1;
    return;
  }
  const t = await createTester(cfg, cmd, rest_[0]);
  console.log(`Tester:  ${t.name} (${t.group})`);
  console.log(`Id:      ${t.id}`);
  console.log(`Sections: ${(t.sections || []).join(", ") || "none"} (change them in /admin → Testers)`);
  console.log(`Invite:  ${inviteLink(t.invite_code)}`);
  console.log("Send this link only to them. It opens their sections of the app on any device they open it on.");
};

if (import.meta.url === pathToFileURL(process.argv[1] || "").href) {
  main(process.argv.slice(2)).catch((e) => { console.error(e.message); process.exitCode = 1; });
}
