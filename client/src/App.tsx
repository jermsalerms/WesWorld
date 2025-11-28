import { useEffect, useState } from "react";
import "./styles.css";

export function App() {
  console.log("🎮 App component rendering...");
  const log = (window as any).logDebug;
  const [loadCanvas, setLoadCanvas] = useState(false);

  useEffect(() => {
    console.log("[wesworld] React App mounted");
    if (log) log("✅ React App mounted!", "lime");
  }, [log]);

  return (
    <>
      {/* Simple always-visible banner for debugging */}
      <div
        style={{
          position: "fixed",
          top: 60,
          left: 8,
          right: 8,
          padding: "12px",
          background: "rgba(0,255,0,0.9)",
          color: "black",
          fontSize: 16,
          fontWeight: "bold",
          zIndex: 9999,
          border: "3px solid lime",
          textAlign: "center"
        }}
      >
        ✅ REACT WORKS! WesWorld client loaded successfully!
      </div>

      <div style={{
        position: "fixed",
        top: 140,
        left: 8,
        right: 8,
        padding: "12px",
        background: "rgba(0,0,0,0.9)",
        color: "white",
        fontSize: 14,
        zIndex: 9998,
        border: "2px solid cyan"
      }}>
        <p style={{margin: "0 0 10px 0"}}>React is working! The issue was with Three.js/3D components.</p>
        <button
          onClick={() => setLoadCanvas(true)}
          style={{
            padding: "10px 20px",
            fontSize: 14,
            background: loadCanvas ? "#666" : "#0ea5e9",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer"
          }}
          disabled={loadCanvas}
        >
          {loadCanvas ? "Loading 3D..." : "Click to load 3D components"}
        </button>
      </div>

      {loadCanvas && <LazyLoad3D />}
    </>
  );
}

function LazyLoad3D() {
  const [error, setError] = useState<string | null>(null);
  const log = (window as any).logDebug;

  useEffect(() => {
    if (log) log("📦 Loading 3D components...", "cyan");

    import("./components/WesWorldCanvas").then(
      ({ WesWorldCanvas }) => {
        if (log) log("✅ 3D components loaded!", "lime");
        // TODO: render WesWorldCanvas
      },
      (err) => {
        const errMsg = err instanceof Error ? err.message : String(err);
        setError(errMsg);
        if (log) log("❌ Failed to load 3D: " + errMsg, "red");
      }
    );
  }, [log]);

  if (error) {
    return (
      <div style={{
        position: "fixed",
        top: 250,
        left: 8,
        right: 8,
        padding: "12px",
        background: "rgba(255,0,0,0.9)",
        color: "white",
        fontSize: 12,
        zIndex: 9997,
        border: "2px solid red"
      }}>
        <strong>3D Component Error:</strong><br/>
        {error}
      </div>
    );
  }

  return <div style={{color: "white", padding: 20}}>Loading 3D...</div>;
}
