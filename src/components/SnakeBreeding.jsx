import { C } from "../constants/colours";
import SectionLabel from "./SectionLabel";
import WarnBox from "./WarnBox";
import StatGrid from "./StatGrid";

const SnakeBreeding = ({ clutchSize, incubationTemp, incubationDays, maturityAge, notes }) => (
  <>
    <SectionLabel mt={0}>Breeding basics</SectionLabel>
    <StatGrid stats={[["🥚", "Clutch size", clutchSize], ["🌡️", "Incubation temp", incubationTemp], ["📅", "Incubation", incubationDays], ["🎂", "Sexual maturity", maturityAge]]} />
    <div style={{ background: C.cream, borderRadius: 12, border: "0.5px solid #e8e8e4", padding: "12px 14px", marginBottom: 8, marginTop: 8, fontSize: 13, color: "#666", lineHeight: 1.7 }}>
      {notes}
    </div>
    <WarnBox type="gold" title="Licence requirements for breeding">Breeding native reptiles requires a separate breeder licence in most states. Check with your local wildlife authority before attempting to breed.</WarnBox>
  </>
);

export default SnakeBreeding;
