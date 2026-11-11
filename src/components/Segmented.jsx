import { T } from "../constants/theme";
import ScrollRow from "./ScrollRow";

// ─── Segmented tab control ───────────────────────────────────────
// A dark pill track with the active segment raised (#2A2A2A). Segments grow to
// fill the track and never shrink below their label; when the labels don't
// fit (long care-guide tabs, a 320px phone) the track scrolls sideways with
// ScrollRow's fade and chevron. Each segment is a 44px tap target.
// Labels are sentence case (first letter up) unless labelFor says otherwise.
// 14 px text, 4 px side padding: the design's five species tabs fit in one
// row from 375 px; longer sets scroll.
// Rowan (11 Nov 2026): this is the look for every sub-menu row in the app
// (species and care tabs, the Learn sub-nav, the Glossary's categories).
// SEG exports the track and segment styles for rows that need their own
// markup (LearnNav: tabs with aria-selected). padX widens the segments for
// long sets that will scroll anyway.

export const SEG = {
  track: { display: "flex", gap: 2, background: T.seg, borderRadius: 14, padding: 4 },
  item: (on, padX = 4) => ({ flex: "1 0 auto", border: "none", borderRadius: 10, fontFamily: "inherit", fontSize: 14, minHeight: 44, padding: `0 ${padX}px`, cursor: "pointer", whiteSpace: "nowrap",
    background: on ? T.segOn : "transparent", color: on ? T.text : T.muted, fontWeight: on ? 700 : 600 }),
};

export const sentence = (t) => (t ? t[0].toUpperCase() + t.slice(1) : t);

const Segmented = ({ tabs, tab, onTab, labelFor = sentence, label = "Sections", testId, padX = 4 }) => (
  <ScrollRow tone="ink" label={label} role="group" aria-label={label} data-testid={testId}
    style={SEG.track}>
    {tabs.map(t => {
      const on = t === tab;
      return (
        <button key={t} type="button" onClick={() => onTab(t)} aria-pressed={on}
          style={SEG.item(on, padX)}>
          {labelFor(t)}
        </button>
      );
    })}
  </ScrollRow>
);

export default Segmented;
