//FILE: src/virtual_actions/types/types.input.ts

/* ----------------------------- */
/* Mouse and input types for KM   */
/* ----------------------------- */

/**
 * Condition for checking the state of a mouse button.
 * - ConditionType: "MouseButton"
 * - Button: Mouse button number (0 = left, 1 = right, etc)
 * - Pressed: Optional, true if button is pressed
 */
export interface MouseButtonCondition {
  ConditionType: "MouseButton";
  Button: number;
  Pressed?: boolean;
}

/**
 * The kind of mouse click or movement to simulate.
 * - "Move": Just move the mouse (no click)
 * - "Click": Single click
 * - "DoubleClick": Double click
 * - "TripleClick": Triple click
 * - "Release": Mouse button release
 */
export type ClickKind =
  | "Move" // just move the mouse – no click
  | "Click" // single click
  | "DoubleClick" // double click
  | "TripleClick" // triple click
  | "Release"; // mouse-button release

/**
 * Mouse button names for click actions.
 * - "Left": Left mouse button
 * - "Center": Center mouse button
 * - "Right": Right mouse button
 * - "Button4"–"Button6": Extra buttons
 */
export type MouseButton =
  | "Left"
  | "Center"
  | "Right"
  | "Button4"
  | "Button5"
  | "Button6";

/**
 * Mouse drag operation types.
 * - "None": No drag
 * - "To": Drag to a location
 * - "Absolute": Absolute drag
 * - "Relative": Relative drag
 * - "Hold": Hold mouse button
 */
export type MouseDrag = "None" | "To" | "Absolute" | "Relative" | "Hold";

/**
 * Condition for checking the state of keyboard modifiers.
 * - ConditionType: "Modifiers"
 * - ModifiersDown: Bitmask of modifiers currently down
 * - ModifiersUp: Bitmask of modifiers currently up
 */
export interface ModifiersCondition {
  ConditionType: "Modifiers";
  ModifiersDown: number;
  ModifiersUp: number;
}

/**
 * Scroll direction for ScrollWheelEvent.
 * - "Up", "Down", "Left", "Right"
 */
export type ScrollDirection = "Up" | "Down" | "Left" | "Right";
