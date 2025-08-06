//FILE: src/virtual_actions/kmjs.virtualAction.moveAndClick.ts

import { createVirtualClickAtFoundImage } from "./kmjs.virtualAction.clickAtFoundImage";
import type { VirtualAction } from "./types";
import type { ClickKind, MouseButton, MouseDrag } from "./types/types.input";
import type { RelativeCorner, CoordinateReference } from "./types/types.ui";

/**
 * Options for the MoveAndClick virtual action.
 * This omits all image search options and only exposes window-relative click options.
 */
export interface MoveAndClickOptions {
  /** Type of click (default: "Click") */
  clickKind?: ClickKind; // default = "Click"
  /** Mouse button (default: "Left") */
  button?: MouseButton; // default = "Left"
  /** Modifier keys (default: 0) */
  clickModifiers?: string | number | Record<number, number | null>;
  /** Horizontal position (default: 0) */
  horizontal?: number;
  /** Vertical position (default: 0) */
  vertical?: number;
  /** Where the (x,y) offset is measured from (default: "Window") */
  relative?: Extract<
    CoordinateReference,
    "Window" | "Screen" | "Mouse" | "Absolute"
  >;
  /** Corner for relative positioning (default: "TopLeft") */
  relativeCorner?: RelativeCorner;
  /** Mouse drag operation (default: "None") */
  mouseDrag?: MouseDrag;
  /** Drag target X (default: 0) */
  dragTargetX?: number;
  /** Drag target Y (default: 0) */
  dragTargetY?: number;
  /** Restore mouse location after click (default: false) */
  restoreMouseLocation?: boolean;
}

