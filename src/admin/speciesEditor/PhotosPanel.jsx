import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { C } from "../../constants/colours";
import { objectPosition } from "../../components/focal";
import { PhotoCard, HeroCheckbox, isOnPage, byPublicOrder, heroFallbackId, applyPhotoChange } from "../photoParts";
import { AddPhotoForm } from "../AddPhotoScreen";
import { N, smallBtn, chip, badge, card, sectionLabel, hint, errorText, LICENCE_LABEL } from "../ui";

// ─── /admin → Species → Photos ────────────────────────────────────
// Everything about one species' photos beside its content: what's on the
// species page (hero, order, credits, crop), the library's reference photos a
// page at a time, and uploads. It uses the library's own pieces (photoParts,
// AddPhotoForm) and routes (/api/admin-photos), so every change is saved and
// live at once, outside the content draft. The editor's phone preview is fed
// from this panel's state (previewPhotos), including a crop while it's dragged.

export const PAGE_SIZE = 24;
const FILTERS = [
  { id: "public", label: "Public" },
  { id: "reference", label: "Reference" },
  { id: "hidden", label: "Hidden" },
];

// The public copy is remade under the same path when an image is replaced or
// rotated, so the preview asks for it by version.
const versioned = (url, v) => (url && v ? `${url}${url.includes("?") ? "&" : "?"}v=${encodeURIComponent(v)}` : url);

// One admin row → the shape GET /api/species-photos gives the app.
// crop: a crop being dragged (else the stored one).
export const toPreviewPhoto = (p, name, crop) => ({
  id: p.id,
  url: versioned(p.publicUrl, p.replaced_at),
  width: p.public_width || p.width || null,
  height: p.public_height || p.height || null,
  focal: { x: p.focal_x ?? 0.5, y: p.focal_y ?? 0.5 },
  hero: p.is_hero === true,
  heroCrop: crop !== undefined ? crop : (p.hero_crop || null),
  alt: `${name || "Reptile"}${p.credit && p.credit.show && p.credit.name ? `, photo by ${p.credit.name}` : ""}`,
  credit: p.credit || { show: false },
});

// The public photos in the app's order (public_order, then date added), as
// the preview needs them. live: { id, crop } while a crop is being dragged.
export const previewPhotos = (pub, name, live) => (pub || [])
  .filter(p => isOnPage(p) && p.publicUrl)
  .sort(byPublicOrder)
  .map(p => toPreviewPhoto(p, name, live && live.id === p.id ? live.crop : undefined));

// Up or down one place → [{ id, public_order }] for every photo whose number
// changes (the list is renumbered 0, 1, 2… so the order is unambiguous).
export const reorder = (pub, id, dir) => {
  const list = [...(pub || [])].filter(isOnPage).sort(byPublicOrder);
  const i = list.findIndex(p => p.id === id);
  const j = i + dir;
  if (i < 0 || j < 0 || j >= list.length) return [];
  [list[i], list[j]] = [list[j], list[i]];
  return list.map((p, k) => ({ id: p.id, public_order: k })).filter(({ id: pid, public_order: o }) => (list.find(p => p.id === pid).public_order ?? null) !== o);
};

const Thumb = ({ photo, ratio = "4 / 3", width }) => (
  <div style={{ width: width || "100%", aspectRatio: ratio, background: N.wash, borderRadius: 8, overflow: "hidden", flex: width ? "0 0 auto" : undefined }}>
    {photo.url && <img src={photo.url} alt="" loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: objectPosition({ x: photo.focal_x, y: photo.focal_y }), display: "block" }} />}
  </div>
);

