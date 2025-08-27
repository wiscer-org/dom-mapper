// Background script for DOMMapper Chrome Extension
console.log("DOMMapper Background: script loaded");

// Handle connections from DevTools panel
chrome.runtime.onConnect.addListener((port: any) => {
  console.log("DOMMapper Background: Connection established from:", port.name);

  if (port.name === "devtools-panel") {
    console.log("DOMMapper Background: DevTools panel connected");

    // Listen for messages on this connection
    port.onMessage.addListener((message: any) => {
      console.log("DOMMapper Background: Received message via connection:", message);

      if (message.action === "executeTextMapper") {
        console.log("DOMMapper Background: Processing Text Mapper request");

        const tabId = message.tabId;

        if (!tabId) {
          console.error("DOMMapper Background: No tab ID provided");
          port.postMessage({
            success: false,
            error: "No tab ID provided",
            requestId: message.requestId,
          });
          return;
        }

        // Forward the message to content script
        chrome.tabs.sendMessage(
          tabId,
          {
            action: "executeTextMapper",
            source: "background-forwarded",
            searchTexts: message.searchTexts, // Forward the searchTexts
          },
          (response: any) => {
            console.log(
              "DOMMapper Background: Response from content script:",
              response
            );

            if (chrome.runtime.lastError) {
              console.error(
                "DOMMapper Background: Error communicating with content script:",
                chrome.runtime.lastError
              );

              // Send error response back via connection
              if (
                chrome.runtime.lastError.message?.includes(
                  "Receiving end does not exist"
                )
              ) {
                port.postMessage({
                  success: false,
                  error:
                    "Content script not loaded. Please navigate to gemini.google.com and reload the page.",
                  requestId: message.requestId,
                });
              } else {
                port.postMessage({
                  success: false,
                  error: chrome.runtime.lastError.message,
                  requestId: message.requestId,
                });
              }
            } else {
              // Forward the response back to DevTools via connection
              port.postMessage({
                ...response,
                requestId: message.requestId,
              });
            }
          }
        );
      } else {
        console.log("🤷 Background: Unknown message action:", message.action);
        port.postMessage({
          success: false,
          error: "Unknown action",
          requestId: message.requestId,
        });
      }
    });

    // Handle connection disconnect
    port.onDisconnect.addListener(() => {
      console.log("DOMMapper Background: DevTools panel disconnected");
    });
  }
});

// Keep the old message listener for other extension components
chrome.runtime.onMessage.addListener(
  (message: any, sender: any, sendResponse: any) => {
    console.log("DOMMapper Background: Received runtime message:", message);

    // Handle messages from content script or other sources
    if (message.source !== "devtools-text-mapper") {
      // Process other messages here
      sendResponse({ success: true, source: "background" });
    }

    return true;
  }
);
