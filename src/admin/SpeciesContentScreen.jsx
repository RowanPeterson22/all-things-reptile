import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { C } from "../constants/colours";
import { T as TH } from "../constants/theme";
import { CATEGORIES } from "../data/categories";
import { validateDoc, tabLabel } from "../data/speciesContentShape";
import SpeciesScreen from "../screens/SpeciesScreen";
import { HeroFrameCtx } from "../components/SpeciesSlideshow";
import PhotosPanel from "./speciesEditor/PhotosPanel";
import { N, page, btn, smallBtn, chip, input, badge, card, sectionLabel, hint as hintStyle, errorText } from "./ui";
import { EditorCtx, Confirm, Field, BlockList, IdentityForm, PreviewBoundary } from "./speciesEditor/EditorParts";
import { setIn, tabPolicy, canAddTab, addTab, tabKeyFor, tabKeyProblem, moveItem, removeAt, textDiff, sameDoc, around, counterpart, ago } from "./speciesEditor/model";

// ─── /admin → Species (D5 step 2) ─────────────────────────────────
// The one place to edit the app's 46 species pages. The list shows each
// species' state; the editor edits a working copy of the draft with a live
// phone-width preview (the real SpeciesScreen, dark theme), then Save draft /
// Publish / Discard through /api/admin-species?scope=content
// (lib/adminSpeciesContent.js), which re-checks admin, every content rule and
// that nobody else changed the species meanwhile. Published edits reach the
// app within about a minute, no rebuild.

const ROUTE = "admin-species";
const QUERY = { scope: "content" };
const CAT_LABEL = Object.fromEntries(CATEGORIES.map(c => [c.id, c.label]));
const STATE = {
  published: { text: "Published", tone: "orange" },
  changes: { text: "Unpublished changes", tone: "gold" },
  unpublished: { text: "Never published", tone: "grey" },
};
const WIDE_PX = 1100;

const useWide = () => {
  const get = () => typeof window !== "undefined" && window.innerWidth >= WIDE_PX;
  const [wide, setWide] = useState(get);
  useEffect(() => {
    const on = () => setWide(get());
    window.addEventListener("resize", on);
    return () => window.removeEventListener("resize", on);
  }, []);
  return wide;
};

