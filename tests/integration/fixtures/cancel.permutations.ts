//FILE: tests/integration/fixtures/cancel.permutations.ts

import { createVirtualCancel } from "../../../src/virtual_actions";
import type { CancelType } from "../../../src/virtual_actions";
import type { CancelActionOptions } from "../../../src/virtual_actions/kmjs.virtualAction.cancel";

/**
 * Generates all valid and edge-case permutations for the Cancel action.
 * Returns an array of { name, action, params } for integration testing.
 */
export function generateCancelPermutations() {
  const variants: CancelType[] = [
    "CancelAllMacros",
    "CancelAllOtherMacros",
    "CancelThisMacro",
    "CancelJustThisMacro",
    "CancelSpecificMacro",
    "RetryThisLoop",
    "ContinueLoop",
    "BreakFromLoop",
  ];
  const validInstances = ["ExampleMacroNameString", "A-UUID-1234"];
  const invalidInstances = [undefined, ""];
  const permutations: Array<{
    name: string;
    action: any;
    params: CancelActionOptions;
  }> = [];
  let idx = 0;

  for (const variant of variants) {
    if (variant === "CancelSpecificMacro") {
      // Valid instances
      for (const instance of validInstances) {
        const opts: CancelActionOptions = { cancelType: variant, instance };
        permutations.push({
          name: `Cancel – Permutation ${idx} (CancelSpecificMacro, instance: ${instance})`,
          action: createVirtualCancel(opts),
          params: opts,
        });
        idx++;
      }
      // Invalid instances (should throw)
      for (const instance of invalidInstances) {
        const opts: CancelActionOptions = {
          cancelType: variant,
          instance,
        } as any;
        try {
          // This should throw an error
          const action = createVirtualCancel(opts);
          // If it doesn't throw, something is wrong
          permutations.push({
            name: `Cancel – Permutation ${idx} (CancelSpecificMacro, instance: ${instance}) [unexpected success]`,
            action: {
              toXml: () => "<!-- This should have thrown an error -->",
            },
            params: opts,
          });
        } catch (error) {
          // Expected error - create a mock action that represents the error case
          permutations.push({
            name: `Cancel – Permutation ${idx} (CancelSpecificMacro, instance: ${instance}) [invalid - expected error]`,
            action: {
              toXml: () => {
                throw error;
              },
            },
            params: opts,
          });
        }
        idx++;
      }
    } else {
      const opts: CancelActionOptions = { cancelType: variant };
      permutations.push({
        name: `Cancel – Permutation ${idx} (${variant})`,
        action: createVirtualCancel(opts),
        params: opts,
      });
      idx++;
    }
  }

  return permutations;
}
