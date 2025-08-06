//FILE: tests/integration/fixtures/pressButton.permutations.ts

import type { PressButtonOptions } from "../../../src/virtual_actions/kmjs.virtualAction.pressButton";

/**
 * Generates comprehensive permutations for Press Button action testing.
 * Tests all combinations of button action types, timeout settings, and failure handling.
 */
export function generatePressButtonPermutations(): PressButtonOptions[] {
  const permutations: PressButtonOptions[] = [];

  // Button action types to test
  const actionTypes: PressButtonOptions["action"][] = [
    "PressButtonNamed",
    "ShowMenuOfButtonNamed",
    "DecrementSliderNamed",
    "IncrementSliderNamed",
    "CancelButtonNamed",
  ];

  // Test button names
  const buttonNames = ["ExampleButtonNameString"];

  // Boolean combinations for various settings
  const booleanValues = [true, false, undefined];

  for (const action of actionTypes) {
    for (const buttonName of buttonNames) {
      // Basic case without waitForEnabledButton
      permutations.push({
        action,
        buttonName,
      });

      // Cases with waitForEnabledButton enabled
      for (const waitForEnabledButton of [true]) {
        for (const timeoutAborts of booleanValues) {
          for (const notifyOnTimeout of booleanValues) {
            for (const stopOnFailure of booleanValues) {
              for (const notifyOnFailure of booleanValues) {
                permutations.push({
                  action,
                  buttonName,
                  waitForEnabledButton,
                  timeoutAborts,
                  notifyOnTimeout,
                  stopOnFailure,
                  notifyOnFailure,
                });
              }
            }
          }
        }
      }
    }
  }

  return permutations;
}
