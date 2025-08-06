//FILE: src/queries/kmjs.query.getSystemVolume.ts

/**
 * @file kmjs.query.getSystemVolume.ts
 * @module kmjs.query
 * @description Provides a function to query the current system audio volume.
 */
import { runVirtualMacro } from "../kmjs.runVirtualMacro";
import { KM_TOKENS } from "../tokens/km.tokens";

/**
 * Queries Keyboard Maestro for the current system volume level.
 *
 * The `%SystemVolume%` token returns the volume as a number from 0 to 100.
 *
 * @returns The current system volume as a number (0-100).
 * @throws {Error} If the volume level cannot be retrieved or parsed.
 *
 * @example
 * const volume = getSystemVolume();
 * // -> 75
 */
export function getSystemVolume(): number {
  try {
    // Execute a virtual macro to return the value of the SystemVolume token.
    const result = runVirtualMacro(
      [],
      "query:getSystemVolume",
      KM_TOKENS.SystemVolume,
      true, // Capture the return value
    ) as string;

    // Parse the result string into an integer.
    const volume = parseInt(result, 10);

    // Validate that the result is a valid number.
    if (isNaN(volume)) {
      throw new Error(`Invalid volume level returned: "${result}"`);
    }

    return volume;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to get system volume: ${message}`);
  }
}

// CLI entry point for direct execution via kmjs.query.cli.ts
if (require.main === module) {
  require("./kmjs.query.cli");
}
