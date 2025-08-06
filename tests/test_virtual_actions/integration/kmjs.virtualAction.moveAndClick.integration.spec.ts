//FILE: tests/test_virtual_actions/integration/kmjs.virtualAction.moveAndClick.integration.spec.ts

import {
  ensureTestMacroGroup,
  cleanupTestMacros,
  validateActionPermutation,
  FAILURES_DIR,
} from "../../../src/utils/km.testing";
import { generateMoveAndClickPermutations } from "../../integration/fixtures/moveAndClick.permutations";
import { createIntegrationTestSuite } from "../../integration/utils/integration-test-framework";

// Generate permutations
const permutations = generateMoveAndClickPermutations();

// Create the integration test suite
createIntegrationTestSuite(
  "Integration: MoveAndClick Virtual Action",
  permutations,
  ({ name, action }) => {
    const result = validateActionPermutation(name, action);

    // Ensure XML data is always present for the framework
    if (!result.generatedXml) {
      result.generatedXml = action.toXml();
    }

    // Additional assertions specific to this test
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
