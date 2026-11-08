import { C } from "../constants/colours";
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
  likely:   { label: "Likely",   bg: C.greenPale, color: C.green },
  possible: { label: "Possible", bg: C.goldLight, color: "#7a5a1e" },
  unlikely: { label: "Unlikely", bg: "#f0f0ec",   color: "#777" },
};

export const NotNativeNotice = () => <WarnBox type="blue" title={NOT_NATIVE_TITLE}>{NOT_NATIVE_TEXT}</WarnBox>;

// onOpen(appSlug) opens the care guide. With no onOpen (a tester without the
// species or care sections) the card names the species and links nowhere.
const IdSuggestionCard = ({ suggestion: s, onOpen }) => {
  const cs = CONFIDENCE_STYLE[s.confidence] || CONFIDENCE_STYLE.possible;
  const open = s.inApp && s.appSlug && onOpen ? () => onOpen(s.appSlug) : null;
  const unmatched = s.matched === false;
  return (
    <div data-testid="id-suggestion" onClick={open || undefined} style={{ background: "white", borderRadius: 14, border: s.dangerouslyVenomous ? `1.5px solid ${C.red}` : "0.5px solid #e8e8e4", padding: 14, marginBottom: 10, cursor: open ? "pointer" : "default" }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.ink }}>{s.name}</div>
          {s.latin && <div style={{ fontSize: 12, fontStyle: "italic", color: C.muted, marginTop: 1 }}>{s.latin}</div>}
        </div>
        <div style={{ fontSize: 10, fontWeight: 700, background: cs.bg, color: cs.color, padding: "3px 9px", borderRadius: 8, whiteSpace: "nowrap" }}>{cs.label}</div>
      </div>
      {s.dangerouslyVenomous && (
        <div role="alert" style={{ background: C.red, color: "white", borderRadius: 10, padding: "10px 12px", marginTop: 10 }}>
          <div style={{ fontSize: 13, fontWeight: 800 }}>⚠️ Dangerously venomous</div>
          <div style={{ fontSize: 12, lineHeight: 1.5, marginTop: 3 }}>{VENOMOUS_WARNING}</div>
        </div>
      )}
      {unmatched && (
        <div style={{ fontSize: 11, fontWeight: 700, color: s.outsideCoverage ? C.blue : C.gold, background: s.outsideCoverage ? C.bluePale : C.goldLight, borderRadius: 8, padding: "4px 8px", marginTop: 8, display: "inline-block" }}>
          {s.outsideCoverage ? "Best guess: outside ATR's coverage" : "Unmatched: not in our Australian species list"}
        </div>
      )}
      {s.reason && <div style={{ fontSize: 12, color: "#555", lineHeight: 1.5, marginTop: 8 }}>{s.reason}</div>}
      {s.traits && s.traits.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
          {s.traits.map(t => (
            <span key={t.id} style={{ fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 8, background: t.confidence === "likely" ? C.greenPale : "#f0f0ec", color: t.confidence === "likely" ? C.green : "#666" }}>
              {t.name}{t.confidence === "likely" ? "" : " (possible)"}
            </span>
          ))}
        </div>
      )}
      <div style={{ fontSize: 11, color: "#777", marginTop: 8 }}>Suggestion only — not a confirmed identification</div>
      {open
        ? <div style={{ fontSize: 12, fontWeight: 700, color: C.green, marginTop: 6 }}>View care guide →</div>
        : !unmatched && !s.inApp && <div style={{ fontSize: 12, color: C.muted, marginTop: 6 }}>No care guide yet</div>}
    </div>
  );
};

export default IdSuggestionCard;
