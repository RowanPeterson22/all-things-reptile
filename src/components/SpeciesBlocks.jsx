import { T } from "../constants/theme";
import SectionLabel from "./SectionLabel";
import WarnBox from "./WarnBox";
import BaskingBanner from "./BaskingBanner";
import ShopBtn from "./ShopBtn";
import TempBar, { TempCard } from "./TempBar";
import FoodItem, { FOOD_CARD } from "./FoodItem";
import HealthItem from "./HealthItem";
import StatGrid from "./StatGrid";
import LegalTab from "./LegalTab";
import Shedding from "./Shedding";
import SnakeHandling from "./SnakeHandling";
import SnakeBreeding from "./SnakeBreeding";
import { licenceText } from "../data/speciesContentShape";

// ─── Species page content: blocks → the shared components ─────────
// One renderer for every species page. Each block type maps onto the
// component (and inline styles) the 46 JSX pages used, so the output is the
// same markup they produced. The shape is documented in
// src/data/speciesContentShape.js. Unknown block types render nothing.

const GOOD = "#4a9e6b"; // HealthItem's "good" dot

const TEXT = (mb = 14) => ({ fontSize: 15, color: T.body, lineHeight: 1.6, marginBottom: mb });
const CARD = { background: T.card, borderRadius: 14, padding: "12px 14px", border: "none", fontSize: 15, color: T.body, lineHeight: 1.7 };
const BITE = { red: [T.noBg, T.no], orange: [T.chipBg, T.chip], accent: [T.chipBg, T.accentText] };

// The age toggle (Bearded Dragon feeding): a segmented pair of buttons, then
// the chosen option's blocks. `value`/`onChange` come from the page so the
// choice survives switching tabs.
const Toggle = ({ block, value, onChange, render }) => {
  const on = block.options.find(o => o.key === value) || block.options[0];
  return (
    <>
      <div style={{ display: "flex", background: T.card, borderRadius: 14, padding: 3, border: "none", marginBottom: 14 }}>
        {block.options.map(o => (
          <button key={o.key} onClick={() => onChange(o.key)} style={{ flex: 1, padding: 7, border: "none", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", background: on.key === o.key ? T.segOn : "none", color: on.key === o.key ? T.text : T.muted, minHeight: 44 }}>{o.label}</button>
        ))}
      </div>
      {render(on.blocks)}
    </>
  );
};

const Block = ({ b, toggles }) => {
  switch (b.type) {
    case "text": return <p style={TEXT(b.mb)}>{b.text}</p>;
    case "label": return <SectionLabel mt={b.mt}>{b.text}</SectionLabel>;
    case "stats": return <StatGrid stats={b.items.map(i => ["", i.label, i.value])} />;
    case "basking": return <BaskingBanner range={b.range} title={b.title}>{b.text}</BaskingBanner>;
    case "temps": return <TempCard>{b.bars.map(r => <TempBar key={r.label} label={r.label} value={r.value} width={r.width} />)}</TempCard>;
    case "card": return <div style={CARD}>{b.text}</div>;
    case "warn": return <WarnBox type={b.tone} title={b.title}>{b.text}</WarnBox>;
    case "bite": {
      const [bg, fg] = BITE[b.tone] || BITE.orange;
      return (
        <div style={{ background: bg, borderRadius: 14, padding: "12px 14px", marginBottom: 12, border: "none" }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: fg, marginBottom: 6 }}>{b.heading}</div>
          <div style={{ fontSize: 15, color: T.body, lineHeight: 1.6 }}>{b.text}</div>
        </div>
      );
    }
    case "food": return <div style={FOOD_CARD}>{b.items.map((f, i) => <FoodItem key={i} name={f.name} detail={f.detail} freq={f.freq} />)}</div>;
    case "health": return <>{b.items.map((h, i) => <HealthItem key={i} dot={h.good ? GOOD : undefined} title={h.title} detail={h.detail} />)}</>;
    case "mistakes": return <>{b.items.map((m, i) => (
      <div key={i} style={{ background: T.card, borderRadius: 14, border: "none", padding: "12px 14px", marginBottom: 8, display: "flex", gap: 10 }}>
        <div style={{ width: 22, height: 22, borderRadius: "50%", background: T.noBg, color: T.no, fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>{i + 1}</div>
        <div><div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{m.title}</div><div style={{ fontSize: 13, color: T.muted, lineHeight: 1.6 }}>{m.detail}</div></div>
      </div>
    ))}</>;
    case "shedding": return <Shedding label={b.label} signs={b.signs} good={b.good} problems={b.problems} warn={b.warn} />;
    case "snakeHandling": return <SnakeHandling biteRisk={b.risk} notes={b.notes} tipsLabel={b.tipsLabel} tipsTitle={b.tipsTitle} tips={b.tips} warn={b.warn} />;
    case "breeding": return <SnakeBreeding label={b.label} stats={b.stats} notes={b.notes} warn={b.warn} />;
    // Store links come later (target); for now the buttons look as they did and do nothing.
    case "button": return <ShopBtn secondary={b.secondary === true}>{b.label}</ShopBtn>;
    case "licence": return <LegalTab note={b.note} states={b.states.map(s => ({ abbr: s.abbr, cat: licenceText(s), ok: s.ok }))} />;
    default: return null;
  }
};

// blocks: one tab's list. toggles: { get(i), set(i, key) } keyed by position.
const SpeciesBlocks = ({ blocks, toggles, path = "" }) => (
  <>
    {blocks.map((b, i) => {
      const id = `${path}${i}`;
      if (b.type === "toggle") {
        return <Toggle key={id} block={b} value={toggles.get(id)} onChange={(k) => toggles.set(id, k)}
          render={(inner) => <SpeciesBlocks blocks={inner} toggles={toggles} path={`${id}.`} />} />;
      }
      return <Block key={id} b={b} toggles={toggles} />;
    })}
  </>
);

export default SpeciesBlocks;
