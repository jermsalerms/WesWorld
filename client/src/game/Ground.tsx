import React from "react";
import { MeshStandardMaterialProps } from "@react-three/fiber";

interface GroundProps {
  world: "SKY_GARDEN" | "NEON_CITY" | "MUSHROOM_GROTTO" | "DEEP_CAVERN";
}

export const Ground: React.FC<GroundProps> = ({ world }) => {
  const tiles: Array<[number, number, number]> = [];
  const size = 8;

  for (let x = -size; x <= size; x++) {
    for (let z = -size; z <= size; z++) {
      if ((x + z) % 2 === 0) {
  -     tiles.push([x, 0, z]);
  +     tiles.push([x, -1, z]);
      }
    }
  }

  const matProps = materialForWorld(world);

  return (
    <group>
      {tiles.map(([x, y, z], idx) => (
        <mesh
          key={idx}
          position={[x, y, z]}
          receiveShadow
          castShadow={false}
        >
          <boxGeometry args={[0.98, 0.18, 0.98]} />
          <meshStandardMaterial {...matProps} />
        </mesh>
      ))}
    </group>
  );
};

function materialForWorld(
  world: GroundProps["world"]
): MeshStandardMaterialProps {
  switch (world) {
    case "NEON_CITY":
      return {
        color: "#020617",
        emissive: "#0ea5e9",
        emissiveIntensity: 0.3,
        metalness: 0.7,
        roughness: 0.25
      };
    case "MUSHROOM_GROTTO":
      return {
        color: "#064e3b",
        emissive: "#22c55e",
        emissiveIntensity: 0.18,
        roughness: 0.9,
        metalness: 0.1
      };
    case "DEEP_CAVERN":
      return {
        color: "#111827",
        emissive: "#6366f1",
        emissiveIntensity: 0.25,
        roughness: 0.85,
        metalness: 0.15
      };
    case "SKY_GARDEN":
    default:
      return {
        color: "#1e293b",
        emissive: "#38bdf8",
        emissiveIntensity: 0.08,
        roughness: 0.7,
        metalness: 0.2
      };
  }
}
