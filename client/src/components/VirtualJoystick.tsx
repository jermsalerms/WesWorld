import React, { useRef, useState } from "react";
import { useMovementFromJoystick } from "../game/useMovementFromJoystick";

const RADIUS = 48;

export const VirtualJoystick: React.FC = () => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [active, setActive] = useState(false);
  const { setJoystickVector } = useMovementFromJoystick();

  const handlePointerDown = (e: React.PointerEvent) => {
    setActive(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    updateFromEvent(e);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!active) return;
    updateFromEvent(e);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setActive(false);
    setJoystickVector(0, 0);
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  };

  const updateFromEvent = (e: React.PointerEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    const dist = Math.min(Math.sqrt(dx * dx + dy * dy), RADIUS);
    const angle = Math.atan2(dy, dx);
    const nx = (dist / RADIUS) * Math.cos(angle);
    const ny = (dist / RADIUS) * Math.sin(angle);
    setJoystickVector(nx, ny);
  };

  return (
    <div
      ref={ref}
      style={{
        position: "relative",
        width: RADIUS * 2,
        height: RADIUS * 2,
        borderRadius: "999px",
        border: "1px solid rgba(148,163,184,0.5)",
        background: "radial-gradient(circle at 30% 20%, rgba(56,189,248,0.25), rgba(15,23,42,0.9))",
        boxShadow: "0 24px 60px rgba(15,23,42,0.9)",
        pointerEvents: "auto",
        touchAction: "none"
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: 24,
          height: 24,
          borderRadius: "999px",
          transform: "translate(-50%, -50%)",
          background: active
            ? "radial-gradient(circle at 30% 20%, #38bdf8, #0ea5e9)"
            : "rgba(148,163,184,0.6)",
          boxShadow: active
            ? "0 0 0 1px rgba(56,189,248,0.7), 0 0 20px rgba(56,189,248,0.8)"
            : "0 0 10px rgba(15,23,42,0.8)"
        }}
      />
    </div>
  );
};