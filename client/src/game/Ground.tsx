import React, { useMemo } from "react";
import { Color } from "three";

export const GROUND_TILE_SIZE = 1;
export const GROUND_TILE_HEIGHT = 0.18;

/**
 * World ground reference.
 * We define the *top* of the checkerboard tiles as y = 0.
 * Wes's capsule bottom will rest exactly on this surface.
 */
export const GROUND_TILE_TOP_Y = 0;

const HALF_HEIGHT = GROUND_TILE_HEIGHT / 2;
const TILE_CENTER_Y = GROUND_TILE_TOP_Y - HALF_HEIGHT;

interface GroundProps {
  size?: number; // how many tiles in +/- x/z
}

export const Ground: React.FC<GroundProps> = ({ size = 10 }) => {
  const tiles = useMemo(() => {
    const result: Array<[number, number, number, boolean]> = [];
    for (let x = -size; x <= size; x++) {
      for (let z = -size; z <= size; z++) {
        const isDark = (x + z) % 2 === 0;
        result.push([x, TILE_CENTER_Y, z, isDark]);
      }
    }
    return result;
  }, [size]);

  return (
    <group>
      {tiles.map(([x, y, z, isDark], idx) => (
        <mesh
          key={idx}
          position={[x * GROUND_TILE_SIZE, y, z * GROUND_TILE_SIZE]}
          receiveShadow
        >
          <boxGeometry
            args={[GROUND_TILE_SIZE * 0.98, GROUND_TILE_HEIGHT, GROUND_TILE_SIZE * 0.98]}
          />
          <meshStandardMaterial
            color={new Color(isDark ? "#020617" : "#0f172a")}
            roughness={0.9}
            metalness={0.1}
          />
        </mesh>
      ))}
    </group>
  );
};

export default Ground;
