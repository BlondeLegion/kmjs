//FILE: src/virtual_actions/kmjs.virtualAction.clickAtFoundImage.ts

import chalk from "chalk";
import { formatXmlAction } from "../utils/utils.xml";
import { screenAreaToXml } from "../utils/template.xml.ui";
import { normalizeAppleScriptShortcut } from "../utils/utils.keystroke";
import { BUTTON_INT, CLICK_COUNT_INT } from "../utils/utils.mouse";
import { generateActionUIDXml } from "../utils/template.xml.generic";
import type {
  VirtualAction,
  ScreenArea,
  ImageSource,
  CoordinateReference,
  RelativeCorner,
  ImageSelection,
  ClickKind,
  MouseButton,
  MouseDrag,
} from "./index";

/* ------------------------------------------------------------------ */
/* Enumerations / Option types                                         */
/* ------------------------------------------------------------------ */

export interface ClickAtFoundImageOptions {
  /* --- Basic click parameters --------------------------------------- */
  clickKind?: ClickKind; // default = "Click"
  button?: MouseButton; // default = "Left"
  clickModifiers?: string | number | Record<number, number | null>; // KB mods

  /* --- Relative positioning ----------------------------------------- */
  horizontal?: number; // HorizontalPositionExpression
  vertical?: number; // VerticalPositionExpression
  /** Where the (x,y) offset is measured from. */
  relative?: CoordinateReference; // default = "Image"
  relativeCorner?: RelativeCorner; // default = "Center"

  /* --- Image finding ------------------------------------------------- */
  /**
   * Where the *template* image is loaded from.
   *   • **Image** (default) – pasted/inline image
   *   • **File** – supply `filePath`
   *   • **NamedClipboard** – supply `namedClipboardUUID`
   *   • **Screen / Icon / …** – other KM sources
   */
  imageSource?: ImageSource; // default = "Image"
  fuzz?: number; // 0–100 (defaults = 15)
  waitForImage?: boolean; // default = true (omit key when true)
  imageSelection?: ImageSelection; // default = "Unique"
  namedClipboardUUID?: string; // ↥ required if `imageSource === "NamedClipboard"`
  filePath?: string; // ↥ required if `imageSource === "File"`

  /* --- Screen / drag / restore -------------------------------------- */
  /** Where to click (Screen/Window/Area). */
  screenArea?: ScreenArea;
  /** Image search crop when ImageSource === "Screen" (defaults to `screenArea`). */
  imageScreenArea?: ScreenArea;
  mouseDrag?: MouseDrag;
  dragTargetX?: number;
  dragTargetY?: number;
  restoreMouseLocation?: boolean; // default = false
}

/* ------------------------------------------------------------------ */
/* Main factory function                                               */
/* ------------------------------------------------------------------ */

