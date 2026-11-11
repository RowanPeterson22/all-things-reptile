import { T } from "../constants/theme";
import SectionLabel from "./SectionLabel";
import WarnBox from "./WarnBox";
import StatGrid from "./StatGrid";

// Text from the species document (`breeding` block).
const SnakeBreeding = ({ label, stats = [], notes, warn }) => (
  <>
    <SectionLabel>{label}</SectionLabel>
    <StatGrid stats={stats.map(s => ["", s.label, s.value])} />
    <div style={{ background: T.card, borderRadius: 18, padding: 16, marginBottom: 10, marginTop: 8, fontSize: 14, color: T.body, lineHeight: 1.6 }}>
      {notes}
    </div>
    <WarnBox type="gold" title={warn.title}>{warn.text}</WarnBox>
  </>
);

export default SnakeBreeding;
