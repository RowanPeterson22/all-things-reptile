import { T } from "../constants/theme";

const SectionLabel = ({ children, mt = 16 }) => (
  <div style={{ fontSize: 13, fontWeight: 700, color: T.muted, marginTop: mt, marginBottom: 10, lineHeight: 1.35 }}>{children}</div>
);

export default SectionLabel;
