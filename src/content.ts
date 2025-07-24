import DomMapper from "./DomMapper";

// Content script for DOMMapper Chrome Extension
console.log("DOMMapper content script loaded");

(() => {
  const domMapper = new DomMapper();
  domMapper.start();

  // Listen for messages from DevTools
  chrome.runtime.onMessage.addListener(
    (
      message: any,
      sender: chrome.runtime.MessageSender,
      sendResponse: (response: any) => void
    ) => {
      console.log("📨 Content script received message:", message);

      if (message.action === "executeTextMapper") {
        console.log("🎯 Executing Text Mapper from DevTools");
        console.log("📋 Search texts received:", message.searchTexts);

        // Handle the search texts array
        const searchTexts = message.searchTexts || [];

        if (searchTexts.length > 0) {
          console.log(
            `🔍 Processing ${searchTexts.length} search texts:`,
            searchTexts
          );
          // TODO: Use searchTexts for actual text mapping functionality
        } else {
          console.log("⚠️ No search texts provided");
        }

        // Send response back to DevTools
        sendResponse({
          success: true,
          message: "Text mapper executed successfully",
          searchTextsCount: searchTexts.length,
        });

        return true; // Keep the message channel open for async response
      }

      if (message.action === "panelClicked") {
        console.log("🎨 Panel was clicked");
        sendResponse({ success: true });
        return true;
      }

      // Default response for unknown actions
      sendResponse({ success: false, error: "Unknown action" });
      return true;
    }
  );
})();
