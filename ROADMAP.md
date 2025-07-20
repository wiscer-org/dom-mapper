# Roadmap

This document outlines the planned features and improvements for the DOMMapper Chrome Extension.

## Future Versions

### v0.2.0 - Enhanced DOM Processing (Planned)

#### DOM Cleanup Features

- **Remove unwanted attribute names in the cloned DOM**

  - Filter out development-specific attributes (e.g., `data-testid`, `data-cy`)
  - Remove framework-specific attributes (e.g., `ng-*`, `v-*`, `react-*`)
  - Configurable attribute blacklist
  - Preserve essential attributes (id, class, name, type, etc.)

- **Remove unwanted attribute values in the cloned DOM**
  - Clean up auto-generated class names (e.g., CSS-in-JS hashes)
  - Filter out dynamic values (timestamps, session IDs)
  - Normalize attribute values for better readability
  - Configurable value filtering rules

#### Enhanced Visualization

- **Use third party to display the tree**
  - Integration with tree visualization library (candidates: accessible-tree-view)
  - Interactive DOM tree navigation
  - Collapsible/expandable nodes
  - Visual hierarchy representation

### v0.3.0 - Advanced Features (Ideas)

#### Enhanced Mapping

- Search and filter capabilities within the tree
- CSS selector generation for mapped elements
- Element highlighting on hover

#### Export & Import

- Export mapped DOM structure to JSON

#### Configuration & Settings

- User-configurable filtering rules
- Custom attribute whitelist/blacklist

## Technical Considerations

### Accuracy

- Consider wait for elements to be rendered on dynamic page.
- Consider not all elements are rendered if the last visible elements not inside the viewport. Usually list items.

### Performance

- Lazy loading for large DOM trees
- Web Workers for heavy DOM processing
- Memory optimization for large documents

### Architecture

- Event-driven architecture for real-time updates

## Contributing

We welcome contributions to help implement these features! Please check the GitHub issues for specific tasks and feel free to propose new ideas.

---

_This roadmap is subject to change based on user feedback and development priorities._
