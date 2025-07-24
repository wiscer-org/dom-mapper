import React, { useState, useEffect, useCallback } from "react";
import { createRoot } from "react-dom/client";
import TextMapperPanel from "./components/TextMapperPanel";

interface BackgroundConnection {
  port: chrome.runtime.Port | null;
  pendingRequests: Map<string, (response: any) => void>;
}

const DevToolsPanel: React.FC = () => {
  const [connection, setConnection] = useState<BackgroundConnection>({
    port: null,
    pendingRequests: new Map(),
  });

  // Establish background connection
  useEffect(() => {
    establishBackgroundConnection();
  }, []);

  const establishBackgroundConnection = useCallback(() => {
    try {
      const port = chrome.runtime.connect({ name: "devtools-panel" });
      console.log("🔌 DevTools: Connection established with background script");

      port.onMessage.addListener((response: any) => {
        console.log(
          "📨 DevTools: Received response from background:",
          response
        );

        if (
          response.requestId &&
          connection.pendingRequests.has(response.requestId)
        ) {
          const callback = connection.pendingRequests.get(response.requestId);
          if (callback) {
            callback(response);
            connection.pendingRequests.delete(response.requestId);
          }
        }
      });

      port.onDisconnect.addListener(() => {
        console.log("🔌 DevTools: Connection to background script lost");
        setConnection((prev) => ({ ...prev, port: null }));

        setTimeout(() => {
          console.log("🔄 DevTools: Attempting to reconnect...");
          establishBackgroundConnection();
        }, 1000);
      });

      setConnection((prev) => ({ ...prev, port }));
    } catch (error) {
      console.error(
        "❌ DevTools: Failed to connect to background script:",
        error
      );
    }
  }, [connection.pendingRequests]);

  const sendMessageToBackground = useCallback(
    (message: any): Promise<any> => {
      return new Promise((resolve) => {
        if (!connection.port) {
          console.error("❌ DevTools: No connection to background script");
          resolve({
            success: false,
            error: "No connection to background script",
          });
          return;
        }

        const requestId = `req_${Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 9)}`;
        connection.pendingRequests.set(requestId, resolve);

        const messageWithId = { ...message, requestId };
        console.log(
          "📤 DevTools: Sending message to background:",
          messageWithId
        );
        connection.port.postMessage(messageWithId);

        setTimeout(() => {
          if (connection.pendingRequests.has(requestId)) {
            connection.pendingRequests.delete(requestId);
            resolve({ success: false, error: "Request timeout" });
          }
        }, 10000);
      });
    },
    [connection.port, connection.pendingRequests]
  );

  return <TextMapperPanel sendMessage={sendMessageToBackground} />;
};

const App: React.FC = () => {
  return (
    <div className="container">
      <h1>🛠️ DOM Mapper DevTools</h1>
      <div className="welcome-text">
        Welcome custom dev tools
        <br />
        <small style={{ color: "#666" }}>Running in React Panel Context</small>
      </div>
      <div className="status">✅ DevTools panel is ready</div>
      <p>This is your custom DOM Mapper development tools panel.</p>

      <DevToolsPanel />
    </div>
  );
};

// Initialize React app
document.addEventListener("DOMContentLoaded", () => {
  console.log("🎨 React Panel context: DevTools panel DOM ready");

  const container = document.getElementById("root");
  if (container) {
    const root = createRoot(container);
    root.render(<App />);
    console.log("⚛️ React: DevTools panel rendered");
  }
});
