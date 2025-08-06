//FILE: tests/test_virtual_actions/integration/kmjs.virtualAction.setVariable.integration.spec.ts

import {
  ensureTestMacroGroup,
  cleanupTestMacros,
  validateActionPermutation,
  FAILURES_DIR,
} from "../../../src/utils/km.testing";
import { generateSetVariablePermutations } from "../../integration/fixtures/setVariable.permutations";
import { createIntegrationTestSuite } from "../../integration/utils/integration-test-framework";
import type { VirtualAction } from "../../../src/virtual_actions/types";

const permutations = generateSetVariablePermutations() as Array<{
  name: string;
  action: VirtualAction;
  params: any;
}>;

createIntegrationTestSuite(
  "Integration: SetVariable Virtual Action",
  permutations,
  ({ name, action }: { name: string; action: VirtualAction }) => {
    const result = validateActionPermutation(name, action);
    if (!result.generatedXml) result.generatedXml = action.toXml();
    if (result.scriptError) {
      result.error = `AppleScript execution failed: ${result.scriptError}`;
      return result;
    }
    if (result.engineErrors && result.engineErrors.length > 0) {
      result.error = `KM Engine reported errors: ${result.engineErrors.join(", ")}`;
      return result;
    }
    return result;
  },
  {
    failuresDir: FAILURES_DIR,
    customCleanup: () => {
      ensureTestMacroGroup();
      cleanupTestMacros();
    },
  },
);
