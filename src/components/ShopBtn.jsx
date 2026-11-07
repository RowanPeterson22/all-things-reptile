import { C } from "../constants/colours";

const ShopBtn = ({ children, secondary = false, onClick }) => (
  <button onClick={onClick} style={{ width: "100%", border: secondary ? `0.5px solid ${C.green}` : "none", background: secondary ? "transparent" : C.green, color: secondary ? C.green : "white", borderRadius: 12, padding: "13px 14px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", marginTop: secondary ? 0 : 16, marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
    {children}
  </button>
);

export default ShopBtn;
