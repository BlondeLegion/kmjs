//FILE: src/queries/kmjs.query.getSystemVersion.ts

/**
 * @file kmjs.query.getSystemVersion.ts
 * @module kmjs.query
 * @description Provides a function to query the current macOS version.
 */
import { runVirtualMacro } from "../kmjs.runVirtualMacro";
import { KM_TOKENS } from "../tokens/km.tokens";

/**
 * Interface for structured macOS version information.
 */
export interface SystemVersionInfo {
  short: string;
  long: string;
}

/**
 * Queries Keyboard Maestro for the current version of macOS.
 *
 * Retrieves both the short version (e.g., "14.1.1") and the long version,
 * which may include the build number.
 *
 * @returns An object containing the short and long version strings.
 * @throws {Error} If the version information cannot be retrieved.
 *
 * @example
 * const version = getSystemVersion();
 * // -> { short: "14.1.1", long: "Version 14.1.1 (Build 23B81)" }
 */
export function getSystemVersion(): SystemVersionInfo {
  try {
    const delimiter = "::KMJS_DELIMITER::";
    const tokenString = [
      KM_TOKENS.SystemVersion,
      KM_TOKENS.SystemLongVersion,
    ].join(delimiter);

    const result = runVirtualMacro(
      [],
      "query:getSystemVersion",
      tokenString,
      true,
    ) as string;

    const [short, long] = result.split(delimiter);

    if (!short || !long) {
      throw new Error(
        `Incomplete system version returned from KM: "${result}"`,
      );
    }

    return { short, long };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to get system version: ${message}`);
  }
}

// CLI entry point for direct execution via kmjs.query.cli.ts
if (require.main === module) {
  require("./kmjs.query.cli");
}
