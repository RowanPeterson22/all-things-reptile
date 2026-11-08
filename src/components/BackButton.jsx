// ─── BackButton ──────────────────────────────────────────────────
// The "‹ Back to …" link at the top of the orange page headers.
// The text sits where it always has; vertical padding (cancelled by negative
// margins) makes it a 40px-tall tap target. White, because 70% white on the
// brand orange was 2.8:1.

const PAD = 11;

const BackButton = ({ onClick, children, marginBottom = 16 }) => (
  <button type="button" onClick={onClick} style={{
    background: "none", border: "none", color: "white", fontSize: 13, cursor: "pointer", fontFamily: "inherit",
    display: "flex", alignItems: "center", gap: 6,
    padding: `${PAD}px 16px ${PAD}px 0`, margin: `-${PAD}px 0 ${marginBottom - PAD}px`,
  }}>{children}</button>
);

export default BackButton;
