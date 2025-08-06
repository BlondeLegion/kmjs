//FILE: tests/integration/fixtures/copy.permutations.ts

import {
  createVirtualCopy,
  type CopyActionOptions,
} from "../../../src/virtual_actions/kmjs.virtualAction.copy";

/**
 * Generates all valid permutations for the Copy action.
 * Returns an array of { name, action, params } for integration testing.
 */
export function generateCopyPermutations() {
  const notifyOnTimeoutValues = [true, false, undefined];
  const timeoutAbortsValues = [true, false, undefined];

  const permutations: Array<{
    name: string;
    action: any;
    params: CopyActionOptions;
  }> = [];

  let idx = 0;

  for (const notifyOnTimeout of notifyOnTimeoutValues) {
    for (const timeoutAborts of timeoutAbortsValues) {
      const opts: CopyActionOptions = {};

      if (notifyOnTimeout !== undefined) {
        opts.notifyOnTimeout = notifyOnTimeout;
      }
      if (timeoutAborts !== undefined) {
        opts.timeoutAborts = timeoutAborts;
      }

      const name = `Copy – Permutation ${idx} (notifyOnTimeout: ${notifyOnTimeout}, timeoutAborts: ${timeoutAborts})`;

      permutations.push({
        name,
        action: createVirtualCopy(opts),
        params: opts,
      });
      idx++;
    }
  }

  return permutations;
}
