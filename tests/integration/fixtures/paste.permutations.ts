//FILE: tests/integration/fixtures/paste.permutations.ts

import {
  createVirtualPaste,
  type PasteActionOptions,
} from "../../../src/virtual_actions/kmjs.virtualAction.paste";

/**
 * Generates all valid permutations for the Paste action.
 * Returns an array of { name, action, params } for integration testing.
 */
export function generatePastePermutations() {
  const notifyOnTimeoutValues = [true, false, undefined];
  const timeoutAbortsValues = [true, false, undefined];

  const permutations: Array<{
    name: string;
    action: any;
    params: PasteActionOptions;
  }> = [];

  let idx = 0;

  for (const notifyOnTimeout of notifyOnTimeoutValues) {
    for (const timeoutAborts of timeoutAbortsValues) {
      const opts: PasteActionOptions = {};

      if (notifyOnTimeout !== undefined) {
        opts.notifyOnTimeout = notifyOnTimeout;
      }
      if (timeoutAborts !== undefined) {
        opts.timeoutAborts = timeoutAborts;
      }

      const name = `Paste – Permutation ${idx} (notifyOnTimeout: ${notifyOnTimeout}, timeoutAborts: ${timeoutAborts})`;

      permutations.push({
        name,
        action: createVirtualPaste(opts),
        params: opts,
      });
      idx++;
    }
  }

  return permutations;
}
