import { T } from "../constants/theme";

// One feeding row: name, detail, then the frequency as an orange chip.
// Pages still pass an emoji `icon`; the design has none in food rows.
// Rows sit in a FoodList card; the rule between rows is drawn by the card.
const FoodItem = ({ name, detail, freq }) => (
  <div data-food-row="" style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", padding: "14px 0", borderBottom: `1px solid ${T.rule}` }}>
    <div style={{ fontSize: 15, fontWeight: 700, color: T.text, lineHeight: 1.35 }}>{name}</div>
    {detail && <div style={{ fontSize: 13, color: T.muted, marginTop: 2, lineHeight: 1.45 }}>{detail}</div>}
    {freq && <div style={{ marginTop: 8, fontSize: 12, fontWeight: 700, color: T.chip, background: T.chipBg, borderRadius: 999, padding: "4px 10px", lineHeight: 1.4, maxWidth: "100%" }}>{freq}</div>}
  </div>
);

export default FoodItem;

// The card a page's food rows sit in. The clip hides the last row's rule.
export const FOOD_CARD = { background: T.card, borderRadius: 18, padding: "0 16px", marginBottom: 10, clipPath: "inset(0 0 1px 0 round 18px)" };
