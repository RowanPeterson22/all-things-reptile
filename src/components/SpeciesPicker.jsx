import { useEffect, useId, useMemo, useState } from "react";
import { C } from "../constants/colours";
import { loadSpeciesIndex, searchSpecies, matchedAltName } from "../beta/speciesSearch";

// ─── Species picker for the AI ID feedback card (beta) ────────────
// Type-ahead over every native species in the index (common name, scientific
// name, other names and synonyms), built for a phone: 16px input so iOS
// doesn't zoom, full-width 44px+ rows. The AI's suggestions sit at the top,
// with "Not sure" and "Other: type the name". The index loads lazily, in its
// own chunk, so the public bundle never carries it.
//
// value: "" (not sure) | "other" | an index slug
// onChange(value, pick) — pick: { slug, name, latin, appSlug } for a species;
//   for an unmatched AI suggestion, value is "other" and pick.otherName is set.

export const NOT_SURE = "";
export const OTHER = "other";

const row = (on) => ({
  display: "flex", alignItems: "center", gap: 10, width: "100%", minHeight: 46, boxSizing: "border-box",
  textAlign: "left", padding: "8px 12px", fontFamily: "inherit", fontSize: 14, cursor: "pointer",
  background: on ? C.greenPale : "white", color: C.ink,
  border: `1px solid ${on ? C.green : C.line}`, borderRadius: 10, marginBottom: 6,
});
const sub = { fontSize: 12, fontStyle: "italic", color: C.muted };
const tag = (bg, color) => ({ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 7, background: bg, color, whiteSpace: "nowrap" });

const Tags = ({ venomous, appSlug }) => (
  <>
    {venomous && <span style={tag(C.redPale, C.red)}>Venomous</span>}
    {appSlug && <span style={tag(C.greenPale, C.green)}>Care guide</span>}
  </>
);

const SpeciesPicker = ({ value, selected, suggestions = [], onChange }) => {
  const inputId = useId();
  const [entries, setEntries] = useState(null);
  const [loadError, setLoadError] = useState(false);
  const [query, setQuery] = useState("");
  // Collapsed to the chosen species once one is picked; "Change" reopens.
  const [open, setOpen] = useState(!value || value === OTHER);

  useEffect(() => {
    let live = true;
    loadSpeciesIndex().then(e => { if (live) setEntries(e); }).catch(() => { if (live) setLoadError(true); });
    return () => { live = false; };
  }, []);

  const results = useMemo(() => searchSpecies(entries, query, 12), [entries, query]);

  const pickSpecies = (p) => { onChange(p.slug, p); setQuery(""); setOpen(false); };
  const pickSuggestion = (s) => (s.matched && s.slug
    ? pickSpecies({ slug: s.slug, name: s.name, latin: s.latin, appSlug: s.appSlug || null })
    : (onChange(OTHER, { otherName: s.latin ? `${s.name} (${s.latin})` : s.name }), setOpen(true)));

  if (!open && value && value !== OTHER && selected) {
    return (
      <div style={{ ...row(true), cursor: "default" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700 }}>{selected.name}</div>
          {selected.latin && <div style={sub}>{selected.latin}</div>}
        </div>
        <button type="button" onClick={() => setOpen(true)} style={{ background: "none", border: "none", color: C.green, fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit", padding: 8 }}>Change</button>
      </div>
    );
  }

  return (
    <div>
      {suggestions.length > 0 && (
        <>
          <div style={{ fontSize: 11, color: C.muted, marginBottom: 6 }}>From the suggestions</div>
          {suggestions.map((s, i) => {
            const on = s.matched ? value === s.slug : false;
            return (
              <button key={`ai${i}`} type="button" aria-pressed={on} onClick={() => pickSuggestion(s)} style={row(on)}>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: "block", fontWeight: 600 }}>{s.name}</span>
                  {s.latin && <span style={{ ...sub, display: "block" }}>{s.latin}</span>}
                </span>
                {s.matched ? <Tags venomous={s.dangerouslyVenomous} appSlug={s.appSlug} /> : <span style={s.outsideCoverage ? tag(C.bluePale, C.blue) : tag(C.goldLight, C.gold)}>{s.outsideCoverage ? "Not native" : "Unmatched"}</span>}
              </button>
            );
          })}
        </>
      )}

      <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
        <button type="button" aria-pressed={value === NOT_SURE} onClick={() => onChange(NOT_SURE, null)} style={{ ...row(value === NOT_SURE), flex: 1, marginBottom: 0, justifyContent: "center" }}>Not sure</button>
        <button type="button" aria-pressed={value === OTHER} onClick={() => onChange(OTHER, null)} style={{ ...row(value === OTHER), flex: 1, marginBottom: 0, justifyContent: "center" }}>Other: type the name</button>
      </div>

      {value !== OTHER && (
        <>
          <label htmlFor={inputId} style={{ display: "block", fontSize: 11, color: C.muted, margin: "4px 0 6px" }}>Or search all Australian species</label>
          <input
            id={inputId} type="search" role="combobox" aria-expanded={results.length > 0} aria-controls={`${inputId}-list`} aria-autocomplete="list"
            autoComplete="off" autoCorrect="off" autoCapitalize="none" spellCheck={false} enterKeyHint="search"
            placeholder={entries ? "Common or scientific name" : loadError ? "Couldn't load the species list" : "Loading species…"}
            disabled={!entries} value={query} onChange={e => setQuery(e.target.value)}
            style={{ width: "100%", boxSizing: "border-box", border: `1px solid ${C.line}`, borderRadius: 10, padding: "11px 12px", fontSize: 16, fontFamily: "inherit", background: "white", color: C.ink }}
          />
          {query.trim() && entries && (
            <div id={`${inputId}-list`} role="listbox" aria-label="Matching species" style={{ marginTop: 6 }}>
              {results.length === 0 && <div style={{ fontSize: 12, color: C.muted, padding: "6px 2px" }}>No match. Try another name, or choose Other and type it.</div>}
              {results.map(e => {
                const alt = matchedAltName(e, query);
                return (
                  <button key={e.slug} type="button" role="option" aria-selected={value === e.slug} onClick={() => pickSpecies({ slug: e.slug, name: e.common, latin: e.scientific, appSlug: e.appSlug })} style={row(value === e.slug)}>
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ display: "block", fontWeight: 600 }}>{e.common}</span>
                      {e.common !== e.scientific && <span style={{ ...sub, display: "block" }}>{e.scientific}</span>}
                      {alt && <span style={{ display: "block", fontSize: 11, color: C.muted }}>also: {alt}</span>}
                    </span>
                    <Tags venomous={e.venomous} appSlug={e.appSlug} />
                  </button>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SpeciesPicker;