/**
 * Creates a Keyboard Maestro virtual action that clicks at a found image on the screen.
 * This is the most comprehensive mouse action, supporting image search, coordinate systems, and advanced click behaviors.
 *
 * ## Advanced Mouse Control with Image Recognition
 *
 * This function combines image recognition with mouse automation, making it perfect for:
 * - Clicking on UI elements that may move or change
 * - Dragging elements found via image search
 * - Complex automation that adapts to different screen layouts
 * - Precise clicking relative to visual landmarks
 *
 * ### Key Concepts:
 *
 * **Image-Based vs Coordinate-Based Operation:**
 * - When `relative: "Image"` (default): Finds an image first, then clicks relative to it
 * - When `relative: "Screen"/"Window"/"Mouse"/"Absolute"`: Uses this as a pure coordinate-based click (like createVirtualMoveAndClick)
 *
 * **Image Sources (`imageSource` parameter):**
 * - `"Image"` - Uses an image pasted into the Keyboard Maestro action (default)
 * - `"File"` - Loads template image from file path (requires `filePath`)
 * - `"NamedClipboard"` - Uses image from named clipboard (requires `namedClipboardUUID`)
 * - `"Screen"` - Uses a screenshot of specified area as template
 *
 * **Coordinate Systems (`relative` parameter):**
 * - `"Image"` - Relative to the found image (0,0 = image center by default)
 * - `"Screen"` - Absolute screen coordinates (0,0 = top-left of main screen)
 * - `"Window"` - Relative to the front window (0,0 = top-left of window content)
 * - `"Mouse"` - Relative to current mouse position (0,0 = current mouse location)
 * - `"Absolute"` - Same as Screen but uses different internal handling
 *
 * **Drag Operations for Image-Based Actions:**
 * - `"None"` - Just click, no dragging
 * - `"Absolute"` - Drag from found image to absolute screen coordinates
 * - `"Relative"` - Drag by offset from the found image position
 * - `"To"` - Drag to specific coordinates
 * - `"From"` - Start drag from specific coordinates
 *
 * @param opts - Options to configure the click action
 * @param opts.clickKind - Type of click: "Click", "DoubleClick", "RightClick", "Move", "Release" (default: "Click")
 * @param opts.button - Mouse button: "Left", "Right", "Middle" (default: "Left")
 * @param opts.clickModifiers - Modifier keys as string, number, or object (default: 0)
 * @param opts.horizontal - X coordinate offset (default: 0)
 * @param opts.vertical - Y coordinate offset (default: 0)
 * @param opts.relative - Coordinate reference: "Image", "Window", "Screen", "Mouse", "Absolute" (default: "Image")
 * @param opts.relativeCorner - Corner for relative positioning: "TopLeft", "TopRight", "BottomLeft", "BottomRight", "Center" (default: "Center" for Image, "TopLeft" for Mouse/Absolute)
 * @param opts.imageSource - Template image source: "Image", "File", "NamedClipboard", "Screen", etc. (default: "Image")
 * @param opts.fuzz - Image match tolerance 0-100 (default: 15)
 * @param opts.waitForImage - Wait for image to appear (default: true)
 * @param opts.imageSelection - Which image if multiple found: "Unique", "Best", "TopLeft", etc. (default: "Unique")
 * @param opts.namedClipboardUUID - UUID for named clipboard (required if imageSource is "NamedClipboard")
 * @param opts.filePath - File path for image (required if imageSource is "File")
 * @param opts.screenArea - Area to search/click (default: entire screen)
 * @param opts.imageScreenArea - Area to crop image search when imageSource is "Screen"
 * @param opts.mouseDrag - Mouse drag behavior: "None", "Absolute", "Relative", "To", "From" (default: "None")
 * @param opts.dragTargetX - X coordinate for drag target (default: 0)
 * @param opts.dragTargetY - Y coordinate for drag target (default: 0)
 * @param opts.restoreMouseLocation - Restore mouse position after click (default: false)
 *
 * @example
 * // Find and click on a button image (basic image-based clicking)
 * createVirtualClickAtFoundImage({
 *   imageSource: "File",
 *   filePath: "/path/to/button.png"
 * })
 *
 * // Click 20px to the right and 10px below a found image
 * createVirtualClickAtFoundImage({
 *   imageSource: "File",
 *   filePath: "/path/to/reference.png",
 *   horizontal: 20,
 *   vertical: 10,
 *   relative: "Image"  // Relative to the found image
 * })
 *
 * // Drag from a found image to a specific screen location
 * createVirtualClickAtFoundImage({
 *   imageSource: "File",
 *   filePath: "/path/to/draggable-item.png",
 *   relative: "Image",
 *   mouseDrag: "Absolute",  // Drag to absolute coordinates
 *   dragTargetX: 500,       // Target screen X
 *   dragTargetY: 300,       // Target screen Y
 *   clickKind: "Click"
 * })
 *
 * // Find an image and drag it by a relative offset
 * createVirtualClickAtFoundImage({
 *   imageSource: "File",
 *   filePath: "/path/to/slider-handle.png",
 *   relative: "Image",
 *   mouseDrag: "Relative",  // Drag by offset
 *   dragTargetX: 100,       // Move 100px right from image
 *   dragTargetY: 0,         // No vertical movement
 *   clickKind: "Click"
 * })
 *
 * // Use as coordinate-based click (ignoring image search)
 * createVirtualClickAtFoundImage({
 *   horizontal: 400,
 *   vertical: 300,
 *   relative: "Screen",     // Pure coordinate-based
 *   clickKind: "Click"
 * })
 *
 * // Complex drag: Find image, then drag to another found location
 * // (This would typically be done in multiple steps)
 * createVirtualClickAtFoundImage({
 *   imageSource: "File",
 *   filePath: "/path/to/source.png",
 *   relative: "Image",
 *   mouseDrag: "Absolute",
 *   dragTargetX: 600,       // Coordinates of destination
 *   dragTargetY: 400,
 *   clickKind: "Click",
 *   restoreMouseLocation: true  // Return mouse to original position
 * })
 *
 * // Move mouse to found image without clicking (useful for positioning)
 * createVirtualClickAtFoundImage({
 *   imageSource: "File",
 *   filePath: "/path/to/target.png",
 *   relative: "Image",
 *   clickKind: "Move"       // Just move, don't click
 * })
 *
 * @returns A VirtualAction object that can render itself as KM XML.
 */
