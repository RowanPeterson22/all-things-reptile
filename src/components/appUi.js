import { C } from "../constants/colours";

// ─── Shared look for Home, Learn, Community, My Profile ────────────
// The new screens are built from a few small pieces (src/components/
// SectionTiles.jsx: Card, SectionHeading, IconBadge, SectionTile, FeaturedCard,
// PlanningCard, StatusBadge; LearnNav; ComingSoonScreen) and every colour and
// size they use is here, so the coming shell restyle (header, tab bar, theme)
// is a change to this file rather than to each screen. Inline styles only (D3);
// colours from C.

export const UI = {
  font: "'DM Sans', system-ui, sans-serif",
  // surfaces
  pageBg: "white",
  cardBg: "white",
  cardBorder: "0.5px solid #e8e8e4",
  radius: 14,
  gap: 10,          // between tiles
  blockGap: 18,     // between Home blocks
  pad: 16,          // screen padding
  // text
  ink: C.ink,
  body: "#666",
  sub: "#777",
  muted: C.muted,
  // accents
  accent: C.green,          // the brand orange (C.green holds it until the design pass, D2)
  accentPale: C.greenPale,
  onAccent: "white",
  onAccentSoft: "rgba(255,255,255,0.9)",
  band: C.green,            // tab page / Coming soon header band
  searchBand: C.black,
  // badges
  soonBg: C.goldLight, soonFg: "#7a5a1e",
  hiddenBg: C.redPale, hiddenFg: C.red,
  // sizes
  tile: { minHeight: 128, pad: 12, icon: 40, iconRadius: 12, glyph: 22, title: 13, blurb: 11 },
  heading: { size: 11, spacing: "0.07em" },
  pill: { height: 34, size: 13, padX: 14, bg: "rgba(255,255,255,0.12)", fg: "rgba(255,255,255,0.85)" },
};
