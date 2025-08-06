//FILE: tests/test_virtual_actions/integration/kmjs.virtualAction.showSpecificApp.integration.spec.ts

import {
  ensureTestMacroGroup,
  cleanupTestMacros,
  validateActionPermutation,
  FAILURES_DIR,
} from "../../../src/utils/km.testing";
import { generateShowSpecificAppPermutations } from "../../integration/fixtures/showSpecificApp.permutations";
import { createIntegrationTestSuite } from "../../integration/utils/integration-test-framework";

const permutations = generateShowSpecificAppPermutations();

createIntegrationTestSuite(
  "Integration: ShowSpecificApp Virtual Action",
  permutations,
  ({ name, action }) => {
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
