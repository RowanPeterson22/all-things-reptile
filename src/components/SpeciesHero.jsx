import { T } from "../constants/theme";
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
// to the emoji header. Category pages use it too (their banner crop as heroCrop).

export const HERO_MAX_H = 240;
const OVERLAP = 20;
// The exact 2.4 : 1 frame: full width up to 576 px, centred beyond that.
const frame = { position: "absolute", top: 0, left: "50%", height: "100%", aspectRatio: "2.4 / 1", maxWidth: "100%", transform: "translateX(-50%)" };

// The species page's tall hero (variant "tall", the dark design): full width,
// about 400 px tall on a 390 px phone, a dark fade at the bottom, `overlay`
// (pills, name, latin) over the fade, the back button (children) top left and
// the credit top right. The 2.4 : 1 crop Rowan sets can't fill a near-square
// frame, so the photo covers it centred on the crop's centre (else the focus
// point).
export const TALL_H = "min(103vw, 440px)";

export const tallPosition = (photo) => {
  const c = photo && photo.heroCrop && photo.width > 0 && photo.height > 0 ? heroCropFor(photo) : null;
  if (!c) return objectPosition(photo && photo.focal);
  return objectPosition({ x: c.x + c.w / 2, y: c.y + c.h / 2 });
};

const SAFE_TOP = "calc(env(safe-area-inset-top, 0px) + 12px)";

export const TallHero = ({ photo, name, onBroken, children, overlay, testId = "species-hero" }) => (
  <div data-testid={testId} data-variant="tall" style={{ position: "relative", width: "100%", height: TALL_H, minHeight: 300, background: T.imgBg, overflow: "hidden" }}>
    <img data-layout-decor="" src={photo.url} alt={photo.alt || name} width={photo.width || undefined} height={photo.height || undefined} loading="eager" decoding="async"
      onError={() => onBroken && onBroken()}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: tallPosition(photo), display: "block" }} />
    <div data-layout-decor="" aria-hidden="true" style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.45), rgba(0,0,0,0) 28%, rgba(0,0,0,0) 45%, rgba(0,0,0,0.92))", pointerEvents: "none" }} />
    <div style={{ position: "absolute", top: SAFE_TOP, left: 14 }}>{children}</div>
    {/* The credit sits top right, where the design's (unbuilt) save button was,
        so it never meets the name however many lines that takes. */}
    <div style={{ position: "absolute", top: SAFE_TOP, right: 14, width: "calc(100% - 28px)", height: 220, pointerEvents: "none" }}>
      <PhotoCredit credit={photo.credit} placement="below" />
    </div>
    <div style={{ position: "absolute", left: 20, right: 20, bottom: 34 }}>{overlay}</div>
  </div>
);

const SpeciesHero = ({ photo, name, onBroken, children, testId = "species-hero" }) => {
  const crop = heroCropFor(photo);
  const imgStyle = crop
    ? heroImageStyle(crop)
    : { position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: objectPosition(photo.focal), display: "block" };
  return (
    <div data-testid={testId} style={{ position: "relative", width: "100%", aspectRatio: "2.4 / 1", maxHeight: HERO_MAX_H, background: T.bg, overflow: "hidden" }}>
      {/* Only seen beside the frame on screens wider than 576 px. */}
      <img data-layout-decor="" src={photo.url} alt="" aria-hidden="true" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: objectPosition(photo.focal), filter: "blur(18px) brightness(0.55)", transform: "scale(1.1)", display: "block" }} />
      <div data-testid="hero-frame" data-layout-decor="" style={{ ...frame, overflow: "hidden" }}>
        <img src={photo.url} alt={photo.alt || name} width={photo.width || undefined} height={photo.height || undefined} loading="eager" decoding="async"
          onError={() => onBroken && onBroken()} style={imgStyle} />
      </div>
      <div data-layout-decor="" aria-hidden="true" style={{ position: "absolute", top: 0, left: 0, right: 0, height: 84, background: "linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0))", pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, padding: "calc(env(safe-area-inset-top, 0px) + 10px) 16px 0" }}>
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
