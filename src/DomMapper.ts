import TextMapper from "./TextMapper";

export default class DomMapper {
  private parentElement = document.createElement("div");
  private announcerElement = document.createElement("div");
  public textMapper: TextMapper | undefined;

  constructor() {}
  /**
   * Starts the DOMMapper functionality.
   */
  async start() {
    await this.init();
    this.announce({ msg: "Dom Mapper" });

    // Start the components
    this.textMapper = new TextMapper(this);
  }

  async init() {
    // Initialization logic for DOMMapper
    await this.createParentElement();
    await this.createAnnouncerElement();
  }

  /**
   * Style parent element and attach to DOM.
   * Parent element is a wrapper for all elements of this DomMapper extension
   */
  createParentElement() {
    // Create hidden div element with id `dom-mapper-22` and attach to DOM
    this.parentElement.id = "dom-mapper-22";
    this.parentElement.style.position = "fixed";
    this.parentElement.style.top = "0";
    this.parentElement.style.left = "0";
    this.parentElement.style.zIndex = "999999";
    this.parentElement.style.pointerEvents = "none";
    this.parentElement.style.fontFamily = "Arial, sans-serif";

    // Only for dev, show the parent element
    this.parentElement.style.display = "block";
    this.parentElement.style.border = "4px solid yellow";

    document.body.appendChild(this.parentElement);
  }
  /**
   * Style and attach announcer element to the parent element
   */
  createAnnouncerElement() {
    // Add attribute to the announcer element with `aria-live=polite` and attach to the parent element
    this.announcerElement.setAttribute("aria-live", "assertive");
    this.announcerElement.setAttribute("aria-atomic", "true");
    this.announcerElement.setAttribute("role", "status");

    // Modern screen reader accessible but visually hidden technique
    this.announcerElement.style.position = "absolute";
    this.announcerElement.style.left = "-10000px";
    this.announcerElement.style.width = "1px";
    this.announcerElement.style.height = "1px";
    this.announcerElement.style.overflow = "hidden";
    this.announcerElement.style.clipPath = "inset(50%)";
    this.announcerElement.style.whiteSpace = "nowrap";

    this.parentElement.appendChild(this.announcerElement);
  }
  /**
   * Create div element with the given message, and attach to the announcer element
   */
  async announce({ msg }: { msg: string }) {
    // Clear previous announcements first
    // this.announcerElement.innerHTML = "";

    // Small delay to ensure page and screen reader is ready
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Create a temporary message element
    const messageElement = document.createElement("div");
    messageElement.innerHTML = msg;

    // Add new message
    this.announcerElement.appendChild(messageElement);

    // Remove the message after 5 seconds to keep the announcer clean
    setTimeout(() => {
      if (this.announcerElement.contains(messageElement)) {
        this.announcerElement.removeChild(messageElement);
      }
    }, 5000);
  }
}
