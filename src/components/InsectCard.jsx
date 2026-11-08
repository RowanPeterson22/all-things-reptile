import { C } from "../constants/colours";

const InsectCard = ({ name, protein, fat, calcium, availability, best, notes, tag, tagColor }) => (
  <div style={{background:C.cream,borderRadius:12,padding:"14px 16px",marginBottom:12,border:"0.5px solid #e8e8e4"}}>
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
      <div style={{fontSize:14,fontWeight:700,color:"#111"}}>{name}</div>
      {tag && <span style={{fontSize:10,fontWeight:700,padding:"3px 9px",borderRadius:10,background:tagColor+"22",color:tagColor}}>{tag}</span>}
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6,marginBottom:10}}>
      {[["Protein",protein,"#2a7e4a"],["Fat",fat,"#7a5a1e"],["Ca:P ratio",calcium,"#1a3a5c"]].map(([label,val,col])=>(
        <div key={label} style={{background:"white",borderRadius:8,padding:"6px 8px",textAlign:"center",border:"0.5px solid #eee"}}>
          <div style={{fontSize:10,color:"#777",fontWeight:700,marginBottom:2}}>{label}</div>
          <div style={{fontSize:12,fontWeight:700,color:col}}>{val}</div>
        </div>
      ))}
    </div>
    <div style={{fontSize:12,color:"#555",marginBottom:6}}><span style={{fontWeight:700,color:"#333"}}>Best for: </span>{best}</div>
    <div style={{fontSize:12,color:"#555",marginBottom:6}}><span style={{fontWeight:700,color:"#333"}}>Availability: </span>{availability}</div>
    <div style={{fontSize:12,color:"#777",lineHeight:1.6,fontStyle:"italic"}}>{notes}</div>
  </div>
);

export default InsectCard;
