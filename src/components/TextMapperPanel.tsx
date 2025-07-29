import React, { useState } from "react";
import TreeView, { flattenTree, INode } from "react-accessible-treeview";
import { ITreeNode, DOMTreeNode, TextMapperResponse } from "../types";
import treeViewStyles from "./TreeView.module.css";

interface TextMapperPanelProps {
  sendMessage: (message: any) => Promise<TextMapperResponse>;
}

const TextMapperPanel: React.FC<TextMapperPanelProps> = ({ sendMessage }) => {
  const [searchTexts, setSearchTexts] = useState<string[]>(["", "", ""]);
  const [status, setStatus] = useState("Ready to map elements");
  const [statusClass, setStatusClass] = useState("status-text");
  const [treeData, setTreeData] = useState<INode[] | null>(null);

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

        // Process tree data if available
        if (response.data?.domTree) {
          try {
            const flatData = flattenTree(response.data.domTree);
            setTreeData(flatData);
            console.log("🌳 Tree data processed:", flatData);
          } catch (error) {
            console.error("❌ Error processing tree data:", error);
          }
        }

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

        {/* Render TreeView when tree data is available */}
        {treeData && (
          <div className={treeViewStyles.treeViewContainer}>
            <h3 className={treeViewStyles.treeViewTitle}>DOM Tree View</h3>
            <div className={treeViewStyles.treeViewWrapper}>
              <TreeView
                data={treeData}
                aria-label="DOM Tree"
                multiSelect={false}
                propagateSelect={false}
                expandOnKeyboardSelect={true}
                nodeRenderer={({
                  element,
                  isBranch,
                  isExpanded,
                  getNodeProps,
                  level,
                }) => (
                  <div
                    {...getNodeProps()}
                    className={treeViewStyles.treeNode}
                    style={{
                      paddingLeft: `${level * 20}px`,
                    }}
                  >
                    {isBranch && (
                      <span className={treeViewStyles.treeNodeExpander}>
                        {isExpanded ? "▼" : "▶"}
                      </span>
                    )}
                    <span className={treeViewStyles.treeNodeTag}>
                      {element.metadata?.tagName || element.name}
                    </span>
                    {element.metadata?.id && (
                      <span className={treeViewStyles.treeNodeId}>
                        #{element.metadata.id}
                      </span>
                    )}
                    {element.metadata?.className && (
                      <span className={treeViewStyles.treeNodeClass}>
                        .{element.metadata.className}
                      </span>
                    )}
                    {element.metadata?.textContent && (
                      <span className={treeViewStyles.treeNodeText}>
                        "
                        {typeof element.metadata.textContent === "string"
                          ? element.metadata.textContent.substring(0, 50)
                          : element.metadata.textContent}
                        ..."
                      </span>
                    )}
                  </div>
                )}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TextMapperPanel;
