import { useState } from "react";
import { C } from "../constants/colours";
import { STATES } from "../data/states";

const LegalScreen = () => {
  const [expanded, setExpanded] = useState(null);
  return (
  <div style={{ flex: 1, overflowY: "auto" }}>
    <div style={{ background: C.green, padding: "calc(env(safe-area-inset-top, 0px) + 8px) 18px 0" }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.6)", letterSpacing: "0.07em", marginBottom: 4 }}>LEGAL</div>
      <div style={{ fontSize: 20, fontWeight: 700, color: "white", marginBottom: 8 }}>Reptile Licencing</div>
      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", marginBottom: 16, lineHeight: 1.5 }}>Tap any state for full details. All reptiles must be purchased from a licensed breeder — wild collection is illegal in every state.</div>
    </div>

    <div style={{ padding: "12px 16px" }}>
      <div style={{ background: "#fff8e8", borderRadius: 12, padding: "12px 14px", marginBottom: 12, border: "0.5px solid #c8963c44" }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#7a5a1e", marginBottom: 4 }}>⚖️ IMPORTANT</div>
        <div style={{ fontSize: 12, color: "#555", lineHeight: 1.6 }}>Licence requirements change. Always verify with your state wildlife authority before purchasing. This guide is a reference only — not legal advice.</div>
      </div>

      {STATES.map((s, i) => {
        const isOpen = expanded === s.abbr;
        const isTas = s.abbr === "TAS";
        return (
          <div key={s.abbr} style={{ background: "white", borderRadius: 14, border: `0.5px solid ${s.colour}33`, marginBottom: 10, overflow: "hidden" }}>
            <div onClick={() => setExpanded(isOpen ? null : s.abbr)}
              style={{ padding: "14px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: s.pale, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: s.colour }}>{s.abbr}</div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#111", marginBottom: 2 }}>{s.name}</div>
                <div style={{ fontSize: 11, color: "#888" }}>{s.licence}</div>
              </div>
              <div style={{ fontSize: 18, color: "#ccc", transform: isOpen ? "rotate(90deg)" : "none", transition: "transform 0.2s" }}>›</div>
            </div>

            {isOpen && (
              <div style={{ padding: "0 16px 16px", borderTop: `0.5px solid ${s.colour}22` }}>
                {isTas && (
                  <div style={{ background: "#fce8e8", borderRadius: 10, padding: "10px 12px", margin: "12px 0 8px", border: "0.5px solid #8b202033" }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#8b2020", marginBottom: 4 }}>⚠️ MOST RESTRICTIVE STATE</div>
                    <div style={{ fontSize: 12, color: "#555", lineHeight: 1.5 }}>Only Tasmanian native species may be kept. Bearded Dragons, Carpet Pythons, and most mainland species CANNOT be kept in Tasmania.</div>
                  </div>
                )}

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, margin: "12px 0" }}>
                  {[
                    ["Categories", s.categories],
                    ["Min. age", s.minage],
                    ["Cost guide", s.cost],
                    ["Authority", s.authority],
                  ].map(([label, val]) => (
                    <div key={label} style={{ background: s.pale, borderRadius: 8, padding: "8px 10px" }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: s.colour, marginBottom: 3 }}>{label}</div>
                      <div style={{ fontSize: 11, color: "#333", lineHeight: 1.4 }}>{val}</div>
                    </div>
                  ))}
                </div>

                <div style={{ background: "#f8f8f6", borderRadius: 8, padding: "10px 12px", fontSize: 12, color: "#555", lineHeight: 1.6 }}>
                  {s.notes}
                </div>

                <div style={{ marginTop: 10, borderRadius: 8, overflow: "hidden", border: `0.5px solid ${s.colour}22` }}>
                  {[
                    s.phone && ["📞", s.phone],
                    s.email && ["✉️", s.email],
                    s.website && ["🌐", s.website],
                  ].filter(Boolean).map(([icon, val]) => (
                    <div key={val} style={{ padding: "8px 12px", background: s.pale, borderBottom: `0.5px solid ${s.colour}22`, fontSize: 11, color: s.colour, display: "flex", gap: 8, alignItems: "center" }}>
                      <span>{icon}</span>
                      <span style={{ fontWeight: 600 }}>{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}

      <div style={{ background: C.greenPale, borderRadius: 12, padding: "14px 16px", marginTop: 4, border: `0.5px solid ${C.green}22` }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: C.green, marginBottom: 8 }}>✅ UNIVERSAL RULES — ALL STATES</div>
        {[
          "All reptiles must be purchased from a licensed breeder or dealer",
          "Wild collection is illegal in all states and territories",
          "Keep all purchase records including seller details and date",
          "No exotic (non-Australian native) reptiles may be kept in Australia",
          "It is illegal to release reptiles into the wild",
          "Licence holders must report annually in most states",
        ].map((rule, i) => (
          <div key={i} style={{ fontSize: 12, color: "#444", marginBottom: 6, paddingLeft: 12, borderLeft: `2px solid ${C.green}`, lineHeight: 1.5 }}>{rule}</div>
        ))}
      </div>
    </div>
  </div>
  );
};

export default LegalScreen;
