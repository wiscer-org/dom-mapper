// DevTools script that creates a custom panel
// This runs in the DevTools context - separate from the panel

console.log("[DOMMapper][DevTools] Initializing DOM Mapper DevTools");

chrome.devtools.panels.create(
  "DOM Mapper", // Panel title, this will be read first when the panel is focused. It will be read '<title> Panel Propery Page'
  "icon16.png", // Icon path (optional, can be null)
  "devtools-panel.html", // Panel HTML file
  (panel: any) => {
    console.log("[DOMMapper][DevTools] panel created successfully");

    // This callback runs in DevTools context, not panel context
    panel.onShown.addListener(async (window: any) => {
      // Note: The screen reader is expected to read something like 'DOM Mapper Panel ..' so the SR users will know when the panel is shown
      // However, this sometimes not working when switching between panels.
      // To ensure the screen reader to read 'DOM Maper Panel ..', we will focus to the H1 element, wait a bit, the focus to the input box.

      // Focus the first interactive element or main heading
      const h1 = window.document.querySelector('h1');
      h1?.focus();

      // Wait a little bit
      await new Promise((resolve) => setTimeout(resolve, 200));

      // Note: The input class name must matches the one in the TextMapperPanel component
      const firstInput = window.document.querySelector(".search-input") as HTMLInputElement;
      firstInput?.focus();

      // console.log("[DOMMapper][DevTools] DevTools panel is now visible");
    });

    panel.onHidden.addListener(() => {

      // console.log("[DOMMapper][DevTools] Panel is now hidden");
    });
  }
);
