//FILE: src/queries/kmjs.query.getMousePosition.ts

/**
 * @file kmjs.query.getMousePosition.ts
 * @module kmjs.query.getMousePosition
 * @description Returns the current mouse position using a virtual macro.
 *
 * This function executes a virtual macro that returns the value of the
 * Keyboard Maestro %CurrentMouse% token, abstracting away all boilerplate.
 * Supports both string format (default Keyboard Maestro behavior) and array format.
 *
 * @example
 * import { getMousePosition } from 'kmjs';
 *
 * // Default string format
 * const pos = getMousePosition(); // "123,456"
 *
 * // Array format for more structured coordinate access
 * const [x, y] = getMousePosition(true); // [123, 456]
 */
import { runVirtualMacro } from "../kmjs.runVirtualMacro";
import { KM_TOKENS } from "../tokens/km.tokens";
import chalk from "chalk";

// CLI entry point
if (require.main === module) {
  require("./kmjs.query.cli");
}

/**
 * Returns the current mouse position using a virtual macro.
 *
 * This function executes a virtual macro that returns the value of the
 * Keyboard Maestro %CurrentMouse% token, abstracting away all boilerplate.
 *
 * @param asArray - If true, returns coordinates as [x, y] array. If false or undefined, returns as "x,y" string (default Keyboard Maestro behavior).
 * @returns The current mouse position as reported by Keyboard Maestro. String format: "123,456", Array format: [123, 456].
 * @throws {Error} If the mouse position cannot be retrieved or is invalid.
 *
 * @example
 * // Default string format
 * const position = getMousePosition(); // "123,456"
 *
 * @example
 * // Array format for easier coordinate access
 * const [x, y] = getMousePosition(true); // [123, 456]
 */
export function getMousePosition(): string;
export function getMousePosition(asArray: true): [number, number];
export function getMousePosition(asArray: false): string;
export function getMousePosition(asArray?: boolean): string | [number, number] {
  try {
    console.log(
      chalk.gray("[getMousePosition] Querying current mouse position..."),
    );

    // The %CurrentMouse% token returns the current mouse position as "x,y"
    // We use runVirtualMacro with captureReturnValue=true to get the result
    const result = runVirtualMacro(
      [],
      "getMousePosition",
      KM_TOKENS.CurrentMouseLocation,
      true,
    );

    if (!result || typeof result !== "string") {
      throw new Error("No result returned from Keyboard Maestro");
    }

    // Validate the format is "x,y" and both are valid numbers
    const trimmedResult = result.trim();
    if (!trimmedResult) {
      throw new Error("Empty result returned from Keyboard Maestro");
    }

    const parts = trimmedResult.split(",");
    if (parts.length !== 2) {
      throw new Error(
        `Invalid mouse position format: expected "x,y", got "${trimmedResult}"`,
      );
    }

    const [xStr, yStr] = parts;
    const x = parseInt(xStr.trim(), 10);
    const y = parseInt(yStr.trim(), 10);

    if (isNaN(x)) {
      throw new Error(
        `Invalid X coordinate: "${xStr.trim()}" is not a valid number`,
      );
    }

    if (isNaN(y)) {
      throw new Error(
        `Invalid Y coordinate: "${yStr.trim()}" is not a valid number`,
      );
    }

    console.log(
      chalk.green(
        `[getMousePosition] Successfully retrieved position: ${trimmedResult} (X: ${x}, Y: ${y})`,
      ),
    );

    // Return as array if requested, otherwise return as string (default KM behavior)
    return asArray ? [x, y] : trimmedResult;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(chalk.red("[getMousePosition] Error:"), errorMessage);
    throw new Error(`Failed to get mouse position: ${errorMessage}`);
  }
}
