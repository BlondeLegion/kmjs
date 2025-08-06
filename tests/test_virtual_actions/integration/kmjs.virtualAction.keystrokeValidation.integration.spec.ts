//FILE: tests/test_virtual_actions/integration/kmjs.virtualAction.keystrokeValidation.integration.spec.ts

import {
  ensureTestMacroGroup,
  cleanupTestMacros,
  validateActionPermutation,
  FAILURES_DIR,
} from "../../../src/utils/km.testing";
import { generateKeystrokeValidationPermutations } from "../../integration/fixtures/keystrokeValidation.permutations";
import { createIntegrationTestSuite } from "../../integration/utils/integration-test-framework";

const permutations = generateKeystrokeValidationPermutations();

createIntegrationTestSuite(
  "Integration: Keystroke Validation for Virtual Actions",
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
