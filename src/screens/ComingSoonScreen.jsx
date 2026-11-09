import { UI } from "../components/appUi";
import BackButton from "../components/BackButton";
import { Card, IconBadge, StatusBadge } from "../components/SectionTiles";

// ─── Coming soon page ─────────────────────────────────────────────
// Every placeholder section's route (e.g. /community/sightings), and a built
// section's route while /admin → Sections has it set to Coming soon.
// Look: ../components/appUi.js.

const ComingSoonScreen = ({ item, backLabel, onBack }) => (
  <div data-testid="coming-soon" style={{ flex: 1, overflowY: "auto" }}>
    <div style={{ background: UI.band, padding: "14px 18px 0" }}>
      <BackButton onClick={onBack} marginBottom={12}>‹ {backLabel}</BackButton>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
        <IconBadge name={item.icon} size={48} tone="onAccent" />
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: UI.onAccent }}>{item.title}</div>
          <div style={{ fontSize: 12, color: UI.onAccentSoft, lineHeight: 1.45 }}>{item.blurb}</div>
        </div>
      </div>
    </div>
    <div style={{ padding: UI.pad }}>
      <Card style={{ padding: "26px 20px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ marginBottom: 12 }}><IconBadge name="build" size={52} /></div>
        <div style={{ fontSize: 17, fontWeight: 700, color: UI.ink, marginBottom: 6 }}>Coming soon</div>
        <div style={{ fontSize: 13, color: UI.muted, lineHeight: 1.6, maxWidth: 280 }}>We're building this now. It'll appear here as soon as it's ready.</div>
        {item.status === "hidden" && <div style={{ marginTop: 12 }}><StatusBadge status="hidden" /></div>}
      </Card>
    </div>
  </div>
);

export default ComingSoonScreen;
