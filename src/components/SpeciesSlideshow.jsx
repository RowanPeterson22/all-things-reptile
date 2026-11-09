import { useCallback, useEffect, useRef, useState } from "react";
import { T } from "../constants/theme";
import { CreditedImage, PhotoCredit } from "./PhotoCredit";
import { tallPosition, TALL_H } from "./heroCrop";

// ─── Species photo slideshow ──────────────────────────────────────
// The species' public photos other than the hero, one at a time in a 4:3
// frame (each on its focus point), cross-fading every ~5 s and looping.
// Previous / next arrows (40 px), dots ("Photo n of N") and swipe step
// through it. Auto-advance pauses while the user interacts (pointer down,
// keyboard focus inside) and for ~10 s after, and stops while the tab is
// hidden. Mouse hover doesn't pause it. With prefers-reduced-motion it still
// advances, as a slower plain fade (no movement). The live region only
// announces changes the user made. One photo: shown alone, no controls.
// None: nothing.

export const AUTO_MS = 5000;
export const RESUME_MS = 10000;
const SWIPE_PX = 40;

const prefersReducedMotion = () => {
  try { return typeof window !== "undefined" && typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) { return false; }
};

const useReducedMotion = () => {
  const [reduced, setReduced] = useState(prefersReducedMotion);
  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return undefined;
    let mq;
    try { mq = window.matchMedia("(prefers-reduced-motion: reduce)"); } catch (e) { return undefined; }
    if (!mq) return undefined;
    const on = () => setReduced(Boolean(mq.matches));
    if (mq.addEventListener) mq.addEventListener("change", on); else if (mq.addListener) mq.addListener(on);
    return () => { if (mq.removeEventListener) mq.removeEventListener("change", on); else if (mq.removeListener) mq.removeListener(on); };
  }, []);
  return reduced;
};

const usePageHidden = () => {
  const [hidden, setHidden] = useState(() => typeof document !== "undefined" && document.visibilityState === "hidden");
  useEffect(() => {
    const on = () => setHidden(document.visibilityState === "hidden");
    document.addEventListener("visibilitychange", on);
    return () => document.removeEventListener("visibilitychange", on);
  }, []);
  return hidden;
};

const frameStyle = { position: "relative", width: "100%", aspectRatio: "4 / 3", borderRadius: 16, overflow: "hidden", background: T.imgBg };

// A 40 px dark disc with a white ring and chevron: readable on light and dark photos.
const Arrow = ({ dir, onClick }) => (
  <button type="button" aria-label={dir < 0 ? "Previous photo" : "Next photo"} onClick={onClick}
    style={{ position: "absolute", top: "50%", [dir < 0 ? "left" : "right"]: 8, transform: "translateY(-50%)", width: 40, height: 40, padding: 0, margin: 0, borderRadius: "50%", border: "1.5px solid rgba(255,255,255,0.9)", background: "rgba(0,0,0,0.5)", boxShadow: "0 1px 4px rgba(0,0,0,0.35)", color: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2, WebkitTapHighlightColor: "transparent", fontFamily: "inherit" }}>
    <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
      {dir < 0 ? <path d="M15 5l-7 7 7 7" /> : <path d="M9 5l7 7-7 7" />}
    </svg>
  </button>
);

