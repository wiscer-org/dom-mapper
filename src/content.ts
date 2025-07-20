import DomMapper from "./DomMapper";

// Content script for DOMMapper Chrome Extension
console.log("DOMMapper content script loaded");

(() => {
  const domMapper = new DomMapper();
  domMapper.start();
})();
