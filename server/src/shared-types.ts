export type WesForm = "YOUNG" | "CADET" | "SHADOW" | "QUANTUM";

export interface PlayerState {
  id: string;
  name: string;
  x: number;
  y: number;
  z: number;
  rotY: number;
  form: WesForm;
  world: "SKY_GARDEN" | "NEON_CITY" | "MUSHROOM_GROTTO" | "DEEP_CAVERN";
  lastUpdate: number;
  
  // Debug-only: current movement intent (combined keyboard/joystick)
  inputX?: number;
  inputY?: number;
}
