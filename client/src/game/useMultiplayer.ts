import { useEffect } from "react";
import { io, Socket } from "socket.io-client";
import { useMultiplayerStore } from "./multiplayerStore";
// shared-types now lives in server/src/shared-types.ts
import type { PlayerState } from "../../../server/src/shared-types";

let socket: Socket | null = null;

export const useMultiplayer = () => {
  const { setMyId, bulkSetPlayers, setPlayerPartial } = useMultiplayerStore();

  useEffect(() => {
    // create a singleton socket connection
    if (!socket) {
      socket = io("/", {
        path: "/ws",
        transports: ["websocket", "polling"]
      });

      socket.on("connect_error", (err) => {
        console.error("[wesworld] socket connect_error", err.message);
      });
      socket.on("error", (err) => {
        console.error("[wesworld] socket error", err);
      });
    }

    const s = socket;

    s.on("connect", () => {
      const id = s.id!;
      setMyId(id);
      s.emit("join", { name: "Wes" });
    });

    s.on("worldState", (payload: { players: PlayerState[] }) => {
      bulkSetPlayers(payload.players);
    });

    s.on("patchSelf", (partial: Partial<PlayerState>) => {
      if (!s.id) return;
      const id = s.id;
      setPlayerPartial(id, partial);
    });

    return () => {
      s.off("connect");
      s.off("worldState");
      s.off("patchSelf");
    };
  }, [setMyId, bulkSetPlayers, setPlayerPartial]);
};
