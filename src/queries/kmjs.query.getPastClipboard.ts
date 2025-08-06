//FILE: src/queries/kmjs.query.getPastClipboard.ts

/**
 * @file kmjs.query.getPastClipboard.ts
 * @module kmjs.query
 * @description Provides a function to query the clipboard history.
 */
import { runVirtualMacro } from "../kmjs.runVirtualMacro";

/**
 * Queries Keyboard Maestro for a specific entry from the clipboard history.
 *
 * This function uses a dynamically constructed token, `%PastClipboard%<index>%`, to
 * retrieve an item from the clipboard history.
 *
 * Note: Index `0` is the current system clipboard. Index `1` is the previous item.
 *
 * @param index - The history index to retrieve (0-based). Must be a non-negative integer.
 * @returns The text content of the specified clipboard history entry.
 * @throws {Error} If the index is invalid or the query fails.
 *
 * @example
 * // Get the most recent clipboard item (same as getSystemClipboard())
 * const current = getPastClipboard(0);
 *
 * @example
 * // Get the item before the current one
 * const previous = getPastClipboard(1);
 */
export function getPastClipboard(index: number): string {
  // Validate that the index is a non-negative integer.
  if (!Number.isInteger(index) || index < 0) {
    throw new Error(
      `Clipboard history index must be a non-negative integer, but received: ${index}`,
    );
  }

  try {
    // The %PastClipboard% token is dynamic, so we construct it manually.
    const tokenString = `%PastClipboard%${index}%`;

    const result = runVirtualMacro(
      [],
      `query:getPastClipboard:${index}`,
      tokenString,
      true,
    ) as string;

    return result;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(
      `Failed to get past clipboard at index ${index}: ${message}`,
    );
  }
}

// CLI entry point for direct execution via kmjs.query.cli.ts
if (require.main === module) {
  require("./kmjs.query.cli");
}
