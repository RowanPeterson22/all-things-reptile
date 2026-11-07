import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import SpeciesPicker from "./SpeciesPicker";
import { TraitPicker } from "./MorphParts";
import WarnBox from "../components/WarnBox";
import { toLibraryJpegs, MAX_EDGE, MASTER_EDGE, MIN_PUBLIC_EDGE } from "./image";
import { N, page, btn, chip, input, label, hint, errorText, LICENCE_LABEL } from "./ui";

export const LICENCES = ["cc0", "cc-by", "cc-by-sa", "permission", "tester_consent", "royalty_free"];
export const STOCK_LIBRARIES = ["Adobe Stock", "Shutterstock", "iStock", "Getty Images", "Depositphotos", "123RF"];
const isWebUrl = (u) => { try { const x = new URL(u); return x.protocol === "https:" || x.protocol === "http:"; } catch (e) { return false; } };

// Mirrors validateUpload() in lib/adminPhotos.js (the server is the real check).
// → { field: message } for every problem; empty when it can be saved.
export const validateAddForm = (f) => {
  const e = {};
  if (!f.speciesSlug) e.speciesSlug = "Choose the species.";
  if (!f.photo) e.photo = "Choose a photo.";
  const isStock = f.licence === "royalty_free";
  if (!String(f.photographer || "").trim() && (!isStock || f.creditRequired)) e.photographer = "Photographer is required.";
  if (!f.licence) e.licence = "Choose a licence.";
  else if (!LICENCES.includes(f.licence)) e.licence = "Choose a licence from the list.";
  if (isStock && !String(f.stockLibrary || "").trim()) e.stockLibrary = "Name the stock library (proof of licence).";
  if (isStock && !String(f.stockAssetId || "").trim()) e.stockAssetId = "Add the asset or licence ID (proof of licence).";
  const url = String(f.sourceUrl || "").trim();
  const note = String(f.permissionNote || "").trim();
  if (url && !isWebUrl(url)) e.sourceUrl = "Use a full web address (https://…).";
  if (!isStock && !url && !note) e.source = "Add the source URL or a note on the permission.";
  if (f.licence === "permission" && !note) e.permissionNote = "Note who gave permission, and how.";
  return e;
};

const EMPTY = { photographer: "", licence: "", sourceUrl: "", permissionNote: "", notes: "", traits: [], stockLibrary: "", stockAssetId: "", creditRequired: false, showCredit: true, displayCredit: "" };

