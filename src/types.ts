// Types for react-accessible-treeview integration
// This interface matches what flattenTree expects as input

export interface ITreeNode {
  id?: number | string;
  name: string;
  isBranch?: boolean;
  children?: ITreeNode[];
  metadata?: Record<string, string | number | boolean | undefined | null>;
}

// Additional types that might be useful for the DOM tree
export interface DOMTreeMetadata {
  tagName: string;
  id?: string;
  className?: string;
  textContent?: string;
  xpath?: string;
  depth?: number;
  // Attributes will be flattened into individual properties
  [key: string]: string | number | boolean | undefined | null;
}

// Extended tree node specifically for DOM elements
export interface DOMTreeNode extends ITreeNode {
  metadata?: DOMTreeMetadata;
}
