import { useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { T } from "../constants/theme";
import { usePublicPhotos } from "./SpeciesGallery";
import { TallHero, TALL_H } from "./SpeciesHero";
import SpeciesSlideshow from "./SpeciesSlideshow";
import { pickHero, othersThan } from "./heroCrop";
import Segmented from "./Segmented";
import { RoundBack } from "./BackButton";

// ─── Species page shell ───────────────────────────────────────────
// The dark design: a tall photo hero with the pills, name and latin name over
// its bottom fade and a round back button on it; then the sheet (slideshow,
// segmented tabs, the tab's content). Back label follows the tab the page was
// opened from (carried in history state).
const useBackLabel = () => {
  const { state } = useLocation();
  return state && state.tab === "id" ? "Back to ID results" : "Back to browse";
};

const pill = (lead) => ({
  fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", lineHeight: "16px",
  background: lead ? T.accent : T.glass, color: T.onAccent, borderRadius: 999, padding: "4px 10px",
});

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

const SpeciesPage = ({ onBack, name, latin, aka, emoji, badges = [], tabs, tabContent }) => {
  const [tab, setTab] = useState(tabs[0]);
  const backLabel = useBackLabel();
  // The route is /species/:slug (D4), so the shell knows which gallery to load;
  // the 46 page files don't change.
  const { slug } = useParams();
  // The photo Rowan ticked as hero (else the first by his order) fills the
  // hero; the rest roll in the slideshow. No photos: the emoji on a dark block.
  const photos = usePublicPhotos(slug);
  const [brokenHero, setBrokenHero] = useState(null);
  const picked = pickHero(photos);
  const hero = picked && picked.id !== brokenHero ? picked : null;
  const rest = othersThan(photos, picked);
  const back = <RoundBack onClick={onBack} label={backLabel} />;
  const text = <HeroText name={name} latin={latin} aka={aka} badges={badges} />;
  return (
    <div style={{ flex: 1 }}>
      {hero ? (
        <TallHero photo={hero} name={name} onBroken={() => setBrokenHero(hero.id)} overlay={text}>{back}</TallHero>
      ) : (
        <div data-testid="species-hero-fallback" style={{ position: "relative", width: "100%", height: `calc(${TALL_H} * 0.8)`, minHeight: 280, background: `linear-gradient(to bottom, ${T.cardHi}, ${T.bg})`, overflow: "hidden" }}>
          <div aria-hidden="true" style={{ position: "absolute", left: 0, right: 0, top: "18%", textAlign: "center", fontSize: 84, lineHeight: 1 }}>{emoji}</div>
          <div style={{ position: "absolute", top: "calc(env(safe-area-inset-top, 0px) + 12px)", left: 14 }}>{back}</div>
          <div style={{ position: "absolute", left: 20, right: 20, bottom: 34 }}>{text}</div>
        </div>
      )}
      <div style={{ position: "relative", marginTop: -20, borderRadius: "22px 22px 0 0", background: T.bg, padding: "18px 16px 8px", display: "flex", flexDirection: "column", gap: 16 }}>
        {rest.length > 0 && <SpeciesSlideshow photos={rest} />}
        <Segmented tabs={tabs} tab={tab} onTab={setTab} label="Sections" testId="species-tabs" />
        <div data-testid="species-tab-content">
          {tabContent(tab)}
        </div>
      </div>
    </div>
  );
};

export default SpeciesPage;
