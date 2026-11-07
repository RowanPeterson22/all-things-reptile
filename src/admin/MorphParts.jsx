import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { C } from "../constants/colours";
import { byId, filterMorphs, morphsForSpecies, AU_LABEL, AU_TONE } from "./morphs";
import { N, input, chip, smallBtn, badge, card, hint, errorText } from "./ui";

// ─── Search for a morph to add ────────────────────────────────────
// Active morphs only, minus `exclude`. onPick(morph).
export const MorphSearch = ({ catalogue, exclude = [], onPick, disabled, placeholder = "Search other morphs" }) => {
  const [q, setQ] = useState("");
  const skip = useMemo(() => new Set(exclude), [exclude]);
  const hits = useMemo(
    () => (q.trim().length >= 1 ? filterMorphs(catalogue, { q }).filter(m => !skip.has(m.id)).slice(0, 10) : []),
    [catalogue, q, skip],
  );
  return (
    <div>
      <input value={q} onChange={e => setQ(e.target.value)} placeholder={placeholder} style={{ ...input, fontSize: 14, padding: "8px 10px" }} aria-label={placeholder} disabled={disabled} />
      {hits.length > 0 && (
        <div style={{ border: `1px solid ${N.line}`, borderRadius: 10, marginTop: 6, maxHeight: 220, overflowY: "auto", background: "white" }}>
          {hits.map(m => (
            <button type="button" key={m.id} disabled={disabled} onClick={() => { onPick(m); setQ(""); }}
              style={{ display: "block", width: "100%", textAlign: "left", background: "none", border: "none", borderBottom: `0.5px solid ${N.line}`, padding: "8px 12px", cursor: "pointer", fontFamily: "inherit" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: N.ink }}>{m.name} <span style={{ fontSize: 11, fontWeight: 400, color: N.muted }}>{m.id}</span></div>
              <div style={{ fontSize: 11, color: N.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.cue}</div>
            </button>
          ))}
        </div>
      )}
      {q.trim().length >= 1 && hits.length === 0 && <div style={{ fontSize: 12, color: N.muted, marginTop: 6 }}>No other morphs match. Add new ones in Morphs.</div>}
    </div>
  );
};

// ─── Trait chips for a photo ──────────────────────────────────────
// The morphs assigned to the photo's species as chips, any other tags it
// already has (named from the catalogue, deleted ones marked), and a search
// for any other active morph.
export const TraitPicker = ({ catalogue, speciesSlug, selected = [], onToggle, disabled }) => {
  const options = useMemo(() => morphsForSpecies(catalogue, speciesSlug), [catalogue, speciesSlug]);
  const names = useMemo(() => byId(catalogue), [catalogue]);
  const extra = selected.filter(t => !options.some(o => o.id === t));
  const [searching, setSearching] = useState(false);
  return (
    <div>
      {options.length === 0 && extra.length === 0 && <div style={{ fontSize: 11, color: N.faint, marginBottom: 6 }}>No morphs assigned to this species yet.</div>}
      <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 6 }}>
        {options.map(t => (
          <button key={t.id} type="button" disabled={disabled} title={t.cue} aria-pressed={selected.includes(t.id)} onClick={() => onToggle(t.id)} style={{ ...chip(selected.includes(t.id)), padding: "4px 9px", fontSize: 11 }}>{t.name}</button>
        ))}
        {extra.map(t => {
          const m = names[t];
          return (
            <button key={t} type="button" disabled={disabled} aria-pressed="true" title={m ? (m.deleted_at ? "Deleted morph" : "Not assigned to this species") : "Unknown trait"} onClick={() => onToggle(t)} style={{ ...chip(true), padding: "4px 9px", fontSize: 11 }}>
              {m ? m.name : t}{m && m.deleted_at ? " (deleted)" : ""} ×
            </button>
          );
        })}
        <button type="button" disabled={disabled} onClick={() => setSearching(s => !s)} style={{ ...chip(false), padding: "4px 9px", fontSize: 11, color: C.green, borderStyle: "dashed" }}>{searching ? "Close" : "+ Other morph"}</button>
      </div>
      {searching && (
        <MorphSearch catalogue={catalogue} exclude={[...options.map(o => o.id), ...selected]} disabled={disabled}
          onPick={(m) => { onToggle(m.id); setSearching(false); }} />
      )}
    </div>
  );
};

// ─── Morphs for one species (admin photo library) ─────────────────
// Add or remove morphs for this species; per-species cues are edited on the
// morph's own page.
export const SpeciesMorphsPanel = ({ api, catalogue, setMorphs, speciesSlug, readOnly }) => {
  const list = useMemo(() => morphsForSpecies(catalogue, speciesSlug), [catalogue, speciesSlug]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [adding, setAdding] = useState(false);

  const assign = async (morphId, assigned) => {
    setBusy(true); setErr("");
    try {
      const out = await api("admin-species", { method: "PUT", body: { morphId, speciesSlug, assigned } });
      setMorphs(out.morphs);
    } catch (e) { setErr(e.message); } finally { setBusy(false); }
  };

  return (
    <div style={{ ...card, padding: "10px 12px", marginBottom: 12, opacity: busy ? 0.6 : 1 }} data-testid="species-morphs">
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
        <div style={{ flex: 1, fontSize: 13, fontWeight: 700, color: N.ink }}>Morphs for this species</div>
        {!readOnly && <button type="button" disabled={busy} onClick={() => setAdding(a => !a)} style={smallBtn("ghost", busy)}>{adding ? "Done" : "+ Add morph"}</button>}
      </div>
      {list.length === 0 && <div style={{ fontSize: 12, color: N.muted }}>None yet. The AI won't suggest morphs for this species, and the feedback form shows none.</div>}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {list.map(m => (
          <span key={m.id} style={{ display: "inline-flex", alignItems: "center", gap: 4, border: `1px solid ${N.line}`, borderRadius: 999, padding: "3px 4px 3px 10px", background: "white", fontSize: 12 }}>
            <Link to={`/admin/morphs/${m.id}`} title={m.cue} style={{ color: N.ink, textDecoration: "none", fontWeight: 600 }}>{m.name}</Link>
            <span style={badge(AU_TONE[m.au_status])}>{m.au_status}</span>
            {!readOnly && (
              <button type="button" disabled={busy} aria-label={`Remove ${m.name}`} onClick={() => assign(m.id, false)}
                style={{ background: "none", border: "none", color: C.red, fontSize: 14, lineHeight: 1, cursor: "pointer", padding: "0 6px", fontFamily: "inherit" }}>×</button>
            )}
          </span>
        ))}
      </div>
      {adding && !readOnly && (
        <div style={{ marginTop: 8 }}>
          <MorphSearch catalogue={catalogue} exclude={list.map(m => m.id)} disabled={busy} placeholder="Search morphs to add" onPick={(m) => assign(m.id, true)} />
        </div>
      )}
      {err && <div style={errorText}>{err}</div>}
      {readOnly && <div style={hint}>Morphs couldn't be loaded from the database, so this is the built-in list, read-only.</div>}
    </div>
  );
};

export const AuBadge = ({ status }) => <span style={badge(AU_TONE[status] || "grey")}>{AU_LABEL[status] || status}</span>;
