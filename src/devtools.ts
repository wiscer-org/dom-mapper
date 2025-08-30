// DevTools script that creates a custom panel
// This runs in the DevTools context - separate from the panel

console.log("🔧 DevTools context: Initializing DOM Mapper DevTools");

chrome.devtools.panels.create(
  "DOM Mapper", // Panel title, this will be read first when the panel is focused. It will be read '<title> Panel Propery Page'
  "icon16.png", // Icon path (optional, can be null)
  "devtools-panel.html", // Panel HTML file
  (panel: any) => {
    console.log("✅ DevTools context: DOM Mapper panel created successfully");

    // This callback runs in DevTools context, not panel context
    panel.onShown.addListener((window: any) => {
      // Focus the first interactive element or main heading
      const h1 = window.document.querySelector('h1');
      // h1.focus();
      console.log(h1)

      // Note: The input class name must matches the one in the TextMapperPanel component
      const firstInput = window.document.querySelector(".search-input") as HTMLInputElement;
      firstInput?.focus();

      console.log("[DOMMapper] [DevTools] DevTools panel is now visible");
    });

    panel.onHidden.addListener(() => {
      const h1 = window.document.querySelector('h1');
      h1?.focus();

      console.log("👁️ DevTools context: Panel is now hidden");
    });
  }
);
