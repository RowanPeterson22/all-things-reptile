import { T, SIZE } from "../constants/theme";

// ─── Shared look for Home, Learn, Community, My Profile ────────────
// The new screens are built from a few small pieces (src/components/
// SectionTiles.jsx: Card, SectionHeading, IconBadge, SectionTile, FeaturedCard,
// PlanningCard, StatusBadge; LearnNav; ComingSoonScreen). Their colours come
// from the design tokens (src/constants/theme.js); this file names the roles.
// Inline styles only.

export const UI = {
  font: T.font,
  // surfaces
  pageBg: T.bg,
  cardBg: T.card,
  cardBorder: "none",
  radius: 16,
  gap: 10,          // between tiles
  blockGap: 18,     // between Home blocks
  pad: SIZE.pad,    // screen padding
  // text
  ink: T.text,
  body: T.body,
  sub: T.muted,
  muted: T.muted,
  // accents
  accent: T.accent,
  accentText: T.accentText,
  accentPale: T.chipBg,
  onAccent: T.onAccent,
  onAccentSoft: "rgba(255,255,255,0.92)",
  // badges
  soonBg: T.chipBg, soonFg: T.chip,
  hiddenBg: T.noBg, hiddenFg: T.no,
  // sizes
  tile: { minHeight: 128, pad: 14, icon: 40, iconRadius: 12, glyph: 22, title: 14, blurb: 12 },
  heading: { size: 13, spacing: "0.08em" },
  pill: { height: 44, size: 13, padX: 14, bg: T.seg, fg: T.muted },
};