export function createVirtualClickAtFoundImage(
  opts: ClickAtFoundImageOptions = {},
): VirtualAction {
  /**
   * Extract and set defaults for all click/image options.
   * @see ClickAtFoundImageOptions for details on each option.
   */
  const {
    clickKind = "Click", // Type of click (single, double, etc.)
    button = "Left", // Mouse button to use
    clickModifiers = 0, // Modifier keys

    horizontal = 0, // Horizontal position
    vertical = 0, // Vertical position
    relative = "Image", // Relative source for position
    // relativeCorner = "Center", // Corner to use for relative positioning
    relativeCorner, // Corner to use for relative positioning

    imageSource = "Image", // Template image source
    fuzz, // Image match fuzziness
    waitForImage = true, // Wait for image to appear
    imageSelection = "Unique", // Which image to select if multiple found
    namedClipboardUUID, // Named clipboard UUID if needed
    filePath, // File path if needed

    screenArea = { type: "ScreenAll" }, // Area to search/click
    imageScreenArea, // Area to crop image search
    mouseDrag = "None", // Mouse drag behaviour
    dragTargetX = 0, // Drag target X
    dragTargetY = 0, // Drag target Y
    restoreMouseLocation: _restoreMouseLocation = false, // Restore mouse location after click
  } = opts;

  // Release actions ignore restoreMouseLocation (GUI hides it)
  const restoreMouseLocation =
    clickKind === "Release" ? false : _restoreMouseLocation;

  /* -----------------------------------------------------------
   * 1) Normalize relativeCorner:
   *    • If caller passed one, use it.
   *    • Else if relative is Mouse or Absolute → TopLeft (KM uses
   *      these as vestigal reference for some reason).
   *    • Otherwise → Center.
   * --------------------------------------------------------- */
  const _relativeCorner: RelativeCorner =
    relativeCorner !== undefined
      ? relativeCorner
      : relative === "Mouse" || relative === "Absolute"
        ? "TopLeft"
        : "Center";

  /* -----------------------------------------------------------
   * Named Clipboard handling
   * --------------------------------------------------------- */
  const DEFAULT_CLIPBOARD_UUID = "FE1390C3-74DF-4983-9C6B-E2C441F97963";
  const DEFAULT_CLIPBOARD_LABEL = "Unnamed Named Clipboard";

  // If the template comes from a named clipboard but the caller did
  // not supply a UUID, just mimic KM’s own fallback.
  const clipboardUUID =
    imageSource === "NamedClipboard"
      ? (namedClipboardUUID ?? DEFAULT_CLIPBOARD_UUID)
      : undefined;

  /**
   * Validate required options for certain image sources.
   */
  if (imageSource === "File" && !filePath) {
    throw new Error("filePath must be supplied when imageSource === 'File'");
  }

  /**
   * Resolve the modifier mask for the click action.
   * Converts clickModifiers to a numeric mask.
   */
  const mask = (() => {
    if (typeof clickModifiers === "number") return clickModifiers;
    const map = normalizeAppleScriptShortcut(clickModifiers as any);
    return Number(Object.keys(map)[0]);
  })();

  /**
   * Determine the action string and click count for the KM XML.
   * Uses centralized mapping for click counts.
   */
  let actionString: string;
  let clickCount: number;
  switch (clickKind) {
    case "Move":
      actionString = "Move";
      clickCount = 0;
      break;
    case "Release":
      // KM serialises Release as MoveAndClick + ClickCount -1.
      // Ignore restoreMouseLocation (GUI hides it).
      actionString = "MoveAndClick";
      clickCount = -1;
      break;
    default:
      // Use mapping for click counts
      clickCount = CLICK_COUNT_INT[clickKind];
      actionString = restoreMouseLocation ? "Click" : "MoveAndClick";
      break;
  }

  /** ----------------------------------------------------------------
   *  Mouse-drag sanity
   *  ----------------------------------------------------------------
   *  KM silently resets MouseDrag → “None” whenever you pick
   *  Click / DoubleClick *and* ask for a drag phase that makes no sense
   *  (“From”, “Drag”, “Release”).  Re-create that behaviour so our
   *  generated XML round-trips 1-for-1.
   */
  let effectiveMouseDrag: MouseDrag = mouseDrag;
  if (
    (clickKind === "Click" || clickKind === "DoubleClick") &&
    ((mouseDrag as any) === "From" ||
      (mouseDrag as any) === "Drag" ||
      (mouseDrag as any) === "Release")
  ) {
    effectiveMouseDrag = "None";
  }

  /**
   * Build the KM XML for the click action with proper structure.
   */
  const fuzzValue =
    typeof fuzz === "number"
      ? Math.max(0, Math.min(100, Math.round(fuzz)))
      : 15; // KM default

  /* ----------------------------------------------------------------
   * TEMPLATE-SOURCE KEYS
   * ----------------------------------------------------------------
   * Only keep the template‐source keys (ImagePath/ImageSource/...),
   * when we're positioning *relative to the found image*.
   */
  const keepTemplateSourceKeys = relative === "Image";

  const imagePathXml =
    keepTemplateSourceKeys && imageSource === "File"
      ? ["\t\t<key>ImagePath</key>", `\t\t<string>${filePath}</string>`]
      : [];

  const namedClipboardXml =
    keepTemplateSourceKeys && imageSource === "NamedClipboard"
      ? [
          `\t\t<key>ImageNamedClipboardName</key>`,
          `\t\t<string>${clipboardUUID}</string>`,
          `\t\t<key>ImageNamedClipboardRedundandDisplayName</key>`,
          `\t\t<string>${DEFAULT_CLIPBOARD_LABEL}</string>`,
        ]
      : [];

  const imageScreenAreaXml =
    keepTemplateSourceKeys && imageSource === "Screen"
      ? screenAreaToXml(
          "ImageScreenArea",
          imageScreenArea ?? screenArea ?? { type: "ScreenAll" },
        )
          .split("\n")
          .map((l) => (l ? `\t\t${l}` : l))
      : [];

  const imageSelectionXml =
    imageSelection !== "Unique" && relative === "Image"
      ? [
          `\t\t<key>ImageSelection</key>`,
          `\t\t<string>${imageSelection}</string>`,
        ]
      : [];

  const relativeCornerXml = _relativeCorner
    ? [
        `\t\t<key>RelativeCorner</key>`,
        `\t\t<string>${_relativeCorner}</string>`,
      ]
    : [];

  /* -----------------------------------------------------------
   * Only include <ScreenArea> when the click is measured
   * relative to the *found image*.
   * --------------------------------------------------------- */
  const includeScreenArea = relative === "Image";

  const screenAreaLines = includeScreenArea
    ? screenAreaToXml("ScreenArea", screenArea)
        .split("\n")
        .map((l) => (l ? `\t\t${l}` : l))
    : [];

  const imageSourceXml =
    keepTemplateSourceKeys && imageSource !== "Image"
      ? ["\t\t<key>ImageSource</key>", `\t\t<string>${imageSource}</string>`]
      : [];

  // Only emit KM’s timeout block when waitForImage is explicitly true.
  let waitForImageXml: string[] = [];
  if (opts.waitForImage === true) {
    waitForImageXml = [
      `\t\t<key>TimeOutAbortsMacro</key>`,
      `\t\t<true/>`,
      `\t\t<key>WaitForImage</key>`,
      `\t\t<true/>`,
    ];
  }

  const xmlLines = [
    "\t<dict>",
    "\t\t<key>Action</key>",
    `\t\t<string>${actionString}</string>`,
    ...generateActionUIDXml(),
    "\t\t<key>Button</key>",
    `\t\t<integer>${BUTTON_INT[button]}</integer>`,
    "\t\t<key>ClickCount</key>",
    `\t\t<integer>${clickCount}</integer>`,
    "\t\t<key>DisplayMatches</key>",
    "\t\t<false/>",
    "\t\t<key>DragHorizontalPosition</key>",
    `\t\t<string>${dragTargetX}</string>`,
    "\t\t<key>DragVerticalPosition</key>",
    `\t\t<string>${dragTargetY}</string>`,
    "\t\t<key>Fuzz</key>",
    `\t\t<integer>${fuzzValue}</integer>`,
    "\t\t<key>HorizontalPositionExpression</key>",
    `\t\t<string>${horizontal}</string>`,
    ...imagePathXml,
    ...namedClipboardXml,
    ...imageScreenAreaXml,
    ...imageSelectionXml,
    ...imageSourceXml,
    "\t\t<key>MacroActionType</key>",
    "\t\t<string>MouseMoveAndClick</string>",
    "\t\t<key>Modifiers</key>",
    `\t\t<integer>${mask}</integer>`,
    "\t\t<key>MouseDrag</key>",
    `\t\t<string>${effectiveMouseDrag}</string>`,
    "\t\t<key>Relative</key>",
    `\t\t<string>${relative}</string>`,
    ...relativeCornerXml,
    "\t\t<key>RestoreMouseLocation</key>",
    `\t\t<${restoreMouseLocation ? "true" : "false"}/>`,
    ...screenAreaLines,
    "\t\t<key>VerticalPositionExpression</key>",
    `\t\t<string>${vertical}</string>`,
    ...waitForImageXml,
    "\t</dict>",
  ];

  /**
   * Return the VirtualAction object with XML rendering.
   */
  return { toXml: () => formatXmlAction(xmlLines.join("\n")) };
}
