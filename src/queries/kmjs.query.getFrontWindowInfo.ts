//FILE: src/queries/kmjs.query.getFrontWindowInfo.ts

/**
 * @file kmjs.query.getFrontWindowInfo.ts
 * @module kmjs.query
 * @description Provides a function to query information about the frontmost window.
 */
import { runVirtualMacro } from "../kmjs.runVirtualMacro";
import { KM_TOKENS } from "../tokens";

/**
 * Represents the frame of a window.
 */
export interface WindowFrame {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Represents information about the frontmost window.
 */
export interface FrontWindowInfo {
  name: string;
  frame: WindowFrame;
}

/**
 * Queries Keyboard Maestro for details about the frontmost window of the active application.
 *
 * @returns An object containing the window's name and its frame (x, y, width, height).
 * @throws {Error} If the window info cannot be retrieved or is in an invalid format.
 *
 * @example
 * const windowInfo = getFrontWindowInfo();
 * // -> { name: "my-file.txt - VSCode", frame: { x: 100, y: 50, width: 1280, height: 800 } }
 */
export function getFrontWindowInfo(): FrontWindowInfo {
  try {
    const delimiter = "::KMJS_DELIMITER::";
    const tokenString = [
      KM_TOKENS.FrontWindowName,
      KM_TOKENS.FrontWindowFrame,
    ].join(delimiter);

    const result = runVirtualMacro(
      [],
      "query:getFrontWindowInfo",
      tokenString,
      true,
    ) as string;

    const [name, frameString] = result.split(delimiter);
    const frameParts = frameString.split(",").map(Number);

    if (!name || frameParts.length !== 4 || frameParts.some(isNaN)) {
      throw new Error(`Invalid window info returned from KM: "${result}"`);
    }

    const [x, y, width, height] = frameParts;
    return { name, frame: { x, y, width, height } };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to get front window info: ${message}`);
  }
}

// CLI entry point
if (require.main === module) {
  require("./kmjs.query.cli");
}
