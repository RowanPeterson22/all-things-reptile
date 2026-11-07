import { C } from "../constants/colours";

const WarnBox = ({ type = "gold", title, children }) => {
  const s = {
    gold:  { bg: C.goldLight, border: "rgba(200,150,60,0.3)",  title: "#7a5a1e", body: "#7a5a1e" },
    green: { bg: C.greenPale, border: "rgba(30,58,47,0.15)",   title: C.green,   body: "#2a5040" },
    red:   { bg: C.redPale,   border: "rgba(139,32,32,0.15)",  title: C.red,     body: C.red     },
    blue:  { bg: C.bluePale,  border: "rgba(26,58,92,0.15)",   title: C.blue,    body: C.blue    },
  }[type];
  return (
    <div style={{ background: s.bg, border: `0.5px solid ${s.border}`, borderRadius: 12, padding: "12px 14px", marginBottom: 10 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: s.title, marginBottom: 3 }}>{title}</div>
      <div style={{ fontSize: 12, color: s.body, lineHeight: 1.6 }}>{children}</div>
    </div>
  );
};

export default WarnBox;
