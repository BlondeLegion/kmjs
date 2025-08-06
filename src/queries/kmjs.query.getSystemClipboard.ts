//FILE: src/queries/kmjs.query.getSystemClipboard.ts

/**
 * @file kmjs.query.getSystemClipboard.ts
 * @module kmjs.query
 * @description Provides a function to query the system clipboard content.
 */
import { runVirtualMacro } from "../kmjs.runVirtualMacro";
import { KM_TOKENS } from "../tokens";

/**
 * Queries Keyboard Maestro for the current text content of the system clipboard.
 * Note: This retrieves plain text only. For other data types, see `getSystemClipboardFlavors`.
 *
 * @returns The text content of the system clipboard.
 * @throws {Error} If the query fails.
 *
 * @example
 * const clipboardText = getSystemClipboard();
 * // -> "This is the text that was on my clipboard."
 */
export function getSystemClipboard(): string {
  try {
    const result = runVirtualMacro(
      [],
      "query:getSystemClipboard",
      KM_TOKENS.SystemClipboard,
      true,
    ) as string;

    return result;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to get system clipboard: ${message}`);
  }
}

// CLI entry point
if (require.main === module) {
  require("./kmjs.query.cli");
}
