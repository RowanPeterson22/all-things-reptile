import { useEffect, useId, useRef, useState } from "react";
import { T } from "../constants/theme";
import { objectPosition } from "./focal";

// ─── Photo credit icon + popover ──────────────────────────────────
// Every customer-facing image from a photographer carries this: a small "i" in
// a bottom corner that opens a compact credit (photographer, licence linked to
// its deed, source linked to the original).
//
// `credit` comes ready-made from the server (lib/photoRules.js publicCredit):
//   { show, name, licence, licenceUrl, source, sourceUrl, edited }
// show === false (only allowed when the licence needs no attribution) hides it.
//
// Phone first: a 44 px tap target around a 26 px dark disc with a white ring,
// readable on light and dark photos without covering much of the animal.
// Closes on tap outside, Escape (focus returns to the icon) or tapping it again.

// tone "dark" (the public app) or "light" (/admin, which stays light).
const TONES = {
  dark: { ink: T.text, muted: T.muted, line: T.line, bg: T.cardHi, link: T.accentText },
  light: { ink: "#222", muted: "#666", line: "#e8e8e4", bg: "white", link: "#d15917" },
};

const matchesFocusVisible = (el) => {
  try { return el.matches(":focus-visible"); } catch (e) { return true; }
};

const linkStyle = (tone) => ({ color: TONES[tone].link, fontWeight: 700, textDecoration: "underline", textUnderlineOffset: 2 });
const ext = { target: "_blank", rel: "noopener noreferrer" };

// The popover's lines as plain data, so tests and the credits page agree on wording.
export const creditLines = (credit) => {
  if (!credit) return [];
  const lines = [{ label: "Photo", text: credit.name }];
  if (credit.licence) lines.push({ label: "Licence", text: credit.licence, href: credit.licenceUrl || null });
  if (credit.source) lines.push({ label: "Source", text: credit.source, href: credit.sourceUrl || null });
  // CC BY requires changes to be indicated (crops, rotation, colour).
  if (credit.edited) lines.push({ label: "Changes", text: "Modified from the original" });
  return lines;
};

export const CreditText = ({ credit, style, tone = "dark" }) => (
  <div style={{ fontSize: 12, lineHeight: 1.55, color: TONES[tone].ink, ...style }}>
    {creditLines(credit).map(l => (
      <div key={l.label}>
        <span style={{ color: TONES[tone].muted }}>{l.label}: </span>
        {l.href ? <a href={l.href} {...ext} style={linkStyle(tone)}>{l.text}{l.label === "Source" ? " ↗" : ""}</a> : <span style={{ fontWeight: l.label === "Photo" ? 700 : 400 }}>{l.text}</span>}
      </div>
    ))}
  </div>
);

// placement "above" (the popover opens upwards from a bottom corner) or
// "below" (from a top corner, e.g. the species hero).
export const PhotoCredit = ({ credit, corner = "right", tone = "dark", placement = "above" }) => {
  const [open, setOpen] = useState(false);
  const [focusRing, setFocusRing] = useState(false);
  const wrapRef = useRef(null);
  const btnRef = useRef(null);
  const id = useId();

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
    const onKey = (e) => {
      if (e.key === "Escape") { setOpen(false); if (btnRef.current) btnRef.current.focus(); }
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("touchstart", onDown, { passive: true });
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("touchstart", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!credit || credit.show === false) return null;
  const side = corner === "left" ? { left: 0 } : { right: 0 };
  const below = placement === "below";
  const look = TONES[tone];

  return (
    <div ref={wrapRef} style={{ position: "absolute", [below ? "top" : "bottom"]: 0, ...side, width: "100%", height: "100%", pointerEvents: "none" }}>
      {open && (
        <div id={id} role="dialog" aria-label="Photo credit"
          style={{ position: "absolute", [below ? "top" : "bottom"]: 46, ...(corner === "left" ? { left: 6 } : { right: 6 }), maxWidth: "calc(100% - 12px)", maxHeight: below ? "none" : "calc(100% - 52px)", overflowY: "auto", boxSizing: "border-box", width: 250, background: look.bg, borderRadius: 12, padding: "10px 12px", boxShadow: "0 4px 18px rgba(0,0,0,0.45)", border: `1px solid ${look.line}`, pointerEvents: "auto", textAlign: "left", zIndex: 5 }}>
          <CreditText credit={credit} tone={tone} />
        </div>
      )}
      <button ref={btnRef} type="button" aria-label="Photo credit" aria-expanded={open} aria-controls={open ? id : undefined}
        onClick={(e) => { e.stopPropagation(); setOpen(o => !o); }}
        onFocus={(e) => setFocusRing(matchesFocusVisible(e.currentTarget))}
        onBlur={() => setFocusRing(false)}
        style={{ position: "absolute", [below ? "top" : "bottom"]: 0, ...side, width: 44, height: 44, padding: 0, margin: 0, border: "none", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "auto", WebkitTapHighlightColor: "transparent", outline: focusRing ? `3px solid ${tone === "light" ? "#d15917" : T.focus}` : "none", outlineOffset: -4, borderRadius: 12 }}>
        <span aria-hidden="true" style={{ width: 24, height: 24, borderRadius: "50%", background: open ? T.accent : "rgba(0,0,0,0.55)", border: "1.5px solid rgba(255,255,255,0.9)", color: "white", fontFamily: "Georgia, 'Times New Roman', serif", fontStyle: "italic", fontWeight: 700, fontSize: 14, lineHeight: "21px", textAlign: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.35)", boxSizing: "border-box" }}>i</span>
      </button>
    </div>
  );
};

// ─── An image with its credit ─────────────────────────────────────
// Lazy-loads; hides itself if the image fails to load (e.g. a photo just
// taken off the species page while a cached list still names it).
// focal { x, y } (0–1) is the focus point: the object-position when cropped.
export const CreditedImage = ({ src, alt, credit, width, height, focal, style, imgStyle, corner, tone, loading = "lazy" }) => {
  const [broken, setBroken] = useState(false);
  if (!src || broken) return null;
  return (
    <div style={{ position: "relative", ...style }}>
      <img src={src} alt={alt || ""} width={width || undefined} height={height || undefined} loading={loading} decoding="async"
        onError={() => setBroken(true)}
        style={{ display: "block", width: "100%", height: "100%", objectFit: "cover", objectPosition: objectPosition(focal), ...imgStyle }} />
      <PhotoCredit credit={credit} corner={corner} tone={tone} />
    </div>
  );
};

export default CreditedImage;
