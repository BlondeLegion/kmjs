//FILE: src/virtual_actions/kmjs.virtualAction.useVariable.ts

/**
 * Supported actions for the UseVariable virtual action.
 */
export type UseVariableAction =
  | "SetMouse"
  | "SetWindowPosition"
  | "SetWindowSize"
  | "SetWindowFrame"
  | "SetWindowByName"
  | "SetWindowByNameContains"
  | "SetWindowByNameMatches"
  | "SetApplicationByName"
  | "SetApplicationByNameContains"
  | "SetApplicationByNameMatches"
  | "SetSystemVolume";

/**
 * Options for the UseVariable virtual action.
 */
export interface UseVariableOptions {
  /** The variable name to use. */
  variable: string;
  /** The action to perform with the variable. */
  action: UseVariableAction;
  /** If true, abort macro on failure (default false). */
  stopOnFailure?: boolean;
  /** If false, do not notify on failure (default true). */
  notifyOnFailure?: boolean;
}

import {
  generateActionUIDXml,
  renderStopOnFailureXml,
  renderNotifyOnFailureXml,
} from "../utils/template.xml.generic";
import { formatXmlAction } from "../utils/utils.xml";

/**
 * Creates a virtual UseVariable action for Keyboard Maestro.
 *
 * @param opts - UseVariableOptions
 * @returns VirtualAction
 *
 * The UID is auto-generated. MacroActionType is always "UseVariable".
 *
 * Example XML output:
 * <dict>
 *   <key>Action</key>
 *   <string>SetMouse</string>
 *   <key>ActionUID</key>
 *   <integer>...</integer>
 *   <key>MacroActionType</key>
 *   <string>UseVariable</string>
 *   <key>Variable</key>
 *   <string>...</string>
 *   ...
 * </dict>
 */
export function createVirtualUseVariable(
  opts: UseVariableOptions,
): import("./index").VirtualAction {
  const {
    variable,
    action,
    stopOnFailure = false,
    notifyOnFailure = true,
  } = opts;

  const xmlLines = [
    "\t<dict>",
    "\t\t<key>Action</key>",
    "\t\t<string>" + action + "</string>",
    ...generateActionUIDXml(),
    "\t\t<key>MacroActionType</key>",
    "\t\t<string>UseVariable</string>",
    ...(notifyOnFailure === false
      ? renderNotifyOnFailureXml(notifyOnFailure)
      : []),
    ...(stopOnFailure === true ? renderStopOnFailureXml(stopOnFailure) : []),
    "\t\t<key>Variable</key>",
    "\t\t<string>" + (variable || "") + "</string>",
    "\t</dict>",
  ];

  return { toXml: () => formatXmlAction(xmlLines.join("\n")) };
}
