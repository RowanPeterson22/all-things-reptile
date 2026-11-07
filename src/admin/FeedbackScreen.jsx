import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { C } from "../constants/colours";
import SpeciesPicker from "./SpeciesPicker";
import { N, page, smallBtn, badge, card, hint, errorText, fmtDate } from "./ui";

const VERDICT_TONE = { correct: "orange", partly: "gold", wrong: "red" };

// ─── One feedback row ─────────────────────────────────────────────
const FeedbackItem = ({ item, api, species, bySlug, appName, onFiled }) => {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [override, setOverride] = useState(!item.correctIndexSlug);
  const [slug, setSlug] = useState(null);
  const [broken, setBroken] = useState(false);

  const top = item.aiSuggestions[0];
  // correctSlug is an index slug (new rows) or an app slug (older rows); with
  // no slug, the tester typed the name under "Other".
  const corrected = item.correctSlug
    ? appName(item.correctSlug, item.correctIndexSlug)
    : item.correctOther ? `${item.correctOther} (Other, not in the index)` : null;
  const target = override ? slug : item.correctIndexSlug;
  const targetName = target && bySlug[target] ? bySlug[target].common : null;

  const add = async () => {
    setBusy(true); setErr("");
    try {
      const { photo } = await api("admin-feedback", { method: "POST", body: { feedbackId: item.id, speciesSlug: override ? slug : undefined } });
      onFiled(item.id, { speciesSlug: photo.species_slug, status: photo.status });
    } catch (e) { setErr(e.message); } finally { setBusy(false); }
  };

  return (
    <div style={{ ...card, display: "flex", flexDirection: "column" }}>
      {item.photoUrl && !broken && <img src={item.photoUrl} alt={`Submitted by ${item.tester ? item.tester.name : "a tester"}`} loading="lazy" onError={() => setBroken(true)} style={{ width: "100%", aspectRatio: "4 / 3", objectFit: "cover", display: "block", background: N.wash }} />}
      {item.photoUrl && broken && <div style={{ padding: 12, fontSize: 12, color: N.muted, background: N.wash }}>Image link expired. Reload the inbox.</div>}
      <div style={{ padding: "10px 12px 12px", fontSize: 12, lineHeight: 1.6, color: N.ink }}>
        <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap", marginBottom: 4 }}>
          <span style={badge(VERDICT_TONE[item.verdict] || "grey")}>{item.verdict}</span>
          <span style={{ color: N.muted }}>{fmtDate(item.createdAt)}</span>
        </div>
        <div><b>{item.tester ? item.tester.name : "Unknown tester"}</b>{item.tester ? ` · ${item.tester.group}` : ""}</div>
        <div><span style={{ color: N.muted }}>AI's top pick:</span> {top ? `${top.name || top.slug}${top.confidence ? ` (${top.confidence})` : ""}` : "none"}</div>
        {corrected && <div><span style={{ color: N.muted }}>Corrected to:</span> <b>{corrected}</b></div>}
        {item.correctTraits.length > 0 && <div><span style={{ color: N.muted }}>Traits:</span> {item.correctTraits.join(", ")}</div>}
        {item.notes && <div style={{ whiteSpace: "pre-wrap" }}><span style={{ color: N.muted }}>Notes:</span> {item.notes}</div>}
        {!item.photoUrl && <div style={{ color: N.faint, marginTop: 4 }}>{item.photoConsent ? "Photo missing." : "No photo (no consent)."}</div>}

        {item.inLibrary && (
          <div style={{ marginTop: 8, color: C.green, fontWeight: 700 }}>
            ✓ In the library under <Link to={`/admin/species/${item.inLibrary.speciesSlug}`} style={{ color: C.green }}>{bySlug[item.inLibrary.speciesSlug] ? bySlug[item.inLibrary.speciesSlug].common : item.inLibrary.speciesSlug}</Link>
            {item.inLibrary.status !== "active" ? ` (${item.inLibrary.status})` : ""}
          </div>
        )}

        {item.canAddToLibrary && !item.inLibrary && (
          <div style={{ marginTop: 10, borderTop: `0.5px solid ${N.line}`, paddingTop: 10 }}>
            {override ? (
              <>
                <div style={{ fontSize: 11, fontWeight: 700, color: N.muted, marginBottom: 4 }}>File under</div>
                <SpeciesPicker species={species} value={slug} onChange={setSlug} />
                {item.correctIndexSlug && <button type="button" onClick={() => { setOverride(false); setSlug(null); }} style={{ ...smallBtn("ghost"), marginTop: 6 }}>Use the corrected species</button>}
              </>
            ) : (
              <button type="button" onClick={() => setOverride(true)} style={{ background: "none", border: "none", padding: 0, color: C.green, fontSize: 11, cursor: "pointer", fontFamily: "inherit" }}>File under a different species</button>
            )}
            <button type="button" disabled={busy || !target} onClick={add} style={{ ...smallBtn("primary", busy || !target), display: "block", marginTop: 8 }}>
              {busy ? "Adding…" : targetName ? `Add to library: ${targetName}` : "Add to library"}
            </button>
            <div style={hint}>Stored as tester consent, credited to the tester.</div>
          </div>
        )}
        {err && <div style={errorText}>{err}</div>}
      </div>
    </div>
  );
};

// ─── Feedback inbox ───────────────────────────────────────────────
const FeedbackScreen = ({ api, species, bySlug, refreshCounts }) => {
  const [items, setItems] = useState(null);
  const [next, setNext] = useState(null);
  const [err, setErr] = useState("");
  const [loadingMore, setLoadingMore] = useState(false);

  // Feedback slug → name: the index record it maps to (server-resolved), else
  // the record that carries it as an app slug, else the slug itself.
  const appName = useCallback((slug, indexSlug) => {
    if (indexSlug && bySlug[indexSlug]) return bySlug[indexSlug].common;
    if (bySlug[slug]) return bySlug[slug].common;
    const r = species.find(s => s.appSlug === slug);
    return r ? r.common : slug;
  }, [species, bySlug]);

  const load = useCallback(async (offset = 0) => {
    setErr("");
    try {
      const data = await api("admin-feedback", { query: { offset: offset || "" } });
      setItems(list => (offset ? [...(list || []), ...data.items] : data.items));
      setNext(data.nextOffset);
    } catch (e) { setErr(e.message); if (!offset) setItems([]); }
  }, [api]);

  useEffect(() => { load(0); }, [load]);

  const onFiled = (id, inLibrary) => { setItems(list => list.map(i => (i.id === id ? { ...i, inLibrary } : i))); refreshCounts(); };

  return (
    <div style={page}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: N.ink, flex: 1 }}>Feedback inbox</div>
        <button type="button" onClick={() => { setItems(null); load(0); }} style={smallBtn("ghost")}>Reload</button>
      </div>
      {err && <div style={errorText}>{err}</div>}
      {items === null && <div style={{ fontSize: 13, color: N.muted }}>Loading…</div>}
      {items && items.length === 0 && !err && <div style={{ fontSize: 13, color: N.muted }}>No feedback yet.</div>}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
        {(items || []).map(i => <FeedbackItem key={i.id} item={i} api={api} species={species} bySlug={bySlug} appName={appName} onFiled={onFiled} />)}
      </div>
      {next !== null && (
        <button type="button" disabled={loadingMore} onClick={async () => { setLoadingMore(true); await load(next); setLoadingMore(false); }} style={{ ...smallBtn("ghost", loadingMore), display: "block", margin: "14px auto 0" }}>
          {loadingMore ? "Loading…" : "Load older feedback"}
        </button>
      )}
    </div>
  );
};

export default FeedbackScreen;
