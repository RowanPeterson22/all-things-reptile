import { C } from "../constants/colours";
import { STATE_COLOURS } from "../data/states";
import SectionLabel from "./SectionLabel";
import ShopBtn from "./ShopBtn";

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
      <p style={{ fontSize: 13, color: "#666", lineHeight: 1.6, marginBottom: 12 }}>
        {note || "A keeper licence is required in all Australian states. Must be purchased from a licensed breeder — wild collection is illegal."}
      </p>
      <SectionLabel mt={0}>Availability by state</SectionLabel>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
        {stateData.map(s => {
          const sc = STATE_COLOURS[s.abbr] || { colour: C.green, pale: C.greenPale };
          return (
            <div key={s.abbr} style={{ background: s.ok ? sc.pale : "#fce8e8", borderRadius: 10, padding: "10px 12px", border: s.ok ? `0.5px solid ${sc.colour}44` : "0.5px solid #8b202033" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: s.ok ? sc.colour : C.red, marginBottom: 3 }}>{s.abbr}</div>
              <div style={{ fontSize: 11, fontWeight: 600, color: s.ok ? sc.colour : C.red, lineHeight: 1.4 }}>{s.cat}</div>
            </div>
          );
        })}
      </div>
      <div style={{ background: "#fff8e8", borderRadius: 10, padding: "10px 12px", marginBottom: 12, border: "0.5px solid #c8963c44" }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#7a5a1e", marginBottom: 4 }}>⚠️ ALWAYS VERIFY BEFORE PURCHASING</div>
        <div style={{ fontSize: 11, color: "#555", lineHeight: 1.6 }}>Licence categories and species availability change. The information above is a guide only — always confirm current requirements with your state wildlife authority before purchasing any reptile.</div>
      </div>
      <ShopBtn secondary>View licencing contacts by state ↗</ShopBtn>
    </>
  );
};

export default LegalTab;
