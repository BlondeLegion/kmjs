//FILE: tests/test_virtual_actions/integration/kmjs.virtualAction.ifThenElse.integration.spec.ts

import {
  ensureTestMacroGroup,
  cleanupTestMacros,
  validateActionPermutation,
  FAILURES_DIR,
} from "../../../src/utils/km.testing";
import { generateIfActionPermutations } from "../../integration/fixtures/ifThenElse.permutations";
import { createIntegrationTestSuite } from "../../integration/utils/integration-test-framework";

// Generate permutations
const permutations = generateIfActionPermutations();
// DEBUG: only take the first X permutations
// const permutations = generateIfActionPermutations().slice(0, 20);

// Create the integration test suite
createIntegrationTestSuite(
  "Integration: IfThenElse Virtual Action",
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

    if (result.generatedXml !== result.retrievedXml) {
      // temp - removed this block so the framework handles XML mismatches
      // result.error = "Generated XML does not match retrieved XML";
      // return result;
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
