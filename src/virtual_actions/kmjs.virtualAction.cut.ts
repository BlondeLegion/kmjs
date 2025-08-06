//FILE: src/virtual_actions/kmjs.virtualAction.cut.ts

import { formatXmlAction } from "../utils/utils.xml";
import {
  generateActionUIDXml,
  renderTimeoutXml,
} from "../utils/template.xml.generic";
import type { VirtualAction } from "./types";

/**
 * Options for the Cut action.
 * Both timeout-related options are optional and default to their standard KM behavior.
 */
export interface CutActionOptions {
  /** Whether to notify when a timeout occurs. Defaults to true. */
  notifyOnTimeout?: boolean;
  /** Whether timeout aborts the macro. Defaults to false. */
  timeoutAborts?: boolean;
}

/**
 * Constructs a VirtualAction representing a Keyboard Maestro Cut action.
 * Cuts the current selection to the clipboard.
 *
 * @param opts - CutActionOptions for timeout behavior configuration
 * @returns A VirtualAction that will emit the correct KM XML when toXml() is called
 *
 * @example
 * createVirtualCut()
 * createVirtualCut({ notifyOnTimeout: false, timeoutAborts: true })
 */
export function createVirtualCut(opts: CutActionOptions = {}): VirtualAction {
  const { notifyOnTimeout = true, timeoutAborts = false } = opts;

  const xmlLines = [
    "\t<dict>",
    "\t\t<key>Action</key>",
    "\t\t<string>Cut</string>",
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
