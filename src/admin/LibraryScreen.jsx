import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { C } from "../constants/colours";
import { GROUP_CHIPS, PHOTO_FILTERS, filterSpecies, activeCount } from "./species";
import { N, page, input, chip, badge } from "./ui";
import ScrollRow from "../components/ScrollRow";

const PAGE_SIZE = 60;

// Filters are kept in module scope so they survive opening a species and coming back.
let remembered = { q: "", group: "all", photos: "any", appOnly: false };

const ChipRow = ({ children }) => (
  <ScrollRow tone="light" style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 4, marginBottom: 8, WebkitOverflowScrolling: "touch" }}>{children}</ScrollRow>
);

// ─── Photo library: every species, searchable, with photo counts ──
const LibraryScreen = ({ species, counts }) => {
  const navigate = useNavigate();
  const [f, setF] = useState(remembered);
  const [shown, setShown] = useState(PAGE_SIZE);
  const set = (patch) => { const next = { ...f, ...patch }; remembered = next; setF(next); setShown(PAGE_SIZE); };

  const list = useMemo(() => filterSpecies(species, { ...f, counts }), [species, f, counts]);
  const total = useMemo(() => Object.values(counts).reduce((n, c) => n + c.active, 0), [counts]);
  const withNone = useMemo(() => species.filter(s => !activeCount(counts, s.slug)).length, [species, counts]);

  return (
    <div style={page}>
      <div style={{ fontSize: 12, color: N.muted, marginBottom: 10 }}>
        {total.toLocaleString("en-AU")} active photos · {withNone.toLocaleString("en-AU")} of {species.length.toLocaleString("en-AU")} species have none
      </div>
      <input value={f.q} onChange={e => set({ q: e.target.value })} placeholder="Search common or scientific name" style={{ ...input, marginBottom: 10 }} aria-label="Search species" />
      <ChipRow>
        {GROUP_CHIPS.map(c => <button key={c.id} type="button" onClick={() => set({ group: c.id })} style={chip(f.group === c.id)}>{c.label}</button>)}
      </ChipRow>
      <ChipRow>
        {PHOTO_FILTERS.map(c => <button key={c.id} type="button" onClick={() => set({ photos: c.id })} style={chip(f.photos === c.id)}>{c.label}</button>)}
        <button type="button" onClick={() => set({ appOnly: !f.appOnly })} style={chip(f.appOnly)}>In the app</button>
      </ChipRow>

      <div style={{ fontSize: 11, color: N.muted, margin: "4px 0 8px" }}>{list.length.toLocaleString("en-AU")} species</div>
      <div style={{ background: "white", border: `0.5px solid ${N.line}`, borderRadius: 14, overflow: "hidden" }}>
        {list.slice(0, shown).map(s => {
          const c = counts[s.slug] || { active: 0, hidden: 0, rejected: 0, best: 0 };
          return (
            <div key={s.slug} style={{ display: "flex", alignItems: "center", borderBottom: `0.5px solid ${N.line}` }}>
              <button type="button" onClick={() => navigate(`/admin/species/${s.slug}`)}
                style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0, textAlign: "left", background: "none", border: "none", padding: "10px 14px", cursor: "pointer", fontFamily: "inherit" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: N.ink, display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
                    {s.common}{s.appSlug && <span style={badge("orange")}>App</span>}
                  </div>
                  <div style={{ fontSize: 11, color: N.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}><i>{s.scientific}</i> · {s.group}</div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: c.active ? C.green : N.faint }}>{c.active}</div>
                  <div style={{ fontSize: 10, color: N.faint }}>{c.hidden + c.rejected ? `+${c.hidden + c.rejected} off` : c.best ? `${c.best} best` : "photos"}</div>
                </div>
              </button>
              {/* App species: the same photos, beside the page's content and live preview. */}
              {s.appSlug && (
                <Link to={`/admin/content/${s.appSlug}`} data-testid={`edit-in-editor-${s.slug}`} aria-label={`Edit ${s.common} in the Species editor`}
                  style={{ flexShrink: 0, alignSelf: "stretch", display: "flex", alignItems: "center", padding: "0 14px", borderLeft: `0.5px solid ${N.line}`, color: C.green, fontSize: 12, fontWeight: 700, textDecoration: "none", maxWidth: 96, lineHeight: 1.25, textAlign: "center" }}>
                  Edit in Species editor
                </Link>
              )}
            </div>
          );
        })}
        {list.length === 0 && <div style={{ padding: 16, fontSize: 13, color: N.muted }}>No species match those filters.</div>}
      </div>
      {list.length > shown && (
        <button type="button" onClick={() => setShown(n => n + PAGE_SIZE)} style={{ ...chip(false), display: "block", margin: "12px auto 0" }}>
          Show more ({(list.length - shown).toLocaleString("en-AU")} left)
        </button>
      )}
    </div>
  );
};

export default LibraryScreen;
