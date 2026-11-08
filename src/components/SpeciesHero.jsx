import { C } from "../constants/colours";
import { PhotoCredit } from "./PhotoCredit";
import { objectPosition } from "./focal";
import { heroCropFor, heroImageStyle } from "./heroCrop";

// ─── Species page hero banner ─────────────────────────────────────
// A fixed 2.4 : 1 banner (about 156 px tall at 375 px), capped at 240 px on
// wide screens: there the 2.4 : 1 frame stays centred over a blurred, darkened
// copy of the photo, so the crop is never distorted. The image is placed so
// Rowan's crop rect fills the frame exactly (or the widest crop centred on the
// focus point when he hasn't set one). The white sheet overlaps the bottom
// 20 px, so the credit icon sits above that. Renders the back button over a
// dark top fade. Calls onBroken if the image fails, so the page can fall back
// to the emoji header.

export const HERO_MAX_H = 240;
const OVERLAP = 20;
// The exact 2.4 : 1 frame: full width up to 576 px, centred beyond that.
const frame = { position: "absolute", top: 0, left: "50%", height: "100%", aspectRatio: "2.4 / 1", maxWidth: "100%", transform: "translateX(-50%)" };

const SpeciesHero = ({ photo, name, onBroken, children }) => {
  const crop = heroCropFor(photo);
  const imgStyle = crop
    ? heroImageStyle(crop)
    : { position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: objectPosition(photo.focal), display: "block" };
  return (
    <div data-testid="species-hero" style={{ position: "relative", width: "100%", aspectRatio: "2.4 / 1", maxHeight: HERO_MAX_H, background: C.black, overflow: "hidden" }}>
      {/* Only seen beside the frame on screens wider than 576 px. */}
      <img src={photo.url} alt="" aria-hidden="true" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: objectPosition(photo.focal), filter: "blur(18px) brightness(0.55)", transform: "scale(1.1)", display: "block" }} />
      <div data-testid="hero-frame" style={{ ...frame, overflow: "hidden" }}>
        <img src={photo.url} alt={photo.alt || name} width={photo.width || undefined} height={photo.height || undefined} loading="eager" decoding="async"
          onError={() => onBroken && onBroken()} style={imgStyle} />
      </div>
      <div aria-hidden="true" style={{ position: "absolute", top: 0, left: 0, right: 0, height: 84, background: "linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0))", pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, padding: "calc(env(safe-area-inset-top, 0px) + 6px) 20px 0" }}>
        {children}
      </div>
      {/* The credit sits over the frame, above the fade and back row, and
          clear of the sheet's 20 px overlap. */}
      <div style={{ ...frame, pointerEvents: "none" }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: OVERLAP }}>
          <PhotoCredit credit={photo.credit} />
        </div>
      </div>
    </div>
  );
};

export default SpeciesHero;
