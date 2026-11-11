import { Component, createContext, useContext, useId, useState } from "react";
import { C } from "../../constants/colours";
import { N, smallBtn, input, label as labelStyle, hint as hintStyle, errorText, badge } from "../ui";
import { LIMITS, LEVELS, WARN_TONES, BITE_TONES, RISKS, TAS_LOCKED, checkBlock, licenceText } from "../../data/speciesContentShape";
import {
  BLOCK_LABELS, newBlock, addableTypes, getIn, moveItem, removeAt, fixHot, blockPolicy,
  tasLocked, licenceNameProblem, licenceNoteProblem, textProblem,
} from "./model";

// ─── /admin → Species: form pieces ────────────────────────────────
// Every input reads and writes the working document by path through the
// editor context, and shows its own problem next to it as you type (the same
// limits and rules as the shape check, src/data/speciesContentShape.js).
// Light admin look, colours from C (D3: inline styles only).

export const EditorCtx = createContext(null);
const useEd = () => useContext(EditorCtx);

const fieldInput = (err, disabled) => ({
  ...input, borderColor: err ? C.red : N.line, background: disabled ? N.wash : "white", color: disabled ? N.muted : N.ink,
});
const row2 = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "0 10px" };

// In-page confirmation (never confirm()).
export const Confirm = ({ text, yes, onYes, onNo, tone = "gold" }) => (
  <div role="alertdialog" aria-label={text} style={{ background: tone === "red" ? C.redPale : C.goldLight, borderRadius: 10, padding: "10px 12px", margin: "8px 0" }}>
    <div style={{ fontSize: 13, color: tone === "red" ? C.red : "#7a5a1e", marginBottom: 8, lineHeight: 1.5 }}>{text}</div>
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
      <button type="button" onClick={onYes} style={smallBtn(tone === "red" ? "danger" : "primary")}>{yes}</button>
      <button type="button" onClick={onNo} style={smallBtn("ghost")}>Cancel</button>
    </div>
  </div>
);

// A labelled input with its problem underneath.
export const Field = ({ label, value, onChange, problem, hint, multiline = false, disabled = false, type = "text", placeholder, testId }) => {
  const id = useId();
  const errId = `${id}-err`;
  const common = {
    id, value: value === null || value === undefined ? "" : value, disabled, placeholder,
    onChange: (e) => onChange(e.target.value), "aria-invalid": problem ? "true" : undefined,
    "aria-describedby": problem ? errId : undefined, "data-testid": testId, style: fieldInput(problem, disabled),
  };
  return (
    <div style={{ marginBottom: 10, minWidth: 0 }}>
      <label htmlFor={id} style={labelStyle}>{label}</label>
      {multiline
        ? <textarea {...common} rows={Math.min(10, Math.max(3, Math.ceil(String(common.value).length / 70)))} style={{ ...common.style, resize: "vertical", lineHeight: 1.5 }} />
        : <input {...common} type={type} />}
      {problem && <div id={errId} role="alert" style={errorText}>{problem}</div>}
      {hint && <div style={hintStyle}>{hint}</div>}
    </div>
  );
};

// Text at a path. optional: blank stores null (the shape's "no value").
export const T = ({ path, label, max = LIMITS.text, multiline = false, optional = false, hint, testId }) => {
  const { doc, update } = useEd();
  const v = getIn(doc, path);
  return <Field label={label} value={v} multiline={multiline} hint={hint} testId={testId}
    problem={textProblem(v, max, { optional })}
    onChange={(x) => update(path, optional && x === "" ? null : x)} />;
};

export const Select = ({ path, label, options, labels = {} }) => {
  const { doc, update } = useEd();
  const id = useId();
  return (
    <div style={{ marginBottom: 10 }}>
      <label htmlFor={id} style={labelStyle}>{label}</label>
      <select id={id} value={getIn(doc, path)} onChange={(e) => update(path, e.target.value)} style={{ ...fieldInput(false), padding: "9px 10px" }}>
        {options.map(o => <option key={o} value={o}>{labels[o] || o}</option>)}
      </select>
    </div>
  );
};

