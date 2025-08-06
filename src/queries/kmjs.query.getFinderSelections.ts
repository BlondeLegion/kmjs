// FILE: src/queries/kmjs.query.getFinderSelections.ts

/**
 * @file kmjs.query.getFinderSelections.ts
 * @module kmjs.query
 * @description Provides functions to query the current selection in Finder.
 */
import { runVirtualMacro } from "../kmjs.runVirtualMacro";
import { KM_TOKENS } from "../tokens";

/**
 * Queries Keyboard Maestro for the paths of all currently selected items in Finder.
 *
 * @returns An array of strings, where each string is the full path to a selected item.
 *          Returns an empty array if no items are selected.
 * @throws {Error} If the query fails.
 *
 * @example
 * const selectedFiles = getFinderSelections();
 * // -> ["/Users/USERNAME/Documents/file1.txt", "/Users/USERNAME/Documents/image.png"]
 */
export function getFinderSelections(): string[] {
  try {
    const result = runVirtualMacro(
      [],
      "query:getFinderSelections",
      KM_TOKENS.ThePathsOfTheSelectedFinderItems,
      true,
    ) as string;

    // If the result is empty, it means no files are selected.
    // Split on newline and filter out any empty strings that might result.
    return result ? result.split("\n").filter(Boolean) : [];
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to get Finder selections: ${message}`);
  }
}

// CLI entry point
if (require.main === module) {
  require("./kmjs.query.cli");
}