// ─── The shared behaviour ─────────────────────────────────────────
// Index, auto-advance (one timer per slide, paused while held, ~10 s after a
// user step, and while the tab is hidden), swipe and arrow keys. Used by the
// card slideshow below and the species page's hero (HeroSlideshow).
export const useSlides = (count, { autoMs = AUTO_MS, resumeMs = RESUME_MS } = {}) => {
  const [index, setIndex] = useState(0);
  const [manual, setManual] = useState(false); // last change came from the user
  const [holding, setHolding] = useState(0);   // pointer down / keyboard focus inside (a count)
  const [holdUntil, setHoldUntil] = useState(0);
  const reduced = useReducedMotion();
  const hidden = usePageHidden();
  const swipe = useRef(null);
  const holds = useRef({ pointer: false, focus: false });

  useEffect(() => { if (index >= count && count) setIndex(0); }, [index, count]);

  const touch = useCallback(() => setHoldUntil(Date.now() + resumeMs), [resumeMs]);
  const go = useCallback((delta) => {
    if (count < 2) return;
    setManual(true);
    setIndex(i => (i + delta + count) % count);
    touch();
  }, [count, touch]);
  const goTo = (i) => { setManual(true); setIndex(i); touch(); };

  const setHold = (kind, on) => {
    if (holds.current[kind] === on) return;
    holds.current[kind] = on;
    setHolding(Object.values(holds.current).filter(Boolean).length);
    if (!on) touch();
  };

  useEffect(() => {
    if (count < 2 || hidden || holding) return undefined;
    const wait = Math.max(autoMs, holdUntil - Date.now());
    const t = setTimeout(() => { setManual(false); setIndex(i => (i + 1) % count); }, wait);
    return () => clearTimeout(t);
  }, [index, count, hidden, holding, holdUntil, autoMs]);

  const current = count ? Math.min(index, count - 1) : 0;
  // On the region: keyboard focus pauses (a tapped control keeping focus
  // shouldn't pause it for good), arrow keys step.
  const regionProps = {
    onFocus: (e) => {
      let keyboard = true;
      try { keyboard = e.target.matches(":focus-visible"); } catch (err) { keyboard = true; }
      if (keyboard) setHold("focus", true);
    },
    onBlur: (e) => { if (!e.currentTarget.contains(e.relatedTarget)) setHold("focus", false); },
    onKeyDown: (e) => {
      if (e.key === "ArrowLeft") { e.preventDefault(); go(-1); }
      if (e.key === "ArrowRight") { e.preventDefault(); go(1); }
    },
  };
  // On the photo frame: holding a finger pauses; a horizontal swipe steps.
  const frameProps = {
    onPointerDown: (e) => { setHold("pointer", true); swipe.current = { x: e.clientX, y: e.clientY, id: e.pointerId }; },
    onPointerUp: (e) => endPointer(e),
    onPointerCancel: (e) => endPointer(e),
  };
  function endPointer(e) {
    const s = swipe.current;
    swipe.current = null;
    setHold("pointer", false);
    if (!s || e.type === "pointercancel") return;
    const dx = e.clientX - s.x;
    const dy = e.clientY - s.y;
    if (Math.abs(dx) >= SWIPE_PX && Math.abs(dx) > Math.abs(dy)) go(dx < 0 ? 1 : -1);
  }
  return { current, manual, reduced, go, goTo, regionProps, frameProps };
};

const slideStyle = (on, reduced) => ({ position: "absolute", inset: 0, opacity: on ? 1 : 0, transition: reduced ? "opacity 1.2s linear" : "opacity 0.6s ease", pointerEvents: on ? "auto" : "none" });
const slideProps = (on, i, count) => ({ role: "group", "aria-roledescription": "slide", "aria-label": `Photo ${i + 1} of ${count}`, "aria-hidden": on ? undefined : "true", inert: on ? undefined : true, "data-active": on ? "true" : "false" });

