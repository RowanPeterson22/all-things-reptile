// ─── Design tokens (the design pass, 10 Nov 2026) ─────────────────
// Every colour the public app uses comes from here. The values are the `k`
// token sets in Rowan's chosen design (AckiePage.dc.html renderVals()), dark
// and light, plus a few the design implies (fields, overlays, the nav).
//
// THEME picks the set. Only dark ships for now; a later Light / Dark /
// Match-phone setting is a matter of choosing THEMES[x] at start-up (or from
// prefers-color-scheme) and exporting it as T, since every screen reads T.
//
// D2 brand: #D25815 orange for primary buttons and the active state,
// #A8A8A8 grey, #000000 black. Orange *text* on black uses accentText
// (#F07A36), which reads at 7.5:1 (#D25815 itself is 5.1:1 on black).
// White on #D25815 is 4.1:1: the design's buttons and pills keep it (bold
// text), see the report; a darker accent would be a one-token change.
//
// /admin keeps its light look and its own palette (constants/colours.js `C`).

const shared = {
  accent: "#D25815",        // primary buttons, active tab, basking banner
  onAccent: "#FFFFFF",
  brandGrey: "#A8A8A8",
  brandBlack: "#000000",
  font: "'DM Sans', system-ui, sans-serif",
};

export const THEMES = {
  dark: {
    ...shared,
    name: "dark",
    scheme: "dark",          // CSS color-scheme: native inputs, scrollbars, pickers
    bg: "#000000",
    card: "#161616",
    cardHi: "#1C1C1C",       // raised: nav bar, popovers, inputs
    seg: "#161616",          // segmented control track
    segOn: "#2A2A2A",        // its active segment
    text: "#FFFFFF",
    body: "#D6D6D6",
    muted: "#A8A8A8",        // 9.3:1 on black, 7.6:1 on cards: fine at 11px
    line: "#333333",
    track: "#262626",
    rule: "#262626",
    shadow: "none",
    accentText: "#F07A36",
    chip: "#F07A36", chipBg: "#2A1A10",
    ok: "#7FD39B", okBg: "#1F3A2A",
    no: "#FF8A70", noBg: "#3A1A14",
    info: "#8EC5F0", infoBg: "#10202E",
    okDot: "#7FD39B",
    nav: "#1C1C1C", navShadow: "0 8px 24px rgba(0,0,0,0.6)", navIdle: "#A8A8A8",
    temps: ["#D25815", "#A8A8A8", "#6B6B6B", "#4A4A4A"],
    // Implied by the design
    field: "#1A1A1A",        // round search button, inputs
    fieldBorder: "#333333",
    placeholder: "#8C8C8C",  // 5.6:1 on the field
    overlay: "rgba(0,0,0,0.55)",       // round buttons on photos
    glass: "rgba(255,255,255,0.16)",   // pills on photos
    photoMuted: "#C8C8C8",             // latin name over the photo
    dotIdle: "#6B6B6B",
    focus: "#F07A36",
    imgBg: "#1A1A1A",                  // behind photos while they load
  },
  light: {
    ...shared,
    name: "light",
    scheme: "light",
    bg: "#F6F5F2",
    card: "#FFFFFF",
    cardHi: "#FFFFFF",
    seg: "#E9E8E4",
    segOn: "#FFFFFF",
    text: "#111111",
    body: "#3A3A3A",
    muted: "#5C5C5C",
    line: "#D6D5D1",
    track: "#ECEBE7",
    rule: "#ECEBE7",
    shadow: "0 1px 2px rgba(0,0,0,0.06)",
    accentText: "#B04A10",
    chip: "#A8440F", chipBg: "#FBEDE4",
    ok: "#1E6B3A", okBg: "#E6F2EA",
    no: "#B3261E", noBg: "#FBE6E1",
    info: "#1D5E91", infoBg: "#E7F1FA",
    okDot: "#2E8B57",
    nav: "#FFFFFF", navShadow: "0 6px 20px rgba(0,0,0,0.14)", navIdle: "#6B6B6B",
    temps: ["#D25815", "#6B6B6B", "#A8A8A8", "#CFCFCB"],
    field: "#FFFFFF",
    fieldBorder: "#D6D5D1",
    placeholder: "#6B6B6B",
    overlay: "rgba(0,0,0,0.55)",
    glass: "rgba(255,255,255,0.16)",
    photoMuted: "#C8C8C8",
    dotIdle: "#A8A8A8",
    focus: "#B04A10",
    imgBg: "#ECEBE7",
  },
};

// The one switch. A Light / Dark / Match-phone setting changes only this.
export const THEME = "dark";
export const T = THEMES[THEME];

// Sizes shared by the shell and the screens.
export const SIZE = {
  pad: 16,               // screen side padding
  radius: 14,            // small cards, buttons, stat tiles
  radiusLg: 18,          // content cards
  navH: 64,              // floating tab bar
  navSide: 16,           // its distance from the screen sides
  touch: 44,             // minimum tap target
};

// The floating tab bar's bottom offset, and the space every page leaves for it
// (bar + offset + a 16 px margin), so the bar never covers content.
export const NAV_BOTTOM = "max(16px, env(safe-area-inset-bottom, 0px))";
export const NAV_CLEARANCE = `calc(${SIZE.navH}px + ${NAV_BOTTOM} + 16px)`;
