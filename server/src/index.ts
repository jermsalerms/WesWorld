import express from "express";
import http from "http";
import { Server } from "socket.io";
import path from "path";
import cors from "cors";
import type { PlayerState } from "./shared-types";

// Tell TypeScript about the Node globals; Node will provide them at runtime.
declare const __dirname: string;

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  path: "/ws",
  cors: {
    origin: "*"
  }
});

// Serve the built client from /client/dist
const staticRoot = path.join(__dirname, "../../client/dist");
app.use(express.static(staticRoot));
app.get("*", (_req, res) => {
  res.sendFile(path.join(staticRoot, "index.html"));
});

const players = new Map<string, PlayerState>();

io.on("connection", (socket) => {
  const id = socket.id;
  const now = Date.now();

  const spawn: PlayerState = {
    id,
    name: "Wes",
    x: Math.random() * 4 - 2,
    y: 1.11,
    z: Math.random() * 4 - 2,
    rotY: 0,
    form: "CADET",
    world: "SKY_GARDEN",
    lastUpdate: now
  };

  players.set(id, spawn);
  pushWorldState();

  socket.on("join", (payload: { name?: string }) => {
    const existing = players.get(id);
    if (!existing) return;
    existing.name = payload.name ?? "Wes";
    existing.lastUpdate = Date.now();
    players.set(id, existing);
    io.to(id).emit("patchSelf", existing);
  });

  socket.on("move", (partial: Partial<PlayerState>) => {
    const existing = players.get(id);
    if (!existing) return;
    const next: PlayerState = {
      ...existing,
      ...partial,
      lastUpdate: Date.now()
    };
    players.set(id, next);
  });

  socket.on("disconnect", () => {
    players.delete(id);
    pushWorldState();
  });
});

setInterval(() => {
  pruneIdlePlayers();
  pushWorldState();
}, 50);

function pruneIdlePlayers() {
  const cutoff = Date.now() - 60_000;
  for (const [id, p] of players) {
    if (p.lastUpdate < cutoff) {
      players.delete(id);
    }
  }
}

function pushWorldState() {
  io.emit("worldState", { players: Array.from(players.values()) });
}

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`[wesworld] listening on :${port}`);
});
