import SectionLabel from "./SectionLabel";
import WarnBox from "./WarnBox";
import HealthItem from "./HealthItem";

const SnakeShedding = ({ animal = "reptile" }) => (
  <>
    <SectionLabel mt={0}>Shedding basics</SectionLabel>
    <WarnBox type="blue" title="Signs a shed is coming">Eyes turn blue/milky, skin looks dull, behaviour changes (hiding more, reduced appetite, sometimes irritable). This pre-shed phase lasts 5–10 days.</WarnBox>
    <HealthItem dot="#4a9e6b" title="Good shed conditions" detail="Humidity at 60–70% during shed. Add a humid hide packed with damp sphagnum moss. A soak in shallow warm water helps if the snake seems stuck." />
    <HealthItem title="Stuck shed (dysecdysis)" detail="Stuck shed around eyes (spectacles) or tail tip is the most common issue. Soak the snake in shallow warm water for 20–30 mins, then gently roll the shed off with a damp cloth. Never pull forcefully." />
    <HealthItem title="Retained eye caps" detail="If spectacles don't come off with the shed, do not attempt to remove them yourself — see a reptile vet. Retained eye caps can cause permanent eye damage." />
    <WarnBox type="green" title='Never handle during a shed'>Leave your {animal} alone while it's in shed. They're vulnerable, often irritable, and have reduced vision. Wait until 2–3 days after the shed is complete.</WarnBox>
  </>
);

export default SnakeShedding;
