import { useCallback, useEffect, useState } from "react";
import { C } from "../constants/colours";
import Icon from "../components/Icon";
import { N, page, btn, smallBtn, badge, card, input, label, hint, errorText, sectionLabel } from "./ui";

// ─── /admin → Sections ────────────────────────────────────────────
// The app's layout: tab labels, the Home block order, and every section in
// each tab (status, audience, order, featured, title and blurb). Reads and
// writes /api/admin-testers?scope=sections (lib/appSections.js), which
// re-checks admin and every rule; each change answers with the whole layout.
// Changes reach the app within about 30 s.

const STATUS_LABEL = { live: "Live", soon: "Coming soon", hidden: "Hidden" };
const AUDIENCE_LABEL = { everyone: "Everyone", testers: "Testers", admin: "Admin only" };
const STATUS_TONE = { live: "orange", soon: "gold", hidden: "red" };
const ROUTE = "admin-testers";
const QUERY = { scope: "sections" };

const select = { ...input, fontSize: 14, padding: "8px 10px", minHeight: 40 };
const arrow = (disabled) => ({ ...smallBtn("ghost", disabled), minWidth: 40, padding: "5px 0" });

// Up/down list, used for the Home blocks and each tab's sections.
const move = (list, i, dir) => {
  const j = i + dir;
  if (j < 0 || j >= list.length) return list;
  const out = [...list];
  [out[i], out[j]] = [out[j], out[i]];
  return out;
};

// In-page confirmation (never confirm()).
const Confirm = ({ text, yes, onYes, onNo }) => (
  <div role="alertdialog" aria-label={text} style={{ background: C.goldLight, borderRadius: 10, padding: "10px 12px", marginTop: 8 }}>
    <div style={{ fontSize: 12, color: "#7a5a1e", marginBottom: 8, lineHeight: 1.5 }}>{text}</div>
    <div style={{ display: "flex", gap: 6 }}>
      <button type="button" onClick={onYes} style={smallBtn("primary")}>{yes}</button>
      <button type="button" onClick={onNo} style={smallBtn("ghost")}>Cancel</button>
    </div>
  </div>
);

