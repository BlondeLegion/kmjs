//FILE: tests/integration/fixtures/openURL.permutations.ts

import { createVirtualOpenURL } from "../../../src/virtual_actions/kmjs.virtualAction.openURL";
import { specificApps } from "../utils/permutations.templates";

const bools = [true, false, undefined];
const targets = ["Front", "Specific"] as const;
const processingModes = [undefined, "TextTokensOnly", "Nothing"];

export function generateOpenURLPermutations() {
  const permutations: any[] = [];
  let idx = 0;
  for (const url of ["https://www.keyboardmaestro.com/"]) {
    for (const target of targets) {
      const specificVariants =
        target === "Specific" ? specificApps : [undefined as any];
      for (const specific of specificVariants) {
        for (const processingMode of processingModes) {
          for (const openInBackground of bools) {
            for (const stopOnFailure of bools) {
              for (const notifyOnFailure of bools) {
                for (const timeoutAborts of bools) {
                  for (const notifyOnTimeout of bools) {
                    const opts: any = { url, target };
                    if (specific) opts.specific = specific;
                    if (processingMode !== undefined)
                      opts.processingMode = processingMode;
                    if (openInBackground !== undefined)
                      opts.openInBackground = openInBackground;
                    if (stopOnFailure !== undefined)
                      opts.stopOnFailure = stopOnFailure;
                    if (notifyOnFailure !== undefined)
                      opts.notifyOnFailure = notifyOnFailure;
                    if (timeoutAborts !== undefined)
                      opts.timeoutAborts = timeoutAborts;
                    if (notifyOnTimeout !== undefined)
                      opts.notifyOnTimeout = notifyOnTimeout;
                    permutations.push({
                      name: `OpenURL – Permutation ${idx}`,
                      action: createVirtualOpenURL(opts),
                      params: opts,
                    });
                    idx++;
                  }
                }
              }
            }
          }
        }
      }
    }
  }
  return permutations;
}
