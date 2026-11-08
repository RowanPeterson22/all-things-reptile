import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { C } from "../constants/colours";
import SpeciesPicker from "./SpeciesPicker";
import { TraitPicker, SpeciesMorphsPanel } from "./MorphParts";
import { PhotoCredit } from "../components/PhotoCredit";
import { objectPosition, focalFromTap } from "../components/focal";
import HeroCropEditor from "./HeroCropEditor";
import { toLibraryJpegs, rotate90, MIN_PUBLIC_EDGE } from "./image";
import { N, page, btn, smallBtn, badge, card, input, label, hint, errorText, LICENCE_LABEL, STATUS_TONE, fmtDate } from "./ui";

const linkStyle = { color: C.green, fontWeight: 700, textDecoration: "none" };
const isWebUrl = (u) => /^https?:\/\//i.test(u || "");

// An on/off switch (a real button with role="switch", 44 px tall for phones).
const Switch = ({ on, disabled, onChange, label: text, id }) => (
  <button type="button" role="switch" aria-checked={on} aria-labelledby={id} disabled={disabled} onClick={() => onChange(!on)}
    style={{ display: "flex", alignItems: "center", gap: 10, background: "none", border: "none", padding: "6px 0", minHeight: 44, cursor: disabled ? "default" : "pointer", fontFamily: "inherit", opacity: disabled ? 0.55 : 1, textAlign: "left" }}>
    <span aria-hidden="true" style={{ position: "relative", width: 40, height: 24, borderRadius: 12, background: on ? C.green : N.line, flex: "0 0 auto", transition: "background 0.15s" }}>
      <span style={{ position: "absolute", top: 3, left: on ? 19 : 3, width: 18, height: 18, borderRadius: "50%", background: "white", boxShadow: "0 1px 2px rgba(0,0,0,0.3)", transition: "left 0.15s" }} />
    </span>
    <span id={id} style={{ fontSize: 13, fontWeight: 700, color: N.ink }}>{text}</span>
  </button>
);

// ─── Set focus point ──────────────────────────────────────────────
// The whole photo (contain), tap where the animal is; a 4:3 preview shows the
// species-page crop. Saves focal_x / focal_y (0–1).
export const FocusPicker = ({ photo, busy, onSave, onCancel }) => {
  const [pt, setPt] = useState({ x: photo.focal_x ?? 0.5, y: photo.focal_y ?? 0.5 });
  const [nat, setNat] = useState({ w: photo.width || 4, h: photo.height || 3 });
  const boxRef = useRef(null);
  const tap = (e) => {
    if (!boxRef.current) return;
    setPt(focalFromTap(e.clientX, e.clientY, boxRef.current.getBoundingClientRect(), nat.w, nat.h));
  };
  const ratio = nat.w / nat.h;
  return (
    <div style={{ background: N.wash, borderRadius: 10, padding: 10, margin: "10px 0" }}>
      <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 6 }}>Tap the photo where the animal is</div>
      <div ref={boxRef} onClick={tap} role="button" tabIndex={0} aria-label="Photo: tap to set the focus point"
        onKeyDown={(e) => {
          const step = 0.05;
          const move = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] }[e.key];
          if (move) { e.preventDefault(); setPt(p => ({ x: Math.min(1, Math.max(0, Math.round((p.x + move[0]) * 100) / 100)), y: Math.min(1, Math.max(0, Math.round((p.y + move[1]) * 100) / 100)) })); }
        }}
        style={{ position: "relative", width: "100%", aspectRatio: "4 / 3", background: "#222", borderRadius: 8, overflow: "hidden", cursor: "crosshair", touchAction: "manipulation" }}>
        <img src={photo.url} alt="" onLoad={e => setNat({ w: e.currentTarget.naturalWidth, h: e.currentTarget.naturalHeight })}
          style={{ width: "100%", height: "100%", objectFit: "contain", display: "block", pointerEvents: "none" }} />
        {/* Marker: placed within the contained image's own box. */}
        <div style={{ position: "absolute", top: "50%", left: "50%", width: ratio >= 4 / 3 ? "100%" : `${(ratio / (4 / 3)) * 100}%`, height: ratio >= 4 / 3 ? `${((4 / 3) / ratio) * 100}%` : "100%", transform: "translate(-50%, -50%)", pointerEvents: "none" }}>
          <span aria-hidden="true" style={{ position: "absolute", left: `${pt.x * 100}%`, top: `${pt.y * 100}%`, width: 26, height: 26, marginLeft: -13, marginTop: -13, borderRadius: "50%", border: "3px solid white", boxShadow: "0 0 0 2px rgba(0,0,0,0.5)", boxSizing: "border-box" }} />
        </div>
      </div>
      <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 8 }}>
        <div style={{ width: 120, aspectRatio: "4 / 3", borderRadius: 6, overflow: "hidden", flex: "0 0 auto", background: N.line }}>
          <img src={photo.url} alt="Species-page crop preview" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: objectPosition(pt), display: "block" }} />
        </div>
        <div style={{ fontSize: 11, color: N.muted, lineHeight: 1.5 }}>Species-page frame (4:3). Focus {Math.round(pt.x * 100)}% across, {Math.round(pt.y * 100)}% down.</div>
      </div>
      <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
        <button type="button" disabled={busy} onClick={() => onSave(pt)} style={smallBtn("primary", busy)}>Save focus point</button>
        <button type="button" disabled={busy} onClick={() => setPt({ x: 0.5, y: 0.5 })} style={smallBtn("ghost", busy)}>Centre</button>
        <button type="button" disabled={busy} onClick={onCancel} style={smallBtn("ghost", busy)}>Cancel</button>
      </div>
    </div>
  );
};

