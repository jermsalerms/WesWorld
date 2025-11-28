import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App";
import { config } from "./config";
import "./styles.css";

const log = (window as any).logDebug || console.log;

// Enable debug overlay if DEBUG_MODE is on
if (config.DEBUG_MODE) {
  (window as any).showDebugOverlay();
  log("🚀 main.tsx loaded", "cyan");
  log("✅ React: " + (React ? "OK" : "FAIL"), React ? "lime" : "red");
  log("✅ ReactDOM: " + (ReactDOM ? "OK" : "FAIL"), ReactDOM ? "lime" : "red");
}

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
  if (config.DEBUG_MODE) {
    log("✅ App import: " + (App ? "OK" : "FAIL"), App ? "lime" : "red");
    log("📋 Creating React root...", "cyan");
  }

  const rootElement = document.getElementById("root");
  if (!rootElement) {
    throw new Error("Root element not found!");
  }

  const root = ReactDOM.createRoot(rootElement);

  if (config.DEBUG_MODE) {
    log("📋 Rendering App component...", "cyan");
  }

  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>
  );

  if (config.DEBUG_MODE) {
    log("✅ App rendered successfully!", "lime");
  }
  (window as any).reactLoaded = true;
} catch (error) {
  const errorMsg = error instanceof Error ? error.message : String(error);
  const errorStack = error instanceof Error ? error.stack : String(error);

  log("❌ INIT FAILED: " + errorMsg, "red");
  console.error("❌ Failed to initialize app:", error);

  // Always show error display on failure
  const errorDisplay = document.createElement('div');
  errorDisplay.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:#1a1a1a;color:#fff;font-family:monospace;padding:30px;border:3px solid red;border-radius:8px;z-index:99998;max-width:90%;max-height:80%;overflow:auto;';
  errorDisplay.innerHTML = `
    <h2 style="color: #ff4444; margin-top:0;">⚠️ Initialization Failed</h2>
    <p style="color: #ccc; margin-bottom: 15px;">The application failed to start. Please check the console for details.</p>
    <pre style="font-size: 10px; white-space: pre-wrap; word-wrap: break-word; background: #000; padding: 15px; border-radius: 4px; overflow: auto;">
${errorStack}
    </pre>
  `;
  document.body.appendChild(errorDisplay);
}