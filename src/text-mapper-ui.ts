// Text Mapper module for DevTools panel
// This handles the Text Mapper functionality

export class TextMapperUI {
  private container: HTMLElement;
  private backgroundPort: any = null;
  private pendingRequests: Map<string, (response: any) => void> = new Map();

  constructor(container: HTMLElement) {
    this.container = container;
    this.init();
  }

  private init() {
    this.establishBackgroundConnection();
    this.render();
    this.attachEventListeners();
  }

  private establishBackgroundConnection() {
    try {
      // Establish persistent connection with background script
      this.backgroundPort = chrome.runtime.connect({ name: "devtools-panel" });
      console.log("🔌 DevTools: Connection established with background script");

      // Listen for messages from background script
      this.backgroundPort.onMessage.addListener((response: any) => {
        console.log(
          "📨 DevTools: Received response from background:",
          response
        );

        // Handle response using request ID
        if (
          response.requestId &&
          this.pendingRequests.has(response.requestId)
        ) {
          const callback = this.pendingRequests.get(response.requestId);
          if (callback) {
            callback(response);
            this.pendingRequests.delete(response.requestId);
          }
        }
      });

      // Handle connection disconnect
      this.backgroundPort.onDisconnect.addListener(() => {
        console.log("🔌 DevTools: Connection to background script lost");
        this.backgroundPort = null;

        // Attempt to reconnect after a delay
        setTimeout(() => {
          console.log("🔄 DevTools: Attempting to reconnect...");
          this.establishBackgroundConnection();
        }, 1000);
      });
    } catch (error) {
      console.error(
        "❌ DevTools: Failed to connect to background script:",
        error
      );
    }
  }

  private sendMessageToBackground(message: any): Promise<any> {
    return new Promise((resolve) => {
      if (!this.backgroundPort) {
        console.error("❌ DevTools: No connection to background script");
        resolve({
          success: false,
          error: "No connection to background script",
        });
        return;
      }

      // Generate unique request ID
      const requestId = `req_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;

      // Store the callback
      this.pendingRequests.set(requestId, resolve);

      // Send message with request ID
      const messageWithId = { ...message, requestId };
      console.log("📤 DevTools: Sending message to background:", messageWithId);
      this.backgroundPort.postMessage(messageWithId);

      // Set timeout for request
      setTimeout(() => {
        if (this.pendingRequests.has(requestId)) {
          this.pendingRequests.delete(requestId);
          resolve({ success: false, error: "Request timeout" });
        }
      }, 10000); // 10 second timeout
    });
  }

  private render() {
    const textMapperSection = document.createElement("div");
    textMapperSection.className = "text-mapper-section";
    textMapperSection.innerHTML = `
      <div class="section-header">
        <h2>📝 Text Mapper</h2>
        <p>Map DOM elements by their text content</p>
      </div>
      <div class="section-content">
        <button id="mapByTextsBtn" class="map-button">
          🎯 Map by Texts
        </button>
        <div class="status-text" id="textMapperStatus">
          Ready to map elements
        </div>
      </div>
    `;

    this.container.appendChild(textMapperSection);
  }

  private attachEventListeners() {
    const mapButton = document.getElementById("mapByTextsBtn");
    const statusDiv = document.getElementById("textMapperStatus");

    if (mapButton && statusDiv) {
      mapButton.addEventListener("click", () => {
        this.executeTextMapping(statusDiv);
      });
    }
  }

  private async executeTextMapping(statusDiv: HTMLElement) {
    try {
      statusDiv.textContent = "Connecting to background script...";
      statusDiv.className = "status-text loading";

      // Get the DevTools inspected tab ID
      const tabId = chrome.devtools.inspectedWindow.tabId;
      console.log("🎯 DevTools inspected tab ID:", tabId);

      if (!tabId) {
        console.error("❌ No inspected tab ID found");
        statusDiv.textContent = "Error: No inspected tab found";
        statusDiv.className = "status-text error";
        return;
      }

      // Update status
      statusDiv.textContent = "Sending command via background connection...";

      // Send message via connection to background script
      const response = await this.sendMessageToBackground({
        action: "executeTextMapper",
        tabId: tabId,
      });

      console.log("📨 DevTools: Final response:", response);

      if (response.success) {
        console.log("✅ Text mapper executed successfully via connection");
        statusDiv.textContent = "Text mapper executed successfully!";
        statusDiv.className = "status-text success";

        // Reset status after 3 seconds
        setTimeout(() => {
          statusDiv.textContent = "Ready to map elements";
          statusDiv.className = "status-text";
        }, 3000);
      } else {
        console.error("❌ Error response:", response);
        const errorMsg = response.error || "Unknown error occurred";
        statusDiv.textContent = `Error: ${errorMsg}`;
        statusDiv.className = "status-text error";
      }
    } catch (error) {
      console.error("❌ Text mapping error:", error);
      statusDiv.textContent = "Error executing text mapper";
      statusDiv.className = "status-text error";
    }
  }
}

// Make it available globally for the main devtools-panel script
(window as any).TextMapperUI = TextMapperUI;
