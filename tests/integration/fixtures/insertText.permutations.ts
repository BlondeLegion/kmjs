//FILE: tests/integration/fixtures/insertText.permutations.ts

import { createVirtualInsertText } from "../../../src/virtual_actions/kmjs.virtualAction.insertText";
import type { InsertTextOptions } from "../../../src/virtual_actions/kmjs.virtualAction.insertText";

/**
 * Generate permutations for Insert Text action testing.
 * Tests various combinations of action modes, processing modes, and styled text options.
 */
export function generateInsertTextPermutations() {
  const baseTexts = [
    "Simple text",
    "Text with %Variable%MyVar%",
    "Multi\nline\ntext",
    "Text with special chars: <>&\"'",
    "",
  ];

  const actions = [
    "ByTyping",
    "ByPasting",
    "ByPastingStyles",
    "DisplayWindow",
    "DisplayBriefly",
    "DisplayLarge",
  ] as const;

  const processingModes = [undefined, "TextTokensOnly", "Nothing"] as const;

  const styledTextOptions = [
    { includeStyledText: false },
    { includeStyledText: true },
    {
      includeStyledText: true,
      rtfContent: "{\\rtf1\\ansi\\deff0\\f0\\fs24 Custom RTF content}",
    },
  ];

  const permutations: Array<{
    name: string;
    action: ReturnType<typeof createVirtualInsertText>;
    params: any;
  }> = [];
  let i = 0;

  // Generate basic permutations for all action/processing combinations
  for (const text of baseTexts) {
    for (const action of actions) {
      for (const processingMode of processingModes) {
        // Basic permutation
        const opts: InsertTextOptions = {
          text,
          action,
          processingMode,
        };

        permutations.push({
          name: `InsertText – Permutation ${i++}`,
          action: createVirtualInsertText(opts),
          params: opts,
        });

        // Add styled text permutations for supported actions
        if (action === "ByPastingStyles" || action === "DisplayWindow") {
          for (const styledOption of styledTextOptions) {
            if (styledOption.includeStyledText) {
              const styledOpts: InsertTextOptions = {
                text,
                action,
                processingMode,
                ...styledOption,
              };

              permutations.push({
                name: `InsertText – Permutation ${i++}`,
                action: createVirtualInsertText(styledOpts),
                params: styledOpts,
              });
            }
          }
        }
      }
    }
  }

  // Add some edge cases
  const edgeCases: InsertTextOptions[] = [
    // Minimal options (defaults)
    { text: "Default behavior" },

    // ByTyping with different targeting
    {
      text: "Typed text",
      action: "ByTyping",
      targetingType: "Front",
    },

    // Long text
    {
      text: "A".repeat(1000),
      action: "DisplayWindow",
    },

    // Text with RTF-like content (should be escaped)
    {
      text: "{\\rtf1 This looks like RTF but isn't}",
      action: "ByPasting",
    },
  ];

  for (const opts of edgeCases) {
    permutations.push({
      name: `InsertText – Permutation ${i++}`,
      action: createVirtualInsertText(opts),
      params: opts,
    });
  }

  return permutations;
}
