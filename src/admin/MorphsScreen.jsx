import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { C } from "../constants/colours";
import SpeciesPicker from "./SpeciesPicker";
import { AuBadge } from "./MorphParts";
import { filterMorphs, slugify, validateMorph, AU_LABEL, MAX_CUE, MAX_NAME, MAX_NOTES, MAX_ID } from "./morphs";
import { N, page, btn, smallBtn, chip, input, label, hint, card, badge, errorText, sectionLabel, fmtDate } from "./ui";

// ─── Admin → Morphs ───────────────────────────────────────────────
// Rowan's morph and trait list: what the AI ID looks for, what testers can
// pick on the feedback form, and the photo trait tags. Stored in Supabase
// (morphs, species_morphs); every write goes through /api/admin-species,
// which re-checks admin access. Deletes are soft, so old feedback and photo
// tags keep their names.

const STATUS_FILTERS = [
  { id: "all", label: "All" },
  { id: "established", label: "Established" },
  { id: "check", label: "Check AU" },
];

const backLink = { background: "none", border: "none", color: C.green, fontSize: 13, fontWeight: 700, cursor: "pointer", padding: 0, marginBottom: 8, fontFamily: "inherit" };

const ReadOnlyNote = () => (
  <div role="status" style={{ background: C.goldLight, color: N.ink, fontSize: 12, borderRadius: 10, padding: "8px 12px", marginBottom: 12 }}>
    Couldn't load morphs from the database, so this is the built-in list and it can't be edited. Reload to try again.
  </div>
);

