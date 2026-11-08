import { useCallback, useEffect, useRef, useState } from "react";

// ─── ScrollRow ───────────────────────────────────────────────────
// A horizontally scrolling row that looks scrollable on a phone: the edge with
// more content fades out and shows a small chevron button (tap to scroll).
// The fade is a mask on the row itself, so it works on any background.
// tone: "light" (row sits on white) or "dark" (row sits on a coloured header).
// Drop-in for a `display: flex; overflowX: auto` div: pass its style through.

const FADE = 28; // px

const ScrollRow = ({ style = {}, tone = "light", children, label = "More" }) => {
  const ref = useRef(null);
  const [edges, setEdges] = useState({ left: false, right: false });

  const measure = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const left = el.scrollLeft > 2;
    const right = el.scrollLeft + el.clientWidth < el.scrollWidth - 2;
    setEdges(e => (e.left === left && e.right === right ? e : { left, right }));
  }, []);

  useEffect(() => {
    measure();
    const el = ref.current;
    if (!el) return undefined;
    let ro;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(measure);
      ro.observe(el);
      Array.from(el.children).forEach(c => ro.observe(c));
    }
    window.addEventListener("resize", measure);
    return () => { if (ro) ro.disconnect(); window.removeEventListener("resize", measure); };
  }, [measure, children]);

  const nudge = (dir) => {
    const el = ref.current;
    if (!el) return;
    const by = Math.max(120, el.clientWidth * 0.7) * dir;
    if (typeof el.scrollBy === "function") el.scrollBy({ left: by, behavior: "smooth" });
    else el.scrollLeft += by;
  };

  // Margins stay on the wrapper so the chevrons sit at the visible edge.
  const { margin, ...inner } = style;
  const mask = `linear-gradient(to right, ${edges.left ? "transparent" : "#000"} 0, #000 ${edges.left ? FADE : 0}px, #000 calc(100% - ${edges.right ? FADE + 8 : 0}px), ${edges.right ? "transparent" : "#000"} 100%)`;

  const btn = (dir) => ({
    position: "absolute", top: "50%", [dir < 0 ? "left" : "right"]: 2, transform: "translateY(-50%)",
    width: 24, height: 24, borderRadius: 12, border: "none", padding: 0, cursor: "pointer",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 16, lineHeight: 1, fontFamily: "inherit", fontWeight: 700,
    background: tone === "dark" ? "rgba(0,0,0,0.35)" : "rgba(255,255,255,0.95)",
    color: tone === "dark" ? "#fff" : "#555",
    boxShadow: tone === "dark" ? "none" : "0 1px 4px rgba(0,0,0,0.18)",
    zIndex: 1,
  });

  return (
    <div style={{ position: "relative", margin }}>
      <div
        ref={ref}
        onScroll={measure}
        style={{ ...inner, overflowX: "auto", scrollbarWidth: "none", WebkitOverflowScrolling: "touch", WebkitMaskImage: mask, maskImage: mask }}
      >
        {children}
      </div>
      {edges.left && <button type="button" aria-label={`Scroll back`} onClick={() => nudge(-1)} style={btn(-1)}>‹</button>}
      {edges.right && <button type="button" aria-label={`${label}: scroll for more`} onClick={() => nudge(1)} style={btn(1)}>›</button>}
    </div>
  );
};

export default ScrollRow;
