//FILE: tests/test_virtual_actions/integration/kmjs.virtualAction.activate.integration.spec.ts

import {
  ensureTestMacroGroup,
  cleanupTestMacros,
  validateActionPermutation,
  FAILURES_DIR,
} from "../../../src/utils/km.testing";
import { generateActivatePermutations } from "../../integration/fixtures/activate.permutations";
import { createIntegrationTestSuite } from "../../integration/utils/integration-test-framework";
import type { VirtualAction } from "../../../src/virtual_actions/types";
/* ------------------------------------------------------------------ */
/* Generate permutations                                              */
/* ------------------------------------------------------------------ */

const permutations = generateActivatePermutations() as Array<{
  name: string;
  action: VirtualAction;
  params: any;
}>;

/* ------------------------------------------------------------------ */
/* Create the integration test suite                                  */
/* ------------------------------------------------------------------ */

createIntegrationTestSuite(
  "Integration: ActivateApplication Virtual Action",
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
