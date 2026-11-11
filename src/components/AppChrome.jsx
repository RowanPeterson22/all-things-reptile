import { createContext, useContext, useEffect, useRef } from "react";
import { T, SIZE } from "../constants/theme";
import Icon from "./Icon";
import { IconBadge, StatusBadge } from "./SectionTiles";

// ─── The header on every screen (Rowan, 11 Nov 2026) ──────────────
// Left: the logo. Home shows the wide ATR logo across the width the buttons
// leave; every other screen shows the square ATR mark (the app icon,
// /atr-icon.png). Right: two round buttons on every screen, search (opens
// /search, the only place with a search field) and ☰ (MenuSheet: every
// section from Home's tiles). Species pages put the same two buttons on the
// photo, top right (`onPhoto`).
//
// The shell provides the actions through ChromeContext, so screens that draw
// their own header (species pages) don't need props threaded through.

export const ChromeContext = createContext({ onSearch: null, onMenu: null });
export const useChrome = () => useContext(ChromeContext);

const SAFE_TOP = "calc(env(safe-area-inset-top, 0px) + 12px)";
const BTN = SIZE.touch;

const RoundBtn = ({ label, icon, onClick, onPhoto, testId }) => (
  <button type="button" aria-label={label} title={label} onClick={onClick} data-testid={testId}
    style={{ width: BTN, height: BTN, borderRadius: BTN / 2, border: "none", background: onPhoto ? T.overlay : T.field, color: onPhoto ? T.onAccent : T.text, display: "flex", alignItems: "center", justifyContent: "center", padding: 0, cursor: "pointer", flexShrink: 0 }}>
    <Icon name={icon} size={20} strokeWidth={2} />
  </button>
);

export const HeaderActions = ({ onPhoto = false }) => {
  const { onSearch, onMenu } = useChrome();
  if (!onSearch && !onMenu) return null;
  return (
    <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
      {onSearch && <RoundBtn label="Search" icon="search" onClick={onSearch} onPhoto={onPhoto} testId="header-search" />}
      {onMenu && <RoundBtn label="Menu" icon="menu" onClick={onMenu} onPhoto={onPhoto} testId="header-menu" />}
    </div>
  );
};

// wide: Home's logo, as wide as the row allows (capped so it can't dwarf a tablet).
export const TopBar = ({ wide = false, onLogo, padBottom = 8 }) => {
  const logo = wide
    ? <img src="/header-logo-dark.png" alt="All Things Reptile" data-testid="logo-wide" style={{ display: "block", width: "100%", maxWidth: 320, height: "auto" }} />
    : <img src="/atr-icon.png" alt="All Things Reptile" data-testid="logo-mark" width="44" height="44" style={{ display: "block", width: BTN, height: BTN }} />;
  return (
    <div data-testid="top-bar" style={{ padding: `${SAFE_TOP} ${SIZE.pad}px ${padBottom}px`, display: "flex", alignItems: "center", gap: 12, minHeight: BTN }}>
      <div style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center" }}>
        {onLogo
          ? <button type="button" onClick={onLogo} aria-label="All Things Reptile, Home" style={{ background: "none", border: "none", padding: 0, cursor: "pointer", display: "block", width: wide ? "100%" : "auto", maxWidth: wide ? 320 : undefined }}>{logo}</button>
          : logo}
      </div>
      <HeaderActions />
    </div>
  );
};

// ☰: a full-screen list of every section on Home's tiles, in Home's order,
// with the same Coming soon / Hidden badges. Escape or ✕ closes it; focus
// goes to ✕ on open and back to ☰ on close.
export const MenuSheet = ({ items, onOpen, onClose, homeLabel = "Home", onHome }) => {
  const closeRef = useRef(null);
  useEffect(() => {
    const before = document.activeElement;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    if (closeRef.current) closeRef.current.focus();
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
      if (before && before.focus) before.focus();
    };
  }, [onClose]);
  const row = (key, icon, title, status, go) => (
    <li key={key}>
      <button type="button" data-testid={`menu-${key}`} onClick={go}
        style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, minHeight: 56, padding: "6px 0", background: "none", border: "none", borderBottom: `1px solid ${T.rule}`, color: T.text, fontFamily: "inherit", fontSize: 16, fontWeight: 600, textAlign: "left", cursor: "pointer", opacity: status === "hidden" ? 0.7 : 1 }}>
        <IconBadge name={icon} size={36} />
        <span style={{ flex: 1, minWidth: 0, overflowWrap: "break-word" }}>{title}</span>
        <StatusBadge status={status} />
        <span aria-hidden="true" style={{ color: T.muted }}><Icon name="chevron" size={18} /></span>
      </button>
    </li>
  );
  return (
    <div role="dialog" aria-modal="true" aria-label="Menu" data-testid="menu-sheet" data-layout-overlay=""
      style={{ position: "fixed", inset: 0, zIndex: 200, background: T.bg, color: T.text, overflowY: "auto", WebkitOverflowScrolling: "touch" }}>
      <div style={{ padding: `${SAFE_TOP} ${SIZE.pad}px calc(env(safe-area-inset-bottom, 0px) + 24px)`, maxWidth: 560, margin: "0 auto", boxSizing: "border-box" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
          <img src="/atr-icon.png" alt="" aria-hidden="true" width="44" height="44" style={{ display: "block", width: BTN, height: BTN }} />
          <h2 style={{ flex: 1, margin: 0, fontSize: 24, fontWeight: 700, letterSpacing: "-0.01em" }}>Menu</h2>
          <button ref={closeRef} type="button" aria-label="Close menu" title="Close menu" onClick={onClose} data-testid="menu-close"
            style={{ width: BTN, height: BTN, borderRadius: BTN / 2, border: "none", background: T.field, color: T.text, display: "flex", alignItems: "center", justifyContent: "center", padding: 0, cursor: "pointer", flexShrink: 0 }}>
            <Icon name="close" size={20} strokeWidth={2} />
          </button>
        </div>
        <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
          {onHome && row("home", "home", homeLabel, "live", onHome)}
          {items.map(i => row(i.key, i.icon, i.title, i.status, () => onOpen(i.path)))}
        </ul>
      </div>
    </div>
  );
};
