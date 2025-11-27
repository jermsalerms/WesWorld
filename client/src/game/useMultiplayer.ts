import { useEffect } from "react";
import { io, Socket } from "socket.io-client";
import { useMultiplayerStore } from "./multiplayerStore";
import type { PlayerState } from "../../../shared-types";

let socket: Socket | null = null;

export const useMultiplayer = () => {
  const { setMyId, bulkSetPlayers, setPlayerPartial } = useMultiplayerStore();

  useEffect(() => {
    if (!socket) {
      socket = io("/", {
        path: "/ws"
      });
    }

    socket.on("connect", () => {
      const id = socket!.id!;
      setMyId(id);
      socket!.emit("join", { name: "Wes" });
    });

    socket.on("worldState", (payload: { players: PlayerState[] }) => {
      bulkSetPlayers(payload.players);
    });

    socket.on("patchSelf", (partial: Partial<PlayerState>) => {
      if (!socket) return;
      const id = socket.id!;
      setPlayerPartial(id, partial);
    });

    return () => {
      if (!socket) return;
      socket.off("connect");
      socket.off("worldState");
      socket.off("patchSelf");
    };
  }, [setMyId, bulkSetPlayers, setPlayerPartial]);
};