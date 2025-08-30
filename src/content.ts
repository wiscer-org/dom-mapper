import DomMapper from "./DomMapper";
import { TextMapperResponse, TextMapperResponseData } from "./types";


// Content script for DOMMapper Chrome Extension
console.log("[DOMMapper] [content]: script is loaded");

// Init the library
const domMapper = new DomMapper();
// FIXME: Should await
domMapper.start();


(() => {


  // Listen for messages from DevTools relayed by the background script.
  chrome.runtime.onMessage.addListener(
    // IMPORTANT: Do not use async here. For the port to stay open provide non-async and returning `true`. Use the sendResponse function
    (
      message: any,
      sender: chrome.runtime.MessageSender,
      sendResponse: (response: any) => void
    ) => {
      console.log("[DOMMapper] [content]: received message:", message);

      if (message.action === "executeTextMapper") {
        executeTextMapper(message, sender, sendResponse);
      } else if (message.action === "panelClicked") {
        panelClicked(sendResponse);
      } else {
        // Default response for unknown actions
        sendResponse({ success: false, error: "Unknown action" });
      }

      // Keep the message channel open for async response
      return true;
    }
  );
})();
/**
 * Execute the text mapper logic
 * @returns 
 */
async function executeTextMapper(
  message: any,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response: any) => void)
  : Promise<void> {

  console.log("[DOMMapper] [content]: Executing Text Mapper from DevTools");



  console.log("[DOMMapper] [content]: Search texts received:", message.searchTexts);

  // Handle the search texts array
  const searchTexts = message.searchTexts || [];
  const options = message.options || {};

  // Pointer to the next result
  let data: TextMapperResponseData = {
    textContentElementsCount: 0,
  };

  if (searchTexts.length > 0) {
    console.log(
      `[DOMMapper] [content]: Processing ${searchTexts.length} search texts:`,
      searchTexts
    );

    // Set the search texts as inputs
    const inputs = {
      textContents: searchTexts,
    };

    console.log('textMapper');
    console.log(domMapper);

    // Map by texts
    const domElementTree = domMapper.textMapper
      ? await domMapper.textMapper.createMap(inputs)
      : console.warn("text mapper is undefined");

    // The new DOM tree should be not void
    if (!domElementTree)
      throw new Error("[DOMMapper] [content]: Unable clone and trim DOM tree");

    const domTree = DomMapper.createTreeNode(domElementTree);

    // Attach the DOM string tree to the response's data
    data.domTree = domTree;
    console.log("[DOMMapper] [content]: sending data:", data);
  } else {
    console.log("[DOMMapper] [content]: No search texts provided");
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

  // return true; // Keep the message channel open for async response
}

/**
 * This is only a test function to verify message passing
 */
async function panelClicked(sendResponse: (response: any) => void): Promise<void> {
  console.log("[DOMMapper] [content] Panel was clicked");
  sendResponse({ success: true });
}

