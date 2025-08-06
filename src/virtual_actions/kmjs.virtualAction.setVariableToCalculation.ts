//FILE: src/virtual_actions/kmjs.virtualAction.setVariableToCalculation.ts

import { formatXmlAction, escapeForXml } from "../utils/utils.xml";
import {
  generateActionUIDXml,
  renderStopOnFailureXml,
  renderNotifyOnFailureXml,
} from "../utils/template.xml.generic";
import type { VirtualAction } from "./types";

/**
 * Options for the SetVariableToCalculation virtual action.
 */
export interface SetVariableToCalculationOptions {
  /** The variable to set. */
  variable: string;
  /** The calculation expression (as text). */
  text: string;
  /** Optional number format pattern (see Appendix G: Number Format Patterns). */
  format?: string;
  /** Whether to stop macro on failure (default: true). */
  stopOnFailure?: boolean;
  /** Whether to notify on failure (default: true). */
  notifyOnFailure?: boolean;
}

/**
 * Constructs a VirtualAction representing a Keyboard Maestro SetVariableToCalculation action.
 *
 * @param opts - SetVariableToCalculationOptions for variable, calculation, and formatting.
 * @returns A VirtualAction that emits the correct KM XML when toXml() is called.
 *
 * @example
 * createVirtualSetVariableToCalculation({ variable: "Result", text: "1+2" })
 * createVirtualSetVariableToCalculation({ variable: "Result", text: "1+2", format: "0.00" })
 */
export function createVirtualSetVariableToCalculation(
  opts: SetVariableToCalculationOptions,
): VirtualAction {
  const { variable, text, format, stopOnFailure, notifyOnFailure } = opts;

  const xmlLines = [
    "\t<dict>",
    ...generateActionUIDXml(),
    ...(format
      ? [
          "\t\t<key>Format</key>",
          `\t\t<string>${escapeForXml(format)}</string>`,
        ]
      : []),
    "\t\t<key>MacroActionType</key>",
    "\t\t<string>SetVariableToCalculation</string>",
    ...(notifyOnFailure === false ? renderNotifyOnFailureXml(false) : []),
    ...(stopOnFailure === false ? renderStopOnFailureXml(false) : []),
    "\t\t<key>Text</key>",
    `\t\t<string>${escapeForXml(text)}</string>`,
    "\t\t<key>UseFormat</key>",
    format ? "\t\t<true/>" : "\t\t<false/>",
    "\t\t<key>Variable</key>",
    `\t\t<string>${escapeForXml(variable)}</string>`,
    "\t</dict>",
  ];

  return { toXml: () => formatXmlAction(xmlLines.join("\n")) };
}
