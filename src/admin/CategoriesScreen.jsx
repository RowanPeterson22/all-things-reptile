import { useCallback, useEffect, useMemo, useState } from "react";
import { C } from "../constants/colours";
import { CATEGORIES } from "../data/categories";
import { CARD_ASPECT, BANNER_ASPECT } from "../constants/categoryFrames";
import { cropFor, heroImageStyle } from "../components/heroCrop";
import { PhotoCredit } from "../components/PhotoCredit";
import { CropEditor, HeroPreview } from "./HeroCropEditor";
import { N, page, smallBtn, card, input, hint, errorText, sectionLabel, badge, LICENCE_LABEL } from "./ui";

// ─── Admin: Browse category images ───────────────────────────────
// One card per Browse category with its current image (or the emoji it falls
// back to). Choose a photo from the category's species, set the card crop
// (the Browse card's 1.85 : 1) and the banner crop (2.4 : 1, the category
// page header), or remove it. Every write goes through /api/admin-photos,
// which re-checks admin access, the category and the licence rules.

const norm = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9 ]+/g, " ").replace(/\s+/g, " ").trim();

// The crop editors work on the category's public copy.
const asEditable = (img) => ({ url: img.url, width: img.width, height: img.height, public_width: img.width, public_height: img.height, focal_x: img.focal ? img.focal.x : 0.5, focal_y: img.focal ? img.focal.y : 0.5 });

// The Browse home card exactly as it renders at 375 px (166.5 px wide).
export const CardPreview = ({ cat, image, crop, label = "Preview of the Browse card" }) => {
  const c = image ? (crop || cropFor(image, image.crop, CARD_ASPECT)) : null;
  return (
    <div role="img" aria-label={label} style={{ width: 167, background: "white", borderRadius: 14, border: `0.5px solid ${N.line}`, overflow: "hidden", flex: "0 0 auto" }}>
      <div style={{ position: "relative", width: "100%", aspectRatio: `${CARD_ASPECT} / 1`, overflow: "hidden", background: cat.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 42 }}>
        {image && c ? <img src={image.url} alt="" style={heroImageStyle(c)} /> : cat.emoji}
        {image && <PhotoCredit credit={image.credit} />}
      </div>
      <div style={{ padding: "10px 12px 12px" }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: C.ink, marginBottom: 4 }}>{cat.label}</div>
        <div style={{ fontSize: 11, color: "#777", lineHeight: 1.4, marginBottom: 5 }}>{cat.desc}</div>
        <div style={{ fontSize: 10, fontWeight: 700, color: C.green }}>{cat.count} species →</div>
      </div>
    </div>
  );
};

const BannerPreview = ({ cat, image, crop }) => (
  <HeroPreview url={image.url} crop={crop || cropFor(image, image.bannerCrop, BANNER_ASPECT)} label="Preview of the category header" backLabel="‹ All categories" title={cat.label} />
);

