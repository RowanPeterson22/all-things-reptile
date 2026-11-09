import { UI } from "../components/appUi";
import { Card, IconBadge, SectionHeading, TileGrid } from "../components/SectionTiles";

// ─── Community (/community) and My Profile (/profile) ─────────────
// A band with the tab's name and a line about it, then its sections as
// tiles. My Profile leads with "Planning your first reptile?" for now, since
// nobody has animals in the app yet. Look: ../components/appUi.js.

const INTRO = {
  community: "Sightings, competitions and places to see reptiles, from keepers around Australia.",
  profile: "Your own corner of All Things Reptile.",
};

const TabPage = ({ tab, items, onOpen }) => (
  <div data-testid={`tab-page-${tab.key}`} style={{ flex: 1, overflowY: "auto" }}>
    <div style={{ background: UI.band, padding: "16px 18px 18px" }}>
      <div style={{ fontSize: 20, fontWeight: 700, color: UI.onAccent, marginBottom: 4 }}>{tab.label}</div>
      <div style={{ fontSize: 12, color: UI.onAccentSoft, lineHeight: 1.5 }}>{INTRO[tab.key]}</div>
    </div>
    <div style={{ padding: UI.pad }}>
      {tab.key === "profile" && (
        <Card data-testid="planning-intro" style={{ padding: 14, marginBottom: UI.blockGap, display: "flex", gap: 12 }}>
          <IconBadge name="compass" tone="accent" />
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: UI.ink, marginBottom: 4 }}>Planning your first reptile?</div>
            <div style={{ fontSize: 12, color: UI.body, lineHeight: 1.55 }}>Start here. Shortlist a few species, check what your state lets you keep, and see what the set-up takes before you buy. Your animals, reminders and lists will live here too.</div>
          </div>
        </Card>
      )}
      <SectionHeading>{tab.key === "profile" ? "Tools" : `In ${tab.label}`}</SectionHeading>
      <TileGrid testId={`tab-grid-${tab.key}`} items={items} onOpen={(i) => onOpen(i.path)} />
    </div>
  </div>
);

export default TabPage;
