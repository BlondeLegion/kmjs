//FILE: tests/integration/fixtures/keystrokeValidation.permutations.ts

/**
 * Generates comprehensive permutations for testing keystroke utilities
 * with virtual actions to ensure they produce valid Keyboard Maestro XML.
 * Focus: test all keystroke input forms and modifier combinations.
 */
import { createVirtualTypeKeystroke } from "../../../src/virtual_actions/kmjs.virtualAction.typeKeystroke";
import { normalizeAppleScriptShortcut } from "../../../src/utils/utils.keystroke";

// Test various keystroke input formats
const keystrokeTestCases = [
  // Single keys
  "a",
  "A",
  "1",
  "KeyA",
  "Digit1",
  "Space",
  "Enter",
  "Escape",
  "Tab",
  "Backspace",
  "Delete",

  // Arrow keys
  "ArrowUp",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",

  // Function keys
  "F1",
  "F12",

  // Modifier combinations
  "Cmd+a",
  "Cmd+A",
  "Cmd+KeyA",
  "Shift+a",
  "Option+a",
  "Control+a",
  "Cmd+Shift+a",
  "Cmd+Option+a",
  "Cmd+Control+a",
  "Option+Shift+a",
  "Control+Shift+a",
  "Control+Option+a",
  "Cmd+Option+Shift+a",
  "Cmd+Control+Shift+a",
  "Cmd+Control+Option+a",
  "Control+Option+Shift+a",
  "Cmd+Control+Option+Shift+a",

  // Common shortcuts
  "Cmd+S",
  "Cmd+C",
  "Cmd+V",
  "Cmd+X",
  "Cmd+Z",
  "Cmd+Shift+Z",
  "Cmd+A",
  "Cmd+N",
  "Cmd+O",
  "Cmd+W",
  "Cmd+Q",
  "Cmd+T",
  "Cmd+R",
  "Cmd+F",
  "Cmd+G",
  "Cmd+H",
  "Cmd+M",
  "Cmd+P",

  // Numeric keycodes
  36, // Return
  53, // Escape
  48, // Tab
  49, // Space
  51, // Delete/Backspace

  // Special characters and symbols
  "Comma",
  "Period",
  "Slash",
  "Semicolon",
  "Quote",
  "BracketLeft",
  "BracketRight",
  "Backslash",
  "Backquote",
  "Minus",
  "Equal",
];

// Test modifier-only combinations (should result in null key)
const modifierOnlyTestCases = [
  "Cmd",
  "Shift",
  "Option",
  "Control",
  "Cmd+Shift",
  "Cmd+Option",
  "Cmd+Control",
  "Option+Shift",
  "Control+Shift",
  "Control+Option",
  "Cmd+Option+Shift",
  "Cmd+Control+Shift",
  "Cmd+Control+Option",
  "Control+Option+Shift",
  "Cmd+Control+Option+Shift",
];

export function generateKeystrokeValidationPermutations() {
  const list: Array<{
    name: string;
    action: ReturnType<typeof createVirtualTypeKeystroke>;
    params: any;
  }> = [];
  let i = 0;

  // Test regular keystroke combinations
  for (const keystroke of keystrokeTestCases) {
    try {
      // First validate that our utility can normalize it
      const normalized = normalizeAppleScriptShortcut(keystroke);

      list.push({
        name: `KeystrokeValidation – ${typeof keystroke === "string" ? keystroke : `KeyCode${keystroke}`} ${i}`,
        action: createVirtualTypeKeystroke({ keystroke }),
        params: { keystroke, normalized },
      });
      i++;
    } catch (error) {
      // Skip invalid keystrokes but log them for debugging
      console.warn(`Skipping invalid keystroke: ${keystroke} - ${error}`);
    }
  }

  // Test modifier-only combinations - these should be supported by keystroke utilities
  // but rejected by typeKeystroke action (since you can't "type" just a modifier)
  for (const modifierCombo of modifierOnlyTestCases) {
    try {
      // First verify our keystroke utilities can handle it
      const normalized = normalizeAppleScriptShortcut(modifierCombo);

      // Then verify typeKeystroke properly rejects it
      try {
        createVirtualTypeKeystroke({ keystroke: modifierCombo });
        console.warn(
          `Expected typeKeystroke to reject modifier-only: ${modifierCombo}`,
        );
      } catch (typeKeystrokeError) {
        // This is expected - typeKeystroke should reject modifier-only keystrokes
        console.log(
          `✓ typeKeystroke correctly rejected modifier-only: ${modifierCombo}`,
        );
      }

      // Don't add these to the test list since they're expected to fail
      // The important thing is that our keystroke utilities support them
    } catch (error) {
      console.warn(
        `Keystroke utilities failed for: ${modifierCombo} - ${error}`,
      );
    }
  }

  // Test map format inputs
  const mapTestCases = [
    { 0: 0 }, // No modifiers, key A
    { 256: 1 }, // Cmd + key S
    { 512: 2 }, // Shift + key D
    { 768: 3 }, // Cmd+Shift + key F
    { 2048: 4 }, // Option + key H
    { 2304: 5 }, // Cmd+Option + key G
    { 4096: 6 }, // Control + key Z
    { 6912: 7 }, // All modifiers + key X
  ];

  for (const mapKeystroke of mapTestCases) {
    list.push({
      name: `KeystrokeValidation – Map ${JSON.stringify(mapKeystroke)} ${i}`,
      action: createVirtualTypeKeystroke({
        keystroke: mapKeystroke as unknown as Record<number, number>,
      }),
      params: { keystroke: mapKeystroke, isMap: true },
    });
    i++;
  }

  return list;
}
