//FILE: tests/integration/fixtures/open.permutations.ts

import { createVirtualOpen } from "../../../src/virtual_actions/kmjs.virtualAction.open";
import { specificApps } from "../utils/permutations.templates";

const stopOnFailureValues = [true, false, undefined];
const notifyOnFailureValues = [true, false, undefined];
const targets = ["Front", "Specific"] as const;

export function generateOpenPermutations() {
  const permutations: any[] = [];
  let idx = 0;
  for (const path of ["ExampleStringOptionHereOrPath"]) {
    for (const target of targets) {
      const specificVariants =
        target === "Specific" ? specificApps : [undefined as any];
      for (const specific of specificVariants) {
        for (const stopOnFailure of stopOnFailureValues) {
          for (const notifyOnFailure of notifyOnFailureValues) {
            const opts: any = { path, target };
            if (specific) opts.specific = specific;
            if (stopOnFailure !== undefined) opts.stopOnFailure = stopOnFailure;
            if (notifyOnFailure !== undefined)
              opts.notifyOnFailure = notifyOnFailure;
            permutations.push({
              name: `Open – Permutation ${idx}`,
              action: createVirtualOpen(opts),
              params: opts,
            });
            idx++;
          }
        }
      }
    }
  }
  return permutations;
}
