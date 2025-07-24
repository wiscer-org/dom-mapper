// DevTools panel script
// This runs in the PANEL context - separate from DevTools context
console.log("🎨 Panel context: DOM Mapper DevTools panel loaded");

// You can add interactive functionality here
document.addEventListener("DOMContentLoaded", () => {
  console.log("🎨 Panel context: DevTools panel DOM ready");

  // Initialize Text Mapper UI
  const textMapperContainer = document.getElementById("textMapperContainer");
  if (textMapperContainer && (window as any).TextMapperUI) {
    console.log("📝 Initializing Text Mapper UI");
    new (window as any).TextMapperUI(textMapperContainer);
  }

  // Add some visual feedback to show separate contexts
  const welcomeDiv = document.querySelector(".welcome-text");
  if (welcomeDiv) {
    welcomeDiv.innerHTML = `
      Welcome custom dev tools<br>
      <small style="color: #666;">Running in Panel Context</small>
    `;
  }
});

// Demonstrate separate context by showing different capabilities
console.log("🔍 Panel context capabilities:");
console.log("- Can access DOM:", !!document);
console.log("- Can access chrome.tabs:", !!chrome?.tabs);
console.log("- Can access chrome.devtools:", !!chrome?.devtools);
