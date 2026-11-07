import { C } from "../../../constants/colours";
import SectionLabel from "../../../components/SectionLabel";
import WarnBox from "../../../components/WarnBox";
import ShopBtn from "../../../components/ShopBtn";
import TempBar from "../../../components/TempBar";
import FoodItem from "../../../components/FoodItem";
import HealthItem from "../../../components/HealthItem";
import StatGrid from "../../../components/StatGrid";
import LegalTab from "../../../components/LegalTab";
import SpeciesPage from "../../../components/SpeciesPage";

// ─── Murray River Turtle page ─────────────────────────────────────
const MurrayRiverTurtlePage = ({ onBack }) => (
  <SpeciesPage onBack={onBack} name="Murray River Turtle" latin="Emydura macquarii" emoji="🐢"
    badges={[["Intermediate", C.goldLight, "#7a5a1e"], ["Australian native", C.bluePale, C.blue], ["Aquatic", C.greenPale, C.green]]}
    tabs={["overview","feeding","health & setup","handling","licencing"]}
    tabContent={(tab) => <>
      {tab === "overview" && <>
        <p style={{fontSize:13,color:"#666",lineHeight:1.6,marginBottom:14}}>A robust, active turtle from the Murray-Darling river system. Unlike the Long-necked Turtle, the Murray River Turtle has a shorter, more typical neck — they are a side-necked turtle (Pleurodire) that folds their neck sideways rather than retracting it back. Active swimmers and entertaining to watch. More tolerant of cooler water temperatures than many turtle species.</p>
        <SectionLabel mt={0}>Quick stats</SectionLabel>
        <StatGrid stats={[["📏","Shell length","22–30 cm"],["⏳","Lifespan","30–40+ yrs"],["🏠","Min. tank","300L+"],["💧","Water temp","16–22°C"]]} />
        <WarnBox type="blue" title="Cooler water preferred">Murray River Turtles are from a cooler climate river system. They prefer cooler water temperatures (16–22°C) than tropical species. A water heater may not be needed in most Australian homes — avoid overheating their water.</WarnBox>
        <SectionLabel>Tank setup</SectionLabel>
        <div style={{background:C.cream,borderRadius:12,padding:"12px 14px",border:"0.5px solid #e8e8e4",fontSize:13,color:"#666",lineHeight:1.7}}>A 300L+ tank for one adult. Large basking platform above waterline with heat lamp and UVB. High-quality canister filtration. Regular weekly water changes. They are active swimmers so depth and open swimming space is important. Can tolerate cooler winter temperatures — this is natural and good for their long-term health.</div>
        <TempBar label="Basking spot (air temp)" value="26–30°C" width="58%" color="#e05a2b"/>
        <TempBar label="Water temperature" value="16–22°C" width="32%" color="#2b7ec0"/>
        <ShopBtn>🛒 Shop turtle supplies</ShopBtn>
        <ShopBtn secondary>Ask a question ↗</ShopBtn>
      </>}
      {tab === "feeding" && <>
        <p style={{fontSize:13,color:"#666",lineHeight:1.6,marginBottom:12}}>Omnivorous — more plant material in their diet than Long-necked Turtles. A varied diet of animal protein and aquatic plants promotes good health.</p>
        <div style={{background:C.cream,borderRadius:12,border:"0.5px solid #e8e8e4",padding:"0 14px"}}>
          <FoodItem icon="🐟" name="Feeder fish / whitebait" detail="Whole fish for calcium" freq="2–3x per week"/>
          <FoodItem icon="🦐" name="Prawns / shrimp" detail="Shell-on preferred" freq="2–3x per week"/>
          <FoodItem icon="🪱" name="Earthworms" detail="Excellent natural food" freq="Weekly"/>
          <FoodItem icon="🌿" name="Aquatic plants" detail="Water hyacinth, duckweed — eat naturally" freq="Can be left in tank"/>
          <FoodItem icon="🐢" name="Turtle pellets" detail="Quality commercial pellets" freq="2–3x per week"/>
        </div>
        <WarnBox type="gold" title="Live plants add enrichment">Murray River Turtles naturally graze on aquatic plants. Adding live aquatic plants to the tank provides both nutrition and enrichment — and helps with water quality.</WarnBox>
        <ShopBtn>🛒 Shop turtle food</ShopBtn>
      </>}
      {tab === "health & setup" && <>
        <SectionLabel mt={0}>Common health issues</SectionLabel>
        <HealthItem title="Shell rot" detail="Caused by poor water quality or insufficient basking. Inspect shell regularly for soft spots, discolouration, or unusual odour."/>
        <HealthItem title="Eye infections" detail="Cloudy or swollen eyes indicate poor water quality or vitamin A deficiency. Improve water quality and vary diet."/>
        <HealthItem title="Respiratory infection" detail="Uneven floating indicates respiratory problems. Ensure water is not too warm and quality is maintained."/>
        <HealthItem title="Overheating" detail="Murray River Turtles prefer cooler water. A tank that is too warm causes chronic stress. Keep water at 16–22°C."/>
        <HealthItem dot="#4a9e6b" title="Signs of good health" detail="Active swimming, basking daily, eating well, smooth hard shell, clear eyes, alert and responsive."/>
      </>}
      {tab === "handling" && <>
        <div style={{background:C.goldLight,borderRadius:12,padding:"12px 14px",marginBottom:12,border:`0.5px solid #c8963c44`}}>
          <div style={{fontSize:12,fontWeight:700,color:"#7a5a1e",marginBottom:6}}>HANDLING — KEEP MINIMAL</div>
          <div style={{fontSize:13,color:"#555",lineHeight:1.6}}>Murray River Turtles are aquatic animals and handling should be kept to health checks only. They are generally less defensive than Long-necked Turtles but can still scratch with their claws. Hold at the sides of the shell, wash hands thoroughly after handling.</div>
        </div>
        <WarnBox type="gold" title="Salmonella risk">Like all turtles, Murray River Turtles can carry Salmonella. Always wash hands after handling or working with the aquarium water. Supervise children carefully.</WarnBox>
      </>}
      {tab === "licencing" && <LegalTab note="Murray River Turtles are available from licensed breeders across most of Australia. Not available in Tasmania." states={[{ abbr: "NSW", cat: "Standard keeper licence", ok: true }, { abbr: "VIC", cat: "Basic wildlife licence", ok: true }, { abbr: "QLD", cat: "Standard keeper licence", ok: true }, { abbr: "SA", cat: "Basic permit", ok: true }, { abbr: "WA", cat: "Standard licence", ok: true }, { abbr: "TAS", cat: "TAS natives only", ok: false }, { abbr: "ACT", cat: "Standard licence", ok: true }, { abbr: "NT", cat: "Check with authority", ok: true }]} />}
    </>}
  />
);

export default MurrayRiverTurtlePage;
