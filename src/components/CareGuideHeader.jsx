import { T } from "../constants/theme";
import BackButton from "./BackButton";
import Segmented from "./Segmented";
import { IconBadge } from "./SectionTiles";
import { CARE_ICON } from "./Icon";

// ─── Care guide header ───────────────────────────────────────────
// The dark design: back link, a line-icon badge (the page's emoji mapped to a
// line icon), "Care guide", the big title and subtitle, then the segmented
// section tabs. Without an emoji (Feeder Guide) the title stands alone.

const CareGuideHeader = ({ onBack, emoji, title, subtitle, tabs, tab, onTab, labelFor }) => (
  <div style={{ background: T.bg, padding: "calc(env(safe-area-inset-top, 0px) + 14px) 16px 0" }}>
    <BackButton onClick={onBack} marginBottom={14}>‹ Back to care guides</BackButton>
    <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 16 }}>
      {emoji && CARE_ICON[emoji] && <div style={{ marginTop: 4 }}><IconBadge name={CARE_ICON[emoji]} size={48} tone="accent" /></div>}
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Care guide</div>
        <h1 style={{ margin: 0, fontSize: "clamp(26px, 8vw, 30px)", fontWeight: 700, color: T.text, lineHeight: 1.12, letterSpacing: "-0.01em", overflowWrap: "break-word" }}>{title}</h1>
        <div style={{ fontSize: 14, color: T.body, marginTop: 6, lineHeight: 1.5 }}>{subtitle}</div>
      </div>
    </div>
    <Segmented tabs={tabs} tab={tab} onTab={onTab} labelFor={labelFor} testId="guide-tabs" />
  </div>
);

export default CareGuideHeader;
