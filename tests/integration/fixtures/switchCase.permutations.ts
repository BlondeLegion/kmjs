//FILE: tests/integration/fixtures/switchCase.permutations.ts

/**
 * Auto-generates *all* test-cases for the SwitchCase virtual action, following the style of ifThenElse.permutations.ts.
 * All sources, operators, and relevant test values are expanded automatically.
 */

import { createVirtualSwitchCase } from "../../../src/virtual_actions/kmjs.virtualAction.switchCase";
import { createVirtualPause } from "../../../src/virtual_actions/kmjs.virtualAction.pause";
import type {
  SwitchSource,
  SwitchCaseOperator,
} from "../../../src/virtual_actions/kmjs.virtualAction.switchCase";
import type { ProcessingMode } from "../../../src/virtual_actions/types/types.data";

// Use canonical sources and operators from the SwitchCase file
const SOURCES: SwitchSource[] = [
  "Clipboard",
  "Variable",
  "Text",
  "Calculation",
  "EnvironmentVariable",
  "File",
];

const OPERATORS: SwitchCaseOperator[] = [
  "IsEmpty",
  "IsNotEmpty",
  "Is",
  "IsNot",
  "Contains",
  "DoesNotContain",
  "StartsWith",
  "EndsWith",
  "IsBefore",
  "IsAfter",
  "Matches",
  "DoesNotMatch",
  "LessThan",
  "LessThanOrEqual",
  "Equal",
  "GreaterThanOrEqual",
  "GreaterThan",
  "NotEqual",
  "Otherwise",
];

const TEST_VALUES = ["", "Example String", "Another Value", "123"];

const TEXT_PROCESSING_MODES: ProcessingMode[] = ["Nothing", "TextTokensOnly"];

export function generateSwitchCasePermutations() {
  let index = 0;
  const result: { name: string; action: any }[] = [];
  for (const source of SOURCES) {
    if (source === "Text") {
      for (const textProcessingMode of TEXT_PROCESSING_MODES) {
        for (const operator of OPERATORS) {
          for (const testValue of TEST_VALUES) {
            const actualTestValue = operator === "Otherwise" ? "" : testValue;
            const opts: any = {
              source,
              text: "Example text here",
              textProcessingMode,
              cases: [
                {
                  operator,
                  testValue: actualTestValue,
                  actions: [createVirtualPause({ time: 1.5 })],
                },
              ],
            };
            result.push({
              name: `SwitchCase – Permutation ${index++} (${source}, ${operator}, ${JSON.stringify(actualTestValue)}, ${textProcessingMode})`,
              action: createVirtualSwitchCase(opts),
            });
          }
        }
      }
    } else {
      for (const operator of OPERATORS) {
        for (const testValue of TEST_VALUES) {
          const actualTestValue = operator === "Otherwise" ? "" : testValue;
          const opts: any = {
            source,
            cases: [
              {
                operator,
                testValue: actualTestValue,
                actions: [createVirtualPause({ time: 1.5 })],
              },
            ],
          };
          if (source === "Variable") opts.variable = "ExampleVariable";
          if (source === "Calculation") opts.calculation = "1+2";
          if (source === "EnvironmentVariable")
            opts.environmentVariable = "PATH";
          if (source === "File") opts.path = "/tmp/example.txt";
          result.push({
            name: `SwitchCase – Permutation ${index++} (${source}, ${operator}, ${JSON.stringify(actualTestValue)})`,
            action: createVirtualSwitchCase(opts),
          });
        }
      }
    }
  }
  return result;
}
