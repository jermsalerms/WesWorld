import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useThree, useFrame } from "@react-three/fiber";
import { Vector3 } from "three";
import { Ground } from "../game/Ground";
import { PlayerAvatar } from "../game/PlayerAvatar";
import { OtherPlayers } from "../game/OtherPlayers";
import { useMultiplayerStore } from "../game/multiplayerStore";
import { useMultiplayer } from "../game/useMultiplayer";

export const WesWorldCanvas: React.FC = () => {
  useMultiplayer();

  const myId = useMultiplayerStore((s) => s.myId);

  return (
    <div className="canvas-root">
      <Canvas camera={{ position: [0, 3, 8], fov: 55 }}>
        shadows
      >
        <Suspense fallback={null}>
          <SceneContents myId={myId} />
        </Suspense>
      </Canvas>
    </div>
  );
};

const SceneContents: React.FC<{ myId: string | null }> = ({ myId }) => {
  const me = useMultiplayerStore((s) =>
    myId ? s.players.get(myId) ?? null : null
  );
  const world = me?.world ?? "SKY_GARDEN";

  return (
    <>
      <color attach="background" args={backgroundColorForWorld(world)} />
      <fog attach="fog" args={fogForWorld(world)} />

      {/* Key lights tuned to approximate our reference art */}
      <hemisphereLight
        intensity={0.65}
        groundColor={world === "DEEP_CAVERN" ? "#020617" : "#111827"}
      />
      <directionalLight
        position={[4, 8, 2]}
        intensity={1.4}
        castShadow
        color={keyLightColorForWorld(world)}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <directionalLight
        position={[-6, 3, -3]}
        intensity={0.7}
        color={rimLightColorForWorld(world)}
      />

      <Ground world={world} />
      <FollowCamera targetId={myId} />

      {myId && <PlayerAvatar id={myId} isLocal />}
      <OtherPlayers />
      <OrbitControls
        enablePan={false}
        maxPolarAngle={Math.PI / 2.1}
        minDistance={6}
        maxDistance={14}
      />
    </>
  );
};

const FollowCamera: React.FC<{ targetId: string | null }> = ({ targetId }) => {
  const { camera } = useThree();
  const player = useMultiplayerStore((s) =>
    targetId ? s.players.get(targetId) ?? null : null
  );

  const offset = new Vector3(0, 4.5, 10); // behind & above Wes

  useFrame(() => {
    if (!player) return;

    const targetPos = new Vector3(player.x, player.y, player.z);
    const desired = targetPos.clone().add(offset);

    camera.position.lerp(desired, 0.12);
    camera.lookAt(targetPos.x, targetPos.y + 1, targetPos.z);
  });

  return null;
};

function backgroundColorForWorld(world: string): [string] {
  switch (world) {
    case "NEON_CITY":
      return ["#020617"];
    case "MUSHROOM_GROTTO":
      return ["#020617"];
    case "DEEP_CAVERN":
      return ["#020617"];
    case "SKY_GARDEN":
    default:
      return ["#020617"];
  }
}

function fogForWorld(world: string): [number, number, number] {
  switch (world) {
    case "NEON_CITY":
      return [0x020617, 8, 28];
    case "MUSHROOM_GROTTO":
      return [0x020617, 7, 24];
    case "DEEP_CAVERN":
      return [0x020617, 6, 20];
    case "SKY_GARDEN":
    default:
      return [0x020617, 10, 30];
  }
}

function keyLightColorForWorld(world: string): string {
  switch (world) {
    case "NEON_CITY":
      return "#38bdf8";
    case "MUSHROOM_GROTTO":
      return "#22c55e";
    case "DEEP_CAVERN":
      return "#a855f7";
    case "SKY_GARDEN":
    default:
      return "#fbbf24";
  }
}

function rimLightColorForWorld(world: string): string {
  switch (world) {
    case "NEON_CITY":
      return "#6366f1";
    case "MUSHROOM_GROTTO":
      return "#22c55e";
    case "DEEP_CAVERN":
      return "#8b5cf6";
    case "SKY_GARDEN":
    default:
      return "#60a5fa";
  }
}