const SectionRow = ({ s, index, count, busy, featuredKey, onSave, onMove, onFeature, err }) => {
  const [title, setTitle] = useState(s.title || "");
  const [blurb, setBlurb] = useState(s.blurb || "");
  const [ask, setAsk] = useState(null); // { text, yes, patch }
  useEffect(() => { setTitle(s.title || ""); setBlurb(s.blurb || ""); }, [s.title, s.blurb]);
  const textDirty = (title.trim() || null) !== (s.title || null) || (blurb.trim() || null) !== (s.blurb || null);
  const id = `sec-${s.key}`;

  const change = (patch) => {
    if (patch.status === "hidden") return setAsk({ text: `Hide ${s.title || s.defaultTitle}? Nobody but admins will see it, testers included.`, yes: "Hide it", patch });
    if (patch.audience === "admin") return setAsk({ text: `Show ${s.title || s.defaultTitle} to admins only?`, yes: "Admins only", patch });
    if (patch.audience === "everyone" && !s.built) return setAsk({ text: `Show the ${s.title || s.defaultTitle} placeholder to the public once the app launches?`, yes: "Everyone", patch });
    return onSave(patch);
  };

  return (
    <div data-testid={`section-row-${s.key}`} style={{ padding: "12px 14px", borderBottom: `0.5px solid ${N.line}`, opacity: busy ? 0.6 : 1 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
        <span style={{ color: C.green }}><Icon name={s.icon} size={22} /></span>
        <div style={{ flex: 1, minWidth: 120 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: N.ink }}>{s.title || s.defaultTitle}</div>
          <div style={{ fontSize: 11, color: N.muted }}>{s.path}</div>
        </div>
        <span style={badge(STATUS_TONE[s.status])}>{STATUS_LABEL[s.status]}</span>
        <span style={badge(s.built ? "blue" : "grey")}>{s.built ? "Built" : "Placeholder"}</span>
        {s.featured && <span style={badge("orange")}>Featured</span>}
        <div style={{ display: "flex", gap: 4 }}>
          <button type="button" aria-label={`Move ${s.defaultTitle} up`} disabled={busy || index === 0} onClick={() => onMove(-1)} style={arrow(busy || index === 0)}>↑</button>
          <button type="button" aria-label={`Move ${s.defaultTitle} down`} disabled={busy || index === count - 1} onClick={() => onMove(1)} style={arrow(busy || index === count - 1)}>↓</button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
        <div>
          <label style={label} htmlFor={`${id}-status`}>Status</label>
          <select id={`${id}-status`} value={s.status} disabled={busy} onChange={e => change({ status: e.target.value })} style={select}>
            {["live", "soon", "hidden"].map(v => <option key={v} value={v} disabled={v === "live" && !s.built}>{STATUS_LABEL[v]}{v === "live" && !s.built ? " (not built)" : ""}</option>)}
          </select>
        </div>
        <div>
          <label style={label} htmlFor={`${id}-aud`}>Audience</label>
          <select id={`${id}-aud`} value={s.audience} disabled={busy} onChange={e => change({ audience: e.target.value })} style={select}>
            {["everyone", "testers", "admin"].map(v => <option key={v} value={v} disabled={v === "everyone" && s.neverPublic}>{AUDIENCE_LABEL[v]}{v === "everyone" && s.neverPublic ? " (beta-only)" : ""}</option>)}
          </select>
        </div>
      </div>
      {ask && <Confirm text={ask.text} yes={ask.yes} onYes={() => { const p = ask.patch; setAsk(null); onSave(p); }} onNo={() => setAsk(null)} />}

      {s.tile && (
        <>
          <label style={label} htmlFor={`${id}-title`}>Title</label>
          <input id={`${id}-title`} value={title} placeholder={s.defaultTitle} maxLength={40} disabled={busy} onChange={e => setTitle(e.target.value)} style={{ ...input, marginBottom: 8 }} />
          <label style={label} htmlFor={`${id}-blurb`}>Blurb</label>
          <input id={`${id}-blurb`} value={blurb} placeholder={s.defaultBlurb} maxLength={90} disabled={busy} onChange={e => setBlurb(e.target.value)} style={input} />
          <div style={hint}>Leave blank for the default shown in grey.</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8, alignItems: "center" }}>
            <button type="button" disabled={busy || !textDirty} onClick={() => onSave({ title: title.trim() || null, blurb: blurb.trim() || null })} style={smallBtn("primary", busy || !textDirty)}>Save text</button>
            {(s.title || s.blurb) && <button type="button" disabled={busy} onClick={() => setAsk({ text: "Put the title and blurb back to their defaults?", yes: "Reset", patch: { title: null, blurb: null } })} style={smallBtn("ghost", busy)}>Reset to default</button>}
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: N.ink, minHeight: 36, marginLeft: "auto", cursor: busy ? "default" : "pointer" }}>
              <input type="radio" name="featured" checked={featuredKey === s.key} disabled={busy} onChange={() => onFeature(s.key)} style={{ width: 20, height: 20, accentColor: C.green, margin: 0 }} />
              Featured on Home
            </label>
          </div>
          {s.featured && s.status === "hidden" && <div style={hint}>Hidden, so the featured card only shows for admins.</div>}
        </>
      )}
      {!s.tile && <div style={hint}>No tile: {s.key === "search" ? "the search bar on Home and Learn" : "linked from the Glossary"}.</div>}
      {err && <div style={errorText}>{err}</div>}
    </div>
  );
};

