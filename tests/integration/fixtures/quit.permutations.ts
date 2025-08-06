//FILE: tests/integration/fixtures/quit.permutations.ts

/**
 * Generates exhaustive permutations for the Quit virtual action.
 */
import { createVirtualQuit } from "../../../src/virtual_actions/kmjs.virtualAction.quit";
import { specificApps } from "../utils/permutations.templates";

const variants = [
  "Quit",
  "QuitRelaunch",
  "ForceQuit",
  "ForceQuitRelaunch",
] as const;

const targets = ["Front", "Specific"] as const;
const bools = [true, false] as const;

export function generateQuitPermutations() {
  const list: Array<{
    name: string;
    action: ReturnType<typeof createVirtualQuit>;
    params: any;
  }> = [];
  let n = 0;

  for (const variant of variants) {
    for (const target of targets) {
      const specs = target === "Specific" ? specificApps : [undefined as any];
      for (const specific of specs) {
        for (const timeoutAborts of bools) {
          const opts: any = {
            variant,
            target,
            timeoutAborts,
          };
          if (target === "Specific") opts.specific = specific;
          list.push({
            name: `Quit – Permutation ${n}`,
            action: createVirtualQuit(opts),
            params: opts,
          });
          n++;
        }
      }
    }
  }
  return list;
}
