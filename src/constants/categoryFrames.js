// ─── Category image frames ───────────────────────────────────────
// Shared with the server (lib/categoryImages.js reads categoryFrames.json).
//   ids          the six Browse categories (src/data/categories.js)
//   cardAspect   the Browse home card's image block. At 375 px the home has a
//                16 px gutter each side and a 10 px gap between two columns,
//                so a card is (375 − 32 − 10) / 2 = 166.5 px wide; the image
//                block was 90 px tall: 166.5 / 90 = 1.85 : 1. The block now
//                keeps that aspect at every width, so the crop always fits.
//   bannerAspect the category page header, 2.4 : 1 like the species hero.
import FRAMES from "./categoryFrames.json";

export const CATEGORY_IDS = FRAMES.ids;
export const CARD_ASPECT = FRAMES.cardAspect;
export const BANNER_ASPECT = FRAMES.bannerAspect;
// The derivation above, so a test can check the JSON hasn't drifted.
export const cardAspectAt = (viewport, { gutter = 16, gap = 10, height = 90 } = {}) => Math.round(((viewport - 2 * gutter - gap) / 2 / height) * 100) / 100;
