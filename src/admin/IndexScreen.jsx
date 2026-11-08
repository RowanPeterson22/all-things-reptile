import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { C } from "../constants/colours";
import WarnBox from "../components/WarnBox";
import { GROUP_CHIPS, filterSpecies } from "./species";
import { morphsForSpecies } from "./morphs";
import { N, page, input, chip, badge, card, sectionLabel } from "./ui";
import ScrollRow from "../components/ScrollRow";

const STATES = ["NSW", "VIC", "QLD", "SA", "WA", "TAS", "ACT", "NT"];
const READ_ONLY = "Read-only for now. Editing comes later, once species data moves to Shopify and Supabase (D5).";
const notKeepable = (v) => !v || /not on keepable list|not keepable/i.test(v);

const Row = ({ k, children }) => (
  <div style={{ display: "flex", gap: 10, padding: "7px 0", borderBottom: `0.5px solid ${N.line}`, fontSize: 13 }}>
    <div style={{ width: 120, flexShrink: 0, color: N.muted }}>{k}</div>
    <div style={{ flex: 1, color: N.ink, minWidth: 0, overflowWrap: "anywhere" }}>{children}</div>
  </div>
);

// ─── One record ───────────────────────────────────────────────────
const RecordView = ({ r, catalogue }) => {
  const list = morphsForSpecies(catalogue, r.slug);
  return (
    <>
      <div style={{ fontSize: 20, fontWeight: 700, color: N.ink }}>{r.common}</div>
      <div style={{ fontSize: 13, color: N.muted, marginBottom: 12 }}><i>{r.scientific}</i></div>
      <div style={{ ...card, padding: "4px 14px" }}>
        <Row k="Slug">{r.slug}</Row>
        <Row k="App species">{r.appSlug || "—"}</Row>
        {r.relatedAppSlug && <Row k="Related app page">{r.relatedAppSlug}</Row>}
        {r.rank && <Row k="Rank">{r.rank}{r.parent ? ` of ${r.parent}` : ""}</Row>}
        <Row k="Group / family">{r.group} · {r.family}</Row>
        <Row k="Other names">{(r.otherCommon || []).join(", ") || "—"}</Row>
        {r.synonyms && r.synonyms.length > 0 && <Row k="Synonyms">{r.synonyms.join(", ")}</Row>}
        <Row k="States">{(r.states || []).join(", ") || "—"}{r.statesComplete ? "" : " (incomplete)"}</Row>
        <Row k="Flags">{[r.dangerouslyVenomous && "Dangerously venomous", r.marine && "Marine"].filter(Boolean).join(", ") || "—"}</Row>
        <div style={{ padding: "7px 0" }}><Link to={`/admin/species/${r.slug}`} style={{ color: C.green, fontWeight: 700, fontSize: 13 }}>Photos for this species ›</Link></div>
      </div>

      <div style={sectionLabel}>Keepable by state</div>
      <div style={{ ...card, padding: "4px 14px" }}>
        {STATES.map(st => {
          const v = r.keepable ? r.keepable[st] : null;
          const conf = r.keepableConfidence ? r.keepableConfidence[st] : null;
          return (
            <Row key={st} k={st}>
              <span style={{ color: notKeepable(v) ? C.red : N.ink, fontWeight: notKeepable(v) ? 400 : 700 }}>{v || "Not recorded"}</span>
              {conf && <> <span style={badge(conf === "low" ? "red" : "gold")}>{conf} confidence</span> <span style={{ fontSize: 11, color: N.muted }}>confirm with authority</span></>}
            </Row>
          );
        })}
      </div>
      <div style={{ fontSize: 11, color: N.muted, marginTop: 6 }}>Researched November 2026 against each state's keepable-species list. Always verify with your authority.</div>

      <div style={sectionLabel}>Morphs and traits</div>
      {list.length === 0 && <div style={{ fontSize: 13, color: N.muted }}>No morphs assigned to this species.</div>}
      {list.length > 0 && (
        <div style={{ ...card, padding: "4px 14px" }}>
          {list.map(m => (
            <div key={m.id} style={{ padding: "8px 0", borderBottom: `0.5px solid ${N.line}` }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: N.ink }}><Link to={`/admin/morphs/${m.id}`} style={{ color: N.ink, textDecoration: "none" }}>{m.name}</Link> <span style={badge(m.au_status === "established" ? "orange" : "gold")}>{m.au_status === "established" ? "established in AU" : "check AU"}</span></div>
              <div style={{ fontSize: 12, color: N.muted, lineHeight: 1.5 }}>{m.cue}</div>
            </div>
          ))}
        </div>
      )}
      <div style={{ fontSize: 11, color: N.muted, marginTop: 6 }}>Edit in <Link to="/admin/morphs" style={{ color: C.green }}>Morphs</Link>, or from the species' photo page.</div>
    </>
  );
};

// ─── Species index ────────────────────────────────────────────────
const IndexScreen = ({ species, bySlug, catalogue }) => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [group, setGroup] = useState("all");
  const [appOnly, setAppOnly] = useState(false);
  const list = useMemo(() => filterSpecies(species, { q, group, appOnly }), [species, q, group, appOnly]);

  if (slug) {
    const r = bySlug[slug];
    return (
      <div style={{ ...page, maxWidth: 720 }}>
        <button type="button" onClick={() => navigate("/admin/index")} style={{ background: "none", border: "none", color: C.green, fontSize: 13, fontWeight: 700, cursor: "pointer", padding: 0, marginBottom: 8, fontFamily: "inherit" }}>‹ Species index</button>
        <WarnBox type="blue" title="Read-only">{READ_ONLY}</WarnBox>
        {r ? <RecordView r={r} catalogue={catalogue} /> : <div style={{ fontSize: 13 }}>That species isn't in the index.</div>}
      </div>
    );
  }

  return (
    <div style={{ ...page, maxWidth: 720 }}>
      <WarnBox type="blue" title="Read-only">{READ_ONLY}</WarnBox>
      <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search common or scientific name" style={{ ...input, marginBottom: 10 }} aria-label="Search the index" />
      <ScrollRow tone="light" style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 4, marginBottom: 8 }}>
        {GROUP_CHIPS.map(c => <button key={c.id} type="button" onClick={() => setGroup(c.id)} style={chip(group === c.id)}>{c.label}</button>)}
        <button type="button" onClick={() => setAppOnly(v => !v)} style={chip(appOnly)}>In the app</button>
      </ScrollRow>
      <div style={{ fontSize: 11, color: N.muted, margin: "4px 0 8px" }}>{list.length.toLocaleString("en-AU")} records</div>
      <div style={card}>
        {list.slice(0, 100).map(r => (
          <button key={r.slug} type="button" onClick={() => navigate(`/admin/index/${r.slug}`)}
            style={{ display: "block", width: "100%", textAlign: "left", background: "none", border: "none", borderBottom: `0.5px solid ${N.line}`, padding: "10px 14px", cursor: "pointer", fontFamily: "inherit" }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: N.ink }}>{r.common} {r.appSlug && <span style={badge("orange")}>App</span>}</div>
            <div style={{ fontSize: 11, color: N.muted }}><i>{r.scientific}</i> · {r.group}</div>
          </button>
        ))}
      </div>
      {list.length > 100 && <div style={{ fontSize: 12, color: N.muted, marginTop: 8 }}>Showing the first 100. Search to narrow it down.</div>}
    </div>
  );
};

export default IndexScreen;
