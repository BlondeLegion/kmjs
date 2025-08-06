//FILE: src/queries/kmjs.query.getRunningApps.ts

/**
 * @file kmjs.query.getRunningApps.ts
 * @module kmjs.query
 * @description Provides a function to get a list of all running applications.
 */
import { runVirtualMacro } from "../kmjs.runVirtualMacro";
import { KM_TOKENS } from "../tokens/km.tokens";

/**
 * Queries Keyboard Maestro for a list of all running applications.
 *
 * This includes both foreground applications (with a UI) and background
 * applications (agents, daemons).
 *
 * @returns An array of strings, where each string is the name of a running application.
 * @throws {Error} If the list of applications cannot be retrieved.
 *
 * @example
 * const apps = getRunningApps();
 * // -> ["Finder", "Safari", "SystemUIServer", "Dropbox", ...]
 */
export function getRunningApps(): string[] {
  try {
    // The token returns a multi-line string of application names.
    const result = runVirtualMacro(
      [],
      "query:getRunningApps",
      KM_TOKENS.AllRunningApplicationNames,
      true, // Capture the return value
    ) as string;

    // If the result is empty, return an empty array.
    if (!result) {
      return [];
    }

    // Split the multi-line string into an array of names.
    return result.split("\n").filter(Boolean);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to get running applications: ${message}`);
  }
}

// CLI entry point for direct execution via kmjs.query.cli.ts
if (require.main === module) {
  require("./kmjs.query.cli");
}
