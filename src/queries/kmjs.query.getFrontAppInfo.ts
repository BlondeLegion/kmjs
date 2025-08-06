//FILE: src/queries/kmjs.query.getFrontAppInfo.ts

/**
 * @file kmjs.query.getFrontAppInfo.ts
 * @module kmjs.query
 * @description Provides a function to query information about the frontmost application.
 */
import { runVirtualMacro } from "../kmjs.runVirtualMacro";
import { KM_TOKENS } from "../tokens";

/**
 * Interface describing the frontmost application.
 */
export interface FrontAppInfo {
  name: string;
  bundleId: string;
  path: string;
}

/**
 * Queries Keyboard Maestro for details about the frontmost application.
 *
 * This function retrieves the name, bundle identifier, and file path of the
 * application that is currently active.
 *
 * @returns An object containing the name, bundleId, and path of the front app.
 * @throws {Error} If the application info cannot be retrieved.
 *
 * @example
 * const appInfo = getFrontAppInfo();
 * // -> { name: "Finder", bundleId: "com.apple.finder", path: "/System/Library/CoreServices/Finder.app" }
 */
export function getFrontAppInfo(): FrontAppInfo {
  try {
    // We can retrieve multiple tokens at once by separating them with a unique delimiter.
    const delimiter = "::KMJS_DELIMITER::";
    const tokenString = [
      KM_TOKENS.FrontApplicationName,
      KM_TOKENS.FrontApplicationBundleID,
      KM_TOKENS.FrontApplicationPath,
    ].join(delimiter);

    const result = runVirtualMacro(
      [],
      "query:getFrontAppInfo",
      tokenString,
      true,
    ) as string;

    const [name, bundleId, path] = result.split(delimiter);

    if (!name || !bundleId || !path) {
      throw new Error(`Incomplete app info returned from KM: "${result}"`);
    }

    return { name, bundleId, path };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to get front app info: ${message}`);
  }
}

// CLI entry point
if (require.main === module) {
  require("./kmjs.query.cli");
}
