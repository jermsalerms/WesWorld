import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App";
import "./styles.css";

const log = (window as any).logDebug || console.log;

log("🚀 WesWorld client starting...", "cyan");

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  state = { hasError: false, error: undefined as Error | undefined };

  static getDerivedStateFromError(error: Error) {
    console.error("❌ React Error Boundary caught:", error);
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("❌ Error details:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: "40px",
          color: "#fff",
          fontFamily: "monospace",
          maxWidth: "800px",
          margin: "0 auto"
        }}>
          <h1 style={{ color: "#ff4444" }}>⚠️ Application Error</h1>
          <pre style={{
            background: "#1a1a1a",
            padding: "20px",
            borderRadius: "8px",
            overflow: "auto",
            fontSize: "12px"
          }}>
            {this.state.error?.stack || this.state.error?.toString()}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

try {
  log("✅ Creating React root...", "lime");
  const rootElement = document.getElementById("root");
  if (!rootElement) {
    throw new Error("Root element not found!");
  }

  const root = ReactDOM.createRoot(rootElement);
  log("✅ Rendering App...", "lime");

  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>
  );

  log("✅ App rendered successfully", "lime");
  (window as any).reactLoaded = true;
} catch (error) {
  const errorMsg = error instanceof Error ? error.message : String(error);
  const errorStack = error instanceof Error ? error.stack : String(error);
  log("❌ Failed to initialize app: " + errorMsg, "red");
  console.error("❌ Failed to initialize app:", error);

  document.body.innerHTML = `
    <div style="padding: 40px; color: #fff; font-family: monospace;">
      <h1 style="color: #ff4444;">Failed to Initialize</h1>
      <pre style="background: #1a1a1a; padding: 20px; border-radius: 8px; overflow: auto; font-size: 11px;">
        ${errorStack}
      </pre>
    </div>
  `;
}