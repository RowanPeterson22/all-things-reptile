import { T } from "../constants/theme";

const LOOK = {
  Beginner: { bg: T.okBg, color: T.ok },
  Intermediate: { bg: T.chipBg, color: T.chip },
  Advanced: { bg: T.noBg, color: T.no },
};

const LevelBadge = ({ level }) => {
  const s = LOOK[level] || LOOK.Beginner;
  return <span style={{ background: s.bg, color: s.color, fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 999, display: "inline-block", lineHeight: 1.4 }}>{level}</span>;
};

export default LevelBadge;
