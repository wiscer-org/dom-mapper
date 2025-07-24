import React, { useState, useEffect, useCallback } from "react";
import { createRoot } from "react-dom/client";

interface BackgroundConnection {
  port: chrome.runtime.Port | null;
  pendingRequests: Map<string, (response: any) => void>;
}

const DevToolsPanel: React.FC = () => {
  const [searchTexts, setSearchTexts] = useState<string[]>(["", "", ""]);
  const [status, setStatus] = useState("Ready to map elements");
  const [statusClass, setStatusClass] = useState("status-text");
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

  const handleSearchTextChange = (index: number, value: string) => {
    setSearchTexts((prev) => {
      const newTexts = [...prev];
      newTexts[index] = value;
      return newTexts;
    });
  };

  const addSearchInput = () => {
    setSearchTexts((prev) => [...prev, ""]);
  };

  const getSearchTexts = (): string[] => {
    return searchTexts.filter((text) => text.trim() !== "");
  };

  const executeTextMapping = async () => {
    try {
      setStatus("Connecting to background script...");
      setStatusClass("status-text loading");

      const tabId = chrome.devtools.inspectedWindow.tabId;
      console.log("🎯 DevTools inspected tab ID:", tabId);

      if (!tabId) {
        console.error("❌ No inspected tab ID found");
        setStatus("Error: No inspected tab found");
        setStatusClass("status-text error");
        return;
      }

      setStatus("Sending command via background connection...");

      const searchTextsArray = getSearchTexts();
      const response = await sendMessageToBackground({
        action: "executeTextMapper",
        tabId: tabId,
        searchTexts: searchTextsArray,
      });

      console.log("📨 DevTools: Final response:", response);

      if (response.success) {
        console.log("✅ Text mapper executed successfully via connection");
        setStatus("Text mapper executed successfully!");
        setStatusClass("status-text success");

        setTimeout(() => {
          setStatus("Ready to map elements");
          setStatusClass("status-text");
        }, 3000);
      } else {
        console.error("❌ Error response:", response);
        const errorMsg = response.error || "Unknown error occurred";
        setStatus(`Error: ${errorMsg}`);
        setStatusClass("status-text error");
      }
    } catch (error) {
      console.error("❌ Text mapping error:", error);
      setStatus("Error executing text mapper");
      setStatusClass("status-text error");
    }
  };

  return (
    <div className="text-mapper-section">
      <div className="section-header">
        <h2>📝 Text Mapper</h2>
        <p>Map DOM elements by their text content</p>
      </div>
      <div className="section-content">
        <div className="search-inputs">
          {searchTexts.map((text, index) => (
            <input
              key={index}
              type="text"
              className="search-input"
              placeholder="Enter text to search..."
              value={text}
              onChange={(e) => handleSearchTextChange(index, e.target.value)}
            />
          ))}
        </div>
        <button className="add-input-button" onClick={addSearchInput}>
          ➕ Add Input
        </button>
        <button className="map-button" onClick={executeTextMapping}>
          🎯 Map by Texts
        </button>
        <div className={statusClass}>{status}</div>
      </div>
    </div>
  );
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
