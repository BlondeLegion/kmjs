//FILE: tests/test_virtual_actions/integration/kmjs.virtualAction.cut.integration.spec.ts

import {
  ensureTestMacroGroup,
  cleanupTestMacros,
  validateActionPermutation,
  FAILURES_DIR,
} from "../../../src/utils/km.testing";
import { generateCutPermutations } from "../../integration/fixtures/cut.permutations";
import { createIntegrationTestSuite } from "../../integration/utils/integration-test-framework";

const permutations = generateCutPermutations();

createIntegrationTestSuite(
  "Integration: Cut Virtual Action",
  permutations,
  ({ name, action }) => {
    const result = validateActionPermutation(name, action);

    if (!result.generatedXml) result.generatedXml = action.toXml();

    if (result.scriptError) {
      result.error = `AppleScript execution failed: ${result.scriptError}`;
    }
    if (result.engineErrors && result.engineErrors.length > 0) {
      result.error = `KM Engine reported errors: ${result.engineErrors.join(", ")}`;
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
