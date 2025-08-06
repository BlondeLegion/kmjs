//FILE: tests/integration/fixtures/pause.permutations.ts

/**
 * Generates safe permutations for the Pause virtual action.
 * We only supply `unit` when `time` is present, avoiding invalid combos.
 * No TestPermutation import or return type annotation here either.
 */

import { createVirtualPause } from "../../../src/virtual_actions/kmjs.virtualAction.pause";

const times = [undefined, 0.1, 1, 5] as const;
const unitsWithTime = [
  undefined,
  "Seconds",
  "Minutes",
  "Hours",
  "Hundredths",
] as const;

export function generatePausePermutations() {
  const list: Array<{
    name: string;
    action: ReturnType<typeof createVirtualPause>;
    params: any;
  }> = [];
  let n = 0;

  for (const time of times) {
    // only allow unit if time is explicitly set
    const units = time === undefined ? [undefined] : unitsWithTime;
    for (const unit of units) {
      const opts: any = {};
      if (time !== undefined) opts.time = time;
      if (unit !== undefined) opts.unit = unit;

      list.push({
        name: `Pause – Permutation ${n}`,
        action: createVirtualPause(opts),
        params: opts,
      });
      n++;
    }
  }

  return list;
}
