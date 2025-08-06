//FILE: tests/integration/fixtures/setVariable.permutations.ts

import { createVirtualSetVariable } from "../../../src/virtual_actions/kmjs.virtualAction.setVariable";
import type { SetVariableOptions } from "../../../src/virtual_actions/kmjs.virtualAction.setVariable";
import type {
  SetVariableWhere,
  ProcessingMode,
} from "../../../src/virtual_actions/types/types.data";
import type { SetVariablePresetMode } from "../../../src/utils/template.xml.variable";

const variables = ["ExampleVariableName", "TestVar", "Unicode变量"];
const texts = [
  "ExampleVariableString",
  "",
  "Special <>&\"'",
  "Long".repeat(50),
];
const processingModes: ProcessingMode[] = [
  undefined,
  "TextTokensOnly",
  "Nothing",
];
const whereModes: SetVariableWhere[] = [undefined, "Prepend", "Append"];
const presetModes: SetVariablePresetMode[] = [
  undefined,
  "delete",
  "positionCursor",
];

export function generateSetVariablePermutations() {
  const perms: Array<{
    name: string;
    action: ReturnType<typeof createVirtualSetVariable>;
    params: SetVariableOptions;
  }> = [];
  let i = 0;
  for (const variable of variables) {
    for (const text of texts) {
      for (const processingMode of processingModes) {
        for (const where of whereModes) {
          for (const presetMode of presetModes) {
            // Only use text if presetMode is undefined
            const opts: SetVariableOptions = {
              variable,
              text: presetMode ? undefined : text,
              processingMode,
              where,
              presetMode,
            };
            perms.push({
              name: `SetVariable – Permutation ${i}`,
              action: createVirtualSetVariable(opts),
              params: opts,
            });
            i++;
          }
        }
      }
    }
  }
  return perms;
}
