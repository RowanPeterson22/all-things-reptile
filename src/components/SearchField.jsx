// ─── SearchField ─────────────────────────────────────────────────
// The translucent search box used on the dark and orange headers.
// - The input fills the box's height, so the whole bar is a tap target.
// - iOS zooms the page in when an input under 16px gets focus, so the input is
//   laid out at 16px and scaled down to the design size (`size`); it looks the
//   same as before and the placeholder fits the same width.
// - The clear button is a 40px tap target.

const IOS_MIN = 16;

const SearchField = ({ value, onChange, onClear, placeholder, label = "Search", size = 14, radius = 12, padX = 14, padY = 10, marginBottom = 14, clearSize = 18, clearAlpha = 0.6 }) => {
  const k = size / IOS_MIN;
  const line = Math.round(size * 1.35); // visual line height, px
  const height = line + padY * 2;       // visual (and tappable) height of the input
  return (
    <div style={{ background: "rgba(255,255,255,0.12)", border: "0.5px solid rgba(255,255,255,0.2)", borderRadius: radius, padding: `0 ${padX}px`, display: "flex", alignItems: "center", gap: 8, marginBottom }}>
      <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 14 }}>🔍</span>
      <div style={{ flex: 1, minWidth: 0, height, overflow: "hidden" }}>
        <input
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          aria-label={label}
          style={{
            display: "block", boxSizing: "border-box", width: `${100 / k}%`, height: height / k, transform: `scale(${k})`, transformOrigin: "left top",
            margin: 0, padding: `${padY / k}px 0`, lineHeight: `${line / k}px`,
            background: "none", border: "none", outline: "none", color: "white", fontSize: IOS_MIN, fontFamily: "inherit",
          }}
        />
      </div>
      {value && (
        <button type="button" aria-label="Clear search" onClick={onClear}
          style={{ background: "none", border: "none", color: `rgba(255,255,255,${clearAlpha})`, cursor: "pointer", fontSize: clearSize, fontFamily: "inherit", lineHeight: 1, width: 40, height: 40, margin: `0 -${padX}px 0 -6px`, padding: 0, flexShrink: 0 }}>×</button>
      )}
    </div>
  );
};

export default SearchField;