// ─── Add a photo to a species ─────────────────────────────────────
const AddPhotoScreen = ({ api, species, bySlug, catalogue, refreshCounts }) => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const initial = params.get("species");
  const [speciesSlug, setSpeciesSlug] = useState(initial && bySlug[initial] ? initial : null);
  const [form, setForm] = useState(EMPTY);
  const [photo, setPhoto] = useState(null); // reference copy { dataUrl, width, height, bytes, master }
  const [prepErr, setPrepErr] = useState("");
  const [tried, setTried] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveErr, setSaveErr] = useState("");
  const [saved, setSaved] = useState(null);

  const set = (patch) => setForm(f => ({ ...f, ...patch }));
  const sp = speciesSlug && bySlug[speciesSlug];
  const errors = validateAddForm({ ...form, speciesSlug, photo: photo && photo.dataUrl });
  const ok = Object.keys(errors).length === 0;
  const isStock = form.licence === "royalty_free";
  const show = (k) => tried && errors[k] ? <div style={errorText}>{errors[k]}</div> : null;

  const pick = async (file) => {
    setPrepErr(""); setPhoto(null);
    if (!file) return;
    try { const { reference, master } = await toLibraryJpegs(file); setPhoto({ ...reference, master }); }
    catch (e) { setPrepErr(e.message === "too-large" ? "That photo is still over 2 MB after resizing." : "That file couldn't be read as a photo."); }
  };

  const save = async () => {
    setTried(true); setSaveErr("");
    if (!ok) return;
    setSaving(true);
    try {
      const { photo: row } = await api("admin-photos", { method: "POST", body: {
        speciesSlug, photo: photo.dataUrl, ...(photo.master ? { master: photo.master.dataUrl } : {}), photographer: form.photographer, licence: form.licence,
        sourceUrl: form.sourceUrl, permissionNote: form.permissionNote, notes: form.notes, traits: form.traits,
        ...(isStock ? { stockLibrary: form.stockLibrary, stockAssetId: form.stockAssetId, creditRequired: form.creditRequired, showCredit: form.creditRequired || form.showCredit, displayCredit: form.displayCredit } : {}),
      } });
      setSaved(row); refreshCounts();
    } catch (e) { setSaveErr(e.message); } finally { setSaving(false); }
  };

  if (saved) {
    return (
      <div style={page}>
        <WarnBox type="green" title="Saved to the library">{bySlug[saved.species_slug] ? bySlug[saved.species_slug].common : saved.species_slug} · {saved.credit ? saved.credit.name : saved.photographer} · {LICENCE_LABEL[saved.licence]}</WarnBox>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button type="button" onClick={() => { setSaved(null); setPhoto(null); setForm(f => ({ ...EMPTY, photographer: f.photographer, licence: f.licence })); setTried(false); }} style={btn("primary")}>Add another</button>
          <button type="button" onClick={() => navigate(`/admin/species/${saved.species_slug}`)} style={btn("ghost")}>View species</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ ...page, maxWidth: 560 }}>
      <div style={{ fontSize: 18, fontWeight: 700, color: N.ink, marginBottom: 12 }}>Add a photo</div>

      <div style={{ marginBottom: 14 }}>
        <span style={label}>Species</span>
        <SpeciesPicker species={species} value={speciesSlug} onChange={setSpeciesSlug} />
        {show("speciesSlug")}
      </div>

      <div style={{ marginBottom: 14 }}>
        <span style={label}>Photo</span>
        <input type="file" accept="image/jpeg,image/*" onChange={e => pick(e.target.files && e.target.files[0])} aria-label="Photo file" style={{ fontSize: 14 }} />
        <div style={hint}>Saved as a {MAX_EDGE} px reference copy plus a private copy up to {MASTER_EDGE} px for species pages, both JPEG with the location and camera data removed.</div>
        {prepErr && <div style={errorText}>{prepErr}</div>}
        {photo && (
          <div style={{ marginTop: 8 }}>
            <img src={photo.dataUrl} alt="Preview" style={{ maxWidth: "100%", maxHeight: 260, borderRadius: 10, display: "block" }} />
            <div style={hint}>
              Reference {photo.width}×{photo.height} · {(photo.bytes / 1024).toFixed(0)} KB
              {photo.master ? ` · larger copy ${photo.master.width}×${photo.master.height} · ${(photo.master.bytes / 1024).toFixed(0)} KB` : ""}
            </div>
            {Math.max(photo.master ? photo.master.width : photo.width, photo.master ? photo.master.height : photo.height) < MIN_PUBLIC_EDGE && (
              <div style={hint}>Under {MIN_PUBLIC_EDGE} px on the long edge, so it can't go on a species page. It will be an AI reference photo only.</div>
            )}
          </div>
        )}
        {show("photo")}
      </div>

      <div style={{ marginBottom: 14 }}>
        <label style={label} htmlFor="adm-photographer">Photographer{!isStock || form.creditRequired ? " *" : " (optional)"}</label>
        <input id="adm-photographer" value={form.photographer} onChange={e => set({ photographer: e.target.value })} maxLength={300} style={input} />
        {show("photographer")}
      </div>

      <div style={{ marginBottom: 14 }}>
        <span style={label}>Licence *</span>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {LICENCES.map(l => <button key={l} type="button" onClick={() => set({ licence: l })} style={chip(form.licence === l)}>{LICENCE_LABEL[l]}</button>)}
        </div>
        <div style={hint}>Never use NC, ND or all-rights-reserved photos. “Permission” means the photographer agreed directly. “Royalty-free stock” is a photo ATR licensed from a stock library.</div>
        {show("licence")}
      </div>

      {isStock && (
        <div style={{ background: N.wash, borderRadius: 12, padding: 12, marginBottom: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: N.ink, marginBottom: 8 }}>Proof of licence</div>
          <div style={{ marginBottom: 10 }}>
            <label style={label} htmlFor="adm-stock-library">Stock library *</label>
            <input id="adm-stock-library" list="adm-stock-libraries" value={form.stockLibrary} onChange={e => set({ stockLibrary: e.target.value })} maxLength={100} placeholder="e.g. Adobe Stock" style={input} />
            <datalist id="adm-stock-libraries">{STOCK_LIBRARIES.map(l => <option key={l} value={l} />)}</datalist>
            {show("stockLibrary")}
          </div>
          <div style={{ marginBottom: 10 }}>
            <label style={label} htmlFor="adm-stock-asset">Asset ID *</label>
            <input id="adm-stock-asset" value={form.stockAssetId} onChange={e => set({ stockAssetId: e.target.value })} maxLength={200} placeholder="The library's asset or licence number" style={input} />
            {show("stockAssetId")}
          </div>
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, marginBottom: 6, cursor: "pointer" }}>
            <input type="checkbox" checked={form.creditRequired} onChange={e => set({ creditRequired: e.target.checked })} /> The licence requires a credit
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, marginBottom: 6, cursor: form.creditRequired ? "default" : "pointer", opacity: form.creditRequired ? 0.6 : 1 }}>
            <input type="checkbox" checked={form.creditRequired || form.showCredit} disabled={form.creditRequired} onChange={e => set({ showCredit: e.target.checked })} /> Show the credit icon on the photo
          </label>
          <div style={hint}>{form.creditRequired ? "A required credit is always shown." : "Without a required credit the icon can be hidden; the photo is still listed on the credits page."}</div>
          <div style={{ marginTop: 10 }}>
            <label style={label} htmlFor="adm-display-credit">Credit shown (optional)</label>
            <input id="adm-display-credit" value={form.displayCredit} onChange={e => set({ displayCredit: e.target.value })} maxLength={300}
              placeholder={[form.stockLibrary || "Adobe Stock", form.photographer].filter(Boolean).join(" / ") || "Adobe Stock / Photographer"} style={input} />
            <div style={hint}>Leave blank for “{[form.stockLibrary || "Library", form.photographer || "Photographer"].join(" / ")}”. Use the wording the licence asks for, if it gives one.</div>
          </div>
        </div>
      )}

      <div style={{ marginBottom: 14 }}>
        <label style={label} htmlFor="adm-source">Source URL</label>
        <input id="adm-source" type="url" inputMode="url" value={form.sourceUrl} onChange={e => set({ sourceUrl: e.target.value })} placeholder="https://…" maxLength={1000} style={input} />
        {show("sourceUrl")}
      </div>

      <div style={{ marginBottom: 14 }}>
        <label style={label} htmlFor="adm-permission">Permission note{form.licence === "permission" ? " *" : ""}</label>
        <textarea id="adm-permission" value={form.permissionNote} onChange={e => set({ permissionNote: e.target.value })} rows={2} maxLength={1000} placeholder="Who agreed, how and when (e.g. email from J. Smith, 6 Nov 2026)" style={{ ...input, resize: "vertical" }} />
        {show("permissionNote")}
        {show("source")}
      </div>

      {sp && (
        <div style={{ marginBottom: 14 }}>
          <span style={label}>Traits</span>
          <TraitPicker catalogue={catalogue} speciesSlug={speciesSlug} selected={form.traits}
            onToggle={(id) => set({ traits: form.traits.includes(id) ? form.traits.filter(x => x !== id) : [...form.traits, id] })} />
        </div>
      )}

      <div style={{ marginBottom: 16 }}>
        <label style={label} htmlFor="adm-notes">Notes</label>
        <textarea id="adm-notes" value={form.notes} onChange={e => set({ notes: e.target.value })} rows={2} maxLength={1500} style={{ ...input, resize: "vertical" }} />
      </div>

      {saveErr && <div style={{ ...errorText, marginBottom: 8 }}>{saveErr}</div>}
      <button type="button" onClick={save} disabled={saving} style={{ ...btn("primary", saving || (tried && !ok)), width: "100%", minHeight: 44 }}>
        {saving ? "Saving…" : "Save to library"}
      </button>
      {!tried && !ok && <div style={{ ...hint, textAlign: "center" }}>{isStock ? "The stock library and asset ID are required." : "Photographer, licence and a source URL or permission note are required."}</div>}
    </div>
  );
};

export default AddPhotoScreen;
