//FILE: src/virtual_actions/kmjs.virtualAction.setVariable.ts

import { escapeForXml, formatXmlAction } from "../utils/utils.xml";
import { generateActionUIDXml } from "../utils/template.xml.generic";
import {
  renderSetVariableProcessingModeXml,
  renderSetVariableWhereXml,
} from "../utils/template.xml.variable";
import type { SetVariablePresetMode } from "../utils/template.xml.variable";
import { KM_TOKENS } from "../tokens";
import type { VirtualAction } from "./types";
import type {
  SetVariableWhere,
  ProcessingMode,
  SetVariableScope,
} from "./types/types.data";

/**
 * Options for Set Variable action.
 */
export interface SetVariableOptions {
  /** Name of the variable to set. */
  variable: string;
  /** Value to set the variable to. */
  text?: string;
  /** Processing mode for the text. */
  processingMode?: ProcessingMode;
  /** Where to set/append/prepend. */
  where?: SetVariableWhere;
  /**
   * Preset mode for convenience. Can be KM GUI suggested presets ("delete", "positionCursor")
   * or any token key from KM_TOKENS for IntelliSense-supported token insertion.
   */
  presetMode?: SetVariablePresetMode;
  /**
   * Optional variable scope.
   * - "global" (default): No prefix
   * - "local": Prepends "LOCAL" to variable name
   * - "instance": Prepends "INSTANCE" to variable name
   * Note: This is not a setting in KM, but a convenience feature
   * as part of KMJS that will automatically handle prepending a
   * "LOCAL" or "INSTANCE" prefix to the variable name.
   */
  scope?: SetVariableScope;
}

/**
 * Constructs a VirtualAction representing a Keyboard Maestro Set Variable action.
 * @param opts - SetVariableOptions for variable name, value, processing, where, preset, and scope.
 * @returns A VirtualAction that will emit the correct KM XML when toXml() is called.
 *
 * @example
 * // Basic usage
 * createVirtualSetVariable({ variable: "MyVar", text: "Hello" })
 * createVirtualSetVariable({ variable: "MyVar", text: "Hello", scope: "local" })
 *
 * @example
 * // KM GUI suggested presets
 * createVirtualSetVariable({ variable: "MyVar", presetMode: "delete" })
 * createVirtualSetVariable({ variable: "MyVar", presetMode: "positionCursor" })
 *
 * @example
 * // Token presets
 * createVirtualSetVariable({ variable: "UUID", presetMode: "ARandomUniqueID" })
 * createVirtualSetVariable({ variable: "AppName", presetMode: "FrontApplicationName" })
 * createVirtualSetVariable({ variable: "MousePos", presetMode: "CurrentMouseLocation" })
 */
export function createVirtualSetVariable(
  opts: SetVariableOptions,
): VirtualAction {
  const {
    variable,
    text = "",
    processingMode,
    where,
    presetMode,
    scope = "global",
  } = opts;

  // Handle preset modes
  let finalText = text;
  if (presetMode === "delete") {
    finalText = "%Delete%";
  } else if (presetMode === "positionCursor") {
    finalText = "%|%";
  } else if (presetMode && presetMode in KM_TOKENS) {
    // Use token from KM_TOKENS
    finalText = KM_TOKENS[presetMode as keyof typeof KM_TOKENS];
  }

  // Apply variable scope prefix if needed
  let scopedVariable = variable;
  if (scope === "local") scopedVariable = `LOCAL${variable}`;
  else if (scope === "instance") scopedVariable = `INSTANCE${variable}`;

  const xmlLines = [
    "\t<dict>",
    ...generateActionUIDXml(),
    "\t\t<key>MacroActionType</key>",
    "\t\t<string>SetVariableToText</string>",
    ...renderSetVariableProcessingModeXml(processingMode),
    "\t\t<key>Text</key>",
    `\t\t<string>${escapeForXml(finalText)}</string>`,
    "\t\t<key>Variable</key>",
    `\t\t<string>${escapeForXml(scopedVariable)}</string>`,
    ...renderSetVariableWhereXml(where),
    "\t</dict>",
  ];

  return { toXml: () => formatXmlAction(xmlLines.join("\n")) };
}
