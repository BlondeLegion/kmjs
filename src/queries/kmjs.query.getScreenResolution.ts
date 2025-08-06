//FILE: src/queries/kmjs.query.getScreenResolution.ts

/**
 * @file kmjs.query.getScreenResolution.ts
 * @module kmjs.query
 * @description Returns the resolution of a specified screen.
 *
 * This module provides a function to query the resolution of a specific screen or all screens
 * via Keyboard Maestro tokens. It parses the result into a strongly-typed object or array of objects.
 *
 * The function is robust to token errors and will throw if the result is not in the expected format.
 *
 * Inline documentation is provided to assist new contributors and LLM agents in understanding the
 * control flow and the purpose of each variable and function.
 */
import { runVirtualMacro } from "../kmjs.runVirtualMacro";
import { KM_TOKENS } from "../tokens/km.tokens";

/**
 * Represents a single screen resolution record as returned by Keyboard Maestro.
 *
 * @property nominalWidth - The logical (scaled) width of the screen in points.
 * @property nominalHeight - The logical (scaled) height of the screen in points.
 * @property pixelWidth - The physical pixel width of the screen.
 * @property pixelHeight - The physical pixel height of the screen.
 * @property refreshRate - The refresh rate of the screen in Hz.
 */
export interface ScreenResolutionRecord {
  /** Nominal (scaled) width in points. */
  nominalWidth: number;
  /** Nominal (scaled) height in points. */
  nominalHeight: number;
  /** Physical pixel width. */
  pixelWidth: number;
  /** Physical pixel height. */
  pixelHeight: number;
  /** Refresh rate in Hz. */
  refreshRate: number;
}

/**
 * Queries Keyboard Maestro for the resolution of a given screen or all screens.
 *
 * @param screenSpecifier - The screen to query. Accepts "Main", "Second", a numeric index, "Mouse", or "All".
 *   Defaults to "Main". If "All" is provided, returns an array of records for all screens.
 * @returns A single {@link ScreenResolutionRecord} for a specific screen, or an array of records for all screens.
 * @throws {Error} If the result cannot be parsed into the expected format.
 *
 * @example
 * // Get resolution for the main display
 * const main = getScreenResolution();
 * // → { nominalWidth: 1512, nominalHeight: 982, pixelWidth: 2880, pixelHeight: 1800, refreshRate: 60 }
 *
 * @example
 * // Get resolutions for all displays
 * const all = getScreenResolution("All");
 * // → [ { ... }, { ... } ]
 */
export function getScreenResolution(
  screenSpecifier: string = "Main",
): ScreenResolutionRecord | ScreenResolutionRecord[] {
  // Construct the Keyboard Maestro token for the requested screen.
  // Example: "%ScreenResolution%Main%" or "%ScreenResolution%All%"
  const token = `%ScreenResolution%${screenSpecifier}%`;

  // Execute the virtual macro to retrieve the raw result string.
  // The result is expected to be a comma-separated string for a single screen,
  // or a newline-separated list of comma-separated strings for all screens.
  const raw = runVirtualMacro(
    [],
    "query:getScreenResolution",
    token,
    true,
  ) as string;

  /**
   * Parses a single line of screen resolution data into a ScreenResolutionRecord.
   *
   * @param line - A comma-separated string representing one screen's resolution.
   * @returns A ScreenResolutionRecord object.
   * @throws {Error} If the line does not contain exactly 5 numeric values.
   */
  const parse = (line: string): ScreenResolutionRecord => {
    // Split the line into its numeric components.
    const parts = line.split(",").map(Number);
    // Validate the format: must have 5 numbers, all valid.
    if (parts.length !== 5 || parts.some(isNaN)) {
      throw new Error(`Invalid ScreenResolution format: “${line}”`);
    }
    // Destructure the values for clarity.
    const [nominalWidth, nominalHeight, pixelWidth, pixelHeight, refreshRate] =
      parts;
    return {
      nominalWidth,
      nominalHeight,
      pixelWidth,
      pixelHeight,
      refreshRate,
    };
  };

  // If querying all screens, split the result by newlines and parse each line.
  if (screenSpecifier.toLowerCase() === "all") {
    // Each line represents one screen's resolution.
    return raw
      .split(/\n|\r|\r\n/)
      .filter(Boolean)
      .map(parse);
  }
  // Otherwise, parse the single result line.
  return parse(raw);
}

// CLI entry point for direct execution
if (require.main === module) {
  require("./kmjs.query.cli");
}
