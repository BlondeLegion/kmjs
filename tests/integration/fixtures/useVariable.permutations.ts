//FILE: src/tests/integration/fixtures/useVariable.useVariable.ts
import {
  createVirtualUseVariable,
  UseVariableAction,
} from "../../../src/virtual_actions/kmjs.virtualAction.useVariable";

const actions: UseVariableAction[] = [
  "SetMouse",
  "SetWindowPosition",
  "SetWindowSize",
  "SetWindowFrame",
  "SetWindowByName",
  "SetWindowByNameContains",
  "SetWindowByNameMatches",
  "SetApplicationByName",
  "SetApplicationByNameContains",
  "SetApplicationByNameMatches",
  "SetSystemVolume",
];

const variableNames = [
  "", // empty string (default)
  "ExampleUseVariableString",
  "AnotherVar",
];

const stopOnFailure = [false, true];
const notifyOnFailure = [true, false];

export function generateUseVariablePermutations() {
  const result: Array<{
    name: string;
    action: ReturnType<typeof createVirtualUseVariable>;
  }> = [];
  let idx = 0;
  for (const action of actions) {
    for (const variable of variableNames) {
      for (const stop of stopOnFailure) {
        for (const notify of notifyOnFailure) {
          result.push({
            name: `UseVariable – ${action} – ${variable} – stop:${stop} – notify:${notify} – ${idx}`,
            action: createVirtualUseVariable({
              action,
              variable,
              stopOnFailure: stop,
              notifyOnFailure: notify,
            }),
          });
          idx++;
        }
      }
    }
  }
  return result;
}
