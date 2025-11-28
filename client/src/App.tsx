import { useEffect } from "react";
import { WesWorldCanvas } from "./components/WesWorldCanvas";
import { Hud } from "./components/Hud";
import { config } from "./config";
import "./styles.css";

export function App() {
  const log = (window as any).logDebug;

  useEffect(() => {
    console.log("[wesworld] React App mounted");
    if (config.DEBUG_MODE && log) {
      log("✅ React App mounted!", "lime");
      log("🎮 Loading full 3D experience...", "cyan");
    }
  }, [log]);

  return (
    <div className="app-root">
      <WesWorldCanvas />
      <Hud />
    </div>
  );
}
