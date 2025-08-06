//FILE: src/virtual_actions/kmjs.virtualAction.return.ts

import { escapeForXml, formatXmlAction } from "../utils/utils.xml";
import { generateActionUIDXml } from "../utils/template.xml.generic";
import {
  resolveTokenPreset,
  type TokenPresetMode,
} from "../utils/template.xml.token";
import type { VirtualAction } from "./types";
// import chalk from "chalk";

/**
 * Options for the Return action.
 * @property text - The string to return from the macro (required by KM, can be empty string).
 */
export interface ReturnActionOptions {
  /** The string to return from the macro. */
  text: string;

  /**
   * Token preset for convenience. Any token key from KM_TOKENS for IntelliSense-supported token insertion.
   * When provided, overrides the text parameter.
   */
  tokenPreset?: TokenPresetMode;
}

/**
 * Constructs a VirtualAction representing a Keyboard Maestro Return action.
 * @param opts - ReturnActionOptions with the string to return from the macro.
 * @returns A VirtualAction that will emit the correct KM XML when toXml() is called.
 *
 * @example
 * // Basic usage
 * createVirtualReturn({ text: "ExampleString" })
 *
 * @example
 * // Token presets
 * createVirtualReturn({ text: "", tokenPreset: "ARandomUniqueID" })
 * createVirtualReturn({ text: "", tokenPreset: "FrontApplicationName" })
 */
export function createVirtualReturn(opts: ReturnActionOptions): VirtualAction {
  const { text, tokenPreset } = opts;

  // Resolve token preset
  const finalText = resolveTokenPreset(text, tokenPreset);

  // console.log(
  //   chalk.cyan(`[VirtualAction] Return:`),
  //   chalk.grey(JSON.stringify(opts)),
  // );

  const xmlLines = [
    "\t<dict>",
    ...generateActionUIDXml(),
    "\t\t<key>MacroActionType</key>",
    "\t\t<string>Return</string>",
    "\t\t<key>Text</key>",
    `\t\t<string>${escapeForXml(finalText ?? "")}</string>`,
    "\t</dict>",
  ];

  return { toXml: () => formatXmlAction(xmlLines.join("\n")) };
}
