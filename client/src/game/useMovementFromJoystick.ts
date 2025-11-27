import { useEffect, useState } from "react";

interface JoystickContext {
  x: number;
  y: number;
  setJoystickVector: (x: number, y: number) => void;
}

let globalSet: ((x: number, y: number) => void) | null = null;

export const useMovementFromJoystick = (): JoystickContext => {
  const [vec, setVec] = useState({ x: 0, y: 0 });

  useEffect(() => {
    globalSet = (x: number, y: number) => setVec({ x, y });
    return () => {
      globalSet = null;
    };
  }, []);

  return {
    x: vec.x,
    y: vec.y,
    setJoystickVector: (x, y) => {
      if (globalSet) globalSet(x, y);
    }
  };
};

export const useJoystickSetter = () => {
  return {
    setJoystickVector: (x: number, y: number) => {
      if (globalSet) globalSet(x, y);
    }
  };
};