//FILE: tests/integration/fixtures/activate.permutations.ts

/**
 * Auto-generates **all possible permutations** for the ActivateApplication
 * virtual action given the current option space in
 * `kmjs.virtualAction.activate.ts`.
 *
 * We intentionally enumerate the full cross product of:
 *
 *   target ∈ { Front, Specific }
 *   specific (only when target === Specific) ∈ specificApps[]
 *   allWindows ∈ { false, true }
 *   reopenWindows ∈ { false, true }
 *   alreadyActivatedAction ∈ {
 *       Normal, SwitchToLast, BringAllWindows, Reopen,
 *       Hide,   HideOthers,   Quit
 *   }
 *   timeoutAborts ∈ { true, false }
 *
 * Total permutations:
 *   Front:      1 * 2 * 2 * 7 * 2 = 56
 *   Specific: N * 2 * 2 * 7 * 2 = 56 * N
 *   TOTAL = 56 * (1 + N) where N = specificApps.length
 *
 * No explicit TestPermutation import / return typing — we let TS infer the
 * shape including the additional `params` used by downstream filename logic.
 */

import { createVirtualActivate } from "../../../src/virtual_actions/kmjs.virtualAction.activate";
import { specificApps } from "../utils/permutations.templates";

/* ------------------------------------------------------------------ */
/* Enumerations                                                        */
/* ------------------------------------------------------------------ */

const targets = ["Front", "Specific"] as const;
const allWindowsOpts = [false, true] as const;
const reopenWindowsOpts = [false, true] as const;
const alreadyActivatedActions = [
  "Normal",
  "SwitchToLast",
  "BringAllWindows",
  "Reopen",
  "Hide",
  "HideOthers",
  "Quit",
] as const;
const timeoutAbortsOpts = [true, false] as const;

/* Optional diagnostic logging (exported for reuse / assertions) */
export const PERMUTATION_COUNTS = {
  targets: targets.length,
  specificApps: specificApps.length,
  allWindows: allWindowsOpts.length,
  reopenWindows: reopenWindowsOpts.length,
  alreadyActivatedActions: alreadyActivatedActions.length,
  timeoutAborts: timeoutAbortsOpts.length,
  total:
    // Front target (no specific app)
    1 *
      allWindowsOpts.length *
      reopenWindowsOpts.length *
      alreadyActivatedActions.length *
      timeoutAbortsOpts.length +
    // Specific target (× specificApps)
    specificApps.length *
      allWindowsOpts.length *
      reopenWindowsOpts.length *
      alreadyActivatedActions.length *
      timeoutAbortsOpts.length,
};

/* ------------------------------------------------------------------ */
/* Permutation generator                                               */
/* ------------------------------------------------------------------ */

export function generateActivatePermutations() {
  const permutations: any[] = [];
  let idx = 0;

  for (const target of targets) {
    const specificVariants =
      target === "Specific" ? specificApps : [undefined as any];

    for (const specific of specificVariants) {
      for (const allWindows of allWindowsOpts) {
        for (const reopenWindows of reopenWindowsOpts) {
          for (const alreadyActivatedAction of alreadyActivatedActions) {
            for (const timeoutAborts of timeoutAbortsOpts) {
              const opts: any = {
                target,
                allWindows,
                reopenWindows,
                alreadyActivatedAction,
                timeoutAborts,
              };
              if (target === "Specific") opts.specific = specific;

              permutations.push({
                name: `Activate – Permutation ${idx}`,
                action: createVirtualActivate(opts),
                params: opts,
              });
              idx++;
            }
          }
        }
      }
    }
  }

  if (process.env.KMJS_VERBOSE_PERMUTATIONS === "1") {
    console.log("[Activate] Permutation counts:", PERMUTATION_COUNTS);
    console.log(
      `[Activate] Generated ${permutations.length} permutations (expected ${PERMUTATION_COUNTS.total}).`,
    );
  }

  return permutations;
}
