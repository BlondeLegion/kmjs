//FILE: src/virtual_actions/kmjs.virtualAction.copy.ts

import { formatXmlAction } from "../utils/utils.xml";
import {
  generateActionUIDXml,
  renderTimeoutXml,
} from "../utils/template.xml.generic";
import type { VirtualAction } from "./types";

/**
 * Options for the Copy action.
 * Both timeout-related options are optional and default to their standard KM behavior.
 */
export interface CopyActionOptions {
  /** Whether to notify when a timeout occurs. Defaults to true. */
  notifyOnTimeout?: boolean;
  /** Whether timeout aborts the macro. Defaults to true. */
  timeoutAborts?: boolean;
}

/**
 * Constructs a VirtualAction representing a Keyboard Maestro Copy action.
 * Copies the current selection to the clipboard.
 *
 * @param opts - CopyActionOptions for timeout behavior configuration
 * @returns A VirtualAction that will emit the correct KM XML when toXml() is called
 *
 * @example
 * createVirtualCopy()
 * createVirtualCopy({ notifyOnTimeout: false, timeoutAborts: true })
 */
export function createVirtualCopy(opts: CopyActionOptions = {}): VirtualAction {
  const { notifyOnTimeout = true, timeoutAborts = true } = opts;

  const xmlLines = [
    "\t<dict>",
    "\t\t<key>Action</key>",
    "\t\t<string>Copy</string>",
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
