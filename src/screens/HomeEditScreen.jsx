import { T } from "../constants/theme";
import { UI } from "../components/appUi";
import BackButton from "../components/BackButton";
import Icon from "../components/Icon";
import { Card, IconBadge } from "../components/SectionTiles";
import { arrangeTiles, isCustomised } from "../home/homePrefs";

// ─── Customise Home (/profile/home) ───────────────────────────────
// Every tile Home can show for this visitor, in their order: a switch to show
// or hide it on Home, and ↑/↓ to move it. Changes apply straight away; Reset
// puts Home back to the default set and order. See ../home/homePrefs.js.

const SmallBtn = ({ label, onClick, disabled, children }) => (
  <button type="button" aria-label={label} title={label} onClick={onClick} disabled={disabled}
    style={{ width: 40, height: 44, border: "none", borderRadius: 12, background: "transparent", color: disabled ? T.dotIdle : T.text, display: "flex", alignItems: "center", justifyContent: "center", padding: 0, cursor: disabled ? "default" : "pointer", flexShrink: 0 }}>
    {children}
  </button>
);

const Switch = ({ on, label, onChange }) => (
  <button type="button" role="switch" aria-checked={on} aria-label={label} onClick={() => onChange(!on)}
    style={{ width: 52, height: 44, border: "none", background: "none", padding: 0, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
    <span aria-hidden="true" style={{ position: "relative", width: 44, height: 26, borderRadius: 13, background: on ? T.accent : T.track, transition: "background 0.15s" }}>
      <span style={{ position: "absolute", top: 3, left: on ? 21 : 3, width: 20, height: 20, borderRadius: 10, background: on ? T.onAccent : T.muted, transition: "left 0.15s" }} />
    </span>
  </button>
);

const HomeEditScreen = ({ tiles, prefs, onChange, onReset, backLabel, onBack }) => {
  const list = arrangeTiles(tiles, prefs);
  const shownCount = list.filter(t => t.shown).length;
  const commit = (next) => onChange({ order: next.map(t => t.key), hidden: next.filter(t => !t.shown).map(t => t.key) });
  const move = (i, d) => { const next = [...list]; const [t] = next.splice(i, 1); next.splice(i + d, 0, t); commit(next); };
  const toggle = (i, on) => commit(list.map((t, j) => (j === i ? { ...t, shown: on } : t)));

  return (
    <div data-testid="home-edit" style={{ flex: 1 }}>
      <div style={{ padding: `0 ${UI.pad}px ${UI.pad}px` }}>
        <BackButton onClick={onBack} marginBottom={14}>‹ {backLabel}</BackButton>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 8 }}>
          <IconBadge name="home" size={48} tone="accent" />
          <div style={{ minWidth: 0 }}>
            <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: UI.ink, lineHeight: 1.2 }}>Customise Home</h2>
            <div style={{ fontSize: 14, color: UI.body, lineHeight: 1.45, marginTop: 3 }}>Choose the tiles on your Home screen and their order.</div>
          </div>
        </div>
        <p style={{ margin: `0 0 ${UI.blockGap}px`, fontSize: 13, color: UI.muted, lineHeight: 1.55 }}>
          Showing {shownCount} of {list.length}. Everything stays in the menu and the tabs either way. Saved on this device for now; it will follow your ATR login once accounts arrive.
        </p>
        <Card style={{ padding: "4px 8px 4px 12px", borderRadius: 18 }}>
          <ul data-testid="home-edit-list" style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {list.map((t, i) => (
              <li key={t.key} data-testid={`home-edit-${t.key}`} style={{ display: "flex", alignItems: "center", gap: 4, minHeight: 60, borderBottom: i < list.length - 1 ? `1px solid ${T.rule}` : "none", opacity: t.shown ? 1 : 0.6 }}>
                {/* No icon or pill here: at 320 px the name needs the room beside
                    the three controls; the status is a small line under it. */}
                <div style={{ flex: 1, minWidth: 0, padding: "8px 0" }}>
                  <div style={{ fontSize: 15, fontWeight: 600, color: UI.ink, overflowWrap: "break-word", lineHeight: 1.3 }}>{t.title}</div>
                  {(t.status === "soon" || t.status === "hidden") && <div style={{ fontSize: 12, fontWeight: 700, color: t.status === "hidden" ? T.no : T.chip, marginTop: 2 }}>{t.status === "hidden" ? "Hidden" : "Coming soon"}</div>}
                </div>
                <SmallBtn label={`Move ${t.title} up`} onClick={() => move(i, -1)} disabled={i === 0}><Icon name="chevron" size={18} strokeWidth={2.2} style={{ transform: "rotate(-90deg)" }} /></SmallBtn>
                <SmallBtn label={`Move ${t.title} down`} onClick={() => move(i, 1)} disabled={i === list.length - 1}><Icon name="chevron" size={18} strokeWidth={2.2} style={{ transform: "rotate(90deg)" }} /></SmallBtn>
                <Switch on={t.shown} label={`Show ${t.title} on Home`} onChange={(on) => toggle(i, on)} />
              </li>
            ))}
          </ul>
        </Card>
        {isCustomised(prefs) && (
          <button type="button" data-testid="home-edit-reset" onClick={onReset}
            style={{ marginTop: 16, minHeight: 44, padding: "0 18px", border: "none", borderRadius: 14, background: T.card, color: T.text, fontSize: 14, fontWeight: 700, fontFamily: "inherit", cursor: "pointer" }}>
            Reset to the default Home
          </button>
        )}
      </div>
    </div>
  );
};

export default HomeEditScreen;
