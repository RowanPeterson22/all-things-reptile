import { T } from "../constants/theme";
import SectionLabel from "./SectionLabel";
import WarnBox from "./WarnBox";
import StatGrid from "./StatGrid";

const SnakeBreeding = ({ clutchSize, incubationTemp, incubationDays, maturityAge, notes }) => (
  <>
    <SectionLabel>Breeding basics</SectionLabel>
    <StatGrid stats={[["", "Clutch size", clutchSize], ["", "Incubation temp", incubationTemp], ["", "Incubation", incubationDays], ["", "Sexual maturity", maturityAge]]} />
    <div style={{ background: T.card, borderRadius: 18, padding: 16, marginBottom: 10, marginTop: 8, fontSize: 14, color: T.body, lineHeight: 1.6 }}>
      {notes}
    </div>
    <WarnBox type="gold" title="Licence requirements for breeding">Breeding native reptiles requires a separate breeder licence in most states. Check with your local wildlife authority before attempting to breed.</WarnBox>
  </>
);

export default SnakeBreeding;
