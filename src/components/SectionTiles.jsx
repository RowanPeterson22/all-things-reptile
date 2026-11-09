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
  <div style={{ fontSize: UI.heading.size, fontWeight: 700, color: UI.muted, textTransform: "uppercase", letterSpacing: UI.heading.spacing, marginBottom: 10, ...style }}>{children}</div>
);

// The rounded square an icon sits in. tone "pale" (on white) | "accent" | "onAccent".
export const IconBadge = ({ name, size = UI.tile.icon, tone = "pale" }) => {
  const look = tone === "accent" ? { background: UI.accent, color: UI.onAccent }
    : tone === "onAccent" ? { background: "rgba(255,255,255,0.18)", color: UI.onAccent }
      : { background: UI.accentPale, color: UI.accent };
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
    <span data-testid={`badge-${status}`} style={{ display: "inline-block", ...look, borderRadius: 6, padding: "2px 7px", fontSize: 10, fontWeight: 700, letterSpacing: "0.02em", whiteSpace: "nowrap" }}>
      {hidden ? "Hidden" : "Coming soon"}
    </span>
  );
};

const clamp = (lines) => ({ display: "-webkit-box", WebkitLineClamp: lines, WebkitBoxOrient: "vertical", overflow: "hidden" });

export const SectionTile = ({ item, onOpen }) => (
  <button type="button" data-testid={`tile-${item.key}`} onClick={() => onOpen(item)}
    style={{ background: UI.cardBg, borderRadius: UI.radius, border: UI.cardBorder, padding: UI.tile.pad, textAlign: "left", cursor: "pointer", fontFamily: UI.font, display: "flex", flexDirection: "column", gap: 8, minHeight: UI.tile.minHeight, color: UI.ink, opacity: item.status === "hidden" ? 0.7 : 1 }}>
    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 6, width: "100%" }}>
      <IconBadge name={item.icon} />
      <StatusBadge status={item.status} />
    </div>
    <div style={{ fontSize: UI.tile.title, fontWeight: 700, lineHeight: 1.3 }}>{item.title}</div>
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
    style={{ width: "100%", background: UI.accent, border: "none", borderRadius: UI.radius, padding: UI.pad, display: "flex", alignItems: "center", gap: 12, cursor: "pointer", textAlign: "left", fontFamily: UI.font }}>
    <IconBadge name={item.icon} size={48} tone="onAccent" />
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4, flexWrap: "wrap" }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: UI.onAccentSoft, textTransform: "uppercase", letterSpacing: UI.heading.spacing }}>Featured</span>
        <StatusBadge status={item.status} onDark />
      </div>
      <div style={{ fontSize: 15, fontWeight: 700, color: UI.onAccent, marginBottom: 2 }}>{item.title}</div>
      <div style={{ fontSize: 12, color: UI.onAccentSoft, lineHeight: 1.4 }}>{item.blurb}</div>
    </div>
    <div aria-hidden="true" style={{ fontSize: 22, color: UI.onAccentSoft }}>›</div>
  </button>
);

// Compact "Planning your first reptile?" card (Home, until someone has animals).
export const PlanningCard = ({ onOpen, profileLabel }) => (
  <button type="button" data-testid="planning-card" onClick={onOpen}
    style={{ width: "100%", background: UI.accentPale, border: `0.5px solid ${UI.accent}33`, borderRadius: UI.radius, padding: "12px 14px", display: "flex", alignItems: "center", gap: 12, cursor: "pointer", textAlign: "left", fontFamily: UI.font }}>
    <IconBadge name="compass" tone="accent" />
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: UI.ink, marginBottom: 2 }}>Planning your first reptile?</div>
      <div style={{ fontSize: 12, color: UI.body, lineHeight: 1.4 }}>Shortlist species, check your state's rules and plan the set-up in {profileLabel}.</div>
    </div>
    <div aria-hidden="true" style={{ fontSize: 18, color: UI.accent }}>›</div>
  </button>
);
