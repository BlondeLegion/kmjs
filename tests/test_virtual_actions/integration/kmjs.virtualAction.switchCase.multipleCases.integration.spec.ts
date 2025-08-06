//FILE: tests/test_virtual_actions/integration/kmjs.virtualAction.switchCase.multipleCases.integration.spec.ts

/**
 * Integration test: SwitchCase with multiple cases, each with distinct sub-actions.
 * Verifies correct execution and XML round-trip for multiple-case scenarios.
 */
import {
  ensureTestMacroGroup,
  cleanupTestMacros,
  validateActionPermutation,
  FAILURES_DIR,
} from "../../../src/utils/km.testing";
import { createVirtualSwitchCase } from "../../../src/virtual_actions/kmjs.virtualAction.switchCase";
import { createVirtualPause } from "../../../src/virtual_actions/kmjs.virtualAction.pause";
import { createVirtualNotification } from "../../../src/virtual_actions/kmjs.virtualAction.notification";
import { createIntegrationTestSuite } from "../../integration/utils/integration-test-framework";

const permutations = [
  {
    name: "SwitchCase – MultipleCases",
    action: createVirtualSwitchCase({
      source: "Text",
      text: "TestValue",
      textProcessingMode: "Nothing",
      cases: [
        {
          operator: "Is",
          testValue: "TestValue",
          actions: [
            createVirtualPause({ time: 1 }),
            createVirtualNotification({
              title: "Matched Is",
              body: "Case Is matched",
            }),
          ],
        },
        {
          operator: "Contains",
          testValue: "Value",
          actions: [
            createVirtualPause({ time: 2 }),
            createVirtualNotification({
              title: "Matched Contains",
              body: "Case Contains matched",
            }),
          ],
        },
        {
          operator: "Otherwise",
          testValue: "",
          actions: [
            createVirtualPause({ time: 3 }),
            createVirtualNotification({
              title: "Matched Otherwise",
              body: "Otherwise case matched",
            }),
          ],
        },
      ],
    }),
  },
  {
    name: "SwitchCase – VariableSource",
    action: createVirtualSwitchCase({
      source: "Variable",
      variable: "TestVar",
      cases: [
        {
          operator: "IsNotEmpty",
          testValue: "",
          actions: [
            createVirtualNotification({
              title: "Variable Not Empty",
              body: "Variable has value",
            }),
          ],
        },
        {
          operator: "Otherwise",
          testValue: "",
          actions: [
            createVirtualNotification({
              title: "Variable Empty",
              body: "Variable is empty",
            }),
          ],
        },
      ],
    }),
  },
  {
    name: "SwitchCase – CalculationSource",
    action: createVirtualSwitchCase({
      source: "Calculation",
      calculation: "2+2",
      cases: [
        {
          operator: "Equal",
          testValue: "4",
          actions: [
            createVirtualNotification({
              title: "Calculation Equal",
              body: "Calculation is 4",
            }),
          ],
        },
        {
          operator: "Otherwise",
          testValue: "",
          actions: [
            createVirtualNotification({
              title: "Calculation Not Equal",
              body: "Calculation is not 4",
            }),
          ],
        },
      ],
    }),
  },
  {
    name: "SwitchCase – FileSource",
    action: createVirtualSwitchCase({
      source: "File",
      path: "/tmp/test.txt",
      cases: [
        {
          operator: "IsEmpty",
          testValue: "",
          actions: [
            createVirtualNotification({
              title: "File Is Empty",
              body: "File is empty",
            }),
          ],
        },
        {
          operator: "IsNotEmpty",
          testValue: "",
          actions: [
            createVirtualNotification({
              title: "File Not Empty",
              body: "File has content",
            }),
          ],
        },
      ],
    }),
  },
];

createIntegrationTestSuite(
  "Integration: SwitchCase Virtual Action (multiple cases)",
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
