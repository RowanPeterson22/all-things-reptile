import { C } from "../constants/colours";

const LevelBadge = ({ level }) => {
  const s = { Beginner: { bg: C.greenPale, color: C.green }, Intermediate: { bg: C.goldLight, color: "#7a5a1e" }, Advanced: { bg: C.redPale, color: C.red } }[level] || { bg: C.greenPale, color: C.green };
  return <span style={{ background: s.bg, color: s.color, fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 10, display: "inline-block" }}>{level}</span>;
};

export default LevelBadge;