/**
 * Creates a Keyboard Maestro virtual action that moves and clicks the mouse at a specified position.
 * This is a wrapper around createVirtualClickAtFoundImage, with image search options omitted and defaults set to match KM's MoveAndClick action.
 *
 * ## Mouse Movement and Dragging Guide
 *
 * This function is your primary tool for mouse automation. It can:
 * - Move the mouse cursor without clicking (clickKind: "Move")
 * - Click at specific coordinates
 * - Drag elements from one location to another
 * - Perform complex multi-step drag operations
 *
 * ### Key Concepts:
 *
 * **Coordinate Systems (`relative` parameter):**
 * - `"Screen"` - Absolute screen coordinates (0,0 = top-left of main screen)
 * - `"Window"` - Relative to the front window (0,0 = top-left of window content)
 * - `"Mouse"` - Relative to current mouse position (0,0 = current mouse location)
 * - `"Absolute"` - Same as Screen but uses different internal handling
 *
 * **Drag Operations (`mouseDrag` parameter):**
 * - `"None"` - Just move/click, no dragging
 * - `"Absolute"` - Drag from current position to absolute coordinates (dragTargetX, dragTargetY)
 * - `"Relative"` - Drag by a relative offset (dragTargetX/Y are offsets from start position)
 * - `"To"` - Drag to specific coordinates
 * - `"From"` - Start drag from specific coordinates
 *
 * @param opts - Options for the move and click action
 * @param opts.clickKind - Type of click: "Click", "DoubleClick", "RightClick", "Move", "Release" (default: "Click")
 * @param opts.button - Mouse button: "Left", "Right", or "Middle" (default: "Left")
 * @param opts.clickModifiers - Modifier keys (string, number, or record; default: 0)
 * @param opts.horizontal - X coordinate (default: 0)
 * @param opts.vertical - Y coordinate (default: 0)
 * @param opts.relative - Coordinate reference system: "Window", "Screen", "Mouse", or "Absolute" (default: "Window")
 * @param opts.relativeCorner - Corner for relative positioning: "TopLeft", etc. (default: "TopLeft")
 * @param opts.mouseDrag - Mouse drag operation: "None", "Absolute", "Relative", "To", "From" (default: "None")
 * @param opts.dragTargetX - Drag target X coordinate (default: 0)
 * @param opts.dragTargetY - Drag target Y coordinate (default: 0)
 * @param opts.restoreMouseLocation - Restore mouse position after click (default: false)
 *
 * @example
 * // Basic clicking at screen coordinates
 * createVirtualMoveAndClick({ horizontal: 100, vertical: 200, relative: "Screen" })
 *
 * // Just move the mouse cursor without clicking
 * createVirtualMoveAndClick({
 *   horizontal: 300,
 *   vertical: 400,
 *   relative: "Screen",
 *   clickKind: "Move"
 * })
 *
 * // Drag an element from one screen location to another (absolute drag)
 * createVirtualMoveAndClick({
 *   horizontal: 100,        // Start position X
 *   vertical: 100,          // Start position Y
 *   relative: "Screen",
 *   mouseDrag: "Absolute",  // Drag to absolute coordinates
 *   dragTargetX: 300,       // End position X
 *   dragTargetY: 400,       // End position Y
 *   clickKind: "Click"
 * })
 *
 * // Drag by a relative offset (move 200px right, 100px down from start)
 * createVirtualMoveAndClick({
 *   horizontal: 150,
 *   vertical: 150,
 *   relative: "Screen",
 *   mouseDrag: "Relative",  // Drag by offset
 *   dragTargetX: 200,       // Move 200px right
 *   dragTargetY: 100,       // Move 100px down
 *   clickKind: "Click"
 * })
 *
 * // Resize a window by dragging its bottom-right corner
 * createVirtualMoveAndClick({
 *   horizontal: 692,        // Position at window corner
 *   vertical: 631,
 *   relative: "Screen",
 *   mouseDrag: "Relative",  // Drag by offset
 *   dragTargetX: 50,        // Expand 50px wider
 *   dragTargetY: 30,        // Expand 30px taller
 *   clickKind: "Click"
 * })
 *
 * // Multi-step drag operation: First move to position, then drag
 * // Step 1: Move to starting position
 * createVirtualMoveAndClick({
 *   horizontal: 681,
 *   vertical: 622,
 *   relative: "Screen",
 *   clickKind: "Move"       // Just move, don't click yet
 * })
 * // Step 2: Drag from current position
 * createVirtualMoveAndClick({
 *   mouseDrag: "Relative",
 *   relative: "Mouse",      // Start from current mouse position
 *   horizontal: 0,          // No additional offset
 *   vertical: 0,
 *   dragTargetX: 12,        // Drag 12px right
 *   dragTargetY: 11,        // Drag 11px down
 *   clickKind: "Click"
 * })
 *
 * @returns A VirtualAction object that can render itself as KM XML.
 */
export function createVirtualMoveAndClick(
  opts: MoveAndClickOptions = {},
): VirtualAction {
  // Only allow window/screen/mouse/absolute relative, never image search
  const {
    clickKind = "Click",
    button = "Left",
    clickModifiers = 0,
    horizontal = 0,
    vertical = 0,
    relative = "Window",
    relativeCorner = "TopLeft",
    mouseDrag = "None",
    dragTargetX = 0,
    dragTargetY = 0,
    restoreMouseLocation = false,
  } = opts;

  // Call the underlying clickAtFoundImage with imageSource omitted and defaults set
  // Do NOT emit waitForImage or TimeOutAbortsMacro for MoveAndClick (window-relative)
  return createVirtualClickAtFoundImage({
    clickKind,
    button,
    clickModifiers,
    horizontal,
    vertical,
    relative,
    relativeCorner,
    mouseDrag,
    dragTargetX,
    dragTargetY,
    restoreMouseLocation,
    // Omit all image search options: imageSource, filePath, namedClipboardUUID, etc.
    // Fuzz, waitForImage, imageSelection, screenArea, imageScreenArea are not needed for MoveAndClick
    fuzz: 15,
    imageSelection: "Unique",
    // Do NOT set waitForImage or TimeOutAbortsMacro
  });
}
