//FILE: src/queries/kmjs.query.getScreenFrames.ts

/**
 * @file kmjs.query.getScreenFrames.ts
 * @module kmjs.query
 * @description Provides a function to query the frames of all connected screens.
 */
import { runVirtualMacro } from "../kmjs.runVirtualMacro";
import { KM_TOKENS } from "../tokens/km.tokens";

/**
 * Interface representing the frame (position and size) of a screen or window.
 * Coordinates are relative to the top-left corner of the main screen.
 */
export interface ScreenFrame {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Queries Keyboard Maestro for the frames of all connected screens.
 *
 * The `%AllScreenFrames%` token returns a multi-line string, with each line
 * containing the comma-separated frame of a screen (`x,y,width,height`).
 *
 * @returns An array of ScreenFrame objects, one for each connected display.
 * @throws {Error} If screen frames cannot be retrieved or parsed.
 *
 * @example
 * const screens = getScreenFrames();
 * // -> [{ x: 0, y: 0, width: 1920, height: 1080 }, { x: 1920, y: 0, width: 1440, height: 900 }]
 */
export function getScreenFrames(): ScreenFrame[] {
  try {
    // Execute a virtual macro to return the value of the AllScreenFrames token.
    const result = runVirtualMacro(
      [],
      "query:getScreenFrames",
      KM_TOKENS.AllScreenFrames,
      true, // Capture the return value
    ) as string;

    // If the result is empty, return an empty array.
    if (!result) {
      return [];
    }

    // Split the multi-line string into individual lines and parse each one.
    return result
      .split("\n")
      .filter(Boolean) // Remove any empty lines
      .map((line, index) => {
        const parts = line.split(",").map(Number);
        if (parts.length !== 4 || parts.some(isNaN)) {
          throw new Error(
            `Invalid screen frame format on line ${index + 1}: "${line}"`,
          );
        }
        const [x, y, width, height] = parts;
        return { x, y, width, height };
      });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to get screen frames: ${message}`);
  }
}

// CLI entry point for direct execution via kmjs.query.cli.ts
if (require.main === module) {
  require("./kmjs.query.cli");
}
