import DomMapper from "./DomMapper";

type TextMapperInput = {
  // Text content of element to be mapped. All text contents need to be unique in the document.
  textContents: string[];
};

type TextMapperOptions = {
  // Ignore classes or attributes that seems related to angular
  ignoreAngular?: boolean;
  // Ignore random generated classes. This could be identified > 3 numbers in a string
  ignoreRandomClasses?: boolean;
};

const defaultOptions: TextMapperOptions = {
  ignoreAngular: true,
  ignoreRandomClasses: true,
};

export default class TextMapper {
  private parent: DomMapper;
  constructor(parent: DomMapper) {
    this.parent = parent;
    this.init();
  }
  async init() {
    // Initialization logic for TextMapper
    this.parent.announce({
      msg: "Text Mapper is ready",
    });
    console.log("TextMapper is ready to interact with text content");
  }

  /**
   * Open the TextMapper functionality.
   */
  async open() {
    console.log("TextMapper opened");
    // Add event listeners or other startup logic here
  }

  async createMap(
    input: TextMapperInput,
    initialOptions: Partial<TextMapperOptions> = defaultOptions
  ) {
    // Merge default options with initial options
    const options: TextMapperOptions = { ...defaultOptions, ...initialOptions };

    console.log("Creating text map");

    // Clone the document
    let domTree: HTMLElement = document.documentElement.cloneNode(
      true
    ) as HTMLElement;

    // Find all text nodes in the document

    // Mark all the elements we want to keep by adding `TextMapper.KEEP_ATTRIBUTE` attribute to them.

    // Remove all elements that are not marked with `TextMapper.KEEP_ATTRIBUTE` attribute.

    // We have a new DOM tree with only the elements we want to keep.

    this.renderMap(domTree);
  }

  async renderMap(domTree: HTMLElement) {
    console.log("Rendering text map");

    // Create a new window to display the map
    const mapWindow = window.open("", "_blank");
    if (!mapWindow) {
      console.error("Failed to open map window");
      return;
    }

    // Write the HTML content to the new window
    mapWindow.document.write(
      "<!DOCTYPE html><html><head><title>Text Map</title></head><body>"
    );
    mapWindow.document.write(domTree.outerHTML);
    mapWindow.document.write("</body></html>");
    mapWindow.document.close();

    console.log("Text map rendered in new window");
  }
}
