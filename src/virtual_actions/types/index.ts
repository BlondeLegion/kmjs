//FILE: src/virtual_actions/types/index.ts

/**
 * A “virtual action” is any object that knows how to render itself as KM XML.
 * This interface is implemented by all virtual action classes and factory functions.
 * The toXml() method returns a fully-formed XML string ready to be placed inside
 * the outer <array> … </array> of a Keyboard Maestro macro.
 */
export interface VirtualAction {
  /**
   * Returns the XML representation of this action, ready for macro inclusion.
   * @returns {string} Fully-formed Keyboard Maestro XML for this action.
   */
  toXml(): string;
}

// Export all categorized types with documentation references
/**
 * All condition types for Keyboard Maestro actions, including string, numeric,
 * existence, enabled, marked, and on/off/mixed state conditions. See types.conditions.ts.
 */
export * from "./types.conditions";
/**
 * System-level types for Keyboard Maestro actions, such as application, macro,
 * key, disk, USB device, wireless network, location, and typed string conditions.
 * See types.system.ts.
 */
export * from "./types.system";
/**
 * Data-related types for Keyboard Maestro actions, including variable, text,
 * clipboard, environment variable, and calculation conditions, as well as
 * processing and where modes for actions like Set Variable. See types.data.ts.
 */
export * from "./types.data";
/**
 * UI-related types for Keyboard Maestro actions, such as app matching, image
 * sources, screen/window areas, and menu/button conditions. See types.ui.ts.
 */
export * from "./types.ui";
/**
 * Scripting-related types for Keyboard Maestro actions, including file attribute,
 * OCR, path, pixel, and script conditions. See types.scripting.ts.
 */
export * from "./types.scripting";
/**
 * Input-related types for Keyboard Maestro actions, such as mouse button,
 * click kind, drag, and modifier conditions. See types.input.ts.
 */
export * from "./types.input";
/**
 * Direct exports for frequently used input condition types.
 * - ModifiersCondition: Represents a condition on keyboard modifiers (shift, ctrl, etc).
 * - MouseButtonCondition: Represents a condition on mouse button state.
 */
export { ModifiersCondition, MouseButtonCondition } from "./types.input";
/**
 * File-related types for Keyboard Maestro actions, including file existence,
 * attributes, and other file-specific conditions. See types.file.ts.
 */
export * from "./types.file";
