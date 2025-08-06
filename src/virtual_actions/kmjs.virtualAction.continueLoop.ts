//FILE: src/virtual_actions/kmjs.virtualAction.continueLoop.ts

/**
 * CONTINUE LOOP WRAPPER
 *
 * Provides a VirtualAction for the Keyboard Maestro 'Continue Loop' action.
 * This is a specialized variant of the generic Cancel action, using cancelType "ContinueLoop".
 *
 * Inline documentation clarifies that loop control is implemented via Cancel under the hood.
 */

import { createVirtualCancel } from "./kmjs.virtualAction.cancel";
import type { VirtualAction } from "./types";

/**
 * Creates a VirtualAction to continue the current loop in Keyboard Maestro.
 *
 * Under the hood, this wraps the generic Cancel action with cancelType "ContinueLoop".
 *
 * @example
 * // Continue execution of the enclosing loop
 * createVirtualContinueLoop();
 *
 * @returns A VirtualAction for the 'ContinueLoop' cancel variant.
 */
export function createVirtualContinueLoop(): VirtualAction {
  return createVirtualCancel({ cancelType: "ContinueLoop" });
}
