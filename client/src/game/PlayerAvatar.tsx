import React, { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Group } from "three";
import type { PlayerState } from "../../../server/src/shared-types";
import { useMultiplayerStore } from "./multiplayerStore";
import { emitMove } from "./useMultiplayer";
import { GROUND_TILE_TOP_Y } from "./Ground";

// --- Movement / physics constants ---
const SPEED = 4.0;
const AIR_CONTROL = 0.5;
const GRAVITY = -18.0;
const MAX_FALL_SPEED = -20.0;

// Capsule geometry (roughly matches your v6: [0.45, 1.1, 8, 16])
// Radius center->bottom ≈ 1.0 so bottom sits exactly on ground at y = 0.
const CAPSULE_RADIUS = 1.0;
const STAND_CENTER_Y = GROUND_TILE_TOP_Y + CAPSULE_RADIUS;

// --- Helpers ---
function lerp(a: number, b: number, t: number): number {
  const clamped = t < 0 ? 0 : t > 1 ? 1 : t;
  return a + (b - a) * clamped;
}

function lerpAngle(a: number, b: number, t: number): number {
  const clamped = t < 0 ? 0 : t > 1 ? 1 : t;
  let diff = ((b - a + Math.PI) % (Math.PI * 2)) - Math.PI;
  if (diff < -Math.PI) diff += Math.PI * 2;
  return a + diff * clamped;
}

type PlayerAvatarProps = {
  id: string;
  player: PlayerState;
  isLocal: boolean;
};

type PosState = { x: number; y: number; z: number };
type VelState = {
  vx: number;
  vy: number;
  vz: number;
  grounded: boolean;
  rotY: number;
};

export const PlayerAvatar: React.FC<PlayerAvatarProps> = ({
  id,
  player,
  isLocal,
}) => {
  const groupRef = useRef<Group | null>(null);

  const setPlayerPartial = useMultiplayerStore((s) => s.setPlayerPartial);

  // Local positional state used for interpolation / physics
  const pos = useRef<PosState>({
    x: player.x,
    y: player.y || STAND_CENTER_Y,
    z: player.z,
  });

  const vel = useRef<VelState>({
    vx: 0,
    vy: 0,
    vz: 0,
    grounded: true,
    rotY: player.rotY ?? 0,
  });

  // Simple keyboard input for local player (WASD / arrows)
  const inputRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!isLocal) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.code) {
        case "KeyW":
        case "ArrowUp":
          inputRef.current.y = 1;
          break;
        case "KeyS":
        case "ArrowDown":
          inputRef.current.y = -1;
          break;
        case "KeyA":
        case "ArrowLeft":
          inputRef.current.x = -1;
          break;
        case "KeyD":
        case "ArrowRight":
          inputRef.current.x = 1;
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.code) {
        case "KeyW":
        case "ArrowUp":
          if (inputRef.current.y === 1) inputRef.current.y = 0;
          break;
        case "KeyS":
        case "ArrowDown":
          if (inputRef.current.y === -1) inputRef.current.y = 0;
          break;
        case "KeyA":
        case "ArrowLeft":
          if (inputRef.current.x === -1) inputRef.current.x = 0;
          break;
        case "KeyD":
        case "ArrowRight":
          if (inputRef.current.x === 1) inputRef.current.x = 0;
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [isLocal]);

  // When server state changes for remote players, snap our local pos toward it
  useEffect(() => {
    if (isLocal) return;
    pos.current.x = player.x;
    pos.current.y = player.y || STAND_CENTER_Y;
    pos.current.z = player.z;
    vel.current.rotY = player.rotY ?? vel.current.rotY;
  }, [isLocal, player.x, player.y, player.z, player.rotY]);

  useFrame((_state, delta) => {
    if (!groupRef.current) return;

    if (isLocal) {
      // --- 1. INPUT ---
      let inputX = inputRef.current.x;
      let inputY = inputRef.current.y;

      // Normalize
      const mag = Math.hypot(inputX, inputY);
      if (mag > 1e-3) {
        inputX /= mag;
        inputY /= mag;
      }

      // forward/back relative to camera's -Z, but here we assume simple world axes
      const forward = inputY;
      const strafe = inputX;

      const intentMag = Math.min(1, Math.hypot(forward, strafe));
      const accel = SPEED * (vel.current.grounded ? 1 : AIR_CONTROL);

      const targetVx = strafe * accel;
      const targetVz = forward * accel;

      vel.current.vx = lerp(vel.current.vx, targetVx, 10 * delta);
      vel.current.vz = lerp(vel.current.vz, targetVz, 10 * delta);

      if (!vel.current.grounded) {
        vel.current.vy = Math.max(
          vel.current.vy + GRAVITY * delta,
          MAX_FALL_SPEED
        );
      }

      // --- 2. POSITION INTEGRATION ---
      let nextX = pos.current.x + vel.current.vx * delta;
      let nextY = pos.current.y + vel.current.vy * delta;
      let nextZ = pos.current.z + vel.current.vz * delta;

      // --- 3. GROUND CLAMP ---
      if (nextY <= STAND_CENTER_Y) {
        nextY = STAND_CENTER_Y;
        vel.current.vy = 0;
        vel.current.grounded = true;
      } else {
        vel.current.grounded = false;
      }

      pos.current.x = nextX;
      pos.current.y = nextY;
      pos.current.z = nextZ;

      // --- 4. ROTATION ---
      if (intentMag > 0.01) {
        const desiredAngle = Math.atan2(targetVx, targetVz);
        vel.current.rotY = lerpAngle(vel.current.rotY, desiredAngle, 10 * delta);
      }

      // --- 5. APPLY TO MESH ---
      groupRef.current.position.set(
        pos.current.x,
        pos.current.y,
        pos.current.z
      );
      groupRef.current.rotation.y = vel.current.rotY;

      // --- 6. SYNC TO STORE + SERVER ---
      const partial: Partial<PlayerState> = {
        x: pos.current.x,
        y: pos.current.y,
        z: pos.current.z,
        rotY: vel.current.rotY,
        inputX,
        inputY,
      };

      setPlayerPartial(id, partial);
      emitMove(partial);
    } else {
      // Remote players: simple interpolation toward authoritative server state
      const interpSpeed = 10 * delta;

      pos.current.x = lerp(pos.current.x, player.x, interpSpeed);
      pos.current.y = lerp(
        pos.current.y,
        player.y || STAND_CENTER_Y,
        interpSpeed
      );
      pos.current.z = lerp(pos.current.z, player.z, interpSpeed);
      vel.current.rotY = lerpAngle(
        vel.current.rotY,
        player.rotY ?? vel.current.rotY,
        interpSpeed
      );

      groupRef.current.position.set(
        pos.current.x,
        pos.current.y,
        pos.current.z
      );
      groupRef.current.rotation.y = vel.current.rotY;
    }
  });

  // Simple color helper (can expand to per-player colors if you like)
  const color = "#f97316";

  return (
    <group ref={groupRef} position={[pos.current.x, pos.current.y, pos.current.z]}>
      {/* Body */}
      <mesh castShadow receiveShadow>
        <capsuleGeometry args={[0.45, 1.1, 8, 16]} />
        <meshStandardMaterial color={color} />
      </mesh>

      {/* Head */}
      <mesh
        castShadow
        position={[0, CAPSULE_RADIUS + 0.6, 0]} // a bit above top of capsule
      >
        <sphereGeometry args={[0.35, 16, 16]} />
        <meshStandardMaterial color="#fde68a" />
      </mesh>
    </group>
  );
};

export default PlayerAvatar;