// ─── Download / Replace image / Rotate 90° ────────────────────────
const saveFile = (url) => {
  const a = document.createElement("a");
  a.href = url; a.rel = "noopener";
  document.body.appendChild(a); a.click(); a.remove();
};

const ImageTools = ({ photo, api, busy, setBusy, onChanged, setErr, setNote, onFocus, onHeroCrop }) => {
  const fileRef = useRef(null);
  const run = async (fn) => {
    setBusy(true); setErr(""); setNote("");
    try { await fn(); } catch (e) { setErr(e.message === "too-large" ? "That photo is still over the size limit after resizing." : e.message === "decode" ? "That image couldn't be read." : e.message); } finally { setBusy(false); }
  };
  const replaceWith = async ({ reference, master }) => {
    const out = await api("admin-photos", { method: "PUT", body: { id: photo.id, photo: reference.dataUrl, ...(master ? { master: master.dataUrl } : {}) } });
    onChanged(out.photo);
    const notes = [
      out.warning,
      out.unpublished && `Taken off the species page: ${out.unpublished}`,
      out.republished && "The species-page copy was remade from the new image.",
      photo.hero_crop && "The hero crop was cleared for the new image; set it again if needed.",
      photo.licence === "cc-by" && "CC BY: the credit now says it was modified from the original.",
    ].filter(Boolean);
    if (notes.length) setNote(notes.join(" "));
  };
  const download = () => run(async () => { const { url } = await api("admin-photos", { query: { download: photo.id } }); saveFile(url); });
  const rotate = () => run(async () => {
    const { url } = await api("admin-photos", { query: { download: photo.id } });
    const u = new URL(url); u.searchParams.delete("download");
    await replaceWith(await rotate90(u.toString()));
  });
  const pickReplacement = (file) => file && run(async () => replaceWith(await toLibraryJpegs(file)));
  const noLargerCopy = !photo.master_path;

  return (
    <div style={{ margin: "8px 0" }}>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        <button type="button" disabled={busy} onClick={download} style={smallBtn("ghost", busy)}>Download</button>
        <button type="button" disabled={busy} onClick={() => fileRef.current && fileRef.current.click()} style={smallBtn("ghost", busy)}>Replace image</button>
        <button type="button" disabled={busy} onClick={rotate} style={smallBtn("ghost", busy)}>Rotate 90°</button>
        <button type="button" disabled={busy || !photo.url} onClick={onFocus} style={smallBtn("ghost", busy)}>Set focus point</button>
        <button type="button" disabled={busy || !photo.url} onClick={onHeroCrop} style={smallBtn("ghost", busy)}>Hero crop{photo.hero_crop ? " ✓" : ""}</button>
        <input ref={fileRef} type="file" accept="image/jpeg,image/*" aria-label="Replacement image" style={{ display: "none" }}
          onChange={e => { const f = e.target.files && e.target.files[0]; e.target.value = ""; pickReplacement(f); }} />
      </div>
      {photo.licence === "royalty_free" && <div style={hint}>Stock: any edit must stay within the stock licence's terms.</div>}
      {photo.licence === "cc-by" && <div style={hint}>CC BY: a replaced or rotated photo is credited as modified from the original.</div>}
      {photo.licence === "cc-by-sa" && <div style={hint}>CC BY-SA: edits are fine for AI reference; it still can't go on species pages.</div>}
      {noLargerCopy && photo.source === "inaturalist" && !photo.replaced_at && <div style={hint}>No larger copy is kept for this photo, so Rotate saves the {photo.width || 500} px copy and it drops below the {MIN_PUBLIC_EDGE} px species-page minimum. Use Replace image with a larger file to keep it eligible.</div>}
      {photo.replaced_at && <div style={hint}>Replaced {fmtDate(photo.replaced_at)}{photo.replaced_by ? ` by ${photo.replaced_by}` : ""}.</div>}
    </div>
  );
};

// ─── Use on species page + credit settings ────────────────────────
// The server is the real check (lib/photoRules.js); this shows its answers:
// photo.publicBlock says why a photo can't go public, photo.attributionRequired
// whether the credit can be hidden, photo.credit what customers will see.
// "Hero (main image)": one per species; ticking it unticks the previous one on
// the server. On a photo that isn't public yet, ticking it also publishes it.
export const HeroCheckbox = ({ photo, busy, blocked, change, fallback }) => {
  const id = `hero-${photo.id}`;
  const on = Boolean(photo.is_hero);
  const toggle = (v) => change(photo.public_use ? { is_hero: v } : { public_use: true, is_hero: true });
  return (
    <div style={{ padding: "6px 0 2px" }}>
      <label htmlFor={id} style={{ display: "flex", alignItems: "center", gap: 10, minHeight: 40, fontSize: 13, fontWeight: 700, color: N.ink, cursor: busy || blocked ? "default" : "pointer", opacity: blocked ? 0.55 : 1 }}>
        <input id={id} type="checkbox" checked={on} disabled={busy || blocked || (!photo.public_use && on)} onChange={e => toggle(e.target.checked)}
          style={{ width: 22, height: 22, margin: 0, accentColor: C.green, flex: "0 0 auto" }} />
        Hero (main image)
      </label>
      {!photo.public_use && !blocked && <div style={{ ...hint, marginTop: 0 }}>Ticking this also puts it on the species page.</div>}
      {photo.public_use && on && <div style={{ ...hint, marginTop: 0 }}>The species-page header and the Browse card. Ticking another photo moves it.</div>}
      {photo.public_use && !on && fallback && <div style={{ ...hint, marginTop: 0 }}>No hero chosen: this first photo is used for now.</div>}
    </div>
  );
};

export const PublicControls = ({ photo, busy, change, fallbackHero = false }) => {
  const [order, setOrder] = useState(photo.public_order ?? "");
  const [credit, setCredit] = useState(photo.display_credit || "");
  useEffect(() => { setOrder(photo.public_order ?? ""); }, [photo.public_order]);
  useEffect(() => { setCredit(photo.display_credit || ""); }, [photo.display_credit]);
  const blocked = !photo.public_use && Boolean(photo.publicBlock);
  const orderNum = order === "" ? null : Number(order);
  const orderChanged = orderNum !== (photo.public_order ?? null) && (orderNum === null || (Number.isInteger(orderNum) && orderNum >= 0 && orderNum <= 9999));

  return (
    <div style={{ background: photo.public_use ? C.greenPale : N.wash, borderRadius: 10, padding: "4px 10px 10px", margin: "10px 0" }}>
      <Switch id={`pub-${photo.id}`} on={Boolean(photo.public_use)} disabled={busy || blocked} onChange={(v) => change({ public_use: v })} label="Use on species page" />
      {blocked && <div style={{ fontSize: 11, color: photo.licence === "cc-by-sa" ? C.red : N.muted, lineHeight: 1.5, marginBottom: 4 }}>{photo.publicBlock}</div>}
      {!photo.public_use && !blocked && <div style={hint}>Copies the photo to the public species page{photo.source === "inaturalist" ? " at the larger size from iNaturalist" : ""}.</div>}
      <HeroCheckbox photo={photo} busy={busy} blocked={blocked} change={change} fallback={fallbackHero} />
      {photo.public_use && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", fontSize: 12 }}>
          <label htmlFor={`ord-${photo.id}`} style={{ fontWeight: 700 }}>Order</label>
          <input id={`ord-${photo.id}`} type="number" inputMode="numeric" min={0} max={9999} value={order} onChange={e => setOrder(e.target.value)} placeholder="Last" style={{ ...input, width: 90, padding: "6px 8px" }} />
          {orderChanged && <button type="button" disabled={busy} onClick={() => change({ public_order: orderNum })} style={smallBtn("primary", busy)}>Save order</button>}
          {photo.publicUrl && <a href={photo.publicUrl} target="_blank" rel="noopener noreferrer" style={linkStyle}>Public copy ↗</a>}
        </div>
      )}

      <div style={{ borderTop: `0.5px solid ${N.line}`, marginTop: 8, paddingTop: 4 }}>
        <Switch id={`cred-${photo.id}`} on={photo.show_credit !== false || photo.attributionRequired} disabled={busy || photo.attributionRequired}
          onChange={(v) => change({ show_credit: v })} label="Show credit icon" />
        {photo.attributionRequired && <div style={hint}>{photo.licence === "royalty_free" ? "This stock licence requires a credit" : `${LICENCE_LABEL[photo.licence]} requires attribution`}, so the credit is always shown.</div>}
        {photo.licence === "tester_consent" && (
          <Switch id={`name-${photo.id}`} on={Boolean(photo.credit_by_name)} disabled={busy} onChange={(v) => change({ credit_by_name: v })} label="Tester agreed to be credited by name" />
        )}
        {photo.licence === "tester_consent" && !photo.credit_by_name && <div style={hint}>Credited as “ATR community” until the tester opts in.</div>}
        <label htmlFor={`dc-${photo.id}`} style={{ ...label, marginTop: 6 }}>Credit shown</label>
        <input id={`dc-${photo.id}`} value={credit} onChange={e => setCredit(e.target.value)} maxLength={300} placeholder={photo.credit ? photo.credit.name : ""} style={{ ...input, fontSize: 14, padding: "7px 10px" }} />
        {credit !== (photo.display_credit || "") && (
          <button type="button" disabled={busy} onClick={() => change({ display_credit: credit })} style={{ ...smallBtn("primary", busy), marginTop: 6 }}>Save credit</button>
        )}
        <div style={hint}>Blank uses the photographer{photo.licence === "royalty_free" ? " with the library" : ""}. Tap the “i” on the photo to preview.</div>
      </div>
    </div>
  );
};

// ─── One reference photo, with every change going through PATCH /api/admin-photos ──
const PhotoCard = ({ photo, api, species, catalogue, onChanged, onGone, fallbackHero = false }) => {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [notes, setNotes] = useState(photo.notes || "");
  const [moving, setMoving] = useState(false);
  const [moveTo, setMoveTo] = useState(null);
  const [broken, setBroken] = useState(false);
  const [focusing, setFocusing] = useState(false);
  const [cropping, setCropping] = useState(false);

  useEffect(() => { setNotes(photo.notes || ""); }, [photo.notes]);

  const [note, setNote] = useState("");
  const change = async (changes) => {
    setBusy(true); setErr(""); setNote("");
    try {
      const { photo: next, publishedSize } = await api("admin-photos", { method: "PATCH", body: { id: photo.id, changes } });
      if (publishedSize === "stored" && next.source === "inaturalist") setNote("The larger size couldn't be fetched from iNaturalist, so the stored copy (about 500 px) was used. Turn it off and on again later to retry.");
      if (changes.species_slug) onGone(photo.id); else onChanged(next);
      return true;
    } catch (e) { setErr(e.message); return false; } finally { setBusy(false); }
  };

  const traits = photo.traits || [];
  const toggleTrait = (id) => change({ traits: traits.includes(id) ? traits.filter(t => t !== id) : [...traits, id] });
  const moveTarget = moveTo && species.find(s => s.slug === moveTo);

  return (
    <div style={{ ...card, opacity: busy ? 0.6 : 1 }}>
      <div style={{ position: "relative", background: N.wash, aspectRatio: "4 / 3" }}>
        {photo.url && !broken
          ? <img src={photo.url} alt={`${photo.species_slug} by ${(photo.credit && photo.credit.name) || photo.photographer || "unknown"}`} loading="lazy" onError={() => setBroken(true)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: objectPosition({ x: photo.focal_x, y: photo.focal_y }), display: "block" }} />
          : <div style={{ padding: 16, fontSize: 12, color: N.muted }}>Image link expired. Reopen the species to refresh it.</div>}
        <div style={{ position: "absolute", top: 8, left: 8, display: "flex", gap: 4 }}>
          {photo.status !== "active" && <span style={badge(STATUS_TONE[photo.status])}>{photo.status}</span>}
          {photo.is_best && <span style={badge("gold")}>★ Best</span>}
          {photo.public_use && <span style={badge("orange")}>On species page</span>}
          {photo.is_hero && <span style={badge("gold")}>Hero</span>}
        </div>
        {photo.url && !broken && <PhotoCredit credit={photo.credit} />}
      </div>

      <div style={{ padding: "10px 12px 12px", fontSize: 12, color: N.ink, lineHeight: 1.6 }}>
        <div><b>{photo.photographer || <span style={{ color: N.muted, fontWeight: 400 }}>No photographer</span>}</b> · {photo.source.replace("_", " ")}{photo.stock_library ? ` · ${photo.stock_library} #${photo.stock_asset_id}` : ""}</div>
        <div>
          {photo.licence_url ? <a href={photo.licence_url} target="_blank" rel="noopener noreferrer" style={linkStyle}>{LICENCE_LABEL[photo.licence] || photo.licence}</a> : <span>{LICENCE_LABEL[photo.licence] || photo.licence}</span>}
          {" · "}
          {isWebUrl(photo.source_url) ? <a href={photo.source_url} target="_blank" rel="noopener noreferrer" style={linkStyle}>Original ↗</a> : <span style={{ color: N.muted }}>{photo.source_url}</span>}
        </div>
        <div style={{ color: N.muted, fontSize: 11 }}>
          Added {fmtDate(photo.created_at)}{photo.added_by ? ` by ${photo.added_by}` : ""}{photo.width ? ` · ${photo.width}×${photo.height}` : ""}{photo.master_path ? ` · larger copy ${photo.master_width}×${photo.master_height}` : ""}{photo.state ? ` · ${photo.state}` : ""}{photo.edited ? " · edited" : ""}
        </div>

        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", margin: "10px 0" }}>
          <button type="button" disabled={busy} onClick={() => change({ is_best: !photo.is_best })} style={smallBtn(photo.is_best ? "primary" : "ghost", busy)}>{photo.is_best ? "★ Best" : "☆ Mark best"}</button>
          {photo.status !== "hidden" && <button type="button" disabled={busy} onClick={() => change({ status: "hidden" })} style={smallBtn("ghost", busy)}>Hide</button>}
          {photo.status !== "rejected" && <button type="button" disabled={busy} onClick={() => change({ status: "rejected" })} style={smallBtn("danger", busy)}>Reject</button>}
          {photo.status !== "active" && <button type="button" disabled={busy} onClick={() => change({ status: "active" })} style={smallBtn("primary", busy)}>Restore</button>}
          <button type="button" disabled={busy} onClick={() => { setMoving(m => !m); setMoveTo(null); }} style={smallBtn("ghost", busy)}>{moving ? "Cancel move" : "Move…"}</button>
        </div>

        <ImageTools photo={photo} api={api} busy={busy} setBusy={setBusy} setErr={setErr} setNote={setNote} onFocus={() => setFocusing(f => !f)} onHeroCrop={() => setCropping(c => !c)}
          onChanged={(next) => { setBroken(false); onChanged(next); }} />
        {focusing && photo.url && (
          <FocusPicker photo={photo} busy={busy} onCancel={() => setFocusing(false)}
            onSave={async (pt) => { if (await change({ focal_x: pt.x, focal_y: pt.y })) setFocusing(false); }} />
        )}

        {cropping && photo.url && (
          <HeroCropEditor photo={photo} busy={busy} onCancel={() => setCropping(false)}
            onSave={async (crop) => { if (await change({ hero_crop: crop })) setCropping(false); }} />
        )}

        <PublicControls photo={photo} busy={busy} change={change} fallbackHero={fallbackHero} />

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
        <div style={{ marginBottom: 8 }}>
          <TraitPicker catalogue={catalogue} speciesSlug={photo.species_slug} selected={traits} onToggle={toggleTrait} disabled={busy} />
        </div>

        <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} maxLength={2000} placeholder="Notes" style={{ ...input, fontSize: 14, resize: "vertical" }} aria-label="Notes" />
        {notes !== (photo.notes || "") && (
          <button type="button" disabled={busy} onClick={() => change({ notes })} style={{ ...smallBtn("primary", busy), marginTop: 6 }}>Save notes</button>
        )}
        {err && <div style={errorText}>{err}</div>}
        {note && <div style={hint}>{note}</div>}
      </div>
    </div>
  );
};

// ─── Hero fallback ────────────────────────────────────────────────
// With no photo ticked as hero, the app uses the first public photo by
// public_order (then date added), as lib/speciesPhotos.js sorts them.
const isOnPage = (p) => Boolean(p && p.public_use && p.status === "active");
const byPublicOrder = (a, b) => {
  const ao = a.public_order ?? Infinity;
  const bo = b.public_order ?? Infinity;
  return ao - bo || String(a.created_at || "").localeCompare(String(b.created_at || ""));
};
// → the id of the photo used as hero by fallback, or null (a hero is ticked, or none public).
export const heroFallbackId = (photos) => {
  const pub = (photos || []).filter(isOnPage);
  if (!pub.length || pub.some(p => p.is_hero)) return null;
  return [...pub].sort(byPublicOrder)[0].id;
};

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
    const others = (p) => (next.is_hero && p.is_hero && p.id !== next.id ? { ...p, is_hero: false } : p);
    setPhotos(list => (showAll || next.status === "active" ? list.map(p => (p.id === next.id ? next : others(p))) : list.filter(p => p.id !== next.id).map(others)));
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