export const Check = ({ path, label, disabled = false, testId }) => {
  const { doc, update } = useEd();
  return (
    <label style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: disabled ? N.muted : N.ink, minHeight: 36, cursor: disabled ? "default" : "pointer", marginRight: 14 }}>
      <input type="checkbox" checked={getIn(doc, path) === true} disabled={disabled} data-testid={testId}
        onChange={(e) => update(path, e.target.checked)} style={{ width: 18, height: 18 }} />
      {label}
    </label>
  );
};

const arrowBtn = (disabled) => ({ ...smallBtn("ghost", disabled), minWidth: 36, padding: "4px 0" });

// A list of items with add, remove and up/down. `after` normalises the list
// after any change (temperature bars: the first is the hot one).
export const ItemList = ({ path, min = 0, max = 20, make, render, addLabel, itemName = "item", after = (x) => x }) => {
  const { doc, update } = useEd();
  const list = getIn(doc, path) || [];
  const set = (next) => update(path, after(next));
  return (
    <div style={{ marginBottom: 10 }}>
      {list.map((_, i) => (
        <div key={i} data-testid="item" style={{ border: `0.5px solid ${N.line}`, borderRadius: 10, padding: "8px 10px 2px", marginBottom: 6, background: "#fcfcfa" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: N.muted, flex: 1 }}>{itemName} {i + 1}</span>
            <button type="button" aria-label={`Move ${itemName} ${i + 1} up`} disabled={i === 0} onClick={() => set(moveItem(list, i, -1))} style={arrowBtn(i === 0)}>↑</button>
            <button type="button" aria-label={`Move ${itemName} ${i + 1} down`} disabled={i === list.length - 1} onClick={() => set(moveItem(list, i, 1))} style={arrowBtn(i === list.length - 1)}>↓</button>
            <button type="button" aria-label={`Remove ${itemName} ${i + 1}`} disabled={list.length <= min} onClick={() => set(removeAt(list, i))} style={{ ...smallBtn("danger", list.length <= min), minHeight: 32 }}>Remove</button>
          </div>
          {render([...path, i], i)}
        </div>
      ))}
      {list.length < max && <button type="button" onClick={() => set([...list, make(list.length)])} style={smallBtn("ghost")}>+ {addLabel}</button>}
    </div>
  );
};

// { title, text } pairs (shedding, handling and breeding warnings).
const Titled = ({ path, label }) => (
  <div style={{ borderLeft: `3px solid ${N.line}`, paddingLeft: 10, marginBottom: 6 }}>
    <div style={{ fontSize: 11, fontWeight: 700, color: N.muted, textTransform: "uppercase", letterSpacing: "0.05em", margin: "4px 0 6px" }}>{label}</div>
    <T path={[...path, "title"]} label="Title" max={LIMITS.title} />
    <T path={[...path, "text"]} label="Text" multiline />
  </div>
);

const pair = (labelA, keyA, maxA, labelB, keyB, maxB) => (p) => (
  <div style={row2}>
    <T path={[...p, keyA]} label={labelA} max={maxA} />
    <T path={[...p, keyB]} label={labelB} max={maxB} />
  </div>
);

const WidthField = ({ path }) => {
  const { doc, update } = useEd();
  const v = getIn(doc, path) || "";
  const n = v.replace(/%$/, "");
  const ok = /^(100|[1-9]?[0-9])%$/.test(v);
  return <Field label="Bar length (%)" type="number" value={n} problem={ok ? null : "A whole number from 0 to 100."}
    onChange={(x) => update(path, `${x}%`)} />;
};

// ─── Licence grid ─────────────────────────────────────────────────
const LICENCE_HINT = "Use each authority's own licence name, as on its website today: NSW Companion / Class 1 / Advanced licence; VIC Basic / Advanced licence; QLD Standard / Specialised / Advanced licence; SA Basic / Specialist permit; WA Pet keeper's licence; TAS Herpetofauna permit; ACT keeper licence; NT permit to keep. Never species class codes (NSW R-codes, QLD Class 1/2 species, VIC schedule numbers, WA categories): they won't save. Tick “confirm with authority” for medium or low confidence.";

