import { C } from "../constants/colours";
import BackButton from "./BackButton";
import ScrollRow from "./ScrollRow";

// ─── Care guide header ───────────────────────────────────────────
// The orange header shared by the care guide pages: back link, title block
// and section tabs. With an emoji the title sits beside it; without one
// (Feeder Guide) it stacks with a longer description.
// Text on the brand orange is white or near-white: the old gold eyebrow
// (1.5:1) and 55–60% white (2.2–2.4:1) were hard to read outdoors.
// Tabs are 41px tall.

const CareGuideHeader = ({ onBack, emoji, title, subtitle, tabs, tab, onTab, labelFor }) => (
  <div style={{ background: C.green, padding: `calc(env(safe-area-inset-top, 0px) + ${emoji ? 10 : 20}px) 20px 0` }}>
    <BackButton onClick={onBack} marginBottom={16}>‹ Back to care guides</BackButton>
    {emoji ? (
      <div style={{ display: "flex", alignItems: "flex-end", gap: 14 }}>
        <div style={{ fontSize: 64, lineHeight: 1, marginBottom: -4 }}>{emoji}</div>
        <div style={{ paddingBottom: 18 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.85)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 4 }}>Care guide</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: "white", lineHeight: 1.2 }}>{title}</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.9)", marginTop: 3 }}>{subtitle}</div>
        </div>
      </div>
    ) : (
      <>
        <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.85)", letterSpacing: "0.07em", marginBottom: 4 }}>CARE GUIDE</div>
        <div style={{ fontSize: 22, fontWeight: 700, color: "white", marginBottom: 4 }}>{title}</div>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.9)", marginBottom: 16, lineHeight: 1.5 }}>{subtitle}</div>
      </>
    )}
    <ScrollRow tone="dark" label="Sections" style={{ display: "flex", borderBottom: "0.5px solid rgba(255,255,255,0.2)", margin: "0 -20px", padding: "0 20px", gap: 4, overflowX: "auto", scrollbarWidth: "none" }}>
      {tabs.map(t => (
        <button key={t} onClick={() => onTab(t)} aria-pressed={tab === t} style={{ background: "none", border: "none", borderBottom: tab === t ? "2px solid #fff" : "2px solid transparent", color: tab === t ? "white" : "rgba(255,255,255,0.8)", fontSize: 12, fontWeight: 700, padding: "12px 12px", cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap", marginBottom: -1, textTransform: labelFor ? "none" : "capitalize" }}>{labelFor ? labelFor(t) : t}</button>
      ))}
    </ScrollRow>
  </div>
);

export default CareGuideHeader;
