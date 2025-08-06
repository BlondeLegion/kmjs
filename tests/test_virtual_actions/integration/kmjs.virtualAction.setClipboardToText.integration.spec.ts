//FILE: tests/test_virtual_actions/integration/kmjs.virtualAction.setClipboardToText.integration.spec.ts

import {
  ensureTestMacroGroup,
  cleanupTestMacros,
  validateActionPermutation,
  FAILURES_DIR,
} from "../../../src/utils/km.testing";
import { generateSetClipboardToTextPermutations } from "../../integration/fixtures/setClipboardToText.permutations";
import { createIntegrationTestSuite } from "../../integration/utils/integration-test-framework";
import type { VirtualAction } from "../../../src/virtual_actions/types";

const permutations = generateSetClipboardToTextPermutations() as Array<{
  name: string;
  action: VirtualAction;
  params: any;
}>;

createIntegrationTestSuite(
  "Integration: SetClipboardToText Virtual Action",
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
);
