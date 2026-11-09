import { T } from "../constants/theme";
import ScrollRow from "./ScrollRow";

// ─── Segmented tab control ───────────────────────────────────────
// A dark pill track with the active segment raised (#2A2A2A). Segments grow to
// fill the track and never shrink below their label; when the labels don't
// fit (long care-guide tabs, a 320px phone) the track scrolls sideways with
// ScrollRow's fade and chevron. Each segment is a 44px tap target.
// Labels are sentence case (first letter up) unless labelFor says otherwise.

export const sentence = (t) => (t ? t[0].toUpperCase() + t.slice(1) : t);

const Segmented = ({ tabs, tab, onTab, labelFor = sentence, label = "Sections", testId }) => (
  <ScrollRow tone="ink" label={label} role="group" aria-label={label} data-testid={testId}
    style={{ display: "flex", gap: 2, background: T.seg, borderRadius: 14, padding: 4 }}>
    {tabs.map(t => {
      const on = t === tab;
      return (
        <button key={t} type="button" onClick={() => onTab(t)} aria-pressed={on}
          style={{ flex: "1 0 auto", border: "none", borderRadius: 10, fontFamily: "inherit", fontSize: 13, minHeight: 44, padding: "0 12px", cursor: "pointer", whiteSpace: "nowrap",
            background: on ? T.segOn : "transparent", color: on ? T.text : T.muted, fontWeight: on ? 700 : 600 }}>
          {labelFor(t)}
        </button>
      );
    })}
  </ScrollRow>
);

export default Segmented;
