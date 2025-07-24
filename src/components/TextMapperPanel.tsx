import React, { useState } from "react";

interface TextMapperPanelProps {
  sendMessage: (message: any) => Promise<any>;
}

const TextMapperPanel: React.FC<TextMapperPanelProps> = ({ sendMessage }) => {
  const [searchTexts, setSearchTexts] = useState<string[]>(["", "", ""]);
  const [status, setStatus] = useState("Ready to map elements");
  const [statusClass, setStatusClass] = useState("status-text");

  const handleSearchTextChange = (index: number, value: string) => {
    setSearchTexts((prev) => {
      const newTexts = [...prev];
      newTexts[index] = value;
      return newTexts;
    });
  };

  const addSearchInput = () => {
    setSearchTexts((prev) => [...prev, ""]);
  };

  const getSearchTexts = (): string[] => {
    return searchTexts.filter((text) => text.trim() !== "");
  };

  const executeTextMapping = async () => {
    try {
      setStatus("Connecting to background script...");
      setStatusClass("status-text loading");

      const tabId = chrome.devtools.inspectedWindow.tabId;
      console.log("🎯 DevTools inspected tab ID:", tabId);

      if (!tabId) {
        console.error("❌ No inspected tab ID found");
        setStatus("Error: No inspected tab found");
        setStatusClass("status-text error");
        return;
      }

      setStatus("Sending command via background connection...");

      const searchTextsArray = getSearchTexts();
      const response = await sendMessage({
        action: "executeTextMapper",
        tabId: tabId,
        searchTexts: searchTextsArray,
      });

      console.log("📨 TextMapperPanel: Final response:", response);

      if (response.success) {
        console.log("✅ Text mapper executed successfully via connection");
        setStatus("Text mapper executed successfully!");
        setStatusClass("status-text success");

        setTimeout(() => {
          setStatus("Ready to map elements");
          setStatusClass("status-text");
        }, 3000);
      } else {
        console.error("❌ Error response:", response);
        const errorMsg = response.error || "Unknown error occurred";
        setStatus(`Error: ${errorMsg}`);
        setStatusClass("status-text error");
      }
    } catch (error) {
      console.error("❌ Text mapping error:", error);
      setStatus("Error executing text mapper");
      setStatusClass("status-text error");
    }
  };

  return (
    <div className="text-mapper-section">
      <div className="section-header">
        <h2>📝 Text Mapper #2</h2>
        <p>Map DOM elements by their text content</p>
      </div>
      <div className="section-content">
        <div className="search-inputs">
          {searchTexts.map((text, index) => (
            <input
              key={index}
              type="text"
              className="search-input"
              placeholder="Enter text to search..."
              value={text}
              onChange={(e) => handleSearchTextChange(index, e.target.value)}
            />
          ))}
        </div>
        <button className="add-input-button" onClick={addSearchInput}>
          ➕ Add Input
        </button>
        <button className="map-button" onClick={executeTextMapping}>
          🎯 Map by Texts
        </button>
        <div className={statusClass}>{status}</div>
      </div>
    </div>
  );
};

export default TextMapperPanel;