// ─── The list ─────────────────────────────────────────────────────
export const SpeciesContentList = ({ api }) => {
  const [rows, setRows] = useState(null);
  const [err, setErr] = useState("");
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  useEffect(() => {
    let live = true;
    api(ROUTE, { query: QUERY }).then(d => { if (live) setRows(d.species); }).catch(e => { if (live) setErr(e.message); });
    return () => { live = false; };
  }, [api]);
  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return (rows || []).filter(r => (cat === "all" || r.type === cat)
      && (!needle || `${r.name} ${r.latin} ${r.slug}`.toLowerCase().includes(needle)));
  }, [rows, q, cat]);
  const pending = (rows || []).filter(r => r.status !== "published").length;
  return (
    <div style={page}>
      <h1 style={{ fontSize: 20, margin: "4px 0 4px" }}>Species</h1>
      <div style={{ fontSize: 13, color: N.muted, marginBottom: 12, lineHeight: 1.5 }}>
        Every species page in the app. Edit, preview, then publish; the app shows a published change within about a minute.
        {rows && pending > 0 && <> <strong style={{ color: "#7a5a1e" }}>{pending} with unpublished changes.</strong></>}
      </div>
      <input type="search" aria-label="Search species" placeholder="Search by name or latin name" value={q} onChange={(e) => setQ(e.target.value)} style={{ ...input, marginBottom: 10 }} />
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
        <button type="button" onClick={() => setCat("all")} style={chip(cat === "all")} aria-pressed={cat === "all"}>All</button>
        {CATEGORIES.map(c => <button key={c.id} type="button" onClick={() => setCat(c.id)} style={chip(cat === c.id)} aria-pressed={cat === c.id}>{c.label}</button>)}
      </div>
      {err && <div style={errorText}>{err}</div>}
      {!rows && !err && <div style={{ fontSize: 13, color: N.muted }}>Loading species…</div>}
      {rows && (
        <div style={card} data-testid="species-content-list">
          {shown.length === 0 && <div style={{ padding: 14, fontSize: 13, color: N.muted }}>No species match.</div>}
          {shown.map(r => (
            <Link key={r.slug} to={`/admin/content/${r.slug}`} data-testid={`species-row-${r.slug}`}
              style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 14px", minHeight: 56, borderBottom: `0.5px solid ${N.line}`, textDecoration: "none", color: N.ink }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 700 }}>{r.name}</div>
                <div style={{ fontSize: 12, color: N.muted }}><em>{r.latin}</em> · {CAT_LABEL[r.type] || r.type}</div>
                <div style={{ fontSize: 11, color: N.faint, marginTop: 2 }}>Edited {ago(r.updatedAt)} by {r.updatedBy}</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                <span style={badge(STATE[r.status].tone)}>{STATE[r.status].text}</span>
                {r.problems > 0 && <span style={badge("red")}>{r.problems} problem{r.problems === 1 ? "" : "s"}</span>}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Revisions ────────────────────────────────────────────────────
const Revisions = ({ revisions, local, dirty, busy, onLoad }) => {
  const [asking, setAsking] = useState(null);
  return (
    <div data-testid="revisions" style={{ ...card, padding: "4px 14px 10px", marginBottom: 16 }}>
      <div style={sectionLabel}>Revisions (every publish)</div>
      {revisions.length === 0 && <div style={{ fontSize: 13, color: N.muted }}>Nothing published yet.</div>}
      {revisions.map(r => {
        const d = textDiff(local, r.doc);
        return (
          <div key={r.id} data-testid={`revision-${r.id}`} style={{ borderTop: `0.5px solid ${N.line}`, padding: "10px 0" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <strong style={{ fontSize: 13 }}>{new Date(r.publishedAt).toLocaleString("en-AU", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" })}</strong>
              <span style={{ fontSize: 12, color: N.muted }}>by {r.publishedBy || "unknown"}</span>
              {r.current && <span style={badge("orange")}>Live now</span>}
              <span style={{ flex: 1 }} />
              <button type="button" disabled={busy || d.same} onClick={() => setAsking(r.id)} style={smallBtn("ghost", busy || d.same)}>Load into draft</button>
            </div>
            <div style={{ fontSize: 12, color: N.ink, marginTop: 4, lineHeight: 1.5 }} data-testid="revision-summary">
              {d.same ? "Same as your draft."
                : d.otherChanges ? "Same text as your draft; ticks, colours or order differ."
                  : `Compared with your draft: ${d.added.length} passage${d.added.length === 1 ? "" : "s"} only in this version, ${d.removed.length} only in your draft.`}
              {[...d.added.slice(0, 3).map(x => ["this version", x]), ...d.removed.slice(0, 3).map(x => ["your draft", x])].map(([side, x], k) => (
                <div key={k} style={{ color: side === "this version" ? C.blue : N.muted }}>{side === "this version" ? "+" : "−"} {x.where}: “{around(x.text, (counterpart(x, side === "this version" ? d.removed : d.added) || {}).text)}”</div>
              ))}
            </div>
            {asking === r.id && <Confirm text={`Load this version into the draft? It replaces the saved draft${dirty ? " and your unsaved changes" : ""}. The app doesn't change until you Publish.`}
              yes="Load into draft" onYes={() => { setAsking(null); onLoad(r.id); }} onNo={() => setAsking(null)} />}
          </div>
        );
      })}
    </div>
  );
};

// ─── Tab controls ─────────────────────────────────────────────────
const TabBar = ({ doc, ti, onPick, update }) => {
  const [renaming, setRenaming] = useState(null);
  const [asking, setAsking] = useState(false);
  useEffect(() => { setRenaming(null); setAsking(false); }, [ti]);
  const pol = tabPolicy(doc, ti);
  const tab = doc.tabs[ti];
  const rnKey = renaming === null ? null : tabKeyFor(renaming);
  const rnProblem = renaming === null ? null : tabKeyProblem(doc, ti, rnKey);
  const moveTab = (dir) => { update(["tabs"], moveItem(doc.tabs, ti, dir)); onPick(ti + dir); };
  return (
    <div style={{ marginBottom: 12 }}>
      <div role="tablist" aria-label="Species tabs" style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
        {doc.tabs.map((t, i) => (
          <button key={`${t.key}-${i}`} type="button" role="tab" aria-selected={i === ti} onClick={() => onPick(i)} style={chip(i === ti)}>{tabLabel(t.key)}</button>
        ))}
        {canAddTab(doc) && <button type="button" onClick={() => { const next = addTab(doc); update(["tabs"], next.tabs); onPick(next.tabs.findIndex(t => !doc.tabs.includes(t))); }} style={smallBtn("ghost")}>+ Add tab</button>}
      </div>
      <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
        <span style={{ fontSize: 12, color: N.muted }}>This tab:</span>
        {pol.canRename && renaming === null && <button type="button" onClick={() => setRenaming(tabLabel(tab.key))} style={smallBtn("ghost")}>Rename</button>}
        <button type="button" aria-label="Move tab left" disabled={!pol.canLeft} onClick={() => moveTab(-1)} style={smallBtn("ghost", !pol.canLeft)}>← Move</button>
        <button type="button" aria-label="Move tab right" disabled={!pol.canRight} onClick={() => moveTab(1)} style={smallBtn("ghost", !pol.canRight)}>Move →</button>
        {pol.canDelete && <button type="button" onClick={() => setAsking(true)} style={smallBtn("danger")}>Delete tab</button>}
        {pol.why && <span style={{ ...hintStyle, marginTop: 0 }}>{pol.why}</span>}
      </div>
      {renaming !== null && (
        <div style={{ display: "flex", gap: 6, alignItems: "flex-start", marginTop: 8 }}>
          <div style={{ flex: 1 }}><Field label="Tab name" value={renaming} onChange={setRenaming} problem={rnProblem} hint={rnKey ? `Shows as “${tabLabel(rnKey)}”.` : null} /></div>
          <button type="button" disabled={Boolean(rnProblem)} onClick={() => { update(["tabs", ti, "key"], rnKey); setRenaming(null); }} style={{ ...smallBtn("primary", Boolean(rnProblem)), marginTop: 22 }}>Rename</button>
          <button type="button" onClick={() => setRenaming(null)} style={{ ...smallBtn("ghost"), marginTop: 22 }}>Cancel</button>
        </div>
      )}
      {asking && <Confirm tone="red" text={`Delete the ${tabLabel(tab.key)} tab and its ${tab.blocks.length} block${tab.blocks.length === 1 ? "" : "s"}?`} yes="Delete tab"
        onYes={() => { setAsking(false); update(["tabs"], removeAt(doc.tabs, ti)); onPick(Math.max(0, ti - 1)); }} onNo={() => setAsking(false)} />}
    </div>
  );
};

// ─── The phone-width preview ──────────────────────────────────────
// The hero's height comes from the preview's own width (container units), not
// the admin window's, so it frames photos exactly as a phone that wide does.
// photos: the Photos panel's public photos (null while it loads; undefined:
// fetch the live ones).
export const PREVIEW_HERO = { height: "min(103cqw, 440px)", minHeight: 300 };
const Preview = ({ slug, doc, tabKey, onTab, tall, photos }) => (
  <div data-testid="species-preview" data-theme={TH.name}
    style={{ width: 390, maxWidth: "100%", height: tall ? "calc(100vh - 210px)" : 720, minHeight: 480, overflowY: "auto", overflowX: "hidden", borderRadius: 30, border: "8px solid #1b1b1b", background: TH.bg, color: TH.text, fontFamily: TH.font, colorScheme: TH.scheme, margin: "0 auto", position: "relative", boxShadow: "0 8px 30px rgba(0,0,0,0.18)", containerType: "inline-size", scrollbarWidth: "none" }}>
    <PreviewBoundary doc={doc}>
      <HeroFrameCtx.Provider value={PREVIEW_HERO}>
        <SpeciesScreen slug={slug} doc={doc} tab={tabKey} onTab={onTab} onBack={() => {}} photos={photos} />
      </HeroFrameCtx.Provider>
    </PreviewBoundary>
  </div>
);

// ─── The editor ───────────────────────────────────────────────────
// species / bySlug / counts / catalogue / refreshCounts: the photo library's
// shared data (AdminApp), for the Photos panel. Without them the panel is left out.
export const SpeciesContentEditor = ({ api, species, bySlug, counts, catalogue, refreshCounts }) => {
  const { slug } = useParams();
  // With the photo library's data, the preview's photos come from the Photos
  // panel (null while it loads); without, the preview fetches the live ones.
  const [previewPhotos, setPreviewPhotos] = useState(species ? null : undefined);
  // The library files photos under the index slug whose appSlug is this page (D4: usually the same).
  const indexSlug = useMemo(() => {
    if (!species) return null;
    const hits = species.filter(r => r.appSlug === slug);
    return (hits.find(r => r.slug === slug) || hits[0] || {}).slug || null;
  }, [species, slug]);
  const navigate = useNavigate();
  const wide = useWide();
  const [server, setServer] = useState(null);   // the species as last read or saved
  const [local, setLocal] = useState(null);     // the working copy
  const [loadErr, setLoadErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState(null);   // { tone, text, problems? }
  const [conflict, setConflict] = useState(false);
  const [ask, setAsk] = useState(null);         // "publish" | "discard" | "leave"
  const [ti, setTi] = useState(0);
  const [showPreview, setShowPreview] = useState(true);  // wide: beside the form
  const [mobilePreview, setMobilePreview] = useState(false); // narrow: instead of the form
  const [showProblems, setShowProblems] = useState(false);

  const load = useCallback(() => {
    setLoadErr("");
    return api(ROUTE, { query: { ...QUERY, slug } })
      .then(d => { setServer(d.species); setLocal(d.species.draft); setConflict(false); })
      .catch(e => setLoadErr(e.message));
  }, [api, slug]);
  useEffect(() => { setServer(null); setLocal(null); setTi(0); load(); }, [load]);

  const dirty = Boolean(server && local && !sameDoc(local, server.draft));
  const problems = useMemo(() => (local ? validateDoc(local) : []), [local]);

  // Leaving with unsaved edits: the browser asks (closing or reloading the tab).
  useEffect(() => {
    if (!dirty) return undefined;
    const warn = (e) => { e.preventDefault(); e.returnValue = ""; };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const update = useCallback((path, value) => setLocal(d => setIn(d, path, value)), []);
  const ctx = useMemo(() => ({ doc: local, update }), [local, update]);

  const post = async (body, okText) => {
    setBusy(true); setNotice(null);
    try {
      const d = await api(ROUTE, { method: "POST", query: QUERY, body: { slug, ...body } });
      setServer(d.species); setLocal(d.species.draft);
      if (okText) setNotice({ tone: "ok", text: okText });
      return d.species;
    } catch (e) {
      if (e.status === 409 && e.data && e.data.conflict) setConflict(true);
      setNotice({ tone: "error", text: e.message, problems: e.data && e.data.problems });
      return null;
    } finally { setBusy(false); }
  };

  const save = () => post({ action: "save", draft: local, expectedUpdatedAt: server.updatedAt }, "Draft saved. The app doesn't change until you Publish.");
  const publish = async () => {
    let at = server.updatedAt;
    if (dirty) {
      const saved = await post({ action: "save", draft: local, expectedUpdatedAt: at });
      if (!saved) return;
      at = saved.updatedAt;
    }
    await post({ action: "publish", expectedUpdatedAt: at }, "Published. The app shows it within about a minute.");
  };
  const discard = async () => {
    if (server.status === "changes") await post({ action: "discard", expectedUpdatedAt: server.updatedAt }, "Back to the published version.");
    else { setLocal(server.draft); setNotice({ tone: "ok", text: "Unsaved changes discarded." }); }
  };
  const revert = (revisionId) => post({ action: "revert", revisionId, expectedUpdatedAt: server.updatedAt }, "Revision loaded into the draft. Check it, then Publish to put it live.");

  if (loadErr) return <div style={page}><Link to="/admin/content" style={{ fontSize: 13, color: C.green }}>‹ All species</Link><div style={{ ...errorText, marginTop: 12 }}>{loadErr}</div></div>;
  if (!server || !local) return <div style={page}><div style={{ fontSize: 13, color: N.muted }}>Loading…</div></div>;

  const tab = local.tabs[Math.min(ti, local.tabs.length - 1)];
  const tIndex = Math.min(ti, local.tabs.length - 1);
  const previewVisible = wide ? showPreview : mobilePreview;
  const pickTab = (i) => setTi(Math.max(0, i));
  const canPublish = !busy && !problems.length && (dirty || server.status !== "published");
  const canDiscard = !busy && (dirty || server.status === "changes");
  const stateNow = dirty ? { text: "Unsaved changes", tone: "red" } : STATE[server.status];

  const form = (
    <EditorCtx.Provider value={ctx}>
      <div style={{ ...card, padding: "4px 14px 6px", marginBottom: 16 }}>
        <div style={sectionLabel}>Identity</div>
        <IdentityForm categoryLabel={CAT_LABEL[local.type] || local.type} />
      </div>
      {species && (
        <div style={{ ...card, padding: "4px 14px 12px", marginBottom: 16 }}>
          <div style={sectionLabel}>Photos</div>
          <PhotosPanel api={api} appSlug={slug} indexSlug={indexSlug} name={local.name} species={species} bySlug={bySlug} catalogue={catalogue}
            counts={counts} refreshCounts={refreshCounts} onPreview={setPreviewPhotos} />
        </div>
      )}
      <div style={{ ...card, padding: "4px 14px 6px", marginBottom: 16, background: "#fafaf7" }}>
        <div style={sectionLabel}>Tabs and blocks</div>
        <TabBar doc={local} ti={tIndex} onPick={pickTab} update={update} />
        <BlockList key={`${tIndex}-${tab.key}`} path={["tabs", tIndex, "blocks"]} />
      </div>
      <Revisions revisions={server.revisions} local={local} dirty={dirty} busy={busy} onLoad={revert} />
    </EditorCtx.Provider>
  );

  const preview = <Preview slug={slug} doc={local} tabKey={tab.key} tall={wide} photos={previewPhotos} onTab={(k) => pickTab(local.tabs.findIndex(t => t.key === k))} />;

  return (
    <div style={{ ...page, maxWidth: wide ? 1360 : 960, paddingBottom: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 10 }}>
        <button type="button" onClick={() => (dirty ? setAsk("leave") : navigate("/admin/content"))} style={{ background: "none", border: "none", color: C.green, fontSize: 13, fontWeight: 700, cursor: "pointer", padding: 0, minHeight: 36, fontFamily: "inherit" }}>‹ All species</button>
        <h1 style={{ fontSize: 20, margin: 0, flex: 1, minWidth: 0 }}>{local.name}</h1>
        <span style={badge(stateNow.tone)} data-testid="editor-state">{stateNow.text}</span>
      </div>
      {ask === "leave" && <Confirm tone="red" text="Leave without saving? Your unsaved changes will be lost." yes="Leave" onYes={() => navigate("/admin/content")} onNo={() => setAsk(null)} />}
      {conflict && (
        <div role="alert" style={{ background: C.redPale, color: C.red, borderRadius: 10, padding: "10px 12px", fontSize: 13, marginBottom: 10 }}>
          Someone changed this species in another tab or session since you opened it, so your change wasn't applied.
          <div style={{ marginTop: 8 }}><button type="button" onClick={load} style={smallBtn("danger")}>Reload the latest (drops your unsaved changes)</button></div>
        </div>
      )}

      <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
        <div style={{ flex: 1, minWidth: 0, display: !wide && previewVisible ? "none" : "block" }}>{form}</div>
        {previewVisible && (
          <div style={{ width: wide ? 406 : "100%", flexShrink: 0, position: wide ? "sticky" : "static", top: 110 }}>
            <div style={{ fontSize: 11, color: N.muted, textAlign: "center", marginBottom: 6 }}>Live preview · 390 px · unsaved draft{species ? " · photos as they are now" : ""}</div>
            {preview}
          </div>
        )}
      </div>

      {/* The sticky bar: status, problems, actions. */}
      <div data-testid="save-bar" style={{ position: "sticky", bottom: 0, zIndex: 6, background: "white", borderTop: `1px solid ${N.line}`, margin: "16px -16px 0", padding: "10px 16px calc(env(safe-area-inset-bottom, 0px) + 10px)", boxShadow: "0 -4px 14px rgba(0,0,0,0.06)" }}>
        {ask === "publish" && <Confirm text={`Publish ${local.name}? ${dirty ? "Your changes are saved first, then " : ""}the app shows this version within about a minute.`} yes="Publish now" onYes={() => { setAsk(null); publish(); }} onNo={() => setAsk(null)} />}
        {ask === "discard" && <Confirm tone="red" text={server.status === "changes" ? "Discard every unpublished change? The draft goes back to what the app shows now." : "Discard your unsaved changes?"} yes="Discard" onYes={() => { setAsk(null); discard(); }} onNo={() => setAsk(null)} />}
        {notice && (
          <div role={notice.tone === "error" ? "alert" : "status"} style={{ fontSize: 13, color: notice.tone === "error" ? C.red : C.green, marginBottom: 6 }}>
            {notice.text}
            {notice.problems && <ul style={{ margin: "4px 0 0", paddingLeft: 18 }}>{notice.problems.map((p, i) => <li key={i}>{p}</li>)}</ul>}
          </div>
        )}
        {problems.length > 0 && (
          <div style={{ fontSize: 13, color: C.red, marginBottom: 6 }} data-testid="problems">
            <button type="button" onClick={() => setShowProblems(s => !s)} style={{ background: "none", border: "none", color: C.red, fontWeight: 700, cursor: "pointer", padding: 0, fontFamily: "inherit", fontSize: 13 }}>
              {problems.length} problem{problems.length === 1 ? "" : "s"} to fix before saving {showProblems ? "▴" : "▾"}
            </button>
            {showProblems && <ul style={{ margin: "4px 0 0", paddingLeft: 18 }}>{problems.map((p, i) => <li key={i}>{p}</li>)}</ul>}
          </div>
        )}
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <button type="button" disabled={busy || !dirty || problems.length > 0} onClick={save} style={btn("primary", busy || !dirty || problems.length > 0)}>Save draft</button>
          <button type="button" aria-pressed={previewVisible} onClick={() => (wide ? setShowPreview(v => !v) : setMobilePreview(v => !v))} style={btn("ghost")}>{previewVisible ? "Hide preview" : "Preview"}</button>
          <button type="button" disabled={!canPublish} onClick={() => setAsk("publish")} style={btn("primary", !canPublish)}>Publish</button>
          <button type="button" disabled={!canDiscard} onClick={() => setAsk("discard")} style={btn("danger", !canDiscard)}>Discard</button>
          <div style={{ fontSize: 12, color: N.muted, lineHeight: 1.45, flex: "1 1 220px" }} data-testid="publish-line">
            {server.publishedAt ? `Published ${ago(server.publishedAt)} by ${server.publishedBy || "unknown"}` : "Never published"}
            {server.status === "changes" && <><br />Draft saved {ago(server.updatedAt)} by {server.updatedBy}, not yet published</>}
          </div>
        </div>
      </div>
    </div>
  );
};
