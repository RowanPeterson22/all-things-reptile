import { useState, useEffect } from "react";
import { C } from "../constants/colours";

// ─── Splash Screen ───────────────────────────────────────────────
// Black, with the negative ATR logo (the same file as the app header, so it's
// cached for the header straight after). All Things Frogs is off for now.
const LOGO = "/header-logo-dark.png";

const SplashScreen = ({ onComplete }) => {
  const [phase, setPhase] = useState("in");

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase("hold"),     800),
      setTimeout(() => setPhase("fade-out"), 2400),
      setTimeout(() => onComplete(),         3000),
    ];
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  const logoOpacity = phase === "hold" ? 1 : 0;
  const logoY = phase === "in" ? 30 : 0;
  const containerOpacity = phase === "fade-out" ? 0 : 1;

  return (
    <div style={{
      position: "fixed", inset: 0,
      background: C.black,
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      // Centred within the safe area (notch and home bar).
      padding: "env(safe-area-inset-top, 0px) 24px env(safe-area-inset-bottom, 0px)",
      opacity: containerOpacity,
      transition: "opacity 0.6s ease",
      zIndex: 9999,
    }}>
      <img
        src={LOGO}
        alt="All Things Reptile"
        style={{
          width: "100%", maxWidth: 380,
          opacity: logoOpacity,
          transform: `translateY(${logoY}px)`,
          transition: "opacity 0.7s ease, transform 0.7s ease",
        }}
      />
      <div style={{
        position: "absolute", bottom: "calc(env(safe-area-inset-bottom, 0px) + 40px)",
        fontSize: 11, color: "rgba(255,255,255,0.45)",
        letterSpacing: "0.1em", fontFamily: "sans-serif",
      }}>
        AN AMPHIBIAN PTY LTD COMPANY
      </div>
    </div>
  );
};

export default SplashScreen;
