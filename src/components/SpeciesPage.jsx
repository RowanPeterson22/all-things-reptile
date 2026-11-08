import { useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { C } from "../constants/colours";
import SpeciesGallery, { usePublicPhotos } from "./SpeciesGallery";
import { CreditedImage } from "./PhotoCredit";
import { objectPosition } from "./focal";
import ScrollRow from "./ScrollRow";
import BackButton from "./BackButton";

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
  // The first photo Rowan chose for this species becomes the header hero; the
  // rest stay in the gallery. No photos: the emoji header as before.
  const photos = usePublicPhotos(slug);
  const hero = photos[0];
  return (
    <div style={{ flex: 1, overflowY: "auto" }}>
      {hero ? (
        <div style={{ position: "relative", height: "min(75vw, 340px)", background: C.black,
          backgroundImage: `url(${hero.url})`, backgroundSize: "cover", backgroundPosition: objectPosition(hero.focal) }}>
          <CreditedImage src={hero.url} alt={hero.alt || name} credit={hero.credit} width={hero.width} height={hero.height} focal={hero.focal} loading="eager"
            style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 20 }} />
          <div aria-hidden="true" style={{ position: "absolute", inset: 0, bottom: "auto", height: 110, background: "linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0))", pointerEvents: "none" }} />
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, padding: "calc(env(safe-area-inset-top, 0px) + 10px) 20px 0" }}>
            <BackButton onClick={onBack} marginBottom={0}>{backLabel}</BackButton>
          </div>
        </div>
      ) : null}
      <div style={{ background: hero ? "transparent" : C.green, padding: hero ? "0 20px" : "calc(env(safe-area-inset-top, 0px) + 10px) 20px 0", marginTop: hero ? -20 : 0, position: "relative" }}>
        {!hero && <BackButton onClick={onBack} marginBottom={16}>{backLabel}</BackButton>}
        {!hero && <div style={{ textAlign: "center", fontSize: 90, lineHeight: 1, marginBottom: -8 }}>{emoji}</div>}
        <div style={{ background: "white", borderRadius: "20px 20px 0 0", padding: "18px 18px 0", margin: "0 -20px" }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: "#111", marginBottom: 2 }}>{name}</div>
          <div style={{ fontSize: 12, color: "#888", fontStyle: "italic", marginBottom: 10 }}>{latin}</div>
          <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
            {badges.map(([label, bg, color]) => (
              <span key={label} style={{ background: bg, color, fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 10 }}>{label}</span>
            ))}
          </div>
          <SpeciesGallery species={slug} skip={hero ? 1 : 0} />
          <ScrollRow tone="light" label="Sections" style={{ display: "flex", borderBottom: "0.5px solid #eee", margin: "0 -18px", padding: "0 18px", gap: 4, overflowX: "auto", scrollbarWidth: "none" }}>
            {tabs.map(t => (
              <button key={t} onClick={() => setTab(t)} aria-pressed={tab === t} style={{ background: "none", border: "none", borderBottom: tab === t ? `2px solid ${C.green}` : "2px solid transparent", color: tab === t ? C.green : "#888", fontSize: 12, fontWeight: 700, padding: "12px 11px", cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap", marginBottom: -1, textTransform: "capitalize" }}>{t}</button>
            ))}
          </ScrollRow>
        </div>
      </div>
      <div style={{ background: "white", padding: "16px 18px 28px" }}>
        {tabContent(tab)}
      </div>
    </div>
  );
};

export default SpeciesPage;
