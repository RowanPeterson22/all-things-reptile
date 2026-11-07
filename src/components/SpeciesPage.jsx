import { useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { C } from "../constants/colours";
import SpeciesGallery from "./SpeciesGallery";

// ─── Species page shell ───────────────────────────────────────────
// Back label follows the tab the page was opened from (carried in history state).
const useBackLabel = () => {
  const { state } = useLocation();
  return state && state.tab === "identify" ? "‹ Back to ID results" : "‹ Back to browse";
};

const SpeciesPage = ({ onBack, name, latin, emoji, badges = [], tabs, tabContent }) => {
  const [tab, setTab] = useState(tabs[0]);
  const backLabel = useBackLabel();
  // The route is /species/:slug (D4), so the shell knows which gallery to load;
  // the 46 page files don't change.
  const { slug } = useParams();
  return (
    <div style={{ flex: 1, overflowY: "auto" }}>
      <div style={{ background: C.green, padding: "calc(env(safe-area-inset-top, 0px) + 10px) 20px 0" }}>
        <button onClick={onBack} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.7)", fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, marginBottom: 16, fontFamily: "inherit" }}>{backLabel}</button>
        <div style={{ textAlign: "center", fontSize: 90, lineHeight: 1, marginBottom: -8 }}>{emoji}</div>
        <div style={{ background: "white", borderRadius: "20px 20px 0 0", padding: "18px 18px 0", margin: "0 -20px" }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: "#111", marginBottom: 2 }}>{name}</div>
          <div style={{ fontSize: 12, color: "#888", fontStyle: "italic", marginBottom: 10 }}>{latin}</div>
          <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
            {badges.map(([label, bg, color]) => (
              <span key={label} style={{ background: bg, color, fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 10 }}>{label}</span>
            ))}
          </div>
          <SpeciesGallery species={slug} />
          <div style={{ display: "flex", borderBottom: "0.5px solid #eee", margin: "0 -18px", padding: "0 18px", gap: 4, overflowX: "auto", scrollbarWidth: "none" }}>
            {tabs.map(t => (
              <button key={t} onClick={() => setTab(t)} style={{ background: "none", border: "none", borderBottom: tab === t ? `2px solid ${C.green}` : "2px solid transparent", color: tab === t ? C.green : "#888", fontSize: 12, fontWeight: 700, padding: "8px 11px", cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap", marginBottom: -1, textTransform: "capitalize" }}>{t}</button>
            ))}
          </div>
        </div>
      </div>
      <div style={{ background: "white", padding: "16px 18px 28px" }}>
        {tabContent(tab)}
      </div>
    </div>
  );
};

export default SpeciesPage;
