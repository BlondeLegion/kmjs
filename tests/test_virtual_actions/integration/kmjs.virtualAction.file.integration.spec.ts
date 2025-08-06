//FILE: tests/test_virtual_actions/integration/kmjs.virtualAction.file.integration.spec.ts

import {
  ensureTestMacroGroup,
  cleanupTestMacros,
  validateActionPermutation,
  FAILURES_DIR,
} from "../../../src/utils/km.testing";
import type { VirtualAction } from "../../../src/virtual_actions";
import { generateFileActionPermutations } from "../../integration/fixtures/file.permutations";
import { createIntegrationTestSuite } from "../../integration/utils/integration-test-framework";
import { createVirtualFile } from "../../../src/virtual_actions";

const permutations = generateFileActionPermutations().map(
  (opts: any, i: number) => ({
    name: `File Permutation ${i}`,
    action: createVirtualFile(opts) as VirtualAction,
  }),
);

createIntegrationTestSuite(
  "Integration: File Virtual Action",
  permutations,
  ({ name, action }: { name: string; action: VirtualAction }) => {
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
