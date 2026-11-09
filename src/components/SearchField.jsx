import { T } from "../constants/theme";
import Icon from "./Icon";

// ─── SearchField ─────────────────────────────────────────────────
// The dark search box (field #1A1A1A, line #333) with a line search icon.
// - The input fills the box's height, so the whole bar is a tap target.
// - iOS zooms the page in when an input under 16px gets focus, so the input is
//   laid out at 16px and scaled down to the design size (`size`).
// - The clear button is a 44px tap target.
// - autoFocus: /search takes focus over from the Home search block, so typing
//   carries on when the results page opens.
// The placeholder colour is set in index.css (::placeholder can't be inline).

const IOS_MIN = 16;

const SearchField = ({ value, onChange, onClear, placeholder, label = "Search", size = 15, radius = 14, padX = 14, padY = 12, marginBottom = 14, autoFocus = false }) => {
  const k = size / IOS_MIN;
  const line = Math.round(size * 1.43); // visual line height, px
  const height = line + padY * 2;       // visual (and tappable) height of the input
  return (
    <div style={{ background: T.field, border: `1px solid ${T.fieldBorder}`, borderRadius: radius, padding: `0 ${padX}px`, display: "flex", alignItems: "center", gap: 10, marginBottom }}>
      <span aria-hidden="true" style={{ color: T.muted }}><Icon name="search" size={18} strokeWidth={2} /></span>
      <div style={{ flex: 1, minWidth: 0, height, overflow: "hidden" }}>
        <input
          data-search-input=""
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          aria-label={label}
          autoFocus={autoFocus}
          style={{
            display: "block", boxSizing: "border-box", width: `${100 / k}%`, height: height / k, transform: `scale(${k})`, transformOrigin: "left top",
            margin: 0, padding: `${padY / k}px 0`, lineHeight: `${line / k}px`,
            background: "none", border: "none", outline: "none", color: T.text, fontSize: IOS_MIN, fontFamily: "inherit",
          }}
        />
      </div>
      {value && (
        <button type="button" aria-label="Clear search" onClick={onClear}
          style={{ background: "none", border: "none", color: T.muted, cursor: "pointer", fontFamily: "inherit", width: 44, height: 44, margin: `0 -${padX}px 0 -6px`, padding: 0, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M6 6l12 12M18 6 6 18" /></svg>
        </button>
      )}
    </div>
  );
};

export default SearchField;
