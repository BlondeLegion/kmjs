//FILE: tests/integration/fixtures/setVariableToCalculation.permutations.ts

import { createVirtualSetVariableToCalculation } from "../../../src/virtual_actions/kmjs.virtualAction.setVariableToCalculation";
import type { SetVariableToCalculationOptions } from "../../../src/virtual_actions/kmjs.virtualAction.setVariableToCalculation";

/**
 * Generate permutations for SetVariableToCalculation action testing.
 * Tests various combinations of variable, calculation, format, and failure options.
 */
export function generateSetVariableToCalculationPermutations() {
  const variables = [
    "ResultVar",
    "LOCALMainScreenHeightHalf",
    "EXAMPLETTLE",
    "",
    "Special<>&\"'Var",
  ];

  const texts = [
    "1+2",
    "SCREEN(Main,Height)/2",
    "1234.567",
    "",
    "ComplexExpr*2-1/(3+4)",
  ];

  const formats = [undefined, "0.00", "#,##0.##", "00000.0000", "# ##0.00 ¤"];

  const bools = [undefined, true, false];

  const permutations: Array<{
    name: string;
    action: ReturnType<typeof createVirtualSetVariableToCalculation>;
    params: SetVariableToCalculationOptions;
  }> = [];
  let i = 0;

  for (const variable of variables) {
    for (const text of texts) {
      for (const format of formats) {
        for (const stopOnFailure of bools) {
          for (const notifyOnFailure of bools) {
            const opts: SetVariableToCalculationOptions = {
              variable,
              text,
            };
            if (format !== undefined) opts.format = format;
            if (stopOnFailure !== undefined) opts.stopOnFailure = stopOnFailure;
            if (notifyOnFailure !== undefined)
              opts.notifyOnFailure = notifyOnFailure;
            permutations.push({
              name: `SetVariableToCalculation – Permutation ${i++}`,
              action: createVirtualSetVariableToCalculation(opts),
              params: opts,
            });
          }
        }
      }
    }
  }

  // Edge case: minimal
  permutations.push({
    name: `SetVariableToCalculation – Permutation ${i++}`,
    action: createVirtualSetVariableToCalculation({ variable: "", text: "" }),
    params: { variable: "", text: "" },
  });

  return permutations;
}
