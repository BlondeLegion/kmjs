//FILE: tests/test_virtual_actions/integration/kmjs.virtualAction.manipulateWindow.integration.spec.ts

import {
  ensureTestMacroGroup,
  cleanupTestMacros,
  validateActionPermutation,
  FAILURES_DIR,
} from "../../../src/utils/km.testing";
import { generateManipulateWindowPermutations } from "../../integration/fixtures/manipulateWindow.permutations";
import { createIntegrationTestSuite } from "../../integration/utils/integration-test-framework";
import type { VirtualAction } from "../../../src/virtual_actions/types";

/* ------------------------------------------------------------------ */
/* Generate permutations                                              */
/* ------------------------------------------------------------------ */

const permutations = generateManipulateWindowPermutations() as Array<{
  name: string;
  action: VirtualAction;
  params: any;
}>;

/* ------------------------------------------------------------------ */
/* Create the integration test suite                                  */
/* ------------------------------------------------------------------ */

createIntegrationTestSuite(
  "Integration: ManipulateWindow Virtual Action",
  permutations,
  ({ name, action }: { name: string; action: VirtualAction }) => {
    // TEMP: Log XML for the first permutation for debugging
    if (name.endsWith("Permutation 0")) {
      // eslint-disable-next-line no-console
      console.log(
        "\n--- XML for first permutation ---\n" +
          action.toXml() +
          "\n-------------------------------\n",
      );
    }
    const result = validateActionPermutation(name, action);

    if (!result.generatedXml) result.generatedXml = action.toXml();

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
