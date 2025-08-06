//FILE: tests/integration/fixtures/clearTypedStringBuffer.permutations.ts

import { createVirtualClearTypedStringBuffer } from "../../../src/virtual_actions/kmjs.virtualAction.clearTypedStringBuffer";

/**
 * Generates the single permutation for the ClearTypedStringBuffer action.
 */
export function generateClearTypedStringBufferPermutations() {
  return [
    {
      name: "ClearTypedStringBuffer – Default",
      action: createVirtualClearTypedStringBuffer(),
      params: {},
    },
  ];
}
