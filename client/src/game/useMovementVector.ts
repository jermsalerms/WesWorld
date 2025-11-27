import { useEffect, useState } from "react";

interface Vec2 {
  x: number;
  y: number;
}

const keys = {
  ArrowUp: "up",
  ArrowDown: "down",
  ArrowLeft: "left",
  ArrowRight: "right",
  w: "up",
  s: "down",
  a: "left",
  d: "right",
  W: "up",
  S: "down",
  A: "left",
  D: "right"
} as const;

export const useMovementVector = (): Vec2 => {
  const [dir, setDir] = useState<Vec2>({ x: 0, y: 0 });

  useEffect(() => {
    const pressed = new Set<string>();

    const update = () => {
      let x = 0;
      let y = 0;
      if (pressed.has("left")) x -= 1;
      if (pressed.has("right")) x += 1;
      if (pressed.has("up")) y += 1;
      if (pressed.has("down")) y -= 1;
      const mag = Math.hypot(x, y) || 1;
      setDir({ x: x / mag, y: y / mag });
    };

    const handleDown = (e: KeyboardEvent) => {
      const label = keys[e.key as keyof typeof keys];
      if (!label) return;
      pressed.add(label);
      update();
    };
    const handleUp = (e: KeyboardEvent) => {
      const label = keys[e.key as keyof typeof keys];
      if (!label) return;
      pressed.delete(label);
      update();
    };

    window.addEventListener("keydown", handleDown);
    window.addEventListener("keyup", handleUp);
    return () => {
      window.removeEventListener("keydown", handleDown);
      window.removeEventListener("keyup", handleUp);
    };
  }, []);

  return dir;
};