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
  const [removeRandomClasses, setRemoveRandomClasses] = useState(true);
  const [removeAngularClasses, setRemoveAngularClasses] = useState(true);

  // Establish background connection
  useEffect(() => {
    establishBackgroundConnection();
  }, []);

  const establishBackgroundConnection = useCallback(() => {
    try {
      const port = chrome.runtime.connect({ name: "devtools-panel" });
      // console.log("[DOMMapper][DevTools] Connection established with background script");

      port.onMessage.addListener((response: any) => {
        // console.log("[DOMMapper][DevTools] Received response from background ",response);

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
        // console.log("[DOMMapper][DevTools] Connection to background script lost");
        setConnection((prev) => ({ ...prev, port: null }));

        setTimeout(() => {
          // console.log("[DOMMapper][DevTools] Attempting to reconnect...");
          establishBackgroundConnection();
        }, 1000);
      });

      setConnection((prev) => ({ ...prev, port }));
    } catch (error) {
      console.error(
        "[DOMMapper][DevTools] Failed to connect to background script:",
        error
      );
    }
  }, [connection.pendingRequests]);

  const sendMessageToBackground = useCallback(
    (message: any): Promise<any> => {
      return new Promise((resolve) => {
        if (!connection.port) {
          console.error(
            "[DOMMapper][DevTools] No connection to background script"
          );
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
        connection.port.postMessage(messageWithId);
        // console.log(
        //   "[DOMMapper][DevTools] Sending message to background:",
        //   messageWithId
        // );

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

  return (
    <>
      <div id="dommapper-options">
        <h2>Options</h2>
        {/* This options should extend the `TextMapper.TextMapperOptions */}
        <label>
          <input
            type="checkbox"
            checked={removeRandomClasses}
            onChange={(e) => setRemoveRandomClasses(e.target.checked)}
          />
          Remove randomly generated class names (has more than 3 numbers)
        </label>
        <label>
          <input
            type="checkbox"
            checked={removeAngularClasses}
            onChange={(e) => setRemoveAngularClasses(e.target.checked)}
          />
          Remove Angular generated class names (prefixed with "ng-", "cdk",
          etc.)
        </label>
      </div>
      <TextMapperPanel
        sendMessage={sendMessageToBackground}
        options={{
          removeRandomClasses,
          removeAngularClasses,
        }}
      />
    </>
  );
};

const App: React.FC = () => {
  return (
    <div className="container">
      {/* 
      <div className="welcome-text">
          <br />
          <small style={{ color: "#666" }}>Running in React Panel Context</small> 
      </div> 
      */}

      {/* <div className="status">✅ DevTools panel is ready</div> */}

      <DevToolsPanel />
    </div>
  );
};

// Initialize React app
document.addEventListener("DOMContentLoaded", () => {
  // console.log(
  //   "[DOMMapper][DevTools] React Panel context: DevTools panel DOM ready"
  // );

  const container = document.getElementById("root");
  if (container) {
    const root = createRoot(container);
    root.render(<App />);
    // console.log("[DOMMapper][DevTools] React: DevTools panel rendered");
  }
});
