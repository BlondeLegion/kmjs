//FILE: tests/integration/fixtures/selectMenuItem.permutations.ts

/**
 * Generates exhaustive permutations for the selectMenuItem (SelectMenuItem) virtual action.
 */
import { createVirtualselectMenuItem } from "../../../src/virtual_actions/kmjs.virtualAction.selectMenuItem";
import { specificApps } from "../utils/permutations.templates";

const targets = ["Front", "Specific"] as const;
const bools = [undefined, true, false] as const;

export function generateselectMenuPermutations() {
  const list: Array<{
    name: string;
    action: ReturnType<typeof createVirtualselectMenuItem>;
    params: any;
  }> = [];
  let n = 0;

  // Use menuPath instead of menuTitle/menuItem for new API
  const menuPaths = [
    ["File"],
    ["File", "Export"],
    ["Window", "Workspace", "CGTest1"],
    ["Format", "Alignment", "Writing Direction", "\tLeft to Right"],
  ];

  for (const target of targets) {
    const specs = target === "Specific" ? specificApps : [undefined as any];
    for (const specific of specs) {
      for (const menuPath of menuPaths) {
        for (const stopOnFailure of bools) {
          for (const notifyOnFailure of bools) {
            const opts: any = {
              target,
              specific,
              menuPath,
              stopOnFailure,
              notifyOnFailure,
            };
            if (target !== "Specific") delete opts.specific;
            list.push({
              name: `selectMenuItem – Permutation ${n}`,
              action: createVirtualselectMenuItem(opts),
              params: opts,
            });
            n++;
          }
        }
      }
    }
  }
  return list;
}