const SectionsScreen = ({ api }) => {
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState("");
  const [rowErr, setRowErr] = useState({});
  const [saved, setSaved] = useState("");
  const [labels, setLabels] = useState({});

  const take = useCallback((d) => {
    setData(d);
    setLabels(Object.fromEntries(d.tabs.map(t => [t.key, t.label || ""])));
  }, []);

  useEffect(() => {
    let live = true;
    api(ROUTE, { query: QUERY }).then(d => { if (live) take(d); }).catch(e => { if (live) setErr(e.message); });
    return () => { live = false; };
  }, [api, take]);

  // One change → the whole layout back. errKey: where to show a failure.
  const send = async (body, errKey, what) => {
    setBusy(errKey); setRowErr(r => ({ ...r, [errKey]: "" })); setSaved("");
    try { take(await api(ROUTE, { method: "PATCH", query: QUERY, body })); setSaved(what); }
    catch (e) { setRowErr(r => ({ ...r, [errKey]: e.message })); }
    finally { setBusy(""); }
  };

  if (err) return <div style={{ ...page, ...errorText }}>{err}</div>;
  if (!data) return <div style={{ ...page, fontSize: 13, color: N.muted }}>Loading…</div>;

  const featuredKey = (data.sections.find(s => s.featured) || {}).key || null;
  const labelDirty = data.tabs.some(t => (labels[t.key] || "").trim() !== (t.label || ""));
  const blockName = Object.fromEntries(data.blockOptions.map(b => [b.key, b.label]));

  return (
    <div style={{ ...page, maxWidth: 720 }}>
      <div style={{ fontSize: 18, fontWeight: 700, color: N.ink, marginBottom: 4 }}>Sections</div>
      <div style={{ ...hint, marginTop: 0, marginBottom: 12 }}>The five tabs are fixed; what's in them is set here. Changes reach the app within about 30 seconds. Built sections still need each tester's tick in Testers before launch; placeholders (Coming soon) show to every tester whose audience allows it.</div>
      <div role="status" aria-live="polite" style={{ fontSize: 12, color: C.green, fontWeight: 700, minHeight: 18 }}>{saved ? `Saved: ${saved}.` : ""}</div>

      <div style={sectionLabel}>Tab labels</div>
      <div style={{ ...card, padding: 14 }}>
        {data.tabs.map(t => (
          <div key={t.key} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <span style={{ color: N.muted, width: 24 }}><Icon name={t.icon} size={20} /></span>
            <input aria-label={`${t.defaultLabel} tab label`} value={labels[t.key] || ""} placeholder={t.defaultLabel} maxLength={data.limits.label}
              onChange={e => setLabels(l => ({ ...l, [t.key]: e.target.value }))} style={{ ...input, flex: 1 }} />
          </div>
        ))}
        <div style={hint}>Blank = the default. Keep them short: five share a phone's width.</div>
        <button type="button" disabled={busy === "tabs" || !labelDirty} style={{ ...btn("primary", busy === "tabs" || !labelDirty), marginTop: 8 }}
          onClick={() => send({ tabs: Object.fromEntries(data.tabs.map(t => [t.key, (labels[t.key] || "").trim() || null])) }, "tabs", "tab labels")}>Save tab labels</button>
        {rowErr.tabs && <div style={errorText}>{rowErr.tabs}</div>}
      </div>

      <div style={sectionLabel}>Home page order</div>
      <div style={card} data-testid="home-blocks">
        {data.homeBlocks.map((b, i) => (
          <div key={b} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 14px", borderBottom: `0.5px solid ${N.line}` }}>
            <div style={{ width: 20, fontSize: 12, color: N.muted, fontWeight: 700 }}>{i + 1}</div>
            <div style={{ flex: 1, fontSize: 13, color: N.ink }}>{blockName[b] || b}</div>
            <button type="button" aria-label={`Move ${blockName[b]} up`} disabled={Boolean(busy) || i === 0} onClick={() => send({ homeBlocks: move(data.homeBlocks, i, -1) }, "blocks", "Home order")} style={arrow(Boolean(busy) || i === 0)}>↑</button>
            <button type="button" aria-label={`Move ${blockName[b]} down`} disabled={Boolean(busy) || i === data.homeBlocks.length - 1} onClick={() => send({ homeBlocks: move(data.homeBlocks, i, 1) }, "blocks", "Home order")} style={arrow(Boolean(busy) || i === data.homeBlocks.length - 1)}>↓</button>
          </div>
        ))}
        <div style={{ padding: "8px 14px" }}>
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: N.ink, minHeight: 36, cursor: "pointer" }}>
            <input type="radio" name="featured" checked={featuredKey === null} disabled={Boolean(busy)} onChange={() => send({ featured: null }, "featured", "featured card")} style={{ width: 20, height: 20, accentColor: C.green, margin: 0 }} />
            No featured card
          </label>
          {rowErr.blocks && <div style={errorText}>{rowErr.blocks}</div>}
          {rowErr.featured && <div style={errorText}>{rowErr.featured}</div>}
        </div>
      </div>

      {data.tabs.map(t => {
        const list = data.sections.filter(s => s.tab === t.key);
        if (!list.length) return null;
        return (
          <div key={t.key} data-testid={`sections-tab-${t.key}`}>
            <div style={sectionLabel}>{t.label || t.defaultLabel}</div>
            <div style={card}>
              {list.map((s, i) => (
                <SectionRow key={s.key} s={s} index={i} count={list.length} busy={busy === s.key} featuredKey={featuredKey} err={rowErr[s.key]}
                  onSave={(patch) => send({ section: { key: s.key, ...patch } }, s.key, s.title || s.defaultTitle)}
                  onMove={(dir) => send({ order: { tab: t.key, keys: move(list.map(x => x.key), i, dir) } }, s.key, `${t.defaultLabel} order`)}
                  onFeature={(key) => send({ featured: key }, s.key, "featured card")} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SectionsScreen;
