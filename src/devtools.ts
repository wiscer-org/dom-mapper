// DevTools script that creates a custom panel
// This runs in the DevTools context - separate from the panel
declare const chrome: any;

console.log("🔧 DevTools context: Initializing DOM Mapper DevTools");

chrome.devtools.panels.create(
  "DOM Mapper", // Panel title
  "icon16.png", // Icon path (optional, can be null)
  "devtools-panel.html", // Panel HTML file
  (panel: any) => {
    console.log("✅ DevTools context: DOM Mapper panel created successfully");

    // This callback runs in DevTools context, not panel context
    panel.onShown.addListener((window: any) => {
      console.log("👁️ DevTools context: Panel is now visible");
    });

    panel.onHidden.addListener(() => {
      console.log("👁️ DevTools context: Panel is now hidden");
    });
  }
);
