// FILE: src/utils/template.xml.clipboard.ts

/**
 * Clipboard XML helpers for Keyboard Maestro actions.
 *
 * This module provides utilities for generating the XML fragments
 * required to specify clipboard destinations in KM actions (e.g.,
 * SystemClipboard, TriggerClipboard, NamedClipboard).
 *
 * Used by actions like ScreenCapture, InsertText, etc.
 *
 * All functions are pure and formatting-preserving.
 */

import type {
  NamedClipboardDestination,
  ClipboardDestination,
} from "../virtual_actions/types/types.data";

/**
 * Type guard to check if a value is a NamedClipboardDestination object.
 * @param dest - The destination value to check
 * @returns True if dest is a NamedClipboardDestination
 */
export function isNamedClipboard(
  dest: unknown,
): dest is NamedClipboardDestination {
  return !!dest && typeof dest === "object" && "name" in dest;
}

/**
 * Generates the XML lines for clipboard destination options in KM actions.
 *
 * @param destination - Clipboard destination (undefined, "TriggerClipboard", or NamedClipboardDestination)
 * @returns Array of XML lines for the clipboard destination section
 *
 * - If destination is undefined, returns an empty array (SystemClipboard)
 * - If destination is "TriggerClipboard", returns the appropriate XML keys
 * - If destination is a NamedClipboardDestination, returns XML for name, UID (if present), and use flag
 */
export function generateClipboardDestinationXml(
  destination: ClipboardDestination,
): string[] {
  // All lines must be indented to match the rest of the action XML (\t\t)
  if (destination === "TriggerClipboard") {
    // Use the trigger clipboard as the destination
    return ["\t\t<key>DestinationUseTriggerClipboard</key>", "\t\t<true/>"];
  } else if (isNamedClipboard(destination)) {
    // Use a named clipboard as the destination
    return [
      "\t\t<key>DestinationNamedClipboardRedundantDisplayName</key>",
      `\t\t<string>${destination.name}</string>`,
      // Only include UID if provided
      ...(destination.uid
        ? [
            "\t\t<key>DestinationNamedClipboardUID</key>",
            `\t\t<string>${destination.uid}</string>`,
          ]
        : []),
      "\t\t<key>DestinationUseNamedClipboard</key>",
      "\t\t<true/>",
    ];
  }
  // Default: SystemClipboard (no XML keys needed)
  return [];
}
