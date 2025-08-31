import DomMapper from "./DomMapper";

type TextMapperInput = {
  // Text content of element to be mapped. All text contents need to be unique in the document.
  textContents: string[];
};

type TextMapperOptions = {
  // Remove classes or attributes that seems related to angular
  removeAngularClasses?: boolean;
  // Remove random generated classes. This could be identified > 3 numbers in a string
  removeRandomClasses?: boolean;
};

const defaultOptions: TextMapperOptions = {
  removeAngularClasses: true,
  removeRandomClasses: true,
};

export default class TextMapper {
  private parent: DomMapper;
  static KEEP_ELEMENT: string = "text-wrapper-keep";
  // HTML elements that contains the given texrt contents
  textContentElements: HTMLElement[] = [];

  constructor(parent: DomMapper) {
    this.parent = parent;
    this.init();
  }

  async init() {
    // Wait a little for DOM and screen reader is ready
    await new Promise((r) => setTimeout(r, 300));

    // Initialization logic for TextMapper
    this.parent.announce({
      msg: "Text Mapper is ready",
    });
    console.log("[DOMMapper][TextMapper] ready to interact with text content");
  }

  async createMap(
    input: TextMapperInput,
    initialOptions: Partial<TextMapperOptions>
  ): Promise<HTMLElement> {

    // Merge default options with initial options
    const options: TextMapperOptions = { ...defaultOptions, ...initialOptions };

    // Clone the document
    this.parent.announce({ msg: "cloning dom tree" });
    let domTree: HTMLElement = document.documentElement.cloneNode(
      true
    ) as HTMLElement;

    // Find all direct elements that contain the text nodes in the document
    this.parent.announce({ msg: "Finding elements by texts" });
    this.textContentElements = await this.findElementsByTextContents(
      domTree,
      input
    );

    // Check if elements with the given texts are found
    if (this.textContentElements.length === 0) {
      console.warn("[TextMapper] Can't find elements for the given texts");
      console.warn(input);
    }

    // Mark all the elements we want to keep by adding `TextMapper.KEEP_ELEMENT` attribute to them.
    this.parent.announce({
      msg: `Mark all parent elements with TextMapper.KEEP_ELEMENT`,
    });
    await this.markAllParentElements(domTree, this.textContentElements);

    // Remove all elements that are not marked with `TextMapper.KEEP_ELEMENT` attribute.
    this.parent.announce({
      msg: `Removing all elements that does not have ${TextMapper.KEEP_ELEMENT} attribute`,
    });
    await this.removeChildrenWithoutMark(domTree);

    // Remove the added attribute
    await this.removeMarkAttribute(domTree);

    // Apply the options
    if (options.removeRandomClasses) {
      this.removeRandomClasses(domTree);
    }
    if (options.removeAngularClasses) {
      this.removeAngularClasses(domTree);
    }

    // We have a new DOM tree with only the elements we want to keep.
    this.parent.announce({ msg: "About to send the cloned DOM to background" });

    // Remove HTML comments
    await this.removeComments(domTree);

    // Remove the unwanted attributes
    await this.cleanAttributes(domTree, []);

    // Remove the unwanted attribute values
    await this.cleanAttributeValues(domTree, []);

    this.parent.announce({
      msg: "TextMapper: ready to send to background.",
    });

    return domTree;
  }
  /**
   * Remove all classes that seems related to Angular framework, prefix with `ng-`, `cdk-`, `_ng`
   * @param domTree 
   */
  /**
 * Remove all classes that seems related to Angular framework, prefix with `ng-`, `cdk-`, `_ng`
 * @param domTree 
 */
  removeAngularClasses(domTree: HTMLElement) {
    const angularClassPatterns = /^(ng-|cdk-)|_ng/;
    const allElements = domTree.querySelectorAll('*');

    allElements.forEach(element => {
      const classesToRemove: string[] = [];
      element.classList.forEach(className => {
        if (angularClassPatterns.test(className)) {
          classesToRemove.push(className);
        }
      });

      if (classesToRemove.length > 0) {
        element.classList.remove(...classesToRemove);
      }
    });

  }
  /**
   * Remove classes that seems random generated, identified by having more than 3 digits in the class name
   * @param domTree 
   */
  removeRandomClasses(domTree: HTMLElement) {
    const allElements = domTree.querySelectorAll('*');

    allElements.forEach(element => {
      const classesToRemove: string[] = [];
      element.classList.forEach(className => {
        const digitCount = (className.match(/\d/g) || []).length;
        if (digitCount > 3) {
          classesToRemove.push(className);
        }
      });

      if (classesToRemove.length > 0) {
        element.classList.remove(...classesToRemove);
      }
    });

  }

