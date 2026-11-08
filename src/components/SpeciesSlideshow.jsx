import { useCallback, useEffect, useRef, useState } from "react";
import { C } from "../constants/colours";
import { CreditedImage } from "./PhotoCredit";

// ─── Species photo slideshow ──────────────────────────────────────
// The species' public photos other than the hero, one at a time in a 4:3
// frame (each on its focus point), cross-fading every ~5 s and looping.
// Previous / next arrows (40 px), dots ("Photo n of N") and swipe step
// through it. Auto-advance pauses while the user interacts (pointer down,
// keyboard focus inside, mouse over) and for ~10 s after, stops while the tab
// is hidden, and never runs with prefers-reduced-motion. The live region only
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

const frameStyle = { position: "relative", width: "100%", aspectRatio: "4 / 3", borderRadius: 12, overflow: "hidden", background: "#f0f0ec" };

// A 40 px dark disc with a white ring and chevron: readable on light and dark photos.
const Arrow = ({ dir, onClick }) => (
  <button type="button" aria-label={dir < 0 ? "Previous photo" : "Next photo"} onClick={onClick}
    style={{ position: "absolute", top: "50%", [dir < 0 ? "left" : "right"]: 8, transform: "translateY(-50%)", width: 40, height: 40, padding: 0, margin: 0, borderRadius: "50%", border: "1.5px solid rgba(255,255,255,0.9)", background: "rgba(0,0,0,0.5)", boxShadow: "0 1px 4px rgba(0,0,0,0.35)", color: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2, WebkitTapHighlightColor: "transparent", fontFamily: "inherit" }}>
    <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
      {dir < 0 ? <path d="M15 5l-7 7 7 7" /> : <path d="M9 5l7 7-7 7" />}
    </svg>
  </button>
);

const SpeciesSlideshow = ({ photos, autoMs = AUTO_MS, resumeMs = RESUME_MS }) => {
  const list = photos || [];
  const count = list.length;
  const [index, setIndex] = useState(0);
  const [manual, setManual] = useState(false); // last change came from the user
  const [holding, setHolding] = useState(0);   // pointer down / focus inside / hover (a count)
  const [holdUntil, setHoldUntil] = useState(0);
  const reduced = useReducedMotion();
  const hidden = usePageHidden();
  const swipe = useRef(null);
  const holds = useRef({ pointer: false, focus: false, hover: false });

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

  // Auto-advance: one timer per slide, re-armed on every change.
  useEffect(() => {
    if (count < 2 || reduced || hidden || holding) return undefined;
    const wait = Math.max(autoMs, holdUntil - Date.now());
    const t = setTimeout(() => { setManual(false); setIndex(i => (i + 1) % count); }, wait);
    return () => clearTimeout(t);
  }, [index, count, reduced, hidden, holding, holdUntil, autoMs]);

  if (!count) return null;
  const current = Math.min(index, count - 1);

  if (count === 1) {
    const p = list[0];
    return (
      <div data-testid="species-slideshow" role="region" aria-label="Photos" style={{ marginBottom: 14 }}>
        <CreditedImage src={p.url} alt={p.alt} credit={p.credit} width={p.width} height={p.height} focal={p.focal} style={frameStyle} />
      </div>
    );
  }

  const onPointerDown = (e) => {
    setHold("pointer", true);
    swipe.current = { x: e.clientX, y: e.clientY, id: e.pointerId };
  };
  const endPointer = (e) => {
    const s = swipe.current;
    swipe.current = null;
    setHold("pointer", false);
    if (!s || e.type === "pointercancel") return;
    const dx = e.clientX - s.x;
    const dy = e.clientY - s.y;
    if (Math.abs(dx) >= SWIPE_PX && Math.abs(dx) > Math.abs(dy)) go(dx < 0 ? 1 : -1);
  };

  return (
    <div data-testid="species-slideshow" role="region" aria-roledescription="carousel" aria-label="Photos" style={{ marginBottom: 14 }}
      onFocus={(e) => {
        // Keyboard focus only: a tapped arrow keeps focus in some browsers, and
        // that shouldn't pause the show for good.
        let keyboard = true;
        try { keyboard = e.target.matches(":focus-visible"); } catch (err) { keyboard = true; }
        if (keyboard) setHold("focus", true);
      }}
      onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setHold("focus", false); }}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") { e.preventDefault(); go(-1); }
        if (e.key === "ArrowRight") { e.preventDefault(); go(1); }
      }}>
      <div style={{ ...frameStyle, touchAction: "pan-y" }}
        onPointerDown={onPointerDown} onPointerUp={endPointer} onPointerCancel={endPointer}
        onPointerEnter={(e) => { if (e.pointerType === "mouse") setHold("hover", true); }}
        onPointerLeave={(e) => { if (e.pointerType === "mouse") setHold("hover", false); }}>
        {list.map((p, i) => {
          const on = i === current;
          return (
            <div key={p.id || i} role="group" aria-roledescription="slide" aria-label={`Photo ${i + 1} of ${count}`} aria-hidden={on ? undefined : "true"} inert={on ? undefined : true}
              data-active={on ? "true" : "false"}
              style={{ position: "absolute", inset: 0, opacity: on ? 1 : 0, transition: reduced ? "none" : "opacity 0.6s ease", pointerEvents: on ? "auto" : "none" }}>
              <CreditedImage src={p.url} alt={p.alt} credit={p.credit} width={p.width} height={p.height} focal={p.focal} loading={on || i === (current + 1) % count ? "eager" : "lazy"}
                style={{ width: "100%", height: "100%" }} />
            </div>
          );
        })}
        <Arrow dir={-1} onClick={() => go(-1)} />
        <Arrow dir={1} onClick={() => go(1)} />
      </div>
      <div style={{ display: "flex", justifyContent: "center", gap: 2, marginTop: 4 }}>
        {list.map((p, i) => (
          <button key={p.id || i} type="button" aria-label={`Photo ${i + 1} of ${count}`} aria-current={i === current ? "true" : undefined} onClick={() => goTo(i)}
            style={{ width: 28, height: 28, padding: 0, border: "none", background: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", WebkitTapHighlightColor: "transparent" }}>
            <span aria-hidden="true" style={{ width: i === current ? 18 : 8, height: 8, borderRadius: 4, background: i === current ? C.green : "#c8c8c2", transition: reduced ? "none" : "width 0.2s" }} />
          </button>
        ))}
      </div>
      {/* Announce only what the user did; silent during auto-advance. */}
      <div data-testid="slideshow-status" aria-live={manual ? "polite" : "off"} aria-atomic="true"
        style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)", whiteSpace: "nowrap" }}>
        Photo {current + 1} of {count}
      </div>
    </div>
  );
};

export default SpeciesSlideshow;
