//FILE: tests/integration/fixtures/showSpecificApp.permutations.ts

import { createVirtualShowSpecificApp } from "../../../src/virtual_actions/kmjs.virtualAction.showSpecificApp";
import { allSpecificAppPermutations } from "../utils/permutations.templates";

const targets = ["Specific"] as const;

/**
 * Generates exhaustive permutations for the ShowSpecificApp virtual action.
 * Uses all valid targets and all programmatically generated app location permutations.
 */
export function generateShowSpecificAppPermutations() {
  const list: Array<{
    name: string;
    action: ReturnType<typeof createVirtualShowSpecificApp>;
    params: any;
  }> = [];
  let n = 0;

  for (const target of targets) {
    for (const specific of allSpecificAppPermutations) {
      list.push({
        name: `ShowSpecificApp – ${target} – Permutation ${n}`,
        action: createVirtualShowSpecificApp({ target, specific }),
        params: { target, specific },
      });
      n++;
    }
  }
  return list;
}