// ─── The list ─────────────────────────────────────────────────────
const MorphList = ({ catalogue, bySlug, readOnly }) => {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [showDeleted, setShowDeleted] = useState(false);
  const list = useMemo(() => filterMorphs(catalogue, { q, status, showDeleted }), [catalogue, q, status, showDeleted]);
  const deletedCount = catalogue.filter(m => m.deleted_at).length;

  return (
    <div style={page}>
      {readOnly && <ReadOnlyNote />}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: N.ink }}>Morphs</div>
          <div style={{ fontSize: 12, color: N.muted }}>{catalogue.length - deletedCount} morphs and traits{deletedCount ? ` · ${deletedCount} deleted` : ""}</div>
        </div>
        {!readOnly && <button type="button" onClick={() => navigate("/admin/morphs/new")} style={btn("primary")}>+ Add morph</button>}
      </div>
      <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search name, id or cue" style={input} aria-label="Search morphs" />
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center", margin: "10px 0 12px" }}>
        {STATUS_FILTERS.map(f => <button key={f.id} type="button" aria-pressed={status === f.id} onClick={() => setStatus(f.id)} style={chip(status === f.id)}>{f.label}</button>)}
        <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, marginLeft: "auto", cursor: "pointer" }}>
          <input type="checkbox" checked={showDeleted} onChange={e => setShowDeleted(e.target.checked)} /> Show deleted
        </label>
      </div>

      {list.length === 0 && <div style={{ fontSize: 13, color: N.muted }}>No morphs match.</div>}
      <div style={{ ...card }}>
        {list.map(m => {
          const species = m.species.map(s => (bySlug[s.slug] ? bySlug[s.slug].common : s.slug));
          return (
            <Link key={m.id} to={`/admin/morphs/${m.id}`} data-testid="morph-row"
              style={{ display: "block", padding: "10px 14px", borderBottom: `0.5px solid ${N.line}`, textDecoration: "none", color: N.ink, opacity: m.deleted_at ? 0.55 : 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                <span style={{ fontSize: 14, fontWeight: 700 }}>{m.name}</span>
                <AuBadge status={m.au_status} />
                {m.deleted_at && <span style={badge("red")}>Deleted</span>}
                <span style={{ marginLeft: "auto", fontSize: 12, color: N.muted, whiteSpace: "nowrap" }}>{m.species.length} species</span>
              </div>
              <div style={{ fontSize: 11, color: N.muted, marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {m.id}{species.length ? ` · ${species.join(", ")}` : " · not assigned to any species"}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

// ─── One species link ─────────────────────────────────────────────
const SpeciesLink = ({ link, sp, morph, busy, onSave, onRemove }) => {
  const [cue, setCue] = useState(link.cue_override || "");
  useEffect(() => { setCue(link.cue_override || ""); }, [link.cue_override]);
  const changed = cue.trim() !== (link.cue_override || "");
  return (
    <div style={{ padding: "10px 0", borderBottom: `0.5px solid ${N.line}` }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <Link to={`/admin/species/${link.slug}`} style={{ fontSize: 13, fontWeight: 700, color: N.ink, textDecoration: "none" }}>{sp ? sp.common : link.slug}</Link>
          {sp && <div style={{ fontSize: 11, color: N.muted }}><i>{sp.scientific}</i></div>}
        </div>
        <button type="button" disabled={busy} onClick={onRemove} style={smallBtn("danger", busy)}>Remove</button>
      </div>
      <textarea value={cue} onChange={e => setCue(e.target.value)} rows={2} maxLength={MAX_CUE} disabled={busy}
        placeholder={`Cue for this species (optional). Default: ${morph.cue}`} aria-label={`Cue for ${sp ? sp.common : link.slug}`}
        style={{ ...input, fontSize: 13, marginTop: 6, resize: "vertical" }} />
      {changed && (
        <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
          <button type="button" disabled={busy} onClick={() => onSave(cue.trim())} style={smallBtn("primary", busy)}>{cue.trim() ? "Save cue" : "Use the default cue"}</button>
          <button type="button" disabled={busy} onClick={() => setCue(link.cue_override || "")} style={smallBtn("ghost", busy)}>Cancel</button>
        </div>
      )}
    </div>
  );
};

// ─── Add or edit one morph ────────────────────────────────────────
const EMPTY = { id: "", name: "", cue: "", au_status: "check", notes: "" };

const MorphEditor = ({ api, catalogue, setMorphs, species, bySlug, readOnly, id }) => {
  const navigate = useNavigate();
  const creating = !id;
  const morph = creating ? null : catalogue.find(m => m.id === id);
  const [form, setForm] = useState(() => (morph ? { id: morph.id, name: morph.name, cue: morph.cue, au_status: morph.au_status, notes: morph.notes || "" } : EMPTY));
  const [idTouched, setIdTouched] = useState(false);
  const [tried, setTried] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [note, setNote] = useState("");
  const [confirming, setConfirming] = useState(false);

  // Refill the form when the morph itself changes on the server (not on every
  // catalogue refresh, so an unsaved edit survives assigning a species).
  const version = morph ? `${morph.updated_at}|${morph.name}|${morph.cue}|${morph.au_status}|${morph.notes}` : "";
  useEffect(() => {
    if (morph) setForm({ id: morph.id, name: morph.name, cue: morph.cue, au_status: morph.au_status, notes: morph.notes || "" });
  }, [version]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!creating && !morph) return <div style={page}>No morph with the id “{id}”. <Link to="/admin/morphs" style={{ color: C.green }}>Back to morphs</Link></div>;

  const set = (patch) => setForm(f => ({ ...f, ...patch }));
  const setName = (name) => set(creating && !idTouched ? { name, id: slugify(name) } : { name });
  const errors = validateMorph(form, { catalogue, creating });
  const ok = Object.keys(errors).length === 0;
  const show = (k) => (tried && errors[k] ? <div style={errorText}>{errors[k]}</div> : null);
  const dirty = !creating && (form.name !== morph.name || form.cue !== morph.cue || form.au_status !== morph.au_status || (form.notes || "") !== (morph.notes || ""));

  const run = async (fn, done) => {
    setBusy(true); setErr(""); setNote("");
    try {
      const out = await fn();
      setMorphs(out.morphs);
      if (done) done(out);
    } catch (e) { setErr(e.message); } finally { setBusy(false); }
  };

  const save = () => {
    setTried(true);
    if (!ok || readOnly) return;
    if (creating) {
      run(() => api("admin-species", { method: "POST", body: { morph: { id: form.id, name: form.name.trim(), cue: form.cue.trim(), au_status: form.au_status, notes: form.notes.trim() } } }),
        () => navigate(`/admin/morphs/${form.id}`, { replace: true }));
    } else {
      run(() => api("admin-species", { method: "PATCH", body: { id: morph.id, changes: { name: form.name.trim(), cue: form.cue.trim(), au_status: form.au_status, notes: form.notes.trim() } } }),
        () => setNote("Saved. The AI ID picks this up within a minute."));
    }
  };
  const setDeleted = (deleted) => run(
    () => api("admin-species", { method: "PATCH", body: { id: morph.id, changes: { deleted } } }),
    () => { setConfirming(false); setNote(deleted ? "Deleted. Old feedback and photo tags still show its name." : "Restored."); },
  );
  const assign = (speciesSlug, assigned, cueOverride) => run(
    () => api("admin-species", { method: "PUT", body: { morphId: morph.id, speciesSlug, assigned, ...(cueOverride !== undefined ? { cueOverride } : {}) } }),
  );

  const deleted = Boolean(morph && morph.deleted_at);
  const locked = readOnly || busy;

  return (
    <div style={{ ...page, maxWidth: 680 }}>
      <button type="button" onClick={() => navigate("/admin/morphs")} style={backLink}>‹ All morphs</button>
      {readOnly && <ReadOnlyNote />}
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
        <div style={{ fontSize: 20, fontWeight: 700, color: N.ink, flex: 1 }}>{creating ? "Add a morph" : morph.name}</div>
        {deleted && <span style={badge("red")}>Deleted {fmtDate(morph.deleted_at)}</span>}
      </div>

      <div style={{ marginBottom: 14 }}>
        <label style={label} htmlFor="morph-name">Name *</label>
        <input id="morph-name" value={form.name} onChange={e => setName(e.target.value)} maxLength={MAX_NAME} disabled={locked} style={input} placeholder="e.g. Hypomelanistic" />
        {show("name")}
      </div>

      <div style={{ marginBottom: 14 }}>
        <label style={label} htmlFor="morph-id">Id {creating ? "*" : ""}</label>
        {creating ? (
          <>
            <input id="morph-id" value={form.id} onChange={e => { setIdTouched(true); set({ id: e.target.value.toLowerCase() }); }} maxLength={MAX_ID} disabled={locked} style={{ ...input, fontFamily: "ui-monospace, monospace" }} />
            <div style={hint}>Made from the name. It's stored with feedback and photo tags, so it can't be changed after saving.</div>
            {show("id")}
          </>
        ) : <div style={{ fontSize: 13, fontFamily: "ui-monospace, monospace", color: N.ink }}>{morph.id}</div>}
      </div>

      <div style={{ marginBottom: 14 }}>
        <label style={label} htmlFor="morph-cue">Visual cue *</label>
        <textarea id="morph-cue" value={form.cue} onChange={e => set({ cue: e.target.value })} rows={3} maxLength={MAX_CUE} disabled={locked} style={{ ...input, resize: "vertical" }}
          placeholder="What the AI should look for in a photo, e.g. pale nails and washed-out dark pigment" />
        <div style={hint}>The AI reads this. A species can have its own cue below.</div>
        {show("cue")}
      </div>

      <div style={{ marginBottom: 14 }}>
        <span style={label}>Australian status</span>
        <div style={{ display: "flex", gap: 6 }}>
          {Object.entries(AU_LABEL).map(([k, v]) => <button key={k} type="button" disabled={locked} aria-pressed={form.au_status === k} onClick={() => set({ au_status: k })} style={chip(form.au_status === k)}>{v}</button>)}
        </div>
      </div>

      <div style={{ marginBottom: 14 }}>
        <label style={label} htmlFor="morph-notes">Notes</label>
        <textarea id="morph-notes" value={form.notes} onChange={e => set({ notes: e.target.value })} rows={2} maxLength={MAX_NOTES} disabled={locked} style={{ ...input, resize: "vertical" }} placeholder="Private to admins" />
        {show("notes")}
      </div>

      {err && <div style={{ ...errorText, marginBottom: 8 }} role="alert">{err}</div>}
      {note && <div style={{ ...hint, marginBottom: 8 }} role="status">{note}</div>}
      {!readOnly && (creating || dirty) && (
        <button type="button" onClick={save} disabled={busy} style={{ ...btn("primary", busy || (tried && !ok)), width: "100%", minHeight: 44 }}>
          {busy ? "Saving…" : creating ? "Add morph" : "Save changes"}
        </button>
      )}

      {!creating && !readOnly && (
        <>
          <div style={sectionLabel}>Species</div>
          {deleted
            ? <div style={{ fontSize: 13, color: N.muted, marginBottom: 8 }}>Restore this morph to assign it to species.</div>
            : (
              <div style={{ marginBottom: 8 }}>
                <SpeciesPicker species={species} value={null} onChange={slug => slug && assign(slug, true)} placeholder="Add a species: search common or scientific name" />
              </div>
            )}
          {morph.species.length === 0 && <div style={{ fontSize: 13, color: N.muted }}>Not assigned to any species yet, so the AI won't use it.</div>}
          {morph.species.length > 0 && (
            <div style={{ ...card, padding: "0 14px" }}>
              {morph.species.map(link => (
                <SpeciesLink key={link.slug} link={link} sp={bySlug[link.slug]} morph={morph} busy={busy}
                  onSave={(cue) => assign(link.slug, true, cue)} onRemove={() => assign(link.slug, false)} />
              ))}
            </div>
          )}

          <div style={sectionLabel}>{deleted ? "Restore" : "Delete"}</div>
          {deleted ? (
            <button type="button" disabled={busy} onClick={() => setDeleted(false)} style={btn("primary", busy)}>Restore morph</button>
          ) : confirming ? (
            <div role="alertdialog" aria-label="Confirm delete" style={{ background: C.redPale, borderRadius: 12, padding: 12 }}>
              <div style={{ fontSize: 13, color: N.ink, marginBottom: 8, lineHeight: 1.5 }}>
                Delete <b>{morph.name}</b>? The AI stops suggesting it and testers can't pick it. Old feedback and photo tags keep its name, and you can restore it later.
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button type="button" disabled={busy} onClick={() => setDeleted(true)} style={{ ...btn("danger", busy), background: C.red, color: "white", border: "none" }}>Yes, delete</button>
                <button type="button" disabled={busy} onClick={() => setConfirming(false)} style={btn("ghost", busy)}>Cancel</button>
              </div>
            </div>
          ) : (
            <button type="button" disabled={busy} onClick={() => setConfirming(true)} style={btn("danger", busy)}>Delete morph…</button>
          )}
        </>
      )}
    </div>
  );
};

const MorphsScreen = ({ creating, ...props }) => {
  const { id } = useParams();
  if (creating) return <MorphEditor key="new" {...props} id={null} />;
  if (id) return <MorphEditor key={id} {...props} id={id} />;
  return <MorphList {...props} />;
};

export default MorphsScreen;
