import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App";
import "./styles.css";

console.log("🚀 WesWorld client starting...");

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
  console.log("✅ Creating React root...");
  const rootElement = document.getElementById("root");
  if (!rootElement) {
    throw new Error("Root element not found!");
  }

  const root = ReactDOM.createRoot(rootElement);
  console.log("✅ Rendering App...");

  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>
  );

  console.log("✅ App rendered successfully");
} catch (error) {
  console.error("❌ Failed to initialize app:", error);
  document.body.innerHTML = `
    <div style="padding: 40px; color: #fff; font-family: monospace;">
      <h1 style="color: #ff4444;">Failed to Initialize</h1>
      <pre style="background: #1a1a1a; padding: 20px; border-radius: 8px; overflow: auto;">
        ${error instanceof Error ? error.stack : String(error)}
      </pre>
    </div>
  `;
}