import { T } from "../constants/theme";
import ShopBtn from "./ShopBtn";

// ─── Species page: Licence tab ───────────────────────────────────
// The page's note, eight state rows (✓ / ✕ badge, state, the authority's own
// licence name), then the verify disclaimer. Licence names come from the page
// (each authority's own wording); no class codes.
const LegalTab = ({ note, states }) => {
  const defaultStates = [
    { abbr: "NSW", cat: "Standard keeper licence", ok: true  },
    { abbr: "VIC", cat: "Basic wildlife licence",  ok: true  },
    { abbr: "QLD", cat: "Standard keeper licence", ok: true  },
    { abbr: "SA",  cat: "Basic permit",             ok: true  },
    { abbr: "WA",  cat: "Standard licence",         ok: true  },
    { abbr: "TAS", cat: "TAS natives only",         ok: false },
    { abbr: "ACT", cat: "Standard licence",         ok: true  },
    { abbr: "NT",  cat: "Check with authority",     ok: true  },
  ];
  const stateData = states || defaultStates;
  return (
    <>
      <p style={{ margin: "0 0 16px", fontSize: 15, color: T.body, lineHeight: 1.6 }}>
        {note || "A keeper licence is required in all Australian states. Must be purchased from a licensed breeder — wild collection is illegal."}
      </p>
      <div style={{ fontSize: 13, fontWeight: 700, color: T.muted, marginBottom: 10 }}>Availability by state</div>
      <div data-testid="licence-rows" style={{ background: T.card, borderRadius: 18, padding: "4px 16px", marginBottom: 14 }}>
        {stateData.map((s, i) => (
          <div key={s.abbr} style={{ display: "flex", alignItems: "center", gap: 10, minHeight: 52, padding: "8px 0", boxSizing: "border-box", borderBottom: i === stateData.length - 1 ? "none" : `1px solid ${T.rule}` }}>
            <span aria-label={s.ok ? "Can be kept" : "Not permitted"} role="img" style={{ width: 24, height: 24, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, flexShrink: 0, background: s.ok ? T.okBg : T.noBg, color: s.ok ? T.ok : T.no }}>{s.ok ? "✓" : "✕"}</span>
            <span style={{ width: 44, flexShrink: 0, fontSize: 15, fontWeight: 700, color: T.text }}>{s.abbr}</span>
            <span style={{ flex: 1, minWidth: 0, fontSize: 14, color: T.body, lineHeight: 1.4 }}>{s.cat}</span>
          </div>
        ))}
      </div>
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: T.accentText, marginBottom: 4 }}>Always verify before purchasing</div>
        <div style={{ fontSize: 13, color: T.muted, lineHeight: 1.55 }}>Licence categories and species availability change. The information above is a guide only — always confirm current requirements with your state wildlife authority before purchasing any reptile.</div>
      </div>
      <ShopBtn secondary>View licencing contacts by state ↗</ShopBtn>
    </>
  );
};

export default LegalTab;
