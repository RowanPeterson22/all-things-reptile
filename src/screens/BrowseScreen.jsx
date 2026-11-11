import { useEffect, useRef, useState } from "react";
import { T } from "../constants/theme";
import Icon from "../components/Icon";
import { useSpeciesList } from "../data/speciesContent";
import { CATEGORIES } from "../data/categories";
import LevelBadge from "../components/LevelBadge";
import BackButton from "../components/BackButton";
import { usePublicPhotos } from "../components/SpeciesGallery";
import { CreditedImage } from "../components/PhotoCredit";
import { pickHero } from "../components/heroCrop";
import SpeciesHero from "../components/SpeciesHero";
import { useCategoryImages, CategoryCardImage, CategoryEmoji, useBrokenSet } from "../components/CategoryImage";

// live: names, levels and order come from the published documents (D5);
// until they arrive (or for a visitor the server won't answer yet) the snapshot.
const BrowseScreen = ({ onSpecies, live = false }) => {
  const SPECIES = useSpeciesList(live);
  const [category, setCategory] = useState(null);
  // Opening a category (or going back) starts at the top, so the header and
  // its back button are in view even when the card tapped was low on the page.
  const rootRef = useRef(null);
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) { firstRender.current = false; return; }
    for (let el = rootRef.current; el; el = el.parentElement) if (el.scrollTop) el.scrollTop = 0;
    if (document.scrollingElement) document.scrollingElement.scrollTop = 0;
  }, [category]);
  // Each species' main image (the hero Rowan ticked, else its first photo)
  // replaces the emoji on the cards.
  const allPhotos = usePublicPhotos(null, { all: !!category }); // only once a category is open
  const bySpecies = {};
  allPhotos.forEach(p => { if (p.species) (bySpecies[p.species] = bySpecies[p.species] || []).push(p); });
  const firstPhoto = {};
  Object.keys(bySpecies).forEach(k => { firstPhoto[k] = pickHero(bySpecies[k]); });
  // The photo Rowan chose for each category (one public, cached request),
  // else the emoji.
  const catImages = useCategoryImages();
  const [broken, markBroken] = useBrokenSet();
  const imageFor = (id) => (catImages[id] && !broken[catImages[id].url] ? catImages[id] : null);

  if (category) {
    const catSpecies = SPECIES.filter(s => s.type === category);
    const cat = CATEGORIES.find(c => c.id === category);
    const banner = imageFor(category);
    return (
      <div ref={rootRef} style={{ flex: 1 }}>
        {banner ? (
          <>
            {/* The same treatment as the category banner always had: 2.4 : 1, back pill over a top fade. */}
            <SpeciesHero testId="category-banner" photo={{ ...banner, heroCrop: banner.bannerCrop }} name={cat.label} onBroken={() => markBroken(banner.url)}>
              <BackButton onPhoto onClick={() => setCategory(null)} marginBottom={0}>‹ All categories</BackButton>
            </SpeciesHero>
            <div style={{ position: "relative", marginTop: -20, background: T.bg, borderRadius: "22px 22px 0 0", padding: "18px 16px 0" }}>
              <h2 style={{ margin: 0, fontSize: 26, fontWeight: 700, color: T.text, lineHeight: 1.15 }}>{cat.label}</h2>
              <div style={{ fontSize: 14, color: T.muted, marginTop: 4 }}>{catSpecies.length} species</div>
            </div>
          </>
        ) : (
        <div style={{ padding: "0 16px" }}>
          <BackButton onClick={() => setCategory(null)} marginBottom={12}>‹ All categories</BackButton>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div aria-hidden="true" style={{ width: 56, height: 56, borderRadius: 16, background: T.card, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, flexShrink: 0 }}>{cat.emoji}</div>
            <div style={{ minWidth: 0 }}>
              <h2 style={{ margin: 0, fontSize: 26, fontWeight: 700, color: T.text, lineHeight: 1.15 }}>{cat.label}</h2>
              <div style={{ fontSize: 14, color: T.muted, marginTop: 4 }}>{catSpecies.length} species</div>
            </div>
          </div>
        </div>
        )}
        <div style={{ padding: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 10 }}>
            {catSpecies.map(sp => (
              <div key={sp.id} onClick={() => sp.page && onSpecies(sp.page)}
                style={{ background: T.card, borderRadius: 16, overflow: "hidden", cursor: sp.page ? "pointer" : "default", opacity: sp.page ? 1 : 0.8, minWidth: 0 }}>
                {firstPhoto[sp.slug] ? (
                  <CreditedImage key={firstPhoto[sp.slug].id} src={firstPhoto[sp.slug].url} alt={sp.name} credit={firstPhoto[sp.slug].credit} focal={firstPhoto[sp.slug].focal}
                    style={{ height: 104, background: T.imgBg }} />
                ) : (
                  <div style={{ height: 104, background: T.cardHi, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36 }}>{sp.emoji}</div>
                )}
                <div style={{ padding: "10px 12px 12px" }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: T.text, marginBottom: 2, lineHeight: 1.3, overflowWrap: "break-word" }}>{sp.name}</div>
                  <div style={{ fontSize: 12, color: T.muted, marginBottom: 8, textTransform: "capitalize" }}>{sp.type}</div>
                  <LevelBadge level={sp.level} />
                  {!sp.page && <div style={{ fontSize: 11, color: T.muted, marginTop: 6 }}>Coming soon</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={rootRef} style={{ flex: 1, padding: "4px 16px 16px" }}>
      <div role="link" tabIndex={0} onClick={() => onSpecies("bluetongue")} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSpecies("bluetongue"); } }}
        style={{ background: T.accent, borderRadius: 18, padding: 16, marginBottom: 20, display: "flex", alignItems: "center", gap: 14, cursor: "pointer" }}>
        <div aria-hidden="true" style={{ width: 48, height: 48, borderRadius: 14, background: "rgba(255,255,255,0.18)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, flexShrink: 0 }}>🦎</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: T.onAccent, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Featured species</div>
          <div style={{ fontSize: 17, fontWeight: 700, color: T.onAccent, marginBottom: 2 }}>Blue-tongue Skink</div>
          <div style={{ fontSize: 13, color: T.onAccent }}>Great beginner reptile ↗</div>
        </div>
        <span aria-hidden="true" style={{ color: T.onAccent }}><Icon name="chevron" size={20} /></span>
      </div>
      <h2 style={{ margin: "0 0 12px", fontSize: 13, fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: "0.08em" }}>Browse by category</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 10 }}>
        {CATEGORIES.map(cat => (
          <div key={cat.id} onClick={() => setCategory(cat.id)}
            style={{ background: T.card, borderRadius: 16, overflow: "hidden", cursor: "pointer", minWidth: 0 }}>
            {imageFor(cat.id)
              ? <CategoryCardImage image={imageFor(cat.id)} bg={T.imgBg} onBroken={() => markBroken(imageFor(cat.id).url)} />
              : <CategoryEmoji emoji={cat.emoji} bg={T.cardHi} />}
            <div style={{ padding: "10px 12px 12px" }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: T.text, marginBottom: 4, lineHeight: 1.3, overflowWrap: "break-word" }}>{cat.label}</div>
              <div style={{ fontSize: 12, color: T.muted, lineHeight: 1.45, marginBottom: 6 }}>{cat.desc}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: T.accentText }}>{cat.count} species →</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BrowseScreen;
