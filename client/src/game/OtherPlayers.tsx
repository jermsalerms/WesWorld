import React from "react";
import { useMultiplayerStore } from "./multiplayerStore";
import { PlayerAvatar } from "./PlayerAvatar";

export const OtherPlayers: React.FC = () => {
  const { players, myId } = useMultiplayerStore();

  const others = Array.from(players.values()).filter((p) => p.id !== myId);

  return (
    <>
      {others.map((p) => (
        <PlayerAvatar key={p.id} id={p.id} />
      ))}
    </>
  );
};