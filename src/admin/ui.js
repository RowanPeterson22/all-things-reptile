import { C } from "../constants/colours";

// ─── Admin UI bits (inline styles only, D3) ───────────────────────
// Brand colours come from C. The neutrals are the same greys the public
// screens already use, named once here so the admin files don't repeat them.
export const N = { ink: "#333", muted: "#888", faint: "#aaa", line: "#e8e8e4", wash: "#f0f0ec" };

export const page = { padding: "14px 16px 40px", maxWidth: 960, margin: "0 auto", width: "100%", boxSizing: "border-box" };

export const btn = (kind = "primary", disabled = false) => ({
  background: kind === "primary" ? C.green : kind === "danger" ? C.redPale : "white",
  color: kind === "primary" ? "white" : kind === "danger" ? C.red : C.green,
  border: kind === "primary" ? "none" : `1px solid ${kind === "danger" ? "rgba(139,32,32,0.25)" : C.green}`,
  borderRadius: 10, padding: "8px 14px", fontSize: 13, fontWeight: 700, fontFamily: "inherit",
  cursor: disabled ? "default" : "pointer", opacity: disabled ? 0.5 : 1, minHeight: 36,
});

export const smallBtn = (kind = "ghost", disabled = false) => ({ ...btn(kind, disabled), padding: "5px 10px", fontSize: 12, minHeight: 30 });

export const chip = (on) => ({
  background: on ? C.green : "white", color: on ? "white" : N.ink,
  border: `1px solid ${on ? C.green : N.line}`, borderRadius: 999, padding: "6px 12px",
  fontSize: 12, fontWeight: on ? 700 : 500, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap",
});

export const input = {
  width: "100%", boxSizing: "border-box", border: `1px solid ${N.line}`, borderRadius: 10,
  padding: "10px 12px", fontSize: 16, fontFamily: "inherit", background: "white", color: N.ink,
};

export const label = { display: "block", fontSize: 12, fontWeight: 700, color: N.ink, marginBottom: 5 };
export const hint = { fontSize: 11, color: N.muted, marginTop: 4, lineHeight: 1.5 };
export const card = { background: "white", border: `0.5px solid ${N.line}`, borderRadius: 14, overflow: "hidden" };
export const sectionLabel = { fontSize: 11, fontWeight: 700, color: N.muted, textTransform: "uppercase", letterSpacing: "0.07em", margin: "16px 0 8px" };
export const errorText = { fontSize: 12, color: C.red, marginTop: 4 };

export const badge = (tone = "grey") => {
  const t = {
    grey:   { bg: N.wash, fg: N.muted },
    orange: { bg: C.greenPale, fg: C.green },
    gold:   { bg: C.goldLight, fg: "#7a5a1e" },
    red:    { bg: C.redPale, fg: C.red },
    blue:   { bg: C.bluePale, fg: C.blue },
  }[tone];
  return { display: "inline-block", background: t.bg, color: t.fg, borderRadius: 6, padding: "2px 7px", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em" };
};

export const LICENCE_LABEL = { "cc0": "CC0", "cc-by": "CC BY", "cc-by-sa": "CC BY-SA", "permission": "Permission", "tester_consent": "Tester consent", "royalty_free": "Royalty-free stock" };
export const STATUS_TONE = { active: "orange", hidden: "gold", rejected: "red" };

export const fmtDate = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" });
};
