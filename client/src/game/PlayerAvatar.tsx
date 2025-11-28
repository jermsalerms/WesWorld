import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { useMultiplayerStore } from "./multiplayerStore";
import { useMovementVector } from "./useMovementVector";
import { useMovementFromJoystick } from "./useMovementFromJoystick";
import { config } from "../config";
import type { WesForm } from "../../../server/src/shared-types";

interface PlayerAvatarProps {
  id: string;
  isLocal?: boolean;
}

const SPEED = 6;
const JUMP_FORCE = 8;
const GRAVITY = -18;
const MAX_FALL_SPEED = -24;
const AIR_CONTROL = 0.65;

export const PlayerAvatar: React.FC<PlayerAvatarProps> = ({ id, isLocal }) => {
  const ref = useRef<any>();
  const vel = useRef({ vx: 0, vy: 0, vz: 0, grounded: true });
  const { setPlayerPartial } = useMultiplayerStore();
  const keyboardVec = useMovementVector();
  const joystick = useMovementFromJoystick();
  const player = useMultiplayerStore((s) => s.players.get(id));

  useFrame((_state, dt) => {
    if (!ref.current || !player) return;

    let inputX = keyboardVec.x;
    let inputY = keyboardVec.y;
    if (Math.abs(joystick.x) > 0.1 || Math.abs(joystick.y) > 0.1) {
      inputX = joystick.x;
      inputY = joystick.y;
    }

    const forward = -inputY;
    const strafe = inputX;

    const intentMag = Math.min(1, Math.hypot(forward, strafe));
    const accel = SPEED * (vel.current.grounded ? 1 : AIR_CONTROL);

    const targetVx = strafe * accel;
    const targetVz = forward * accel;

    vel.current.vx = lerp(vel.current.vx, targetVx, 10 * dt);
    vel.current.vz = lerp(vel.current.vz, targetVz, 10 * dt);

    if (!vel.current.grounded) {
      vel.current.vy = Math.max(
        vel.current.vy + GRAVITY * dt,
        MAX_FALL_SPEED
      );
    }

    // simple ground plane at y=0
    let nextY = player.y + vel.current.vy * dt;
    if (nextY <= 0.12) {
      nextY = 0.12;
      vel.current.vy = 0;
      vel.current.grounded = true;
    } else {
      vel.current.grounded = false;
    }

    const nextX = player.x + vel.current.vx * dt;
    const nextZ = player.z + vel.current.vz * dt;

    let rotY = player.rotY;
    if (intentMag > 0.05) {
      const angle = Math.atan2(vel.current.vx, vel.current.vz);
      rotY = lerpAngle(rotY, angle, 18 * dt);
    }

    ref.current.position.set(nextX, nextY, nextZ);
    ref.current.rotation.y = rotY;

    if (isLocal) {
      setPlayerPartial(id, {
        x: nextX,
        y: nextY,
        z: nextZ,
        rotY,
        inputX,
        inputY
      });
    }
  });

  const color = suitColorForForm((player?.form ?? "CADET") as WesForm);
  const emissive = glowColorForForm((player?.form ?? "CADET") as WesForm);
  
  return (
    <group ref={ref} position={[player?.x ?? 0, player?.y ?? 0.12, player?.z ?? 0]}>
      {config.DEBUG_MODE && isLocal && player && (
        <Html position={[0, 2.4, 0]} distanceFactor={12} center>
          <div className="avatar-debug-bubble">
            { (player.inputX ?? 0).toFixed(2) },{" "}
            { (player.inputY ?? 0).toFixed(2) }
          </div>
        </Html>
      )}
      <mesh castShadow receiveShadow>
        <capsuleGeometry args={[0.45, 1.1, 6, 16]} />
        <meshStandardMaterial
          color={color}
          emissive={emissive}
          emissiveIntensity={0.5}
          metalness={0.4}
          roughness={0.35}
        />
      </mesh>
      <mesh position={[0, 1.15, 0.26]}>
        <boxGeometry args={[0.55, 0.65, 0.3]} />
        <meshStandardMaterial
          color={backpackColorForForm((player?.form ?? "CADET") as WesForm)}
          emissive={emissive}
          emissiveIntensity={0.65}
          roughness={0.5}
        />
      </mesh>
      <mesh position={[0, 0.85, 0.42]}>
        <circleGeometry args={[0.14, 32]} />
        <meshBasicMaterial color={emissive} />
      </mesh>
    </group>
  );
};

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * Math.min(1, Math.max(0, t));
}

function lerpAngle(a: number, b: number, t: number) {
  const diff = (((b - a) % (Math.PI * 2)) + Math.PI * 3) % (Math.PI * 2) - Math.PI;
  return a + diff * Math.min(1, Math.max(0, t));
}

function suitColorForForm(form: WesForm): string {
  switch (form) {
    case "YOUNG":
      return "#ef4444";
    case "CADET":
      return "#e5e7eb";
    case "SHADOW":
      return "#020617";
    case "QUANTUM":
      return "#1f2937";
    default:
      return "#e5e7eb";
  }
}

function glowColorForForm(form: WesForm): string {
  switch (form) {
    case "YOUNG":
      return "#38bdf8";
    case "CADET":
      return "#38bdf8";
    case "SHADOW":
      return "#a855f7";
    case "QUANTUM":
      return "#22c55e";
    default:
      return "#38bdf8";
  }
}

function backpackColorForForm(form: WesForm): string {
  switch (form) {
    case "YOUNG":
      return "#b45309";
    case "CADET":
      return "#020617";
    case "SHADOW":
      return "#020617";
    case "QUANTUM":
      return "#111827";
    default:
      return "#020617";
  }
}
