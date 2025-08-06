//FILE: tests/test_virtual_actions/integration/kmjs.virtualAction.ifThenElse.multipleConditions.integration.spec.ts

/**
 * Focused integration test: ensure createVirtualIf accepts *multiple* conditions
 * and round-trips their XML correctly.
 */
import {
  ensureTestMacroGroup,
  cleanupTestMacros,
  validateActionPermutation,
  FAILURES_DIR,
} from "../../../src/utils/km.testing";
import { createVirtualIf } from "../../../src/virtual_actions";
import type { KMCondition } from "../../../src/virtual_actions/types";
import { createIntegrationTestSuite } from "../../integration/utils/integration-test-framework";
// --- Reusable sample conditions (keep simple & stable) -----------------
const clipboardCond: KMCondition = {
  ConditionType: "Clipboard",
  ClipboardConditionType: "Contains",
  ClipboardText: "TestString",
  ClipboardSourceUseTriggerClipboard: true,
};
const pathCond: KMCondition = {
  ConditionType: "Path",
  Path: "/tmp/testpath",
  PathConditionType: "SomethingExists",
};
const frontWindowCond: KMCondition = {
  ConditionType: "FrontWindow",
  FrontWindowConditionType: "ExistsButIsNotFullScreen",
  IsFrontApplication: true,
};
const mouseButtonCond: KMCondition = {
  ConditionType: "MouseButton",
  Button: 0,
  Pressed: true, // Pressed=true is omitted by serializer; included for completeness
};
// --- Action permutations ------------------------------------------------
const permutations = [
  {
    name: "IfThenElse – MultipleConditions Empty",
    action: createVirtualIf({
      conditions: [],
      match: "All",
      then: [],
      else: [],
    }),
  },
  {
    name: "IfThenElse – MultipleConditions Two",
    action: createVirtualIf({
      conditions: [clipboardCond, pathCond],
      match: "All",
      then: [],
      else: [],
    }),
  },
  {
    name: "IfThenElse – MultipleConditions Four",
    action: createVirtualIf({
      conditions: [clipboardCond, pathCond, frontWindowCond, mouseButtonCond],
      match: "All",
      then: [],
      else: [],
    }),
  },
];
createIntegrationTestSuite(
  "Integration: IfThenElse Virtual Action (multiple conditions)",
  permutations,
  ({ name, action }) => {
    const result = validateActionPermutation(name, action);
    if (!result.generatedXml) {
      result.generatedXml = action.toXml();
    }
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
