import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { C } from "../constants/colours";
import SpeciesPicker from "./SpeciesPicker";
import { N, page, btn, smallBtn, chip, badge, card, input, hint, errorText, LICENCE_LABEL, STATUS_TONE, fmtDate } from "./ui";

const linkStyle = { color: C.green, fontWeight: 700, textDecoration: "none" };
const isWebUrl = (u) => /^https?:\/\//i.test(u || "");

// ─── One reference photo, with every change going through PATCH /api/admin-photos ──
const PhotoCard = ({ photo, api, species, traitOptions, onChanged, onGone }) => {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [notes, setNotes] = useState(photo.notes || "");
  const [moving, setMoving] = useState(false);
  const [moveTo, setMoveTo] = useState(null);
  const [broken, setBroken] = useState(false);

  useEffect(() => { setNotes(photo.notes || ""); }, [photo.notes]);

  const change = async (changes) => {
    setBusy(true); setErr("");
    try {
      const { photo: next } = await api("admin-photos", { method: "PATCH", body: { id: photo.id, changes } });
      if (changes.species_slug) onGone(photo.id); else onChanged(next);
      return true;
    } catch (e) { setErr(e.message); return false; } finally { setBusy(false); }
  };

  const traits = photo.traits || [];
  const toggleTrait = (id) => change({ traits: traits.includes(id) ? traits.filter(t => t !== id) : [...traits, id] });
  const extraTraits = traits.filter(t => !traitOptions.some(o => o.id === t));
  const moveTarget = moveTo && species.find(s => s.slug === moveTo);

  return (
    <div style={{ ...card, opacity: busy ? 0.6 : 1 }}>
      <div style={{ position: "relative", background: N.wash, aspectRatio: "4 / 3" }}>
        {photo.url && !broken
          ? <img src={photo.url} alt={`${photo.species_slug} by ${photo.photographer}`} loading="lazy" onError={() => setBroken(true)} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          : <div style={{ padding: 16, fontSize: 12, color: N.muted }}>Image link expired. Reopen the species to refresh it.</div>}
        <div style={{ position: "absolute", top: 8, left: 8, display: "flex", gap: 4 }}>
          {photo.status !== "active" && <span style={badge(STATUS_TONE[photo.status])}>{photo.status}</span>}
          {photo.is_best && <span style={badge("gold")}>★ Best</span>}
        </div>
      </div>

      <div style={{ padding: "10px 12px 12px", fontSize: 12, color: N.ink, lineHeight: 1.6 }}>
        <div><b>{photo.photographer}</b> · {photo.source.replace("_", " ")}</div>
        <div>
          {photo.licence_url ? <a href={photo.licence_url} target="_blank" rel="noopener noreferrer" style={linkStyle}>{LICENCE_LABEL[photo.licence] || photo.licence}</a> : <span>{LICENCE_LABEL[photo.licence] || photo.licence}</span>}
          {" · "}
          {isWebUrl(photo.source_url) ? <a href={photo.source_url} target="_blank" rel="noopener noreferrer" style={linkStyle}>Original ↗</a> : <span style={{ color: N.muted }}>{photo.source_url}</span>}
        </div>
        <div style={{ color: N.muted, fontSize: 11 }}>
          Added {fmtDate(photo.created_at)}{photo.added_by ? ` by ${photo.added_by}` : ""}{photo.width ? ` · ${photo.width}×${photo.height}` : ""}{photo.state ? ` · ${photo.state}` : ""}
        </div>

        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", margin: "10px 0" }}>
          <button type="button" disabled={busy} onClick={() => change({ is_best: !photo.is_best })} style={smallBtn(photo.is_best ? "primary" : "ghost", busy)}>{photo.is_best ? "★ Best" : "☆ Mark best"}</button>
          {photo.status !== "hidden" && <button type="button" disabled={busy} onClick={() => change({ status: "hidden" })} style={smallBtn("ghost", busy)}>Hide</button>}
          {photo.status !== "rejected" && <button type="button" disabled={busy} onClick={() => change({ status: "rejected" })} style={smallBtn("danger", busy)}>Reject</button>}
          {photo.status !== "active" && <button type="button" disabled={busy} onClick={() => change({ status: "active" })} style={smallBtn("primary", busy)}>Restore</button>}
          <button type="button" disabled={busy} onClick={() => { setMoving(m => !m); setMoveTo(null); }} style={smallBtn("ghost", busy)}>{moving ? "Cancel move" : "Move…"}</button>
        </div>

        {moving && (
          <div style={{ background: N.wash, borderRadius: 10, padding: 10, marginBottom: 10 }}>
            <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 6 }}>Move to another species</div>
            <SpeciesPicker species={species} value={moveTo} onChange={setMoveTo} exclude={photo.species_slug} autoFocus />
            {moveTarget && (
              <button type="button" disabled={busy} onClick={async () => { if (await change({ species_slug: moveTo })) setMoving(false); }} style={{ ...smallBtn("primary", busy), marginTop: 8 }}>
                Move to {moveTarget.common}
              </button>
            )}
            <div style={hint}>Moving clears “best”; it's set per species.</div>
          </div>
        )}

        <div style={{ fontSize: 11, fontWeight: 700, color: N.muted, marginBottom: 4 }}>Traits</div>
        {traitOptions.length === 0 && extraTraits.length === 0 && <div style={{ fontSize: 11, color: N.faint, marginBottom: 6 }}>No trait list for this species yet.</div>}
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 8 }}>
          {traitOptions.map(t => (
            <button key={t.id} type="button" disabled={busy} title={t.cue} onClick={() => toggleTrait(t.id)} style={{ ...chip(traits.includes(t.id)), padding: "4px 9px", fontSize: 11 }}>{t.name}</button>
          ))}
          {extraTraits.map(t => (
            <button key={t} type="button" disabled={busy} onClick={() => toggleTrait(t)} style={{ ...chip(true), padding: "4px 9px", fontSize: 11 }}>{t} ×</button>
          ))}
        </div>

        <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} maxLength={2000} placeholder="Notes" style={{ ...input, fontSize: 14, resize: "vertical" }} aria-label="Notes" />
        {notes !== (photo.notes || "") && (
          <button type="button" disabled={busy} onClick={() => change({ notes })} style={{ ...smallBtn("primary", busy), marginTop: 6 }}>Save notes</button>
        )}
        {err && <div style={errorText}>{err}</div>}
      </div>
    </div>
  );
};

