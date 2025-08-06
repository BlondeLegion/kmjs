//FILE: tests/test_virtual_actions/integration/kmjs.virtualAction.switchCase.integration.spec.ts

import { describe, it, afterAll } from "vitest";
import {
  ensureTestMacroGroup,
  cleanupTestMacros,
  validateActionPermutation,
} from "../../../src/utils/km.testing";
import { generateSwitchCasePermutations } from "../../integration/fixtures/switchCase.permutations";

// Minimal “pause” factory fallback (if not exported separately)
// If your repository already exposes createVirtualPause via index.ts, remove this import block.
const permutations = generateSwitchCasePermutations();

describe("Integration: SwitchCase Virtual Action", () => {
  for (const { name, action } of permutations) {
    it(`should correctly process permutation: '${name}'`, () => {
      const result = validateActionPermutation(name, action);
      if (!result.generatedXml) result.generatedXml = action.toXml();
      if (result.scriptError) {
        result.error = `AppleScript execution failed: ${result.scriptError}`;
        throw new Error(result.error);
      }
      if (result.engineErrors && result.engineErrors.length > 0) {
        result.error = `KM Engine reported errors: ${result.engineErrors.join(", ")}`;
        throw new Error(result.error);
      }
    });
  }
  afterAll(() => {
    ensureTestMacroGroup();
    cleanupTestMacros();
  });
});
