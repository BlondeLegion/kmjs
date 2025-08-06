//FILE: tests/test_virtual_actions/integration/kmjs.virtualAction.cancel.integration.spec.ts

import {
  ensureTestMacroGroup,
  cleanupTestMacros,
  validateActionPermutation,
  FAILURES_DIR,
} from "../../../src/utils/km.testing";
import { generateCancelPermutations } from "../../integration/fixtures/cancel.permutations";
import { createIntegrationTestSuite } from "../../integration/utils/integration-test-framework";
import { createVirtualCancel } from "../../../src/virtual_actions";

const permutations = generateCancelPermutations();

createIntegrationTestSuite(
  "Integration: Cancel Virtual Action",
  permutations,
  ({ name, action }) => {
    // Handle invalid permutations (where action is not a VirtualAction)
    if (typeof action !== "object" || typeof action.toXml !== "function") {
      return {
        name,
        passed: false,
        error: "Invalid Cancel permutation: action is not a VirtualAction",
        generatedXml: undefined,
        retrievedXml: undefined,
      };
    }

    // Handle expected error cases
    if (name.includes("[invalid - expected error]")) {
      try {
        action.toXml();
        return {
          name,
          passed: false,
          error: "Expected error but action.toXml() succeeded",
          generatedXml: undefined,
          retrievedXml: undefined,
        };
      } catch (error) {
        // Expected error occurred - this is a pass
        return {
          name,
          passed: true,
          generatedXml: undefined,
          retrievedXml: undefined,
        };
      }
    }

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