// ─── A photo on the species page: hero, order, open ───────────────
const PublicRow = ({ photo, index, count, busy, fallback, onMove, onChange, open, onOpen }) => (
  <div data-testid={`public-photo-${photo.id}`} style={{ display: "flex", gap: 10, alignItems: "center", padding: "8px 0", borderTop: index ? `0.5px solid ${N.line}` : "none" }}>
    <Thumb photo={photo} width={88} />
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ display: "flex", gap: 4, flexWrap: "wrap", alignItems: "center", fontSize: 12, fontWeight: 700, color: N.ink }}>
        <span>{index + 1}.</span>
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "100%" }}>{(photo.credit && photo.credit.name) || photo.photographer || "No credit"}</span>
        {photo.is_hero && <span style={badge("gold")}>Hero</span>}
        {fallback && <span style={badge("grey")}>Hero for now</span>}
        {photo.hero_crop && <span style={badge("blue")}>Cropped</span>}
      </div>
      <div style={{ fontSize: 11, color: N.muted }}>{LICENCE_LABEL[photo.licence] || photo.licence}</div>
      <HeroCheckbox photo={photo} busy={busy} blocked={false} change={onChange} fallback={false} />
    </div>
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <button type="button" aria-label={`Move photo ${index + 1} up`} disabled={busy || index === 0} onClick={() => onMove(-1)} style={smallBtn("ghost", busy || index === 0)}>↑</button>
      <button type="button" aria-label={`Move photo ${index + 1} down`} disabled={busy || index === count - 1} onClick={() => onMove(1)} style={smallBtn("ghost", busy || index === count - 1)}>↓</button>
    </div>
    <button type="button" aria-expanded={open} onClick={onOpen} style={smallBtn(open ? "primary" : "ghost")}>{open ? "Close" : "Edit"}</button>
  </div>
);

