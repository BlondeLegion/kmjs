//FILE: src/virtual_actions/kmjs.virtualAction.cancel.ts

import { formatXmlAction, escapeForXml } from "../utils/utils.xml";
import { generateActionUIDXml } from "../utils/template.xml.generic";
import type { VirtualAction } from "./types";
import type { CancelType } from "./types/types.system";

/**
 * Options for the Cancel action.
 * - variant: Which cancel operation to perform (required)
 * - instance: For 'CancelSpecificMacro', the macro name or UUID to cancel (required for that variant)
 *
 * @example
 * { variant: "CancelAllMacros" }
 * { variant: "CancelSpecificMacro", instance: "MyMacroNameOrUUID" }
 */
export interface CancelActionOptions {
  /** Which cancel operation to perform. */
  cancelType: CancelType;
  /** For 'CancelSpecificMacro', the macro name or UUID to cancel. */
  instance?: string;
}

/**
 * Constructs a VirtualAction representing a Keyboard Maestro Cancel action.
 * Supports all cancel variants, including canceling all macros, this macro, a specific macro, and loop control.
 *
 * @param opts - CancelActionOptions specifying the variant and (if needed) the macro instance to cancel.
 * @returns A VirtualAction that will emit the correct KM XML when toXml() is called.
 *
 * @example
 * createVirtualCancel({ variant: "CancelAllMacros" })
 * createVirtualCancel({ variant: "CancelSpecificMacro", instance: "MyMacroNameOrUUID" })
 */
export function createVirtualCancel(opts: CancelActionOptions): VirtualAction {
  const { cancelType, instance } = opts;

  // Validate required field for CancelSpecificMacro
  if (cancelType === "CancelSpecificMacro" && !instance) {
    throw new Error(
      "CancelSpecificMacro requires an 'instance' (macro name or UUID) to cancel.",
    );
  }

  // Use generateActionUIDXml() directly, as in other actions, with no extra string manipulation
  const xmlLines = [
    "\t<dict>",
    "\t\t<key>Action</key>",
    `\t\t<string>${cancelType}</string>`,
    ...generateActionUIDXml(),
    ...(cancelType === "CancelSpecificMacro"
      ? [
          "\t\t<key>Instance</key>",
          `\t\t<string>${escapeForXml(instance ?? "")}</string>`,
        ]
      : []),
    "\t\t<key>MacroActionType</key>",
    "\t\t<string>Cancel</string>",
    "\t</dict>",
  ];

  return { toXml: () => formatXmlAction(xmlLines.join("\n")) };
}
