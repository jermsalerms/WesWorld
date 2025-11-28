import React from "react";
import { useMultiplayerStore } from "../game/multiplayerStore";
// import { useMovementVector } from "../game/useMovementVector";
import { VirtualJoystick } from "./VirtualJoystick";

export const Hud: React.FC = () => {
  const { myId, players, cycleWorld, cycleForm } = useMultiplayerStore();
  const me = myId ? players.get(myId) ?? null : null;
  // remove use of useMovementVector(); and add inputX and inputY
  // const movement = useMovementVector();
  const inputX = me?.inputX ?? 0;
  const inputY = me?.inputY ?? 0;

  const worldLabel = labelForWorld(me?.world ?? "SKY_GARDEN");
  const worldClass = badgeClassForWorld(me?.world ?? "SKY_GARDEN");

  return (
    <div className="hud-root">
      <div className="hud-top">
        <div>
          <div className="hud-title">WesWorld // Prototype</div>
          <div>Online players: {players.size}</div>
        </div>
        <div className="hud-coords">
          <div className="coords-row">
            Pos:{" "}
            <span className="coords-value">
              {me
                ? `${me.x.toFixed(1)}, ${me.y.toFixed(1)}, ${me.z.toFixed(1)}`
                : "—"}
            </span>
          </div>
          <div className="coords-row hud-mini-label">
            Input:{" "}
            <span className="coords-value">
              {inputX.toFixed(2)}, {inputY.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      <div className="hud-bottom">
        <div>
          <div className="hud-pill">
            <span className={`hud-badge ${worldClass}`}>{worldLabel}</span>
            <span className="hud-mini-label">
              {me?.form ?? "CADET"} Wes • Tap below to shift
            </span>
          </div>
          <div className="world-switch-row">
            <button
              className="world-chip"
              onClick={() => cycleWorld(1)}
            >
              Cycle world ⟳
            </button>
            <button
              className="world-chip"
              onClick={() => cycleForm(1)}
            >
              Time-shift form ⟳
            </button>
          </div>
        </div>

        <VirtualJoystick />
      </div>
    </div>
  );
};

function labelForWorld(world: string): string {
  switch (world) {
    case "NEON_CITY":
      return "Cadet Wes – Neon City";
    case "MUSHROOM_GROTTO":
      return "Shadow Wes – Mushroom Grotto";
    case "DEEP_CAVERN":
      return "Quantum Wes – Deep Cavern";
    case "SKY_GARDEN":
    default:
      return "Young Wes – Sky Garden";
  }
}

function badgeClassForWorld(world: string): string {
  switch (world) {
    case "NEON_CITY":
      return "neon";
    case "MUSHROOM_GROTTO":
      return "grotto";
    case "DEEP_CAVERN":
      return "cavern";
    case "SKY_GARDEN":
    default:
      return "sky";
  }
}
