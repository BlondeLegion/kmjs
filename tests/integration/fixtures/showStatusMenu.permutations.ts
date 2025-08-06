//FILE: tests/integration/fixtures/showStatusMenu.permutations.ts

/**
 * Generates permutations for the ShowStatusMenu virtual action.
 * This action has no parameters, so only one permutation is needed.
 */
import { createVirtualShowStatusMenu } from "../../../src/virtual_actions/kmjs.virtualAction.showStatusMenu";

export function generateShowStatusMenuPermutations() {
  return [
    {
      name: "ShowStatusMenu – Default",
      action: createVirtualShowStatusMenu({}),
      params: {},
    },
  ];
}
