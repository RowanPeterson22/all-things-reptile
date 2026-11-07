import { useMemo, useState } from "react";
import { C } from "../constants/colours";
import { filterSpecies } from "./species";
import { N, input, chip } from "./ui";

// Search-as-you-type species chooser, used to pick an upload's species, move a
// photo, or file feedback under a species that isn't in the app's 46.
const SpeciesPicker = ({ species, value, onChange, exclude, placeholder = "Search common or scientific name", autoFocus }) => {
  const [q, setQ] = useState("");
  const chosen = value ? species.find(s => s.slug === value) : null;
  const hits = useMemo(
    () => (q.trim().length >= 2 ? filterSpecies(species, { q }).filter(s => s.slug !== exclude).slice(0, 12) : []),
    [species, q, exclude],
  );

  if (chosen) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        <span style={{ ...chip(true), cursor: "default" }}>{chosen.common}</span>
        <span style={{ fontSize: 12, fontStyle: "italic", color: N.muted }}>{chosen.scientific}</span>
        <button type="button" onClick={() => { onChange(null); setQ(""); }} style={{ background: "none", border: "none", color: C.green, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Change</button>
      </div>
    );
  }
  return (
    <div>
      <input value={q} onChange={e => setQ(e.target.value)} placeholder={placeholder} style={input} autoFocus={autoFocus} aria-label="Search species" />
      {hits.length > 0 && (
        <div style={{ border: `1px solid ${N.line}`, borderRadius: 10, marginTop: 6, maxHeight: 260, overflowY: "auto", background: "white" }}>
          {hits.map(s => (
            <button type="button" key={s.slug} onClick={() => { onChange(s.slug); setQ(""); }}
              style={{ display: "block", width: "100%", textAlign: "left", background: "none", border: "none", borderBottom: `0.5px solid ${N.line}`, padding: "9px 12px", cursor: "pointer", fontFamily: "inherit" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: N.ink }}>{s.common}</div>
              <div style={{ fontSize: 11, color: N.muted }}><i>{s.scientific}</i> · {s.group}</div>
            </button>
          ))}
        </div>
      )}
      {q.trim().length >= 2 && hits.length === 0 && <div style={{ fontSize: 12, color: N.muted, marginTop: 6 }}>No species match.</div>}
    </div>
  );
};

export default SpeciesPicker;