// ─── A species' reference photos ──────────────────────────────────
const SpeciesPhotosScreen = ({ api, species, bySlug, counts, morphs, refreshCounts }) => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const sp = bySlug[slug];
  const [showAll, setShowAll] = useState(false);
  const [photos, setPhotos] = useState(null);
  const [err, setErr] = useState("");

  const load = useCallback(async () => {
    setErr("");
    try {
      const { photos: rows } = await api("admin-photos", { query: { species: slug, all: showAll ? "1" : "" } });
      setPhotos(rows);
    } catch (e) { setErr(e.message); setPhotos([]); }
  }, [api, slug, showAll]);

  useEffect(() => { if (sp) { setPhotos(null); load(); } }, [sp, load]);

  if (!sp) return <div style={page}>That species isn't in the index. <Link to="/admin" style={{ color: C.green }}>Back to the library</Link></div>;

  const c = counts[slug] || { active: 0, hidden: 0, rejected: 0, best: 0 };
  const traitOptions = (sp.appSlug && morphs[sp.appSlug]) || [];
  const onChanged = (next) => {
    setPhotos(list => (showAll || next.status === "active" ? list.map(p => (p.id === next.id ? next : p)) : list.filter(p => p.id !== next.id)));
    refreshCounts();
  };
  const onGone = (id) => { setPhotos(list => list.filter(p => p.id !== id)); refreshCounts(); };

  return (
    <div style={page}>
      <button type="button" onClick={() => navigate("/admin")} style={{ background: "none", border: "none", color: C.green, fontSize: 13, fontWeight: 700, cursor: "pointer", padding: 0, marginBottom: 8, fontFamily: "inherit" }}>‹ All species</button>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10, flexWrap: "wrap", marginBottom: 6 }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: N.ink }}>{sp.common}</div>
          <div style={{ fontSize: 13, color: N.muted }}><i>{sp.scientific}</i> · {sp.group}{sp.appSlug ? " · in the app" : ""}</div>
        </div>
        <button type="button" onClick={() => navigate(`/admin/add?species=${slug}`)} style={btn("primary")}>+ Add photo</button>
      </div>
      <div style={{ fontSize: 12, color: N.muted, marginBottom: 10 }}>
        {c.active} active · {c.best} best · {c.hidden} hidden · {c.rejected} rejected
      </div>
      <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, marginBottom: 12, cursor: "pointer" }}>
        <input type="checkbox" checked={showAll} onChange={e => setShowAll(e.target.checked)} /> Show hidden and rejected photos too
      </label>

      {err && <div style={errorText}>{err}</div>}
      {photos === null && <div style={{ fontSize: 13, color: N.muted }}>Loading photos…</div>}
      {photos && photos.length === 0 && !err && <div style={{ fontSize: 13, color: N.muted }}>No {showAll ? "" : "active "}photos yet.</div>}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }}>
        {(photos || []).map(p => (
          <PhotoCard key={p.id} photo={p} api={api} species={species} traitOptions={traitOptions} onChanged={onChanged} onGone={onGone} />
        ))}
      </div>
      {photos && photos.length > 0 && <div style={{ ...hint, marginTop: 12 }}>Image links last 10 minutes. Reopen the species to refresh them.</div>}
    </div>
  );
};

export default SpeciesPhotosScreen;
