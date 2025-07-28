import DomMapper from "./DomMapper";
import { TextMapperResponse, TextMapperResponseData } from "./types";

// Content script for DOMMapper Chrome Extension
console.log("DOMMapper content script loaded");

(() => {
  const domMapper = new DomMapper();
  domMapper.start();

  // Listen for messages from DevTools
  chrome.runtime.onMessage.addListener(
    async (
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
        // Pointer to the next result
        let data: TextMapperResponseData = {
          textContentElementsCount: 0,
        };

        if (searchTexts.length > 0) {
          console.log(
            `🔍 Processing ${searchTexts.length} search texts:`,
            searchTexts
          );

          // Set the search texts as inputs
          const inputs = {
            textContents: searchTexts,
          };

          // Map by texts
          const domElementTree = domMapper.textMapper
            ? await domMapper.textMapper.createMap(inputs)
            : console.warn("text mapper is undefined");

          // The new DOM tree should be not void
          if (!domElementTree)
            throw new Error("DomMapper: Unable clone and trim DOM tree");

          const domTree = DomMapper.createTreeNode(domElementTree);

          // Attach the DOM string tree to the response's data
          data.domTree = domTree;

          console.log("📤 Content script sending data:", data);
        } else {
          console.log("⚠️ No search texts provided");
        }

        const response: TextMapperResponse = {
          success: true,
          message: "Text mapper executed successfully",
          searchTextsCount: searchTexts.length,
          // Include the data in the response
          data,
        };

        // Send response back to DevTools
        sendResponse(response);

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
