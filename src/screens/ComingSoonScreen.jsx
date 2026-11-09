import { UI } from "../components/appUi";
import BackButton from "../components/BackButton";
import { Card, IconBadge, StatusBadge } from "../components/SectionTiles";

// ─── Coming soon page ─────────────────────────────────────────────
// Every placeholder section's route (e.g. /community/sightings), and a built
// section's route while /admin → Sections has it set to Coming soon.
// Sits under the shell's big page title (the tab's name). Look: appUi.js.

const ComingSoonScreen = ({ item, backLabel, onBack }) => (
  <div data-testid="coming-soon" style={{ flex: 1 }}>
    <div style={{ padding: `0 ${UI.pad}px` }}>
      <BackButton onClick={onBack} marginBottom={14}>‹ {backLabel}</BackButton>
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: UI.blockGap }}>
        <IconBadge name={item.icon} size={48} tone="accent" />
        <div style={{ minWidth: 0 }}>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: UI.ink, lineHeight: 1.2, overflowWrap: "break-word" }}>{item.title}</h2>
          <div style={{ fontSize: 14, color: UI.body, lineHeight: 1.45, marginTop: 3 }}>{item.blurb}</div>
        </div>
      </div>
    </div>
    <div style={{ padding: `0 ${UI.pad}px ${UI.pad}px` }}>
      <Card style={{ padding: "28px 20px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", borderRadius: 18 }}>
        <div style={{ marginBottom: 12 }}><IconBadge name="build" size={52} /></div>
        <div style={{ fontSize: 17, fontWeight: 700, color: UI.ink, marginBottom: 6 }}>Coming soon</div>
        <div style={{ fontSize: 14, color: UI.muted, lineHeight: 1.6, maxWidth: 280 }}>We're building this now. It'll appear here as soon as it's ready.</div>
        {item.status === "hidden" && <div style={{ marginTop: 12 }}><StatusBadge status="hidden" /></div>}
      </Card>
    </div>
  </div>
);

export default ComingSoonScreen;
