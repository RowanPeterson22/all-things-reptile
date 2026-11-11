import { useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { T } from "../constants/theme";
import { usePublicPhotos } from "./SpeciesGallery";
import { HeroSlideshow } from "./SpeciesSlideshow";
import { pickHero, othersThan, TALL_H } from "./heroCrop";
import Segmented from "./Segmented";
import { tabLabel } from "../data/speciesContentShape";
import { RoundBack } from "./BackButton";
import { HeaderActions } from "./AppChrome";

// ─── Species page shell ───────────────────────────────────────────
// The dark design: the hero is the slideshow (tall photo, dots on it, one ⓘ
// for the current photo), with the pills, name and latin name over its bottom
// fade and a round back button on it; then the sheet (segmented tabs, the
// tab's content). Back label follows the tab the page was
// opened from (carried in history state).
const useBackLabel = () => {
  const { state } = useLocation();
  return state && state.tab === "id" ? "Back to ID results" : "Back to browse";
};

const pill = (lead) => ({
  fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", lineHeight: "16px",
  background: lead ? T.accent : T.glass, color: T.onAccent, borderRadius: 999, padding: "4px 10px",
});

// The design names the licence tab "Licence"; the key stays "licencing"
// (tabLabel, shared with /admin, lives with the content shape).

// Pills, name, latin (and other names when a page gives them) over the photo.
const HeroText = ({ name, latin, aka, badges }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 4, color: T.onAccent }}>
    {badges.length > 0 && (
      <div data-testid="species-badges" style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 6 }}>
        {badges.map(([label], i) => <span key={label} style={pill(i === 0)}>{label}</span>)}
      </div>
    )}
    <h1 style={{ margin: 0, fontSize: "clamp(28px, 8.7vw, 34px)", lineHeight: 1.08, fontWeight: 700, letterSpacing: "-0.02em", overflowWrap: "break-word" }}>{name}</h1>
    <div style={{ fontSize: 15, fontStyle: "italic", color: T.photoMuted }}>{latin}</div>
    {aka && <div style={{ fontSize: 13, color: T.muted }}>Also called {aka}</div>}
  </div>
);

// tab / onTab: optional, for a parent that controls the tab (the /admin preview).
const SpeciesPage = ({ onBack, name, latin, aka, emoji, badges = [], tabs, tabContent, tab: wanted, onTab }) => {
  const [own, setOwn] = useState(tabs[0]);
  const chosen = wanted !== undefined ? wanted : own;
  const setTab = (k) => { setOwn(k); if (onTab) onTab(k); };
  // Fresh content can arrive with a different tab set; fall back to the first.
  const tab = tabs.includes(chosen) ? chosen : tabs[0];
  const backLabel = useBackLabel();
  // The route is /species/:slug (D4), so the shell knows which gallery to load.
  const { slug } = useParams();
  // The hero starts on the photo Rowan ticked (else the first by his order)
  // and rolls through the rest. Photos that fail to load drop out; none left:
  // the emoji on a dark block.
  const photos = usePublicPhotos(slug);
  const [broken, setBroken] = useState({});
  const picked = pickHero(photos);
  const ordered = (picked ? [picked, ...othersThan(photos, picked)] : []).filter(p => !broken[p.id || p.url]);
  // Back on the left, the shell's search and ☰ on the right, over the photo.
  const back = (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
      <RoundBack onClick={onBack} label={backLabel} />
      <HeaderActions onPhoto />
    </div>
  );
  const text = <HeroText name={name} latin={latin} aka={aka} badges={badges} />;
  return (
    <div style={{ flex: 1 }}>
      {ordered.length ? (
        <HeroSlideshow photos={ordered} name={name} overlay={text} onBroken={(p) => setBroken(b => ({ ...b, [p.id || p.url]: true }))}>{back}</HeroSlideshow>
      ) : (
        <div data-testid="species-hero-fallback" style={{ position: "relative", width: "100%", height: `calc(${TALL_H} * 0.8)`, minHeight: 280, background: `linear-gradient(to bottom, ${T.cardHi}, ${T.bg})`, overflow: "hidden" }}>
          <div aria-hidden="true" style={{ position: "absolute", left: 0, right: 0, top: "18%", textAlign: "center", fontSize: 84, lineHeight: 1 }}>{emoji}</div>
          <div style={{ position: "absolute", top: "calc(env(safe-area-inset-top, 0px) + 12px)", left: 14, right: 14 }}>{back}</div>
          <div style={{ position: "absolute", left: 20, right: 20, bottom: 34 }}>{text}</div>
        </div>
      )}
      <div style={{ position: "relative", marginTop: -20, borderRadius: "22px 22px 0 0", background: T.bg, padding: "18px 16px 8px", display: "flex", flexDirection: "column", gap: 16 }}>{/* tabs, then content */}
        <Segmented tabs={tabs} tab={tab} onTab={setTab} labelFor={tabLabel} label="Sections" testId="species-tabs" />
        <div data-testid="species-tab-content">
          {tabContent(tab)}
        </div>
      </div>
    </div>
  );
};

export default SpeciesPage;
