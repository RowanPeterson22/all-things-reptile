import { T } from "../constants/theme";
import WarnBox from "./WarnBox";

// ─── One AI ID suggestion (D9, closed beta) ───────────────────────
// Every Australian native in the index can be suggested. Only the 46 app
// species (records with an appSlug) get a care-guide link; other natives say
// "No care guide yet". A dangerously venomous species gets its own red
// warning. A name the model gave that isn't in the index is marked
// unmatched; a guess for a non-native animal is marked outside coverage.

export const NOT_NATIVE_TITLE = "This doesn't look like an Australian native species.";
export const NOT_NATIVE_TEXT = "ATR covers Australian native reptiles and frogs only. It could be an overseas, exotic or introduced species (such as a Cane Toad or Asian House Gecko). The AI's best guess is below, but it's outside our coverage, so there's no care guide and it hasn't been checked against our species list.";
export const VENOMOUS_WARNING = "If this is right, it can kill. Do not approach, touch or try to catch it. Keep everyone, including pets, well away and call a licensed snake catcher. If someone is bitten, call 000, apply a pressure immobilisation bandage and keep them still.";

const CONFIDENCE_STYLE = {
  likely:   { label: "Likely",   bg: T.okBg,   color: T.ok },
  possible: { label: "Possible", bg: T.chipBg, color: T.chip },
  unlikely: { label: "Unlikely", bg: T.track,  color: T.muted },
};

export const NotNativeNotice = () => <WarnBox type="blue" title={NOT_NATIVE_TITLE}>{NOT_NATIVE_TEXT}</WarnBox>;

// onOpen(appSlug) opens the care guide. With no onOpen (a tester without the
// species or care sections) the card names the species and links nowhere.
const IdSuggestionCard = ({ suggestion: s, onOpen }) => {
  const cs = CONFIDENCE_STYLE[s.confidence] || CONFIDENCE_STYLE.possible;
  const open = s.inApp && s.appSlug && onOpen ? () => onOpen(s.appSlug) : null;
  const unmatched = s.matched === false;
  return (
    <div data-testid="id-suggestion" onClick={open || undefined} style={{ background: T.card, borderRadius: 18, border: s.dangerouslyVenomous ? `1.5px solid ${T.no}` : "none", padding: 16, marginBottom: 10, cursor: open ? "pointer" : "default" }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: T.text }}>{s.name}</div>
          {s.latin && <div style={{ fontSize: 13, fontStyle: "italic", color: T.muted, marginTop: 1 }}>{s.latin}</div>}
        </div>
        <div style={{ fontSize: 12, fontWeight: 700, background: cs.bg, color: cs.color, padding: "3px 10px", borderRadius: 999, whiteSpace: "nowrap" }}>{cs.label}</div>
      </div>
      {s.dangerouslyVenomous && (
        <div role="alert" style={{ background: T.noBg, color: T.text, border: `1.5px solid ${T.no}`, borderRadius: 12, padding: "12px 14px", marginTop: 10 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: T.no }}>⚠️ Dangerously venomous</div>
          <div style={{ fontSize: 14, lineHeight: 1.5, marginTop: 3, color: T.text }}>{VENOMOUS_WARNING}</div>
        </div>
      )}
      {unmatched && (
        <div style={{ fontSize: 12, fontWeight: 700, color: s.outsideCoverage ? T.info : T.chip, background: s.outsideCoverage ? T.infoBg : T.chipBg, borderRadius: 999, padding: "4px 10px", marginTop: 8, display: "inline-block" }}>
          {s.outsideCoverage ? "Best guess: outside ATR's coverage" : "Unmatched: not in our Australian species list"}
        </div>
      )}
      {s.reason && <div style={{ fontSize: 14, color: T.body, lineHeight: 1.5, marginTop: 8 }}>{s.reason}</div>}
      {s.traits && s.traits.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
          {s.traits.map(t => (
            <span key={t.id} style={{ fontSize: 12, fontWeight: 600, padding: "3px 10px", borderRadius: 999, background: t.confidence === "likely" ? T.okBg : T.track, color: t.confidence === "likely" ? T.ok : T.body }}>
              {t.name}{t.confidence === "likely" ? "" : " (possible)"}
            </span>
          ))}
        </div>
      )}
      <div style={{ fontSize: 12, color: T.muted, marginTop: 8 }}>Suggestion only — not a confirmed identification</div>
      {open
        ? <div style={{ fontSize: 14, fontWeight: 700, color: T.accentText, marginTop: 8 }}>View care guide →</div>
        : !unmatched && !s.inApp && <div style={{ fontSize: 13, color: T.muted, marginTop: 8 }}>No care guide yet</div>}
    </div>
  );
};

export default IdSuggestionCard;
