//FILE: src/virtual_actions/kmjs.virtualAction.paste.ts

import { formatXmlAction } from "../utils/utils.xml";
import {
  generateActionUIDXml,
  renderTimeoutXml,
} from "../utils/template.xml.generic";
import type { VirtualAction } from "./types";

/**
 * Options for the Paste action.
 * Both timeout-related options are optional and default to their standard KM behavior.
 */
export interface PasteActionOptions {
  /** Whether to notify when a timeout occurs. Defaults to true. */
  notifyOnTimeout?: boolean;
  /** Whether timeout aborts the macro. Defaults to false. */
  timeoutAborts?: boolean;
}

/**
 * Constructs a VirtualAction representing a Keyboard Maestro Paste action.
 * Pastes the current clipboard contents.
 *
 * @param opts - PasteActionOptions for timeout behavior configuration
 * @returns A VirtualAction that will emit the correct KM XML when toXml() is called
 *
 * @example
 * createVirtualPaste()
 * createVirtualPaste({ notifyOnTimeout: true, timeoutAborts: false })
 */
export function createVirtualPaste(
  opts: PasteActionOptions = {},
): VirtualAction {
  const { notifyOnTimeout = true, timeoutAborts = false } = opts;

  const xmlLines = [
    "\t<dict>",
    "\t\t<key>Action</key>",
    "\t\t<string>Paste</string>",
    ...generateActionUIDXml(),
    "\t\t<key>IsDisclosed</key>",
    "\t\t<false/>",
    "\t\t<key>MacroActionType</key>",
    "\t\t<string>CutCopyPaste</string>",
    ...renderTimeoutXml({ notifyOnTimeout, timeoutAborts }),
    "\t</dict>",
  ];

  return { toXml: () => formatXmlAction(xmlLines.join("\n")) };
}
