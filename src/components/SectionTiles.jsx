import { UI } from "./appUi";
import Icon from "./Icon";

// ─── Small shared pieces for the new screens ─────────────────────
// Home, the Community and My Profile tab pages, Coming soon pages. Items come
// from the shell (src/constants/appLayout.js shellFor): key, icon (a key in
// ./Icon), title, blurb, path, status ("live" | "soon" | "hidden").
// Colours and sizes: ./appUi.js.

export const Card = ({ children, style, ...rest }) => (
  <div {...rest} style={{ background: UI.cardBg, borderRadius: UI.radius, border: UI.cardBorder, ...style }}>{children}</div>
);

export const SectionHeading = ({ children, style }) => (
  <h2 style={{ margin: "0 0 10px", fontSize: UI.heading.size, fontWeight: 700, color: UI.muted, textTransform: "uppercase", letterSpacing: UI.heading.spacing, ...style }}>{children}</h2>
);

// The rounded square an icon sits in. tone "pale" (orange line on the dark
// chip) | "accent" (white on orange) | "onAccent" (white on a translucent
// square, over orange).
export const IconBadge = ({ name, size = UI.tile.icon, tone = "pale" }) => {
  const look = tone === "accent" ? { background: UI.accent, color: UI.onAccent }
    : tone === "onAccent" ? { background: "rgba(255,255,255,0.18)", color: UI.onAccent }
      : { background: UI.accentPale, color: UI.accentText };
  return (
    <div aria-hidden="true" style={{ width: size, height: size, borderRadius: UI.tile.iconRadius, ...look, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <Icon name={name} size={Math.round(size * 0.55)} />
    </div>
  );
};

// "Coming soon" for placeholders; "Hidden" only ever reaches admins.
export const StatusBadge = ({ status, onDark = false }) => {
  if (status !== "soon" && status !== "hidden") return null;
  const hidden = status === "hidden";
  const look = onDark ? { background: "rgba(255,255,255,0.22)", color: UI.onAccent }
    : hidden ? { background: UI.hiddenBg, color: UI.hiddenFg } : { background: UI.soonBg, color: UI.soonFg };
  return (
    <span data-testid={`badge-${status}`} style={{ display: "inline-block", ...look, borderRadius: 999, padding: "3px 8px", fontSize: 11, fontWeight: 700, letterSpacing: "0.02em", whiteSpace: "nowrap", lineHeight: 1.3 }}>
      {hidden ? "Hidden" : "Coming soon"}
    </span>
  );
};

const clamp = (lines) => ({ display: "-webkit-box", WebkitLineClamp: lines, WebkitBoxOrient: "vertical", overflow: "hidden" });

export const SectionTile = ({ item, onOpen }) => (
  <button type="button" data-testid={`tile-${item.key}`} onClick={() => onOpen(item)}
    style={{ background: UI.cardBg, borderRadius: UI.radius, border: UI.cardBorder, padding: UI.tile.pad, textAlign: "left", cursor: "pointer", fontFamily: UI.font, display: "flex", flexDirection: "column", gap: 8, minHeight: UI.tile.minHeight, minWidth: 0, color: UI.ink, opacity: item.status === "hidden" ? 0.7 : 1 }}>
    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 6, width: "100%", flexWrap: "wrap" }}>
      <IconBadge name={item.icon} />
      <StatusBadge status={item.status} />
    </div>
    <div style={{ fontSize: UI.tile.title, fontWeight: 700, lineHeight: 1.3, overflowWrap: "break-word", maxWidth: "100%" }}>{item.title}</div>
    <div style={{ fontSize: UI.tile.blurb, color: UI.sub, lineHeight: 1.4, ...clamp(2) }}>{item.blurb}</div>
  </button>
);

export const TileGrid = ({ items, onOpen, testId }) => (
  <div data-testid={testId} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: UI.gap }}>
    {items.map(i => <SectionTile key={i.key} item={i} onOpen={onOpen} />)}
  </div>
);

export const FeaturedCard = ({ item, onOpen }) => (
  <button type="button" data-testid="featured-card" onClick={() => onOpen(item)}
    style={{ width: "100%", background: UI.accent, border: "none", borderRadius: 18, padding: UI.pad, display: "flex", alignItems: "center", gap: 12, cursor: "pointer", textAlign: "left", fontFamily: UI.font }}>
    <IconBadge name={item.icon} size={48} tone="onAccent" />
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4, flexWrap: "wrap" }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: UI.onAccent, textTransform: "uppercase", letterSpacing: UI.heading.spacing }}>Featured</span>
        <StatusBadge status={item.status} onDark />
      </div>
      <div style={{ fontSize: 17, fontWeight: 700, color: UI.onAccent, marginBottom: 2 }}>{item.title}</div>
      <div style={{ fontSize: 13, color: UI.onAccent, lineHeight: 1.45 }}>{item.blurb}</div>
    </div>
    <span aria-hidden="true" style={{ color: UI.onAccent }}><Icon name="chevron" size={20} /></span>
  </button>
);

// Compact "Planning your first reptile?" card (Home, until someone has animals).
export const PlanningCard = ({ onOpen, profileLabel }) => (
  <button type="button" data-testid="planning-card" onClick={onOpen}
    style={{ width: "100%", background: UI.cardBg, border: "none", borderRadius: 18, padding: 16, display: "flex", alignItems: "center", gap: 14, cursor: "pointer", textAlign: "left", fontFamily: UI.font }}>
    <div aria-hidden="true" style={{ width: 44, height: 44, borderRadius: 22, background: UI.accent, color: UI.onAccent, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Icon name="compass" size={22} strokeWidth={2} /></div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: 15, fontWeight: 700, color: UI.ink, marginBottom: 2 }}>Planning your first reptile?</div>
      <div style={{ fontSize: 13, color: UI.muted, lineHeight: 1.45 }}>Shortlist species, check your state's rules and plan the set-up in {profileLabel}.</div>
    </div>
    <span aria-hidden="true" style={{ color: UI.muted }}><Icon name="chevron" size={18} /></span>
  </button>
);