  /**
   * Find all elements that is a parent of the exact texts
   * @param domTree
   * @param input
   */
  async findElementsByTextContents(
    domTree: HTMLElement,
    input: TextMapperInput
  ) {
    // Process the texts to search
    const textsToSearch = input.textContents.map((text) => {
      return text.trim().toLowerCase();
    });

    // Elements that contain at least one of the text to search.
    const foundElements: HTMLElement[] = [];

    // Walk through all text nodes in the DOM tree.
    const walker = document.createTreeWalker(
      domTree,
      NodeFilter.SHOW_TEXT,
      null
    );

    let textNode: Text | null;
    while ((textNode = walker.nextNode() as Text)) {
      // Get the text content and trim whitespace
      const textContent = textNode.textContent?.trim().toLowerCase();

      if (!textContent) continue;

      // Check if this text node contains any of our target texts
      for (const searchText of textsToSearch) {
        if (textContent.includes(searchText)) {
          // Find the direct parent element of this text node
          const parentElement = textNode.parentElement;

          if (parentElement && !foundElements.includes(parentElement)) {
            foundElements.push(parentElement);
            // console.log(`Found text "${searchText}" in element:`, parentElement.tagName,  parentElement.className );
          }
        }
      }
    }

    this.parent.announce({
      msg: `Found ${foundElements.length} elements containing target texts`,
    });

    return foundElements;
  }
  /**
   * Mark all the parents of the given elements, up to the `document`
   * @param domTree
   * @param elementsWithText
   */
  async markAllParentElements(
    domTree: HTMLElement,
    elementsWithText: HTMLElement[]
  ) {
    let markedCount = 0;

    // Iterate through each element that contains our target text
    for (const element of elementsWithText) {
      let currentElement: HTMLElement | null = element;

      // Traverse up the DOM tree until we reach the top (domTree)
      while (currentElement && currentElement !== domTree.parentElement) {
        // Mark this element to keep it
        if (!currentElement.hasAttribute(TextMapper.KEEP_ELEMENT)) {
          currentElement.setAttribute(TextMapper.KEEP_ELEMENT, "true");
          markedCount++;
        }

        // Move up to the parent element
        currentElement = currentElement.parentElement;

        // Stop if we've reached the document root or beyond our domTree
        if (currentElement === domTree) {
          // Mark the domTree itself as well
          if (!currentElement.hasAttribute(TextMapper.KEEP_ELEMENT)) {
            currentElement.setAttribute(TextMapper.KEEP_ELEMENT, "true");
            markedCount++;
          }
          break;
        }
      }
    }

    this.parent.announce({
      msg: `Marked ${markedCount} elements with ${TextMapper.KEEP_ELEMENT} attribute`,
    });

    // console.log(`Total elements marked for keeping: ${markedCount}`);
  }
  /**
   * Clean / Remove elements that does not have the mark.
   * @param parentElement
   */
  async removeChildrenWithoutMark(parentElement: HTMLElement) {
    // Get all child elements
    const children = Array.from(parentElement.children);

    // Iterate through each child
    for (const child of children) {
      if (!child.hasAttribute(TextMapper.KEEP_ELEMENT)) {
        // Remove the child if it doesn't have the mark
        child.remove();
      } else {
        // Recursively check this child's children
        await this.removeChildrenWithoutMark(child as HTMLElement);
      }
    }
  }
  /**
   * Remove HTML comments inside the given DOM tree
   */
  async removeComments(domTree: HTMLElement) {
    // Create a TreeWalker to find all comment nodes
    const walker = document.createTreeWalker(
      domTree,
      NodeFilter.SHOW_COMMENT,
      null
    );

    // Collect all comment nodes first (don't remove during traversal)
    const commentNodes: Comment[] = [];
    let commentNode;
    while ((commentNode = walker.nextNode())) {
      commentNodes.push(commentNode as Comment);
    }

    // console.log(`Found ${commentNodes.length} comment nodes to remove`);

    // Now remove all collected comment nodes
    let removedCount = 0;
    commentNodes.forEach((node) => {
      if (node.parentNode) {
        // console.log("Removing comment node:", node.textContent?.trim());
        node.parentNode.removeChild(node);
        removedCount++;
      }
    });

    // console.log(`Successfully removed ${removedCount} comment nodes`);
  }

  /**
   * Clean attributes from elements
   * @param domTree
   * @param attributePatterns string[] Array of attribute patterns to be removed
   */
  async cleanAttributes(domTree: HTMLElement, attributePatterns: string[]) {
    // Do nothing for now
  }
  /**
   * Clean the values of attributes with a match with the given attribute value patterns
   * Example: An element that has several class name, which one of the class name is `_ng-example`.
   * If matched, the specific `_ng-example` will be removed without removing other class names.
   * @param domTree
   * @param attributeValuePatterns
   */
  async cleanAttributeValues(
    domTree: HTMLElement,
    attributeValuePatterns: string[]
  ) {
    // Do nothing for now
  }

  /**
   * Remove the added attribute TextMapper.KEEP_ATTRIBUTE
   * @param domTree
   */
  async removeMarkAttribute(domTree: HTMLElement) {
    // Remove the mark attribute from all elements
    const markedElements = domTree.querySelectorAll(
      `[${TextMapper.KEEP_ELEMENT}]`
    );
    markedElements.forEach((element) => {
      element.removeAttribute(TextMapper.KEEP_ELEMENT);
    });

    this.parent.announce({
      msg: `Removed ${TextMapper.KEEP_ELEMENT} attribute from ${markedElements.length} elements`,
    });
  }
}
