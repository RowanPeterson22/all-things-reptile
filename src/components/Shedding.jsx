import SectionLabel from "./SectionLabel";
import WarnBox from "./WarnBox";
import HealthItem from "./HealthItem";

// ─── Shedding basics (species pages) ──────────────────────────────
// Content comes from the species document (a `shedding` block): snakes,
// lizards, geckos, monitors and frogs each have their own text. Layout as
// before: label, the blue "signs" card, the good-conditions row, the problem
// rows, then the green warning.
const Shedding = ({ label, signs, good, problems = [], warn }) => (
  <>
    <SectionLabel mt={0}>{label}</SectionLabel>
    <WarnBox type="blue" title={signs.title}>{signs.text}</WarnBox>
    <HealthItem dot="#4a9e6b" title={good.title} detail={good.text} />
    {problems.map(p => <HealthItem key={p.title} title={p.title} detail={p.text} />)}
    <WarnBox type="green" title={warn.title}>{warn.text}</WarnBox>
  </>
);

export default Shedding;
