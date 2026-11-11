import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { C } from "../constants/colours";
import { SpeciesMorphsPanel } from "./MorphParts";
import { PhotoCard, isOnPage, heroFallbackId, applyPhotoChange } from "./photoParts";
import { N, page, btn, hint, errorText } from "./ui";

// The shared photo controls live in ./photoParts; re-exported for older imports.
export { FocusPicker, HeroCheckbox, PublicControls, heroFallbackId } from "./photoParts";

// ─── A species' reference photos ──────────────────────────────────
const SpeciesPhotosScreen = ({ api, species, bySlug, counts, catalogue, setMorphs, morphsReadOnly, refreshCounts }) => {
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
  const onChanged = (next) => {
    // One hero per species: the server unticked the old one, so mirror that.
    setPhotos(list => (showAll || next.status === "active" ? applyPhotoChange(list, next) : applyPhotoChange(list, next).filter(p => p.id !== next.id)));
    refreshCounts();
  };
  const onGone = (id) => { setPhotos(list => list.filter(p => p.id !== id)); refreshCounts(); };

  const fallbackId = heroFallbackId(photos);
  const publicCount = (photos || []).filter(isOnPage).length;

  return (
    <div style={page}>
      <button type="button" onClick={() => navigate("/admin")} style={{ background: "none", border: "none", color: C.green, fontSize: 13, fontWeight: 700, cursor: "pointer", padding: 0, marginBottom: 8, fontFamily: "inherit" }}>‹ All species</button>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10, flexWrap: "wrap", marginBottom: 6 }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: N.ink }}>{sp.common}</div>
          <div style={{ fontSize: 13, color: N.muted }}><i>{sp.scientific}</i> · {sp.group}{sp.appSlug ? " · in the app" : ""}</div>
        </div>
        {sp.appSlug && <Link to={`/admin/content/${sp.appSlug}`} data-testid="edit-in-editor" style={{ ...btn("ghost"), textDecoration: "none", display: "inline-flex", alignItems: "center" }}>Edit in Species editor</Link>}
        <button type="button" onClick={() => navigate(`/admin/add?species=${slug}`)} style={btn("primary")}>+ Add photo</button>
      </div>
      <div style={{ fontSize: 12, color: N.muted, marginBottom: 10 }}>
        {c.active} active · {c.best} best · {c.hidden} hidden · {c.rejected} rejected
      </div>
      <SpeciesMorphsPanel api={api} catalogue={catalogue} setMorphs={setMorphs} speciesSlug={slug} readOnly={morphsReadOnly} />
      <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, marginBottom: 12, cursor: "pointer" }}>
        <input type="checkbox" checked={showAll} onChange={e => setShowAll(e.target.checked)} /> Show hidden and rejected photos too
      </label>

      {publicCount > 0 && (
        <div data-testid="hero-status" style={{ fontSize: 12, color: N.ink, background: fallbackId ? C.goldLight : C.greenPale, borderRadius: 10, padding: "8px 12px", marginBottom: 12 }}>
          {fallbackId ? "No hero chosen: using the first photo." : "Hero chosen. Tick “Hero (main image)” on another public photo to change it."}
        </div>
      )}
      {err && <div style={errorText}>{err}</div>}
      {photos === null && <div style={{ fontSize: 13, color: N.muted }}>Loading photos…</div>}
      {photos && photos.length === 0 && !err && <div style={{ fontSize: 13, color: N.muted }}>No {showAll ? "" : "active "}photos yet.</div>}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }}>
        {(photos || []).map(p => (
          <PhotoCard key={p.id} photo={p} api={api} species={species} catalogue={catalogue} onChanged={onChanged} onGone={onGone} fallbackHero={p.id === fallbackId} />
        ))}
      </div>
      {photos && photos.length > 0 && <div style={{ ...hint, marginTop: 12 }}>Image links last 10 minutes. Reopen the species to refresh them.</div>}
    </div>
  );
};

export default SpeciesPhotosScreen;
