import { useCallback, useEffect, useState } from "react";
import WarnBox from "../components/WarnBox";
import { C } from "../constants/colours";
import { N, page, btn, smallBtn, chip, badge, card, input, label, hint, errorText, fmtDate } from "./ui";

const GROUPS = ["VHS", "breeder", "other"];

// The invite link is shown once, straight from the create response, and only
// kept in this component's state until "Done". It is never logged or stored.
const InviteBox = ({ link, onDone }) => {
  const [copied, setCopied] = useState("");
  let previewLink = "";
  try {
    const u = new URL(link);
    if (typeof window !== "undefined" && window.location.origin !== u.origin) previewLink = `${window.location.origin}${u.pathname}${u.search}`;
  } catch (e) { /* show the main link only */ }

  const copy = async (text, which) => {
    try { await navigator.clipboard.writeText(text); setCopied(which); } catch (e) { setCopied("fail"); }
  };
  const row = (text, which, title) => (
    <div style={{ marginBottom: 10 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: N.muted, marginBottom: 4 }}>{title}</div>
      <div style={{ display: "flex", gap: 6 }}>
        <input readOnly value={text} onFocus={e => e.target.select()} style={{ ...input, fontSize: 12 }} aria-label={title} />
        <button type="button" onClick={() => copy(text, which)} style={smallBtn("primary")}>{copied === which ? "Copied" : "Copy"}</button>
      </div>
    </div>
  );
  return (
    <div style={{ ...card, padding: 14, marginBottom: 16 }}>
      <WarnBox type="gold" title="Copy this invite now">It's shown only once. Send it only to this tester: it opens their sections of the app on any device they open it on.</WarnBox>
      {row(link, "main", "Invite link")}
      {previewLink && row(previewLink, "preview", "Same invite on this preview site")}
      {copied === "fail" && <div style={errorText}>Couldn't copy. Select the text and copy it by hand.</div>}
      <button type="button" onClick={onDone} style={btn("ghost")}>Done</button>
    </div>
  );
};

// ─── Section tick-boxes ───────────────────────────────────────────
// options: [{ key, label }] from the server (src/constants/sections.json).
// Each tick saves straight away; the server re-checks admin and the keys.
const SectionBoxes = ({ options, value, onChange, disabled, idPrefix }) => (
  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 14px" }}>
    {options.map(o => {
      const on = value.includes(o.key);
      const id = `${idPrefix}-${o.key}`;
      return (
        <label key={o.key} htmlFor={id} style={{ display: "flex", alignItems: "center", gap: 8, minHeight: 32, fontSize: 12, color: N.ink, cursor: disabled ? "default" : "pointer", opacity: disabled ? 0.6 : 1 }}>
          <input id={id} type="checkbox" checked={on} disabled={disabled}
            onChange={() => onChange(on ? value.filter(k => k !== o.key) : [...value, o.key])}
            style={{ width: 20, height: 20, accentColor: C.green, margin: 0 }} />
          {o.label}
        </label>
      );
    })}
  </div>
);

// ─── Beta testers ─────────────────────────────────────────────────
const TestersScreen = ({ api, adminId }) => {
  const [testers, setTesters] = useState(null);
  const [err, setErr] = useState("");
  const [name, setName] = useState("");
  const [group, setGroup] = useState("other");
  const [creating, setCreating] = useState(false);
  const [createErr, setCreateErr] = useState("");
  const [invite, setInvite] = useState("");
  const [busyId, setBusyId] = useState("");
  const [rowErr, setRowErr] = useState({});
  const [options, setOptions] = useState([]);
  const [defaults, setDefaults] = useState(null);
  const [defaultsBusy, setDefaultsBusy] = useState(false);
  const [defaultsErr, setDefaultsErr] = useState("");

  const load = useCallback(async () => {
    setErr("");
    try {
      const d = await api("admin-testers");
      setTesters(d.testers);
      setOptions(Array.isArray(d.sections) ? d.sections : []);
      setDefaults(Array.isArray(d.defaultSections) ? d.defaultSections : ["id"]);
    } catch (e) { setErr(e.message); setTesters([]); }
  }, [api]);

  const saveDefaults = async (list) => {
    setDefaultsBusy(true); setDefaultsErr("");
    try { setDefaults((await api("admin-testers", { method: "PATCH", body: { defaultSections: list } })).defaultSections); }
    catch (e) { setDefaultsErr(e.message); } finally { setDefaultsBusy(false); }
  };
  useEffect(() => { load(); }, [load]);

  const create = async () => {
    if (!name.trim()) { setCreateErr("Give the tester's name."); return; }
    setCreating(true); setCreateErr("");
    try {
      const { tester, inviteLink } = await api("admin-testers", { method: "POST", body: { name, group } });
      setInvite(inviteLink);
      setTesters(list => [...(list || []), tester]);
      setName(""); setGroup("other");
    } catch (e) { setCreateErr(e.message); } finally { setCreating(false); }
  };

  const update = async (id, patch) => {
    setBusyId(id); setRowErr(r => ({ ...r, [id]: "" }));
    try {
      const { tester } = await api("admin-testers", { method: "PATCH", body: { id, ...patch } });
      setTesters(list => list.map(t => (t.id === id ? tester : t)));
    } catch (e) { setRowErr(r => ({ ...r, [id]: e.message })); } finally { setBusyId(""); }
  };

  return (
    <div style={{ ...page, maxWidth: 720 }}>
      <div style={{ fontSize: 18, fontWeight: 700, color: N.ink, marginBottom: 12 }}>Beta testers</div>

      {invite ? <InviteBox link={invite} onDone={() => setInvite("")} /> : (
        <div style={{ ...card, padding: 14, marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>Create an invite</div>
          <label style={label} htmlFor="adm-tester-name">Name</label>
          <input id="adm-tester-name" value={name} onChange={e => setName(e.target.value)} maxLength={200} style={{ ...input, marginBottom: 10 }} />
          <span style={label}>Group</span>
          <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
            {GROUPS.map(g => <button key={g} type="button" onClick={() => setGroup(g)} style={chip(group === g)}>{g}</button>)}
          </div>
          <button type="button" disabled={creating} onClick={create} style={btn("primary", creating)}>{creating ? "Creating…" : "Create invite"}</button>
          {createErr && <div style={errorText}>{createErr}</div>}
          <div style={hint}>The code is made on the server and shown once. Deactivate a tester to cut them off; their feedback stays.</div>
        </div>
      )}

      {defaults && options.length > 0 && (
        <div style={{ ...card, padding: 14, marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>Sections for new invites</div>
          <div style={{ ...hint, marginTop: 0, marginBottom: 10 }}>What a new tester can open before launch. Change any tester below at any time.</div>
          <SectionBoxes options={options} value={defaults} onChange={saveDefaults} disabled={defaultsBusy} idPrefix="adm-default" />
          {defaultsErr && <div style={errorText}>{defaultsErr}</div>}
        </div>
      )}

      {err && <div style={errorText}>{err}</div>}
      {testers === null && <div style={{ fontSize: 13, color: N.muted }}>Loading…</div>}
      <div style={card}>
        {(testers || []).map(t => {
          const self = t.id === adminId;
          const busy = busyId === t.id;
          return (
            <div key={t.id} style={{ padding: "10px 14px", borderBottom: `0.5px solid ${N.line}`, opacity: t.active ? 1 : 0.65 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: N.ink, flex: 1, minWidth: 140 }}>{t.name}{self ? " (you)" : ""}</div>
                <span style={badge("blue")}>{t.group}</span>
                <span style={badge(t.active ? "orange" : "grey")}>{t.active ? "active" : "inactive"}</span>
                {t.is_admin && <span style={badge("gold")}>admin</span>}
              </div>
              <div style={{ fontSize: 11, color: N.muted, margin: "2px 0 8px" }}>Created {fmtDate(t.created_at)}</div>
              {options.length > 0 && (
                <div style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: N.muted, marginBottom: 4 }}>Sections{t.is_admin ? ": admins see everything" : ""}</div>
                  <SectionBoxes options={options} value={t.is_admin ? options.map(o => o.key) : (t.sections || [])} disabled={busy || t.is_admin}
                    onChange={(list) => update(t.id, { sections: list })} idPrefix={`adm-${t.id}`} />
                </div>
              )}
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {t.active
                  ? <button type="button" disabled={busy || self} onClick={() => update(t.id, { active: false })} style={smallBtn("danger", busy || self)}>Deactivate</button>
                  : <button type="button" disabled={busy} onClick={() => update(t.id, { active: true })} style={smallBtn("primary", busy)}>Reactivate</button>}
                {t.is_admin
                  ? <button type="button" disabled={busy || self} onClick={() => update(t.id, { is_admin: false })} style={smallBtn("ghost", busy || self)} title={self ? "You can't remove your own admin access" : undefined}>Remove admin</button>
                  : <button type="button" disabled={busy} onClick={() => update(t.id, { is_admin: true })} style={smallBtn("ghost", busy)}>Make admin</button>}
              </div>
              {rowErr[t.id] && <div style={errorText}>{rowErr[t.id]}</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TestersScreen;
