import { UI } from "../components/appUi";
import { Card, IconBadge, SectionHeading, TileGrid } from "../components/SectionTiles";
import Icon from "../components/Icon";

// ─── Community (/community) and My Profile (/profile) ─────────────
// Under the shell's big page title (the tab's name): a line about the tab,
// then its sections as tiles. My Profile leads with "Planning your first reptile?" for now, since
// nobody has animals in the app yet. Look: ../components/appUi.js.

const INTRO = {
  community: "Sightings, competitions and places to see reptiles, from keepers around Australia.",
  profile: "Your own corner of All Things Reptile.",
};

const TabPage = ({ tab, items, onOpen, onEditHome }) => (
  <div data-testid={`tab-page-${tab.key}`} style={{ flex: 1 }}>
    <div style={{ padding: `0 ${UI.pad}px ${UI.pad}px` }}>
      <p style={{ margin: `0 0 ${UI.blockGap}px`, fontSize: 15, color: UI.body, lineHeight: 1.55 }}>{INTRO[tab.key]}</p>
      {tab.key === "profile" && (
        <Card data-testid="planning-intro" style={{ padding: 16, marginBottom: UI.blockGap, display: "flex", gap: 14, borderRadius: 18 }}>
          <IconBadge name="compass" tone="accent" />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: UI.ink, marginBottom: 4 }}>Planning your first reptile?</div>
            <div style={{ fontSize: 14, color: UI.body, lineHeight: 1.55 }}>Start here. Shortlist a few species, check what your state lets you keep, and see what the set-up takes before you buy. Your animals, reminders and lists will live here too.</div>
          </div>
        </Card>
      )}
      {onEditHome && (
        <button type="button" data-testid="edit-home" onClick={onEditHome}
          style={{ width: "100%", background: UI.cardBg, border: "none", borderRadius: 18, padding: 16, marginBottom: UI.blockGap, display: "flex", alignItems: "center", gap: 14, cursor: "pointer", textAlign: "left", fontFamily: UI.font }}>
          <IconBadge name="home" />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: UI.ink, marginBottom: 2 }}>Customise Home</div>
            <div style={{ fontSize: 13, color: UI.muted, lineHeight: 1.45 }}>Choose which tiles your Home screen shows, and their order.</div>
          </div>
          <span aria-hidden="true" style={{ color: UI.muted }}><Icon name="chevron" size={18} /></span>
        </button>
      )}
      <SectionHeading>{tab.key === "profile" ? "Tools" : `In ${tab.label}`}</SectionHeading>
      <TileGrid testId={`tab-grid-${tab.key}`} items={items} onOpen={(i) => onOpen(i.path)} />
    </div>
  </div>
);

export default TabPage;
