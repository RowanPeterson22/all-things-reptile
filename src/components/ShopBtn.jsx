import { T, SIZE } from "../constants/theme";

// Primary (orange) and secondary (outlined) full-width buttons, 48 px tall.
const ShopBtn = ({ children, secondary = false, onClick }) => (
  <button type="button" onClick={onClick} style={{
    width: "100%", minHeight: 48, boxSizing: "border-box",
    border: secondary ? `1.5px solid ${T.line}` : "none", background: secondary ? "transparent" : T.accent,
    color: secondary ? T.text : T.onAccent, borderRadius: SIZE.radius, padding: "12px 14px",
    fontSize: 15, fontWeight: secondary ? 600 : 700, cursor: "pointer", fontFamily: "inherit",
    marginTop: secondary ? 0 : 16, marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, textAlign: "center", lineHeight: 1.3,
  }}>
    {children}
  </button>
);

export default ShopBtn;