const LicenceForm = ({ path }) => {
  const { doc, update } = useEd();
  const block = getIn(doc, path);
  const locked = tasLocked(doc);
  return (
    <div data-testid="licence-form">
      <div style={{ ...hintStyle, background: C.bluePale, color: C.blue, borderRadius: 8, padding: "8px 10px", margin: "0 0 10px" }}>{LICENCE_HINT}</div>
      <T path={[...path, "note"]} label="Intro note (above the grid)" multiline />
      {block.states.map((s, i) => {
        const p = [...path, "states", i];
        const tas = s.abbr === "TAS" && locked;
        const nameProblem = tas ? null : licenceNameProblem(s.licence);
        const noteProblem = tas ? null : licenceNoteProblem(s.note);
        return (
          <div key={s.abbr} data-testid={`licence-row-${s.abbr}`} style={{ borderTop: `0.5px solid ${N.line}`, padding: "10px 0 2px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
              <span style={{ fontWeight: 700, fontSize: 14, width: 40 }}>{s.abbr}</span>
              <span style={badge(s.ok ? "orange" : "red")}>{s.ok ? "Permitted" : "Not permitted"}</span>
              {tas && <span style={badge("grey")}>Locked</span>}
              <span style={{ fontSize: 12, color: N.muted, flex: "1 1 200px" }}>Shows as: {licenceText(s) || "…"}</span>
            </div>
            {tas ? (
              <div style={{ ...hintStyle, marginTop: 0, marginBottom: 8 }} data-testid="tas-locked">
                TAS is always “{TAS_LOCKED.licence} ({TAS_LOCKED.note})” for species that aren't Tasmanian natives (content rule), so this row can't be edited.
              </div>
            ) : (
              <>
                <div style={row2}>
                  <Field label={`${s.abbr} licence name`} value={s.licence} problem={nameProblem} testId={`licence-name-${s.abbr}`}
                    onChange={(x) => update([...p, "licence"], x)} />
                  <Field label="Note (optional)" value={s.note} problem={noteProblem} testId={`licence-note-${s.abbr}`}
                    onChange={(x) => update([...p, "note"], x === "" ? null : x)} />
                </div>
                <Check path={[...p, "ok"]} label="Permitted" testId={`licence-ok-${s.abbr}`} />
                <Check path={[...p, "confirm"]} label="Confirm with authority" testId={`licence-confirm-${s.abbr}`} />
              </>
            )}
          </div>
        );
      })}
      <div style={{ ...hintStyle, marginTop: 8 }}>The “Always verify before purchasing” disclaimer is part of the page and can't be edited.</div>
    </div>
  );
};

// ─── One form per block type ──────────────────────────────────────
const FORMS = {
  text: (p) => <T path={[...p, "text"]} label="Text" multiline />,
  label: (p) => <T path={[...p, "text"]} label="Heading" max={LIMITS.label} />,
  stats: (p) => <ItemList path={[...p, "items"]} min={1} max={8} itemName="Stat" addLabel="Add stat" make={() => ({ label: "", value: "" })}
    render={pair("Label", "label", LIMITS.short, "Value", "value", LIMITS.short)} />,
  basking: (p) => (
    <>
      <div style={{ ...hintStyle, marginTop: 0, marginBottom: 8 }}>Monitors need a 50–60°C basking surface (all six, D8). The Pygmy Mulga text also states a 45°C minimum.</div>
      <T path={[...p, "range"]} label="Range" max={LIMITS.range} />
      <T path={[...p, "title"]} label="Title" max={LIMITS.title} />
      <T path={[...p, "text"]} label="Text" multiline />
    </>
  ),
  temps: (p) => <ItemList path={[...p, "bars"]} min={1} max={8} itemName="Bar" addLabel="Add bar" after={fixHot}
    make={() => ({ label: "", value: "", width: "50%", hot: false })}
    render={(ip, i) => (
      <>
        <div style={row2}>
          <T path={[...ip, "label"]} label={i === 0 ? "Label (the hot bar)" : "Label"} max={80} />
          <T path={[...ip, "value"]} label="Value" max={LIMITS.value} />
        </div>
        <WidthField path={[...ip, "width"]} />
      </>
    )} />,
  card: (p) => <T path={[...p, "text"]} label="Text" multiline />,
  warn: (p) => (
    <>
      <Select path={[...p, "tone"]} label="Colour" options={WARN_TONES} labels={{ gold: "Gold (caution)", green: "Orange (tip)", red: "Red (danger)", blue: "Blue (info)" }} />
      <T path={[...p, "title"]} label="Title" max={LIMITS.title} />
      <T path={[...p, "text"]} label="Text" multiline />
    </>
  ),
  bite: (p) => (
    <>
      <Select path={[...p, "tone"]} label="Colour" options={BITE_TONES} labels={{ red: "Red", orange: "Orange", accent: "Accent" }} />
      <T path={[...p, "heading"]} label="Heading" max={LIMITS.title} />
      <T path={[...p, "text"]} label="Text" multiline />
    </>
  ),
  food: (p) => <ItemList path={[...p, "items"]} min={1} itemName="Food" addLabel="Add food" make={() => ({ name: "", detail: null, freq: null })}
    render={(ip) => (
      <>
        <T path={[...ip, "name"]} label="Name" max={LIMITS.label} hint="Wood Roaches are the main feeder roach; BSFL are sold as Calci-worms." />
        <div style={row2}>
          <T path={[...ip, "detail"]} label="Detail (optional)" max={300} optional />
          <T path={[...ip, "freq"]} label="How often (optional)" max={LIMITS.label} optional />
        </div>
      </>
    )} />,
  health: (p) => <ItemList path={[...p, "items"]} min={1} itemName="Item" addLabel="Add health item" make={() => ({ title: "", detail: "", good: false })}
    render={(ip) => (
      <>
        <T path={[...ip, "title"]} label="Title" max={LIMITS.title} />
        <T path={[...ip, "detail"]} label="Detail" multiline />
        <Check path={[...ip, "good"]} label="A good sign (green dot)" />
      </>
    )} />,
  mistakes: (p) => <ItemList path={[...p, "items"]} min={1} max={20} itemName="Mistake" addLabel="Add mistake" make={() => ({ title: "", detail: "" })}
    render={(ip) => (<><T path={[...ip, "title"]} label="Title" max={300} /><T path={[...ip, "detail"]} label="Detail" multiline /></>)} />,
  shedding: (p) => (
    <>
      <T path={[...p, "label"]} label="Section heading" max={LIMITS.label} />
      <Titled path={[...p, "signs"]} label="Signs" />
      <Titled path={[...p, "good"]} label="A good shed" />
      <div style={{ fontSize: 11, fontWeight: 700, color: N.muted, textTransform: "uppercase", letterSpacing: "0.05em", margin: "4px 0 6px" }}>Problems</div>
      <ItemList path={[...p, "problems"]} itemName="Problem" addLabel="Add problem" make={() => ({ title: "", text: "" })}
        render={(ip) => (<><T path={[...ip, "title"]} label="Title" max={LIMITS.title} /><T path={[...ip, "text"]} label="Text" multiline /></>)} />
      <Titled path={[...p, "warn"]} label="Warning" />
    </>
  ),
  snakeHandling: (p) => (
    <>
      <Select path={[...p, "risk"]} label="Bite risk" options={RISKS} labels={{ low: "Low", medium: "Medium", high: "High" }} />
      <T path={[...p, "notes"]} label="Notes" multiline />
      <div style={row2}>
        <T path={[...p, "tipsLabel"]} label="Tips heading" max={LIMITS.label} />
        <T path={[...p, "tipsTitle"]} label="Tips title" max={LIMITS.title} />
      </div>
      <ItemList path={[...p, "tips"]} itemName="Tip" addLabel="Add tip" make={() => ""}
        render={(ip) => <T path={ip} label="Tip" multiline />} />
      <Titled path={[...p, "warn"]} label="Warning" />
    </>
  ),
  breeding: (p) => (
    <>
      <T path={[...p, "label"]} label="Section heading" max={LIMITS.label} />
      <ItemList path={[...p, "stats"]} min={1} max={8} itemName="Stat" addLabel="Add stat" make={() => ({ label: "", value: "" })}
        render={pair("Label", "label", LIMITS.short, "Value", "value", LIMITS.short)} />
      <T path={[...p, "notes"]} label="Notes" multiline />
      <Titled path={[...p, "warn"]} label="Warning" />
    </>
  ),
  button: (p) => (
    <>
      <T path={[...p, "label"]} label="Button text" max={LIMITS.button} />
      <Check path={[...p, "secondary"]} label="Secondary (outline) style" />
      <div style={{ ...hintStyle, marginTop: 0 }}>Store links come with the Shopify launch; for now the button shows but goes nowhere.</div>
    </>
  ),
  licence: (p) => <LicenceForm path={p} />,
  toggle: (p) => <ToggleForm path={p} />,
};

const ToggleForm = ({ path }) => {
  const { doc } = useEd();
  const options = getIn(doc, [...path, "options"]) || [];
  const keyFor = (n) => { const taken = new Set(options.map(o => o.key)); let k = n + 1; while (taken.has(`option-${k}`)) k += 1; return `option-${k}`; };
  return (
    <ItemList path={[...path, "options"]} min={2} max={4} itemName="View" addLabel="Add view" make={(n) => ({ key: keyFor(n), label: "", blocks: [] })}
      render={(ip) => (
        <>
          <T path={[...ip, "label"]} label="Switch label" max={LIMITS.short} />
          <BlockList path={[...ip, "blocks"]} nested />
        </>
      )} />
  );
};

// ─── A block, and a list of them ──────────────────────────────────
const BlockCard = ({ path, i, count, nested }) => {
  const { doc, update } = useEd();
  const [asking, setAsking] = useState(false);
  const listPath = path.slice(0, -1);
  const b = getIn(doc, path);
  const policy = blockPolicy(doc, listPath, i);
  const problem = checkBlock(b, nested ? 1 : 0);
  const list = getIn(doc, listPath);
  const name = BLOCK_LABELS[b.type] || b.type;
  return (
    <div data-testid="block" data-type={b.type} style={{ background: "white", border: `1px solid ${problem ? "rgba(139,32,32,0.35)" : N.line}`, borderRadius: 12, padding: "10px 12px 4px", marginBottom: 10 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8, flexWrap: "wrap" }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: N.muted }}>{i + 1}.</span>
        <span style={{ fontSize: 13, fontWeight: 700, flex: 1, minWidth: 120 }}>{name}</span>
        {problem && <span style={badge("red")} title={problem}>Needs attention</span>}
        <button type="button" aria-label={`Move ${name} ${i + 1} up`} disabled={!policy.canMove || i === 0} onClick={() => update(listPath, moveItem(list, i, -1))} style={arrowBtn(!policy.canMove || i === 0)}>↑</button>
        <button type="button" aria-label={`Move ${name} ${i + 1} down`} disabled={!policy.canMove || i === count - 1} onClick={() => update(listPath, moveItem(list, i, 1))} style={arrowBtn(!policy.canMove || i === count - 1)}>↓</button>
        {policy.canDelete && <button type="button" aria-label={`Delete ${name} ${i + 1}`} onClick={() => setAsking(true)} style={{ ...smallBtn("danger"), minHeight: 32 }}>Delete</button>}
      </div>
      {!policy.canDelete && policy.why && <div style={{ ...hintStyle, marginTop: -4, marginBottom: 8 }}>{policy.why}</div>}
      {asking && <Confirm tone="red" text={`Delete this ${name.toLowerCase()} block? You can still Discard before saving.`} yes="Delete block"
        onYes={() => { setAsking(false); update(listPath, removeAt(list, i)); }} onNo={() => setAsking(false)} />}
      {problem && <div style={{ ...errorText, marginTop: -4, marginBottom: 8 }}>Shape check: {problem}</div>}
      {FORMS[b.type] ? FORMS[b.type](path) : <div style={hintStyle}>This block type can't be edited here.</div>}
    </div>
  );
};

export const BlockList = ({ path, nested = false }) => {
  const { doc, update } = useEd();
  const blocks = getIn(doc, path) || [];
  const types = addableTypes(doc, { nested });
  const [pick, setPick] = useState(types[0]);
  const id = useId();
  return (
    <div data-testid={nested ? "nested-blocks" : "block-list"}>
      {blocks.length === 0 && <div style={{ ...hintStyle, marginBottom: 10 }}>No blocks yet.</div>}
      {blocks.map((_, i) => <BlockCard key={`${i}-${blocks[i].type}`} path={[...path, i]} i={i} count={blocks.length} nested={nested} />)}
      <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap", margin: "4px 0 12px" }}>
        <label htmlFor={id} style={{ fontSize: 12, fontWeight: 700 }}>Add a block</label>
        <select id={id} value={pick} onChange={(e) => setPick(e.target.value)} style={{ ...fieldInput(false), width: "auto", fontSize: 14, padding: "7px 8px" }}>
          {types.map(t => <option key={t} value={t}>{BLOCK_LABELS[t]}</option>)}
        </select>
        <button type="button" onClick={() => update(path, [...blocks, newBlock(pick)])} style={smallBtn("primary")}>Add</button>
      </div>
    </div>
  );
};

// ─── Identity ─────────────────────────────────────────────────────
export const IdentityForm = ({ categoryLabel }) => {
  const { doc, update } = useEd();
  const [badgeText, setBadgeText] = useState("");
  const badges = doc.badges || [];
  const badgeProblem = badgeText && badgeText.trim().length > LIMITS.badge ? `Too long (max ${LIMITS.badge} characters).` : badges.includes(badgeText.trim()) ? "Already there." : null;
  const addBadge = () => { const t = badgeText.trim(); if (!t || badgeProblem || badges.length >= LIMITS.badges) return; update(["badges"], [...badges, t]); setBadgeText(""); };
  const sortOk = Number.isInteger(doc.sortOrder);
  return (
    <div data-testid="identity-form">
      <div style={row2}>
        <Field label="Slug (fixed, D4)" value={doc.slug} disabled onChange={() => {}} hint="The app address, Shopify handle and URL; never changes." testId="slug-field" />
        <Field label="Category (fixed)" value={categoryLabel} disabled onChange={() => {}} />
      </div>
      <div style={row2}>
        <T path={["name"]} label="Name" max={LIMITS.name} testId="name-field" />
        <T path={["latin"]} label="Latin name" max={LIMITS.latin} />
      </div>
      <div style={row2}>
        <T path={["aka"]} label="Also known as (optional)" max={LIMITS.aka} optional />
        <Select path={["level"]} label="Level" options={LEVELS} />
      </div>
      <div style={row2}>
        <Field label="Sort order" type="number" value={doc.sortOrder} problem={sortOk ? null : "A whole number."}
          hint="Lower comes first in Browse and Search." onChange={(x) => update(["sortOrder"], x === "" || !/^-?\d+$/.test(x) ? x : Number(x))} />
      </div>
      <div style={labelStyle}>Badges (the pills over the photo; the first is orange)</div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
        {badges.map((b, i) => (
          <span key={`${b}-${i}`} style={{ display: "inline-flex", alignItems: "center", gap: 4, background: i === 0 ? C.greenPale : N.wash, color: i === 0 ? C.green : N.ink, borderRadius: 999, padding: "4px 4px 4px 10px", fontSize: 12, fontWeight: 700 }}>
            {b}
            <button type="button" aria-label={`Move badge ${b} earlier`} disabled={i === 0} onClick={() => update(["badges"], moveItem(badges, i, -1))} style={{ border: "none", background: "none", cursor: i === 0 ? "default" : "pointer", color: N.muted, minWidth: 28, minHeight: 28 }}>‹</button>
            <button type="button" aria-label={`Remove badge ${b}`} onClick={() => update(["badges"], removeAt(badges, i))} style={{ border: "none", background: "none", cursor: "pointer", color: C.red, minWidth: 28, minHeight: 28 }}>×</button>
          </span>
        ))}
      </div>
      {badges.length < LIMITS.badges && (
        <div style={{ display: "flex", gap: 6, alignItems: "flex-start" }}>
          <div style={{ flex: 1 }}><Field label="New badge" value={badgeText} problem={badgeProblem} onChange={setBadgeText} /></div>
          <button type="button" onClick={addBadge} style={{ ...smallBtn("ghost", !badgeText.trim() || Boolean(badgeProblem)), marginTop: 22 }}>Add badge</button>
        </div>
      )}
    </div>
  );
};

// ─── The preview can't take a half-typed block down with it ───────
export class PreviewBoundary extends Component {
  constructor(props) { super(props); this.state = { failed: false }; }
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidUpdate(prev) { if (prev.doc !== this.props.doc && this.state.failed) this.setState({ failed: false }); }
  render() {
    if (this.state.failed) return <div style={{ padding: 24, fontSize: 14, color: "#ccc", lineHeight: 1.6 }}>The preview can't show this yet. Fix the problems marked in the form.</div>;
    return this.props.children;
  }
}
