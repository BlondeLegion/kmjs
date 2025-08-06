//FILE: tests/integration/fixtures/cut.permutations.ts

import type { CutActionOptions } from "../../../src/virtual_actions";
import { createVirtualCut } from "../../../src/virtual_actions";

/**
 * Generates all valid permutations for the Cut action.
 * Returns an array of { name, action, params } for integration testing.
 */
export function generateCutPermutations() {
  const notifyOnTimeoutValues = [true, false, undefined];
  const timeoutAbortsValues = [true, false, undefined];

  const permutations: Array<{
    name: string;
    action: any;
    params: CutActionOptions;
  }> = [];

  let idx = 0;

  for (const notifyOnTimeout of notifyOnTimeoutValues) {
    for (const timeoutAborts of timeoutAbortsValues) {
      const opts: CutActionOptions = {};

      if (notifyOnTimeout !== undefined) {
        opts.notifyOnTimeout = notifyOnTimeout;
      }
      if (timeoutAborts !== undefined) {
        opts.timeoutAborts = timeoutAborts;
      }

      const name = `Cut – Permutation ${idx} (notifyOnTimeout: ${notifyOnTimeout}, timeoutAborts: ${timeoutAborts})`;

      permutations.push({
        name,
        action: createVirtualCut(opts),
        params: opts,
      });
      idx++;
    }
  }

  return permutations;
}
