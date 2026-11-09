// ─── Line icons ──────────────────────────────────────────────────
// Inline SVG, 24 × 24 grid, stroked in currentColor, so a parent's `color`
// sets them and a restyle needs no new artwork. Tabs and sections name an
// icon by key in src/constants/sections.json. Unknown key → a plain dot.

const P = {
  home: <><path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V21h5v-6h4v6h5V9.5" /></>,
  learn: <><path d="M3 5.5c3-1.5 6-1.5 9 .5 3-2 6-2 9-.5V19c-3-1.5-6-1.5-9 .5-3-2-6-2-9-.5z" /><path d="M12 6v13.5" /></>,
  camera: <><path d="M4 8h3l2-3h6l2 3h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z" /><circle cx="12" cy="13.5" r="3.5" /></>,
  users: <><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20c.5-3.5 3.2-5.5 6.5-5.5s6 2 6.5 5.5" /><path d="M16 4.8a3.3 3.3 0 0 1 0 6.4" /><path d="M18 14.8c2 .7 3.2 2.5 3.5 5.2" /></>,
  user: <><circle cx="12" cy="8" r="4" /><path d="M4 21c.6-4 3.8-6.5 8-6.5s7.4 2.5 8 6.5" /></>,
  lizard: <><path d="M14.5 4.5c1.6 0 3 1.2 3 2.8 0 1.3-.9 2.2-2 2.6l-1 3.6c-.4 1.6-1.4 2.9-2.8 3.6L9 19c-1.7.8-3.6.6-5-.5" /><path d="M13 11l3 1.5M12 14.5l-3-1M14.6 9.9 12 8M11 16.4l1.5 3" /><circle cx="15.2" cy="6.6" r=".6" fill="currentColor" /></>,
  care: <><path d="M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7.4 4.3 4.3 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10z" /></>,
  scale: <><path d="M12 4v16M7 20h10M5 7h14" /><path d="m5 7-3 6a3 3 0 0 0 6 0zM19 7l-3 6a3 3 0 0 0 6 0z" /></>,
  glossary: <><path d="M6 3h11a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H6.5A2.5 2.5 0 0 1 4 18.5v-13A2.5 2.5 0 0 1 6.5 3z" /><path d="M4 18.5A2.5 2.5 0 0 1 6.5 16H18M8.5 7.5h6M8.5 10.5h4" /></>,
  search: <><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4.5 4.5" /></>,
  image: <><rect x="3" y="5" width="18" height="14" rx="1.5" /><circle cx="8.5" cy="10" r="1.5" /><path d="m21 16-5-5-8 8" /></>,
  binoculars: <><circle cx="6.5" cy="15.5" r="3.5" /><circle cx="17.5" cy="15.5" r="3.5" /><path d="M10 15.5h4M4 13l2-7h3l1 7.5M20 13l-2-7h-3l-1 7.5" /></>,
  ladder: <><path d="M4 20h4v-6H4zM10 20h4V9h-4zM16 20h4V4h-4z" /></>,
  trophy: <><path d="M8 4h8v5a4 4 0 0 1-8 0z" /><path d="M8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13v4M8.5 20h7M10 17h4" /></>,
  pin: <><path d="M12 21s-6.5-6-6.5-11a6.5 6.5 0 0 1 13 0c0 5-6.5 11-6.5 11z" /><circle cx="12" cy="10" r="2.3" /></>,
  star: <path d="m12 3.5 2.6 5.4 5.9.8-4.3 4.1 1 5.8-5.2-2.8-5.2 2.8 1-5.8-4.3-4.1 5.9-.8z" />,
  check: <><path d="M12 3 4.5 6v5.5c0 4.5 3.2 8 7.5 9.5 4.3-1.5 7.5-5 7.5-9.5V6z" /><path d="m8.5 12 2.5 2.5 4.5-5" /></>,
  cart: <><path d="M3 4h2.5l2.2 11h10.6L20.5 7H6.3" /><circle cx="9" cy="19" r="1.4" /><circle cx="17" cy="19" r="1.4" /></>,
  compass: <><circle cx="12" cy="12" r="8.5" /><path d="m15.5 8.5-2 5-5 2 2-5z" /></>,
  snake: <><path d="M5 19c2.5 0 3-2 3-4s.5-4 3-4 3 2 3 4-.5 4 2 4 3.5-2.5 3.5-5.5S18 7 15.5 5" /><path d="M15.5 5c-1.2-.9-2.8-.6-3.5.5" /><circle cx="15" cy="6.3" r=".5" fill="currentColor" /></>,
  bell: <><path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z" /><path d="M10 20.5a2 2 0 0 0 4 0" /></>,
  settings: <><circle cx="12" cy="12" r="3" /><path d="M12 2.8v2.4M12 18.8v2.4M2.8 12h2.4M18.8 12h2.4M5.5 5.5l1.7 1.7M16.8 16.8l1.7 1.7M5.5 18.5l1.7-1.7M16.8 7.2l1.7-1.7" /></>,
  sparkle: <path d="M12 3c.6 4.5 2.5 6.4 7 7-4.5.6-6.4 2.5-7 7-.6-4.5-2.5-6.4-7-7 4.5-.6 6.4-2.5 7-7z" />,
  build: <><path d="M3 20h18M5 20V9l7-5 7 5v11" /><path d="M9 20v-6h6v6" /></>,
  // Care guides (the dark design: line icons instead of emoji)
  thermo: <><path d="M10 13.5V5a2 2 0 0 1 4 0v8.5a4 4 0 1 1-4 0z" /><path d="M12 9v6.5" /></>,
  bug: <><ellipse cx="12" cy="13.5" rx="4" ry="5.5" /><path d="M12 8V5M9.5 5.5 8 3.5M14.5 5.5 16 3.5M8 11H4.5M8 15H4.5M16 11h3.5M16 15h3.5M12 8v11" /></>,
  hand: <><path d="M8 13V6.5a1.5 1.5 0 0 1 3 0V12M11 11.5V5a1.5 1.5 0 0 1 3 0v6.5M14 11.5V6.5a1.5 1.5 0 0 1 3 0V14c0 4-2.5 7-6 7-2.4 0-3.8-1-5-2.8L4 15.2a1.5 1.5 0 0 1 2.5-1.7L8 15" /></>,
  health: <><path d="M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7.4 4.3 4.3 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10z" /><path d="M8 12h2.5l1-2 2 4 1-2H16" /></>,
  enclosure: <><rect x="3" y="6" width="18" height="13" rx="1.5" /><path d="M3 15h18M7 15v-3l3-2 3 2v3" /></>,
  chevron: <path d="m9 6 6 6-6 6" />,
  phone: <path d="M5 4h3.5l1.5 4-2 1.5a11 11 0 0 0 6.5 6.5L16 14l4 1.5V19a1 1 0 0 1-1 1A16 16 0 0 1 4 5a1 1 0 0 1 1-1z" />,
  mail: <><rect x="3" y="5.5" width="18" height="13" rx="1.5" /><path d="m3.5 6.5 8.5 7 8.5-7" /></>,
  globe: <><circle cx="12" cy="12" r="8.5" /><path d="M3.5 12h17M12 3.5c2.5 2.6 3.5 5.4 3.5 8.5s-1 5.9-3.5 8.5c-2.5-2.6-3.5-5.4-3.5-8.5s1-5.9 3.5-8.5z" /></>,
  alert: <><path d="M12 3.5 21.5 20h-19z" /><path d="M12 10v4.5M12 17.2v.1" /></>,
};

// Care-guide emoji (in the page files and data/careGuides.js) → line icon.
export const CARE_ICON = { "🏠": "enclosure", "🌡️": "thermo", "🦗": "bug", "🤲": "hand", "🩺": "health", "✨": "sparkle" };

export const ICON_KEYS = Object.keys(P);

const Icon = ({ name, size = 24, strokeWidth = 1.8, style, title }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth}
    strokeLinecap="round" strokeLinejoin="round" style={{ display: "block", flexShrink: 0, ...style }}
    role={title ? "img" : undefined} aria-hidden={title ? undefined : "true"} aria-label={title}>
    {P[name] || <circle cx="12" cy="12" r="3" />}
  </svg>
);

export default Icon;
