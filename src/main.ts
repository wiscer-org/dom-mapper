// Main popup script for DOMMapper Chrome Extension
console.log("DOMMapper popup loaded");

// Create the popup content
const createPopupContent = () => {
  const root = document.getElementById("root");
  if (root) {
    root.innerHTML = `
      <div style="
        font-family: Arial, sans-serif;
        padding: 20px;
        min-width: 300px;
        text-align: center;
      ">
        <h2 style="
          color: #4285f4;
          margin: 0 0 20px 0;
          font-size: 18px;
        ">
          📍 DOMMapper Extension
        </h2>
        <p style="
          color: #666;
          margin: 0 0 20px 0;
          font-size: 14px;
        ">
          Click on the extension icon on any Gemini page to start mapping DOM elements.
        </p>
        <div style="
          background-color: #f8f9fa;
          padding: 15px;
          border-radius: 8px;
          border: 1px solid #e0e0e0;
          font-size: 12px;
          color: #666;
        ">
          <strong>How to use:</strong><br>
          1. Navigate to gemini.google.com<br>
          2. Look for the "📍 DOM Mapper" button<br>
          3. Click to open the DOM mapper interface
        </div>
      </div>
    `;
  }
};

// Initialize the popup when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", createPopupContent);
} else {
  createPopupContent();
}
