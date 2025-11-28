import create from "zustand";
import type { PlayerState, WesForm } from "../../../server/src/shared-types";

type WorldId = PlayerState["world"];

interface MultiplayerState {
  myId: string | null;
  players: Map<string, PlayerState>;
  setMyId: (id: string) => void;
  upsertPlayer: (state: PlayerState) => void;
  bulkSetPlayers: (list: PlayerState[]) => void;
  setPlayerPartial: (id: string, partial: Partial<PlayerState>) => void;
  cycleWorld: (direction: 1 | -1) => void;
  cycleForm: (direction: 1 | -1) => void;
}

const worlds: WorldId[] = [
  "SKY_GARDEN",
  "NEON_CITY",
  "MUSHROOM_GROTTO",
  "DEEP_CAVERN"
];

const forms: WesForm[] = ["YOUNG", "CADET", "SHADOW", "QUANTUM"];

export const useMultiplayerStore = create<MultiplayerState>((set, get) => ({
  myId: null,
  players: new Map<string, PlayerState>(),

  setMyId: (id) => set({ myId: id }),

  upsertPlayer: (state) =>
    set((prev) => {
      const copy = new Map(prev.players);
      copy.set(state.id, state);
      return { players: copy };
    }),

  bulkSetPlayers: (list) =>
    set(() => {
      const map = new Map<string, PlayerState>();
      for (const p of list) {
        map.set(p.id, p);
      }
      return { players: map };
    }),

  setPlayerPartial: (id, partial) =>
    set((prev) => {
      const existing = prev.players.get(id);
      if (!existing) return {};
      const updated: PlayerState = {
        ...existing,
        ...partial,
        lastUpdate: Date.now()
      };
      const copy = new Map(prev.players);
      copy.set(id, updated);
      return { players: copy };
    }),

  cycleWorld: (direction) => {
    const { myId, players } = get();
    if (!myId) return;
    const me = players.get(myId);
    if (!me) return;
    const idx = worlds.indexOf(me.world);
    const next = worlds[(idx + (direction === 1 ? 1 : -1) + worlds.length) % worlds.length];
    get().setPlayerPartial(myId, { world: next });
  },

  cycleForm: (direction) => {
    const { myId, players } = get();
    if (!myId) return;
    const me = players.get(myId);
    if (!me) return;
    const idx = forms.indexOf(me.form);
    const next = forms[(idx + (direction === 1 ? 1 : -1) + forms.length) % forms.length];
    get().setPlayerPartial(myId, { form: next });
  }
}));