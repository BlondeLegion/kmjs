//FILE: tests/integration/fixtures/setClipboardToText.permutations.ts

import { createVirtualSetClipboardToText } from "../../../src/virtual_actions/kmjs.virtualAction.setClipboardToText";
import type { SetClipboardToTextOptions } from "../../../src/virtual_actions/kmjs.virtualAction.setClipboardToText";
import type {
  ProcessingMode,
  ClipboardDestination,
} from "../../../src/virtual_actions/types";

/**
 * Generates comprehensive test permutations for SetClipboardToText action.
 * Covers all combinations of text content, processing modes, styled text options,
 * clipboard destinations, and failure handling options.
 */
export function generateSetClipboardToTextPermutations() {
  const baseTexts = [
    "",
    "Simple text",
    "Text with %Variable%MyVar%",
    "%Delete%",
    "Multi\nline\ntext",
  ];

  const processingModes: (ProcessingMode | undefined)[] = [
    undefined,
    "TextTokensOnly",
    "Nothing",
  ];

  const styledTextOptions = [
    { includeStyledText: false },
    { includeStyledText: true },
    { includeStyledText: true, rtfContent: "{\\rtf1\\ansi\\deff0 Custom RTF}" },
  ];

  const destinations: (ClipboardDestination | undefined)[] = [
    undefined, // System clipboard
    "TriggerClipboard",
    {
      name: "ExampleClipboardName",
      uid: "9B0A7A8B-A7B1-480C-839A-7A9DE8954B37",
    },
  ];

  const failureOptions = [
    {},
    { stopOnFailure: false },
    { notifyOnFailure: false },
    { stopOnFailure: false, notifyOnFailure: false },
    { stopOnFailure: true },
    { notifyOnFailure: true },
  ];

  const permutations: Array<{
    name: string;
    action: ReturnType<typeof createVirtualSetClipboardToText>;
    params: any;
  }> = [];
  let i = 0;

  // Generate basic permutations for all combinations
  for (const text of baseTexts) {
    for (const processingMode of processingModes) {
      for (const styledOption of styledTextOptions) {
        for (const destination of destinations) {
          for (const failureOption of failureOptions) {
            const opts: SetClipboardToTextOptions = {
              text,
              processingMode,
              ...styledOption,
              destination,
              ...failureOption,
            };

            permutations.push({
              name: `SetClipboardToText – Permutation ${i++}`,
              action: createVirtualSetClipboardToText(opts),
              params: opts,
            });
          }
        }
      }
    }
  }

  // Add some edge cases
  const edgeCases: SetClipboardToTextOptions[] = [
    // Minimal options (defaults)
    { text: "Default behavior" },

    // Long text
    { text: "A".repeat(1000) },

    // Text with RTF-like content (should be escaped)
    { text: "{\\rtf1 This looks like RTF but isn't}" },

    // Complex styled text with custom RTF
    {
      text: "Complex styled text",
      includeStyledText: true,
      rtfContent:
        "{\\rtf1\\ansi\\ansicpg1252\\cocoartf2822\\cocoatextscaling0\\cocoaplatform0{\\fonttbl\\f0\\fswiss\\fcharset0 Helvetica;}{\\colortbl;\\red255\\green255\\blue255;\\red0\\green0\\blue0;}\\pard\\tx560\\tx1120\\tx1680\\tx2240\\tx2800\\tx3360\\tx3920\\tx4480\\tx5040\\tx5600\\tx6160\\tx6720\\pardirnatural\\partightenfactor0\\f0\\fs26 \\cf2 Complex styled text}",
    },
  ];

  for (const opts of edgeCases) {
    permutations.push({
      name: `SetClipboardToText – Permutation ${i++}`,
      action: createVirtualSetClipboardToText(opts),
      params: opts,
    });
  }

  return permutations;
}
