//FILE: src/virtual_actions/kmjs.virtualAction.pause.ts

import { formatXmlAction } from "../utils/utils.xml";
import { generateActionUIDXml } from "../utils/template.xml.generic";
import type { VirtualAction } from "./types";
import chalk from "chalk";

/**
 * Options for building a Pause action.
 */
export interface PauseOptions {
  /**
   * Duration to pause (in the specified unit).
   * Defaults to 0.05 if omitted.
   */
  time?: number;
  /**
   * Unit for the duration. Valid values:
   * - "Hours"
   * - "Minutes"
   * - "Hundredths"
   * Cannot be specified without `time`. Defaults to seconds (no XML key).
   */
  unit?: "Hours" | "Minutes" | "Seconds" | "Hundredths";
}

/**
 * Constructs a VirtualAction representing a Keyboard Maestro Pause action.
 * @param opts - PauseOptions to configure the duration and unit.
 * @returns A VirtualAction emitting the correct KM XML when `toXml()` is called.
 */
export function createVirtualPause(opts: PauseOptions = {}): VirtualAction {
  console.log(
    chalk.cyan(`[VirtualAction] Pause:`),
    chalk.grey(JSON.stringify(opts)),
  );
  // Determine if `time` was explicitly provided by the user
  const hasTime = Object.prototype.hasOwnProperty.call(opts, "time");
  const { time = 0.05, unit } = opts;

  if (!hasTime && unit !== undefined) {
    throw new Error("Cannot specify 'unit' without 'time'.");
  }

  const xmlLines = [
    `\t<dict>`,
    ...generateActionUIDXml(),
    `\t\t<key>MacroActionType</key>`,
    `\t\t<string>Pause</string>`,
    `\t\t<key>Time</key>`,
    `\t\t<string>${time}</string>`,
    `\t\t<key>TimeOutAbortsMacro</key>`,
    `\t\t<true/>`,
    // Only include Unit if provided and not seconds (seconds is default and has no XML key)
    unit && unit !== "Seconds" ? `\t\t<key>Unit</key>` : ``,
    unit && unit !== "Seconds" ? `\t\t<string>${unit}</string>` : ``,
    `\t</dict>`,
  ].filter(Boolean);

  return { toXml: () => formatXmlAction(xmlLines.join("\n")) };
}
