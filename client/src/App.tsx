import { useEffect } from "react";
import { WesWorldCanvas } from "./components/WesWorldCanvas";
import { Hud } from "./components/Hud";
import "./styles.css";

export function App() {
  useEffect(() => {
    console.log("[wesworld] React App mounted");
  }, []);

  return (
    <>
      {/* Simple always-visible banner for debugging */}
      <div
        style={{
          position: "fixed",
          top: 8,
          left: 8,
          padding: "4px 8px",
          background: "rgba(0,0,0,0.6)",
          color: "lime",
          fontSize: 12,
          zIndex: 9999
        }}
      >
        WesWorld client loaded
      </div>

      <WesWorldCanvas />
      <Hud />
    </>
  );
}
