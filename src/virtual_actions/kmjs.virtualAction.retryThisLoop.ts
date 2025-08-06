//FILE: src/virtual_actions/kmjs.virtualAction.retryThisLoop.ts

/**
 * RETRY THIS LOOP WRAPPER
 *
 * Provides a VirtualAction for the Keyboard Maestro 'Retry This Loop' action.
 * Internally uses Cancel with cancelType "RetryThisLoop" to jump to the top of the loop.
 *
 * @example
 * // Restart the current loop iteration
 * createVirtualRetryThisLoop();
 */

import { createVirtualCancel } from "./kmjs.virtualAction.cancel";
import type { VirtualAction } from "./types";

/**
 * Creates a VirtualAction to retry the current loop in Keyboard Maestro.
 *
 * Uses the generic Cancel action with cancelType "RetryThisLoop" to re-enter the loop.
 *
 * @returns A VirtualAction for the 'RetryThisLoop' variant.
 */
export function createVirtualRetryThisLoop(): VirtualAction {
  return createVirtualCancel({ cancelType: "RetryThisLoop" });
}
