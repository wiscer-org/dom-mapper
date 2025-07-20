# Changelog

All notable changes to the DOMMapper Chrome Extension project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

- Content script create hidden element with aria-live attribute to announce to screen reader. This used as debugging tool.
- Clone DOM with content script.
- Clean elements of the cloned DOM in content script.
- Convert the cloned DOM to background, then relay to custom Dev Tool.
- Render Custom Dev Tool with React.
- Custom Dev Tool display as tree view with React library: accessible-tree-view.

## [0.1.0] - 2025-07-20

### Added

- Initial Chrome extension setup with Manifest v3
- DOM mapping functionality for interactive elements (buttons, inputs, links, selects, textareas)
- Content script targeting gemini.google.com with floating UI interface
- Background service worker
- Vite build system with TypeScript support
- Development tools:
  - ESLint with TypeScript rules
  - Hot reload extension for development
  - Watch mode for automatic rebuilds

### Technical Details

- **Target Platform**: Chrome Extensions Manifest V3
- **Technologies**: TypeScript, Vite, Vanilla DOM APIs
- **Target Website**: gemini.google.com
- **Build Output**: Self-contained JavaScript files (IIFE format)
- **File Structure**:
  - `src/main.ts` - Popup interface
  - `src/content.ts` - Content script for DOM mapping
  - `src/background.ts` - Background service worker
  - `public/manifest.json` - Extension configuration
  - `public/popup.html` - Popup HTML template

### Development Notes

- Content script builds as IIFE (Immediately Invoked Function Expression) to avoid ES6 import issues
- Extension restricted to gemini.google.com domain for focused functionality
- Project architecture chosen for simplicity and Chrome extension compatibility
