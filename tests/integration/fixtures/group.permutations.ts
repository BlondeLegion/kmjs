//FILE: tests/integration/fixtures/group.permutations.ts

import { createVirtualGroup } from "../../../src/virtual_actions/kmjs.virtualAction.group";
import type { GroupOptions } from "../../../src/virtual_actions/kmjs.virtualAction.group";
import { createVirtualNotification } from "../../../src/virtual_actions/kmjs.virtualAction.notification";
import { createVirtualPause } from "../../../src/virtual_actions/kmjs.virtualAction.pause";

/**
 * Generate permutations for Group virtual action testing.
 */
export function generateGroupPermutations() {
  const actionsList: GroupOptions["actions"][] = [
    [createVirtualPause({ time: 0.5 })],
    [
      createVirtualNotification({ title: "Hello", body: "World" }),
      createVirtualPause({ time: 1 }),
    ],
    [],
  ];

  const timeoutOptions: Array<boolean | undefined> = [undefined, false];

  const permutations: Array<{
    name: string;
    action: ReturnType<typeof createVirtualGroup>;
    params: GroupOptions;
  }> = [];
  let idx = 0;

  for (const actions of actionsList) {
    for (const timeOutAbortsMacro of timeoutOptions) {
      const name = `Group – Permutation ${idx}`;
      const opts: GroupOptions = { name: `Test Group ${idx}`, actions };
      if (timeOutAbortsMacro !== undefined)
        opts.timeOutAbortsMacro = timeOutAbortsMacro;
      permutations.push({
        name,
        action: createVirtualGroup(opts),
        params: opts,
      });
      idx++;
    }
  }

  return permutations;
}
