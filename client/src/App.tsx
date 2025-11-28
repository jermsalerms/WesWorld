import React from "react";
import { WesWorldCanvas } from "./components/WesWorldCanvas";
import { Hud } from "./components/Hud";

export const App: React.FC = () => {
  console.log("🎮 App component rendering...");

  return (
    <div className="app-root">
      <WesWorldCanvas />
      <Hud />
    </div>
  );
};