// ─── Picker ───────────────────────────────────────────────────────
export const CategoryPicker = ({ api, cat, busy, onChoose, onCancel }) => {
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");
  const [q, setQ] = useState("");
  useEffect(() => {
    let live = true;
    api("admin-photos", { query: { category: cat.id } })
      .then(d => { if (live) setData(d); })
      .catch(e => { if (live) setErr(e.message); });
    return () => { live = false; };
  }, [api, cat.id]);

  const groups = useMemo(() => {
    if (!data) return [];
    const terms = norm(q).split(" ").filter(Boolean);
    const out = data.species.map(s => ({ ...s, photos: [] }));
    const at = Object.fromEntries(out.map((s, i) => [s.appSlug, i]));
    for (const p of data.photos) {
      const text = norm([p.speciesName, p.credit && p.credit.name, LICENCE_LABEL[p.licence], (data.species[at[p.species]] || {}).name].join(" "));
      if (!terms.every(t => text.includes(t))) continue;
      if (p.species in at) out[at[p.species]].photos.push(p);
    }
    return out.filter(s => s.photos.length || (terms.length && terms.every(t => norm(s.name).includes(t))));
  }, [data, q]);

  const usable = data ? data.photos.filter(p => !p.block).length : 0;
  return (
    <div data-testid="category-picker" style={{ background: N.wash, borderRadius: 10, padding: 10, marginTop: 10 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <div style={{ flex: 1, fontSize: 12, fontWeight: 700 }}>Choose a photo for {cat.label}</div>
        <button type="button" onClick={onCancel} style={smallBtn("ghost")}>Close</button>
      </div>
      <input type="search" value={q} onChange={e => setQ(e.target.value)} placeholder="Search species or photographer" aria-label="Search photos" style={input} />
      {err && <div style={errorText}>{err}</div>}
      {!data && !err && <div style={hint}>Loading the library…</div>}
      {data && <div style={hint}>{data.photos.length} photos across {data.species.length} species, {usable} usable publicly. Greyed-out photos can't be used, and say why.</div>}
      {data && groups.length === 0 && <div style={{ ...hint, marginTop: 10 }}>No photos match.</div>}
      {groups.map(g => (
        <div key={g.appSlug}>
          <div style={sectionLabel}>{g.name} · {g.photos.length}</div>
          {g.photos.length === 0 && <div style={hint}>No library photos yet.</div>}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 8 }}>
            {g.photos.map(p => {
              const current = data.currentPhotoId === p.id;
              const disabled = busy || Boolean(p.block) || current;
              return (
                <button key={p.id} type="button" disabled={disabled} onClick={() => onChoose(p)}
                  aria-label={p.block ? `${p.speciesName}, ${p.credit.name}: can't be used. ${p.block}` : current ? `${p.speciesName}, ${p.credit.name}: the current image` : `Use this photo: ${p.speciesName}, ${p.credit.name}`}
                  style={{ display: "block", textAlign: "left", padding: 0, border: `${current ? 2 : 0.5}px solid ${current ? C.green : N.line}`, borderRadius: 10, background: "white", overflow: "hidden", cursor: disabled ? "default" : "pointer", fontFamily: "inherit", opacity: p.block ? 0.55 : 1 }}>
                  <div style={{ width: "100%", aspectRatio: "4 / 3", background: N.line }}>
                    {p.url && <img src={p.url} alt="" loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", filter: p.block ? "grayscale(1)" : "none" }} />}
                  </div>
                  <div style={{ padding: "6px 8px 8px", fontSize: 11, lineHeight: 1.4, color: N.ink }}>
                    <div style={{ fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.credit.name}</div>
                    <div style={{ color: N.muted }}>{LICENCE_LABEL[p.licence] || p.licence}{p.width ? ` · ${p.width}×${p.height}` : ""}{p.isBest ? " · ★" : ""}</div>
                    {p.block && <div style={{ color: C.red, fontWeight: 700, marginTop: 2 }}>{p.block}</div>}
                    {current && <div style={{ ...badge("orange"), marginTop: 4 }}>Current</div>}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

// ─── One category ────────────────────────────────────────────────
const CategoryCard = ({ api, cat, image, onSaved, onRemoved }) => {
  const [mode, setMode] = useState(null); // "pick" | "card" | "banner" | "remove"
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [note, setNote] = useState("");
  const toggle = (m) => { setErr(""); setNote(""); setMode(cur => (cur === m ? null : m)); };

  const run = async (fn, done) => {
    setBusy(true); setErr(""); setNote("");
    try { await fn(); setMode(null); if (done) setNote(done); } catch (e) { setErr(e.message); } finally { setBusy(false); }
  };
  const patch = (body, done) => run(async () => { const d = await api("admin-photos", { method: "PATCH", body: { category: cat.id, ...body } }); onSaved(d.category); }, done);
  const remove = () => run(async () => { await api("admin-photos", { method: "DELETE", body: { category: cat.id } }); onRemoved(cat.id); }, "Removed: the card shows the emoji again.");

  return (
    <div data-testid={`category-${cat.id}`} style={{ ...card, padding: 12, marginBottom: 12 }}>
      <div style={{ display: "flex", gap: 12, alignItems: "flex-start", flexWrap: "wrap" }}>
        <CardPreview cat={cat} image={image} label={`${cat.label} card`} />
        <div style={{ flex: "1 1 150px", minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 700 }}>{cat.label}</div>
          {image ? (
            <div style={{ fontSize: 12, color: N.muted, lineHeight: 1.5, marginTop: 2 }}>
              {image.speciesName} · {image.credit && image.credit.name}
              {!image.live && <div style={{ color: C.red, fontWeight: 700 }}>Not shown: the photo is no longer eligible. Choose another.</div>}
              <div>{image.crop ? "Card crop set" : "Card: centred on the focus point"} · {image.bannerCrop ? "banner crop set" : "banner: centred"}</div>
            </div>
          ) : (
            <div style={{ fontSize: 12, color: N.muted, marginTop: 2 }}>No photo: the card and header show {cat.emoji}</div>
          )}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
            <button type="button" disabled={busy} onClick={() => toggle("pick")} style={smallBtn(image ? "ghost" : "primary", busy)}>{image ? "Change photo" : "Choose photo"}</button>
            {image && <button type="button" disabled={busy} onClick={() => toggle("card")} style={smallBtn("ghost", busy)}>Card crop</button>}
            {image && <button type="button" disabled={busy} onClick={() => toggle("banner")} style={smallBtn("ghost", busy)}>Banner crop</button>}
            {image && <button type="button" disabled={busy} onClick={() => toggle("remove")} style={smallBtn("danger", busy)}>Remove</button>}
          </div>
        </div>
      </div>

      {mode === "remove" && image && (
        <div role="alertdialog" aria-label={`Remove the ${cat.label} image?`} style={{ background: C.redPale, borderRadius: 10, padding: 10, marginTop: 10 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.red }}>Remove the {cat.label} image?</div>
          <div style={{ fontSize: 12, color: N.ink, margin: "4px 0 8px" }}>The card and the category header go back to {cat.emoji}. The photo stays in the library.</div>
          <div style={{ display: "flex", gap: 6 }}>
            <button type="button" disabled={busy} onClick={remove} style={smallBtn("danger", busy)}>Yes, remove</button>
            <button type="button" disabled={busy} onClick={() => setMode(null)} style={smallBtn("ghost", busy)}>Keep it</button>
          </div>
        </div>
      )}

      {mode === "pick" && (
        <CategoryPicker api={api} cat={cat} busy={busy} onCancel={() => setMode(null)}
          onChoose={(p) => patch({ photoId: p.id }, `Now using ${p.speciesName} by ${p.credit.name}. Check the crops.`)} />
      )}

      {mode === "card" && image && (
        <CropEditor key={`card-${image.url}`} photo={asEditable(image)} busy={busy} frame={CARD_ASPECT} stored={image.crop}
          title="Card crop" saveLabel="Save card crop" testId="card-crop" boxLabel="Card crop box"
          defaultHint="No crop saved: the card uses the widest crop centred on the focus point."
          renderPreview={(crop) => <CardPreview cat={cat} image={image} crop={crop} />}
          onCancel={() => setMode(null)} onSave={(crop) => patch({ crop }, crop ? "Card crop saved." : "Card crop cleared.")} />
      )}

      {mode === "banner" && image && (
        <CropEditor key={`banner-${image.url}`} photo={asEditable(image)} busy={busy} frame={BANNER_ASPECT} stored={image.bannerCrop}
          title="Banner crop" saveLabel="Save banner crop" testId="banner-crop" boxLabel="Banner crop box"
          defaultHint="No crop saved: the header uses the widest 2.4 : 1 crop centred on the focus point."
          renderPreview={(crop) => <BannerPreview cat={cat} image={image} crop={crop} />}
          onCancel={() => setMode(null)} onSave={(crop) => patch({ bannerCrop: crop }, crop ? "Banner crop saved." : "Banner crop cleared.")} />
      )}

      {err && <div role="alert" style={errorText}>{err}</div>}
      {note && <div role="status" style={hint}>{note}</div>}
    </div>
  );
};

const CategoriesScreen = ({ api }) => {
  const [images, setImages] = useState(null); // { [id]: image }
  const [err, setErr] = useState("");
  const load = useCallback(() => {
    api("admin-photos", { query: { categories: 1 } })
      .then(d => setImages(Object.fromEntries((d.categories || []).map(c => [c.category, c]))))
      .catch(e => setErr(e.message));
  }, [api]);
  useEffect(() => { load(); }, [load]);

  return (
    <div style={page}>
      <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 2 }}>Category images</div>
      <div style={{ ...hint, marginTop: 0, marginBottom: 12 }}>
        The photos on the Browse home cards and each category page's header. Only photos of the category's own species that can be used publicly (not CC BY-SA, at least 800 px) can be chosen. Choosing one makes its own public copy; it doesn't add the photo to the species page. Hiding, rejecting or moving the photo clears it.
      </div>
      {err && <div style={errorText}>{err}</div>}
      {!images && !err && <div style={hint}>Loading…</div>}
      {images && CATEGORIES.map(cat => (
        <CategoryCard key={cat.id} api={api} cat={cat} image={images[cat.id] || null}
          onSaved={(img) => setImages(cur => ({ ...cur, [img.category]: img }))}
          onRemoved={(id) => setImages(cur => { const next = { ...cur }; delete next[id]; return next; })} />
      ))}
    </div>
  );
};

export default CategoriesScreen;
