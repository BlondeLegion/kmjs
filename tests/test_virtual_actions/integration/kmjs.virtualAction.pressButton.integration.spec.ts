//FILE: tests/test_virtual_actions/integration/kmjs.virtualAction.pressButton.integration.spec.ts

import {
  ensureTestMacroGroup,
  cleanupTestMacros,
  validateActionPermutation,
  FAILURES_DIR,
} from "../../../src/utils/km.testing";
import { generatePressButtonPermutations } from "../../integration/fixtures/pressButton.permutations";
import { createIntegrationTestSuite } from "../../integration/utils/integration-test-framework";
import { createVirtualPressButton } from "../../../src/virtual_actions/kmjs.virtualAction.pressButton";

const permutations = generatePressButtonPermutations().map((opts, index) => ({
  name: `PressButton_Permutation_${index + 1}`,
  action: createVirtualPressButton(opts),
}));

createIntegrationTestSuite(
  "Integration: PressButton Virtual Action",
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
