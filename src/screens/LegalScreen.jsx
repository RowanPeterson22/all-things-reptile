import { useState } from "react";
import { T } from "../constants/theme";
import { STATES } from "../data/states";
import Icon from "../components/Icon";
import WarnBox from "../components/WarnBox";

// "1300 130 372 (option 4)" → "tel:1300130372". Australian numbers dial as written.
export const telHref = (phone) => `tel:${String(phone).replace(/\(option.*$/i, "").replace(/[^\d+]/g, "")}`;

// ─── Licencing (Learn → Licencing) ───────────────────────────────
// Dark design: intro, the "verify" card, one expandable card per state (its
// authority's own licence names, warnings, facts, notes, tap-to-call / email /
// website, and the verify disclaimer), then the universal rules.
const LegalScreen = () => {
  const [expanded, setExpanded] = useState(null);
  return (
  <div style={{ flex: 1 }}>
    <div style={{ padding: "0 16px 4px" }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: T.muted, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>Legal</div>
      <h2 style={{ margin: "0 0 8px", fontSize: 26, fontWeight: 700, color: T.text, lineHeight: 1.15 }}>Reptile Licencing</h2>
      <p style={{ margin: "0 0 16px", fontSize: 15, color: T.body, lineHeight: 1.55 }}>Tap any state for full details. All reptiles must be purchased from a licensed breeder — taking them from the wild is illegal almost everywhere.</p>
    </div>

    <div style={{ padding: "0 16px 16px" }}>
      <WarnBox type="gold" title="Important">Licence requirements change. Always verify with your state wildlife authority before purchasing. This guide is a reference only — not legal advice.</WarnBox>

      {STATES.map((s) => {
        const isOpen = expanded === s.abbr;
        const isTas = s.abbr === "TAS";
        return (
          <div key={s.abbr} style={{ background: T.card, borderRadius: 16, marginBottom: 10, overflow: "hidden" }}>
            <button type="button" aria-expanded={isOpen} onClick={() => setExpanded(isOpen ? null : s.abbr)}
              style={{ width: "100%", background: "none", border: "none", textAlign: "left", fontFamily: "inherit", color: "inherit", padding: "14px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: T.chipBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: T.accentText }}>{s.abbr}</div>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: T.text, marginBottom: 2 }}>{s.name}</div>
                <div style={{ fontSize: 13, color: T.muted, lineHeight: 1.4 }}>{s.licence}</div>
                {s.warning && <div style={{ display: "inline-flex", alignItems: "center", gap: 5, marginTop: 6, fontSize: 12, fontWeight: 700, color: T.chip, background: T.chipBg, borderRadius: 999, padding: "3px 10px" }}><Icon name="alert" size={13} strokeWidth={2.2} />{s.warning.badge}</div>}
              </div>
              <span aria-hidden="true" style={{ color: T.muted, transform: isOpen ? "rotate(90deg)" : "none", transition: "transform 0.2s" }}><Icon name="chevron" size={18} /></span>
            </button>

            {isOpen && (
              <div style={{ padding: "0 16px 16px", borderTop: `1px solid ${T.rule}` }}>
                {isTas && (
                  <div style={{ background: T.noBg, borderRadius: 12, padding: "12px 14px", margin: "12px 0 8px" }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: T.no, marginBottom: 4 }}>Most restrictive state</div>
                    <div style={{ fontSize: 14, color: T.body, lineHeight: 1.5 }}>Only Tasmanian native species may be kept. Bearded Dragons, Carpet Pythons, and most mainland species CANNOT be kept in Tasmania.</div>
                  </div>
                )}

                {s.warning && (
                  <div style={{ border: `1.5px solid ${T.accent}`, borderRadius: 12, padding: "12px 14px", margin: "12px 0 8px" }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: T.accentText, marginBottom: 4 }}>{s.warning.title}</div>
                    <div style={{ fontSize: 14, color: T.body, lineHeight: 1.5 }}>{s.warning.body}</div>
                  </div>
                )}

                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 8, margin: "12px 0" }}>
                  {[
                    ["Categories", s.categories],
                    ["Min. age", s.minage],
                    ["Cost guide", s.cost],
                    ["Authority", s.authority],
                  ].map(([label, val]) => (
                    <div key={label} style={{ background: T.bg, borderRadius: 10, padding: "10px 12px", minWidth: 0 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: T.muted, marginBottom: 3, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</div>
                      <div style={{ fontSize: 13, color: T.text, lineHeight: 1.4, overflowWrap: "break-word" }}>{val}</div>
                    </div>
                  ))}
                </div>

                <div style={{ background: T.bg, borderRadius: 10, padding: "12px 14px", fontSize: 14, color: T.body, lineHeight: 1.6 }}>
                  {s.notes}
                </div>

                <div style={{ marginTop: 10, borderRadius: 10, overflow: "hidden", background: T.bg }}>
                  {[
                    s.phone && ["phone", s.phone, telHref(s.phone), `Call ${s.authority || s.name}`],
                    s.email && ["mail", s.email, `mailto:${s.email}`, `Email ${s.email}`],
                    s.website && ["globe", s.website, `https://${s.website.replace(/^https?:\/\//, "")}`, `Open ${s.website}`],
                  ].filter(Boolean).map(([icon, val, href, aria], i, all) => (
                    <a key={val} href={href} aria-label={aria} {...(href.startsWith("https:") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                      style={{ padding: "10px 12px", minHeight: 48, boxSizing: "border-box", borderBottom: i === all.length - 1 ? "none" : `1px solid ${T.rule}`, fontSize: 14, color: T.accentText, display: "flex", gap: 10, alignItems: "center", textDecoration: "none" }}>
                      <span aria-hidden="true" style={{ color: T.muted }}><Icon name={icon} size={18} /></span>
                      <span style={{ fontWeight: 600, flex: 1, minWidth: 0, overflowWrap: "anywhere" }}>{val}</span>
                      <span aria-hidden="true" style={{ color: T.muted }}><Icon name="chevron" size={16} /></span>
                    </a>
                  ))}
                </div>

                <div style={{ marginTop: 12, fontSize: 13, color: T.muted, lineHeight: 1.5, fontStyle: "italic" }}>{s.verifyDisclaimer}</div>
              </div>
            )}
          </div>
        );
      })}

      <div style={{ background: T.card, borderRadius: 16, padding: 16, marginTop: 4 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: T.ok, marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.06em" }}>Universal rules — all states</div>
        {[
          "All reptiles must be purchased from a licensed breeder or dealer",
          "Never take reptiles from the wild — it's illegal almost everywhere",
          "Keep all purchase records including seller details and date",
          "No exotic (non-Australian native) reptiles may be kept in Australia",
          "It is illegal to release reptiles into the wild",
          "Licence holders must report annually in most states",
          "Moving a reptile interstate needs permits from both states",
        ].map((rule, i) => (
          <div key={i} style={{ fontSize: 14, color: T.body, marginBottom: 8, paddingLeft: 12, borderLeft: `2px solid ${T.accent}`, lineHeight: 1.5 }}>{rule}</div>
        ))}
      </div>
    </div>
  </div>
  );
};

export default LegalScreen;