// ─── The panel ────────────────────────────────────────────────────
// appSlug: the content slug (D4); indexSlug: the library's slug for it.
// onPreview(photos | null): the preview's photos (null until loaded).
const PhotosPanel = ({ api, appSlug, indexSlug, name, species, bySlug, catalogue, counts, refreshCounts, onPreview }) => {
  const [pub, setPub] = useState(null);
  const [ref, setRef] = useState([]);
  const [filter, setFilter] = useState("reference");
  const [more, setMore] = useState(false);
  const [loadingRef, setLoadingRef] = useState(false);
  const [err, setErr] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(null); // { where: "pub" | "ref", id }
  const [live, setLive] = useState(null); // { id, crop } while a crop is dragged
  const [adding, setAdding] = useState(false);

  const loadPublic = useCallback(async () => {
    try {
      const d = await api("admin-photos", { query: { species: indexSlug, filter: "public", limit: 100 } });
      setPub(d.photos);
    } catch (e) { setErr(e.message); setPub([]); }
  }, [api, indexSlug]);

  const loadRef = useCallback(async (f, offset) => {
    setLoadingRef(true);
    try {
      const d = await api("admin-photos", { query: { species: indexSlug, filter: f, offset, limit: PAGE_SIZE } });
      setRef(list => (offset ? [...list, ...d.photos.filter(p => !list.some(q => q.id === p.id))] : d.photos));
      setMore(Boolean(d.hasMore));
    } catch (e) { setErr(e.message); } finally { setLoadingRef(false); }
  }, [api, indexSlug]);

  useEffect(() => { if (indexSlug) loadPublic(); }, [indexSlug, loadPublic]);
  useEffect(() => { if (indexSlug) { setRef([]); setMore(false); loadRef(filter, 0); } }, [indexSlug, filter, loadRef]);

  // The preview follows this panel.
  const preview = useMemo(() => (pub ? previewPhotos(pub, name, live) : null), [pub, name, live]);
  useEffect(() => { if (onPreview) onPreview(preview); }, [preview, onPreview]);

  // A saved change from any card: mirror the one-hero rule and move it in or
  // out of the species-page list. The library list keeps it where it is.
  const onChanged = useCallback((next) => {
    setPub(list => {
      const l = applyPhotoChange(list, next);
      const has = l.some(p => p.id === next.id);
      if (isOnPage(next) && !has) return [...l, next];
      return isOnPage(next) ? l : l.filter(p => p.id !== next.id);
    });
    setRef(list => applyPhotoChange(list, next));
    if (refreshCounts) refreshCounts();
  }, [refreshCounts]);
  const onGone = useCallback((id) => {
    setPub(list => (list || []).filter(p => p.id !== id));
    setRef(list => list.filter(p => p.id !== id));
    setOpen(null);
    if (refreshCounts) refreshCounts();
  }, [refreshCounts]);

  const patch = async (id, changes) => {
    const { photo } = await api("admin-photos", { method: "PATCH", body: { id, changes } });
    onChanged(photo);
    return photo;
  };
  const quick = async (id, changes) => {
    setBusy(true); setErr(""); setNote("");
    try { await patch(id, changes); } catch (e) { setErr(e.message); } finally { setBusy(false); }
  };
  const move = async (id, dir) => {
    const steps = reorder(pub, id, dir);
    if (!steps.length) return;
    setBusy(true); setErr(""); setNote("");
    // Shown at once; each number is then saved. A failure reloads the truth.
    setPub(list => list.map(p => { const s = steps.find(x => x.id === p.id); return s ? { ...p, public_order: s.public_order } : p; }));
    try { for (const s of steps) await patch(s.id, { public_order: s.public_order }); } catch (e) { setErr(`The order wasn't saved: ${e.message}`); await loadPublic(); } finally { setBusy(false); }
  };

  const sorted = (pub || []).filter(isOnPage).sort(byPublicOrder);
  const fallbackId = heroFallbackId(pub);
  const c = (counts && counts[indexSlug]) || { active: 0, hidden: 0, rejected: 0 };
  const cardFor = (p, where) => (
    <PhotoCard key={`${where}-${p.id}`} photo={p} api={api} species={species} catalogue={catalogue} onChanged={onChanged} onGone={onGone}
      fallbackHero={p.id === fallbackId} onClose={() => setOpen(null)}
      onCropChange={(crop) => setLive(crop ? { id: p.id, crop } : null)} />
  );

  if (!indexSlug) return <div style={{ fontSize: 13, color: N.muted }}>This species isn't in the photo index, so it has no photos here.</div>;

  return (
    <div data-testid="photos-panel">
      <div role="note" data-testid="photos-live-note" style={{ background: C.goldLight, color: "#7a5a1e", borderRadius: 10, padding: "8px 12px", fontSize: 12, fontWeight: 700, marginBottom: 10, lineHeight: 1.5 }}>
        Photo changes go live straight away. They aren't part of the draft, and Publish or Discard doesn't change them.
      </div>
      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 10 }}>
        <div style={{ fontSize: 12, color: N.muted, flex: "1 1 200px" }} data-testid="photo-counts">
          {pub ? sorted.length : "…"} on the species page · {Math.max(0, c.active - sorted.length).toLocaleString("en-AU")} reference · {(c.hidden + c.rejected).toLocaleString("en-AU")} hidden or rejected
        </div>
        <button type="button" aria-expanded={adding} onClick={() => setAdding(a => !a)} style={smallBtn(adding ? "ghost" : "primary")}>{adding ? "Close upload" : "+ Upload photo"}</button>
        <Link to={`/admin/species/${indexSlug}`} style={{ ...smallBtn("ghost"), textDecoration: "none", display: "inline-flex", alignItems: "center" }}>Photo library</Link>
      </div>

      {adding && (
        <div style={{ ...card, padding: 12, marginBottom: 12, background: "#fafaf7" }}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Upload a photo of {name}</div>
          <AddPhotoForm api={api} species={species} bySlug={bySlug} catalogue={catalogue} lockedSpecies={indexSlug} submitLabel="Upload"
            onCancel={() => setAdding(false)}
            onSaved={(row) => {
              setAdding(false);
              setNote("Uploaded to the library as a reference photo. Turn on “Use on species page” to show it.");
              if (filter === "reference") setRef(list => [row, ...list.filter(p => p.id !== row.id)]);
              setOpen({ where: "ref", id: row.id });
              if (filter !== "reference") setFilter("reference");
              if (refreshCounts) refreshCounts();
            }} />
        </div>
      )}
      {err && <div role="alert" style={{ ...errorText, marginBottom: 8 }}>{err}</div>}
      {note && <div role="status" style={{ ...hint, color: C.green, fontWeight: 700, marginBottom: 8 }}>{note}</div>}

      <div style={sectionLabel}>On the species page</div>
      {pub === null && <div style={{ fontSize: 13, color: N.muted }}>Loading photos…</div>}
      {pub && sorted.length === 0 && <div style={{ fontSize: 13, color: N.muted }}>None yet: the page shows the emoji header. Turn on “Use on species page” on a reference photo below.</div>}
      {sorted.length > 0 && (
        <div data-testid="hero-status" style={{ fontSize: 12, color: N.ink, background: fallbackId ? C.goldLight : C.greenPale, borderRadius: 10, padding: "6px 10px", marginBottom: 4 }}>
          {fallbackId ? "No hero chosen: the first photo is used." : "One hero per species: ticking another moves it."} The hero shows first, then the rest in this order.
        </div>
      )}
      <div data-testid="public-photos">
        {sorted.map((p, i) => (
          <div key={p.id}>
            <PublicRow photo={p} index={i} count={sorted.length} busy={busy} fallback={p.id === fallbackId}
              onMove={(dir) => move(p.id, dir)} onChange={(changes) => quick(p.id, changes)}
              open={Boolean(open && open.where === "pub" && open.id === p.id)}
              onOpen={() => setOpen(o => (o && o.where === "pub" && o.id === p.id ? null : { where: "pub", id: p.id }))} />
            {open && open.where === "pub" && open.id === p.id && cardFor(p, "pub")}
          </div>
        ))}
      </div>

      <div style={sectionLabel}>Library</div>
      <div role="group" aria-label="Show photos" style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
        {FILTERS.map(f => <button key={f.id} type="button" aria-pressed={filter === f.id} onClick={() => { setOpen(null); setFilter(f.id); }} style={chip(filter === f.id)}>{f.label}</button>)}
      </div>
      <div data-testid="library-photos" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(104px, 1fr))", gap: 8 }}>
        {ref.map(p => {
          const isOpen = Boolean(open && open.where === "ref" && open.id === p.id);
          return [
            <button key={p.id} type="button" data-testid={`library-photo-${p.id}`} aria-expanded={isOpen} aria-label={`Photo by ${(p.credit && p.credit.name) || p.photographer || "unknown"}${p.public_use ? ", on the species page" : ""}${p.status !== "active" ? `, ${p.status}` : ""}`}
              onClick={() => setOpen(isOpen ? null : { where: "ref", id: p.id })}
              style={{ position: "relative", display: "block", alignSelf: "start", width: "100%", padding: 0, border: isOpen ? `2px solid ${C.green}` : `1px solid ${N.line}`, borderRadius: 10, background: "white", cursor: "pointer", overflow: "hidden", fontFamily: "inherit" }}>
              <Thumb photo={p} />
              <span style={{ position: "absolute", top: 4, left: 4, display: "flex", gap: 3, flexWrap: "wrap" }}>
                {p.is_hero && <span style={badge("gold")}>Hero</span>}
                {p.public_use && !p.is_hero && <span style={badge("orange")}>Public</span>}
                {p.is_best && <span style={badge("gold")}>★</span>}
                {p.status !== "active" && <span style={badge(p.status === "rejected" ? "red" : "gold")}>{p.status}</span>}
                {!p.public_use && p.publicBlock && <span style={badge("grey")} title={p.publicBlock}>Ref only</span>}
              </span>
              {!p.public_use && p.publicBlockShort && <span data-testid="block-reason" style={{ display: "block", fontSize: 10, color: p.licence === "cc-by-sa" ? C.red : N.muted, padding: "3px 5px 4px", lineHeight: 1.3, textAlign: "left" }}>{p.publicBlockShort}</span>}
            </button>,
            isOpen && <div key={`${p.id}-card`} style={{ gridColumn: "1 / -1" }}>{cardFor(p, "ref")}</div>,
          ];
        })}
      </div>
      {!loadingRef && ref.length === 0 && <div style={{ fontSize: 13, color: N.muted }}>No {filter === "hidden" ? "hidden or rejected" : filter} photos.</div>}
      {loadingRef && <div style={{ fontSize: 13, color: N.muted, marginTop: 8 }}>Loading…</div>}
      {more && !loadingRef && (
        <button type="button" onClick={() => loadRef(filter, ref.length)} style={{ ...chip(false), display: "block", margin: "10px auto 0" }}>Show more</button>
      )}
      <div style={{ ...hint, marginTop: 8 }}>“Ref only” photos can't go on the species page; open one for the full reason. Image links last 10 minutes; reopen the species to refresh them.</div>
    </div>
  );
};

export default PhotosPanel;