// Dots: "Photo n of N", 36 × 44 tap targets. onPhoto: white over a photo.
const Dots = ({ list, current, goTo, reduced, onPhoto = false }) => (
  <div data-testid="slideshow-dots" style={{ display: "flex", justifyContent: "center", gap: 2 }}>
    {list.map((p, i) => (
      <button key={p.id || i} type="button" aria-label={`Photo ${i + 1} of ${list.length}`} aria-current={i === current ? "true" : undefined} onClick={() => goTo(i)}
        style={{ width: 36, height: 44, padding: 0, border: "none", background: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", WebkitTapHighlightColor: "transparent" }}>
        <span aria-hidden="true" style={{ width: i === current ? 18 : 8, height: onPhoto ? 6 : 8, borderRadius: 4,
          background: i === current ? (onPhoto ? "#FFFFFF" : T.accent) : (onPhoto ? "rgba(255,255,255,0.5)" : T.dotIdle),
          boxShadow: onPhoto ? "0 1px 3px rgba(0,0,0,0.5)" : "none", transition: reduced ? "none" : "width 0.2s" }} />
      </button>
    ))}
  </div>
);

// Announce only what the user did; silent during auto-advance.
const Status = ({ manual, current, count }) => (
  <div data-testid="slideshow-status" aria-live={manual ? "polite" : "off"} aria-atomic="true"
    style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)", whiteSpace: "nowrap" }}>
    Photo {current + 1} of {count}
  </div>
);

// ─── Card slideshow (4:3 frame, arrows, dots below) ──────────────
const SpeciesSlideshow = ({ photos, autoMs = AUTO_MS, resumeMs = RESUME_MS }) => {
  const list = photos || [];
  const count = list.length;
  const { current, manual, reduced, go, goTo, regionProps, frameProps } = useSlides(count, { autoMs, resumeMs });

  if (!count) return null;

  if (count === 1) {
    const p = list[0];
    return (
      <div data-testid="species-slideshow" role="region" aria-label="Photos">
        <CreditedImage src={p.url} alt={p.alt} credit={p.credit} width={p.width} height={p.height} focal={p.focal} style={frameStyle} />
      </div>
    );
  }

  return (
    <div data-testid="species-slideshow" role="region" aria-roledescription="carousel" aria-label="Photos" style={{ position: "relative" }} {...regionProps}>
      <div style={{ ...frameStyle, touchAction: "pan-y" }} {...frameProps}>
        {list.map((p, i) => {
          const on = i === current;
          return (
            <div key={p.id || i} {...slideProps(on, i, count)} style={slideStyle(on, reduced)}>
              <CreditedImage src={p.url} alt={p.alt} credit={p.credit} width={p.width} height={p.height} focal={p.focal} loading={on || i === (current + 1) % count ? "eager" : "lazy"}
                style={{ width: "100%", height: "100%" }} />
            </div>
          );
        })}
        <Arrow dir={-1} onClick={() => go(-1)} />
        <Arrow dir={1} onClick={() => go(1)} />
      </div>
      <div style={{ marginTop: 2, marginBottom: -10 }}><Dots list={list} current={current} goTo={goTo} reduced={reduced} /></div>
      <Status manual={manual} current={current} count={count} />
    </div>
  );
};

// ─── The species page hero as the slideshow (the dark design) ─────
// Full width, about 400 px tall on a 390 px phone, a dark fade at the bottom.
// photos: the hero-ticked photo (or the fallback) first, then the rest of the
// public photos; it starts on the first and cycles with the same rules as the
// card. Over the photo: the back button (children) top left, one ⓘ top right
// for the current photo's credit, and at the bottom the dots (two or more
// photos) above the overlay (pills, name, latin). No arrows: on a 320 px
// phone a three-line name reaches mid-height; swipe, dots and the arrow keys
// step it. onBroken(photo) when an image fails to load.
export const HeroSlideshow = ({ photos, name, overlay, children, onBroken, autoMs = AUTO_MS, resumeMs = RESUME_MS }) => {
  const list = photos || [];
  const count = list.length;
  const { current, manual, reduced, goTo, regionProps, frameProps } = useSlides(count, { autoMs, resumeMs });
  if (!count) return null;
  const shown = list[current];
  const multi = count > 1;
  return (
    <div data-testid="species-hero" data-variant="tall" role="region" aria-roledescription={multi ? "carousel" : undefined} aria-label="Photos"
      style={{ position: "relative", width: "100%", height: TALL_H, minHeight: 300, background: T.imgBg, overflow: "hidden" }} {...(multi ? regionProps : {})}>
      <div data-layout-decor="" style={{ position: "absolute", inset: 0, touchAction: "pan-y" }} {...(multi ? frameProps : {})}>
        {list.map((p, i) => {
          const on = i === current;
          return (
            <div key={p.id || i} {...(multi ? slideProps(on, i, count) : {})} style={slideStyle(on, reduced)}>
              <img src={p.url} alt={p.alt || name} width={p.width || undefined} height={p.height || undefined} decoding="async"
                loading={on || i === (current + 1) % count ? "eager" : "lazy"} onError={() => onBroken && onBroken(p)}
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: tallPosition(p), display: "block" }} />
            </div>
          );
        })}
        <div aria-hidden="true" style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.45), rgba(0,0,0,0) 28%, rgba(0,0,0,0) 45%, rgba(0,0,0,0.92))", pointerEvents: "none" }} />
      </div>
      <div style={{ position: "absolute", top: "calc(env(safe-area-inset-top, 0px) + 12px)", left: 14 }}>{children}</div>
      <div style={{ position: "absolute", top: "calc(env(safe-area-inset-top, 0px) + 12px)", right: 14, width: "calc(100% - 28px)", height: 220, pointerEvents: "none" }}>
        <PhotoCredit key={shown.id || current} credit={shown.credit} placement="below" />
      </div>
      <div style={{ position: "absolute", left: 20, right: 20, bottom: 34 }}>
        {multi && <div style={{ margin: "0 0 6px" }}><Dots list={list} current={current} goTo={goTo} reduced={reduced} onPhoto /></div>}
        {overlay}
      </div>
      {multi && <Status manual={manual} current={current} count={count} />}
    </div>
  );
};

export default SpeciesSlideshow;
