//FILE: src/queries/kmjs.query.getUserInfo.ts

/**
 * @file kmjs.query.getUserInfo.ts
 * @module kmjs.query
 * @description Provides a function to query details about the current macOS user.
 */
import { runVirtualMacro } from "../kmjs.runVirtualMacro";
import { KM_TOKENS } from "../tokens/km.tokens";

/**
 * Interface for structured user information.
 */
export interface UserInfo {
  name: string;
  loginId: string;
  home: string;
}

/**
 * Queries Keyboard Maestro for details about the current macOS user.
 *
 * Retrieves the user's full name, short login ID, and home directory path.
 *
 * @returns An object containing the user's name, loginId, and home directory.
 * @throws {Error} If the user information cannot be retrieved.
 *
 * @example
 * const user = getUserInfo();
 * // -> { name: "John Smith", loginId: "johnsmith", home: "/Users/johnsmith" }
 */
export function getUserInfo(): UserInfo {
  try {
    const delimiter = "::KMJS_DELIMITER::";
    const tokenString = [
      KM_TOKENS.UserName,
      KM_TOKENS.UserLoginID,
      KM_TOKENS.UserHomeDirectory,
    ].join(delimiter);

    const result = runVirtualMacro(
      [],
      "query:getUserInfo",
      tokenString,
      true,
    ) as string;

    const [name, loginId, home] = result.split(delimiter);

    if (!name || !loginId || !home) {
      throw new Error(`Incomplete user info returned from KM: "${result}"`);
    }

    return { name, loginId, home };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to get user info: ${message}`);
  }
}

// CLI entry point for direct execution via kmjs.query.cli.ts
if (require.main === module) {
  require("./kmjs.query.cli");
}
