//FILE: src/virtual_actions/kmjs.virtualAction.breakFromLoop.ts

/**
 * BREAK FROM LOOP WRAPPER
 *
 * Provides a VirtualAction for the Keyboard Maestro 'Break From Loop' action.
 * Internally implemented via the generic Cancel action with cancelType "BreakFromLoop".
 *
 * Use this to exit the nearest enclosing loop immediately.
 *
 * @example
 * // Exit the current loop
 * createVirtualBreakFromLoop();
 */

import { createVirtualCancel } from "./kmjs.virtualAction.cancel";
import type { VirtualAction } from "./types";

/**
 * Creates a VirtualAction to break out of the current loop in Keyboard Maestro.
 *
 * Wraps the generic Cancel action with cancelType "BreakFromLoop".
 *
 * @returns A VirtualAction for the 'BreakFromLoop' variant.
 */
export function createVirtualBreakFromLoop(): VirtualAction {
  return createVirtualCancel({ cancelType: "BreakFromLoop" });
}
